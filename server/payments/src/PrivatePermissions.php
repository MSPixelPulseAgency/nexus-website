<?php
declare(strict_types=1);
namespace Nexus\Payments;

// Cloudways deploys as its master user but PHP runs as the application user.
// Accept a narrowly scoped POSIX ACL only when that runtime user is explicit.
final class PrivatePermissions
{
    public static function aclAllows(string $acl, int $owner, int $operator, int $runtime, bool $directory): bool
    {
        $entries = [];
        foreach (preg_split('/\R/', trim($acl)) as $line) {
            if ($line === '' || str_starts_with($line, '#')) continue;
            $line = trim(explode('#', $line)[0]);
            if (!preg_match('/^(default:)?(user|group|mask|other):([0-9]*):([r-][w-][x-])$/D', $line, $m)) return false;
            [, $default, $type, $id, $permissions] = $m;
            if (($type === 'group' || $type === 'other') && $permissions !== '---') return false;
            if ($type === 'user' && $id !== '' && !in_array((int) $id, [$owner, $operator, $runtime], true)) return false;
            if (!$default) $entries[$type . ':' . $id] = $permissions;
        }
        if (!isset($entries['user:'], $entries['group:'], $entries['other:'])) return false;
        $permissions = $runtime === $owner ? $entries['user:'] : ($entries['user:' . $runtime] ?? '---');
        $mask = $runtime === $owner ? 'rwx' : ($entries['mask:'] ?? '---');
        if ($directory) return $permissions === 'rwx' && $mask === 'rwx';
        return $permissions[0] === 'r' && $mask[0] === 'r'
            && ($runtime === $owner || $permissions[1] !== 'w' || $mask[1] !== 'w');
    }

    public static function check(string $path, ?int $runtime, bool $directory): bool
    {
        if (!file_exists($path)) return false;
        $mode = fileperms($path);
        if ($runtime === null) return ($mode & 0077) === 0;
        $owner = fileowner($path);
        if ($owner === $runtime && ($mode & 0077) === 0) return ($mode & ($directory ? 0700 : 0400)) === ($directory ? 0700 : 0400);
        if (!function_exists('posix_geteuid')) return false;
        $process = proc_open(['getfacl', '-cpn', '--', $path], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
        if (!is_resource($process)) return false;
        $acl = stream_get_contents($pipes[1]);
        fclose($pipes[1]); fclose($pipes[2]);
        return proc_close($process) === 0 && self::aclAllows($acl, $owner, posix_geteuid(), $runtime, $directory);
    }
}
