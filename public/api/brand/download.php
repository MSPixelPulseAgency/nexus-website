<?php
/**
 * GET /api/brand/download.php?file=<key> — stream a protected brand asset.
 * The file is only sent when the request carries a valid, unexpired access cookie.
 * Files live outside the web root, so there is no public URL to bypass this check.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)) {
    header('Allow: GET, HEAD');
    nexus_brand_json(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$config = nexus_brand_config();
if ($config === null) {
    nexus_brand_json(503, ['ok' => false, 'error' => 'not_configured']);
}

$key = isset($_GET['file']) && is_string($_GET['file']) ? $_GET['file'] : '';
if (!preg_match('/^[a-z0-9-]{1,64}$/', $key) || !isset(NEXUS_BRAND_FILES[$key])) {
    nexus_brand_json(404, ['ok' => false, 'error' => 'unknown_file']);
}

if (nexus_brand_session_expiry($config) === null) {
    nexus_brand_json(401, ['ok' => false, 'error' => 'unauthorized', 'message' => 'Enter the access password to download brand assets.']);
}

$entry = NEXUS_BRAND_FILES[$key];
$path = realpath($config['private_dir'] . '/' . $entry['file']);
if ($path === false || !is_file($path) || !str_starts_with($path, $config['private_dir'] . DIRECTORY_SEPARATOR) || !is_readable($path)) {
    nexus_brand_json(404, ['ok' => false, 'error' => 'file_missing']);
}

$size = filesize($path);
http_response_code(200);
nexus_brand_send_security_headers();
header('Content-Type: ' . $entry['type']);
header('Content-Length: ' . $size);
header('Content-Disposition: attachment; filename="' . $entry['file'] . '"');
header('Accept-Ranges: none');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') {
    exit;
}
if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', '1');
}
@ini_set('zlib.output_compression', '0');
while (ob_get_level() > 0) {
    ob_end_clean();
}
$handle = fopen($path, 'rb');
if ($handle === false) {
    nexus_brand_json(500, ['ok' => false, 'error' => 'read_failed']);
}
fpassthru($handle);
fclose($handle);
exit;
