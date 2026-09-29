<?php
/**
 * Nexus brand-asset access configuration — EXAMPLE ONLY.
 *
 * Copy this file to the production server OUTSIDE the web root, for example
 *   applications/<app>/private_html/nexus-brand-access.php   (Cloudways)
 * or point NEXUS_BRAND_CONFIG_FILE at another location. Never commit the real file.
 * Generate the values with:  php scripts/brand-access-config.php
 */
return [
    // Output of password_hash('<the access password>', PASSWORD_BCRYPT)
    'password_hash' => '$2y$12$replace-with-generated-hash',
    // At least 32 random bytes, base64/hex encoded. Signs the short-lived access cookie.
    'session_secret' => 'replace-with-64-random-hex-characters',
    // Absolute path to the folder that holds the protected download files
    // (contents of server/brand-private/ from this repository).
    'private_dir' => '/home/master/applications/<app>/private_html/nexus-brand-private',
];
