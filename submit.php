<?php
$conn = new mysqli("fdb1033.awardspace.net", "4659225_suggestionbox", "T1mongogo", "4659225_suggestionbox", 3306);
if ($conn->connect_error) die("Connection Failed: " . $conn->connect_error);

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
