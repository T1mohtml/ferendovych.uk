<?php
// ==== CONFIGURATION ====
$webhook_url = "https://discord.com/api/webhooks/1395837361161764995/Poez5LdWDO0bHYZiSMz_HmoHlqm-dkEXy5CJkUWwvCZW330Mqh0BdKAfJw6XB61F0ZKU";

// ==== GATHER INFO ====
$ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$uri = $_SERVER['REQUEST_URI'] ?? 'Unknown';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$referrer = $_SERVER['HTTP_REFERER'] ?? 'None';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'Unknown';
$acceptLanguage = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? 'Unknown';
$host = $_SERVER['HTTP_HOST'] ?? 'Unknown';
$protocol = $_SERVER['SERVER_PROTOCOL'] ?? 'Unknown';
$serverName = $_SERVER['SERVER_NAME'] ?? 'Unknown';
$serverAddr = $_SERVER['SERVER_ADDR'] ?? 'Unknown';
$serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown';
$connection = $_SERVER['HTTP_CONNECTION'] ?? 'Unknown';
$cacheControl = $_SERVER['HTTP_CACHE_CONTROL'] ?? 'None';
$encoding = $_SERVER['HTTP_ACCEPT_ENCODING'] ?? 'Unknown';
$encoding2 = $_SERVER['HTTP_TE'] ?? 'Unknown'; // Transfer-Encoding

// Timestamp
$timestamp = date("Y-m-d H:i:s");

// === FORMAT EMBED FOR DISCORD ===
$embed = [
    "title" => "New Visitor Info 👀",
    "color" => 0x1abc9c,
    "fields" => [
        ["name" => "🌍 IP Address", "value" => $ip, "inline" => true],
        ["name" => "📄 Requested URI", "value" => $uri, "inline" => true],
        ["name" => "🕒 Time (UTC)", "value" => $timestamp, "inline" => false],
        ["name" => "🧠 User-Agent", "value" => $userAgent, "inline" => false],
        ["name" => "🔗 Referrer", "value" => $referrer, "inline" => false],
        ["name" => "🔧 Request Method", "value" => $requestMethod, "inline" => true],
        ["name" => "🌐 Accept-Language", "value" => $acceptLanguage, "inline" => true],
        ["name" => "🖥 Server Name", "value" => $serverName, "inline" => true],
        ["name" => "🌐 Host Header", "value" => $host, "inline" => true],
        ["name" => "📡 Server IP", "value" => $serverAddr, "inline" => true],
        ["name" => "⚙️ Server Software", "value" => $serverSoftware, "inline" => false],
        ["name" => "📝 Protocol", "value" => $protocol, "inline" => true],
        ["name" => "🔌 Connection", "value" => $connection, "inline" => true],
        ["name" => "📦 Cache-Control", "value" => $cacheControl, "inline" => true],
        ["name" => "📡 Accept-Encoding", "value" => $encoding, "inline" => true],
        ["name" => "⚡ Transfer-Encoding", "value" => $encoding2, "inline" => true]
    ]
];

$data = [
    "username" => "LoggerBot",
    "embeds" => [$embed]
];

// ==== SEND TO DISCORD ====
$options = [
    "http" => [
        "header" => "Content-Type: application/json",
        "method" => "POST",
        "content" => json_encode($data)
    ]
];

$context = stream_context_create($options);
file_get_contents($webhook_url, false, $context);
?>
