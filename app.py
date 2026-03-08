from flask import Flask, render_template, request, redirect, url_for, session
from graph import SocialGraph

app = Flask(__name__)
app.secret_key = "secret123" 

# YOUR Engine: This loads all data from social_network.db automatically
fb = SocialGraph()

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password", "password123") # Default for now
        
        # Updated Logic: Check if user exists or create new one with default bio
        fb.add_user(username, bio="New to the network!") 
        session["user"] = username
        return redirect("/home")
    return render_template("login.html")

@app.route("/home")
def home():
    if "user" not in session:
        return redirect("/")
    
    current_user = session["user"]
    
    # Fetching expanded data from the ENGINE
    feed = fb.get_recent_posts()
    my_friends = fb.graph.get(current_user, [])
    recommendations = fb.recommend_friends(current_user)
    
    return render_template("home.html", 
                           user=current_user, 
                           feed=feed,
                           friends=my_friends,
                           recommendations=recommendations)

@app.route("/post", methods=["POST"])
def post():
    if "user" in session:
        user = session["user"]
        content = request.form.get("content")
        fb.add_post(user, content)
    return redirect("/home")

@app.route("/add_friend", methods=["POST"])
def add_friend():
    if "user" in session:
        user = session["user"]
        friend = request.form.get("friend")
        fb.add_friendship(user, friend)
    return redirect("/home")

@app.route("/remove_friend", methods=["POST"])
def remove_friend():
    if "user" in session:
        user = session["user"]
        friend = request.form.get("friend")
        # NEW: Deletes the connection from SQL and the Graph Dictionary
        fb.remove_friendship(user, friend)
    return redirect("/home")

@app.route("/search", methods=["POST"])
def search():
    if "user" not in session:
        return redirect("/")
    
    query = request.form.get("query")
    current_user = session["user"]
    
    result_user = None
    connection_path = None
    
    if query in fb.graph:
        result_user = query
        connection_path = fb.find_connection_path(current_user, query)
    
    feed = fb.get_recent_posts()
    my_friends = fb.graph.get(current_user, [])
    recommendations = fb.recommend_friends(current_user)
    
    return render_template("home.html", 
                           user=current_user, 
                           feed=feed,
                           friends=my_friends,
                           recommendations=recommendations,
                           search_result=result_user,
                           path=connection_path)

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect("/")

if __name__ == "__main__":
    app.run(debug=True)
