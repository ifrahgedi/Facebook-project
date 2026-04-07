DATA STRUCTURES & ALGORITHMS PROJECT REPORT
Facebook- System

Group Members
Valentine Nudi BSCCS/2025/52984
BSCCS/2025/38999 Ifrah Abdirahman
BSCCS/2025/41758 Kirimi Kawira
BSCCS/2025/39474 Mohamed Abdisamed Ali
BSCCS/2025/40317 Quentin Omwenga


1. Introduction
This project presents the design and implementation of a simplified social networking system (“Facebook-lite”) that demonstrates the application of core data structures and algorithms.
The system allows users to:
    • Create profiles 
    • Add friends 
    • Create and interact with posts 
    • Receive notifications 
    • View a ranked news feed 
The primary goal is not just functionality, but to apply efficient data structures to ensure scalability, performance, and real-world relevance.
The system is implemented using a modular architecture, with a focus on backend logic and algorithmic efficiency.

2. Use Cases
The system supports the following key use cases:
User Management
    • User registration and login 
    • Profile creation and updates 
Social Interaction
    • Add/remove friends 
    • View mutual friends 
    • Get friend suggestions 
Content Management
    • Create, edit, and delete posts 
    • Like and comment on posts 
Feed & Discovery
    • View personalized news feed 
    • View trending/top posts 
Notifications
    • Receive notifications for: 
        ◦ Friend requests 
        ◦ Likes and comments 

3. Constraints and Analysis
Functional Constraints
    • Fast user lookup is required 
    • Real-time updates for notifications 
    • Efficient ranking of posts 
Non-Functional Constraints
    • System should scale to thousands of users 
    • Low latency for feed generation 
    • Efficient memory usage 
Assumptions
    • Moderate dataset (not millions, but scalable design) 
    • Single-server simulation (no real distributed deployment) 

4. Basic Design
The system follows a simplified architecture:
Components:
    • Frontend: User interface (interaction layer) 
    • Backend: Core logic and data processing 
    • Data Storage: In-memory structures (maps, queues, etc.) 
Flow:
    1. User performs action (e.g., create post) 
    2. Backend processes request 
    3. Data structures update state 
    4. System returns result 
Key Design Idea:
Each feature is built around a specific data structure, ensuring efficiency and clarity.


5. Bottlenecks
Several potential bottlenecks were identified:
1. Feed Generation
    • Sorting large numbers of posts can be slow 
2. Graph Traversal
    • Friend suggestions using BFS can become expensive as users grow 
3. Notification Processing
    • Large queues may delay real-time delivery 
4. Search Operations
    • Searching without indexing can degrade performance 

6. Scalability
To address bottlenecks, the following strategies were considered:
Feed Optimization
    • Use priority queues to avoid full sorting 
Graph Optimization
    • Limit BFS depth for friend suggestions 
Queue Optimization
    • Process notifications asynchronously 
Data Partitioning
    • Users and posts can be split using hashing 
Caching
    • Frequently accessed data (e.g., feed) can be cached 


7. Data Structures Used
This system integrates multiple data structures to achieve efficiency:


7.1 Hash Table / Map
Usage:
    • User ID → user profile 
    • Post ID → post data 
    • Session/token storage 
Justification:
Hash tables provide O(1) average time complexity, making them essential for fast lookups in large systems.
7.2 Stack
Usage:
    • Undo operations (post editing) 
    • History tracking 
Justification:
Stacks follow LIFO (Last In First Out), making them ideal for undo/redo functionality.


7.3 Queue
Usage:
    • Notification system 
    • Message delivery 
    • Background processing 
Justification:
Queues follow FIFO (First In First Out), ensuring tasks are processed in the correct order.


7.4 Heap / Priority Queue
Usage:
    • Ranking posts in the news feed 
    • Retrieving top-k posts 
Justification:
Priority queues allow efficient retrieval of highest-priority items in O(log n) time, making them ideal for ranking systems.


7.5 Graph
Usage:
    • Users as nodes 
    • Friendships as edges 
Features Enabled:
    • Friend suggestions 
    • Mutual friends 
    • Network traversal 
Justification:
Social networks are naturally modeled as graphs, and BFS/DFS enables efficient relationship exploration.


7.6 Sorting and Searching
Usage:
    • Sorting posts (by likes or recency) 
    • Searching users and content 
Justification:
Sorting improves content organization, while searching enables efficient data retrieval.


8. Complexity Analysis
Hash Map
    • Insert/Search: O(1) average 
Stack
    • Push/Pop: O(1) 
Queue
    • Enqueue/Dequeue: O(1) 
Heap
    • Insert/Delete: O(log n) 
Graph (BFS)
    • Time Complexity: O(V + E) 
Sorting
    • Time Complexity: O(n log n) 
Searching (Binary Search)
    • Time Complexity: O(log n) 


9. Testing
Test Cases
Feature
Input
Expected Output
Add user
user123
User created
Add friend
user1, user2
Friendship established
Create post
text
Post added
Like post
postID
Likes incremented

Edge Cases
    • Duplicate users 
    • Empty feed 
    • Large number of notifications 

Benchmark (Basic)
    • User lookup: near-instant (O(1)) 
    • Feed sorting: increases with number of posts 
    • BFS: increases with number of users 
10. Conclusion
This project demonstrates how fundamental data structures and algorithms can be applied to design a scalable and efficient social networking system.
By integrating hash maps, stacks, queues, heaps, graphs, and sorting/searching techniques, the system achieves both functionality and performance.
The project highlights the importance of:
    • Choosing the right data structure 
    • Understanding algorithm complexity 
    • Designing for scalability from the start
