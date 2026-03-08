import sqlite3
from collections import deque

class SocialGraph:
    def __init__(self):
        self.graph = {}
        self.db_path = 'social_network.db'
        self.load_from_db()

    def load_from_db(self):
        """Fills dictionary from SQL database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT name FROM users")
            for row in cursor.fetchall():
                self.graph[row[0]] = []
                
            query = '''
                SELECT u1.name, u2.name 
                FROM friendships f
                JOIN users u1 ON f.user_id = u1.id
                JOIN users u2 ON f.friend_id = u2.id
            '''
            cursor.execute(query)
            for u1, u2 in cursor.fetchall():
                if u2 not in self.graph[u1]: self.graph[u1].append(u2)
                if u1 not in self.graph[u2]: self.graph[u2].append(u1)
            
            conn.close()
        except sqlite3.OperationalError:
            print("Warning: Database tables not found. Run database.py first.")

    def add_user(self, name, bio="New to the network!"):
        """Saves user with a bio to the database."""
        if name not in self.graph:
            self.graph[name] = []
            try:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute("INSERT INTO users (name, bio) VALUES (?, ?)", (name, bio))
                conn.commit()
                conn.close()
                print(f"User {name} joined!")
            except sqlite3.IntegrityError:
                pass 

    def add_friendship(self, user1, user2):
        """Creates a bidirectional link in RAM and SQL."""
        if user1 in self.graph and user2 in self.graph:
            if user2 not in self.graph[user1]:
                # Update RAM
                self.graph[user1].append(user2)
                self.graph[user2].append(user1)
                
                # Update SQL
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM users WHERE name=?", (user1,))
                u1_id = cursor.fetchone()[0]
                cursor.execute("SELECT id FROM users WHERE name=?", (user2,))
                u2_id = cursor.fetchone()[0]

                try:
                    cursor.execute("INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)", (u1_id, u2_id))
                    cursor.execute("INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)", (u2_id, u1_id))
                    conn.commit()
                    print(f"✅ Connection made: {user1} <-> {user2}")
                except sqlite3.IntegrityError:
                    pass
                conn.close()

    def remove_friendship(self, user1, user2):
        """Removes connection from RAM and SQL database."""
        if user1 in self.graph and user2 in self.graph:
            if user2 in self.graph[user1]: self.graph[user1].remove(user2)
            if user1 in self.graph[user2]: self.graph[user2].remove(user1)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE name=?", (user1,))
            u1_id = cursor.fetchone()[0]
            cursor.execute("SELECT id FROM users WHERE name=?", (user2,))
            u2_id = cursor.fetchone()[0]
            
            cursor.execute("DELETE FROM friendships WHERE (user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)", 
                           (u1_id, u2_id, u2_id, u1_id))
            conn.commit()
            conn.close()
            print(f"❌ Connection removed: {user1} <-> {user2}")

    def add_post(self, username, content):
        """Saves post to SQL."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO posts (username, content) VALUES (?, ?)", (username, content))
        conn.commit()
        conn.close()

    def get_recent_posts(self):
        """Fetches raw post data for flexible formatting."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        # Fetching raw columns so main.py and app.py can handle formatting
        cursor.execute("SELECT username, content, timestamp FROM posts ORDER BY id DESC LIMIT 15")
        posts = cursor.fetchall() 
        conn.close()
        return posts

    def recommend_friends(self, user):
        """Finds 'friends of friends' not already connected to user."""
        if user not in self.graph: return []
        recommendations = {}
        my_friends = self.graph[user]
        for friend in my_friends:
            for fof in self.graph[friend]:
                if fof != user and fof not in my_friends:
                    recommendations[fof] = recommendations.get(fof, 0) + 1
        return sorted(recommendations.items(), key=lambda x: x[1], reverse=True)

    def find_connection_path(self, start, end):
        """BFS implementation to find the shortest path between users."""
        if start not in self.graph or end not in self.graph: return None
        if start == end: return [start]
        
        queue = deque([[start]])
        visited = {start}
        
        while queue:
            path = queue.popleft()
            node = path[-1]
            
            for neighbor in self.graph.get(node, []):
                if neighbor == end:
                    return path + [neighbor]
                if neighbor not in visited:
                    visited.add(neighbor)
                    new_path = list(path)
                    new_path.append(neighbor)
                    queue.append(new_path)
        return None
