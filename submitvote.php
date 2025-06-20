<?php
$conn = new mysqli("localhost", "Timo", "2262", "VOT_BOX");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$idea_id = (int) ($_POST['idea_id'] ?? 0);
$ip = $_SERVER['REMOTE_ADDR'];

// Simple validation
if (!$idea_id) {
    echo "No idea selected!";
    exit;
}

// Delete previous vote from same IP to allow vote change
$conn->query("DELETE FROM votes WHERE ip_address = '$ip'");

// Insert new vote
$conn->query("INSERT INTO votes (idea_id, ip_address) VALUES ('$idea_id', '$ip')");

echo "<h1>Thanks for voting!</h1>";
echo '<a href="index.php">Back to voting</a><br>';
echo '<a href="results.php">See results</a>';

$conn->close();
?>
