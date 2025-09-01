<?php
// Enable error logging to browser console
function js_console_log($msg) {
    $msg = json_encode($msg);
    echo "<script>console.error('PHP: ' + $msg);</script>";
}

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    js_console_log("Error [$errno] $errstr in $errfile on line $errline");
    return false;
});
set_exception_handler(function($e) {
    js_console_log('Uncaught Exception: ' . $e->getMessage());
});

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
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

// Connect to MySQL
try {
    $db = new PDO("mysql:host=localhost;dbname=names;charset=utf8mb4", "phpuser", "T1mongogo!");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("CREATE TABLE IF NOT EXISTS names (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL
    )");
} catch (PDOException $e) {
    die("DB Connection Failed: " . $e->getMessage());
}

// Handle form submission
$message = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    if ($name !== "") {
        $badWords = load_bad_words();
        if (contains_bad_words($name, $badWords)) {
            $message = "⚠️ Inappropriate content is not allowed.";
        } else {
            try {
                $stmt = $db->prepare("INSERT INTO names (name) VALUES (:name)");
                $stmt->bindValue(':name', $name, PDO::PARAM_STR);
                $stmt->execute();
                $message = "✅ Name added!";
            } catch (PDOException $e) {
                $message = "❌ Error inserting name: " . $e->getMessage();
            }
        }
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
        .styled-input:focus { border: 1.5px solid #5c6bc0; }
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
        .big-button {
            font-family: 'Inter', sans-serif;
            font-size: 20px;
            font-weight: bold;
            background: linear-gradient(135deg, #5c6bc0, #3949ab);
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: none;
            padding: 20px 30px;
            width: fit-content;
            margin: 12px auto;
            cursor: pointer;
            transition: transform 0.2s ease, background 0.3s ease;
        }
        .big-button:hover { background: linear-gradient(135deg,#7986cb,#303f9f); transform: scale(1.05); }
    </style>
</head>
<body style="background: #1e1f26; overflow:auto;">
<div class="centered-container">
    <div class="card">
        <h1>Submit Your Name</h1>
        <form method="post">
            <input type="text" name="name" class="styled-input" placeholder="Enter your name" required>
            <button type="submit" class="big-button">Submit</button>
        </form>
        <?php if ($message) echo "<div class='message'>$message</div>"; ?>
        <button class="big-button" onclick="window.location.href='/'">Home</button>
        <p><a href="/view/" class="big-button">View All Names</a></p>
    </div>
</div>
</body>
</html>

