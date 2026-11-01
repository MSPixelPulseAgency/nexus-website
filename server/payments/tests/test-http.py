"""Exercise the real PHP endpoints, SQLite and cookies; no external Stripe calls."""
import http.cookiejar
import json
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
import urllib.parse

ROOT = Path(__file__).resolve().parents[3]
APP = ROOT / 'server/payments'
checks = 0


def check(condition, message):
    global checks
    checks += 1
    if not condition:
        raise AssertionError(message)


with tempfile.TemporaryDirectory(prefix='nexus-payment-http-') as temp:
    private = Path(temp)
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', 0))
        port = probe.getsockname()[1]
    base = f'http://127.0.0.1:{port}'
    config = {
        'enabled': True, 'mode': 'test', 'live_approved': False, 'pricing_approved': False,
        'base_url': base, 'allow_local_http': True, 'expected_account_id': 'acct_fixture',
        'secret_key': 'sk_test_httpfixture', 'webhook_secret': 'whsec_http_fixture',
        'state_dir': str(private / 'state'),
        'prices': {'MHF4U': {'amount': 49900, 'label': 'Advanced Functions'}},
    }
    config_file = private / 'config.php'
    def write_config():
        config_file.write_text('<?php return json_decode(' + repr(json.dumps(config)) + ', true);\n')
        config_file.chmod(0o600)
    write_config()
    fixture = private / 'issue.php'
    fixture.write_text('''<?php
require $argv[1] . '/vendor/autoload.php';
require $argv[1] . '/src/Payments.php';
$config = require $argv[2];
$payments = new Nexus\\Payments\\Payments($config, new Nexus\\Payments\\StripeGateway($config['secret_key']));
echo json_encode($payments->issue('HTTP-TEST', ['MHF4U'], time()));
''')
    issue = json.loads(subprocess.check_output(['php', str(fixture), str(APP), str(config_file)]))
    token = issue['link'].split('#token=')[1]
    jar = http.cookiejar.CookieJar()
    client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    environment = {**os.environ, 'NEXUS_PAYMENT_APP_DIR': str(APP), 'NEXUS_PAYMENT_CONFIG_FILE': str(config_file)}
    with (private / 'server.log').open('wb') as log:
        process = subprocess.Popen(['php', '-S', f'127.0.0.1:{port}', '-t', str(ROOT / 'dist'), str(ROOT / 'scripts/local-php-server.php')], env=environment, stdout=log, stderr=log)
        try:
            def request(endpoint, body=None, origin=base, method=None, raw=None, query=None):
                data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
                url = base + '/api/payments/' + endpoint + '.php'
                if query:
                    url += '?' + urllib.parse.urlencode(query)
                req = urllib.request.Request(url, data=data, method=method)
                if data is not None:
                    req.add_header('Content-Type', 'application/json')
                    req.add_header('Origin', origin)
                try:
                    response = client.open(req, timeout=5)
                except urllib.error.HTTPError as error:
                    response = error
                return response.status, json.loads(response.read()), response.headers

            for _ in range(100):
                try:
                    with socket.create_connection(('127.0.0.1', port), timeout=.1):
                        break
                except OSError:
                    time.sleep(.03)
            status, data, headers = request('config')
            check(status == 200 and data == {'enabled': True, 'mode': 'test'}, 'Config discloses no credentials')
            check('no-store' in headers.get('Cache-Control', ''), 'Payment responses cannot be cached')
            check(request('quote')[0] == 403, 'Receipt requires an authorized session')
            check(request('access', {'token': token}, origin='https://other.example')[0] == 403, 'Cross-origin authorization blocked')
            check(request('access', {'token': 'f' * 64})[0] == 403, 'Unknown bearer blocked')
            check(request('access', raw=b'{broken')[0] == 400, 'Malformed JSON blocked')
            check(request('access', raw=b'x' * 8193)[0] == 413, 'Oversized body blocked')
            check(request('access', method='GET')[0] == 405, 'Access endpoint rejects GET')
            status, _, headers = request('access', {'token': token})
            check(status == 200, 'Valid link exchanges for cookie access')
            check('HttpOnly' in headers.get('Set-Cookie', '') and 'SameSite=Lax' in headers.get('Set-Cookie', ''), 'Session cookie has access protections')
            status, quote, _ = request('quote')
            check(status == 200 and quote['amount'] == 49900 and quote['status'] == 'approved', 'Approved quote uses server price')
            check(token not in json.dumps(quote) and 'secret' not in json.dumps(quote), 'Quote contains neither bearer nor keys')
            check(request('checkout', {'amount': 1})[0] == 400, 'Client totals are rejected')
            check(request('checkout', {'requestId': quote['requestId']}, origin='https://other.example')[0] == 403, 'Cross-origin Checkout blocked')
            check(request('checkout', {'requestId': 'f' * 32})[0] == 409, 'Checkout cannot pay a different request after another tab changes its cookie')
            check(request('quote', query={'request': 'f' * 32})[0] == 409, 'Return page cannot show a different request after another tab changes its cookie')
            check(request('webhook', {'id': 'evt_forged'})[0] == 400, 'Unsigned webhook rejected')
            # Visiting either public return URL cannot mutate the payment record.
            for route in ['/payment/success', '/payment/cancel']:
                with client.open(base + route) as response:
                    check(response.status == 200 and b'noindex' in response.read(), 'Return page is available and excluded from indexing')
            check(request('quote')[1]['status'] == 'approved', 'Return URLs never mark paid or cancelled')
            output = private / 'state/links/cli-test.txt'
            command = ['php', str(APP / 'manage.php'), 'issue', 'CLI-TEST-ONLY', str(output), 'MHF4U']
            issued = subprocess.run(command, env=environment, capture_output=True, check=True)
            check(output.is_file() and output.stat().st_mode & 0o777 == 0o600, 'CLI writes links to private files with restrictive permissions')
            check(b'#token=' not in issued.stdout and b'https://' not in issued.stdout, 'CLI never prints bearer link')
            outside = private / 'public-link.txt'
            rejected = subprocess.run(['php', str(APP / 'manage.php'), 'issue', 'CLI-OUTSIDE', str(outside), 'MHF4U'], env=environment, capture_output=True)
            check(rejected.returncode == 1 and not outside.exists(), 'CLI rejects output outside its private link directory')
            reported = subprocess.check_output(['php', str(APP / 'manage.php'), 'report'], env=environment)
            check(b'CLI-TEST-ONLY' in reported and b'token' not in reported and b'checkout_url' not in reported, 'Operator report excludes link credentials')
            config['enabled'] = False
            write_config()
            check(request('access', {'token': token})[0] == 503, 'Paused service rejects new access')
            check(request('checkout', {'requestId': quote['requestId']})[0] == 503, 'Paused service rejects new Checkout')
            check(request('quote')[0] == 200, 'Existing receipt stays readable while paused')
            check(request('webhook', {'id': 'evt_forged'})[0] == 400, 'Paused service still enforces webhook signatures')
            config['state_dir'] = str(ROOT / 'dist/payment-state-unsafe')
            write_config()
            check(request('config')[0] == 503 and not (ROOT / 'dist/payment-state-unsafe').exists(), 'Public storage rejected before writing')
        finally:
            process.terminate()
            process.wait(timeout=5)
    check(token.encode() not in (private / 'server.log').read_bytes(), 'Server logs contain no payment token')
print(f'PASS: {checks} HTTP checks; no external Stripe calls or real charges.')
