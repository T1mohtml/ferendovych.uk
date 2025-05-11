import sqlite3

# Connect to the database (this will create it if it doesn't exist)
conn = sqlite3.connect('database.db')

# Create a cursor object
c = conn.cursor()

# Create a table to store names if it doesn't exist already
c.execute('''
    CREATE TABLE IF NOT EXISTS names (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
''')

# Commit changes and close the connection
conn.commit()
conn.close()

print("Database and table created successfully!")
