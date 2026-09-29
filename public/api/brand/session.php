<?php
/** GET /api/brand/session.php — report whether the current browser holds a valid access session. */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)) {
    header('Allow: GET, HEAD');
    nexus_brand_json(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$config = nexus_brand_config();
if ($config === null) {
    nexus_brand_json(200, ['ok' => true, 'configured' => false, 'authorized' => false]);
}
$expires = nexus_brand_session_expiry($config);
if ($expires === null) {
    if (isset($_COOKIE[NEXUS_BRAND_COOKIE])) {
        nexus_brand_clear_cookie();
    }
    nexus_brand_json(200, ['ok' => true, 'configured' => true, 'authorized' => false]);
}
nexus_brand_json(200, ['ok' => true, 'configured' => true, 'authorized' => true, 'expiresAt' => $expires]);
