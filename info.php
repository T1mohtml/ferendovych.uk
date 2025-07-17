<?php
$allowed_ip = '100.88.59.37'; // Replace with your actual IP

if ($_SERVER['REMOTE_ADDR'] === $allowed_ip) {
    phpinfo();
} else {
    echo "Access denied";
    http_response_code(403);
}
