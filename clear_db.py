import sqlite3

# Function to clear the database
def clear_database():
    # Connect to the database
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    # Delete all rows from the 'names' table
    c.execute("DELETE FROM names")

    # Commit changes and close the connection
    conn.commit()
    conn.close()

    print("Database cleared successfully.")

if __name__ == "__main__":
    clear_database()
