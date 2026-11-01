<?php
/** Trusted server operator only. Never expose this file through a web server. */
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/src/Payments.php';
use Nexus\Payments\Payments;
use Nexus\Payments\StripeGateway;

try {
    $file = getenv('NEXUS_PAYMENT_CONFIG_FILE');
    if (!$file || !is_file($file)) throw new RuntimeException('Set NEXUS_PAYMENT_CONFIG_FILE to the private server config.');
    $config = require $file;
    $payments = new Payments($config, new StripeGateway($config['secret_key'] ?: 'sk_test_unconfigured'));
    if (($argv[1] ?? '') === 'issue' && count($argv) >= 5) {
        $output = $argv[3];
        $linkDir = $config['state_dir'] . '/links';
        if (!is_dir($linkDir) && !mkdir($linkDir, 0700, true) && !is_dir($linkDir)) throw new RuntimeException('Private link directory unavailable.');
        if (!str_starts_with($output, '/') || realpath(dirname($output)) !== realpath($linkDir)) throw new RuntimeException('Save links only inside the private state links directory.');
        // Exclusive file creation prevents accidental overwrites; links are bearer credentials.
        umask(0077);
        $handle = fopen($output, 'x');
        if ($handle === false) throw new RuntimeException('Choose a new private output file.');
        $payments->db->beginTransaction();
        try {
            $request = $payments->issue($argv[2], array_slice($argv, 4), time());
            $contents = $request['link'] . PHP_EOL;
            if (fwrite($handle, $contents) !== strlen($contents) || !fflush($handle)) throw new RuntimeException('Private link could not be saved.');
            $payments->db->commit();
        } catch (Throwable $error) {
            if ($payments->db->inTransaction()) $payments->db->rollBack();
            unlink($output);
            throw $error;
        } finally {
            fclose($handle);
        }
        echo "Payment link written to the private output file. No message has been sent.\n";
    } elseif (($argv[1] ?? '') === 'report') {
        // Deliberately excludes tokens, Checkout URLs and personal information.
        $query = $payments->db->query('SELECT enrollment_ref, status, amount, currency, created, paid_at FROM requests ORDER BY created DESC LIMIT 100');
        echo json_encode($query->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR), PHP_EOL;
    } else {
        echo "Usage: php manage.php issue REFERENCE /absolute/private/link.txt COURSE [COURSE...]\n";
        echo "       php manage.php report\n";
        exit(1);
    }
} catch (Throwable $error) {
    // Config/SDK exceptions could include secrets; do not print their messages.
    fwrite(STDERR, "Payment administration failed. Check approved pricing and private configuration; no credentials were printed.\n");
    exit(1);
}
