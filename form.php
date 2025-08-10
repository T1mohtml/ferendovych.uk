<?php
// No backend logic here, just showing the form.
// You can add PHP above if needed later.
?>

<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="static/css.css">
    <title>Submit Name & Message</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

<div class="ukraine-banner">#StandWithUkraine</div>
</head>
<body>

<form action="submit_handler.php" method="post">
    <label for="name"><h1>Type your name!</h1></label>
    <input type="text" id="name" name="name" placeholder="Your Name!" required><br><br>

    <label for="message"><h1>Type your flork idea here!</h1></label>
    <textarea id="message" name="message" placeholder="Your flork idea here..." required></textarea><br><br>

    <div class="submit">
        <button type="submit">Submit</button>
    </div>
</form>

<a href="view.php">
    <input type="button" value="View messages!">
</a>

</body>
</html>
