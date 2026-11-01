<?php
require __DIR__ . '/_bootstrap.php';
$body = payment_input();
$payments->requireEnabled();
payment_throttle(20);
$id = $payments->authorize(is_string($body['token'] ?? null) ? $body['token'] : '', time());
payment_session();
session_regenerate_id(true);
$_SESSION = ['payment_request' => $id, 'payment_access_expires' => time() + 7200];
session_write_close();
payment_json(200, ['ok' => true, 'requestId' => $id]);
