<?php
http_response_code(404);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>404 Not Found</title>
    <style>
        body {
            background: #f9f9f9;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            text-align: center;
            padding: 50px;
            color: #444;
        }
        h1 {
            font-size: 6rem;
            margin-bottom: 0;
            color: #ff6f61;
        }
        p {
            font-size: 1.5rem;
            margin-top: 0.5rem;
        }
        .emoji {
            font-size: 3rem;
            margin: 1rem 0;
        }
        a.button {
            display: inline-block;
            margin-top: 2rem;
            padding: 12px 30px;
            background: #ff6f61;
            color: white;
            text-decoration: none;
            font-weight: bold;
            border-radius: 30px;
            transition: background 0.3s ease;
        }
        a.button:hover {
            background: #ff4b3e;
        }
    </style>
</head>
<body>
    <h1>404 Not Found</h1>
    <p>Awww shucks! This place does not exist <span class="emoji">D:</span></p>
    <a href="/" class="button">Take me back home </a>
    <h5>#StandWithUkraine</h5>
</body>
</html>
