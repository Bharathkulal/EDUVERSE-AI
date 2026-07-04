export const DSA_LESSONS = [
  {
    id: 1,
    slug: 'introduction',
    title: 'Introduction to DSA',
    difficulty: 'Beginner',
    duration: '20 mins',
    xp: 100,
    accent: '#10B981',
    icon: '📘',
    description: 'Learn what data structures and algorithms are, why they matter, and how they form the backbone of software engineering.',
    topics: ['Data Structures', 'Algorithms', 'Memory Basics', 'Static vs Dynamic'],
    objectives: [
      'Understand the definition and importance of Data Structures and Algorithms.',
      'Differentiate between primitive and non-primitive data structures.',
      'Understand how data is stored and accessed in system memory.',
      'Analyze the relationship between memory layout and program execution speed.'
    ],
    analogy: {
      concept: 'Kitchen Storage Rack',
      description: 'Think of data structures like a kitchen storage system. Spices are in small jars (variables), plates are stacked on a peg board (Stack), and groceries are queued on the pantry shelf (Queue). Organizing them correctly makes cooking (algorithms) fast and efficient.'
    },
    theory: `A Data Structure is a specialized format for organizing, processing, retrieving, and storing data. There are several basic and advanced types of data structures, all designed to arrange data to suit a specific purpose. 

An Algorithm is a step-by-step procedure or set of rules to be followed in calculations or other problem-solving operations.

Together, Data Structures and Algorithms (DSA) form the foundation of efficient software development. Using the wrong data structure can lead to slow execution times, high memory usage, and hard-to-maintain code.`,
    algorithm: [
      'Identify the problem statement and constraints.',
      'Select the most appropriate data structure based on read/write requirements.',
      'Design step-by-step instructions to process data.',
      'Verify correctness with edge cases (empty input, large sizes).'
    ],
    pseudocode: `// General DSA Problem Solving Template
function solveProblem(inputData) {
    Initialize dataStructure
    for each item in inputData {
        Insert item into dataStructure
    }
    Process dataStructure to get result
    return result
}`,
    codeImplementation: {
      c: `#include <stdio.h>
// Basic Data representation in C
struct Data {
    int id;
    char name[50];
};`,
      cpp: `#include <iostream>
#include <string>
// Struct representation in C++
struct Data {
    int id;
    std::string name;
};`,
      java: `// Class representation in Java
public class Data {
    private int id;
    private String name;
    
    public Data(int id, String name) {
        this.id = id;
        this.name = name;
    }
}`,
      python: `# Class representation in Python
class Data:
    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name`,
      csharp: `// Class representation in C#
public class Data {
    public int Id { get; set; }
    public string Name { get; set; }
}`
    },
    dryRun: [
      { line: 1, explanation: 'Initialize the data storage memory block.', variables: { memoryAllocated: 'True', dataSize: 0 } },
      { line: 2, explanation: 'Insert first element: id = 1, name = "DSA".', variables: { memoryAllocated: 'True', dataSize: 1, element: 'id: 1' } }
    ],
    complexity: {
      time: { best: 'O(1)', average: 'O(N)', worst: 'O(N)' },
      space: 'O(N)',
      table: [
        { operation: 'Access', time: 'O(1) to O(N)', space: 'O(1)' },
        { operation: 'Insertion', time: 'O(1) to O(N)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Enables efficient handling of large datasets.',
      'Promotes code reusability and modularity.',
      'Optimizes CPU utilization and execution speed.'
    ],
    disadvantages: [
      'Requires advanced understanding of memory design.',
      'Debugging complex pointer links can be difficult.',
      'Over-engineering with complex structures for simple tasks.'
    ],
    applications: [
      'Operating System memory managers.',
      'Web browser history stacks.',
      'Database index managers.'
    ],
    commonMistakes: [
      'Choosing a complex structure like a Tree when a simple Array is sufficient.',
      'Neglecting Space Complexity during optimization.'
    ],
    interviewQuestions: [
      { question: 'What is the main difference between static and dynamic data structures?', answer: 'Static structures have a fixed size (e.g. standard arrays), whereas dynamic structures can grow/shrink at runtime (e.g. linked lists).' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which of the following is a primitive data structure?', options: ['Array', 'Float', 'Stack', 'Linked List'], correct: 'Float', explanation: 'Floats, Integers, and Characters are primitive types directly supported by hardware.' }
      ]
    },
    summary: 'Data Structures organize data, and Algorithms process it. The choice of DSA directly impacts the speed and memory efficiency of applications.',
    script: [
      { type: 'intro', text: 'Welcome to Data Structures and Algorithms. Let\'s begin by exploring how data is organized.' }
    ]
  },
  {
    id: 2,
    slug: 'time-complexity',
    title: 'Time & Space Complexity',
    difficulty: 'Beginner',
    duration: '30 mins',
    xp: 150,
    accent: '#3B82F6',
    icon: '📊',
    description: 'Learn how to analyze algorithm efficiency using Big O notation, and evaluate running time and memory demands.',
    topics: ['Big O Notation', 'Time Complexity', 'Space Complexity', 'Asymptotic Analysis'],
    objectives: [
      'Express algorithm efficiency mathematically using Big O notation.',
      'Identify Constant, Linear, Quadratic, and Logarithmic runtimes.',
      'Calculate space complexity based on auxiliary allocations.',
      'Analyze worst-case scenarios for performance guarantees.'
    ],
    analogy: {
      concept: 'Delivering Files',
      description: 'If you have a file to send to a friend, you can copy it to a USB drive and walk it over. Walking takes constant time regardless of file size O(1) space. Sending it over the internet takes linear time O(N) relative to the file size. Walk = O(1) time; Internet = O(N) time.'
    },
    theory: `Asymptotic analysis evaluates how the runtime or storage requirements of an algorithm scale with the size of the input. Big O notation (O) describes the upper bound of runtime, while Omega (Ω) and Theta (Θ) represent lower and tight bounds. Common complexities include:
- O(1): Constant Time
- O(log N): Logarithmic Time (Binary Search)
- O(N): Linear Time (Linear Search)
- O(N log N): Linearithmic Time (Merge Sort)
- O(N²): Quadratic Time (Bubble Sort)`,
    algorithm: [
      'Identify the input size N.',
      'Count the number of basic operations executed.',
      'Identify nested loops or recursive divisions.',
      'Express the growth rate in terms of N, ignoring constants.'
    ],
    pseudocode: `// Example of O(N) Complexity
function linearSearch(arr, target) {
    for i from 0 to arr.length - 1 {
        if arr[i] == target return i
    }
    return -1
}`,
    codeImplementation: {
      c: `int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
      cpp: `int linearSearch(const std::vector<int>& arr, int target) {
    for (size_t i = 0; i < arr.size(); ++i) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
      java: `public int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
      python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
      csharp: `public int LinearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.Length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
    },
    dryRun: [
      { line: 1, explanation: 'Loop starts with index i = 0.', variables: { index: 0, target: 5, currentVal: 1 } },
      { line: 2, explanation: 'Target not found. Move to next index i = 1.', variables: { index: 1, target: 5, currentVal: 5 } }
    ],
    complexity: {
      time: { best: 'O(1)', average: 'O(N)', worst: 'O(N)' },
      space: 'O(1)',
      table: [
        { operation: 'Constant Lookup', time: 'O(1)', space: 'O(1)' },
        { operation: 'Linear Scan', time: 'O(N)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Allows objective comparison of algorithm efficiency.',
      'Independent of hardware architecture.',
      'Helps predict algorithm scaling properties.'
    ],
    disadvantages: [
      'Ignores constant factors (e.g. an O(N) algorithm could be slower than O(N²) for small N).',
      'Hard to compute for complex concurrent algorithms.'
    ],
    applications: [
      'System design scale predictions.',
      'Comparing sorting and searching methods.',
      'Optimizing cloud execution runtimes.'
    ],
    commonMistakes: [
      'Thinking O(1) means exactly one execution step.',
      'Neglecting the space allocation costs of recursion stacks.'
    ],
    interviewQuestions: [
      { question: 'What is the time complexity of Binary Search?', answer: 'O(log N), because the search space is cut in half at every step.' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which complexity is more efficient for large inputs?', options: ['O(N²)', 'O(N log N)', 'O(N)', 'O(log N)'], correct: 'O(log N)', explanation: 'Logarithmic growth is significantly slower than linear or quadratic.' }
      ]
    },
    summary: 'Asymptotic analysis evaluates performance scaling. Big O notation defines the worst-case runtime ceiling.',
    script: [
      { type: 'intro', text: 'Time complexity is the mathematical model we use to predict performance bounds.' }
    ]
  },
  {
    id: 3,
    slug: 'arrays',
    title: 'Arrays',
    difficulty: 'Beginner',
    duration: '25 mins',
    xp: 120,
    accent: '#F59E0B',
    icon: '📦',
    description: 'Learn the fundamentals of sequential contiguous memory allocation, multi-dimensional tables, and indexing structures.',
    topics: ['Contiguous Memory', 'Indexing', 'Dynamic Arrays', 'Multi-dimensional'],
    objectives: [
      'Understand how arrays store elements in sequential memory locations.',
      'Compute element addresses using base pointers and offsets.',
      'Differentiate between static and dynamic array expansions.',
      'Implement multi-dimensional row-major layouts.'
    ],
    analogy: {
      concept: 'Row of Lockers',
      description: 'An array is like a contiguous row of numbered lockers in a school. Each locker is the same size, and if you know the first locker\'s address, you can find locker #5 instantly by counting 5 lockers forward. Locker numbers represent array indices.'
    },
    theory: `An array is a collection of elements stored at contiguous memory locations. Indexing is zero-based, allowing direct element lookup in constant time O(1). However, insertions and deletions are expensive O(N) because elements must be shifted. 

Dynamic arrays (like vectors in C++ or ArrayLists in Java) solve the size limitation of static arrays by resizing (doubling in size) when the capacity is reached.`,
    algorithm: [
      'To Access: Return array[index].',
      'To Insert: Shift elements from index to size-1 to the right, then write element.',
      'To Delete: Shift elements from index+1 to size-1 to the left.'
    ],
    pseudocode: `// Array element insertion
function insertAt(arr, index, value, size) {
    for i from size down to index + 1 {
        arr[i] = arr[i - 1]
    }
    arr[index] = value
    return size + 1
}`,
    codeImplementation: {
      c: `void insertAt(int arr[], int* size, int index, int value) {
    for (int i = *size; i > index; i--) {
        arr[i] = arr[i-1];
    }
    arr[index] = value;
    (*size)++;
}`,
      cpp: `void insertAt(std::vector<int>& arr, int index, int value) {
    arr.insert(arr.begin() + index, value);
}`,
      java: `public void insertAt(int[] arr, int size, int index, int value) {
    for (int i = size; i > index; i--) {
        arr[i] = arr[i - 1];
    }
    arr[index] = value;
}`,
      python: `def insert_at(arr, index, value):
    arr.insert(index, value)`,
      csharp: `public void InsertAt(List<int> arr, int index, int value) {
    arr.Insert(index, value);
}`
    },
    dryRun: [
      { line: 1, explanation: 'Shifting items to the right to clear index 2.', variables: { array: '[1, 2, 2, 4]', targetIndex: 2 } },
      { line: 2, explanation: 'Inserting value 99 at index 2.', variables: { array: '[1, 2, 99, 4]', size: 4 } }
    ],
    complexity: {
      time: { best: 'O(1) Access', average: 'O(N) Shift', worst: 'O(N)' },
      space: 'O(N)',
      table: [
        { operation: 'Lookup Index', time: 'O(1)', space: 'O(1)' },
        { operation: 'Search Value', time: 'O(N)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Constant-time direct access via indices.',
      'Cache-friendly due to contiguous memory allocation.',
      'Low memory overhead per element.'
    ],
    disadvantages: [
      'Static size cannot be changed after allocation.',
      'Insertions and deletions require element shifting.',
      'Risk of memory waste if allocated size is too large.'
    ],
    applications: [
      'Storing simple collections of data.',
      'Implementing stacks, queues, and heaps.',
      'Image processing pixels representation.'
    ],
    commonMistakes: [
      'Accessing index out of bounds.',
      'Assuming resizing of dynamic arrays has constant cost (resizing is O(N) when it happens).'
    ],
    interviewQuestions: [
      { question: 'Why does array lookup take O(1) time?', answer: 'Because memory is contiguous, and the address can be calculated directly as: Address = BaseAddress + (Index * ElementSize).' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is the time complexity of deleting the first element in an array of size N?', options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'], correct: 'O(N)', explanation: 'Deleting the first element requires shifting all remaining N-1 elements to the left.' }
      ]
    },
    summary: 'Arrays use contiguous memory, offering fast lookups but slow insertions and deletions due to element shifting.',
    script: [
      { type: 'intro', text: 'Arrays are the most fundamental contiguous data structure, offering O(1) index-based lookups.' }
    ]
  },
  {
    id: 4,
    slug: 'stack',
    title: 'Stack',
    difficulty: 'Beginner',
    duration: '25 mins',
    xp: 120,
    accent: '#EF4444',
    icon: '📚',
    description: 'Learn the LIFO (Last-In, First-Out) principle, push/pop operations, and function activation record tracking.',
    topics: ['LIFO Principle', 'Push & Pop', 'Call Stack', 'Brackets Matching'],
    objectives: [
      'Understand the Last-In First-Out (LIFO) access pattern.',
      'Implement push, pop, and peek operations.',
      'Explain the role of the program call stack in recursion.',
      'Evaluate mathematical expressions using brackets parsing.'
    ],
    analogy: {
      concept: 'Plate Stack',
      description: 'Think of a stack of plates in a cafeteria. You place new plates on the top (push). When you need a plate, you remove the top plate (pop). You can only see the top plate (peek). Attempting to remove plates from the bottom would crash the stack.'
    },
    theory: `A Stack is a linear data structure that follows the LIFO (Last-In, First-Out) principle. The element inserted last is the first to be retrieved. Fundamental operations:
- Push: Insert an element on top.
- Pop: Remove and return the top element.
- Peek/Top: View the top element without removing it.
- IsEmpty: Check if the stack contains elements.`,
    algorithm: [
      'Push: If stack is full, return overflow. Increment top, write item at top.',
      'Pop: If stack is empty, return underflow. Read item at top, decrement top, return item.'
    ],
    pseudocode: `// Stack Push operation
function push(item) {
    if isFull() throw OverflowError
    top = top + 1
    storage[top] = item
}`,
    codeImplementation: {
      c: `#define MAX 100
int stack[MAX];
int top = -1;

void push(int x) {
    if (top >= MAX - 1) return;
    stack[++top] = x;
}
int pop() {
    if (top < 0) return -1;
    return stack[top--];
}`,
      cpp: `#include <stack>
std::stack<int> s;
// s.push(x);
// s.pop();`,
      java: `import java.util.Stack;
Stack<Integer> stack = new Stack<>();
// stack.push(x);
// stack.pop();`,
      python: `stack = []
# stack.append(x)
# stack.pop()`,
      csharp: `using System.Collections.Generic;
Stack<int> stack = new Stack<int>();
// stack.Push(x);
// stack.Pop();`
    },
    dryRun: [
      { line: 1, explanation: 'Pushing element 15 onto the stack.', variables: { top: 0, stack: '[15]', action: 'Push' } },
      { line: 2, explanation: 'Pushing element 42 onto the stack.', variables: { top: 1, stack: '[15, 42]', action: 'Push' } }
    ],
    complexity: {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      space: 'O(N)',
      table: [
        { operation: 'Push', time: 'O(1)', space: 'O(1)' },
        { operation: 'Pop', time: 'O(1)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Extremely fast constant-time operations.',
      'Prevents data corruption by restricting arbitrary access.',
      'Ideal for reversing structures and parsing expressions.'
    ],
    disadvantages: [
      'Size limits if implemented with static arrays.',
      'No random access to middle elements.'
    ],
    applications: [
      'Undo/Redo buffers in text editors.',
      'Function call execution trace logs.',
      'Backtracking in depth-first graphs.'
    ],
    commonMistakes: [
      'Attempting to pop from an empty stack (Stack Underflow).',
      'Exceeding max buffer stack limit (Stack Overflow).'
    ],
    interviewQuestions: [
      { question: 'How do you implement a stack using queues?', answer: 'Use two queues, making either push or pop costly by shifting all elements.' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which principle does a Stack follow?', options: ['FIFO', 'LIFO', 'LILO', 'Priority'], correct: 'LIFO', explanation: 'LIFO stands for Last-In, First-Out.' }
      ]
    },
    summary: 'A Stack is a LIFO structure offering O(1) operations, crucial for expression evaluation and recursive calls.',
    script: [
      { type: 'intro', text: 'Stacks restrict access to a LIFO pattern, perfect for undo operations and recursion tracing.' }
    ]
  },
  {
    id: 5,
    slug: 'queue',
    title: 'Queue',
    difficulty: 'Beginner',
    duration: '25 mins',
    xp: 120,
    accent: '#8B5CF6',
    icon: '📥',
    description: 'Learn the FIFO (First-In, First-Out) principle, enqueue/dequeue operations, and buffering structures.',
    topics: ['FIFO Principle', 'Enqueue & Dequeue', 'Circular Queues', 'Task Schedulers'],
    objectives: [
      'Understand the First-In First-Out (FIFO) scheduling pattern.',
      'Implement basic and circular queues.',
      'Manage front and rear pointers to prevent memory drift.',
      'Describe job scheduling queues in CPU architectures.'
    ],
    analogy: {
      concept: 'Movie Ticket Counter Line',
      description: 'A queue is like a line at a movie theater ticket counter. The first person to join the line is the first person to buy a ticket and leave (First-In, First-Out). Late arrivals join the end of the line (Enqueue), while served customers leave from the front (Dequeue).'
    },
    theory: `A Queue is a linear data structure that follows the FIFO (First-In, First-Out) principle. Insertions occur at the rear, and deletions occur at the front. Key operations:
- Enqueue: Insert an element at the rear.
- Dequeue: Remove and return the front element.
- Front/Peek: View the front element.
- Circular Queue: Pointers wrap around to maximize buffer space.`,
    algorithm: [
      'Enqueue: Increment rear pointer (wrap around if circular), write element.',
      'Dequeue: Increment front pointer (wrap around if circular), return element.'
    ],
    pseudocode: `// Queue Enqueue
function enqueue(item) {
    if isFull() throw OverflowError
    rear = (rear + 1) % capacity
    storage[rear] = item
}`,
    codeImplementation: {
      c: `#define MAX 100
int queue[MAX];
int front = 0, rear = -1, size = 0;

void enqueue(int x) {
    if (size >= MAX) return;
    rear = (rear + 1) % MAX;
    queue[rear] = x;
    size++;
}`,
      cpp: `#include <queue>
std::queue<int> q;
// q.push(x); // enqueue
// q.pop();  // dequeue`,
      java: `import java.util.LinkedList;
import java.util.Queue;
Queue<Integer> q = new LinkedList<>();
// q.add(x);
// q.poll();`,
      python: `from collections import deque
q = deque()
# q.append(x) # enqueue
# q.popleft() # dequeue`,
      csharp: `using System.Collections.Generic;
Queue<int> q = new Queue<int>();
// q.Enqueue(x);
// q.Dequeue();`
    },
    dryRun: [
      { line: 1, explanation: 'Enqueue element 10.', variables: { front: 0, rear: 0, queue: '[10]' } },
      { line: 2, explanation: 'Enqueue element 20.', variables: { front: 0, rear: 1, queue: '[10, 20]' } }
    ],
    complexity: {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      space: 'O(N)',
      table: [
        { operation: 'Enqueue', time: 'O(1)', space: 'O(1)' },
        { operation: 'Dequeue', time: 'O(1)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Decoupled task execution.',
      'Efficient resource scheduling.',
      'Thread-safe buffers (e.g. BlockingQueue).'
    ],
    disadvantages: [
      'Array-based implementations can waste slots if not circular.',
      'No random access to middle jobs.'
    ],
    applications: [
      'CPU task schedulers.',
      'Print job queues.',
      'Breadth-First Search (BFS) queues.'
    ],
    commonMistakes: [
      'Drifting rear pointer out of bounds in static arrays without wrapping.',
      'Dequeuing from an empty queue.'
    ],
    interviewQuestions: [
      { question: 'What is a Circular Queue?', answer: 'A queue where the last position is connected back to the first, wrapping pointers using modulo math.' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which structure is used for Breadth-First Search traversal?', options: ['Stack', 'Queue', 'Hash Map', 'Tree'], correct: 'Queue', explanation: 'BFS explores neighbor-by-neighbor in FIFO order using a queue.' }
      ]
    },
    summary: 'A Queue organizes tasks in FIFO order, vital for resource scheduling and buffer management.',
    script: [
      { type: 'intro', text: 'Queues maintain order in a FIFO structure, widely applied in job scheduling and stream buffering.' }
    ]
  },
  {
    id: 6,
    slug: 'linked-list',
    title: 'Linked List',
    difficulty: 'Intermediate',
    duration: '35 mins',
    xp: 180,
    accent: '#3B82F6',
    icon: '🔗',
    description: 'Learn node architectures, pointer structures, singly vs. doubly lists, and dynamic memory allocation.',
    topics: ['Nodes & Pointers', 'Singly Linked List', 'Doubly Linked List', 'Circular Linked List'],
    objectives: [
      'Understand how nodes reference each other via pointer chains.',
      'Implement beginning, end, and arbitrary position insertions.',
      'Traverse linked structures sequentially in memory.',
      'Differentiate singly, doubly, and circular node designs.'
    ],
    analogy: {
      concept: 'Treasure Hunt Clues',
      description: 'A linked list is like a treasure hunt. Each clue tells you a message (data) and points to where you can find the next clue (pointer). You cannot jump straight to clue #5; you must find clue #1, follow it to #2, then #3, and so on.'
    },
    theory: `A Linked List is a linear data structure where elements are not stored in contiguous memory locations. Instead, elements are stored in structures called Nodes. Each node contains:
1. Data: The value stored.
2. Next: A pointer/reference to the next node in the chain.

Linked Lists allow dynamic sizing, and insertions/deletions at the head are cheap O(1). However, searching or index lookup takes linear time O(N) because elements must be traversed sequentially.`,
    algorithm: [
      'Insert Beginning: Create newNode. Set newNode.next = head. Update head = newNode.',
      'Delete Beginning: Update head = head.next.'
    ],
    pseudocode: `// Singly linked list insertion at start
function insertBeginning(value) {
    newNode = CreateNode(value)
    newNode.next = head
    head = newNode
}`,
    codeImplementation: {
      c: `struct Node {
    int data;
    struct Node* next;
};
struct Node* head = NULL;

void insertBeginning(int val) {
    struct Node* newNode = malloc(sizeof(struct Node));
    newNode->data = val;
    newNode->next = head;
    head = newNode;
}`,
      cpp: `struct Node {
    int data;
    Node* next;
};
Node* head = nullptr;`,
      java: `class Node {
    int data;
    Node next;
    Node(int d) { data = d; next = null; }
}`,
      python: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None`,
      csharp: `public class Node {
    public int Data { get; set; }
    public Node Next { get; set; }
}`
    },
    dryRun: [
      { line: 1, explanation: 'Creating new node with value 10.', variables: { newNodeVal: 10, newNodeNext: 'NULL' } },
      { line: 2, explanation: 'Setting new node pointer to current head, updating head.', variables: { headVal: 10, headNext: 'NULL' } }
    ],
    complexity: {
      time: { best: 'O(1) Head Edit', average: 'O(N) Search', worst: 'O(N)' },
      space: 'O(N)',
      table: [
        { operation: 'Insert Head', time: 'O(1)', space: 'O(1)' },
        { operation: 'Search Item', time: 'O(N)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Dynamic size allocates memory as needed.',
      'O(1) insertion/deletion at the head.',
      'No memory fragmentation compared to static structures.'
    ],
    disadvantages: [
      'O(N) random access search.',
      'Extra memory overhead for pointer references.',
      'Not cache-friendly due to scattered nodes.'
    ],
    applications: [
      'Implementing stacks and queues.',
      'Graph adjacency list representations.',
      'Browser forward/backward history navigation.'
    ],
    commonMistakes: [
      'Losing references during deletion, resulting in memory leaks.',
      'Dereferencing a NULL pointer.'
    ],
    interviewQuestions: [
      { question: 'How do you detect a cycle in a linked list?', answer: 'Use Floyd\'s Cycle Detection (Tortoise and Hare algorithm) with two pointers moving at different speeds.' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is the time complexity to insert a node at the head of a linked list?', options: ['O(1)', 'O(N)', 'O(log N)', 'O(N²)'], correct: 'O(1)', explanation: 'Inserting at head only requires changing pointer assignments, taking constant time.' }
      ]
    },
    summary: 'Linked lists connect nodes dynamically, offering quick edits at the head but slow sequential scans.',
    script: [
      { type: 'intro', text: 'Linked lists use pointer connections to dynamic memory nodes, removing contiguous space constraints.' }
    ]
  },
  {
    id: 7,
    slug: 'trees',
    title: 'Trees',
    difficulty: 'Intermediate',
    duration: '40 mins',
    xp: 200,
    accent: '#10B981',
    icon: '🌳',
    description: 'Learn hierarchical data structures, binary trees, traversals, and search trees.',
    topics: ['Binary Tree', 'Binary Search Tree', 'In/Pre/Post-Order Traversal', 'Tree Balance'],
    objectives: [
      'Understand hierarchical nodes and parent-child edges.',
      'Explain binary search tree insertion constraints.',
      'Traverse trees recursively (In-order, Pre-order, Post-order).',
      'Explain the significance of balanced tree structures.'
    ],
    analogy: {
      concept: 'Family Tree',
      description: 'A tree data structure is like a family tree. It starts at a single ancestor (Root). Each ancestor has children (Nodes), which in turn have their own children. Leaf nodes represent descendants without children.'
    },
    theory: `A Tree is a non-linear, hierarchical data structure consisting of nodes connected by edges. The top node is the Root. Nodes without children are Leaves.

A Binary Search Tree (BST) has the property that for every node, elements in the left subtree are smaller, and elements in the right subtree are larger. This allows O(log N) searches when balanced.`,
    algorithm: [
      'In-Order Traversal: Traverse left subtree, visit root, traverse right subtree.',
      'BST Insert: Compare value. If smaller, recurse left. If larger, recurse right. Insert when NULL node is found.'
    ],
    pseudocode: `// BST Insertion
function insert(root, val) {
    if root == NULL return CreateNode(val)
    if val < root.data
        root.left = insert(root.left, val)
    else
        root.right = insert(root.right, val)
    return root
}`,
    codeImplementation: {
      c: `struct Node {
    int data;
    struct Node* left;
    struct Node* right;
};

struct Node* insert(struct Node* root, int val) {
    if (root == NULL) {
        struct Node* temp = malloc(sizeof(struct Node));
        temp->data = val;
        temp->left = temp->right = NULL;
        return temp;
    }
    if (val < root->data) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}`,
      cpp: `struct Node {
    int data;
    Node* left;
    Node* right;
};`,
      java: `class Node {
    int data;
    Node left, right;
    Node(int val) {
        data = val;
        left = right = null;
    }
}`,
      python: `class Node:
        def __init__(self, val):
            self.data = val
            self.left = None
            self.right = None`,
      csharp: `public class Node {
    public int Data { get; set; }
    public Node Left { get; set; }
    public Node Right { get; set; }
}`
    },
    dryRun: [
      { line: 1, explanation: 'Inserting value 8 into empty tree: created root node 8.', variables: { root: '8' } },
      { line: 2, explanation: 'Inserting value 3: 3 < 8, placed as root.left.', variables: { root: '8', left: '3' } }
    ],
    complexity: {
      time: { best: 'O(log N) Balanced', average: 'O(log N)', worst: 'O(N) Skewed' },
      space: 'O(H) Height',
      table: [
        { operation: 'BST Search', time: 'O(log N)', space: 'O(H)' },
        { operation: 'Inorder Traversal', time: 'O(N)', space: 'O(H)' }
      ]
    },
    advantages: [
      'Represents hierarchical relationships naturally.',
      'Fast searches and insertions in balanced BSTs.',
      'No size limit, dynamic growth.'
    ],
    disadvantages: [
      'Worst-case search degrades to O(N) if skewed.',
      'Complex rebalancing logic (e.g. AVL, Red-Black Trees).'
    ],
    applications: [
      'File systems path routing.',
      'Database indexing (B-Trees).',
      'Parser syntax tree builders.'
    ],
    commonMistakes: [
      'Allowing search trees to degrade into sequential lines (skewed).',
      'Forgetting stack overflow risks on deep recursive traversals.'
    ],
    interviewQuestions: [
      { question: 'What is the height of a balanced tree with N nodes?', answer: 'O(log N).' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which traversal yields elements in sorted order from a BST?', options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], correct: 'In-order', explanation: 'In-order visit pattern is Left -> Root -> Right, yielding sorted values from a BST.' }
      ]
    },
    summary: 'Trees represent hierarchical data. Balanced search trees (BSTs) optimize search times to logarithmic bounds.',
    script: [
      { type: 'intro', text: 'Hierarchical trees structure data dynamically, balancing access speed and insertion efforts.' }
    ]
  },
  {
    id: 8,
    slug: 'graphs',
    title: 'Graphs',
    difficulty: 'Advanced',
    duration: '45 mins',
    xp: 250,
    accent: '#8B5CF6',
    icon: '🌐',
    description: 'Learn networks, vertex-edge architectures, BFS and DFS traversals, and shortest path algorithms.',
    topics: ['Adjacency Matrix/List', 'Breadth-First Search', 'Depth-First Search', 'Shortest Paths'],
    objectives: [
      'Understand vertices, edges, directed and weighted networks.',
      'Represent networks using matrices and adjacency lists.',
      'Implement BFS using queues for shortest unweighted steps.',
      'Implement DFS using stack backtracking.'
    ],
    analogy: {
      concept: 'Google Maps Networks',
      description: 'A graph represents networks. Vertices are cities, and edges are roads connecting them. If you want to find all routes between cities, you use graph traversals.'
    },
    theory: `A Graph is a non-linear data structure consisting of vertices (nodes) and edges (connections). Graphs can be directed, undirected, weighted, or unweighted.

Common traversals:
1. Breadth-First Search (BFS): Level-by-level scanning using a queue.
2. Depth-First Search (DFS): Backtracking exploration using recursion/stack.`,
    algorithm: [
      'BFS: Mark vertex visited. Enqueue. While queue is not empty, dequeue, visit neighbors, enqueue if unvisited.',
      'DFS: Visit vertex, mark visited. Recurse for all unvisited neighbors.'
    ],
    pseudocode: `// BFS implementation
function BFS(startVertex) {
    Queue q
    Mark startVertex Visited
    q.enqueue(startVertex)
    while !q.isEmpty() {
        v = q.dequeue()
        for each neighbor in v.neighbors {
            if neighbor is not Visited {
                Mark neighbor Visited
                q.enqueue(neighbor)
            }
        }
    }
}`,
    codeImplementation: {
      c: `// Adjacency Matrix representation
#define V 5
int graph[V][V];
void addEdge(int u, int v) {
    graph[u][v] = 1;
    graph[v][u] = 1;
}`,
      cpp: `#include <vector>
std::vector<std::vector<int>> adj(V);`,
      java: `import java.util.ArrayList;
ArrayList<ArrayList<Integer>> adj = new ArrayList<>();`,
      python: `graph = {i: [] for i in range(V)}`,
      csharp: `using System.Collections.Generic;
List<int>[] adj = new List<int>[V];`
    },
    dryRun: [
      { line: 1, explanation: 'Start BFS at node 0, enqueue 0.', variables: { visited: '[0]', queue: '[0]' } },
      { line: 2, explanation: 'Dequeue 0, visit neighbors 1, 2. Enqueue 1, 2.', variables: { visited: '[0, 1, 2]', queue: '[1, 2]' } }
    ],
    complexity: {
      time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      space: 'O(V)',
      table: [
        { operation: 'BFS Scan', time: 'O(V + E)', space: 'O(V)' },
        { operation: 'DFS Scan', time: 'O(V + E)', space: 'O(V)' }
      ]
    },
    advantages: [
      'Best model for complex physical and network topologies.',
      'Easily represents weighted costs (e.g. roads, delays).'
    ],
    disadvantages: [
      'O(V²) space overhead for adjacency matrices.',
      'High algorithm complexity for cycle or path traces.'
    ],
    applications: [
      'Social network connections.',
      'GPS routing paths.',
      'Web crawlers searching websites.'
    ],
    commonMistakes: [
      'Forgetting to track visited states, causing infinite loops.',
      'Using matrices for sparse graphs, wasting memory.'
    ],
    interviewQuestions: [
      { question: 'What is the space complexity of an Adjacency List?', answer: 'O(V + E).' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which data structure is used for DFS traversal?', options: ['Queue', 'Stack/Recursion', 'Tree', 'Heap'], correct: 'Stack/Recursion', explanation: 'DFS uses LIFO backtracking via call stack recursion.' }
      ]
    },
    summary: 'Graphs map networks. BFS and DFS traversals locate connected paths efficiently.',
    script: [
      { type: 'intro', text: 'Graphs capture relationships between vertices using edge sets, driving routing and networking algorithms.' }
    ]
  },
  {
    id: 9,
    slug: 'hashing',
    title: 'Hashing',
    difficulty: 'Intermediate',
    duration: '25 mins',
    xp: 150,
    accent: '#F59E0B',
    icon: '🧩',
    description: 'Learn hash functions, hash tables, collision resolution, and quick key-value searches.',
    topics: ['Hash Functions', 'Collision Resolution', 'Chaining', 'Open Addressing'],
    objectives: [
      'Explain how hash functions convert keys to array indices.',
      'Compare chaining and open addressing for collision resolution.',
      'Calculate load factors of hash tables.',
      'Implement simple key-value storage maps.'
    ],
    analogy: {
      concept: 'Library Book Sections',
      description: 'Hashing is like storing library books. You use a rule (Hash function), such as the first letter of the author\'s name, to pick the shelf. When looking for a book, you apply the same rule to go directly to that shelf in O(1) time.'
    },
    theory: `Hashing maps arbitrary keys to fixed-size array indices. Ideally, lookup is O(1). Collisions happen when two different keys map to the same index.

Resolution strategies:
- Chaining: Array stores linked list nodes at each index.
- Open Addressing: Find next empty slot (linear probing, quadratic probing, double hashing).`,
    algorithm: [
      'Get key, calculate hash(key) % size.',
      'If slot empty, write key-value pair.',
      'If slot occupied, resolve collision (chaining/probing).'
    ],
    pseudocode: `// Hash lookup
function get(key) {
    index = hashFunction(key) % arraySize
    while array[index] is occupied {
        if array[index].key == key return array[index].value
        index = resolveCollision(index)
    }
    return NULL
}`,
    codeImplementation: {
      c: `// Simple Hash function
int hash(char* str, int size) {
    unsigned long hashVal = 5381;
    int c;
    while ((c = *str++)) hashVal = ((hashVal << 5) + hashVal) + c;
    return hashVal % size;
}`,
      cpp: `#include <unordered_map>
std::unordered_map<std::string, int> mp;`,
      java: `import java.util.HashMap;
HashMap<String, Integer> map = new HashMap<>();`,
      python: `h_map = {}
# h_map[key] = val`,
      csharp: `using System.Collections.Generic;
Dictionary<string, int> dict = new Dictionary<string, int>();`
    },
    dryRun: [
      { line: 1, explanation: 'Inserting key "Alice", hash maps to index 3.', variables: { key: 'Alice', index: 3 } },
      { line: 2, explanation: 'Inserting key "Bob", hash maps to 3. Collision resolved with chaining.', variables: { index: 3, chain: '[Alice, Bob]' } }
    ],
    complexity: {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(N) All Collide' },
      space: 'O(N)',
      table: [
        { operation: 'Key lookup', time: 'O(1)', space: 'O(1)' },
        { operation: 'Deletion', time: 'O(1)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Extremely fast constant-time searches.',
      'Keys can be strings, objects, or numbers.'
    ],
    disadvantages: [
      'Worse-case O(N) if bad hash causes all keys to collide.',
      'Cannot perform sorted range scans.'
    ],
    applications: [
      'Database indexes.',
      'Caches (Redis).',
      'Unique sets management.'
    ],
    commonMistakes: [
      'Using a weak hash function, leading to high collision rates.',
      'Allowing load factors to exceed 0.7 without resizing.'
    ],
    interviewQuestions: [
      { question: 'What is the load factor in a Hash Table?', answer: 'The ratio of stored elements to table size (N/M). Higher ratios increase collisions.' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What collision strategy uses linked lists at index locations?', options: ['Chaining', 'Linear Probing', 'Double Hashing', 'Rehashing'], correct: 'Chaining', explanation: 'Chaining stores colliding items in a linked list at the hashed bucket index.' }
      ]
    },
    summary: 'Hashing computes table indices from keys, targeting O(1) lookups using collision resolution.',
    script: [
      { type: 'intro', text: 'Hashing computes indices for key-value maps, keeping average search times constant.' }
    ]
  },
  {
    id: 10,
    slug: 'heap',
    title: 'Heap',
    difficulty: 'Intermediate',
    duration: '30 mins',
    xp: 160,
    accent: '#EF4444',
    icon: '⚡',
    description: 'Learn binary heaps, min-heap and max-heap order properties, heapify operations, and priority queues.',
    topics: ['Min-Heap', 'Max-Heap', 'Heapify', 'Priority Queue'],
    objectives: [
      'Understand binary heap structures.',
      'Maintain Min-Heap and Max-Heap order invariants.',
      'Implement bubble-up and bubble-down heapify logic.',
      'Build Priority Queues for priority-based task scheduling.'
    ],
    analogy: {
      concept: 'Emergency Room',
      description: 'A heap is like an emergency room triage queue. Patients aren\'t treated based on their arrival time (FIFO). Instead, the patient with the highest priority (Max Heap) is treated first. Inserting a new patient triggers re-sorting (Heapify).'
    },
    theory: `A Heap is a complete binary tree that satisfies the heap property:
- Max-Heap: The key of the parent node is >= keys of its children. Root is max.
- Min-Heap: The key of the parent node is <= keys of its children. Root is min.

Heaps are stored in arrays: index i has children at 2i+1 and 2i+2.`,
    algorithm: [
      'Insert: Append at end of array. Bubble-up until heap property is restored.',
      'Extract Max/Min: Swap root with last element. Pop last. Bubble-down root.'
    ],
    pseudocode: `// Max-Heapify Bubble Down
function heapifyDown(index, size) {
    left = 2 * index + 1
    right = 2 * index + 2
    largest = index
    if left < size and arr[left] > arr[largest] largest = left
    if right < size and arr[right] > arr[largest] largest = right
    if largest != index {
        Swap(arr[index], arr[largest])
        heapifyDown(largest, size)
    }
}`,
    codeImplementation: {
      c: `void swap(int* a, int* b) { int t = *a; *a = *b; *b = t; }
void heapify(int arr[], int n, int i) {
    int largest = i;
    int l = 2*i + 1, r = 2*i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(&arr[i], &arr[largest]);
        heapify(arr, n, largest);
    }
}`,
      cpp: `#include <queue>
std::priority_queue<int> maxHeap;`,
      java: `import java.util.PriorityQueue;
PriorityQueue<Integer> minHeap = new PriorityQueue<>();`,
      python: `import heapq
heap = []
# heapq.heappush(heap, val)`,
      csharp: `using System.Collections.Generic;
// PriorityQueue<TElement, TPriority>`
    },
    dryRun: [
      { line: 1, explanation: 'Inserting 12 into heap [10, 5, 8]. Place at end: [10, 5, 8, 12].', variables: { heap: '[10, 5, 8, 12]' } },
      { line: 2, explanation: 'Bubble up: swap 12 and 5. Then swap 12 and 10. Final max-heap: [12, 10, 8, 5].', variables: { heap: '[12, 10, 8, 5]' } }
    ],
    complexity: {
      time: { best: 'O(1) Get Root', average: 'O(log N) Heapify', worst: 'O(log N)' },
      space: 'O(N)',
      table: [
        { operation: 'Extract Max', time: 'O(log N)', space: 'O(1)' },
        { operation: 'Insert Node', time: 'O(log N)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Guarantees logarithmic insertion and deletion times.',
      'Extremely space-efficient, stored in arrays without pointer references.'
    ],
    disadvantages: [
      'Search takes linear time O(N) (heaps are not search trees).',
      'No sorted access to internal nodes.'
    ],
    applications: [
      'Priority Queues.',
      'Heapsort algorithm.',
      'Dijkstra\'s shortest path queueing.'
    ],
    commonMistakes: [
      'Using a heap when search operations are frequent.',
      'Calculating parent/child indices incorrectly.'
    ],
    interviewQuestions: [
      { question: 'What is the time complexity of building a heap from an array of size N?', answer: 'O(N) using Floyd\'s bottom-up method, not O(N log N).' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which index contains the parent of node at index i in a zero-indexed heap array?', options: ['(i-1)/2', '(i-2)/2', '2i', 'i/2'], correct: '(i-1)/2', explanation: 'Parent index calculation is (i-1)/2 using integer division.' }
      ]
    },
    summary: 'Heaps manage priority queues efficiently, providing logarithmic edits and constant-time root lookups.',
    script: [
      { type: 'intro', text: 'Binary heaps maintain parent-child bounds, serving as the basis for priority queues.' }
    ]
  },
  {
    id: 11,
    slug: 'trie',
    title: 'Trie',
    difficulty: 'Advanced',
    duration: '35 mins',
    xp: 220,
    accent: '#3B82F6',
    icon: '🧠',
    description: 'Learn prefix trees, string retrieval structures, lookup trees, and autocomplete engines.',
    topics: ['Prefix Tree', 'Node Alphabets', 'Insert & Search', 'Autocomplete Engine'],
    objectives: [
      'Explain prefix tree structures.',
      'Design nodes with child alphabet arrays.',
      'Implement string insertion and prefix search.',
      'Optimize autocomplete matchers.'
    ],
    analogy: {
      concept: 'Dictionary Indexing',
      description: 'A Trie is like an English dictionary. When searching for "cat", you open the section "c", turn to "a", then "t". The shared prefix paths speed up search times.'
    },
    theory: `A Trie (prefix tree) is a tree-like data structure used to store strings. Each node represents a single character. Shared prefixes reuse nodes.

This allows quick prefix lookups in O(L) time, where L is the length of the query string, independent of the number of words stored.`,
    algorithm: [
      'Insert: Starting at root, check if character node exists. If not, create it. Recurse for next character. Mark last node as EndOfWord.',
      'Search: Traverse character nodes. If any character is missing, return false. Return true if last node is EndOfWord.'
    ],
    pseudocode: `// Trie String Insertion
function insertWord(word) {
    currentNode = root
    for each char in word {
        if !currentNode.children.has(char) {
            currentNode.children[char] = CreateTrieNode()
        }
        currentNode = currentNode.children[char]
    }
    currentNode.isEndOfWord = true
}`,
    codeImplementation: {
      c: `struct TrieNode {
    struct TrieNode* children[26];
    int isEndOfWord;
};

struct TrieNode* createNode() {
    struct TrieNode* node = malloc(sizeof(struct TrieNode));
    node->isEndOfWord = 0;
    for (int i = 0; i < 26; i++) node->children[i] = NULL;
    return node;
}`,
      cpp: `struct TrieNode {
    std::unordered_map<char, TrieNode*> children;
    bool isEndOfWord = false;
};`,
      java: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEndOfWord = false;
}`,
      python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False`,
      csharp: `public class TrieNode {
    public Dictionary<char, TrieNode> Children = new Dictionary<char, TrieNode>();
    public bool IsEndOfWord = false;
}`
    },
    dryRun: [
      { line: 1, explanation: 'Inserting "car". Root -> "c" -> "a" -> "r" (marked end).', variables: { word: 'car', tree: 'Root->c->a->r*' } },
      { line: 2, explanation: 'Inserting "cat". Reuses "c" -> "a". Spawns "t" (marked end).', variables: { word: 'cat', tree: 'Root->c->a->(r*,t*)' } }
    ],
    complexity: {
      time: { best: 'O(L) Word Length', average: 'O(L)', worst: 'O(L)' },
      space: 'O(Words * L * AlphabetSize)',
      table: [
        { operation: 'Insert Word', time: 'O(L)', space: 'O(L)' },
        { operation: 'Prefix Search', time: 'O(L)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Very fast string lookups, independent of dictionary size.',
      'Saves space by sharing prefix paths.'
    ],
    disadvantages: [
      'High memory overhead due to empty child pointers.'
    ],
    applications: [
      'Autocomplete search engines.',
      'Spell checkers.',
      'IP routing matches.'
    ],
    commonMistakes: [
      'Creating array buffers of size 26 for non-alphabet keys.',
      'Forgetting to mark word endpoints.'
    ],
    interviewQuestions: [
      { question: 'What is the time complexity to search a word of length L in a Trie?', answer: 'O(L) time, where L is the length of the word.' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which structure is ideal for autocomplete suggestions?', options: ['Binary Search Tree', 'Trie', 'Hash Table', 'Graph'], correct: 'Trie', explanation: 'Tries store shared prefixes, allowing rapid prefix matches.' }
      ]
    },
    summary: 'Tries store character sequences, optimizing prefix searches and autocomplete matching.',
    script: [
      { type: 'intro', text: 'Tries or prefix trees speed up string index matches, key in search suggest engines.' }
    ]
  },
  {
    id: 12,
    slug: 'dynamic-programming',
    title: 'Dynamic Programming',
    difficulty: 'Advanced',
    duration: '50 mins',
    xp: 300,
    accent: '#8B5CF6',
    icon: '🧮',
    description: 'Learn how to solve complex recursive problems by breaking them into overlapping subproblems, using memoization and tabulation.',
    topics: ['Overlapping Subproblems', 'Optimal Substructure', 'Memoization (Top-down)', 'Tabulation (Bottom-up)'],
    objectives: [
      'Identify overlapping subproblems and optimal substructures.',
      'Implement top-down memoization (caching recursion).',
      'Implement bottom-up tabulation tables.',
      'Solve classic DP tasks like Knapsack and Fibonacci.'
    ],
    analogy: {
      concept: '1 + 1 + 1 + 1...',
      description: 'If I write "1+1+1+1+1" on a board, you count to 5. If I write another "+1" at the end, you instantly say "6" because you remembered the previous sum (5) and just added 1. Remembering past calculations is the core of Dynamic Programming.'
    },
    theory: `Dynamic Programming (DP) is an optimization over plain recursion. The idea is to solve subproblems once, store their results in a cache, and reuse them to avoid redundant calculations.

Two approaches:
1. Memoization (Top-Down): Recursive. Cache results during traversal.
2. Tabulation (Bottom-Up): Iterative. Fill a table from base cases up.`,
    algorithm: [
      'Formulate the state representing the subproblem.',
      'Define the state transition relation.',
      'Identify base cases.',
      'Fill cache iteratively (tabulation) or save recursive calls (memoization).'
    ],
    pseudocode: `// Fibonacci using Memoization
function fib(n, memo) {
    if memo.has(n) return memo[n]
    if n <= 1 return n
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
}`,
    codeImplementation: {
      c: `int fib(int n, int memo[]) {
    if (memo[n] != -1) return memo[n];
    if (n <= 1) return n;
    memo[n] = fib(n-1, memo) + fib(n-2, memo);
    return memo[n];
}`,
      cpp: `int fib(int n, std::vector<int>& memo) {
    if (memo[n] != -1) return memo[n];
    if (n <= 1) return n;
    return memo[n] = fib(n-1, memo) + fib(n-2, memo);
}`,
      java: `public int fib(int n, int[] memo) {
    if (memo[n] != -1) return memo[n];
    if (n <= 1) return n;
    memo[n] = fib(n-1, memo) + fib(n-2, memo);
    return memo[n];
}`,
      python: `def fib(n, memo={}):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]`,
      csharp: `public int Fib(int n, int[] memo) {
    if (memo[n] != -1) return memo[n];
    if (n <= 1) return n;
    return memo[n] = Fib(n-1, memo) + Fib(n-2, memo);
}`
    },
    dryRun: [
      { line: 1, explanation: 'Call fib(5). Checks cache: empty. Recurse to fib(4) and fib(3).', variables: { n: 5, cache: '{}' } },
      { line: 2, explanation: 'Computed fib(2) = 1. Saved in cache. Returns value.', variables: { n: 2, cache: '{2: 1}' } }
    ],
    complexity: {
      time: { best: 'O(N)', average: 'O(N)', worst: 'O(N)' },
      space: 'O(N)',
      table: [
        { operation: 'Memoized Fib', time: 'O(N)', space: 'O(N)' },
        { operation: 'Recursive Fib', time: 'O(2^N)', space: 'O(N)' }
      ]
    },
    advantages: [
      'Reduces exponential complexities (like O(2^N)) to polynomial runtimes.',
      'Ensures correct optimal solutions for complex planning problems.'
    ],
    disadvantages: [
      'High auxiliary space requirements for caching.',
      'Identifying the state transition formula can be difficult.'
    ],
    applications: [
      'Shortest paths calculations (Bellman-Ford).',
      'DNA sequence alignments.',
      'Inventory management.'
    ],
    commonMistakes: [
      'Failing to identify base cases.',
      'Using DP for problems without overlapping subproblems (wastes cache space).'
    ],
    interviewQuestions: [
      { question: 'What are the two core properties of a problem solvable by DP?', answer: '1. Overlapping Subproblems (subproblems are computed repeatedly). 2. Optimal Substructure (optimal solution of problem contains optimal solutions to subproblems).' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is the top-down recursive optimization approach in DP?', options: ['Tabulation', 'Memoization', 'Divide & Conquer', 'Backtracking'], correct: 'Memoization', explanation: 'Memoization caches recursive call returns dynamically.' }
      ]
    },
    summary: 'Dynamic Programming avoids redundant work by caching computed subproblems, optimizing algorithms significantly.',
    script: [
      { type: 'intro', text: 'Dynamic programming turns exponential recursion trees into efficient linear passes by caching subproblems.' }
    ]
  },
  {
    id: 13,
    slug: 'greedy',
    title: 'Greedy Algorithms',
    difficulty: 'Intermediate',
    duration: '25 mins',
    xp: 140,
    accent: '#10B981',
    icon: '⚙️',
    description: 'Learn greedy choice properties, local optimization strategies, and classic scheduling problems.',
    topics: ['Local Optimization', 'Greedy Choice Property', 'Fractional Knapsack', 'Interval Scheduling'],
    objectives: [
      'Understand the greedy choice property (local optimum for global best).',
      'Verify if greedy strategy yields correct global results.',
      'Solve interval scheduling and fractional knapsack problems.',
      'Compare greedy methods with dynamic programming.'
    ],
    analogy: {
      concept: 'Paying with Bills',
      description: 'If you want to pay $36 using the fewest bills possible, you naturally grab the largest bill first ($20), then the next largest ($10), then ($5), then ($1). You make the locally optimal choice at each step to get the globally optimal count.'
    },
    theory: `A Greedy Algorithm builds a solution piece-by-piece, making the choice that offers the most immediate benefit (local optimum) without considering future consequences. 

It does not always produce the globally optimal solution, but when it does, it is usually much faster than dynamic programming.`,
    algorithm: [
      'Define the sorting criteria for candidates.',
      'Sort candidates accordingly.',
      'Iterate through candidates. Add to solution set if constraints are met.'
    ],
    pseudocode: `// Greedy Activity Selection
function selectActivities(start, end) {
    Sort activities by end times
    selected = [activities[0]]
    lastEnd = activities[0].end
    for i from 1 to count {
        if activities[i].start >= lastEnd {
            selected.push(activities[i])
            lastEnd = activities[i].end
        }
    }
    return selected
}`,
    codeImplementation: {
      c: `// Simple Greedy selection logic
struct Activity { int start, end; };
int compare(const void* a, const void* b) {
    return ((struct Activity*)a)->end - ((struct Activity*)b)->end;
}`,
      cpp: `struct Activity { int start, end; };
bool compare(Activity a, Activity b) { return a.end < b.end; }`,
      java: `class Activity implements Comparable<Activity> {
    int start, end;
    public int compareTo(Activity other) { return this.end - other.end; }
}`,
      python: `def select_activities(activities):
    activities.sort(key=lambda x: x[1]) # sort by end
    selected = [activities[0]]
    # ...`,
      csharp: `public class Activity {
    public int Start { get; set; }
    public int End { get; set; }
}`
    },
    dryRun: [
      { line: 1, explanation: 'Sorting activities by finish times. Sorted: [(1, 4), (3, 5), (0, 6)].', variables: { sortedList: '[(1,4), (3,5), (0,6)]' } },
      { line: 2, explanation: 'Pick first activity (1, 4). End set to 4.', variables: { selected: '[(1,4)]', lastEnd: 4 } }
    ],
    complexity: {
      time: { best: 'O(N log N) Sorting', average: 'O(N log N)', worst: 'O(N log N)' },
      space: 'O(1) Auxiliary',
      table: [
        { operation: 'Sort activities', time: 'O(N log N)', space: 'O(1)' },
        { operation: 'Select loop', time: 'O(N)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Simple to design and implement.',
      'Low time and space complexity.'
    ],
    disadvantages: [
      'Does not guarantee optimal solutions for all problems (e.g. 0-1 Knapsack).'
    ],
    applications: [
      'Kruskal\'s and Prim\'s minimum spanning tree algorithms.',
      'Huffman encoding data compression.',
      'Fractional Knapsack calculations.'
    ],
    commonMistakes: [
      'Assuming greedy choices are always globally correct.',
      'Using a greedy approach for 0-1 Knapsack (requires DP).'
    ],
    interviewQuestions: [
      { question: 'Why does greedy fail on the 0-1 Knapsack problem?', answer: 'Because you cannot split items, and selecting the highest value-to-weight ratio first may leave empty space that could be filled with a better combination.' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which algorithm finds minimum spanning trees using a greedy approach?', options: ['Dijkstra', 'Floyd-Warshall', 'Kruskal', 'Bellman-Ford'], correct: 'Kruskal', explanation: 'Kruskal\'s algorithm greedily adds the cheapest available edges that don\'t create cycles.' }
      ]
    },
    summary: 'Greedy algorithms build solutions by selecting local optima, offering speed but requiring verification of correctness.',
    script: [
      { type: 'intro', text: 'Greedy choices build solutions by choosing local benefits, optimizing speed when mathematically correct.' }
    ]
  },
  {
    id: 14,
    slug: 'searching',
    title: 'Searching Algorithms',
    difficulty: 'Beginner',
    duration: '20 mins',
    xp: 100,
    accent: '#3B82F6',
    icon: '🔍',
    description: 'Learn linear and binary search algorithms, compare their complexities, and analyze division strategies.',
    topics: ['Linear Search', 'Binary Search', 'Search Space Division', 'Interpolation Search'],
    objectives: [
      'Differentiate between linear scans and logarithmic search space divisions.',
      'Implement iterative and recursive Binary Search.',
      'Identify sorting preconditions for logarithmic searches.',
      'Analyze binary search space boundaries.'
    ],
    analogy: {
      concept: 'Searching a Dictionary',
      description: 'To find a word in a dictionary, you don\'t start at page 1 and read every word (Linear Search). Instead, you open to the middle, see if your word is earlier or later, discard half the pages, and repeat (Binary Search).'
    },
    theory: `Searching is locating an element within a dataset.
- Linear Search: Scans each element. Works on unsorted data. O(N) time.
- Binary Search: Repeatedly halves the search space. Requires sorted data. O(log N) time.`,
    algorithm: [
      'Binary Search: Find middle index. If arr[mid] == target, return mid. If target < arr[mid], repeat on left half. Otherwise, repeat on right half.'
    ],
    pseudocode: `// Binary Search Iterative
function binarySearch(arr, target) {
    low = 0
    high = arr.length - 1
    while low <= high {
        mid = low + (high - low) / 2
        if arr[mid] == target return mid
        if arr[mid] < target low = mid + 1
        else high = mid - 1
    }
    return -1
}`,
    codeImplementation: {
      c: `int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      cpp: `int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      java: `public int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: low = mid + 1
        else: high = mid - 1
    return -1`,
      csharp: `public int BinarySearch(int[] arr, int target) {
    int low = 0, high = arr.Length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    },
    dryRun: [
      { line: 1, explanation: 'Init search space low = 0, high = 4. Mid index = 2 (value = 12).', variables: { low: 0, high: 4, mid: 2, val: 12, target: 15 } },
      { line: 2, explanation: '12 < 15, search right half. low = 3, high = 4.', variables: { low: 3, high: 4, target: 15 } }
    ],
    complexity: {
      time: { best: 'O(1)', average: 'O(log N)', worst: 'O(log N)' },
      space: 'O(1)',
      table: [
        { operation: 'Binary Search', time: 'O(log N)', space: 'O(1)' },
        { operation: 'Linear Search', time: 'O(N)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Binary search offers logarithmic scaling.',
      'Ideal for large static sorted arrays.'
    ],
    disadvantages: [
      'Data must be pre-sorted.',
      'Updating sorted arrays (insertions/deletions) is costly.'
    ],
    applications: [
      'Database index queries.',
      'Standard library lookup utilities.',
      'Numeric root approximations.'
    ],
    commonMistakes: [
      'Running binary search on unsorted data.',
      'Index calculations causing integer overflow (use low + (high-low)/2, not (low+high)/2).'
    ],
    interviewQuestions: [
      { question: 'Why is (low + high) / 2 unsafe in C/Java?', answer: 'It can exceed the maximum integer boundary, causing overflow errors. Use low + (high - low) / 2 instead.' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is the precondition for Binary Search?', options: ['Data must be unsorted', 'Data must be sorted', 'Data must contain no duplicates', 'Data size must be even'], correct: 'Data must be sorted', explanation: 'Binary search splits space based on element order comparisons, requiring sorted inputs.' }
      ]
    },
    summary: 'Binary search halves sorted search spaces to locate elements in O(log N) steps.',
    script: [
      { type: 'intro', text: 'Searching algorithms look up values, with binary search halving sorted spaces for speed.' }
    ]
  },
  {
    id: 15,
    slug: 'sorting',
    title: 'Sorting Algorithms',
    difficulty: 'Intermediate',
    duration: '35 mins',
    xp: 180,
    accent: '#F59E0B',
    icon: '📈',
    description: 'Learn comparative sorting strategies, bubble sort, merge sort, quicksort, and analyze divide-and-conquer runtime splits.',
    topics: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'],
    objectives: [
      'Understand comparative sorting concepts.',
      'Differentiate between quadratic O(N²) and linearithmic O(N log N) runtimes.',
      'Implement divide-and-conquer splits (Merge/Quick Sort).',
      'Analyze stability and space requirements.'
    ],
    analogy: {
      concept: 'Sorting Playing Cards',
      description: 'Bubble sort is like repeatedly comparing adjacent cards and swapping them until the largest card bubbles to the right. Insertion sort is like taking one card at a time and inserting it into its correct position in your left hand.'
    },
    theory: `Sorting rearranges a list of elements into a specific order (ascending or descending).
- Quadratic Sorting: Bubble, Selection, Insertion Sort. Best for small data. O(N²) time.
- Linearithmic Sorting: Merge, Quick, Heap Sort. Best for larger data. O(N log N) time.

Merge sort is stable and uses auxiliary space O(N), whereas Quick Sort is unstable but sorts in-place O(1) auxiliary space.`,
    algorithm: [
      'Bubble Sort: Compare adjacent items. Swap if in wrong order. Repeat N-1 times.',
      'Merge Sort: Divide array in half. Recurse. Merge sorted halves.'
    ],
    pseudocode: `// Bubble Sort
function bubbleSort(arr) {
    for i from 0 to arr.length - 1 {
        for j from 0 to arr.length - i - 2 {
            if arr[j] > arr[j + 1] swap(arr[j], arr[j + 1])
        }
    }
}`,
    codeImplementation: {
      c: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`,
      cpp: `void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; ++i)
        for (int j = 0; j < n-i-1; ++j)
            if (arr[j] > arr[j+1]) std::swap(arr[j], arr[j+1]);
}`,
      java: `public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n-1):
        for j in range(n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`,
      csharp: `public void BubbleSort(int[] arr) {
    int n = arr.Length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`
    },
    dryRun: [
      { line: 1, explanation: 'Comparing index 0 (5) and index 1 (2). 5 > 2, swap.', variables: { array: '[2, 5, 1, 8]', action: 'Swap' } },
      { line: 2, explanation: 'Comparing index 1 (5) and index 2 (1). 5 > 1, swap.', variables: { array: '[2, 1, 5, 8]', action: 'Swap' } }
    ],
    complexity: {
      time: { best: 'O(N) Bubble Sorted', average: 'O(N log N) Merge', worst: 'O(N²) Bubble/Quick' },
      space: 'O(1) Bubble / O(N) Merge',
      table: [
        { operation: 'Merge Sort', time: 'O(N log N)', space: 'O(N)' },
        { operation: 'Bubble Sort', time: 'O(N²)', space: 'O(1)' }
      ]
    },
    advantages: [
      'Linearithmic sorting scales efficiently for millions of items.',
      'In-place quicksort avoids extra memory overhead.'
    ],
    disadvantages: [
      'Quadratic sorting degrades on larger datasets.',
      'Merge sort requires O(N) auxiliary array buffers.'
    ],
    applications: [
      'Ordering raw user query results.',
      'Optimizing searches via pre-sorting.',
      'Priority task pipelines.'
    ],
    commonMistakes: [
      'Using bubble sort on large datasets in production.',
      'Forgetting that unstable sorts may change relative order of equal keys.'
    ],
    interviewQuestions: [
      { question: 'What is a stable sorting algorithm?', answer: 'One that preserves the relative order of duplicate elements.' }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is the worst-case time complexity of Merge Sort?', options: ['O(N)', 'O(N log N)', 'O(N²)', 'O(2^N)'], correct: 'O(N log N)', explanation: 'Merge sort always splits and merges, ensuring O(N log N) bounds.' }
      ]
    },
    summary: 'Sorting arranges elements. Divide-and-conquer strategies (Merge/Quick Sort) scale efficiently for large inputs.',
    script: [
      { type: 'intro', text: 'Sorting rearranges lists, comparing algorithms on stability, auxiliary space, and growth.' }
    ]
  }
];
