<?php
include_once ("captain_hook.php");
?>
<!DOCTYPE html>
<html>
<head>
    <link rel="icon" type="image/png" href="website.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">
    <link rel="manifest" href="assets/site.webmanifest">
    <link rel="mask-icon" href="assets/safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <link rel="stylesheet" href="static/css.css">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        /* Sticky footer fix */
        html, body {
            height: 100%;
            margin: 0;
        }
        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh; /* full viewport height */
        }
        /* Content container that grows to fill */
        .content {
            flex: 1;
        }
        footer {
            text-align: center;
            padding: 1em;
            background-color: #eee;
            margin-top: 2em;
            font-family: Helvetica;
        }
    </style>
</head>
<body>

<div class="content">

  <div class="sliding-text-container">
    <div class="sliding-text">
      THE WEBSITE IS W.I.P (WORK IN PROGRESS) SOME THINGS MAY NOT WORK!
    </div>
  </div>

  <h1 style="text-align:center;">Hello</h1>

  <a href="https://www.youtube.com/channel/UCFF7AsiSQgmh5ZP8u7GBWvQ">
      <button class="center">My youtube channel</button>
  </a>

  <a href="https://github.com/T1mohtml/MyPyCharmMiscProject">
      <button class="center">My github repo</button>
  </a>

  <a href="AboutMe.php">
      <button class="center">About Me!</button>
  </a>
  <a href="portfolio.php">
      <button class="center">My Portfolio!</button>
  </a>

  <a href="Secret.php">
      <button class="secret-button">Click me!</button>
  </a>

  <a href="Flork.php">
      <button class="center">Suggest flork ideas for us to draw!</button>
  </a>

  <a href="WeatherChecker.dmg" download class="center">
      <h1>Download my app (click me!) (you can type a city name and it will show live weather data for it!)</h1>
  </a>

</div> <!-- end content -->

<footer>
    &copy; 2025-2025 Timo Ferendovych. All rights reserved.
</footer>

</body>
</html>
