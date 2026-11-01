<?php
require __DIR__ . '/_bootstrap.php';
payment_method('GET');
payment_json(200, [
    'enabled' => ($paymentConfig['enabled'] ?? false) === true,
    'cartEnabled' => Nexus\Payments\Payments::cartConfigured($paymentConfig),
    'mode' => $paymentConfig['mode'],
]);
