<?php
$allowed_ips = ['100.88.59.37', '100.66.159.29', '213.5.192.251'];

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

if (in_array($visitorIp, $allowed_ips)) {
    phpinfo();
} else {
    echo "Access denied";
    http_response_code(403);
}
?>
