<?php
// EXAMPLE ONLY. Install outside public_html; never put real secrets in this file.
return [
    'enabled' => false,
    'cart_enabled' => false, // Enable only in a configured Nexus sandbox.
    'mode' => 'test',
    'live_approved' => false,
    'pricing_approved' => false,
    'base_url' => 'http://127.0.0.1:8787',
    'allow_local_http' => true, // false on every hosted environment
    'expected_account_id' => '', // Confirm Nexus's account in Stripe, not the agency's.
    'secret_key' => getenv('NEXUS_STRIPE_SECRET_KEY') ?: '',
    'webhook_secret' => getenv('NEXUS_STRIPE_WEBHOOK_SECRET') ?: '',
    'state_dir' => __DIR__ . '/private/state',
    // User-requested catalogue tuition: CA$499 for every course. Generated at build.
    // Live collection still requires management-approved tax treatment and terms.
    'prices' => json_decode(file_get_contents(__DIR__ . '/catalog-prices.json'), true, 512, JSON_THROW_ON_ERROR),
];
