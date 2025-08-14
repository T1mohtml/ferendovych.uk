<?php
// Enable error logging to browser console for debugging
function js_console_log($msg) {
    $msg = json_encode($msg);
    echo "<script>console.error('PHP: ' + $msg);</script>";
}

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    js_console_log("Error [$errno] $errstr in $errfile on line $errline");
    return false; // Let normal error handler continue
});
set_exception_handler(function($e) {
    js_console_log('Uncaught Exception: ' . $e->getMessage());
});
ini_set('display_errors', 0);
ini_set('log_errors', 0);
error_reporting(E_ALL);

$db_path = __DIR__ . "/names.db"; // Store DB in same folder as script

// Create DB & table if it doesn't exist
$db = new PDO("sqlite:$db_path");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec("CREATE TABLE IF NOT EXISTS names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
)");

$message = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    if ($name !== "") {
        $stmt = $db->prepare("INSERT INTO names (name) VALUES (:name)");
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->execute();
        $message = "✅ Name added!";
    } else {
        $message = "⚠️ Name cannot be empty.";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Submit Your Name</title>
    <style>
        .centered-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
        }
        .styled-input {
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #444;
            font-size: 1.1em;
            background: #23243a;
            color: #f1f1f1;
            margin-bottom: 16px;
            width: 260px;
            box-sizing: border-box;
            outline: none;
            transition: border 0.2s;
        }
        .styled-input:focus {
            border: 1.5px solid #5c6bc0;
        }
        .message {
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
    </style>
</head>
<body>
<div class="centered-container">
    <h1>Submit Your Name</h1>
    <form method="post">
        <input type="text" name="name" class="styled-input" placeholder="Enter your name" required>
        <button type="submit">Submit</button>
    </form>
    <?php if ($message) echo "<div class='message'>$message</div>"; ?>
    <button class="big-button" onclick="window.location.href='/'">Home</button>
    <p style="margin-top: 18px;"><a href="view.php" class="big-button">View All Names</a></p>
</div>
<link rel="stylesheet" href="static/css.css">
</body>
</html>
