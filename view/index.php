
$db_path = __DIR__ . '/../submit/names.db';

if (!file_exists($db_path)) {
    die("No data yet.");

$db = new PDO("sqlite:$db_path");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $db->query("SELECT name FROM names ORDER BY id DESC");
$names = $stmt->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html>
<head>
    <title>View Names</title>
    <style>
        .centered-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
        }
        .styled-list {
            list-style: none;
            padding: 0;
            margin: 24px 0 18px 0;
            width: 100%;
            max-width: 350px;
        }
        .styled-list li {
            background: linear-gradient(135deg, #23243a 80%, #3949ab 100%);
            color: #ffd700;
            margin-bottom: 10px;
            padding: 12px 18px;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(60,60,100,0.10);
            text-align: center;
            word-break: break-word;
        }
        .empty-message {
            color: #ccc;
            font-size: 1.1em;
            margin: 24px 0 18px 0;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="centered-container">
    <h1>All Submitted Names</h1>
    <?php if (empty($names)): ?>
        <div class="empty-message">wow such empty</div>
    <?php else: ?>
        <ul class="styled-list">
        <?php foreach ($names as $name): ?>
            <li><?php echo htmlspecialchars($name); ?></li>
        <?php endforeach; ?>
        </ul>
    <?php endif; ?>
    <a href="submit.php" class="big-button">Submit a Name</a>
    <button class="big-button" onclick="window.location.href='/'">Home</button>
</div>
<link rel="stylesheet" href="static/css.css">
</body>
</html>
