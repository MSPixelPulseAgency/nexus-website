<?php
declare(strict_types=1);

namespace Nexus\Payments;

use PDO;
use RuntimeException;

final class PaymentError extends RuntimeException
{
    public function __construct(public readonly int $httpStatus, string $message)
    {
        parent::__construct($message);
    }
}

interface Gateway
{
    public function accountId(): string;
    public function create(array $params, string $idempotencyKey): array;
    public function retrieve(string $id): array;
}

final class StripeGateway implements Gateway
{
    private \Stripe\StripeClient $client;

    public function __construct(string $key)
    {
        $this->client = new \Stripe\StripeClient(['api_key' => $key, 'max_network_retries' => 2]);
    }

    public function accountId(): string
    {
        return $this->client->accounts->retrieve()->id;
    }

    public function create(array $params, string $idempotencyKey): array
    {
        return $this->client->checkout->sessions->create($params, ['idempotency_key' => $idempotencyKey])->toArray();
    }

    public function retrieve(string $id): array
    {
        return $this->client->checkout->sessions->retrieve($id)->toArray();
    }
}

final class Payments
{
    public readonly PDO $db;

    public function __construct(public readonly array $config, private readonly Gateway $gateway)
    {
        self::validateConfig($config);
        $dir = $config['state_dir'];
        if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
            throw new RuntimeException('Private payment storage is unavailable.');
        }
        umask(0077);
        // Never let a sandbox record appear as a live payment after a config switch.
        $this->db = new PDO('sqlite:' . $dir . '/payments-' . $config['mode'] . '.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $this->db->exec('PRAGMA busy_timeout = 15000');
        $this->db->exec('PRAGMA journal_mode = WAL');
        $this->db->exec('CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, enrollment_ref TEXT NOT NULL,
            items TEXT NOT NULL, amount INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT "cad",
            status TEXT NOT NULL DEFAULT "approved", expires INTEGER NOT NULL, created INTEGER NOT NULL,
            checkout_expires INTEGER, session_id TEXT UNIQUE, checkout_url TEXT, paid_at INTEGER
        )');
        $this->db->exec('CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, request_id TEXT NOT NULL, processed INTEGER NOT NULL)');
        $this->db->exec('CREATE UNIQUE INDEX IF NOT EXISTS requests_reference ON requests (enrollment_ref)');
        $this->db->exec('CREATE TABLE IF NOT EXISTS limits (client TEXT PRIMARY KEY, started INTEGER NOT NULL, attempts INTEGER NOT NULL)');
    }

    public static function validateConfig(array $config): void
    {
        $mode = $config['mode'] ?? '';
        $url = $config['base_url'] ?? '';
        $parts = parse_url($url);
        $local = ($config['allow_local_http'] ?? false) === true
            && in_array($parts['host'] ?? '', ['127.0.0.1', 'localhost'], true);
        if (!in_array($mode, ['test', 'live'], true)
            || ($mode === 'live' && (($config['live_approved'] ?? false) !== true || ($config['pricing_approved'] ?? false) !== true))
            || !$parts || (!$local && ($parts['scheme'] ?? '') !== 'https')
            || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment'])
            || !empty($parts['path']) || empty($parts['host'])
            || !is_string($config['state_dir'] ?? null) || !str_starts_with($config['state_dir'], '/')) {
            throw new PaymentError(503, 'Online payments are not configured. Contact Nexus to continue.');
        }
        $key = $config['secret_key'] ?? '';
        if (($config['enabled'] ?? false) === true && (
            !preg_match('/^(sk|rk)_' . $mode . '_[a-zA-Z0-9]+$/D', $key)
            || !preg_match('/^acct_[a-zA-Z0-9]+$/D', $config['expected_account_id'] ?? '')
            || !str_starts_with($config['webhook_secret'] ?? '', 'whsec_'))) {
            throw new PaymentError(503, 'Online payments are not configured. Contact Nexus to continue.');
        }
    }

    public function requireEnabled(): void
    {
        if (($this->config['enabled'] ?? false) !== true) {
            throw new PaymentError(503, 'Online payments are not available. Contact Nexus to continue.');
        }
    }

    public function requireCartEnabled(): void
    {
        $this->requireEnabled();
        // Public self-service is sandbox-only until Nexus approves enrollment,
        // availability, tax treatment, refunds and live collection separately.
        if (($this->config['cart_enabled'] ?? false) !== true || $this->config['mode'] !== 'test') {
            throw new PaymentError(503, 'Course checkout is not available yet. Contact Nexus to continue.');
        }
    }

    public function validateCodes(array $codes): void
    {
        if (!$codes || count($codes) > 12) throw new PaymentError(400, 'Select between 1 and 12 different courses.');
        foreach ($codes as $code) {
            if (!is_string($code) || !preg_match('/^[A-Z0-9]{5,8}$/D', $code)) {
                throw new PaymentError(400, 'Choose valid course codes from the Nexus catalogue.');
            }
        }
        if (count(array_unique($codes)) !== count($codes)) throw new PaymentError(400, 'Select each course only once.');
    }

