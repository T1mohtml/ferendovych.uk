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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background-color: #1e1f26;
            color: #f1f1f1;
            line-height: 1.6;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            text-align: center;
        }
        h1 {
            font-size: 2.5rem;
            border-bottom: 2px solid #444;
            padding-bottom: 0.3em;
            text-align: center;
            color: #e1e1e6;
            margin-top: 2em;
        }
        p {
            margin-bottom: 1em;
            color: #ccc;
            font-size: 1.5rem;
        }
        .emoji {
            font-size: 3rem;
            margin: 1rem 0;
        }
        a.button {
            display: block;
            margin: 30px auto;
            padding: 14px 32px;
            background: linear-gradient(135deg, #5c6bc0, #3949ab);
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            text-align: center;
            text-decoration: none;
            transition: background 0.3s, transform 0.2s;
        }
        a.button:hover {
            background: linear-gradient(135deg, #7986cb, #303f9f);
            transform: scale(1.05);
        }
        .ukraine-banner {
            width: 100%;
            background: linear-gradient(to right, #0057b7 0 50%, #ffd700 50% 100%);
            color: #222;
            font-size: 1.5em;
            font-weight: bold;
            text-align: center;
            padding: 0.75em 0;
            letter-spacing: 2px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        footer {
            padding: 1em;
            background-color: #1e1f26;
            color: #aaa;
            text-align: center;
            font-size: 14px;
            border-top: 1px solid #333;
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
