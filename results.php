<?php
$conn = new mysqli("localhost", "Timo", "2262", "vot_box");
if ($conn->connect_error) die("Connection Failed");

$sql = "SELECT idea, COUNT(*) AS votes FROM votes GROUP BY idea";
$result = $conn->query($sql);

$totalVotes = 0;
$votesData = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $votesData[$row['idea']] = (int)$row['votes'];
        $totalVotes += (int)$row['votes'];
    }
}

$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="static/css.css">
  <title>Voting Results</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>Voting Results</h1>

  <?php if ($totalVotes === 0): ?>
    <p>No votes yet.</p>
  <?php else: ?>
    <?php foreach ($votesData as $idea => $count):
      $percent = round(($count / $totalVotes) * 100, 2);
    ?>
      <h3><?= htmlspecialchars($idea) ?>: <?= $count ?> votes (<?= $percent ?>%)</h3>
    <?php endforeach; ?>
  <?php endif; ?>

  <a href="VOT.php">Back to vote</a>
</body>
</html>
