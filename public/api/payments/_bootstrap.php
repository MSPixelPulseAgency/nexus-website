<?php
declare(strict_types=1);
ini_set('display_errors', '0');

use Nexus\Payments\PaymentError;
use Nexus\Payments\Payments;
use Nexus\Payments\StripeGateway;

function payment_json(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: private, no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('Referrer-Policy: no-referrer');
    echo json_encode($body, JSON_THROW_ON_ERROR);
    exit;
}

set_exception_handler(static function (Throwable $error): never {
    if ($error instanceof PaymentError) {
        if ($error->httpStatus === 429) header('Retry-After: 600');
        payment_json($error->httpStatus, ['error' => $error->getMessage()]);
    }
    // Never log exception messages, raw events, request bodies or Stripe keys.
    error_log('Nexus payment request failed: ' . get_class($error));
    payment_json(503, ['error' => 'Payment confirmation is temporarily unavailable. Please retry or contact Nexus.']);
});

$docRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '') ?: '';
$appDir = realpath(getenv('NEXUS_PAYMENT_APP_DIR') ?: dirname($docRoot) . '/private_html/nexus-payments');
$configFile = realpath(getenv('NEXUS_PAYMENT_CONFIG_FILE') ?: dirname($docRoot) . '/private_html/nexus-payments-config.php');
// Private code, dependencies and configuration must never be deployed under public_html.
foreach ([$appDir, $configFile] as $privatePath) {
    if ($privatePath === false || $docRoot === '' || str_starts_with($privatePath . '/', $docRoot . '/')) {
        payment_json(503, ['error' => 'Online payments are not configured. Contact Nexus to continue.', 'enabled' => false]);
    }
}
require_once $appDir . '/vendor/autoload.php';
require_once $appDir . '/src/Payments.php';
$paymentConfig = require $configFile;
Payments::validateConfig($paymentConfig);
$statePath = $paymentConfig['state_dir'];
$stateAncestor = $statePath;
while (!file_exists($stateAncestor) && dirname($stateAncestor) !== $stateAncestor) $stateAncestor = dirname($stateAncestor);
if (str_starts_with((realpath($stateAncestor) ?: $stateAncestor) . '/', $docRoot . '/')) throw new PaymentError(503, 'Private payment storage needs configuration.');
$payments = new Payments($paymentConfig, new StripeGateway($paymentConfig['secret_key'] ?: 'sk_test_unconfigured'));
if (str_starts_with((realpath($statePath) ?: '') . '/', $docRoot . '/')) throw new PaymentError(503, 'Private payment storage needs configuration.');

function payment_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        throw new PaymentError(405, 'Method not allowed.');
    }
}

function payment_input(): array
{
    global $paymentConfig;
    payment_method('POST');
    if (($_SERVER['HTTP_ORIGIN'] ?? '') !== $paymentConfig['base_url']
        || !in_array($_SERVER['HTTP_SEC_FETCH_SITE'] ?? 'same-origin', ['same-origin', 'none'], true)) {
        throw new PaymentError(403, 'Please use the Nexus payment page.');
    }
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
        throw new PaymentError(415, 'JSON is required.');
    }
    $raw = file_get_contents('php://input', false, null, 0, 8193);
    if ($raw === false || strlen($raw) > 8192) throw new PaymentError(413, 'Request too large.');
    try {
        $body = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        throw new PaymentError(400, 'Invalid request.');
    }
    if (!is_array($body)) throw new PaymentError(400, 'Invalid request.');
    return $body;
}

function payment_session(): void
{
    global $paymentConfig;
    $path = $paymentConfig['state_dir'] . '/sessions-' . $paymentConfig['mode'];
    if (!is_dir($path) && !mkdir($path, 0700, true) && !is_dir($path)) throw new RuntimeException('Session storage unavailable.');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', '7200');
    session_save_path($path);
    session_name('nexus_payment_access_' . $paymentConfig['mode']);
    session_set_cookie_params([
        'lifetime' => 7200, 'path' => '/api/payments/', 'secure' => str_starts_with($paymentConfig['base_url'], 'https://'),
        'httponly' => true, 'samesite' => 'Lax',
    ]);
    session_start();
}

function payment_access(): string
{
    payment_session();
    $id = $_SESSION['payment_request'] ?? '';
    $expires = $_SESSION['payment_access_expires'] ?? 0;
    session_write_close();
    if (!is_string($id) || $id === '' || $expires <= time()) throw new PaymentError(403, 'Open the payment link provided by Nexus to continue.');
    return $id;
}

function payment_throttle(int $maximum = 30, string $scope = 'access'): void
{
    global $payments;
    // Trust only REMOTE_ADDR; forwarded headers are not a trusted client identifier.
    $payments->throttle(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '|' . $scope), time(), $maximum);
}
