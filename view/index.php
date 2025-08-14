<?php
$db_path = __DIR__ . '/../submit/names.db';

if (!file_exists($db_path)) {
    die("No data yet.");
}

$db = new PDO("sqlite:$db_path");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $db->query("SELECT name FROM names ORDER BY id DESC");
$names = $stmt->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html>
<head>
    <title>View Names</title>
            <link rel="stylesheet" href="/static/css.css">
            <style>
                .centered-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-height: 100vh;
                    width: 100vw;
                }
                                        .card {
                                            background: #23243a;
                                            border-radius: 18px;
                                            box-shadow: 0 4px 24px rgba(60,60,100,0.18);
                                            padding: 36px 32px;
                                            max-width: 420px;
                                            width: 100%;
                                            margin: 32px auto 0 auto;
                                            border: 1.5px solid #3949ab;
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
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
                    font-family: 'Inter', sans-serif;
                }
                .big-button, button.big-button {
                    font-family: 'Inter', sans-serif;
                    font-size: 20px;
                    font-weight: bold;
                    background: linear-gradient(135deg, #5c6bc0, #3949ab);
                    color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    border: none;
                    padding: 20px 30px;
                    width: fit-content;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                    margin-top: 18px;
                    transition: transform 0.2s ease, background 0.3s ease;
                    cursor: pointer;
                }
                .big-button:hover, button.big-button:hover {
                    background: linear-gradient(135deg, #7986cb, #303f9f);
                    transform: scale(1.05);
                }
                .empty-message {
                    margin: 18px 0 10px 0;
                    padding: 10px 18px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #23243a 80%, #3949ab 100%);
                    color: #ffd700;
                    font-weight: 600;
                    font-size: 1.1em;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(60,60,100,0.12);
                    max-width: 350px;
                }
                h1 {
                    margin-bottom: 0.7em;
                    border-bottom: 2px solid #444;
                    padding-bottom: 0.3em;
                    text-align: center;
                    color: #ffd700;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 2.5rem;
                    letter-spacing: 1px;
                }
            </style>
            <script>
            // On load, scroll to bottom, then lock scrolling
            window.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
                    setTimeout(function() {
                        document.body.style.overflow = 'hidden';
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
                    }, 400);
                }, 200);
            });
            </script>
</head>
<body style="background: #1e1f26; min-height: 100vh;">
<div class="centered-container">
    <div class="card">
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
            <form action="/submit/index.php" method="get" style="margin:0;">
                <button type="submit" class="big-button">Submit a Name</button>
            </form>
            <button class="big-button" onclick="window.location.href='/'">Home</button>
    </div>
</div>
</body>
</html>