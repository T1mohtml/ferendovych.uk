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
        html, body {
            height: auto;
            overflow-y: auto; /* allow vertical scrolling */
            margin: 0;
            padding: 0;
            background: #1e1f26;
            font-family: 'Inter', sans-serif;
        }

        .centered-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 32px 16px;
        }

        .card {
            background:#23243a;
            border-radius:18px;
            box-shadow:0 4px 24px rgba(60,60,100,0.18);
            padding:36px 32px;
            max-width: 420px; /* desktop width */
            width: 100%; /* scale on smaller screens */
            border:1.5px solid #3949ab;
            display:flex;
            flex-direction: column;
            align-items: center;
            box-sizing: border-box;
        }

        h1 {
            margin-bottom: 0.7em;
            border-bottom: 2px solid #444;
            padding-bottom: 0.3em;
            text-align: center;
            color: #ffd700;
            font-weight: 600;
            font-size: 2.2rem;
        }

        .styled-list {
            list-style: none;
            padding: 0;
            margin: 24px 0 18px;
            width: 100%;
        }

        .styled-list li {
            background: linear-gradient(135deg,#23243a 80%,#3949ab 100%);
            color:#ffd700;
            margin-bottom:10px;
            padding:12px 18px;
            border-radius:8px;
            font-size:1.1em;
            font-weight:500;
            text-align:center;
            word-break:break-word;
            box-shadow:0 2px 8px rgba(60,60,100,0.10);
        }

        button.big-button {
            font-size:18px;
            font-weight:bold;
            background:linear-gradient(135deg,#5c6bc0,#3949ab);
            color:#fff;
            border:none;
            border-radius:12px;
            padding:16px 28px;
            cursor:pointer;
            margin-top:12px;
            transition: transform 0.2s, background 0.3s;
        }

        button.big-button:hover {
            background:linear-gradient(135deg,#7986cb,#303f9f);
            transform:scale(1.05);
        }

        .empty-message {
            margin:18px 0;
            padding:10px 18px;
            border-radius:8px;
            background:linear-gradient(135deg,#23243a 80%,#3949ab 100%);
            color:#ffd700;
            font-weight:600;
            font-size:1.1em;
            text-align:center;
            box-shadow:0 2px 8px rgba(60,60,100,0.12);
            max-width:350px;
        }

        /* Make card adjust nicely on small screens */
        @media (max-width: 480px) {
            .card {
                padding: 24px 16px;
            }

            h1 {
                font-size: 1.8rem;
            }

            button.big-button {
                font-size: 16px;
                padding: 14px 24px;
            }

            .styled-list li {
                font-size: 1em;
                padding: 10px 14px;
            }
        }
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
        <button class="big-button" onclick="window.location.href='/submit/'">Submit a Name</button>
    </div>
</div>
</body>
</html>
