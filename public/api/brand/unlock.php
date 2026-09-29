<?php
/** POST /api/brand/unlock.php — verify the brand-asset password and start a short-lived access session. */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    nexus_brand_json(405, ['ok' => false, 'error' => 'method_not_allowed']);
}
nexus_brand_require_same_origin();

$config = nexus_brand_config();
if ($config === null) {
    nexus_brand_json(503, ['ok' => false, 'error' => 'not_configured', 'message' => 'Brand asset downloads are not available yet. Please contact Nexus for assistance.']);
}

$raw = (string) file_get_contents('php://input');
if (strlen($raw) > 4096) {
    nexus_brand_json(413, ['ok' => false, 'error' => 'payload_too_large']);
}
$body = json_decode($raw, true);
$password = is_array($body) && isset($body['password']) && is_string($body['password']) ? $body['password'] : '';
if ($password === '' || strlen($password) > 256) {
    nexus_brand_json(400, ['ok' => false, 'error' => 'password_required', 'message' => 'Enter the access password to continue.']);
}

$now = time();
$clientKey = nexus_brand_client_key($config['session_secret']);
$wait = nexus_brand_throttle_check($clientKey, $now);
if ($wait > 0) {
    header('Retry-After: ' . $wait);
    nexus_brand_json(429, ['ok' => false, 'error' => 'too_many_attempts', 'retryAfter' => $wait, 'message' => 'Too many attempts. Please wait a few minutes and try again, or contact Nexus for assistance.']);
}

if (!password_verify($password, $config['password_hash'])) {
    nexus_brand_throttle_record_failure($clientKey, $now);
    usleep(300000);
    nexus_brand_json(401, ['ok' => false, 'error' => 'invalid_password', 'message' => 'That password is not correct. Check it and try again, or contact Nexus for access.']);
}

nexus_brand_throttle_clear($clientKey);
$token = nexus_brand_issue_token($config['session_secret'], $now);
nexus_brand_set_cookie($token['token'], $token['expires']);
nexus_brand_json(200, ['ok' => true, 'expiresAt' => $token['expires'], 'ttl' => NEXUS_BRAND_TOKEN_TTL]);
