<?php
$conn = new mysqli("localhost", "Timo", "2262", "vot_box");
if ($conn->connect_error) die("Connection Failed");

// Hardcoded ideas array
$ideas = ["Idea 1", "Idea 2", "Idea 3"];

$message = '';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $idea = $_POST['idea'] ?? '';

    if (!$idea || !in_array($idea, $ideas)) {
        $message = "Please select a valid idea.";
    } else {
        $voter_ip = $_SERVER['REMOTE_ADDR'];
        // Check if user already voted for this idea (by IP)
        $check = $conn->prepare("SELECT id FROM votes WHERE voter_ip = ? AND idea = ?");
        $check->bind_param("ss", $voter_ip, $idea);
        $check->execute();
        $check->store_result();

        if ($check->num_rows > 0) {
            $message = "You already voted for this idea.";
        } else {
            $insert = $conn->prepare("INSERT INTO votes (idea, voter_ip) VALUES (?, ?)");
            $insert->bind_param("ss", $idea, $voter_ip);
            if ($insert->execute()) {
                $message = "Thanks for voting!";
            } else {
                $message = "Error: " . $conn->error;
            }
            $insert->close();
        }
        $check->close();
    }
}
$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="static/css.css">
  <title>Vote for Ideas</title>
</head>
<body>

  <h1>Vote for your favorite idea</h1>

  <?php if ($message): ?>
    <p><strong><?= htmlspecialchars($message) ?></strong></p>
  <?php endif; ?>

  <form method="post" action="">
    <?php foreach ($ideas as $idea): ?>
      <label>
        <input type="radio" name="idea" value="<?= htmlspecialchars($idea) ?>" required>
        <?= htmlspecialchars($idea) ?>
      </label><br>
    <?php endforeach; ?>
    <button type="submit">Vote!</button>
  </form>

  <a href="results.php">View Results</a>

</body>
</html>
