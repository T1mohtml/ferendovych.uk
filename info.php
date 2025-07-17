<?php
// Load .env file — make sure path is correct
$env = parse_ini_file(__DIR__ . '/.env.ini'); // or .env if you format it like ini

// Get credentials from env
$valid_user = $env['AUTH_USER'] ?? 'admin';
$valid_pass = $env['AUTH_PASS'] ?? 'password';

// Check HTTP Basic Auth headers
if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) ||
    $_SERVER['PHP_AUTH_USER'] !== $valid_user ||
    $_SERVER['PHP_AUTH_PW'] !== $valid_pass) {

    header('WWW-Authenticate: Basic realm="Restricted Area"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Authentication required.';
    exit;
}

// If passed auth, show phpinfo
phpinfo();
?>
