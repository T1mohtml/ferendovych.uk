<?php
// Your JSON data (can also come from a file or API)
$json = '{
  "download": 3688628967.2909303,
  "upload": 2115464130.9547284,
  "ping": 1.498,
  "server": {
    "url": "http://ams.speedtest.clouvider.net:8080/speedtest/upload.php",
    "lat": "52.3667",
    "lon": "4.9000",
    "name": "Amsterdam",
    "country": "Netherlands",
    "cc": "NL",
    "sponsor": "Clouvider Ltd",
    "id": "35058",
    "host": "ams.speedtest.clouvider.net:8080",
    "d": 3.1237663618026166,
    "latency": 1.498
  },
  "timestamp": "2025-07-16T07:06:08.909976Z",
  "bytes_sent": 151519232,
  "bytes_received": 409373932,
  "share": null,
  "client": {
    "ip": "134.209.83.186",
    "lat": "52.352",
    "lon": "4.9392",
    "isp": "Digital Ocean",
    "isprating": "3.7",
    "rating": "0",
    "ispdlavg": "0",
    "ispulavg": "0",
    "loggedin": "0",
    "country": "NL"
  }
}';

// Decode JSON to PHP associative array
$data = json_decode($json, true);
$server = $data['server'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Server Information</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 2rem auto; }
    h1 { text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.5rem; border: 1px solid #ccc; text-align: left; }
    th { background-color: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Server Information</h1>
  <table>
    <tr><th>Name</th><td><?= htmlspecialchars($server['name']) ?></td></tr>
    <tr><th>Country</th><td><?= htmlspecialchars($server['country']) ?></td></tr>
    <tr><th>Latitude</th><td><?= htmlspecialchars($server['lat']) ?></td></tr>
    <tr><th>Longitude</th><td><?= htmlspecialchars($server['lon']) ?></td></tr>
    <tr><th>Sponsor</th><td><?= htmlspecialchars($server['sponsor']) ?></td></tr>
    <tr><th>Server URL</th><td><a href="<?= htmlspecialchars($server['url']) ?>" target="_blank" rel="noopener noreferrer"><?= htmlspecialchars($server['url']) ?></a></td></tr>
    <tr><th>Latency (ms)</th><td><?= htmlspecialchars($server['latency']) ?></td></tr>
  </table>
</body>
</html>
