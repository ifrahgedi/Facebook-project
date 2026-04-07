import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'fb_lite_super_secret_key';

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Auth Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

function timeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString + 'Z')) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " m";
    return "Just now";
}

// ---------------------------
// AUTHENTICATION ROUTES
// ---------------------------
app.post('/api/register', async (req, res) => {
    const { first_name, surname, mobile_or_email, dob, gender, password } = req.body;
    if (!first_name || !surname || !mobile_or_email || !password) return res.status(400).json({ error: "Missing required fields" });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const username = `${first_name} ${surname}`; // Use combination as display username
        db.run(
            "INSERT INTO users (first_name, surname, mobile_or_email, dob, gender, password, username) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [first_name, surname, mobile_or_email, dob, gender, hashedPassword, username], 
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: "Email/Phone already registered or Name exists" });
                    return res.status(500).json({ error: "Database error" });
                }
                // Create automatic welcome post
                const welcomeMsg = `Hello everyone! I just joined Facebook Lite. 👋`;
                db.run("INSERT INTO posts (username, content) VALUES (?, ?)", [username, welcomeMsg]);
                res.json({ message: "Registration successful" });
        });
    } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post('/api/login', (req, res) => {
    const { mobile_or_email, password } = req.body;
    db.get("SELECT * FROM users WHERE mobile_or_email = ?", [mobile_or_email], async (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(400).json({ error: "User not found" });
        if (await bcrypt.compare(password, row.password)) {
            const token = jwt.sign({ id: row.id, username: row.username }, SECRET_KEY);
            res.json({ token, username: row.username });
        } else {
            res.status(401).json({ error: "Incorrect password" });
        }
    });
});

// ---------------------------
// USER SEARCH & LISTING
// ---------------------------
app.get('/api/users', authenticateToken, (req, res) => {
    // Return all usernames except the logged in user
    db.all("SELECT username FROM users WHERE username != ?", [req.user.username], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ users: rows.map(r => r.username) });
    });
});

app.get('/api/search/users', authenticateToken, (req, res) => {
    const q = req.query.q || '';
    if (!q) return res.json({ users: [] });
    // Find users by username, first_name, or surname
    const searchString = `%${q}%`;
    const sql = `SELECT username FROM users WHERE (username LIKE ? OR first_name LIKE ? OR surname LIKE ?) AND username != ?`;
    db.all(sql, [searchString, searchString, searchString, req.user.username], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ users: rows.map(r => r.username) });
    });
});

// ---------------------------
// FRIENDSHIP ROUTES
// ---------------------------
app.get('/api/friends', authenticateToken, (req, res) => {
    const username = req.user.username;
    // Get all friendships for current user
    db.all("SELECT * FROM friendships WHERE user1 = ? OR user2 = ?", [username, username], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const friends = rows.map(r => r.user1 === username ? r.user2 : r.user1);
        res.json({ friends });
    });
});

app.post('/api/friends/:username', authenticateToken, (req, res) => {
    const user1 = req.user.username;
    const user2 = req.params.username;
    if (user1 === user2) return res.status(400).json({ error: "Cannot add yourself as friend" });
    
    // Sort so (A, B) is same as (B, A) in DB
    const [u1, u2] = [user1, user2].sort();
    db.run("INSERT INTO friendships (user1, user2) VALUES (?, ?)", [u1, u2], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: "Already friends" });
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Friend added" });
    });
});

// ---------------------------
// POST ROUTES
// ---------------------------
app.get('/api/posts/trending', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT p.*, 
        CASE WHEN pl.user_id IS NOT NULL THEN 1 ELSE 0 END as isLiked,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as commentCount
        FROM posts p
        LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = ?
        ORDER BY p.likes DESC LIMIT 5
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const posts = rows.map(row => ({
            id: row.id,
            author: row.username,
            authorInitial: row.username.charAt(0).toUpperCase(),
            time: timeAgo(row.created_at),
            content: row.content,
            image: row.image,
            feeling: row.feeling,
            likes: row.likes,
            isLiked: row.isLiked === 1,
            comments: row.commentCount || 0
        }));
        res.json({ posts });
    });
});

app.get('/api/posts', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT p.*, 
        CASE WHEN pl.user_id IS NOT NULL THEN 1 ELSE 0 END as isLiked,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as commentCount
        FROM posts p
        LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = ?
        ORDER BY p.created_at DESC
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const posts = rows.map(row => ({
            id: row.id,
            author: row.username,
            authorInitial: row.username.charAt(0).toUpperCase(),
            time: timeAgo(row.created_at),
            content: row.content,
            image: row.image,
            feeling: row.feeling,
            likes: row.likes,
            isLiked: row.isLiked === 1,
            comments: row.commentCount || 0
        }));
        res.json({ posts });
    });
});

