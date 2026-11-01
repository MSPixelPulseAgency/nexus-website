<?php
require __DIR__ . '/_bootstrap.php';
$body = payment_input();
// Only catalogue identifiers cross this boundary; never student records or prices.
if (count($body) !== 1 || !is_array($body['codes'] ?? null) || !array_is_list($body['codes'])) {
    throw new Nexus\Payments\PaymentError(400, 'Choose courses from the Nexus catalogue.');
}
$payments->requireCartEnabled();
payment_throttle(20, 'cart');
$codes = $body['codes'];
$payments->validateCodes($codes);
sort($codes, SORT_STRING);
$fingerprint = hash('sha256', json_encode($codes, JSON_THROW_ON_ERROR));
payment_session();
// The PHP session lock serializes double-clicks. A retry reopens the same request,
// including a paid request, instead of silently collecting a second payment.
$id = $_SESSION['cart_requests'][$fingerprint] ?? null;
if (!is_string($id)) {
    $issued = $payments->issue('CART-' . strtoupper(bin2hex(random_bytes(12))), $codes, time());
    $id = $issued['id'];
    $_SESSION['cart_requests'][$fingerprint] = $id;
}
session_regenerate_id(true);
$_SESSION['payment_request'] = $id;
$_SESSION['payment_access_expires'] = time() + 7200;
session_write_close();
payment_json(200, $payments->quote($id));
