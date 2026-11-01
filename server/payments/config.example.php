<?php
// EXAMPLE ONLY. Install outside public_html; never put real secrets in this file.
return [
    'enabled' => false,
    'mode' => 'test',
    'live_approved' => false,
    'pricing_approved' => false,
    'base_url' => 'http://127.0.0.1:8787',
    'allow_local_http' => true, // false on every hosted environment
    'expected_account_id' => '', // Confirm Nexus's account in Stripe, not the agency's.
    'secret_key' => getenv('NEXUS_STRIPE_SECRET_KEY') ?: '',
    'webhook_secret' => getenv('NEXUS_STRIPE_WEBHOOK_SECRET') ?: '',
    'state_dir' => __DIR__ . '/private/state',
    // Provisional amount supplied by the user: CA$499 per course. For TESTS ONLY
    // until management confirms taxes, fees, pricing differences and refunds.
    // Add only courses approved for this payment request, for example:
    // 'MHF4U' => ['amount' => 49900, 'label' => 'Advanced Functions'],
    // Production entries must be management-approved tax-inclusive CAD totals.
    'prices' => [],
];
