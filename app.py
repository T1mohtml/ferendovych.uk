from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)


# Database connection function
def get_db_connection():
    conn = sqlite3.connect('database.db')  # Connect to the SQLite database
    conn.row_factory = sqlite3.Row  # To return rows as dictionaries
    return conn


# Route for displaying and submitting the name
@app.route("/name", methods=["GET", "POST"])
def name_input():
    name = ""
    if request.method == "POST":
        # Get the name from the form submission
        name = request.form["name"]

        # Connect to the database and insert the name
        conn = get_db_connection()
        conn.execute("INSERT INTO names (name) VALUES (?)", (name,))
        conn.commit()
        conn.close()

    # Render the page with the submitted name (if any)
    return render_template("Name.html", name=name)


# Route for displaying all names from the database
@app.route("/all_names")
def all_names():
    conn = get_db_connection()
    # Get all the names from the database
    names = conn.execute("SELECT * FROM names").fetchall()
    conn.close()

    # Render the page and pass the names to be displayed
    return render_template("all_names.html", names=names)


if __name__ == "__main__":
    app.run(debug=True)
