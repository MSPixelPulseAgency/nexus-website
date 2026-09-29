<?php
/**
 * Router for PHP's built-in server so the production build (dist/) and the PHP brand
 * endpoints can be exercised locally, mirroring the Cloudways Apache rules:
 *
 *   npm run build
 *   NEXUS_BRAND_CONFIG_FILE=server/private/nexus-brand-access.php \
 *     php -S 127.0.0.1:8787 -t dist scripts/local-php-server.php
 */
declare(strict_types=1);

$dist = dirname(__DIR__) . '/dist';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = rawurldecode($path);
$file = realpath($dist . $path);

if ($file !== false && str_starts_with($file, $dist . DIRECTORY_SEPARATOR) && is_file($file)) {
    if (str_ends_with($file, '.php')) {
        $_SERVER['DOCUMENT_ROOT'] = $dist;
        require $file;
        return true;
    }
    return false; // let the built-in server stream the static asset
}
// Prerendered route metadata (served from .routes/ on Cloudways, generated beside dist here).
$routeHtml = realpath($dist . rtrim($path, '/') . '.html');
if ($routeHtml !== false && str_starts_with($routeHtml, $dist . DIRECTORY_SEPARATOR) && is_file($routeHtml)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($routeHtml);
    return true;
}
header('Content-Type: text/html; charset=utf-8');
readfile($dist . '/index.html');
return true;
