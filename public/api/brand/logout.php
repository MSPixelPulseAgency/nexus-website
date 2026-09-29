<?php
/** POST /api/brand/logout.php — end the brand-asset access session. */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    nexus_brand_json(405, ['ok' => false, 'error' => 'method_not_allowed']);
}
nexus_brand_require_same_origin();
nexus_brand_clear_cookie();
nexus_brand_json(200, ['ok' => true, 'authorized' => false]);
