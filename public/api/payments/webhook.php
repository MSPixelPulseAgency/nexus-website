<?php
require __DIR__ . '/_bootstrap.php';
payment_method('POST');
if (!str_starts_with($paymentConfig['webhook_secret'] ?? '', 'whsec_')) {
    throw new Nexus\Payments\PaymentError(503, 'Webhook configuration is missing.');
}
$raw = file_get_contents('php://input', false, null, 0, 1048577);
if ($raw === false || strlen($raw) > 1048576) throw new Nexus\Payments\PaymentError(413, 'Request too large.');
try {
    $event = Stripe\Webhook::constructEvent($raw, $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '', $paymentConfig['webhook_secret'], 300);
} catch (UnexpectedValueException | Stripe\Exception\SignatureVerificationException) {
    throw new Nexus\Payments\PaymentError(400, 'Invalid webhook signature.');
}
// Webhooks continue reconciling existing payments even when new checkouts are disabled.
$payments->webhook($event->toArray(), time());
payment_json(200, ['received' => true]);
