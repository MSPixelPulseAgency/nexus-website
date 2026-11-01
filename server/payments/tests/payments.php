<?php
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Payments.php';

use Nexus\Payments\Gateway;
use Nexus\Payments\PaymentError;
use Nexus\Payments\Payments;

// No real Stripe credentials or external requests are used by this suite.
final class TestGateway implements Gateway
{
    public string $account = 'acct_fixture';
    public array $sessions = [];
    public array $calls = [];
    public bool $networkFailure = false;
    public int $retrieves = 0;
    public function accountId(): string { return $this->account; }
    public function create(array $params, string $idempotencyKey): array
    {
        $this->calls[] = ['params' => $params, 'key' => $idempotencyKey];
        $id = 'cs_test_' . $params['client_reference_id'];
        $session = $this->sessions[$id] ?? [
            'id' => $id, 'url' => 'https://checkout.stripe.com/c/pay/' . $id,
            'amount_total' => array_sum(array_map(static fn ($item) => $item['price_data']['unit_amount'], $params['line_items'])),
            'currency' => 'cad', 'mode' => 'payment', 'livemode' => false,
            'status' => 'open', 'payment_status' => 'unpaid',
            'client_reference_id' => $params['client_reference_id'], 'metadata' => $params['metadata'],
        ];
        $this->sessions[$id] = $session;
        if ($this->networkFailure) { $this->networkFailure = false; throw new RuntimeException('Simulated timeout after Stripe session creation.'); }
        return $session;
    }
    public function retrieve(string $id): array { $this->retrieves++; return $this->sessions[$id]; }
}

$assertions = 0;
function check(bool $condition, string $message): void {
    global $assertions;
    $assertions++;
    if (!$condition) throw new RuntimeException('FAIL: ' . $message);
}
function rejects(callable $call, ?int $status = null): void {
    try { $call(); } catch (Throwable $error) {
        check($status === null || ($error instanceof PaymentError && $error->httpStatus === $status), 'Expected rejection status');
        return;
    }
    throw new RuntimeException('FAIL: expected rejection');
}
function eventFor(array $session, string $id, string $type = 'checkout.session.completed'): array {
    return ['id' => $id, 'type' => $type, 'livemode' => false, 'data' => ['object' => $session]];
}

$dir = sys_get_temp_dir() . '/nexus-payment-tests-' . bin2hex(random_bytes(8));
$config = [
    'enabled' => true, 'mode' => 'test', 'live_approved' => false, 'pricing_approved' => false,
    'base_url' => 'http://127.0.0.1:8787', 'allow_local_http' => true,
    'expected_account_id' => 'acct_fixture', 'secret_key' => 'sk_test_unitfixture',
    'webhook_secret' => 'whsec_unit_test_only', 'state_dir' => $dir,
    'prices' => ['MHF4U' => ['amount' => 49900, 'label' => 'Advanced Functions'], 'ENG4U' => ['amount' => 49900, 'label' => 'English']],
];

