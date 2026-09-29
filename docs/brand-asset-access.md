# Brand Guidelines page and protected brand-asset downloads

Route: `/brand-guidelines` (`src/pages/BrandGuidelinesPage.jsx`, data in `src/data/brand.js`,
styles in `src/styles/brand-guidelines.css`). The guidelines are public; the download files are
protected server side.

## How protection works

1. The visitor submits the access password to `POST /api/brand/unlock.php` (JSON, same-origin only).
2. PHP verifies it with `password_verify()` against a bcrypt hash that lives outside the web root.
   Failures are throttled (8 per 15 minutes per client) and answered with an accessible inline error.
3. On success the server sets an `HttpOnly`, `SameSite=Strict`, `Secure` (on HTTPS) cookie scoped to
   `/api/brand/` containing an HMAC-SHA256 signed token that expires after 2 hours.
4. `GET /api/brand/download.php?file=<key>` checks the token and streams the file from the private
   directory with `Content-Disposition: attachment`, `Cache-Control: no-store` and `X-Robots-Tag: noindex`.
   Only keys in the `NEXUS_BRAND_FILES` allowlist (`public/api/brand/_bootstrap.php`) are served.
5. `GET /api/brand/session.php` lets the page restore the unlocked state after a refresh;
   `POST /api/brand/logout.php` clears the cookie.

The password never appears in the client bundle, HTML, JSON, environment files or Git. The protected
files never sit inside the web root, so there is no public URL to guess.

## Files

| Path | Purpose |
| --- | --- |
| `public/api/brand/*.php` | Endpoints shipped with `dist/` (no secrets inside) |
| `server/brand-private/` | Download files; deploy to `private_html/nexus-brand-private/` (outside the web root) |
| `server/nexus-brand-access.example.php` | Shape of the secret config file |
| `scripts/brand-access-config.php` | Generates the real config (bcrypt hash + random session secret) |
| `scripts/local-php-server.php` | Router for local testing with PHP's built-in server |
| `public/brand/guidelines/*.svg` | Optimised previews used by the page (public, unprotected) |
| `../Nexus-Brand-Kit-Claude/` | Master brand kit (source of every asset above) |

## Configuration on the Cloudways host

```bash
# 1. Generate the config locally (prompts for the password, or use NEXUS_BRAND_PASSWORD=...)
php scripts/brand-access-config.php server/private/nexus-brand-access.php \
  /home/master/applications/<app>/private_html/nexus-brand-private

# 2. Upload
#    dist/                      -> public_html/            (as with every release)
#    dist/<route>.html files    -> .routes/                (existing prerender convention)
#    server/brand-private/*     -> private_html/nexus-brand-private/
#    server/private/nexus-brand-access.php -> private_html/nexus-brand-access.php
```

`_bootstrap.php` looks for the config at `<parent of DOCUMENT_ROOT>/private_html/nexus-brand-access.php`.
Alternatives: set `NEXUS_BRAND_CONFIG_FILE`, or set `NEXUS_BRAND_ACCESS_HASH`, `NEXUS_BRAND_SESSION_SECRET`
and `NEXUS_BRAND_PRIVATE_DIR` as environment variables (they take precedence over the file).

Until the config and private files exist on the server, the page shows a "downloads temporarily
unavailable" state and every download request returns 503/401. On the Vercel system domain the PHP
paths redirect to `/brand-guidelines` (see `vercel.json`), so no PHP source is served there.

## Local testing

```bash
npm run build
NEXUS_BRAND_PASSWORD='<password>' php scripts/brand-access-config.php   # writes server/private/ (git-ignored)
NEXUS_BRAND_CONFIG_FILE="$PWD/server/private/nexus-brand-access.php" \
  php -S 127.0.0.1:8787 -t dist scripts/local-php-server.php
# open http://127.0.0.1:8787/brand-guidelines
```

`vite dev` proxies `/api/brand` to that PHP server (see `vite.config.js`).

## Rotating the password

Run `scripts/brand-access-config.php` again and replace `private_html/nexus-brand-access.php`.
A new session secret is generated each time, which invalidates every existing access cookie.
