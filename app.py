from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)


# Initialize the database
def init_db():
    with sqlite3.connect("database.db") as conn:
        conn.execute("""
                     CREATE TABLE IF NOT EXISTS names
                     (
                         id
                         INTEGER
                         PRIMARY
                         KEY
                         AUTOINCREMENT,
                         name
                         TEXT
                         NOT
                         NULL
                     )
                     """)


# Handle the /name route (for GET and POST requests)
@app.route("/name", methods=["GET", "POST"])
def name_input():
    if request.method == "POST":
        # Get the name from the form
        name = request.form.get("name", "").strip()

        if name:
            # Insert the name into the database
            with sqlite3.connect("database.db") as conn:
                conn.execute("INSERT INTO names (name) VALUES (?)", (name,))

        return redirect("/name")  # After submission, reload the page

    # Fetch all names from the database for GET request
    with sqlite3.connect("database.db") as conn:
        names = conn.execute("SELECT name FROM names").fetchall()

    # Render the index.html template and pass the names
    return render_template("index.html", names=names)


if __name__ == "__main__":
    init_db()  # Initialize the database when app starts
    app.run(host="0.0.0.0", port=8000)  # Run Flask app on localhost:8000
