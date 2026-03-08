import sqlite3

def setup_database():
    conn = sqlite3.connect('social_network.db')
    cursor = conn.cursor()

    # Create Users with Password and Bio support
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            password TEXT DEFAULT 'password123',
            bio TEXT DEFAULT 'New to the network!'
        )
    ''')
    
    # Create Friendships (Stays the same)
    cursor.execute('''
       CREATE TABLE IF NOT EXISTS friendships (
            user_id INTEGER,
            friend_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(friend_id) REFERENCES users(id),
            UNIQUE(user_id, friend_id)
        )
    ''')

    # Create Posts with Likes functionality
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            content TEXT,
            likes INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
    print("Success: Database updated with Password, Bio, and Likes support!")

if __name__ == "__main__":
    setup_database()
