<?php
/**
 * Nexus Education Private School — protected brand-asset access (server side).
 *
 * Shared bootstrap for the small PHP endpoints under /api/brand/. This runs on the
 * Cloudways (Apache + PHP) production host. Nothing in this directory contains a
 * secret: the access password hash and the token-signing secret are read from
 * environment variables or from a config file that lives OUTSIDE the web root and
 * is never committed to Git (see server/nexus-brand-access.example.php).
 */

declare(strict_types=1);

const NEXUS_BRAND_COOKIE = 'nexus_brand_access';
const NEXUS_BRAND_COOKIE_PATH = '/api/brand/';
const NEXUS_BRAND_TOKEN_TTL = 7200;          // 2 hours
const NEXUS_BRAND_MAX_FAILURES = 8;          // per client, per window
const NEXUS_BRAND_FAILURE_WINDOW = 900;      // 15 minutes
const NEXUS_BRAND_TOKEN_VERSION = 'v1';

/**
 * Downloadable files. The key is the only thing the browser ever sends; the file
 * name is resolved server side inside the private directory, so path traversal or
 * guessing a file name is not possible.
 */
const NEXUS_BRAND_FILES = [
    'brand-guidelines-pdf' => ['file' => 'Nexus-Education-Private-School-Brand-Guidelines.pdf', 'type' => 'application/pdf'],
    'brand-package-zip' => ['file' => 'Nexus-Education-Private-School-Brand-Package.zip', 'type' => 'application/zip'],
    'logo-primary-svg' => ['file' => 'Nexus-Education-Private-School-Logo-Primary.svg', 'type' => 'image/svg+xml'],
    'logo-primary-png' => ['file' => 'Nexus-Education-Private-School-Logo-Primary-2400px.png', 'type' => 'image/png'],
    'logo-primary-jpg' => ['file' => 'Nexus-Education-Private-School-Logo-Primary-2400px.jpg', 'type' => 'image/jpeg'],
    'logo-horizontal-svg' => ['file' => 'Nexus-Education-Private-School-Logo-Horizontal.svg', 'type' => 'image/svg+xml'],
    'logo-horizontal-png' => ['file' => 'Nexus-Education-Private-School-Logo-Horizontal-2400px.png', 'type' => 'image/png'],
    'logo-white-svg' => ['file' => 'Nexus-Education-Private-School-Logo-White.svg', 'type' => 'image/svg+xml'],
    'logo-white-png' => ['file' => 'Nexus-Education-Private-School-Logo-White-2400px.png', 'type' => 'image/png'],
    'logo-dark-background-svg' => ['file' => 'Nexus-Education-Private-School-Logo-Dark-Background.svg', 'type' => 'image/svg+xml'],
    'logo-dark-background-png' => ['file' => 'Nexus-Education-Private-School-Logo-Dark-Background-2400px.png', 'type' => 'image/png'],
    'logo-black-svg' => ['file' => 'Nexus-Education-Private-School-Logo-Black.svg', 'type' => 'image/svg+xml'],
    'logo-black-png' => ['file' => 'Nexus-Education-Private-School-Logo-Black-2400px.png', 'type' => 'image/png'],
    'logo-grayscale-svg' => ['file' => 'Nexus-Education-Private-School-Logo-Grayscale.svg', 'type' => 'image/svg+xml'],
    'logo-mark-svg' => ['file' => 'Nexus-Education-Private-School-Logo-Mark.svg', 'type' => 'image/svg+xml'],
    'logo-mark-png' => ['file' => 'Nexus-Education-Private-School-Logo-Mark-2048px.png', 'type' => 'image/png'],
    'logo-mark-white-svg' => ['file' => 'Nexus-Education-Private-School-Logo-Mark-White.svg', 'type' => 'image/svg+xml'],
    'web-icons-zip' => ['file' => 'Nexus-Education-Private-School-Web-Icons.zip', 'type' => 'application/zip'],
    'quick-reference-png' => ['file' => 'Nexus-Education-Private-School-Brand-Quick-Reference.png', 'type' => 'image/png'],
];

function nexus_brand_send_security_headers(): void
{
    header('Cache-Control: private, no-store, max-age=0');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('Referrer-Policy: same-origin');
}

function nexus_brand_json(int $status, array $payload): never
{
    http_response_code($status);
    nexus_brand_send_security_headers();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function nexus_brand_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string) $_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
        return true;
    }
    return (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443;
}

/**
 * Resolve configuration. Precedence: environment variables, then a PHP config file
 * outside the web root. Returns null when the feature has not been configured yet
 * so callers can fail closed with a clear 503.
 */
function nexus_brand_config(): ?array
{
    static $config = null;
    static $resolved = false;
    if ($resolved) {
        return $config;
    }
    $resolved = true;

    $hash = getenv('NEXUS_BRAND_ACCESS_HASH') ?: null;
    $secret = getenv('NEXUS_BRAND_SESSION_SECRET') ?: null;
    $privateDir = getenv('NEXUS_BRAND_PRIVATE_DIR') ?: null;

    if ($hash === null || $secret === null || $privateDir === null) {
        $configFile = getenv('NEXUS_BRAND_CONFIG_FILE') ?: null;
        if ($configFile === null) {
            $docRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
            // Cloudways layout: applications/<app>/public_html and applications/<app>/private_html
            $configFile = dirname($docRoot) . '/private_html/nexus-brand-access.php';
        }
        if (is_readable($configFile)) {
            $fileConfig = include $configFile;
            if (is_array($fileConfig)) {
                $hash = $hash ?? ($fileConfig['password_hash'] ?? null);
                $secret = $secret ?? ($fileConfig['session_secret'] ?? null);
                $privateDir = $privateDir ?? ($fileConfig['private_dir'] ?? null);
            }
        }
    }

    if (!is_string($hash) || $hash === '' || !is_string($secret) || strlen($secret) < 32 || !is_string($privateDir) || $privateDir === '') {
        return null;
    }
    $realDir = realpath($privateDir);
    if ($realDir === false || !is_dir($realDir)) {
        return null;
    }
    $config = ['password_hash' => $hash, 'session_secret' => $secret, 'private_dir' => $realDir];
    return $config;
}