try {
    $gateway = new TestGateway();
    $payments = new Payments($config, $gateway);
    foreach ([['mode' => 'live'], ['secret_key' => 'sk_live_unitfixture'], ['base_url' => 'http://school.example'], ['base_url' => 'https://user@school.example']] as $invalid) {
        rejects(static fn () => Payments::validateConfig(array_replace($config, $invalid)), 503);
    }
    $disabled = new Payments(array_replace($config, ['enabled' => false]), $gateway);
    $liveStore = new Payments(array_replace($config, ['enabled' => false, 'mode' => 'live', 'live_approved' => true, 'pricing_approved' => true]), $gateway);
    rejects(static fn () => $disabled->issue('TEST-ONLY', ['MHF4U'], 1000), 503);
    rejects(static fn () => $payments->issue('TEST-ONLY', ['UNKNOWN'], 1000), 422);
    rejects(static fn () => $payments->issue('TEST-ONLY', ['MHF4U', 'MHF4U'], 1000), 400);
    rejects(static fn () => $payments->issue('student@example.com', ['MHF4U'], 1000), 400);
    $issued = $payments->issue('TEST-ONLY', ['MHF4U', 'ENG4U'], 1000);
    $token = substr($issued['link'], strpos($issued['link'], '#token=') + 7);
    $id = $payments->authorize($token, 1001);
    rejects(static fn () => $liveStore->quote($id), 404);
    check($id === $issued['id'], 'Bearer link authorizes only its request');
    rejects(static fn () => $payments->authorize(str_repeat('f', 64), 1001), 403);
    rejects(static fn () => $payments->authorize($token, 200000), 403);
    check($payments->quote($id)['amount'] === 99800, 'Two provisional CA$499 courses total CA$998');
    rejects(static fn () => $payments->issue('TEST-ONLY', ['MHF4U'], 1001));
    $gateway->account = 'acct_other';
    rejects(static fn () => $payments->checkout($id, 1002), 503);
    $gateway->account = 'acct_fixture';
    $gateway->networkFailure = true;
    rejects(static fn () => $payments->checkout($id, 1002));
    check($payments->quote($id)['status'] === 'approved', 'Network error does not mark paid');
    $url = $payments->checkout($id, 1003);
    check($gateway->calls[0] === $gateway->calls[1], 'Network retry uses identical parameters and idempotency key');
    check($payments->checkout($id, 1004) === $url && count($gateway->calls) === 2, 'Repeated checkout reuses the existing session');
    check($payments->quote($id)['status'] === 'pending', 'Checkout creation is pending, not paid');
    $sessionId = 'cs_test_' . $id;
    $session = $gateway->sessions[$sessionId];
    $payments->webhook(eventFor($session, 'evt_unpaid'), 1005);
    check($payments->quote($id)['status'] === 'pending', 'Unpaid completion remains pending');
    $gateway->sessions[$sessionId]['amount_total'] = 1;
    rejects(static fn () => $payments->webhook(eventFor($session, 'evt_amount'), 1006));
    check($payments->db->query("SELECT COUNT(*) FROM events WHERE id = 'evt_amount'")->fetchColumn() === 0, 'Failed reconciliation can retry');
    $gateway->sessions[$sessionId]['amount_total'] = 99800;
    $gateway->sessions[$sessionId]['currency'] = 'usd';
    rejects(static fn () => $payments->webhook(eventFor($session, 'evt_currency'), 1006));
    $gateway->sessions[$sessionId]['currency'] = 'cad';
    $gateway->sessions[$sessionId]['payment_status'] = 'paid';
    $gateway->sessions[$sessionId]['status'] = 'complete';
    $paidEvent = eventFor($session, 'evt_paid');
    $payments->webhook($paidEvent, 1007);
    check($payments->quote($id)['status'] === 'paid', 'Verified webhook marks payment paid');
    $retrieves = $gateway->retrieves;
    $payments->webhook($paidEvent, 1008);
    check($gateway->retrieves === $retrieves, 'Duplicate webhook is idempotent');
    $gateway->sessions[$sessionId]['payment_status'] = 'unpaid';
    $gateway->sessions[$sessionId]['status'] = 'expired';
    $payments->webhook(eventFor($session, 'evt_late', 'checkout.session.expired'), 1009);
    check($payments->quote($id)['status'] === 'paid', 'Late expiry cannot downgrade paid state');
    rejects(static fn () => $payments->checkout($id, 1010), 409);
    rejects(static fn () => $payments->webhook(array_replace($paidEvent, ['livemode' => true]), 1010), 400);

    $failed = $payments->issue('TEST-FAILED', ['MHF4U'], 1000);
    $payments->checkout($failed['id'], 1001);
    $failedSession = $gateway->sessions['cs_test_' . $failed['id']];
    $payments->webhook(eventFor($failedSession, 'evt_failed', 'checkout.session.async_payment_failed'), 1002);
    check($payments->quote($failed['id'])['status'] === 'failed', 'Asynchronous failure is not paid');
    $expired = $payments->issue('TEST-EXPIRED', ['MHF4U'], 1000);
    rejects(static fn () => $payments->checkout($expired['id'], 200000), 410);
    $payments->checkout($expired['id'], 1001);
    $gateway->sessions['cs_test_' . $expired['id']]['status'] = 'expired';
    $payments->webhook(eventFor($gateway->sessions['cs_test_' . $expired['id']], 'evt_expired', 'checkout.session.expired'), 1002);
    check($payments->quote($expired['id'])['status'] === 'expired', 'Expired session remains unpaid');

    $payments->throttle('unit-client', 1000, 2);
    $payments->throttle('unit-client', 1000, 2);
    rejects(static fn () => $payments->throttle('unit-client', 1000, 2), 429);
    $payments->throttle('unit-client', 1601, 2);
    check(true, 'Rate limit expires');

    $payload = json_encode($paidEvent, JSON_THROW_ON_ERROR);
    $timestamp = time();
    $signature = 't=' . $timestamp . ',v1=' . hash_hmac('sha256', $timestamp . '.' . $payload, $config['webhook_secret']);
    check(Stripe\Webhook::constructEvent($payload, $signature, $config['webhook_secret'])->id === 'evt_paid', 'Stripe SDK verifies raw-body signature');
    rejects(static fn () => Stripe\Webhook::constructEvent($payload . ' ', $signature, $config['webhook_secret']));
    rejects(static fn () => Stripe\Webhook::constructEvent($payload, 't=1,v1=invalid', $config['webhook_secret']));
    check(!str_contains(json_encode($payments->quote($id)), $token), 'Public quote contains no bearer token');
    echo "PASS: {$assertions} payment checks; no external Stripe calls or real charges.\n";
} finally {
    unset($payments, $disabled, $liveStore);
    if (is_dir($dir)) {
        foreach (glob($dir . '/*') as $file) unlink($file);
        rmdir($dir);
    }
}
