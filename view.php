<?php
$conn = new mysqli("localhost", "Timo", "2262", "visitor");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT id, name, message, submitted_at FROM visitors ORDER BY submitted_at DESC";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Visitor Messages</title>
    <link rel="stylesheet" href="static/css.css">
</head>
<body>
    <h1>Visitor Messages</h1>

    <?php
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            echo "<div class='visitor'>";
            echo "<h3>" . htmlspecialchars($row['name']) . "</h3>";
            echo "<div class='time'>" . $row['submitted_at'] . "</div>";
            echo "<p class='message'>" . nl2br(htmlspecialchars($row['message'])) . "</p>";
            echo "</div>";
        }
    } else {
        echo "<p>No visitor messages yet.</p>";
    }

    $conn->close();
    ?>

<a href="index.html">
    <input type="button" value="Home">
</a>
</body>
</html>
