# Nexus Stripe integration and handover

## Current status — 2026-11-01

- Nexus Education Private School is the merchant. MSPixelPulse is the temporary technical administrator, never a substitute legal merchant or owner.
- The existing merchant account was retained. Its associated Nexus sandbox and the technical sign-in `admin@mspixelpulse.com` were verified in Dashboard. Stripe did not display an explicit email-verification indicator; email verification is unconfirmed.
- The welcome flow accepted the Nexus display name, Canada, `https://nexuseps.com` and a private secondary-education description with one-time tuition payments. Optional invoicing and tax products were deselected. This is not legal/KYC verification.
- The user explicitly requested **CAD 499.00 for every course**, displayed as **CA$499 / course**, and authorized sandbox verification. All 207 catalogue entries now use this amount on this review branch. Production prices have not been deployed. Tax treatment, additional fees, availability, refunds and live collection still require management confirmation.
- Two real Stripe sandbox Checkout payments at CAD 499.00 were confirmed: MHF4U and a subsequent ENG4U cancellation/decline/3D Secure retry. Each signed `checkout.session.completed` webhook returned HTTP 200; private state and browser receipts showed paid. No real funds moved.
- An existing sandbox key was used for the Nexus account check, session creation and local Stripe CLI forwarding. Test credentials were held in runtime memory, never placed in source, frontend, command arguments or configuration files. No new key, live credential or permanent Dashboard webhook destination was created.
- Checkout preparation remains on a draft review branch. No merge, Cloudways production deployment, live activation or Moodle changes were performed.
- Registration now displays course tuition and links the selected cart to sandbox payment, with a return link from the receipt. Student/guardian delivery remains disabled pending an approved school destination and privacy/retention arrangements. Payment does not complete registration.

## Payment and enrollment flow

`src/data/tuition.json` is the shared tuition source in integer CAD cents. The build generates the private `server/payments/catalog-prices.json` from the same 207-course catalogue. Deploy both the public build and matching private application; never accept a browser-provided amount, label or eligibility claim.

### Sandbox self-service cart

Cart → registration (optional preparation) → `/checkout?cart=1` → Stripe-hosted Checkout → signed webhook → confirmed test receipt.

`cart.php` accepts only a JSON list of 1–12 distinct course codes. The server validates catalogue membership and looks up its configured prices. Same-origin JSON checks, private HttpOnly/SameSite cookies, IP rate limits and per-session cart fingerprints prevent tampering and reuse the same request for repeated clicks. A repeat of a paid cart shows the existing paid request; it never silently charges again. Changing course order does not create a new request. Courses in local storage are normalized against the current catalogue on load.

Self-service requires both `enabled=true` and `cart_enabled=true`, and is hard-disabled outside `mode=test`. Do not remove the live guard as part of deployment. Live self-service needs a separately approved enrollment/availability, privacy, fee/tax and refund workflow.

Only course identifiers, tuition and opaque references enter the payment service. No student, guardian or academic fields enter Stripe metadata. Stripe-hosted Checkout collects the synthetic test payer/card details. Do not use real student or payment data in sandbox testing.

### Operator-issued requests

The existing private CLI flow is also retained: a trusted school operator reviews availability/eligibility and issues a request with approved codes and a non-personal reference. A high-entropy fragment token exchanges for an HttpOnly access cookie; the page removes the token from the visible URL. The CLI saves confidential links privately rather than printing or emailing them.

Stripe now manages eligible methods through Dashboard settings; the integration omits the removed `payment_method_types` parameter. Before live collection, management must review allowed methods, including any default financing options. No subscriptions or automatic Moodle access are implemented. The Checkout request uses the `nexus-checkout-v2-` idempotency namespace; this is a pre-release change, not a migration of an operating production payment service. Never change this namespace for deployed/in-flight requests without reconciliation.

## Runtime and private installation

- `server/payments/`: private app, Composer lockfile, config example, operator CLI and tests.
- `public/api/payments/`: availability, token exchange, quote, Checkout and webhook endpoints.
- `/checkout`, `/payment/success`, `/payment/cancel`: responsive, noindex payment pages in the existing design.
- Private SQLite stores transactional records with unique event, session and reference constraints. Requires a single persistent Cloudways app, PHP 8.1+, cURL and PDO SQLite. Verify these on the actual host before release.
- Production remains Cloudways (Apache/PHP), canonical `https://nexuseps.com/`. The existing `nexuseps` Vercel project is static continuity/preview only. Vercel redirects payment API requests to an unavailable response; it does **not** run the PHP service.

