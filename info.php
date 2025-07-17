<?php
$allowed_ip = '213.5.192.251'; // your real IP

function getRealIp() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return $_SERVER['HTTP_CF_CONNECTING_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

$visitorIp = getRealIp();

if ($visitorIp === $allowed_ip) {
    phpinfo();
} else {
    http_response_code(403);
    echo "Access denied";
}
?>
