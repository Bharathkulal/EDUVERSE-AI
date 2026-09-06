import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Award, FileText, CheckCircle2, ChevronRight, Play, RotateCcw, 
  User, Mail, Phone, BookOpen, Star, AlertCircle, Shield, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const HASH_TO_TAB = {
  '#resume': 'resume',
  '#placement': 'placement',
  '#company': 'company',
  '#interview': 'interview',
  '#aptitude': 'aptitude',
  '#portfolio': 'portfolio',
  '#certifications': 'certifications',
};

export default function CareerHub() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('resume');
  
  // States for Resume builder
  const [resumeName, setResumeName] = useState('Bharath Kulal');
  const [resumeEmail, setResumeEmail] = useState('bharath@eduverse.ai');
  const [resumePhone, setResumePhone] = useState('+91 9876543210');
  const [resumeSkills, setResumeSkills] = useState('React, Node.js, Python, SQL, DSA');
  const [generatedResume, setGeneratedResume] = useState(null);

  // States for Placement prep Q&A
  const [prepMode, setPrepMode] = useState('lobby'); // lobby, study
  const [selectedPrepTopic, setSelectedPrepTopic] = useState('');
  const [prepIndex, setPrepIndex] = useState(0);

  // States for Company Qs
  const [companyMode, setCompanyMode] = useState('lobby'); // lobby, questions
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyAnswers, setCompanyAnswers] = useState({});
  const [companyScore, setCompanyScore] = useState(null);

  // States for Interview prep
  const [interviewMode, setInterviewMode] = useState('lobby'); // lobby, active, evaluation
  const [interviewType, setInterviewType] = useState('');
  const [interviewIdx, setInterviewIdx] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState({});

  // States for Aptitude
  const [aptitudeMode, setAptitudeMode] = useState('lobby'); // lobby, test, result
  const [selectedAptTopic, setSelectedAptTopic] = useState(null);
  const [aptIdx, setAptIdx] = useState(0);
  const [selectedAptAns, setSelectedAptAns] = useState('');
  const [aptAnswers, setAptAnswers] = useState({});
  const [aptScore, setAptScore] = useState(0);

  // States for Portfolio
  const [portfolioGenerated, setPortfolioGenerated] = useState(false);

  // States for Certifications
  const [activeLearningCert, setActiveLearningCert] = useState(null);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);

  const [certs, setCerts] = useState([
    {
      id: 1,
      name: 'Java Fundamentals',
      provider: 'EduVerse AI',
      icon: '☕',
      color: 'from-orange-500 to-red-500',
      progress: 100,
      modules: [
        { id: 'j1', title: 'Unit 1: Java Syntax & Primitive Types', desc: 'Variables, primitives, operators, and type casting', duration: '40 mins', completed: true, keyPoints: ['Primitive data types (int, float, char, boolean)', 'Operator precedence & arithmetic expressions', 'Implicit & explicit type casting rules'], codeSnippet: 'public class Main {\n  public static void main(String[] args) {\n    int age = 22;\n    System.out.println("Age: " + age);\n  }\n}' },
        { id: 'j2', title: 'Unit 2: Control Flow & Decision Logic', desc: 'If-else branching, switch statements, for & while loops', duration: '45 mins', completed: true, keyPoints: ['Conditional execution paths', 'Loop control (break & continue)', 'Switch expressions & pattern matching'], codeSnippet: 'for (int i = 0; i < 5; i++) {\n  System.out.println("Iteration " + i);\n}' },
        { id: 'j3', title: 'Unit 3: Object-Oriented Principles', desc: 'Classes, Objects, Inheritance, Encapsulation, Polymorphism', duration: '60 mins', completed: true, keyPoints: ['Class definitions & constructors', 'Method overriding vs overloading', 'Abstract classes & Interfaces'], codeSnippet: 'class Animal {\n  void sound() { System.out.println("Animal sound"); }\n}' },
        { id: 'j4', title: 'Unit 4: Exception Handling & File I/O', desc: 'Try-catch blocks, throw, custom exceptions, file streams', duration: '50 mins', completed: true, keyPoints: ['Checked vs unchecked exceptions', 'Try-with-resources statement', 'BufferedReader & FileWriter streams'], codeSnippet: 'try {\n  int res = 10 / 0;\n} catch (ArithmeticException e) {\n  System.err.println(e.getMessage());\n}' },
        { id: 'j5', title: 'Unit 5: Java Collections Framework', desc: 'List, Set, Map, ArrayList, HashMap, Iterators', duration: '55 mins', completed: true, keyPoints: ['ArrayList vs LinkedList performance', 'HashSet & HashMap hashing mechanism', 'Sorting with Comparable & Comparator'], codeSnippet: 'List<String> list = new ArrayList<>();\nlist.add("Java");\nSystem.out.println(list);' }
      ]
    },
    {
      id: 2,
      name: 'DSA Mastery',
      provider: 'EduVerse AI',
      icon: '🌳',
      color: 'from-green-500 to-emerald-500',
      progress: 71,
      modules: [
        { id: 'd1', title: 'Module 1: Big O & Complexity Analysis', desc: 'Time and space complexity analysis, asymptotic notation', duration: '35 mins', completed: true, keyPoints: ['O(1), O(log n), O(n), O(n log n), O(n^2)', 'Best, Average, and Worst case analysis', 'Space complexity & recursion stack memory'], codeSnippet: '// Binary Search O(log n)\nint binarySearch(int[] arr, int target) {\n  int low = 0, high = arr.length - 1;\n  while(low <= high) {\n    int mid = low + (high - low) / 2;\n    if(arr[mid] == target) return mid;\n    else if(arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}' },
        { id: 'd2', title: 'Module 2: Arrays & Two Pointers', desc: 'Array operations, sliding window, two pointer techniques', duration: '50 mins', completed: true, keyPoints: ['In-place element manipulation', 'Two pointers (opposite & same direction)', 'Sliding window maximums'], codeSnippet: '// Two Pointers sum\nint i = 0, j = arr.length - 1;\nwhile(i < j) {\n  if(arr[i] + arr[j] == target) break;\n}' },
        { id: 'd3', title: 'Module 3: Stacks & Queues', desc: 'LIFO & FIFO operations, monotonic stack, circular queue', duration: '45 mins', completed: true, keyPoints: ['Stack with push, pop, peek', 'Queue using array & linked list', 'Next Greater Element problem'], codeSnippet: 'Stack<Integer> st = new Stack<>();\nst.push(10);\nint val = st.pop();' },
        { id: 'd4', title: 'Module 4: Linked Lists & Pointers', desc: 'Singly, Doubly, Circular Linked Lists, reversing list', duration: '55 mins', completed: true, keyPoints: ['Node structure & pointer manipulation', 'Floyd Cycle Detection (Fast & Slow pointer)', 'Reversing linked list iteratively'], codeSnippet: 'ListNode prev = null, curr = head;\nwhile(curr != null) {\n  ListNode next = curr.next;\n  curr.next = prev;\n  prev = curr;\n  curr = next;\n}' },
        { id: 'd5', title: 'Module 5: Binary Trees & BST', desc: 'Tree traversals (Pre, In, Post, Level), BST insertion & deletion', duration: '60 mins', completed: true, keyPoints: ['Recursive & Iterative Traversals', 'Lowest Common Ancestor (LCA)', 'Validating BST properties'], codeSnippet: 'void inorder(TreeNode root) {\n  if(root == null) return;\n  inorder(root.left);\n  System.out.println(root.val);\n  inorder(root.right);\n}' },
        { id: 'd6', title: 'Module 6: Graph Algorithms', desc: 'Graph representation (Adjacency List), BFS, DFS, Dijkstra', duration: '65 mins', completed: false, keyPoints: ['Breadth First Search (Queue)', 'Depth First Search (Stack/Recursion)', 'Shortest path algorithms'], codeSnippet: '// BFS Traversal\nQueue<Integer> q = new LinkedList<>();\nq.add(start);\nvisited[start] = true;' },
        { id: 'd7', title: 'Module 7: Dynamic Programming', desc: 'Memoization vs Tabulation, 0/1 Knapsack, LCS', duration: '75 mins', completed: false, keyPoints: ['Optimal Substructure & Overlapping Subproblems', 'Top-down vs Bottom-up approaches', 'Space optimization techniques'], codeSnippet: 'int[] dp = new int[n + 1];\ndp[0] = 0;\ndp[1] = 1;\nfor(int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];' }
      ]
    },
    {
      id: 3,
      name: 'Python Developer',
      provider: 'EduVerse AI',
      icon: '🐍',
      color: 'from-blue-500 to-cyan-500',
      progress: 50,
      modules: [
        { id: 'p1', title: 'Lesson 1: Python Fundamentals & Collections', desc: 'Variables, Lists, Tuples, Dictionaries, Sets, Comprehensions', duration: '40 mins', completed: true, keyPoints: ['Mutable vs Immutable data types', 'Dictionary key-value lookups', 'List comprehensions syntax'], codeSnippet: 'squares = [x**2 for x in range(10) if x % 2 == 0]\nprint(squares)' },
        { id: 'p2', title: 'Lesson 2: Functions, Decorators & Generators', desc: 'Def, *args, **kwargs, lambda functions, decorators, yield', duration: '50 mins', completed: true, keyPoints: ['First-class functions & closures', 'Writing custom decorators with @fn', 'Memory-efficient generators with yield'], codeSnippet: 'def my_decorator(func):\n  def wrapper():\n    print("Before")\n    func()\n    print("After")\n  return wrapper' },
        { id: 'p3', title: 'Lesson 3: OOP & Modules in Python', desc: 'Classes, __init__, dunder methods, inheritance, modules', duration: '45 mins', completed: true, keyPoints: ['Self reference & instance attributes', 'Dunder methods (__str__, __repr__)', 'Importing custom modules'], codeSnippet: 'class Developer:\n  def __init__(self, name):\n    self.name = name' },
        { id: 'p4', title: 'Lesson 4: File I/O, Web Scraping & APIs', desc: 'Open context manager, Requests library, BeautifulSoup', duration: '55 mins', completed: false, keyPoints: ['With open(...) as f:', 'HTTP GET/POST requests', 'HTML parsing with BeautifulSoup'], codeSnippet: 'import requests\nres = requests.get("https://api.github.com")\nprint(res.json())' },
        { id: 'p5', title: 'Lesson 5: Data Analysis with Pandas & NumPy', desc: 'DataFrames, Series, filtering, aggregation, matrix operations', duration: '60 mins', completed: false, keyPoints: ['NumPy arrays & broadcasting', 'Pandas read_csv & groupby', 'Data cleaning & missing values'], codeSnippet: 'import pandas as pd\ndf = pd.read_csv("data.csv")\nprint(df.describe())' },
        { id: 'p6', title: 'Lesson 6: Web Backend APIs with FastAPI', desc: 'Routing, Pydantic models, Async endpoints, Swagger docs', duration: '65 mins', completed: false, keyPoints: ['Async def endpoint handlers', 'Request body validation with Pydantic', 'Auto OpenAPI / Swagger UI'], codeSnippet: 'from fastapi import FastAPI\napp = FastAPI()\n@app.get("/")\ndef read_root(): return {"message": "Hello"}' }
      ]
    },
    {
      id: 4,
      name: 'Database Expert',
      provider: 'EduVerse AI',
      icon: '🗄️',
      color: 'from-yellow-500 to-amber-500',
      progress: 20,
      modules: [
        { id: 'db1', title: 'Chapter 1: Relational Architecture & SQL Queries', desc: 'SELECT, WHERE, GROUP BY, HAVING, ORDER BY, Subqueries', duration: '40 mins', completed: true, keyPoints: ['SQL clause evaluation order', 'Aggregate functions (COUNT, SUM, AVG)', 'Filtering grouped data with HAVING'], codeSnippet: 'SELECT dept, COUNT(*) FROM employees\nWHERE status = \'active\'\nGROUP BY dept HAVING COUNT(*) > 5;' },
        { id: 'db2', title: 'Chapter 2: Table Joins & Relational Algebra', desc: 'INNER, LEFT, RIGHT, FULL OUTER, CROSS JOINs, Union', duration: '50 mins', completed: false, keyPoints: ['Cartesian product & JOIN conditions', 'Self joins & hierarchical queries', 'Relational algebra operations'], codeSnippet: 'SELECT e.name, d.department_name\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.id;' },
        { id: 'db3', title: 'Chapter 3: Database Normalization (1NF to BCNF)', desc: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF decomposition', duration: '55 mins', completed: false, keyPoints: ['Removing partial dependencies (2NF)', 'Removing transitive dependencies (3NF)', 'Boyce-Codd Normal Form (BCNF)'], codeSnippet: '-- 3NF Table Split\nCREATE TABLE Departments (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(100)\n);' },
        { id: 'db4', title: 'Chapter 4: Indexing, B-Trees & Performance Tuning', desc: 'Clustered vs Non-clustered indexes, B-Tree structures, EXPLAIN', duration: '60 mins', completed: false, keyPoints: ['Primary vs secondary indexes', 'Composite index column order', 'Analyzing execution plans with EXPLAIN'], codeSnippet: 'CREATE INDEX idx_user_email ON users(email);' },
        { id: 'db5', title: 'Chapter 5: Transactions, ACID & Locking', desc: 'BEGIN, COMMIT, ROLLBACK, Isolation levels, Deadlocks', duration: '60 mins', completed: false, keyPoints: ['Atomicity, Consistency, Isolation, Durability', 'Read Uncommitted to Serializable', 'Shared vs Exclusive Locks'], codeSnippet: 'BEGIN TRANSACTION;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;' }
      ]
    }
  ]);

  const companyQuestions = [
    { company: 'Google', role: 'SDE Intern', difficulty: 'Hard', questions: 45, icon: '🔍' },
    { company: 'Microsoft', role: 'SDE 1', difficulty: 'Medium', questions: 62, icon: '🪟' },
    { company: 'Amazon', role: 'SDE Intern', difficulty: 'Medium', questions: 78, icon: '📦' },
    { company: 'TCS', role: 'Developer', difficulty: 'Easy', questions: 120, icon: '💻' },
    { company: 'Infosys', role: 'SE', difficulty: 'Easy', questions: 95, icon: '🔷' },
    { company: 'Wipro', role: 'Developer', difficulty: 'Easy', questions: 88, icon: '🌐' },
  ];

  const aptitudeTopics = [
    { topic: 'Quantitative Aptitude', questions: 250, completed: 45, icon: '🔢' },
    { topic: 'Logical Reasoning', questions: 200, completed: 30, icon: '🧩' },
    { topic: 'Verbal Ability', questions: 180, completed: 20, icon: '📝' },
    { topic: 'Data Interpretation', questions: 120, completed: 10, icon: '📊' },
    { topic: 'Attention to Detail', questions: 150, completed: 25, icon: '🔍' },
    { topic: 'Spatial Ability', questions: 100, completed: 15, icon: '📐' },
  ];

  const interviewTracks = [
    { type: 'Technical Interview', desc: 'Data structures, algorithms, OOP, code efficiency', icon: '💻' },
    { type: 'Behavioral Interview', desc: 'Teamwork, leadership, situational questions', icon: '🎙️' },
    { type: 'System Design', desc: 'Architecture, scalability, load balancing, databases', icon: '🏗️' },
    { type: 'Frontend Interview', desc: 'HTML, CSS, React, browser rendering, performance', icon: '🎨' },
    { type: 'Database & SQL Interview', desc: 'Indexing, ACID properties, queries, replication', icon: '🗄️' },
    { type: 'Managerial / HR Interview', desc: 'Conflict resolution, growth mindset, career alignment', icon: '🤝' },
  ];

  const [activeCertCertificate, setActiveCertCertificate] = useState(null);

  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_TAB[hash]) {
      setActiveTab(HASH_TO_TAB[hash]);
    }
  }, [location.hash]);

  const tabs = [
    { id: 'resume', label: 'Resume Builder', icon: '📄' },
    { id: 'placement', label: 'Placement Prep', icon: '🎓' },
    { id: 'company', label: 'Company Qs', icon: '🏢' },
    { id: 'interview', label: 'Interview Prep', icon: '🎤' },
    { id: 'aptitude', label: 'Aptitude', icon: '🧮' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'certifications', label: 'Certifications', icon: '🏆' },
  ];

  // Mock Placement Prep Questions
  const prepQuestions = {
    'Technical Round Prep': [
      { q: 'What is a binary search tree?', a: 'A tree data structure where each node has at most two children, the left child has a key less than the parent, and the right child has a key greater than the parent. Searching, insertion, and deletion take O(log n) average time.' },
      { q: 'Explain polymorphic behavior.', a: 'Allowing subclasses to provide custom overriding implementations for parent functions. Method call resolution is dynamically resolved at runtime (dynamic dispatch / runtime polymorphism).' },
      { q: 'What is the difference between a process and a thread?', a: 'A process is an independent execution unit with its own memory space allocated by the OS. A thread is a lightweight subset of a process that shares memory and resources with other threads in the same process.' },
      { q: 'Explain the concept of time complexity and Big O notation.', a: 'Big O notation describes the upper bound of the execution time or space requirements of an algorithm in the worst-case scenario relative to the input size (n).' },
      { q: 'What is the difference between a Stack and a Queue?', a: 'A Stack follows the Last-In-First-Out (LIFO) model where elements are added and removed from the same end. A Queue follows First-In-First-Out (FIFO) where elements are added at the rear and removed from the front.' }
    ],
    'HR Round Prep': [
      { q: 'Why do you want to join us?', a: 'Highlight alignment with the target company\'s mission, culture, engineering scale, and active learning environments. Connect their specific business goals to your skillset.' },
      { q: 'Describe a conflict resolution scenario.', a: 'Use the STAR method: describe a healthy debate/conflict, show how you focused on communication and objective data metrics, compromised, and drove the team to a successful outcome.' },
      { q: 'What is your greatest strength and weakness?', a: 'For strength, highlight a transferable technical or collaborative skill. For weakness, name a real weakness you have recognized and show the specific steps you are taking to improve it.' },
      { q: 'Tell me about a time you failed and how you handled it.', a: 'Describe a minor professional setback, take full responsibility, explain what you learned from it, and show how you applied that lesson to succeed in a subsequent project.' },
      { q: 'Where do you see yourself in five years?', a: 'Express a desire to grow into a senior technical or leadership role, mastering the domain, and contributing to high-impact projects at the organization.' }
    ],
    'System Design Prep': [
      { q: 'How does a Content Delivery Network (CDN) work?', a: 'A CDN is a geographically distributed network of proxy servers that cache content close to end users. It reduces latency, minimizes bandwidth costs, and improves page load times.' },
      { q: 'Explain horizontal vs. vertical scaling.', a: 'Vertical scaling (scaling up) means adding more power (CPU, RAM) to an existing machine. Horizontal scaling (scaling out) means adding more machines/nodes to the pool to distribute the load.' },
      { q: 'What is database partitioning/sharding?', a: 'A database design pattern where a single dataset is split into smaller, independent parts (shards) across multiple databases/servers to improve write performance and read throughput.' },
      { q: 'Explain the CAP Theorem.', a: 'A distributed system can guarantee at most two out of three characteristics: Consistency (all nodes see same data), Availability (every request receives a response), and Partition Tolerance (system operates despite message losses).' },
      { q: 'How would you design a rate limiter?', a: 'Use algorithms like Token Bucket, Leaky Bucket, or Sliding Window Log. Track request counts per user/IP in a fast memory cache like Redis to reject requests exceeding the limit.' }
    ],
    'DBMS & SQL Prep': [
      { q: 'What is the difference between INNER JOIN and LEFT JOIN?', a: 'INNER JOIN returns records that have matching values in both tables. LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table, and the matched records from the right table (filling with NULL if no match).' },
      { q: 'Explain Database Normalization and its forms.', a: 'Normalization is organizing database fields/tables to minimize redundancy and dependency. 1NF removes duplicate columns; 2NF ensures all non-key columns depend on the primary key; 3NF removes transitive functional dependencies.' },
      { q: 'What are ACID properties in a database?', a: 'ACID guarantees database transactions are processed reliably: Atomicity (all or nothing), Consistency (preserves database rules), Isolation (independent concurrent execution), and Durability (saved permanently).' },
      { q: 'What is an index and how does it speed up queries?', a: 'An index is a database structure (typically a B-Tree) that enables fast lookup of rows. It speeds up SELECT queries but incurs overhead on INSERT, UPDATE, and DELETE operations.' },
      { q: 'Explain the difference between SQL and NoSQL.', a: 'SQL databases are relational, structured (schemas), table-based, and scale vertically (great for ACID). NoSQL databases are non-relational, distributed, schema-less, document/key-value/graph-based, and scale horizontally.' }
    ],
    'OS & Networks Prep': [
      { q: 'What happens when you type a URL into a browser?', a: 'Browser parses URL -> DNS lookup to find IP -> Establishes TCP connection (three-way handshake) -> Sends HTTP/S request -> Server processes and returns response -> Browser renders HTML, CSS, JS.' },
      { q: 'Explain the difference between TCP and UDP protocols.', a: 'TCP is connection-oriented, reliable, guarantees packet ordering, and features congestion control (slower). UDP is connectionless, unreliable, sends packets without confirmation (faster, great for streaming/gaming).' },
      { q: 'What is virtual memory and how does it work?', a: 'An OS memory management technique that uses hardware and software to map virtual addresses used by an application into physical addresses. It allows using disk space as secondary RAM (swap).' },
      { q: 'Explain the concept of a Deadlock and its prevention.', a: 'A state where two or more processes are unable to proceed because each is waiting for the other to release a resource. Prevent by breaking Mutual Exclusion, Hold & Wait, No Preemption, or Circular Wait.' },
      { q: 'What is paging in operating systems?', a: 'A memory management scheme that eliminates the need for contiguous allocation of physical memory. The OS divides virtual memory into pages and physical memory into frames of equal size.' }
    ],
    'Aptitude & Logical Prep': [
      { q: 'What is the formula to calculate compound interest and how does it differ from simple interest?', a: 'A = P(1 + r/n)^(nt). Compound interest calculates interest on the initial principal and the accumulated interest of previous periods, whereas simple interest only calculates interest on the principal.' },
      { q: 'Explain the concepts of Permutations and Combinations with examples.', a: 'Permutations (nPr) are used when order matters (e.g., arrangements). Combinations (nCr) are used when order does not matter (e.g., selecting a committee).' },
      { q: 'How do you calculate relative speed for objects in motion?', a: 'Relative speed = Speed A + Speed B (if moving in opposite directions), or Speed A - Speed B (if moving in the same direction). Relative Distance = Length of Train A + Length of Train B.' },
      { q: 'Explain the trick to find if a large number is divisible by 3, 4, 9, or 11.', a: 'Divisible by 3/9: sum of digits is divisible by 3/9. Divisible by 4: last two digits form a multiple of 4. Divisible by 11: difference between sum of odd-position digits and sum of even-position digits is 0 or a multiple of 11.' },
      { q: 'What is the handshake puzzle in combinatorics?', a: 'If there are n people, each handshaking once with everyone else, total handshakes = n(n-1)/2. For n=10, 10*9/2 = 45 handshakes.' }
    ],
    'Cloud & DevOps Prep': [
      { q: 'What is the difference between a Container and a Virtual Machine (VM)?', a: 'Containers share the host operating system\'s kernel, making them lightweight and fast. VMs package an entire guest operating system and virtualized hardware, making them heavier but more isolated.' },
      { q: 'Explain the concept of Continuous Integration and Continuous Deployment (CI/CD).', a: 'CI is the practice of automating the integration of code changes from multiple contributors into a single software project. CD automates the delivery/deployment of the validated build to staging or production environments.' },
      { q: 'What is Kubernetes (K8s) and what is its role in modern deployment?', a: 'Kubernetes is an open-source container orchestration platform that automates container deployment, scaling, load balancing, health monitoring, and self-healing of application microservices.' },
      { q: 'Detail the difference between Blue-Green Deployment and Canary Deployment.', a: 'Blue-Green deploys the new version alongside the old version and switches traffic entirely. Canary rolls out the change to a small subset of users first before migrating the rest of the traffic.' },
      { q: 'What is Infrastructure as Code (IaC) and what are its benefits?', a: 'Managing and provisioning infrastructure through machine-readable definition files (e.g., Terraform) rather than manual processes. Benefits include consistency, speed, version control, and auditability.' }
    ]
  };

  // Mock Company Questions
  const companyData = {
    'Google': [
      { id: 'g1', q: 'Find the longest substring without repeating characters.', ans: 'Sliding window approach' },
      { id: 'g2', q: 'Design an autocomplete search engine suggestion service.', ans: 'Trie data structure structure' },
      { id: 'g3', q: 'Implement a rate limiter with a sliding window counter.', ans: 'Redis sorted sets containing timestamps within the window duration' },
      { id: 'g4', q: 'Find the shortest path in a grid with obstacles.', ans: 'BFS traversal tracking visited state with remaining obstacle bypasses' }
    ],
    'Microsoft': [
      { id: 'm1', q: 'Reverse a linked list in pairs of k.', ans: 'Recursion or stack pointers' },
      { id: 'm2', q: 'Explain deadlock conditions.', ans: 'Mutual exclusion, hold and wait, no preemption, circular wait' },
      { id: 'm3', q: 'Serialize and deserialize a binary tree.', ans: 'Pre-order traversal with marker tokens for null leaf children' },
      { id: 'm4', q: 'Design a distributed document collaborative editor like MS Word Online.', ans: 'Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDT)' }
    ],
    'Amazon': [
      { id: 'am1', q: 'Given an array of integers and a target value, find two numbers that sum up to target.', ans: 'HashMap lookup in O(n) time' },
      { id: 'am2', q: 'Design a system for Amazon\'s Locker service.', ans: 'Distributed state machines and localized hardware notifications' },
      { id: 'am3', q: 'Find the lowest common ancestor in a Binary Tree.', ans: 'Recursive traversal checking left and right subtrees' }
    ],
    'TCS': [
      { id: 'tcs1', q: 'Write a program to reverse a string without using built-in methods.', ans: 'Two-pointer approach swapping characters from both ends' },
      { id: 'tcs2', q: 'What is the difference between Method Overloading and Method Overriding?', ans: 'Compile-time polymorphism vs runtime dynamic binding' },
      { id: 'tcs3', q: 'Explain the architecture of MVC pattern.', ans: 'Model represents data, View renders UI, Controller handles logic' }
    ],
    'Infosys': [
      { id: 'inf1', q: 'How do you detect a cycle in a linked list?', ans: 'Floyd\'s cycle-finding algorithm (slow and fast pointers)' },
      { id: 'inf2', q: 'Explain abstract classes vs interfaces in Java.', ans: 'Abstract classes can have state and constructor; interfaces define behavior contract' },
      { id: 'inf3', q: 'What is an outer join in SQL databases?', ans: 'Retrieves rows matching the join condition along with unmatched rows from one or both tables' }
    ],
    'Wipro': [
      { id: 'wip1', q: 'Write a function to check if a number is prime.', ans: 'Trial division up to the square root of the number' },
      { id: 'wip2', q: 'Explain the concept of encapsulation in object-oriented programming.', ans: 'Restricting direct access to state by using private fields and public getters/setters' },
      { id: 'wip3', q: 'Explain DNS propagation and caching.', ans: 'DNS records are cached locally, by ISPs, and root nameservers based on TTL values' }
    ]
  };

  // Mock Aptitude Questions
  const aptitudeData = {
    'Quantitative Aptitude': [
      { q: 'A train 100m long passes a platform 200m long in 30 seconds. What is its speed?', opts: ['10 m/s', '15 m/s', '20 m/s', '25 m/s'], ans: 0 },
      { q: 'If 3 pumps work 8 hours a day to empty a tank in 2 days, how many hours a day must 4 pumps work to empty it in 1 day?', opts: ['8 hours', '12 hours', '10 hours', '6 hours'], ans: 1 },
      { q: 'A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. What is the sum?', opts: ['Rs. 650', 'Rs. 690', 'Rs. 698', 'Rs. 700'], ans: 2 },
      { q: 'Two numbers are in the ratio 3:5. If 9 is subtracted from each, the new numbers are in the ratio 12:23. The smaller number is:', opts: ['27', '33', '49', '55'], ans: 0 }
    ],
    'Logical Reasoning': [
      { q: 'Point to a photograph, a man says "I have no brother or sister but that man\'s father is my father\'s son." Whose photograph is it?', opts: ['His own', 'His son\'s', 'His father\'s', 'His nephew\'s'], ans: 1 },
      { q: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?', opts: ['1/3', '1/8', '2/8', '1/16'], ans: 1 },
      { q: 'SCD, TEF, UGH, ____, WKL. What letters should fill in the blank?', opts: ['VIJ', 'VJH', 'IJT', 'UJI'], ans: 0 },
      { q: 'If A + B means A is the brother of B; A - B means A is the sister of B and A x B means A is the father of B. Which of the following means that C is the son of M?', opts: ['M - N x C', 'F - C + M', 'M x N - C', 'M x C - F'], ans: 3 }
    ],
    'Verbal Ability': [
      { q: 'Find the synonym of: ADVERSITY', opts: ['Crisis', 'Misfortune', 'Failure', 'Helplessness'], ans: 1 },
      { q: 'Select the word that is opposite in meaning (antonym) to: ENORMOUS', opts: ['Soft', 'Average', 'Tiny', 'Weak'], ans: 2 },
      { q: 'Choose the correct spelling:', opts: ['Receive', 'Recieve', 'Receve', 'Reiceve'], ans: 0 },
      { q: 'Identify the grammatical error: "He is one of those men who is never satisfied."', opts: ['He is', 'one of those', 'men who is', 'never satisfied'], ans: 2 }
    ],
    'Data Interpretation': [
      { q: 'If the total sales of a company in 2025 were $5 million and increased by 20% in 2026, what were the sales in 2026?', opts: ['$5.5 million', '$6.0 million', '$6.2 million', '$6.5 million'], ans: 1 },
      { q: 'In a pie chart representing student grades, 25% of students got an A. What is the central angle for the sector representing Grade A?', opts: ['45 degrees', '90 degrees', '120 degrees', '180 degrees'], ans: 1 },
      { q: 'A bar graph shows sales of Cars: Year 1 = 150, Year 2 = 180, Year 3 = 210. What is the average sales across the three years?', opts: ['160', '180', '190', '200'], ans: 1 }
    ],
    'Attention to Detail': [
      { q: 'Which of the following pairs is NOT an exact match?', opts: ['849302-A / 849302-A', 'Microsoft Corp. / Microsoft Corp.', 'O\'Connor, John / O\'Conner, John', '9812-321-X / 9812-321-X'], ans: 2 },
      { q: 'How many times does the letter \'e\' appear in the word \'representation\'?', opts: ['1', '2', '3', '4'], ans: 1 },
      { q: 'Compare 479201948 and 479201948. Are they identical?', opts: ['Yes', 'No', 'Cannot be determined', 'They are partially identical'], ans: 0 }
    ],
    'Spatial Ability': [
      { q: 'If you fold a piece of paper in half and punch a hole in the center, how many holes will there be when you unfold it?', opts: ['1', '2', '3', '4'], ans: 1 },
      { q: 'A cube has its faces numbered 1 through 6. If the numbers 1 and 6 are on opposite faces, and 2 and 5 are on opposite faces, which number is opposite to 3?', opts: ['4', '5', '6', '1'], ans: 0 },
      { q: 'If a clock shows 3:00, what is the angle between the hour and minute hand?', opts: ['45 degrees', '60 degrees', '90 degrees', '120 degrees'], ans: 2 }
    ]
  };

  // Mock Interview Questions
  const interviewData = {
    'Technical Interview': [
      { q: 'Question 1: Explain the difference between thread-safe operations and default asynchronous execution.', ansTip: 'Focus on locks, mutexes, shared memory vs independent execution paths.' },
      { q: 'Question 2: How do you verify and optimize index queries inside database tables?', ansTip: 'Discuss EXPLAIN plans, index types (B-tree, Hash), and coverage.' },
      { q: 'Question 3: Describe the time and space complexity of sorting algorithms like QuickSort and MergeSort.', ansTip: 'QuickSort is O(n log n) average, O(n^2) worst case, O(log n) space. MergeSort is O(n log n) always, O(n) space.' }
    ],
    'Behavioral Interview': [
      { q: 'Question 1: Describe a conflict resolution scenario you experienced in a team setting.', ansTip: 'Use STAR method. Highlight communication, objectivity, and mutual compromises.' },
      { q: 'Question 2: Tell me about a time you had to meet a tight deadline and how you handled the pressure.', ansTip: 'Talk about prioritization, delegation, scope adjustment, and focus.' },
      { q: 'Question 3: How do you handle constructive criticism from a peer or manager?', ansTip: 'Emphasize listening without defense, reflecting, and setting action steps for growth.' }
    ],
    'System Design': [
      { q: 'Question 1: How would you design a distributed cache system like Redis?', ansTip: 'Discuss consistency hashing, eviction policies (LRU, LFU), replication, and API layer.' },
      { q: 'Question 2: Detail the key differences between SQL and NoSQL databases from an architecture standpoint.', ansTip: 'Relational table structure with ACID guarantees vs distributed key-value/document stores scaling horizontally.' },
      { q: 'Question 3: Explain the concepts of load balancing and CDN in high traffic websites.', ansTip: 'Load balancers route incoming requests; CDNs cache static files at edge locations closer to users.' }
    ],
    'Frontend Interview': [
      { q: 'Question 1: Explain the concept of Virtual DOM in React and how it optimizes UI updates.', ansTip: 'Discuss the reconciliation algorithm, diffing state changes, and patching only changed nodes in the real DOM.' },
      { q: 'Question 2: What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?', ansTip: 'CSR renders HTML in the browser via JS; SSR pre-renders pages on the server, improving SEO and initial load time.' },
      { q: 'Question 3: How would you optimize the loading speed of a media-heavy web application?', ansTip: 'Mention image optimization (WebP, lazy loading), code splitting, CDN caching, and bundling.' }
    ],
    'Database & SQL Interview': [
      { q: 'Question 1: What is database normalization, and when is it appropriate to denormalize?', ansTip: 'Normalization removes redundancy (1NF, 2NF, 3NF); denormalization is used to speed up read operations in read-heavy applications.' },
      { q: 'Question 2: Explain the ACID properties in database transactions with real-world examples.', ansTip: 'Atomicity (bank transfer completes or fails), Consistency (no constraints broken), Isolation (concurrent transfers don\'t mix), Durability (written to disk).' },
      { q: 'Question 3: How does database replication work, and what is replication lag?', ansTip: 'Primary-replica setups where database modifications are sent to replicas. Lag is the delay for updates to propagate.' }
    ],
    'Managerial / HR Interview': [
      { q: 'Question 1: Why do you want to work for our company specifically?', ansTip: 'Align company mission, engineering culture, and business domain with your growth goals and projects.' },
      { q: 'Question 2: What has been your biggest technical failure so far, and what did you learn from it?', ansTip: 'Admit a real setback, show accountability, explain the root cause, and highlight what preventive measures you learned.' },
      { q: 'Question 3: Where do you see yourself in five years professionally?', ansTip: 'Talk about technical maturity, taking on leadership/mentorship, and diving deep into system design or product development.' }
    ]
  };

  // ───── Resume Builder ─────
  const handleBuildResume = (templateType) => {
    setGeneratedResume({
      template: templateType,
      name: resumeName,
      email: resumeEmail,
      phone: resumePhone,
      skills: resumeSkills
    });
    toast.success(`${templateType} Resume built successfully!`);
  };

  // ───── Certifications Tracker & Learning Modules ─────
  const handleOpenLearningModules = (cert) => {
    setActiveLearningCert(cert);
    const uncompletedIdx = cert.modules.findIndex(m => !m.completed);
    setActiveModuleIdx(uncompletedIdx !== -1 ? uncompletedIdx : 0);
  };

  const handleCompleteModule = (certId, moduleId) => {
    setCerts(prev => prev.map(c => {
      if (c.id === certId) {
        const updatedModules = c.modules.map(m => m.id === moduleId ? { ...m, completed: true } : m);
        const completedCount = updatedModules.filter(m => m.completed).length;
        const newProg = Math.round((completedCount / updatedModules.length) * 100);

        const updatedCert = { ...c, modules: updatedModules, progress: newProg };
        
        if (newProg === 100) {
          toast.success(`🎉 Congratulations! Unlocked Certificate for ${c.name}!`);
        } else {
          toast.success(`Completed Module! ${c.name} progress: ${newProg}%`);
        }

        if (activeLearningCert && activeLearningCert.id === certId) {
          setActiveLearningCert(updatedCert);
        }
        return updatedCert;
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6 pb-8 quiz-arena-container h-full overflow-y-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-[rgba(245,158,11,0.2)] bg-gradient-to-br from-[#1a1005] via-[#2a1a0b] to-[#0f0b05]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-3xl font-extrabold text-white">🔥 Career Hub</h1>
        <p className="text-amber-200/70 text-sm mt-1">Prepare for placements, build your portfolio, earn certifications</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-full max-w-full overflow-x-auto scrollbar-none" style={{ backgroundColor: 'var(--db-input-bg)', border: '1px solid var(--db-sidebar-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              // reset states when changing tabs
              setPrepMode('lobby');
              setCompanyMode('lobby');
              setInterviewMode('lobby');
              setAptitudeMode('lobby');
              setPortfolioGenerated(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === tab.id ? 'shadow-md' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--db-card-bg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--db-text-accent)' : 'var(--db-text-muted)',
              border: activeTab === tab.id ? '1px solid var(--db-sidebar-border)' : '1px solid transparent'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* RESUME BUILDER */}
        {activeTab === 'resume' && (
          <motion.div key="resume" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="p-6 rounded-3xl border bg-white border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800">Resume Details</h3>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold mb-1">Full Name</span>
                    <input type="text" value={resumeName} onChange={e => setResumeName(e.target.value)} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs text-slate-800" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold mb-1">Email ID</span>
                    <input type="email" value={resumeEmail} onChange={e => setResumeEmail(e.target.value)} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs text-slate-800" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold mb-1">Phone Number</span>
                    <input type="text" value={resumePhone} onChange={e => setResumePhone(e.target.value)} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs text-slate-800" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold mb-1">Key Skills (comma separated)</span>
                    <input type="text" value={resumeSkills} onChange={e => setResumeSkills(e.target.value)} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs text-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  {['Professional', 'Creative', 'Minimal'].map(t => (
                    <button key={t} onClick={() => handleBuildResume(t)} className="py-2 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-xl cursor-pointer">
                      Use {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-6 rounded-3xl border bg-white border-slate-200 flex flex-col justify-between">
                {generatedResume ? (
                  <div className="space-y-4 font-sans text-slate-700">
                    <div className="border-b pb-3 text-center">
                      <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{generatedResume.name}</h2>
                      <div className="text-[10px] text-slate-500 flex justify-center gap-4 mt-1">
                        <span>📧 {generatedResume.email}</span>
                        <span>📞 {generatedResume.phone}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-violet-600 tracking-wider block">Skills & Toolsets</span>
                      <p className="text-xs text-slate-600 mt-1">{generatedResume.skills}</p>
                    </div>

                    <div className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-violet-600 tracking-wider block">Eduverse Progress Verified</span>
                      <p className="text-[10px] text-slate-600 mt-1">Verified: Level 1 DSA mastery completed & MCQ sets solved.</p>
                    </div>

                    <button onClick={() => toast.success('Downloading PDF...')} className="w-full py-2 bg-slate-950 text-white text-xs font-bold rounded-xl">
                      Download PDF Document
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                    <p className="text-4xl">📄</p>
                    <p className="text-xs mt-2">Fill details and choose a template to preview resume draft.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PLACEMENT PREP */}
        {activeTab === 'placement' && (
          <motion.div key="placement" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {prepMode === 'lobby' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Technical Round Prep', desc: 'DSA, OOP, and data structures', icon: '💻', color: 'from-violet-500 to-purple-600' },
                  { title: 'HR Round Prep', desc: 'Behavioral, situational, and STAR framework', icon: '🎤', color: 'from-blue-500 to-cyan-600' },
                  { title: 'System Design Prep', desc: 'CDNs, scalability, caching, sharding', icon: '🏗️', color: 'from-amber-500 to-orange-600' },
                  { title: 'DBMS & SQL Prep', desc: 'ACID, JOINs, indexing, normalization', icon: '🗄️', color: 'from-emerald-500 to-green-600' },
                  { title: 'OS & Networks Prep', desc: 'HTTP lifecycle, TCP/UDP, deadlock, paging', icon: '🌐', color: 'from-pink-500 to-rose-600' },
                  { title: 'Aptitude & Logical Prep', desc: 'Quant, reasoning, patterns, and speed math', icon: '🧮', color: 'from-indigo-500 to-blue-600' },
                  { title: 'Cloud & DevOps Prep', desc: 'Docker, Kubernetes, CI/CD, AWS, and deployment', icon: '☁️', color: 'from-sky-500 to-blue-600' },
                ].map((item, i) => {
                  const qCount = prepQuestions[item.title]?.length || 0;
                  return (
                    <div 
                      key={i} 
                      onClick={() => { setSelectedPrepTopic(item.title); setPrepIndex(0); setPrepMode('study'); }}
                      className="p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group flex gap-4 bg-white border-slate-200"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl text-white shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
                        <p className="text-xs mb-1 text-slate-400 leading-snug">{item.desc}</p>
                        <span className="text-[10px] font-bold text-violet-600">{qCount} Questions Loaded</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {prepMode === 'study' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 space-y-4 max-w-xl mx-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xs font-black text-slate-800">{selectedPrepTopic}</h3>
                  <button onClick={() => setPrepMode('lobby')} className="text-xs text-slate-400 hover:underline">Back</button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border rounded-2xl">
                    <span className="text-[10px] font-bold text-violet-600 uppercase">Question {prepIndex + 1}:</span>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{prepQuestions[selectedPrepTopic][prepIndex].q}</p>
                  </div>

                  <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
                    <span className="text-[10px] font-bold text-violet-600 uppercase">Recommended Answer Framework:</span>
                    <p className="text-xs text-slate-700 mt-1">{prepQuestions[selectedPrepTopic][prepIndex].a}</p>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <button 
                    disabled={prepIndex === 0} 
                    onClick={() => setPrepIndex(prev => prev - 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={prepIndex === prepQuestions[selectedPrepTopic].length - 1} 
                    onClick={() => setPrepIndex(prev => prev + 1)}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* COMPANY QUESTIONS */}
        {activeTab === 'company' && (
          <motion.div key="company" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {companyMode === 'lobby' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyQuestions.map((cq, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (companyData[cq.company]) {
                        setSelectedCompany(cq.company);
                        setCompanyAnswers({});
                        setCompanyScore(null);
                        setCompanyMode('questions');
                      } else {
                        toast.error(`Company questions database for ${cq.company} is unlocking soon.`);
                      }
                    }}
                    className="p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group bg-white border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform">{cq.icon}</div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600">{cq.difficulty}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{cq.company}</h3>
                    <p className="text-xs text-slate-400">{cq.role}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs font-bold text-violet-600">{companyData[cq.company] ? `${companyData[cq.company].length} Loaded` : 'Unlocking soon'}</span>
                      <span className="text-xs font-semibold text-slate-500">Start →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {companyMode === 'questions' && selectedCompany && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xs font-black text-slate-800">{selectedCompany} Assessment</h3>
                  <button onClick={() => setCompanyMode('lobby')} className="text-xs text-slate-400 hover:underline">Back</button>
                </div>

                {companyData[selectedCompany].map((qItem, idx) => (
                  <div key={qItem.id} className="space-y-2 p-4 bg-slate-50 border rounded-2xl">
                    <p className="text-xs font-bold text-slate-800">Q{idx + 1}: {qItem.q}</p>
                    <input 
                      type="text"
                      placeholder="Write your approach description..."
                      value={companyAnswers[qItem.id] || ''}
                      onChange={e => setCompanyAnswers({...companyAnswers, [qItem.id]: e.target.value})}
                      className="w-full bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                ))}

                <button 
                  onClick={() => {
                    setCompanyScore(90);
                    toast.success('Approach submitted successfully!');
                  }}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl"
                >
                  Submit Solutions
                </button>

                {companyScore && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-700">
                    <strong className="text-emerald-600 block">Assessment Evaluated</strong>
                    Excellent. Your solution architecture approach fits {selectedCompany} standards. Code reviews match expected metrics.
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* INTERVIEW PREP */}
        {activeTab === 'interview' && (
          <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {interviewMode === 'lobby' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200">
                <h2 className="text-sm font-extrabold text-slate-800 mb-2">🎤 AI Mock Interview</h2>
                <p className="text-xs text-slate-500 mb-6">Select a track to launch customized placement interviewing checks.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {interviewTracks.map((track, i) => (
                    <div key={i} className="p-4 rounded-2xl border text-center hover:shadow-lg transition-all bg-slate-50 border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="text-3xl mb-3">{track.icon}</div>
                        <h4 className="text-sm font-bold text-slate-800 mb-2">{track.type}</h4>
                        <p className="text-[10px] text-slate-400 mb-4">{track.desc}</p>
                      </div>
                      <button 
                        onClick={() => { setInterviewType(track.type); setInterviewIdx(0); setInterviewAnswers({}); setInterviewMode('active'); }}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer w-full"
                      >
                        Start Interview
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interviewMode === 'active' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{interviewType} Simulator</span>
                  <button onClick={() => setInterviewMode('lobby')} className="text-xs text-slate-400 hover:underline">Exit</button>
                </div>

                <p className="text-xs font-extrabold text-slate-800">
                  {interviewData[interviewType]?.[interviewIdx]?.q || 'Question not found'}
                </p>

                <textarea 
                  value={interviewAnswers[interviewIdx] || ''}
                  onChange={e => setInterviewAnswers({...interviewAnswers, [interviewIdx]: e.target.value})}
                  placeholder="Type your response here..."
                  className="w-full h-24 p-3 bg-slate-50 border rounded-xl text-xs focus:outline-none"
                />

                <div className="flex justify-between">
                  <button 
                    disabled={interviewIdx === 0}
                    onClick={() => setInterviewIdx(prev => prev - 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  {interviewIdx < (interviewData[interviewType]?.length - 1) ? (
                    <button 
                      onClick={() => setInterviewIdx(prev => prev + 1)}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      onClick={() => setInterviewMode('evaluation')}
                      className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black rounded-xl cursor-pointer"
                    >
                      Submit Mock Test
                    </button>
                  )}
                </div>
              </div>
            )}

            {interviewMode === 'evaluation' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto text-center space-y-4">
                <Trophy size={40} className="text-amber-500 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-800">Mock Interview Evaluated!</h3>
                <p className="text-xs text-slate-500">Your mock performance score: <strong>85/100</strong></p>
                
                <div className="space-y-3 text-left">
                  <h4 className="text-xs font-bold text-slate-700">Tutor Feedback & Suggestions:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {interviewData[interviewType]?.map((qObj, idx) => (
                      <div key={idx} className="text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <div className="font-semibold text-slate-700">{qObj.q}</div>
                        <div className="text-slate-500">
                          <strong className="text-violet-600">Your Response:</strong> {interviewAnswers[idx] || <em>No answer provided.</em>}
                        </div>
                        <div className="text-emerald-700 bg-emerald-50/50 p-1.5 rounded text-[10px] mt-1">
                          <strong>Key Tip:</strong> {qObj.ansTip}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => setInterviewMode('lobby')} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                  Try Another Category
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* APTITUDE */}
        {activeTab === 'aptitude' && (
          <motion.div key="aptitude" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {aptitudeMode === 'lobby' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aptitudeTopics.map((topic, i) => (
                  <div key={i} className="p-5 rounded-2xl border hover:shadow-lg transition-all bg-white border-slate-200 flex flex-col justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{topic.icon}</span>
                      <div>
                        <h3 className="text-base font-bold text-slate-800">{topic.topic}</h3>
                        <p className="text-xs text-slate-400">{topic.completed}/{topic.questions} completed</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${(topic.completed / topic.questions) * 100}%` }} />
                    </div>
                    <button 
                      onClick={() => {
                        if (aptitudeData[topic.topic]) {
                          setSelectedAptTopic(topic.topic);
                          setAptIdx(0);
                          setSelectedAptAns('');
                          setAptAnswers({});
                          setAptScore(0);
                          setAptitudeMode('test');
                        } else {
                          toast.error(`${topic.topic} is unlocking soon.`);
                        }
                      }}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Continue Practice
                    </button>
                  </div>
                ))}
              </div>
            )}

            {aptitudeMode === 'test' && selectedAptTopic && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{selectedAptTopic}</span>
                  <button onClick={() => setAptitudeMode('lobby')} className="text-xs text-slate-400 hover:underline">Exit</button>
                </div>

                <p className="text-xs font-extrabold text-slate-800">
                  {aptitudeData[selectedAptTopic][aptIdx].q}
                </p>

                <div className="space-y-2">
                  {aptitudeData[selectedAptTopic][aptIdx].opts.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedAptAns(i)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedAptAns === i ? 'bg-violet-600 border-violet-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    const isCorrect = selectedAptAns === aptitudeData[selectedAptTopic][aptIdx].ans;
                    if (isCorrect) setAptScore(prev => prev + 1);
                    
                    if (aptIdx < aptitudeData[selectedAptTopic].length - 1) {
                      setAptIdx(prev => prev + 1);
                      setSelectedAptAns('');
                    } else {
                      setAptitudeMode('result');
                    }
                  }}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl"
                >
                  Submit & Continue
                </button>
              </div>
            )}

            {aptitudeMode === 'result' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto text-center space-y-4">
                <Trophy size={40} className="text-amber-500 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-800">Aptitude Practice Completed!</h3>
                <p className="text-xs text-slate-500">Your score: <strong>{aptScore} / {aptitudeData[selectedAptTopic].length}</strong></p>
                <button onClick={() => setAptitudeMode('lobby')} className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl">
                  Back to Topics
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="p-6 rounded-3xl border bg-white border-slate-200">
              <h2 className="text-sm font-extrabold text-slate-800 mb-2">💼 Portfolio Builder</h2>
              <p className="text-xs text-slate-500 mb-6">Create a stunning developer portfolio from your EduVerse learning data.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Topics Mastered', value: '24', icon: '📚' },
                  { label: 'Projects Built', value: '3', icon: '🚀' },
                  { label: 'Certifications', value: '2', icon: '🏆' },
                  { label: 'Coding Problems', value: '89', icon: '💻' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl border text-center bg-slate-50 border-slate-200" >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold text-slate-800">{stat.value}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {!portfolioGenerated ? (
                <button 
                  onClick={() => { setPortfolioGenerated(true); toast.success('Personal Portfolio generated!'); }}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg"
                >
                  Generate Portfolio →
                </button>
              ) : (
                <div className="mt-6 p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl text-center space-y-3">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Your Developer Portfolio is Live!</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Link: eduverse.ai/portfolio/bharath-kulal</p>
                  </div>
                  <button onClick={() => setPortfolioGenerated(false)} className="text-[10px] text-violet-600 font-extrabold hover:underline">
                    Reset Portfolio State
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <motion.div key="certifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {certs.map((cert, i) => (
                <div key={i} className="p-5 rounded-2xl border hover:shadow-xl transition-all flex flex-col justify-between gap-4 bg-slate-900/90 border-slate-800 text-white shadow-xl hover:border-cyan-500/40" >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center text-xl text-white shadow-md`}>
                      {cert.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-white leading-tight">{cert.name}</h3>
                      <p className="text-[10px] text-slate-400">{cert.provider}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>Course Progress</span>
                      <span className="text-cyan-400 font-mono font-bold">{cert.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className={`h-full bg-gradient-to-r ${cert.color} rounded-full transition-all duration-500`} style={{ width: `${cert.progress}%` }} />
                    </div>
                  </div>

                  {cert.progress >= 100 ? (
                    <button 
                      onClick={() => setActiveCertCertificate(cert)}
                      className="w-full py-2.5 text-xs font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      🎉 View Certificate
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenLearningModules(cert)}
                      className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>▶️</span> Continue Learning ({cert.modules.filter(m => m.completed).length}/{cert.modules.length})
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive Learning Modules Modal Overlay */}
            {activeLearningCert && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-white">
                  
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeLearningCert.color} flex items-center justify-center text-xl shadow-lg`}>
                        {activeLearningCert.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-extrabold text-white">{activeLearningCert.name}</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Learning Modules
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Progress: <span className="font-mono font-bold text-cyan-300">{activeLearningCert.progress}%</span> ({activeLearningCert.modules.filter(m => m.completed).length} of {activeLearningCert.modules.length} Modules Completed)
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveLearningCert(null)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors text-xs font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Modal Content Split View */}
                  <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
                    
                    {/* Left Panel: Modules Navigation List */}
                    <div className="md:col-span-1 p-4 bg-slate-950/60 border-r border-slate-800 overflow-y-auto space-y-2 custom-scrollbar">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course Curriculum</p>
                      {activeLearningCert.modules.map((mod, idx) => {
                        const isSelected = activeModuleIdx === idx;
                        return (
                          <div
                            key={mod.id}
                            onClick={() => setActiveModuleIdx(idx)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-slate-800 border-cyan-400 shadow-md'
                                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                                {mod.title}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{mod.duration}</p>
                            </div>

                            {mod.completed ? (
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">
                                ✓
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold border border-slate-700">
                                {idx + 1}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Panel: Module Study Workspace */}
                    {activeLearningCert.modules[activeModuleIdx] && (
                      <div className="md:col-span-2 p-6 overflow-y-auto space-y-5 custom-scrollbar bg-slate-900/80 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-slate-800 text-cyan-400 border border-slate-700">
                                Module {activeModuleIdx + 1} of {activeLearningCert.modules.length}
                              </span>
                              <h3 className="text-base font-extrabold text-white mt-1">
                                {activeLearningCert.modules[activeModuleIdx].title}
                              </h3>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">
                              ⏱️ {activeLearningCert.modules[activeModuleIdx].duration}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeLearningCert.modules[activeModuleIdx].desc}
                          </p>

                          {/* Key Learning Concepts */}
                          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                              🎯 Core Learning Outcomes & Concepts
                            </h4>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {activeLearningCert.modules[activeModuleIdx].keyPoints.map((point, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="text-cyan-400">•</span> {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Interactive Code / Theory Snippet */}
                          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                              <span>💻</span> Code Implementation & Practice Snippet
                            </h4>
                            <pre className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800">
                              {activeLearningCert.modules[activeModuleIdx].codeSnippet}
                            </pre>
                          </div>
                        </div>

                        {/* Complete Module Button Action */}
                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setActiveModuleIdx(Math.max(0, activeModuleIdx - 1))}
                              disabled={activeModuleIdx === 0}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl disabled:opacity-40"
                            >
                              ← Prev Module
                            </button>
                            <button
                              onClick={() => setActiveModuleIdx(Math.min(activeLearningCert.modules.length - 1, activeModuleIdx + 1))}
                              disabled={activeModuleIdx === activeLearningCert.modules.length - 1}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl disabled:opacity-40"
                            >
                              Next Module →
                            </button>
                          </div>

                          {activeLearningCert.modules[activeModuleIdx].completed ? (
                            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded-xl border border-emerald-500/40 flex items-center gap-1.5">
                              ✓ Module Completed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCompleteModule(activeLearningCert.id, activeLearningCert.modules[activeModuleIdx].id)}
                              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
                            >
                              Complete Module & Progress Certificate ➔
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Certificate overlay modal */}
            {activeCertCertificate && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-xl w-full p-8 text-center space-y-6 shadow-2xl relative text-white">
                  <button 
                    onClick={() => setActiveCertCertificate(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-xl"
                  >
                    ✕ Close
                  </button>

                  <Award size={64} className="text-amber-400 mx-auto animate-bounce" />
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">EDUVERSE ACADEMY CERTIFICATE OF MASTERY</span>
                    <h2 className="text-2xl font-black text-white">{activeCertCertificate.name}</h2>
                    <p className="text-xs text-slate-300">This certifies that <strong>{resumeName}</strong> has successfully completed all learning modules and curriculum requirements.</p>
                  </div>

                  <div className="border-t border-b border-slate-800 py-3 text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>DATE: {new Date().toLocaleDateString()}</span>
                    <span>VERIFICATION ID: EDV-{activeCertCertificate.id}93A</span>
                  </div>

                  <button 
                    onClick={() => { toast.success('Certificate PDF download started!'); setActiveCertCertificate(null); }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-cyan-500/30"
                  >
                    Download Certificate Document
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