Install the reviewed private app outside the document root:

```text
applications/<app>/private_html/nexus-payments/
applications/<app>/private_html/nexus-payments-config.php
applications/<app>/private_html/nexus-payment-state/
applications/<app>/public_html/api/payments/
```

Run `composer install --no-dev --prefer-dist --no-interaction` in the private app. Copy `config.example.php` into the separate private config and set its absolute `state_dir`. Do not deploy the example unchanged. Restrict config files to 0600 and state directories to 0700, owned by the app user. Confirm HTTPS cannot retrieve config, SQLite, journals, sessions or backups. Exclude payment endpoints from all page/CDN caches. Never upload private app/config/state to `dist` or Vercel.

The default Cloudways locations above are discovered automatically. Alternatively configure these **server-only** variables:

| Variable | Purpose |
| --- | --- |
| `NEXUS_PAYMENT_APP_DIR` | Absolute private application directory |
| `NEXUS_PAYMENT_CONFIG_FILE` | Absolute private PHP config file |
| `NEXUS_STRIPE_SECRET_KEY` | Nexus sandbox/restricted server API key |
| `NEXUS_STRIPE_WEBHOOK_SECRET` | Signing secret for this environment/destination |

Use the host's secret manager/environment editor. Never put secret values in chat, tickets, command arguments, Git or `VITE_*` variables. No publishable key is required for hosted Checkout redirects. Scope the key to current-account read and Checkout Session creation/retrieval, verifying required permissions in the sandbox; avoid payouts, transfers, refunds and account administration. The SDK pins an API version; keep the Dashboard snapshot event version compatible and test upgrades.

Private config requirements:

- Start with `enabled=false`, `cart_enabled=false`, `mode=test`, `live_approved=false`, `pricing_approved=false`. Enable cart only in a verified sandbox.
- `base_url`: exact staging HTTPS origin without trailing slash; `allow_local_http=false` on hosted systems.
- `expected_account_id`: independently confirm Nexus's account. The credential's account is checked before creating/reconciling sessions.
- `prices`: the generated catalogue map supplies CAD 499.00 per course for this user-requested sandbox flow. Catalogue membership is not confirmation of course availability or student eligibility. Operator requests may use a narrower reviewed price map.
- Production entries must be final **tax-inclusive totals approved by management**. This implementation does not calculate taxes, fees or eligibility. Keep live mode disabled while those are unresolved.

## Stripe sandbox acceptance

1. Reach the existing test Dashboard. Confirm the technical login. Nexus's public display name and Canada are not proof of legal entity, registration or address. Stop at agreements, KYC, ownership and banking for the authorized owner.
2. Securely configure Nexus test credentials on an approved staging host. Local account verification, session creation and signed CLI forwarding have passed; persistent staging configuration remains outstanding.
3. Deploy the reviewed private app and public build to an **approved HTTPS staging application**. A static Vercel preview checks UI only. No Cloudways staging app was created in this task.
4. In Stripe Workbench, create a **sandbox snapshot webhook destination for this account** at `https://<approved-staging-origin>/api/payments/webhook.php`. Select `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`. Store its signing secret server-side. Never register the unready production endpoint.
5. Alternatively, Stripe CLI can forward events to `http://127.0.0.1:8787/api/payments/webhook.php`. Its listener signing secret differs from a Dashboard destination secret; use the matching secret.
6. After sandbox config is verified, enable staging only. Issue a synthetic request with its confidential link saved directly to a private file:

```bash
NEXUS_PAYMENT_CONFIG_FILE=/absolute/private/config.php \
  php server/payments/manage.php issue TEST-REVIEW-001 /absolute/private/state/links/test.txt MHF4U
```

The output file must be inside the configured `state_dir/links/` directory (created privately by the CLI). The link is never printed. No email is sent. Share real links only through the school's approved process. Requests expire in 48 hours; Checkout expires about 31 minutes after its first attempt. Retries reuse the same Session/idempotency key, including identical parameters after network failure. Expired sessions require operator reconciliation and a new approved request/reference. Check for an already-successful payment before issuing replacements.

