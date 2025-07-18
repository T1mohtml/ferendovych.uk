<?php
// CONFIG
$webhook_url = "https://discord.com/api/webhooks/1395837361161764995/Poez5LdWDO0bHYZiSMz_HmoHlqm-dkEXy5CJkUWwvCZW330Mqh0BdKAfJw6XB61F0ZKU";

// GATHER INFO
$ip = $_SERVER['REMOTE_ADDR'];
$uri = $_SERVER['REQUEST_URI'];
$useragent = $_SERVER['HTTP_USER_AGENT'];
$timestamp = date("Y-m-d H:i:s");

// FORMAT EMBED
$embed = [
    "title" => "New Visitor 👀",
    "color" => 0x3498db,
    "fields" => [
        ["name" => "🌍 IP", "value" => $ip, "inline" => true],
        ["name" => "📄 Page", "value" => $uri, "inline" => true],
        ["name" => "🕒 Time (UTC)", "value" => $timestamp],
        ["name" => "🧠 User-Agent", "value" => $useragent]
    ]
];

$data = [
    "username" => "LoggerBot",
    "embeds" => [$embed]
];

// SEND TO DISCORD
$options = [
    "http" => [
        "header"  => "Content-Type: application/json",
        "method"  => "POST",
        "content" => json_encode($data)
    ]
];

$context = stream_context_create($options);
file_get_contents($webhook_url, false, $context);

// OPTIONAL: sleep 200ms to throttle (optional if naturally below 5/sec)
usleep(200000); // 200ms
?>
