<?php
require __DIR__ . '/_bootstrap.php';
payment_method('GET');
payment_json(200, ['enabled' => ($paymentConfig['enabled'] ?? false) === true, 'mode' => $paymentConfig['mode']]);