7. Use synthetic adult payer data and Stripe's official test payment details. Verify CA$499 and two-course CA$998 totals, successful card, decline/retry, authentication, cancellation/back, browser closure before return, duplicate events, webhook retry, late events, bad signature, wrong amount/currency, incorrect merchant account and checkout pause. Verify success-page navigation cannot forge payment. Check mobile/keyboard use.
8. Compare Stripe Dashboard with the private report:

```bash
NEXUS_PAYMENT_CONFIG_FILE=/absolute/private/config.php \
  php server/payments/manage.php report
```

Keep refunds, disputes and chargebacks in Stripe and the school's existing reconciliation process. `paid` here records successful collection, not a refund/dispute ledger. Monitor webhook 5xx responses/delivery retries through the approved operations process before launch.

## Local checks and privacy

```bash
npm run lint
npm run build
composer install --working-dir=server/payments
composer test --working-dir=server/payments
git diff --check
```

The tests use local fixtures and never contact Stripe. Build first: HTTP tests exercise built PHP endpoints. For a local browser session:

```bash
NEXUS_PAYMENT_APP_DIR=/absolute/repo/server/payments \
NEXUS_PAYMENT_CONFIG_FILE=/absolute/private/config.php \
php -S 127.0.0.1:8787 -t dist scripts/local-php-server.php
```

Webhooks verify the raw-body signature and environment, retrieve the latest Session, reconcile account/session/reference/currency/total, and atomically record status/event. Duplicate delivery is safe; late events cannot downgrade `paid`. Return/cancel URLs never mutate payment state. Pausing new checkout leaves webhooks and existing receipts available.

Private state stores references, course codes/labels, amounts, Stripe Session ID, status/timestamps, hashed access tokens and short-lived rate-limit entries. No raw events, payer/card details or student records are stored. Stripe handles payer information; Nexus must approve privacy wording/consent, retention, access, encrypted backups and incident handling before live use. PHP sessions expire in two hours and require host garbage collection. Financial retention/cleanup requires management policy; do not arbitrarily delete records.

Test/live databases and session cookies are isolated automatically. Do not copy sandbox state into the live database. Authorization attempts are limited by client address; quote/Checkout budgets are scoped to the authorized request so receipt polling does not block other payers on a shared network.

Checkout and return-page reads are bound to the displayed opaque request ID as well as the access cookie. Opening a second request in another tab cannot silently pay or display the other request.

## Verification evidence

- Frontend lint/build and strict Composer validation pass; Composer audit reports no known advisories.
- 42 local payment/signature/cart-mode checks, 44 HTTP/cookie/operator/cart checks and 10 read-only deployment preflight checks pass. The pricing check independently validates all 207 frontend/server entries and the public/private release fingerprint. No external Stripe requests or real charges are made by these suites.
- Browser: synthetic CA$499 request rendered; token removed from URL; keyboard navigation verified; no browser errors observed. No horizontal overflow at 320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280, 1440, 1728 and 1920 pixels.
- Direct success-page navigation shows waiting for confirmation, never a forged paid state. Payment routes have noindex metadata; success/cancel are excluded from the sitemap.
- The enrollment reminder is suppressed on payment pages; existing styling and cart/enrollment data remain intact.
- The catalogue still contains 207 courses and the sitemap still contains 582 URLs.
- **External sandbox acceptance:** an actual Nexus sandbox session and successful test card payment passed with signed CLI webhook forwarding and a server-confirmed receipt. Cancellation/back reused the same Stripe session; an official decline card displayed its error without marking the request paid, then a 3D Secure test card completed the simulated challenge and the same session reconciled as paid through a signed webhook returning HTTP 200. The two-course cart displayed CA$998. A permanent HTTPS staging destination, authenticated Cloudways runtime/storage/cache verification and live readiness remain outstanding. Sandbox success is not production approval.

## Disabled release preparation — continuation verification

`npm run test:pricing` runs after the build. `public/tuition-manifest.json` contains a public, non-sensitive SHA-256 fingerprint of the generated private catalogue so a mixed public/private release can be detected. Catalogue labels, course count and all integer CAD amounts are checked against the authoritative source. The cart, registration and receipt use one display formatter; unavailable checkout shows a school-contact handoff rather than an unconditional sandbox link.

