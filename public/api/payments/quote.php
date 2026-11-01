<?php
require __DIR__ . '/_bootstrap.php';
payment_method('GET');
$id = payment_access();
if (isset($_GET['request']) && (!is_string($_GET['request']) || !hash_equals($id, $_GET['request']))) {
    throw new Nexus\Payments\PaymentError(409, 'A different payment request is open in this browser. Reopen your original Nexus payment link.');
}
payment_throttle(120, 'quote|' . $id);
payment_json(200, $payments->quote($id));