app.post('/api/posts', authenticateToken, (req, res) => {
    const { content, image, feeling } = req.body;
    if (!content && !image) return res.status(400).json({ error: "Content or Image required" });
    const username = req.user.username;
    db.run("INSERT INTO posts (username, content, image, feeling) VALUES (?, ?, ?, ?)", [username, content || '', image || null, feeling || null], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get("SELECT * FROM posts WHERE id = ?", [this.lastID], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                post: {
                     id: row.id,
                     author: row.username,
                     authorInitial: row.username.charAt(0).toUpperCase(),
                     time: "Just now",
                     content: row.content,
                     image: row.image,
                     feeling: row.feeling,
                     likes: row.likes,
                     isLiked: false,
                     comments: 0
                }
            });
        });
    });
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    db.get("SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?", [postId, userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            db.run("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?", [postId, userId], (err) => {
                if (!err) db.run("UPDATE posts SET likes = likes - 1 WHERE id = ?", [postId]);
                res.json({ liked: false });
            });
        } else {
            db.run("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)", [postId, userId], (err) => {
                 if (!err) db.run("UPDATE posts SET likes = likes + 1 WHERE id = ?", [postId]);
                 res.json({ liked: true });
            });
        }
    });
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
    const postId = req.params.id;
    const username = req.user.username;
    // ensure the post belongs to the user
    db.run("DELETE FROM posts WHERE id = ? AND username = ?", [postId, username], function(err) {
         if (err) return res.status(500).json({ error: err.message });
         if (this.changes === 0) return res.status(403).json({ error: "Unauthorized or Post Not Found" });
         
         // Clean up dependencies (likes, comments)
         db.run("DELETE FROM post_likes WHERE post_id = ?", [postId]);
         db.run("DELETE FROM comments WHERE post_id = ?", [postId]);
         res.json({ message: "Post deleted" });
    });
});

app.put('/api/posts/:id', authenticateToken, (req, res) => {
    const postId = req.params.id;
    const username = req.user.username;
    const { content, image } = req.body;
    db.run(
        "UPDATE posts SET content = ?, image = ? WHERE id = ? AND username = ?", 
        [content || '', image || null, postId, username], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(403).json({ error: "Unauthorized or Post Not Found" });
            db.get("SELECT * FROM posts WHERE id = ?", [postId], (fetchErr, row) => {
                 if (fetchErr) return res.status(500).json({ error: fetchErr.message });
                 res.json({ post: row });
            });
        }
    );
});

// ---------------------------
// COMMENT ROUTES
// ---------------------------
app.get('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const postId = req.params.id;
    db.all("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC", [postId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const comments = rows.map(row => ({
            id: row.id,
            username: row.username,
            usernameInitial: row.username.charAt(0).toUpperCase(),
            content: row.content,
            time: timeAgo(row.created_at)
        }));
        res.json({ comments });
    });
});

app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    const username = req.user.username;
    if (!content) return res.status(400).json({ error: "Content required" });
    db.run("INSERT INTO comments (post_id, username, content) VALUES (?, ?, ?)", [postId, username, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get("SELECT * FROM comments WHERE id = ?", [this.lastID], (err, row) => {
             res.json({
                 comment: {
                     id: row.id,
                     username: row.username,
                     usernameInitial: row.username.charAt(0).toUpperCase(),
                     content: row.content,
                     time: "Just now"
                 }
             });
        });
    });
});

// ---------------------------
// MESSAGE ROUTES
// ---------------------------
app.get('/api/messages/:username', authenticateToken, (req, res) => {
    const otherUser = req.params.username;
    const myUser = req.user.username;
    const sql = `
        SELECT * FROM messages 
        WHERE (sender_username = ? AND receiver_username = ?)
           OR (sender_username = ? AND receiver_username = ?)
        ORDER BY created_at ASC
    `;
    db.all(sql, [myUser, otherUser, otherUser, myUser], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ messages: rows });
    });
});

app.post('/api/messages/:username', authenticateToken, (req, res) => {
    const receiverUser = req.params.username;
    const myUser = req.user.username;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });
    
    db.run("INSERT INTO messages (sender_username, receiver_username, content) VALUES (?, ?, ?)", 
        [myUser, receiverUser, content], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.get("SELECT * FROM messages WHERE id = ?", [this.lastID], (err, row) => {
                res.json({ message: row });
            });
    });
});

app.delete('/api/posts/:postId/comments/:commentId', authenticateToken, (req, res) => {
    const { postId, commentId } = req.params;
    const username = req.user.username;
    db.run("DELETE FROM comments WHERE id = ? AND post_id = ? AND username = ?", [commentId, postId, username], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(403).json({ error: "Unauthorized or Comment Not Found" });
        res.json({ message: "Comment deleted" });
    });
});

app.listen(PORT, () => {
    console.log(`Server API listening on http://localhost:${PORT}`);
});
