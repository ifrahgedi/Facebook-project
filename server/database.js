import sqlite3Pkg from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const sqlite3 = sqlite3Pkg.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connected to the SQLite database.");
        
        // Create Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            surname TEXT,
            username TEXT UNIQUE NOT NULL, -- Used as the display name (First + Surname)
            mobile_or_email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            dob TEXT,
            gender TEXT
        )`);

        // Create Posts table with image and feeling
        db.run(`CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            image TEXT,
            feeling TEXT,
            likes INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                // Seed mock posts if empty
                db.get("SELECT COUNT(*) as count FROM posts", (err, row) => {
                    if (row && row.count === 0) {
                        console.log("Seeding initial mock posts with African themes...");
                        const stmnt = db.prepare("INSERT INTO posts (username, content, image, likes) VALUES (?, ?, ?, ?)");
                        stmnt.run("Sanaa Nairobi", "Exploring the vibrant markets of Nairobi today! The colors of the Maasai beads are absolutely stunning. ❤️🇰🇪", "https://images.unsplash.com/photo-1542596594-649edbc13630", 145);
                        stmnt.run("Kwame Osei", "Just finished a fresh plate of Jollof rice. Who makes the best Jollof? The debate continues! 🥘😋", null, 89);
                        stmnt.run("Amara Wildlife", "A magnificent sunset view over the Serengeti. Nature is truly breathtaking. 🐘🌄", "https://images.unsplash.com/photo-1516426122078-c23e76319801", 312);
                        stmnt.run("Zuri Tech", "Exciting tech meetup happening in Lagos! Africa's tech ecosystem is booming right now. 🚀🇳🇬", null, 67);
                        stmnt.finalize();
                    }
                });
            }
        });

        // Create Likes table
        db.run(`CREATE TABLE IF NOT EXISTS post_likes (
            post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            PRIMARY KEY (post_id, user_id),
            FOREIGN KEY(post_id) REFERENCES posts(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Create Comments table
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(post_id) REFERENCES posts(id)
        )`);

        // Create Messages table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_username TEXT NOT NULL,
            receiver_username TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Friendships table
        db.run(`CREATE TABLE IF NOT EXISTS friendships (
            user1 TEXT NOT NULL,
            user2 TEXT NOT NULL,
            PRIMARY KEY (user1, user2)
        )`);
    }
});

export default db;