The copied-config catalogue path has been corrected for the documented sibling layout. Read-only preparation checks can be run on an approved host without contacting Stripe or creating a database:

```bash
php /absolute/private/nexus-payments/preflight.php \
  --config=/absolute/private/nexus-payments-config.php \
  --document-root=/absolute/public_html
```

The state directory must already exist privately with mode 0700 and config must have no group/world permissions (normally 0600). The command verifies PHP/cURL/PDO SQLite, private placement, disabled checkout, HTTPS config, public endpoints, and matching public/private catalogue and config. It returns nonzero on any failed check. Its `liveLaunchApproved` value is always false: an offline preflight cannot authorize launch or prove real HTTPS/cache/webhook behavior.

From a clean committed checkout, prepare an archive outside the repo:

```bash
npm run package:payments -- /absolute/new/release-directory
```

The packager builds, verifies pricing, runs payment/preflight suites and keeps `public_html/` separate from `private_html/nexus-payments/`. It moves prerendered HTML into the Cloudways `.routes/` store, validates noindex payment pages and checks public files for private payment material. It includes a source-commit/file-hash manifest and disabled installation instructions. No secrets, active config, SQLite state or deployment credentials are included. It never connects to a host, uploads files, merges a branch, changes a live setting or deploys production. Keep it as a review artifact until host/staging and management requirements are satisfied.

Current public-host checks: HTTPS returned Nginx headers, and the existing PHP brand session endpoint returned JSON with private/no-store caching. The production payment config endpoint returned HTTP 404. These observations confirm PHP service and the absence of this payment installation; they do not independently authenticate the Cloudways app, SSH/SFTP access, runtime extensions or cache settings. No Nexus/Cloudways SSH profile was configured locally. Do not infer hosting eligibility, deploy, or change routing from these checks.

## What management must provide or complete

- Verified legal entity/name/type, registered address, business/tax registration and school billing identity from authoritative documents.
- Authorized representative personally completes identity/KYC, beneficial owners/controllers, requested documents and agreements. Never substitute MSPixelPulse identity.
- School payout bank details, entered directly into Stripe by management. Do not send banking or ID documents in chat.
- Official owner's email and account control. Management handles invitations/ownership transfer, confirms acceptance and assigns only the agreed technical role to MSPixelPulse. No invitations or ownership transfer were performed here.
- The user confirmed catalogue tuition of CAD 499.00 for every course. Management must still confirm availability/eligibility, tax treatment, extra fees, refund/cancellation terms, statement descriptor, support details and receipt arrangements before live collection.
- Approve privacy/retention, review staging evidence, then explicitly authorize production deployment and live payments.

## Production rollout — approval required

Do not merge into main, deploy production or accept real payments during preparation. After management completes the checklist and explicit approval is recorded:

1. Back up the public site/private configuration separately from Moodle. Validate staging on the same PHP/runtime/storage setup. Record a known-good rollback artifact and private DB backup outside Git.
2. Install the reviewed private app/lockfile on the existing Cloudways app. Configure **separate Nexus live credentials and live webhook** only after management activates the account. Set `base_url=https://nexuseps.com`, local HTTP off, final approved prices and verified account ID. Both pricing/live approval flags must explicitly be true for live mode.
3. Deploy the reviewed public build, verify APIs/direct routes/cache exclusions/private-file protection/webhook delivery, and retain `enabled=false` until final go-live approval.
4. Enable checkout only after authorization. A real charge/refund requires separately authorized financial testing. Match the first authorized payment with Stripe and the school record.

Rollback/pause: set `enabled=false` to block new access/Checkout; **keep webhooks, database and private configuration running** to reconcile already-issued sessions. Restore known-good public assets if needed. Existing Stripe Checkout sessions remain usable until expiry: a website pause does not revoke them. Only management-authorized action may expire outstanding Stripe sessions. Never overwrite payment state with an older website release, remove the webhook as a rollback shortcut, or alter Moodle.

Official references: [Checkout API](https://docs.stripe.com/api/checkout/sessions/create), [fulfillment/idempotency](https://docs.stripe.com/checkout/fulfillment.md?ui=full-page), [webhooks](https://docs.stripe.com/webhooks), [key security](https://docs.stripe.com/keys-best-practices).
