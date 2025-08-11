<?php
include_once ("captain_hook.php");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Timo Ferendovych – Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
    <style>
        /* Reset and base */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #1e1f26;
            color: #f1f1f1;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
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


        header {
            background: linear-gradient(135deg, #5c6bc0, #3949ab);
            padding: 2em 1em;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }

        header h1 {
            margin: 0 0 0.25em 0;
            font-weight: 600;
            font-size: 2.5rem;
            color: #fff;
        }

        header p {
            margin: 0 0 1em 0;
            font-weight: 400;
            color: #cfd8dc;
            font-size: 1.1rem;
        }

        .home-button {
            background: linear-gradient(135deg, #5c6bc0, #3949ab);
            color: white;
            border: none;
            padding: 0.6em 1.5em;
            font-size: 1rem;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            transition: background 0.3s ease, transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(57, 73, 171, 0.5);
        }

        .home-button:hover {
            background: linear-gradient(135deg, #7986cb, #303f9f);
            transform: scale(1.05);
        }

        main {
            max-width: 900px;
            margin: 2em auto 3em auto;
            padding: 0 1em;
            flex-grow: 1;
        }

        h2 {
            font-weight: 600;
            font-size: 2rem;
            color: #e1e1e6;
            border-bottom: 2px solid #3949ab;
            padding-bottom: 0.3em;
            margin-bottom: 1em;
        }

        p, li {
            font-weight: 400;
            color: #ccc;
            font-size: 1.1rem;
        }

        ul {
            list-style: none;
            padding-left: 0;
            margin-top: 0.5em;
        }

        ul li {
            margin-bottom: 0.8em;
        }

        ul li a {
            color: #90caf9;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        ul li a:hover {
            color: #c1e0ff;
        }

        .project {
            background-color: #2b2c36;
            border-radius: 10px;
            padding: 1.2em 1.5em;
            margin-bottom: 1.5em;
            box-shadow: 0 6px 15px rgba(0,0,0,0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .project strong {
            font-size: 1.2rem;
            display: block;
            margin-bottom: 0.5em;
            color: #7986cb;
        }

        .project a {
            color: #90caf9;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .project a:hover {
            color: #c1e0ff;
            text-decoration: underline;
        }

        .project:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 25px rgba(57, 73, 171, 0.6);
        }

        footer {
            text-align: center;
            padding: 1em;
            background-color: #22242f;
            color: #777;
            font-size: 0.9rem;
            box-shadow: inset 0 1px 0 #3949ab;
            user-select: none;
        }

        /* Responsive */
        @media (max-width: 600px) {
            header h1 {
                font-size: 2rem;
            }
            h2 {
                font-size: 1.5rem;
            }
            main {
                margin: 1em;
                padding: 0 0.5em;
            }
            .home-button {
                width: 100%;
                padding: 1em 0;
                font-size: 1.1rem;
            }
        }
    </style>
</head>
<body>
    <header>
        
        <h1>Hi, I'm Timo 👋</h1>
        <p>10-year-old developer, Linux user & future software engineer</p>
        <a href="/" class="home-button" aria-label="Home">Home</a>
    </header>

    <main>
        <h2>About Me</h2>
        <p>
            I'm a 10-year-old developer from Denmark 🇩🇰. I love working with Python and Linux.<br>
            I installed Arch Linux with Plasma KDE myself, and I build apps in VS Code using Python, php and more.<br>
            I speak Ukrainian 🇺🇦, Danish 🇩🇰, and English 🇬🇧 fluently.
        </p>

        <h2>My Projects</h2>

        <div class="project">
            <strong>🌦 Weather App</strong>
            <p>A simple Python app that fetches weather data using an API.</p>
            <a href="https://github.com/T1mohtml/My_python_projects_and_VSCode_projects/releases/tag/1.0.0" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </div>

        <div class="project">
            <strong>🎮 TicTacToe Game</strong>
            <a href="https://github.com/T1mohtml/PyTicTacToe" target="_blank" rel="noopener noreferrer"><button>View on GitHub</a>
        </div>

        <div class="project">
            <strong>📱 My Website</strong>
            <p>I built and maintain my own website using php and host it at ferendovych.uk.</p>
            <a href="https://github.com/T1mohtml/ferendovych.uk" target="_blank" rel="noopener noreferrer">Repo for the website</a>
        </div>

        <h2>Contact</h2>
        <ul>
            <li><a href="https://github.com/T1mohtml" target="_blank" rel="noopener noreferrer">GitHub: T1mohtml</a></li>
            <li><a href="https://www.youtube.com/channel/UCFF7AsiSQgmh5ZP8u7GBWvQ" target="_blank" rel="noopener noreferrer">YouTube Channel</a></li>
            <li>Email: <a href="mailto:timongogoyt@ferendovych.uk">timongogoyt@ferendovych.uk</a></li>
        </ul>
    </main>
<p><a href="https://stand-with-ukraine.pp.ua"><img src="https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg" alt="Stand With Ukraine"></a></p>
    <footer>
        &copy; 2025-2025 Timo Ferendovych. All rights reserved.
        #StandWithUkraine
    </footer>
</body>
</html>
