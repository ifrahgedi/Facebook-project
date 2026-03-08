from graph import SocialGraph

# Create the instance
fb = SocialGraph()

print("--- Step 1: Adding Users with Bios ---")
# We assume add_user now accepts an optional bio
fb.add_user("Quentin", bio="Lead Developer of FB Lite")
fb.add_user("Brian", bio="Graph Theory Enthusiast")
fb.add_user("Amina", bio="Frontend Specialist")
fb.add_user("Kevin", bio="Database Architect")

print("\n--- Step 2: Creating Friendships ---")
fb.add_friendship("Quentin", "Brian")
fb.add_friendship("Quentin", "Amina")
fb.add_friendship("Brian", "Kevin")

print("\n--- Step 3: Testing the Global Feed ---")
# Testing the new 'posts' table functionality
fb.add_post("Quentin", "I just updated the database to support bios and likes!")
fb.add_post("Amina", "The UI is looking great with these new data points.")
fb.add_post("Brian", "Does anyone know how to optimize a BFS algorithm?")

print("\n--- Step 4: Visualizing the Live Feed ---")
# This pulls the latest 10 posts from the SQL database
feed = fb.get_recent_posts()
for post in feed:
    # post[0] = username, post[1] = content, post[2] = timestamp
    print(f"[{post[2]}] {post[0]}: {post[1]}")

print("\n--- Step 5: Friend Recommendations ---")
suggestions = fb.recommend_friends("Quentin")
if not suggestions:
    print("No new suggestions found.")
for person, count in suggestions:
    print(f"Suggestion: {person} ({count} mutual friend(s))")

print("\n--- Step 6: Finding a Path (BFS) ---")
path = fb.find_connection_path("Quentin", "Kevin")
if path:
    print(f"Path found: {' -> '.join(path)}")
else:
    print("No connection found.")
