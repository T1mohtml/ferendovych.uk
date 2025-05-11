from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)


# Initialize the database
def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
              CREATE TABLE IF NOT EXISTS names
              (
                  id
                  INTEGER
                  PRIMARY
                  KEY,
                  name
                  TEXT
              )
              ''')
    conn.commit()
    conn.close()


# Home route
@app.route("/", methods=["GET", "POST"])
def name_input():
    if request.method == "POST":
        name = request.form.get("name")

        # Save the name to the database
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute('INSERT INTO names (name) VALUES (?)', (name,))
        conn.commit()
        conn.close()

        # After saving the name, fetch all names from the database
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute("SELECT name FROM names")
        names = c.fetchall()
        conn.close()

        return render_template("Name.html", name=name, names=names)

    # If the request is a GET (initial load), just show the form
    return render_template("Name.html", names=[])


if __name__ == "__main__":
    init_db()  # Initialize the database when the app starts
    app.run(debug=True)
