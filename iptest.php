<?php
include_once ("captain_hook.php");
function getRealIp() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return $_SERVER['HTTP_CF_CONNECTING_IP'];  // Cloudflare sends real IP here
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // Sometimes multiple IPs — take the first one
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

$visitorIp = getRealIp();
echo "Your real IP is: " . $visitorIp;
?>
