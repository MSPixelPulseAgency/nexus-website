# Protected brand-asset files

These files are served ONLY through `public/api/brand/download.php` after the access password has been
verified. On the production host they must live OUTSIDE the web root (Cloudways: `private_html/nexus-brand-private/`);
the PHP config's `private_dir` points at that folder. Do not copy this folder into `public_html`.

File names must match the allowlist in `public/api/brand/_bootstrap.php` (`NEXUS_BRAND_FILES`).
The files are exported from the master brand kit (`Nexus-Brand-Kit-Claude/`).
