<?php
// Enable error logging to console
function js_console_log($msg) {
    echo "<script>console.error('PHP: " . json_encode($msg) . "');</script>";
}
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    js_console_log("Error [$errno] $errstr in $errfile on line $errline");
    return false;
});
set_exception_handler(function($e) {
    js_console_log("Uncaught Exception: " . $e->getMessage());
});
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Profanity filter
function load_bad_words($file_path = __DIR__ . '/../bad-words.txt') {
    return file_exists($file_path) ? file($file_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
}
function contains_bad_words($text, $badWords) {
    foreach ($badWords as $word) {
        if (preg_match('/\b' . preg_quote($word, '/') . '\b/i', $text)) return true;
    }
    return false;
}

// SQLite DB
$db_path = __DIR__ . "/names.db";
$db = new PDO("sqlite:$db_path");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec("CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)");

$message = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    if ($name === "") {
        $message = "⚠️ Name cannot be empty.";
    } else if (contains_bad_words($name, load_bad_words())) {
        $message = "⚠️ Inappropriate content is not allowed.";
    } else {
        $stmt = $db->prepare("INSERT INTO names (name) VALUES (:name)");
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->execute();
        $message = "✅ Name added!";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Submit Your Name</title>
<link rel="stylesheet" href="/static/css.css">
<style>
body { background:#1e1f26; margin:0; font-family:'Inter',sans-serif; color:#ffd700; overflow-y:auto; }
.centered-container { display:flex; flex-direction:column; align-items:center; padding:32px 16px; }
.card { background:#23243a; border-radius:18px; box-shadow:0 4px 24px rgba(60,60,100,0.18); padding:36px 32px; max-width:400px; width:100%; border:1.5px solid #3949ab; display:flex; flex-direction:column; align-items:center; margin-bottom:32px; }
h1 { margin-bottom:1em; text-align:center; font-size:2rem; }
.styled-input { padding:10px 14px; border-radius:8px; border:1px solid #444; font-size:1em; width:200px; background:#23243a; color:#f1f1f1; margin-bottom:16px; outline:none; transition:border 0.2s; }
.styled-input:focus { border:1.5px solid #5c6bc0; }
button.big-button { font-size:18px; font-weight:bold; background:linear-gradient(135deg,#5c6bc0,#3949ab); color:#fff; border:none; border-radius:12px; padding:14px 28px; cursor:pointer; margin-top:16px; transition: transform 0.2s, background 0.3s; }
button.big-button:hover { background:linear-gradient(135deg,#7986cb,#303f9f); transform:scale(1.05); }
.message { margin:18px 0; padding:10px 18px; border-radius:8px; background:linear-gradient(135deg,#23243a 80%,#3949ab 100%); color:#ffd700; font-weight:600; font-size:1.1em; text-align:center; box-shadow:0 2px 8px rgba(60,60,100,0.12); max-width:350px; }
</style>
</head>
<body>
<div class="centered-container">
    <div class="card">
        <h1>Submit Your Name</h1>
        <form method="post">
            <input type="text" name="name" class="styled-input" placeholder="Enter your name" required>
            <button type="submit" class="big-button">Submit Name</button>
        </form>
        <?php if($message) echo "<div class='message'>$message</div>"; ?>
        <button class="big-button" onclick="window.location.href='/'">Home</button>
    </div>
</div>
</body>
</html>
