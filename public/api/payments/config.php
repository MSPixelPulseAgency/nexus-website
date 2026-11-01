<?php
require __DIR__ . '/_bootstrap.php';
payment_method('GET');
payment_json(200, [
    'enabled' => ($paymentConfig['enabled'] ?? false) === true,
    'cartEnabled' => ($paymentConfig['cart_enabled'] ?? false) === true && $paymentConfig['mode'] === 'test',
    'mode' => $paymentConfig['mode'],
]);
