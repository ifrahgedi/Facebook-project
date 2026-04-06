from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.utils import secure_filename
import sqlite3
import os

app = Flask(__name__)
app.secret_key = "secret123"

# --- Configuration for Uploads ---
UPLOAD_FOLDER = os.path.join('static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db_connection():
    conn = sqlite3.connect('social_network.db')
    conn.row_factory = sqlite3.Row 
    return conn

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # We use 'email' from the form name attribute
        email = request.form.get("email") 
        password = request.form.get("password")
        
        db = get_db_connection()
        user = db.execute('SELECT * FROM users WHERE email = ? AND password = ?', 
                         (email, password)).fetchone()
        db.close()

        if user:
            session["user_id"] = user['id']
            session["user"] = user['username']
            return redirect(url_for("home_page"))
        else:
            flash("Invalid email or password.")
            
    return render_template("login.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        
        db = get_db_connection()
        try:
            db.execute('''
                INSERT INTO users (username, email, password, is_verified) 
                VALUES (?, ?, ?, 0)
            ''', (username, email, password))
            db.commit()
            
            user = db.execute('SELECT id, username FROM users WHERE email = ?', (email,)).fetchone()
            session["user_id"] = user['id']
            session["user"] = user['username']
            db.close()
            return redirect(url_for("home_page"))
            
        except sqlite3.IntegrityError:
            db.close()
            flash("Username or Email already exists!")
            return redirect(url_for("signup"))
            
    return render_template("signup.html")

@app.route("/home")
def home_page():
    if "user_id" not in session:
        return redirect(url_for("login"))
    
    db = get_db_connection()
    # JOIN to get the correct username for each post
    posts = db.execute('''
        SELECT posts.*, users.username, users.profile_pic 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        ORDER BY timestamp DESC
    ''').fetchall()
    db.close()
    
    return render_template("home.html", user=session["user"], feed=posts)


@app.route("/create_post", methods=["POST"])
def create_post():
    if "user_id" not in session:
        return redirect(url_for("login"))
    
    content = request.form.get("content")
    user_id = session["user_id"] # Use the ID we stored at login
    
    if content:
        db = get_db_connection()
        db.execute('INSERT INTO posts (user_id, content) VALUES (?, ?)', 
                   (user_id, content))
        db.commit()
        db.close()
        
    return redirect(url_for("home_page"))

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)
