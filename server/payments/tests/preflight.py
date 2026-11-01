"""Verify copied deployment configuration and read-only launch preparation checks."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[3]
APP = ROOT / 'server/payments'
checks = 0

def check(condition, message):
    global checks
    checks += 1
    if not condition:
        raise AssertionError(message)

def php_string(value):
    return "'" + str(value).replace('\\', '\\\\').replace("'", "\\'") + "'"

with tempfile.TemporaryDirectory(prefix='nexus-preflight-') as temp:
    private = Path(temp)
    (private / 'nexus-payments').symlink_to(APP, target_is_directory=True)
    example = private / 'copied-example.php'
    shutil.copyfile(APP / 'config.example.php', example)
    state = private / 'state'
    state.mkdir(mode=0o700)
    config = private / 'config.php'
    environment = {k: v for k, v in os.environ.items() if k not in ('NEXUS_PAYMENT_APP_DIR', 'NEXUS_STRIPE_SECRET_KEY', 'NEXUS_STRIPE_WEBHOOK_SECRET')}

    def write_config(extra=''):
        config.write_text('<?php $c = require ' + php_string(example) + ';\n'
                          "$c['base_url'] = 'https://staging.example.invalid';\n"
                          "$c['allow_local_http'] = false;\n"
                          "$c['state_dir'] = " + php_string(state) + ';\n' + extra + '\nreturn $c;\n')
        config.chmod(0o600)

    def preflight():
        result = subprocess.run(['php', str(APP / 'preflight.php'), '--config=' + str(config), '--document-root=' + str(ROOT / 'dist')], env=environment, capture_output=True, text=True)
        return result.returncode, json.loads(result.stdout)

    write_config()
    code, result = preflight()
    check(code == 0 and result['preparedWithCheckoutDisabled'], 'Copied sibling config finds the correct 207-course catalogue')
    check(result['liveLaunchApproved'] is False, 'Passing preflight never authorizes launch')
    check(not list(state.iterdir()), 'Read-only preflight does not create SQLite or sessions')
    config.chmod(0o644)
    code, result = preflight()
    check(code == 1 and result['checks']['config_permissions'] is False, 'Group/world-readable configuration is rejected')
    write_config("$c['enabled'] = true; $c['secret_key'] = 'sk_test_fixture'; $c['expected_account_id'] = 'acct_fixture'; $c['webhook_secret'] = 'whsec_fixture';")
    code, result = preflight()
    check(code == 1 and result['checks']['checkout_disabled'] is False, 'Preparation check refuses enabled checkout')
    check('sk_test_fixture' not in json.dumps(result) and 'whsec_fixture' not in json.dumps(result), 'Output never exposes credentials')
    write_config("$c['self_service_approved'] = true;")
    code, result = preflight()
    check(code == 1 and result['checks']['launch_approvals_disabled'] is False, 'Disabled preparation never carries live self-service approval')
    write_config("$c['prices']['MHF4U']['amount'] = 1;")
    code, result = preflight()
    check(code == 1 and result['checks']['config_matches_catalogue'] is False, 'Conflicting server override fails preparation')
    write_config("$c['allow_local_http'] = true; $c['base_url'] = 'http://127.0.0.1:8787';")
    code, result = preflight()
    check(code == 1 and result['checks']['https_origin'] is False, 'Launch preparation requires HTTPS configuration')
    write_config()
    state.chmod(0o755)
    code, result = preflight()
    check(code == 1 and result['checks']['state_permissions'] is False, 'Open payment state directory fails preparation')
    check(not list(state.iterdir()), 'Failed checks also leave payment state untouched')

print(f'PASS: {checks} deployment preflight checks; no Stripe calls or configuration changes.')
