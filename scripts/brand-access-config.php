<?php
/**
 * Generate the server-side configuration for protected brand-asset downloads.
 *
 * Usage:
 *   NEXUS_BRAND_PASSWORD='...' php scripts/brand-access-config.php [output-file] [private-dir]
 *
 * Reads the password from the NEXUS_BRAND_PASSWORD environment variable (or prompts
 * without echo on a TTY), then writes a PHP config file containing a bcrypt hash and a
 * fresh random session secret. The default output path (server/private/) is ignored by Git.
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$output = $argv[1] ?? $root . '/server/private/nexus-brand-access.php';
$privateDir = $argv[2] ?? $root . '/server/brand-private';

$password = getenv('NEXUS_BRAND_PASSWORD');
if ($password === false || $password === '') {
    if (function_exists('posix_isatty') && posix_isatty(STDIN)) {
        fwrite(STDOUT, "Brand asset access password: ");
        shell_exec('stty -echo');
        $password = trim((string) fgets(STDIN));
        shell_exec('stty echo');
        fwrite(STDOUT, "\n");
    } else {
        fwrite(STDERR, "Set NEXUS_BRAND_PASSWORD in the environment (no TTY available for a prompt).\n");
        exit(1);
    }
}
if (strlen($password) < 8) {
    fwrite(STDERR, "Password must be at least 8 characters.\n");
    exit(1);
}

$config = [
    'password_hash' => password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]),
    'session_secret' => bin2hex(random_bytes(32)),
    'private_dir' => rtrim($privateDir, '/'),
];

$body = "<?php\n// Generated " . gmdate('c') . " by scripts/brand-access-config.php — keep OUTSIDE the web root and out of Git.\nreturn " . var_export($config, true) . ";\n";
if (!is_dir(dirname($output))) {
    mkdir(dirname($output), 0700, true);
}
file_put_contents($output, $body, LOCK_EX);
chmod($output, 0600);
fwrite(STDOUT, "Wrote {$output}\n  private_dir = {$config['private_dir']}\n");
