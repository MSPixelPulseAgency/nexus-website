<?php
require __DIR__ . '/_bootstrap.php';
$body = payment_input();
// Totals, course codes, email addresses and student records are never accepted here.
if (count($body) !== 1 || !is_string($body['requestId'] ?? null)) throw new Nexus\Payments\PaymentError(400, 'Unexpected checkout fields.');
$id = payment_access();
if (!hash_equals($id, $body['requestId'])) throw new Nexus\Payments\PaymentError(409, 'A different payment request is open in this browser. Refresh and review your payment before continuing.');
payment_throttle(20, 'checkout|' . $id);
payment_json(200, ['url' => $payments->checkout($id, time())]);