    private function one(string $sql, array $values): array|false
    {
        $query = $this->db->prepare($sql);
        $query->execute($values);
        return $query->fetch(PDO::FETCH_ASSOC);
    }

    private function run(string $sql, array $values): void
    {
        $this->db->prepare($sql)->execute($values);
    }

    // Called by a trusted operator on the server, never through the public API.
    // Student/guardian information and academic records must not be included.
    public function issue(string $reference, array $codes, int $now): array
    {
        $this->requireEnabled();
        if (!preg_match('/^[A-Z0-9-]{6,40}$/D', $reference)) {
            throw new PaymentError(400, 'Use a non-personal reference and 1–12 distinct approved course codes.');
        }
        $this->validateCodes($codes);
        $items = [];
        $amount = 0;
        foreach ($codes as $code) {
            $price = $this->config['prices'][$code] ?? null;
            if (!is_string($code) || !is_array($price) || !is_int($price['amount'] ?? null)
                || $price['amount'] <= 0 || $price['amount'] > 1000000
                || !is_string($price['label'] ?? null) || strlen($price['label']) > 200 || trim($price['label']) === '') {
                throw new PaymentError(422, 'An approved course price is missing.');
            }
            $items[] = ['code' => $code, 'label' => $price['label'], 'amount' => $price['amount']];
            $amount += $price['amount'];
        }
        if ($amount > 1000000) throw new PaymentError(422, 'Payment exceeds the configured per-request limit.');
        $id = bin2hex(random_bytes(16));
        $token = bin2hex(random_bytes(32));
        $this->run('INSERT INTO requests (id, token_hash, enrollment_ref, items, amount, expires, created) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [$id, hash('sha256', $token), $reference, json_encode($items, JSON_THROW_ON_ERROR), $amount, $now + 172800, $now]);
        return ['id' => $id, 'link' => $this->config['base_url'] . '/checkout#token=' . $token];
    }

    public function authorize(string $token, int $now): string
    {
        if (!preg_match('/^[a-f0-9]{64}$/D', $token)) throw new PaymentError(403, 'This payment link is invalid or has expired. Contact Nexus.');
        $request = $this->one('SELECT id, expires FROM requests WHERE token_hash = ?', [hash('sha256', $token)]);
        if (!$request || (int) $request['expires'] <= $now) throw new PaymentError(403, 'This payment link is invalid or has expired. Contact Nexus.');
        return $request['id'];
    }

    private function request(string $id): array
    {
        $request = $this->one('SELECT * FROM requests WHERE id = ?', [$id]);
        if (!$request) throw new PaymentError(404, 'Payment request not found. Contact Nexus.');
        return $request;
    }

    public function quote(string $id): array
    {
        $request = $this->request($id);
        return [
            'requestId' => $request['id'],
            'reference' => $request['enrollment_ref'], 'items' => json_decode($request['items'], true, 512, JSON_THROW_ON_ERROR),
            'amount' => (int) $request['amount'], 'currency' => $request['currency'],
            'status' => $request['status'], 'expires' => (int) $request['expires'], 'mode' => $this->config['mode'],
        ];
    }

    public function checkout(string $id, int $now): string
    {
        $this->requireEnabled();
        // Do not let an agency account's key collect school tuition.
        if ($this->gateway->accountId() !== $this->config['expected_account_id']) {
            throw new PaymentError(503, 'Payment account configuration needs review. Contact Nexus.');
        }
        // Persist the exact expiry before contacting Stripe, preserving identical
        // parameters if a network failure happens after Stripe creates the session.
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $request = $this->request($id);
            if ($request['status'] === 'paid') throw new PaymentError(409, 'This payment has already been confirmed.');
            if ((int) $request['expires'] < $now + 1860) throw new PaymentError(410, 'This payment link has expired. Contact Nexus for a new link.');
            if ($request['checkout_expires'] === null) {
                $this->run('UPDATE requests SET checkout_expires = ? WHERE id = ?', [$now + 1860, $id]);
            }
            $this->db->exec('COMMIT');
        } catch (\Throwable $error) {
            $this->db->exec('ROLLBACK');
            throw $error;
        }
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $request = $this->request($id);
            if ($request['status'] === 'paid') throw new PaymentError(409, 'This payment has already been confirmed.');
            if ((int) $request['checkout_expires'] <= $now + 60) throw new PaymentError(410, 'This checkout has expired. Contact Nexus for a new link.');
            if ($request['checkout_url']) {
                $this->db->exec('COMMIT');
                return $request['checkout_url'];
            }
            $items = json_decode($request['items'], true, 512, JSON_THROW_ON_ERROR);
            $session = $this->gateway->create([
                // Current Stripe API selects methods from Dashboard settings.
                'mode' => 'payment',
                'adaptive_pricing' => ['enabled' => false], 'automatic_tax' => ['enabled' => false],
                'allow_promotion_codes' => false,
                'line_items' => array_map(static fn (array $item): array => [
                    'price_data' => ['currency' => 'cad', 'unit_amount' => $item['amount'],
                        'product_data' => ['name' => $item['code'] . ' · ' . $item['label']]], 'quantity' => 1,
                ], $items),
                'client_reference_id' => $id, 'metadata' => ['nexus_payment_request' => $id],
                'payment_intent_data' => ['metadata' => ['nexus_payment_request' => $id]],
                'success_url' => $this->config['base_url'] . '/payment/success?request=' . $id,
                'cancel_url' => $this->config['base_url'] . '/payment/cancel?request=' . $id,
                'expires_at' => (int) $request['checkout_expires'],
            ], 'nexus-checkout-v2-' . $id);
            $this->validateSession($session, $request);
            $url = $session['url'] ?? '';
            if (!str_starts_with($url, 'https://checkout.stripe.com/')) throw new RuntimeException('Invalid Checkout destination.');
            $this->run('UPDATE requests SET session_id = ?, checkout_url = ?, status = ? WHERE id = ?', [$session['id'], $url, 'pending', $id]);
            $this->db->exec('COMMIT');
            return $url;
        } catch (\Throwable $error) {
            $this->db->exec('ROLLBACK');
            throw $error;
        }
    }

    private function validateSession(array $session, array $request): void
    {
        if (($session['livemode'] ?? null) !== ($this->config['mode'] === 'live')
            || ($session['mode'] ?? '') !== 'payment'
            || ($session['client_reference_id'] ?? '') !== $request['id']
            || ($session['metadata']['nexus_payment_request'] ?? '') !== $request['id']
            || ($session['amount_total'] ?? null) !== (int) $request['amount']
            || ($session['currency'] ?? '') !== $request['currency']
            || !is_string($session['id'] ?? null)
            || ($request['session_id'] !== null && $session['id'] !== $request['session_id'])) {
            throw new RuntimeException('Checkout reconciliation failed.');
        }
    }

    // Caller must verify the raw request signature with Stripe's SDK first.
    public function webhook(array $event, int $now): void
    {
        if (($event['livemode'] ?? null) !== ($this->config['mode'] === 'live')) throw new PaymentError(400, 'Wrong payment environment.');
        if (!in_array($event['type'] ?? '', ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired'], true)) return;
        if (!preg_match('/^evt_[a-zA-Z0-9_]+$/D', $event['id'] ?? '')) throw new PaymentError(400, 'Invalid event.');
        if ($this->one('SELECT id FROM events WHERE id = ?', [$event['id']])) return;
        $object = $event['data']['object'] ?? [];
        $id = $object['metadata']['nexus_payment_request'] ?? '';
        // Events belonging to other integrations in the same Stripe account are ignored.
        if ($id === '') return;
        $request = $this->request($id);
        if ($this->gateway->accountId() !== $this->config['expected_account_id']) throw new RuntimeException('Wrong Stripe account.');
        $session = $this->gateway->retrieve($object['id'] ?? '');
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            if ($this->one('SELECT id FROM events WHERE id = ?', [$event['id']])) {
                $this->db->exec('COMMIT');
                return;
            }
            $request = $this->request($id);
            $this->validateSession($session, $request);
            $status = ($session['payment_status'] ?? '') === 'paid' ? 'paid'
                : (($session['status'] ?? '') === 'expired' ? 'expired'
                    : ($event['type'] === 'checkout.session.async_payment_failed' ? 'failed' : 'pending'));
            // Paid is absorbing, so delayed/duplicate events cannot undo a payment.
            if ($request['status'] !== 'paid') {
                $this->run('UPDATE requests SET status = ?, session_id = ?, paid_at = ? WHERE id = ?',
                    [$status, $session['id'], $status === 'paid' ? $now : null, $id]);
            }
            $this->run('INSERT INTO events (id, request_id, processed) VALUES (?, ?, ?)', [$event['id'], $id, $now]);
            $this->db->exec('COMMIT');
        } catch (\Throwable $error) {
            $this->db->exec('ROLLBACK');
            throw $error;
        }
    }

    public function throttle(string $client, int $now, int $maximum = 30): void
    {
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $this->run('DELETE FROM limits WHERE started < ?', [$now - 600]);
            $row = $this->one('SELECT attempts FROM limits WHERE client = ?', [$client]);
            if ($row && (int) $row['attempts'] >= $maximum) throw new PaymentError(429, 'Too many attempts. Please try again in ten minutes.');
            $this->run('INSERT INTO limits (client, started, attempts) VALUES (?, ?, 1) ON CONFLICT(client) DO UPDATE SET attempts = attempts + 1', [$client, $now]);
            $this->db->exec('COMMIT');
        } catch (\Throwable $error) {
            $this->db->exec('ROLLBACK');
            throw $error;
        }
    }
}
