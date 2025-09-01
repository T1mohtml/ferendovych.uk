<?php
$db_path = __DIR__ . '/../submit/names.db';
if (!file_exists($db_path)) die("No data yet.");

$db = new PDO("sqlite:$db_path");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $db->query("SELECT name FROM names ORDER BY id DESC");
$names = $stmt->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>View Names</title>
    <link rel="stylesheet" href="/static/css.css">
    <style>
        body { background: #1e1f26; font-family: 'Inter', sans-serif; }
        .centered-container { display: flex; flex-direction: column; align-items: center; }
        .card {
            background:#23243a; border-radius:18px; box-shadow:0 4px 24px rgba(60,60,100,0.18);
            padding:36px 32px; max-width:420px; width:100%; margin:32px auto;
            border:1.5px solid #3949ab; display:flex; flex-direction:column; align-items:center;
        }
        .styled-list { 
            list-style:none; padding:0; margin:24px 0 18px; width:100%; 
            max-height:400px; /* Make list scrollable */
            overflow-y:auto; 
        }
        .styled-list li { 
            background: linear-gradient(135deg,#23243a 80%,#3949ab 100%); color:#ffd700;
            margin-bottom:10px; padding:12px 18px; border-radius:8px; font-size:1.1em;
            font-weight:500; text-align:center; word-break:break-word; box-shadow:0 2px 8px rgba(60,60,100,0.10); 
        }
        .empty-message { 
            margin:18px 0; padding:10px 18px; border-radius:8px;
            background: linear-gradient(135deg,#23243a 80%,#3949ab 100%); color:#ffd700;
            font-weight:600; font-size:1.1em; text-align:center; box-shadow:0 2px 8px rgba(60,60,100,0.12);
            max-width:350px; 
        }
        .big-button {
            font-size:18px; font-weight:bold; background:linear-gradient(135deg,#5c6bc0,#3949ab);
            color:#fff; border:none; border-radius:12px; padding:16px 28px; cursor:pointer; margin-top:12px;
            transition: transform 0.2s, background 0.3s; width:fit-content;
        }
        .big-button:hover { background:linear-gradient(135deg,#7986cb,#303f9f); transform:scale(1.05); }
    </style>
</head>
<body>
<div class="centered-container">
    <div class="card">
        <h1>All Submitted Names</h1>
        <?php if (empty($names)): ?>
            <div class="empty-message">No names submitted yet.</div>
        <?php else: ?>
            <ul class="styled-list">
                <?php foreach ($names as $name): ?>
                    <li><?= htmlspecialchars($name) ?></li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

        <!-- Buttons -->
        <button class="big-button" onclick="window.location.href='/submit/'">Submit a Name</button>
        <button class="big-button" onclick="window.location.href='/'">Home</button>
    </div>
</div>
</body>
</html>
