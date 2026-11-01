<?php
declare(strict_types=1);

// Read-only installation checks. This command never calls Stripe, changes
// configuration, creates payment records, or enables checkout.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/src/Payments.php';
require __DIR__ . '/src/PrivatePermissions.php';
$options = getopt('', ['config:', 'document-root:', 'runtime-user:']);
$runtimeUser = isset($options['runtime-user']) && function_exists('posix_getpwnam') ? posix_getpwnam($options['runtime-user']) : null;
$runtimeUid = is_array($runtimeUser) && $runtimeUser['uid'] > 0 ? $runtimeUser['uid'] : null;
$configFile = realpath($options['config'] ?? getenv('NEXUS_PAYMENT_CONFIG_FILE') ?: '');
$documentRoot = realpath($options['document-root'] ?? '');
$checks = [];
$check = static function (string $name, bool $passed) use (&$checks): void { $checks[$name] = $passed; };
$outside = static function (string $path, string $root): bool {
    $ancestor = $path;
    while (!file_exists($ancestor) && dirname($ancestor) !== $ancestor) $ancestor = dirname($ancestor);
    $resolved = realpath($ancestor);
    return $resolved !== false && !str_starts_with($resolved . '/', $root . '/');
};
$check('php_8_1_or_newer', PHP_VERSION_ID >= 80100);
$check('curl', extension_loaded('curl'));
$check('pdo_sqlite', extension_loaded('pdo_sqlite'));
$check('runtime_user', !isset($options['runtime-user']) || $runtimeUid !== null);
$check('stripe_dependency', is_file(__DIR__ . '/vendor/autoload.php'));
$check('document_root_exists', is_string($documentRoot) && is_file($documentRoot . '/index.html'));
$check('private_application', is_string($documentRoot) && $outside(__DIR__, $documentRoot));
$check('private_config', is_string($configFile) && is_string($documentRoot) && $outside($configFile, $documentRoot));
$check('config_permissions', is_string($configFile) && \Nexus\Payments\PrivatePermissions::check($configFile, $runtimeUid, false));
$config = null;
if ($checks['private_config'] && $checks['config_permissions']) {
    set_error_handler(static function (): never { throw new RuntimeException('Configuration could not be loaded.'); });
    try {
        $loaded = require $configFile;
        if (is_array($loaded)) { \Nexus\Payments\Payments::validateConfig($loaded); $config = $loaded; }
    } catch (Throwable) { /* Report only the check result, never config or secrets. */ }
    restore_error_handler();
}
$check('valid_config', is_array($config));
$check('checkout_disabled', is_array($config) && ($config['enabled'] ?? false) === false && ($config['cart_enabled'] ?? false) === false);
$check('launch_approvals_disabled', is_array($config) && ($config['live_approved'] ?? false) === false
    && ($config['pricing_approved'] ?? false) === false && ($config['self_service_approved'] ?? false) === false);
$check('https_origin', is_array($config) && str_starts_with($config['base_url'] ?? '', 'https://') && ($config['allow_local_http'] ?? false) === false);
$state = $config['state_dir'] ?? '';
$check('private_state_location', is_string($state) && $state !== '' && is_string($documentRoot) && $outside($state, $documentRoot));
$check('state_permissions', is_string($state) && is_dir($state) && is_writable($state) && \Nexus\Payments\PrivatePermissions::check($state, $runtimeUid, true));
$check('public_payment_endpoints', is_string($documentRoot) && is_file($documentRoot . '/api/payments/webhook.php') && is_file($documentRoot . '/api/payments/cart.php'));
$manifest = null;
$catalogue = null;
try {
    $manifestFile = ($documentRoot ?: '') . '/tuition-manifest.json';
    if (is_file($manifestFile)) $manifest = json_decode(file_get_contents($manifestFile), true, 512, JSON_THROW_ON_ERROR);
    $catalogue = json_decode(file_get_contents(__DIR__ . '/catalog-prices.json'), true, 512, JSON_THROW_ON_ERROR);
} catch (Throwable) { /* Invalid release files fail the checks below. */ }
$check('matching_public_private_release', is_array($manifest) && is_file(__DIR__ . '/catalog-prices.json') && ($manifest['catalogueSha256'] ?? '') === hash_file('sha256', __DIR__ . '/catalog-prices.json'));
$check('all_207_prices', is_array($manifest) && ($manifest['currency'] ?? '') === 'CAD' && ($manifest['amount'] ?? 0) === 49900 && ($manifest['courseCount'] ?? 0) === 207
    && is_array($catalogue) && count($catalogue) === 207 && array_reduce($catalogue, static fn (bool $ok, mixed $price): bool => $ok && is_array($price) && ($price['amount'] ?? 0) === 49900, true));
$check('config_matches_catalogue', is_array($config) && is_array($catalogue) && ($config['prices'] ?? []) === $catalogue);
$ready = !in_array(false, $checks, true);
echo json_encode(['preparedWithCheckoutDisabled' => $ready, 'liveLaunchApproved' => false,
    'checks' => $checks, 'notVerifiedByThisCommand' => ['Stripe account/KYC/banking/agreements', 'Management launch approval', 'HTTPS routing and cache exclusions', 'Webhook delivery', 'Registration privacy/retention/delivery']], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n";
exit($ready ? 0 : 1);