function nexus_brand_base64url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function nexus_brand_base64url_decode(string $value): string|false
{
    return base64_decode(strtr($value, '-_', '+/'), true);
}

/** Create a signed, expiring access token: v1.<expiry>.<nonce>.<hmac> */
function nexus_brand_issue_token(string $secret, int $now): array
{
    $expires = $now + NEXUS_BRAND_TOKEN_TTL;
    $nonce = nexus_brand_base64url_encode(random_bytes(16));
    $payload = NEXUS_BRAND_TOKEN_VERSION . '.' . $expires . '.' . $nonce;
    $signature = nexus_brand_base64url_encode(hash_hmac('sha256', $payload, $secret, true));
    return ['token' => $payload . '.' . $signature, 'expires' => $expires];
}

/** Returns the expiry timestamp when the token is valid, or null. */
function nexus_brand_verify_token(?string $token, string $secret, int $now): ?int
{
    if (!is_string($token) || strlen($token) > 256) {
        return null;
    }
    $parts = explode('.', $token);
    if (count($parts) !== 4 || $parts[0] !== NEXUS_BRAND_TOKEN_VERSION || !ctype_digit($parts[1])) {
        return null;
    }
    $payload = $parts[0] . '.' . $parts[1] . '.' . $parts[2];
    $expected = nexus_brand_base64url_encode(hash_hmac('sha256', $payload, $secret, true));
    if (!hash_equals($expected, $parts[3])) {
        return null;
    }
    $expires = (int) $parts[1];
    if ($expires <= $now) {
        return null;
    }
    return $expires;
}

function nexus_brand_set_cookie(string $value, int $expires): void
{
    setcookie(NEXUS_BRAND_COOKIE, $value, [
        'expires' => $expires,
        'path' => NEXUS_BRAND_COOKIE_PATH,
        'secure' => nexus_brand_is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

function nexus_brand_clear_cookie(): void
{
    setcookie(NEXUS_BRAND_COOKIE, '', [
        'expires' => time() - 86400,
        'path' => NEXUS_BRAND_COOKIE_PATH,
        'secure' => nexus_brand_is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

/** Current session expiry (unix time) if the request carries a valid cookie. */
function nexus_brand_session_expiry(array $config): ?int
{
    return nexus_brand_verify_token($_COOKIE[NEXUS_BRAND_COOKIE] ?? null, $config['session_secret'], time());
}

/** Reject cross-site form posts. Same-site requests from the SPA are the only expected callers. */
function nexus_brand_require_same_origin(): void
{
    $site = $_SERVER['HTTP_SEC_FETCH_SITE'] ?? null;
    if ($site !== null && !in_array($site, ['same-origin', 'same-site', 'none'], true)) {
        nexus_brand_json(403, ['ok' => false, 'error' => 'forbidden']);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
    if ($origin !== null) {
        $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
        $originHost = strtolower((string) (parse_url($origin, PHP_URL_HOST) ?? ''));
        $originPort = parse_url($origin, PHP_URL_PORT);
        if ($originPort !== null) {
            $originHost .= ':' . $originPort;
        }
        if ($host === '' || $originHost !== $host) {
            nexus_brand_json(403, ['ok' => false, 'error' => 'forbidden']);
        }
    }
}

function nexus_brand_client_key(string $secret): string
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    return hash_hmac('sha256', $ip, $secret);
}

function nexus_brand_throttle_path(string $key): string
{
    return rtrim(sys_get_temp_dir(), '/') . '/nexus-brand-throttle-' . substr($key, 0, 40) . '.json';
}

/** Returns seconds to wait when the client is throttled, otherwise 0. */
function nexus_brand_throttle_check(string $key, int $now): int
{
    $path = nexus_brand_throttle_path($key);
    if (!is_file($path)) {
        return 0;
    }
    $data = json_decode((string) @file_get_contents($path), true);
    if (!is_array($data)) {
        return 0;
    }
    $failures = array_values(array_filter($data['failures'] ?? [], static fn ($ts) => is_int($ts) && $ts > $now - NEXUS_BRAND_FAILURE_WINDOW));
    if (count($failures) >= NEXUS_BRAND_MAX_FAILURES) {
        return max(1, (min($failures) + NEXUS_BRAND_FAILURE_WINDOW) - $now);
    }
    return 0;
}

function nexus_brand_throttle_record_failure(string $key, int $now): void
{
    $path = nexus_brand_throttle_path($key);
    $data = is_file($path) ? json_decode((string) @file_get_contents($path), true) : null;
    $failures = is_array($data) ? ($data['failures'] ?? []) : [];
    $failures = array_values(array_filter($failures, static fn ($ts) => is_int($ts) && $ts > $now - NEXUS_BRAND_FAILURE_WINDOW));
    $failures[] = $now;
    @file_put_contents($path, json_encode(['failures' => $failures]), LOCK_EX);
}

function nexus_brand_throttle_clear(string $key): void
{
    $path = nexus_brand_throttle_path($key);
    if (is_file($path)) {
        @unlink($path);
    }
}
