<html>
    <link rel="stylesheet" href="static/css.css">
    </html>

<?php
$conn = new mysqli("localhost", "Timo", "2262", "visitor");
if ($conn->connect_error) die("Connection Failed");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = $conn->real_escape_string($_POST['name'] ?? '');
    $message = $conn->real_escape_string($_POST['message'] ?? '');

    if (!$name || !$message) {
        echo "Please fill in both name and message.";
        exit;
    }

    $sql = "INSERT INTO visitors (name, message) VALUES ('$name', '$message')";
    if ($conn->query($sql)) {
        echo "<h1>Thanks!</h1>";
    } else {
        echo "Error: " . $conn->error;
    }
}

$conn->close();
?>
