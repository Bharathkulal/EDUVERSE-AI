import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Database, RefreshCw, Award, Play, Pause, RotateCcw,
  Eye, Terminal, ArrowLeft, Home, ArrowRight, Search, Activity, GitFork,
  Binary, Grid, Network, Sliders, Repeat, HelpCircle
} from 'lucide-react';
import './DSALab.css';

// ═══════════════════════════════════════════════════════════
// DATA STRUCTURES AND ALGORITHMS MODULE DATA (C Language)
// ═══════════════════════════════════════════════════════════
const DSA_DATA = [
  {
    id: 'arrays',
    title: 'Arrays',
    Icon: Grid,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    description: 'Understand linear arrays, index retrieval, insertions, and deletions.',
    difficulty: 'beginner',
    duration: '10 min',
    xp: 100,
    topics: [
      {
        id: 'array-ops',
        title: 'Array Operations Visualizer',
        vizType: 'arrayViz',
        steps: 4,
        preview: 'Visualize element insertions, deletions, and lookup operations.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    // Step 1: Initial Array', steps: [0] },
          { text: '    int arr[5] = { 10, 20, 30, 40 };', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Insert element 25 at index 2', steps: [1] },
          { text: '    for(int i = 4; i > 2; i--) arr[i] = arr[i-1];', steps: [1] },
          { text: '    arr[2] = 25; // array: { 10, 20, 25, 30, 40 }', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Delete element at index 1', steps: [2] },
          { text: '    for(int i = 1; i < 4; i++) arr[i] = arr[i+1]; // { 10, 25, 30, 40 }', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 4: Search element 30', steps: [3] },
          { text: '    int index = -1;', steps: [3] },
          { text: '    for(int i = 0; i < 4; i++) {', steps: [3] },
          { text: '        if(arr[i] == 30) index = i; // found index 2', steps: [3] },
          { text: '    }', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    getch(); // wait for keystroke', steps: [0, 1, 2, 3] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Initial State', 'Insert 25 at idx 2', 'Delete idx 1', 'Search 30'],
        stepDescriptions: [
          'The initial array contains four elements indexed 0 to 3.',
          'To insert 25 at index 2, we shift elements 30 and 40 to the right, then insert 25 in the newly freed slot.',
          'To delete index 1 (value 20), we remove the element and shift 25, 30, and 40 left to close the empty index.',
          'To search for 30, we scan indexes sequentially. We find 30 at index 2 and return it!'
        ]
      }
    ]
  },
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    Icon: GitFork,
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    description: 'Master pointers, dynamic memory node allocation, and links restructuring.',
    difficulty: 'intermediate',
    duration: '15 min',
    xp: 150,
    topics: [
      {
        id: 'linkedlist-ops',
        title: 'Singly Linked List Visualizer',
        vizType: 'linkedListViz',
        steps: 4,
        preview: 'Watch node connection redirection on Push, Insert, and Pop operations.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <stdlib.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '', steps: [] },
          { text: 'struct Node { int data; struct Node* next; };', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    // Step 1: Initial List [10] -> [20] -> NULL', steps: [0] },
          { text: '    struct Node* head = createNode(10);', steps: [0] },
          { text: '    head->next = createNode(20);', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Push back [30]', steps: [1] },
          { text: '    struct Node* temp = createNode(30);', steps: [1] },
          { text: '    head->next->next = temp;', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Insert [15] after [10]', steps: [2] },
          { text: '    struct Node* insertNode = createNode(15);', steps: [2] },
          { text: '    insertNode->next = head->next;', steps: [2] },
          { text: '    head->next = insertNode;', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 4: Delete Node [20]', steps: [3] },
          { text: '    insertNode->next = temp; // bypass [20]', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Initial state', 'Push Back 30', 'Insert 15', 'Delete 20'],
        stepDescriptions: [
          'Initially, the head pointer points to node 10, which connects to node 20 pointing to null.',
          'To append 30, we create a new node and point the next pointer of the last node (20) to it.',
          'Inserting 15 after 10 requires pointing node 15 next to node 20, then redirecting 10 next to 15.',
          'To delete node 20, we bypass it by pointing node 15 next directly to node 30. Node 20 is garbage collected!'
        ]
      }
    ]
  },
  {
    id: 'stack',
    title: 'Stack',
    Icon: Layers,
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #D946EF)',
    description: 'Explore Last-In, First-Out (LIFO) stacks, pushes, pops, and error boundary limits.',
    difficulty: 'beginner',
    duration: '12 min',
    xp: 120,
    topics: [
      {
        id: 'stack-ops',
        title: 'Stack Memory Simulation',
        vizType: 'stackViz',
        steps: 5,
        preview: 'Visualize LIFO operations, stack overflow, and stack underflow limits.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '#define MAX 3', steps: [] },
          { text: 'int stack[MAX], top = -1;', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    // Step 1: Initial Stack with 10, 20', steps: [0] },
          { text: '    push(10); push(20);', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Push 30', steps: [1] },
          { text: '    push(30); // top = 2', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Stack Overflow check', steps: [2] },
          { text: '    if(top >= MAX-1) printf("Stack Overflow!\\n");', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 4: Pop element', steps: [3] },
          { text: '    int val = stack[top--]; // returns 30', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    // Step 5: Pop until Underflow', steps: [4] },
          { text: '    if(top == -1) printf("Stack Underflow!\\n");', steps: [4] },
          { text: '    ', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3, 4] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Initial state', 'Push 30', 'Overflow Check', 'Pop 30', 'Underflow Check'],
        stepDescriptions: [
          'The stack of capacity 3 contains elements 10 and 20. Top pointer is at index 1.',
          'Pushing 30 increments the Top index and places 30 at the peak of the stack.',
          'Attempting to push 40 when stack is full throws a Stack Overflow error!',
          'Popping removes 30 from the top of the stack and decrements the Top index.',
          'Popping elements until empty is fine, but popping from an empty stack throws a Stack Underflow error!'
        ]
      }
    ]
  },
  {
    id: 'queue',
    title: 'Queue',
    Icon: Database,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    description: 'Understand First-In, First-Out (FIFO) buffers, front and rear pointers.',
    difficulty: 'beginner',
    duration: '12 min',
    xp: 120,
    topics: [
      {
        id: 'queue-ops',
        title: 'Queue Buffer Visualizer',
        vizType: 'queueViz',
        steps: 4,
        preview: 'Watch front and rear pointer movement during enqueue and dequeue.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: 'int queue[5], front = 0, rear = -1;', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    // Step 1: Initial Queue with 10, 20', steps: [0] },
          { text: '    enqueue(10); enqueue(20);', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Enqueue 30', steps: [1] },
          { text: '    queue[++rear] = 30;', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Dequeue (FIFO)', steps: [2] },
          { text: '    int val = queue[front++]; // returns 10', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 4: Dequeue 20', steps: [3] },
          { text: '    int val2 = queue[front++]; // returns 20', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Initial state', 'Enqueue 30', 'Dequeue 10', 'Dequeue 20'],
        stepDescriptions: [
          'The queue contains elements 10 and 20. Front is at 10 (index 0) and Rear is at 20 (index 1).',
          'Enqueueing 30 appends it to the rear of the queue and updates the Rear pointer to index 2.',
          'Dequeuing removes 10 from the front of the queue. The Front pointer shifts to index 1 (value 20).',
          'Dequeuing again removes 20. Front pointer shifts to index 2 (value 30).'
        ]
      }
    ]
  },
  {
    id: 'trees',
    title: 'Trees',
    Icon: GitFork,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    description: 'Explore Binary Search Trees (BST), node insertions, searches, and traversals.',
    difficulty: 'intermediate',
    duration: '20 min',
    xp: 200,
    topics: [
      {
        id: 'bst-ops',
        title: 'Binary Search Tree Lab',
        vizType: 'treeViz',
        steps: 5,
        preview: 'Follow BST logic: left child is smaller, right child is larger.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <stdlib.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '', steps: [] },
          { text: 'struct Node { int val; struct Node *left, *right; };', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    // Step 1: Initial BST Root(20)', steps: [0] },
          { text: '    struct Node* root = createNode(20);', steps: [0] },
          { text: '    root->left = createNode(10); root->right = createNode(30);', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Insert 15 (15 < 20 and 15 > 10)', steps: [1] },
          { text: '    insert(root, 15);', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Insert 35 (35 > 20 and 35 > 30)', steps: [2] },
          { text: '    insert(root, 35);', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 4: Search for 15', steps: [3] },
          { text: '    struct Node* found = search(root, 15); // found!', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    // Step 5: Search for 40', steps: [4] },
          { text: '    struct Node* notFound = search(root, 40); // NULL', steps: [4] },
          { text: '    ', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3, 4] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Initial BST', 'Insert 15', 'Insert 35', 'Search 15', 'Search 40'],
        stepDescriptions: [
          'Initial tree with root 20, left child 10, and right child 30.',
          'To insert 15, we compare with root 20 (go left), then compare with 10 (go right). It becomes 10\'s right child.',
          'To insert 35, we compare with root 20 (go right), then compare with 30 (go right). It becomes 30\'s right child.',
          'Searching for 15: start at root 20. 15 < 20 (go left to 10). 15 > 10 (go right to 15). We found the node!',
          'Searching for 40: start at root 20. 40 > 20 (go right to 30). 40 > 30 (go right to 35). 40 > 35 (go right, null). Element not found.'
        ]
      }
    ]
  },
  {
    id: 'graphs',
    title: 'Graphs',
    Icon: Network,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    description: 'Learn traversal algorithms (BFS and DFS) on custom network graph structures.',
    difficulty: 'advanced',
    duration: '22 min',
    xp: 220,
    topics: [
      {
        id: 'graph-traversals',
        title: 'BFS & DFS Traversals',
        vizType: 'graphViz',
        steps: 5,
        preview: 'Watch Queue (BFS) or Stack (DFS) track nodes traversal step by step.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '#define NODES 5', steps: [] },
          { text: 'int visited[NODES] = {0};', steps: [] },
          { text: '', steps: [] },
          { text: 'void DFS(int node) {', steps: [] },
          { text: '    visited[node] = 1;', steps: [0, 1, 2, 3, 4] },
          { text: '    // Step 1: Start at A', steps: [0] },
          { text: '    // Step 2: Visit neighbor B', steps: [1] },
          { text: '    // Step 3: Visit neighbor D', steps: [2] },
          { text: '    // Step 4: Visit neighbor C', steps: [3] },
          { text: '    // Step 5: Visit neighbor E', steps: [4] },
          { text: '}', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    DFS(0); // start at A (index 0)', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3, 4] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Start A', 'Visit B', 'Visit D', 'Visit C', 'Visit E'],
        stepDescriptions: [
          'Start traversal from Node A. Mark A as visited and push its neighbors B and C onto our traversal tracker.',
          'DFS pops Node B next. Node B is visited, and its neighbor D is added to the stack.',
          'DFS pops Node D next. Node D has no unvisited neighbors, so we backtrack.',
          'We pop Node C. Node C is visited, and its neighbor Node E is added to the stack.',
          'Finally, we pop and visit Node E. All nodes visited successfully!'
        ]
      }
    ]
  },
  {
    id: 'heap',
    title: 'Heap',
    Icon: Sliders,
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
    description: 'Master max heap bubble up and bubble down element restructuring.',
    difficulty: 'advanced',
    duration: '18 min',
    xp: 180,
    topics: [
      {
        id: 'heap-ops',
        title: 'Max Heap Visualizer',
        vizType: 'heapViz',
        steps: 4,
        preview: 'Watch elements swim up to satisfy the binary max heap constraint.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: 'int heap[10] = { 40, 30, 20 }, size = 3;', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    // Step 1: Initial Heap (Max elements at Root)', steps: [0] },
          { text: '    printHeap();', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Insert element 50 at leaf node', steps: [1] },
          { text: '    heap[size++] = 50;', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Bubble Up (Swap 50 and 30)', steps: [2] },
          { text: '    swap(&heap[3], &heap[1]);', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 4: Bubble Up (Swap 50 and 40)', steps: [3] },
          { text: '    swap(&heap[1], &heap[0]); // 50 becomes Root', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Initial Heap', 'Insert 50', 'Bubble Up Step 1', 'Bubble Up Step 2'],
        stepDescriptions: [
          'Initially, root node is 40. Children are 30 and 20. Heap property is satisfied.',
          'We insert 50 at the bottom-left leaf position. Heap property is now violated because 50 > 30.',
          'We swap 50 with its parent 30. Now 50 is compared with its new parent (root 40). Violation still persists.',
          'We swap 50 with root 40. Now 50 is the root node. The heap is balanced and valid!'
        ]
      }
    ]
  },
  {
    id: 'hash-tables',
    title: 'Hash Tables',
    Icon: Binary,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    description: 'Explore hashing functions, collisions, and bucket chains.',
    difficulty: 'intermediate',
    duration: '14 min',
    xp: 140,
    topics: [
      {
        id: 'hash-ops',
        title: 'Hashing Collision Visualizer',
        vizType: 'hashViz',
        steps: 4,
        preview: 'See how key values route to buckets, handling duplicates with chains.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <stdlib.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '', steps: [] },
          { text: 'int hash(int key) { return key % 4; }', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    // Step 1: Insert Key 5 (5 % 4 = 1)', steps: [0] },
          { text: '    insertTable(5);', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Insert Key 8 (8 % 4 = 0)', steps: [1] },
          { text: '    insertTable(8);', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Insert Key 9 (COLLISION)', steps: [2] },
          { text: '    insertTable(9); // maps to 1', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 4: Chain Node [9] after [5]', steps: [3] },
          { text: '    buckets[1]->next = createNode(9);', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Insert 5', 'Insert 8', 'Collision (9)', 'Chained List'],
        stepDescriptions: [
          'We insert key 5. Since 5 % 4 = 1, it is mapped to index 1 of the hash table.',
          'We insert key 8. Since 8 % 4 = 0, it is mapped to index 0 of the table.',
          'We insert key 9. Since 9 % 4 = 1, index 1 already contains 5. A collision occurs!',
          'To handle the collision, key 9 is appended to the linked list starting at index 1.'
        ]
      }
    ]
  },
  {
    id: 'searching',
    title: 'Searching Algorithms',
    Icon: Search,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    description: 'Compare Linear vs Binary Search complexity on sorted data structures.',
    difficulty: 'beginner',
    duration: '10 min',
    xp: 100,
    topics: [
      {
        id: 'search-algorithms',
        title: 'Linear vs Binary Search',
        vizType: 'searchingViz',
        steps: 4,
        preview: 'Watch step search pointers eliminate indexes in real time.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    int arr[7] = { 5, 10, 15, 20, 25, 30, 35 };', steps: [0] },
          { text: '    int low = 0, high = 6, target = 25, mid;', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 1: First comparison at Mid = 3 (value 20)', steps: [1] },
          { text: '    mid = (low + high) / 2; // mid = 3', steps: [1] },
          { text: '    if(arr[mid] < target) low = mid + 1; // search right half', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Second comparison at Mid = 5 (value 30)', steps: [2] },
          { text: '    mid = (low + high) / 2; // mid = 5', steps: [2] },
          { text: '    if(arr[mid] > target) high = mid - 1; // search left half', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Third comparison at Mid = 4 (value 25)', steps: [3] },
          { text: '    mid = (low + high) / 2; // mid = 4', steps: [3] },
          { text: '    if(arr[mid] == target) printf("Found Target!\\n");', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Initial Search', 'First Mid Cut', 'Second Mid Cut', 'Found Target'],
        stepDescriptions: [
          'We are searching for target 25 in a sorted array of 7 elements.',
          'Binary search starts with Mid pointer at index 3 (value 20). Since 25 > 20, we discard the left half.',
          'We update pointers (Low=4, High=6) and compute new Mid = index 5 (value 30). Since 25 < 30, we discard the right half.',
          'We update pointers (Low=4, High=4) and compute new Mid = index 4 (value 25). Pointers align and target is found in 3 steps!'
        ]
      }
    ]
  },
  {
    id: 'sorting',
    title: 'Sorting Algorithms',
    Icon: Sliders,
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    description: 'Visualize Bubble Sort array element height swapping animations.',
    difficulty: 'intermediate',
    duration: '15 min',
    xp: 150,
    topics: [
      {
        id: 'bubble-sort',
        title: 'Bubble Sort Swaps',
        vizType: 'sortingViz',
        steps: 4,
        preview: 'Watch elements swap positions to float larger numbers to the end.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    int arr[4] = { 30, 10, 40, 20 };', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 1: Compare & Swap 30 & 10', steps: [1] },
          { text: '    if(arr[0] > arr[1]) { int temp = arr[0]; arr[0] = arr[1]; arr[1] = temp; }', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Compare 30 & 40 (No swap)', steps: [2] },
          { text: '    if(arr[1] > arr[2]) { /* no swap */ }', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Compare & Swap 40 & 20', steps: [3] },
          { text: '    if(arr[2] > arr[3]) { int temp = arr[2]; arr[2] = arr[3]; arr[3] = temp; }', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Unsorted Array', 'Swap 30 & 10', 'No Swap 30 & 40', 'Swap 40 & 20'],
        stepDescriptions: [
          'Initial unsorted array is [ 30, 10, 40, 20 ].',
          'Compare index 0 (30) and index 1 (10). Since 30 > 10, we swap them. Array becomes [ 10, 30, 40, 20 ].',
          'Compare index 1 (30) and index 2 (40). Since 30 is smaller than 40, no swap occurs.',
          'Compare index 2 (40) and index 3 (20). Since 40 > 20, we swap them. The largest element 40 floats to the end!'
        ]
      }
    ]
  },
  {
    id: 'recursion',
    title: 'Recursion',
    Icon: Repeat,
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #BE185D)',
    description: 'Visualize recursive call stack frames, base cases, and returns.',
    difficulty: 'intermediate',
    duration: '12 min',
    xp: 120,
    topics: [
      {
        id: 'factorial-stack',
        title: 'Factorial Call Stack',
        vizType: 'recursionViz',
        steps: 5,
        preview: 'Watch call stack frames stack up and pop off on base case trigger.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '', steps: [] },
          { text: 'int fact(int n) {', steps: [] },
          { text: '    if (n <= 1) return 1; // Base case', steps: [2] },
          { text: '    return n * fact(n - 1);', steps: [0, 1, 3, 4] },
          { text: '}', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    // Step 1: call fact(3)', steps: [0] },
          { text: '    // Step 2: calls fact(2)', steps: [1] },
          { text: '    // Step 3: calls fact(1) (returns 1)', steps: [2] },
          { text: '    // Step 4: fact(2) returns 2 * 1 = 2', steps: [3] },
          { text: '    // Step 5: fact(3) returns 3 * 2 = 6', steps: [4] },
          { text: '    printf("Fact: %d\\n", fact(3));', steps: [0, 4] },
          { text: '    getch();', steps: [0, 1, 2, 3, 4] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Call fact(3)', 'Call fact(2)', 'Base case fact(1)', 'Resolve fact(2)', 'Resolve fact(3)'],
        stepDescriptions: [
          'We call fact(3). It waits for fact(2) to resolve. A stack frame for fact(3) is pushed.',
          'fact(3) calls fact(2), which waits for fact(1). A stack frame for fact(2) is pushed.',
          'fact(2) calls fact(1). n <= 1 matches, hitting base case and returning 1. A frame is pushed and immediately resolved.',
          'fact(1) return value 1 reaches fact(2). fact(2) resolves 2 * 1 = 2 and pops off the stack.',
          'fact(2) return value 2 reaches fact(3). fact(3) resolves 3 * 2 = 6 and returns the final result!'
        ]
      }
    ]
  },
  {
    id: 'dp',
    title: 'Dynamic Programming',
    Icon: Activity,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #047857)',
    description: 'Solve complex problems by caching subproblem solutions with tables.',
    difficulty: 'advanced',
    duration: '20 min',
    xp: 200,
    topics: [
      {
        id: 'fib-memo',
        title: 'Fibonacci Tabulation',
        vizType: 'dpViz',
        steps: 5,
        preview: 'Watch subproblem arrays fill up cache grids to avoid duplicates.',
        code: [
          { text: '#include <stdio.h>', steps: [] },
          { text: '#include <conio.h>', steps: [] },
          { text: '', steps: [] },
          { text: 'int main() {', steps: [] },
          { text: '    int dp[5];', steps: [] },
          { text: '    // Step 1: Base cases', steps: [0] },
          { text: '    dp[0] = 0; dp[1] = 1;', steps: [0] },
          { text: '    ', steps: [] },
          { text: '    // Step 2: Solve dp[2]', steps: [1] },
          { text: '    dp[2] = dp[1] + dp[0]; // dp[2] = 1', steps: [1] },
          { text: '    ', steps: [] },
          { text: '    // Step 3: Solve dp[3]', steps: [2] },
          { text: '    dp[3] = dp[2] + dp[1]; // dp[3] = 2', steps: [2] },
          { text: '    ', steps: [] },
          { text: '    // Step 4: Solve dp[4]', steps: [3] },
          { text: '    dp[4] = dp[3] + dp[2]; // dp[4] = 3', steps: [3] },
          { text: '    ', steps: [] },
          { text: '    // Step 5: Final Result', steps: [4] },
          { text: '    printf("Fib(4) = %d\\n", dp[4]);', steps: [4] },
          { text: '    ', steps: [] },
          { text: '    getch();', steps: [0, 1, 2, 3, 4] },
          { text: '    return 0;', steps: [] },
          { text: '}', steps: [] }
        ],
        stepLabels: ['Base Cases', 'Solve dp[2]', 'Solve dp[3]', 'Solve dp[4]', 'Final Result'],
        stepDescriptions: [
          'Initial DP array created. Base cases dp[0] = 0 and dp[1] = 1 are pre-filled.',
          'To calculate dp[2], we look up cached values dp[1] (1) and dp[0] (0). Sum is 1. We store it.',
          'To calculate dp[3], we sum dp[2] (1) and dp[1] (1), caching 2. No recalculation of subproblems needed!',
          'To calculate dp[4], we sum dp[3] (2) and dp[2] (1), caching 3.',
          'The value dp[4] (3) is successfully returned from the DP cache table in O(N) time complexity!'
        ]
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// SVG VISUALIZER SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

// 1. Array Operations
function ArrayViz({ step }) {
  const elements = [10, 20, 30, 40];
  let displayElements = [...elements];
  let insertIndex = -1;
  let deleteIndex = -1;
  let searchHighlightIndex = -1;

  if (step === 1) {
    displayElements = [10, 20, 25, 30, 40];
    insertIndex = 2;
  } else if (step === 2) {
    displayElements = [10, 25, 30, 40];
    deleteIndex = 1;
  } else if (step === 3) {
    displayElements = [10, 25, 30, 40];
    searchHighlightIndex = 2; // index of value 30
  }

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <defs>
        <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
        </filter>
      </defs>
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" filter="url(#card-shadow)" />
      
      <g transform="translate(40, 80)">
        {displayElements.map((val, idx) => {
          let fill = "var(--dsa-card)";
          let stroke = "var(--dsa-border)";
          let textFill = "var(--dsa-text)";
          let pulseClass = "";

          if (idx === insertIndex && step === 1) {
            fill = "rgba(59, 130, 246, 0.1)";
            stroke = "#3B82F6";
            pulseClass = "anim-pulse-glow";
          }
          if (idx === deleteIndex && step === 2) {
            fill = "rgba(239, 68, 68, 0.1)";
            stroke = "#EF4444";
          }
          if (idx === searchHighlightIndex && step === 3) {
            fill = "rgba(16, 185, 129, 0.15)";
            stroke = "#10B981";
            pulseClass = "anim-pulse-glow";
          }

          return (
            <g key={idx} transform={`translate(${idx * 80}, 0)`}>
              <rect className={pulseClass} width="65" height="55" rx="8" fill={fill} stroke={stroke} strokeWidth="2" />
              <text x="32" y="32" textAnchor="middle" fill={textFill} fontWeight="700" fontSize="15">{val}</text>
              <text x="32" y="70" textAnchor="middle" fill="var(--dsa-muted)" fontWeight="600" fontSize="12">[{idx}]</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// 2. Linked List Operations
function LinkedListViz({ step }) {
  let nodes = [10, 20];
  let pushActive = false;
  let insertActive = false;
  let deleteActive = false;

  if (step === 1) {
    nodes = [10, 20, 30];
    pushActive = true;
  } else if (step === 2) {
    nodes = [10, 15, 20, 30];
    insertActive = true;
  } else if (step === 3) {
    nodes = [10, 15, 30];
    deleteActive = true;
  }

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />
      
      {/* Node layout */}
      <g transform="translate(25, 90)">
        {nodes.map((val, idx) => {
          let isSpecial = false;
          let nodeColor = "var(--dsa-border)";
          let valColor = "rgba(6, 182, 212, 0.1)";

          if (pushActive && idx === 2) { isSpecial = true; nodeColor = "#06B6D4"; }
          if (insertActive && idx === 1) { isSpecial = true; nodeColor = "#06B6D4"; }
          if (deleteActive && idx === 1) { isSpecial = true; nodeColor = "#EF4444"; }

          return (
            <g key={idx} transform={`translate(${idx * 110}, 0)`}>
              {/* Node structure: data | next */}
              <rect x="0" y="0" width="55" height="40" rx="6" fill={valColor} stroke={nodeColor} strokeWidth="2" />
              <rect x="55" y="0" width="20" height="40" rx="6" fill="var(--dsa-card)" stroke={nodeColor} strokeWidth="2" />
              <text x="27" y="24" textAnchor="middle" fill="var(--dsa-text)" fontWeight="700" fontSize="13">{val}</text>
              
              {/* Pointer dot */}
              <circle cx="65" cy="20" r="4" fill="var(--dsa-accent)" />

              {/* Head / Tail label */}
              {idx === 0 && <text x="35" y="-12" textAnchor="middle" fill="var(--dsa-accent)" fontWeight="700" fontSize="10">head</text>}
              {idx === nodes.length - 1 && <text x="35" y="55" textAnchor="middle" fill="var(--dsa-muted)" fontWeight="500" fontSize="10">null</text>}

              {/* Link arrow to next node */}
              {idx < nodes.length - 1 && (
                <g>
                  <line x1="70" y1="20" x2="104" y2="20" stroke={isSpecial ? "#06B6D4" : "var(--dsa-border)"} strokeWidth="2" />
                  <polygon points="104,17 110,20 104,23" fill={isSpecial ? "#06B6D4" : "var(--dsa-border)"} />
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// 3. Stack Operations
function StackViz({ step }) {
  let stack = [10, 20];
  let hasOverflow = false;
  let hasUnderflow = false;

  if (step === 1) stack = [10, 20, 30];
  if (step === 2) {
    stack = [10, 20, 30];
    hasOverflow = true;
  }
  if (step === 3) stack = [10, 20];
  if (step === 4) {
    stack = [];
    hasUnderflow = true;
  }

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />
      
      {/* Beaker/Stack boundary */}
      <rect x="200" y="30" width="100" height="150" rx="4" fill="none" stroke="var(--dsa-border)" strokeWidth="4.5" />
      
      {/* Stack blocks */}
      {stack.map((val, idx) => {
        let blockFill = "rgba(236, 72, 153, 0.1)";
        let blockStroke = "#EC4899";

        return (
          <g key={idx} transform={`translate(205, ${142 - idx * 38})`}>
            <rect width="90" height="34" rx="4" fill={blockFill} stroke={blockStroke} strokeWidth="2.5" />
            <text x="45" y="21" textAnchor="middle" fill="var(--dsa-text)" fontWeight="750" fontSize="13">{val}</text>
          </g>
        );
      })}

      {/* Indicators */}
      {stack.length > 0 && !hasOverflow && (
        <g transform={`translate(315, ${158 - (stack.length - 1) * 38})`}>
          <text fill="#EC4899" fontWeight="700" fontSize="13">← TOP</text>
        </g>
      )}

      {hasOverflow && (
        <g transform="translate(315, 60)">
          <rect width="130" height="36" rx="8" fill="rgba(239, 68, 68, 0.1)" stroke="#EF4444" strokeWidth="1.5" />
          <text x="65" y="22" textAnchor="middle" fill="#EF4444" fontWeight="800" fontSize="11">STACK OVERFLOW!</text>
        </g>
      )}

      {hasUnderflow && (
        <g transform="translate(315, 120)">
          <rect width="130" height="36" rx="8" fill="rgba(239, 68, 68, 0.1)" stroke="#EF4444" strokeWidth="1.5" />
          <text x="65" y="22" textAnchor="middle" fill="#EF4444" fontWeight="800" fontSize="11">STACK UNDERFLOW!</text>
        </g>
      )}
    </svg>
  );
}

// 4. Queue Operations
function QueueViz({ step }) {
  let queue = [10, 20];
  let frontIdx = 0;
  let rearIdx = 1;

  if (step === 1) { queue = [10, 20, 30]; rearIdx = 2; }
  if (step === 2) { queue = [10, 20, 30]; frontIdx = 1; rearIdx = 2; }
  if (step === 3) { queue = [10, 20, 30]; frontIdx = 2; rearIdx = 2; }

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />
      
      <g transform="translate(60, 75)">
        {/* Cells */}
        {[0, 1, 2, 3].map((idx) => {
          let value = queue[idx];
          let isFilled = value !== undefined;
          let cellOpacity = isFilled ? 1 : 0.3;
          let isRemoved = isFilled && idx < frontIdx;

          return (
            <g key={idx} transform={`translate(${idx * 90}, 0)`} style={{ opacity: isRemoved ? 0.2 : cellOpacity }}>
              <rect width="80" height="60" rx="8" fill={isFilled ? "rgba(16, 185, 129, 0.1)" : "none"} stroke={isFilled ? "#10B981" : "var(--dsa-border)"} strokeWidth="2.5" />
              {isFilled && <text x="40" y="35" textAnchor="middle" fill="var(--dsa-text)" fontWeight="750" fontSize="14">{value}</text>}
              <text x="40" y="75" textAnchor="middle" fill="var(--dsa-muted)" fontWeight="600" fontSize="11">[{idx}]</text>

              {idx === frontIdx && <text x="40" y="-12" textAnchor="middle" fill="#2563EB" fontWeight="800" fontSize="11">FRONT</text>}
              {idx === rearIdx && <text x="40" y="98" textAnchor="middle" fill="#EC4899" fontWeight="800" fontSize="11">REAR</text>}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// 5. Binary Search Tree Operations
function TreeViz({ step }) {
  // BST representation
  const nodes = [
    { x: 250, y: 50, val: 20 },
    { x: 150, y: 110, val: 10 },
    { x: 350, y: 110, val: 30 }
  ];

  let displayNodes = [...nodes];
  let newNodes = [];
  let path = [];

  if (step === 1) {
    // insert 15
    newNodes.push({ x: 200, y: 170, val: 15, key: '15' });
  } else if (step === 2) {
    // insert 15 and 35
    displayNodes.push({ x: 200, y: 170, val: 15 });
    newNodes.push({ x: 400, y: 170, val: 35, key: '35' });
  } else if (step === 3) {
    // search 15 (root -> left -> right)
    displayNodes.push({ x: 200, y: 170, val: 15 });
    displayNodes.push({ x: 400, y: 170, val: 35 });
    path = [20, 10, 15];
  } else if (step === 4) {
    // search 40 (root -> right -> right -> null)
    displayNodes.push({ x: 200, y: 170, val: 15 });
    displayNodes.push({ x: 400, y: 170, val: 35 });
    path = [20, 30, 35];
  }

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />

      {/* Render links */}
      <g stroke="var(--dsa-border)" strokeWidth="2">
        <line x1="250" y1="50" x2="150" y2="110" />
        <line x1="250" y1="50" x2="350" y2="110" />
        {(step >= 1) && <line x1="150" y1="110" x2="200" y2="170" />}
        {(step >= 2) && <line x1="350" y1="110" x2="400" y2="170" />}
      </g>

      {/* Path highlight links */}
      {path.length > 1 && (
        <g stroke="#10B981" strokeWidth="3">
          {path.map((val, idx) => {
            if (idx === 0) return null;
            const fromNode = displayNodes.find(n => n.val === path[idx - 1]);
            const toNode = displayNodes.concat(newNodes).find(n => n.val === val);
            return fromNode && toNode ? <line key={idx} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} /> : null;
          })}
        </g>
      )}

      {/* Existing Nodes */}
      {displayNodes.map((n, idx) => {
        let isPathNode = path.includes(n.val);
        return (
          <g key={idx} transform={`translate(${n.x}, ${n.y})`}>
            <circle r="18" fill="var(--dsa-card)" stroke={isPathNode ? "#10B981" : "var(--dsa-primary)"} strokeWidth="2.5" />
            <text textAnchor="middle" y="5" fill="var(--dsa-text)" fontWeight="750" fontSize="12">{n.val}</text>
          </g>
        );
      })}

      {/* Animated new inserted nodes */}
      {newNodes.map((n) => (
        <g key={n.key} transform={`translate(${n.x}, ${n.y})`}>
          <circle r="18" fill="rgba(139, 92, 246, 0.1)" stroke="#8B5CF6" strokeWidth="2.5" className="anim-pulse-glow" />
          <text textAnchor="middle" y="5" fill="var(--dsa-text)" fontWeight="750" fontSize="12">{n.val}</text>
        </g>
      ))}
    </svg>
  );
}

// 6. Graph Operations
function GraphViz({ step }) {
  const nodes = [
    { id: 'A', x: 100, y: 110 },
    { id: 'B', x: 200, y: 60 },
    { id: 'C', x: 200, y: 160 },
    { id: 'D', x: 320, y: 60 },
    { id: 'E', x: 320, y: 160 }
  ];

  const edges = [
    { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
    { from: 'B', to: 'D' }, { from: 'C', to: 'E' }
  ];

  let visited = [];
  if (step >= 0) visited.push('A');
  if (step >= 1) visited.push('B');
  if (step >= 2) visited.push('D');
  if (step >= 3) visited.push('C');
  if (step >= 4) visited.push('E');

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />

      {/* Render Edges */}
      <g stroke="var(--dsa-border)" strokeWidth="2">
        {edges.map((e, idx) => {
          const fromNode = nodes.find(n => n.id === e.from);
          const toNode = nodes.find(n => n.id === e.to);
          let isHighlighted = visited.includes(e.from) && visited.includes(e.to);
          return (
            <line
              key={idx}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={isHighlighted ? "#F59E0B" : "var(--dsa-border)"}
              strokeWidth={isHighlighted ? 3 : 2}
            />
          );
        })}
      </g>

      {/* Render Nodes */}
      {nodes.map((n, idx) => {
        let isVisited = visited.includes(n.id);
        let fill = isVisited ? "rgba(245, 158, 11, 0.15)" : "var(--dsa-card)";
        let stroke = isVisited ? "#F59E0B" : "var(--dsa-border)";

        return (
          <g key={idx} transform={`translate(${n.x}, ${n.y})`}>
            <circle r="18" fill={fill} stroke={stroke} strokeWidth="2.5" />
            <text textAnchor="middle" y="5" fill="var(--dsa-text)" fontWeight="750" fontSize="13">{n.id}</text>
          </g>
        );
      })}
    </svg>
  );
}

// 7. Heap operations
function HeapViz({ step }) {
  // Max Heap representations
  let nodes = [
    { x: 250, y: 50, val: 40 },
    { x: 150, y: 110, val: 30 },
    { x: 350, y: 110, val: 20 }
  ];

  let displayNodes = [...nodes];
  let specialNode = null;

  if (step === 1) {
    // insert 50
    specialNode = { x: 100, y: 170, val: 50 };
  } else if (step === 2) {
    // Swapped 50 and 30
    displayNodes = [
      { x: 250, y: 50, val: 40 },
      { x: 150, y: 110, val: 50 },
      { x: 350, y: 110, val: 20 },
      { x: 100, y: 170, val: 30 }
    ];
    specialNode = displayNodes[1];
  } else if (step === 3) {
    // Swapped 50 and 40
    displayNodes = [
      { x: 250, y: 50, val: 50 },
      { x: 150, y: 110, val: 40 },
      { x: 350, y: 110, val: 20 },
      { x: 100, y: 170, val: 30 }
    ];
    specialNode = displayNodes[0];
  }

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />

      {/* Render Links */}
      <g stroke="var(--dsa-border)" strokeWidth="2">
        <line x1="250" y1="50" x2="150" y2="110" />
        <line x1="250" y1="50" x2="350" y2="110" />
        {(step >= 1) && <line x1="150" y1="110" x2="100" y2="170" />}
      </g>

      {/* Display nodes */}
      {displayNodes.map((n, idx) => {
        let isSpecial = specialNode && specialNode.val === n.val;
        return (
          <g key={idx} transform={`translate(${n.x}, ${n.y})`}>
            <circle r="18" fill="var(--dsa-card)" stroke={isSpecial ? "#0EA5E9" : "var(--dsa-primary)"} strokeWidth="2.5" />
            <text textAnchor="middle" y="5" fill="var(--dsa-text)" fontWeight="750" fontSize="12">{n.val}</text>
          </g>
        );
      })}

      {/* Render newly inserted node */}
      {step === 1 && specialNode && (
        <g transform={`translate(${specialNode.x}, ${specialNode.y})`}>
          <circle r="18" fill="rgba(14, 165, 233, 0.1)" stroke="#0EA5E9" strokeWidth="2.5" className="anim-pulse-glow" />
          <text textAnchor="middle" y="5" fill="var(--dsa-text)" fontWeight="750" fontSize="12">{specialNode.val}</text>
        </g>
      )}
    </svg>
  );
}

// 8. Hash Table operations
function HashViz({ step }) {
  const buckets = [
    { idx: 0, items: [] },
    { idx: 1, items: [] },
    { idx: 2, items: [] },
    { idx: 3, items: [] }
  ];

  if (step >= 0) buckets[1].items.push(5);
  if (step >= 1) buckets[0].items.push(8);
  if (step >= 2) buckets[1].items.push(9); // Collision at index 1

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />
      
      {/* Buckets */}
      <g transform="translate(80, 25)">
        {buckets.map((b, idx) => (
          <g key={idx} transform={`translate(0, ${idx * 40})`}>
            {/* Index label */}
            <rect width="45" height="30" rx="6" fill="rgba(16, 185, 129, 0.1)" stroke="#10B981" strokeWidth="1.5" />
            <text x="225" dx="-202" y="20" textAnchor="middle" fill="var(--dsa-text)" fontWeight="700" fontSize="11">[{b.idx}]</text>
            
            {/* Arrow link if has items */}
            {b.items.length > 0 && (
              <g>
                <line x1="45" y1="15" x2="78" y2="15" stroke="var(--dsa-border)" strokeWidth="2" />
                <polygon points="78,12 84,15 78,18" fill="var(--dsa-border)" />
              </g>
            )}

            {/* Chained Linked list boxes */}
            {b.items.map((val, listIdx) => {
              let isSpecial = step === 2 && val === 9;
              let fill = isSpecial ? "rgba(16, 185, 129, 0.2)" : "var(--dsa-card)";
              let stroke = isSpecial ? "#10B981" : "var(--dsa-border)";
              let pulseClass = isSpecial ? "anim-pulse-glow" : "";

              return (
                <g key={listIdx} transform={`translate(${84 + listIdx * 90}, 0)`}>
                  <rect className={pulseClass} width="55" height="30" rx="6" fill={fill} stroke={stroke} strokeWidth="2" />
                  <text x="27.5" y="19" textAnchor="middle" fill="var(--dsa-text)" fontWeight="700" fontSize="12">{val}</text>
                  
                  {listIdx < b.items.length - 1 && (
                    <g>
                      <line x1="55" y1="15" x2="84" y2="15" stroke="var(--dsa-border)" strokeWidth="2" />
                      <polygon points="84,12 90,15 84,18" fill="var(--dsa-border)" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </g>
    </svg>
  );
}

// 9. Searching operations (Binary Search visual)
function SearchingViz({ step }) {
  const elements = [5, 10, 15, 20, 25, 30, 35];
  let low = 0;
  let high = 6;
  let mid = 3;

  if (step === 1) { low = 4; high = 6; mid = 5; }
  if (step >= 2) { low = 4; high = 4; mid = 4; }

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />
      
      <g transform="translate(30, 80)">
        {elements.map((val, idx) => {
          let inRange = idx >= low && idx <= high;
          let isMid = idx === mid;
          let isFound = step >= 2 && idx === 4;
          let fill = isFound ? "rgba(16, 185, 129, 0.2)" : (isMid ? "rgba(245, 158, 11, 0.15)" : "var(--dsa-card)");
          let stroke = isFound ? "#10B981" : (isMid ? "#F59E0B" : "var(--dsa-border)");
          let opacity = inRange ? 1 : 0.3;

          return (
            <g key={idx} transform={`translate(${idx * 64}, 0)`} style={{ opacity, transition: 'opacity 0.3s ease' }}>
              <rect width="52" height="45" rx="6" fill={fill} stroke={stroke} strokeWidth="2.5" />
              <text x="26" y="27" textAnchor="middle" fill="var(--dsa-text)" fontWeight="750" fontSize="13">{val}</text>
              <text x="26" y="-8" textAnchor="middle" fill="var(--dsa-muted)" fontWeight="600" fontSize="10">[{idx}]</text>

              {idx === low && <text x="26" y="62" textAnchor="middle" fill="#3B82F6" fontWeight="800" fontSize="9">LOW</text>}
              {idx === high && <text x="26" y="74" textAnchor="middle" fill="#EC4899" fontWeight="800" fontSize="9">HIGH</text>}
              {isMid && <text x="26" y="-22" textAnchor="middle" fill="#F59E0B" fontWeight="800" fontSize="9">MID</text>}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// 10. Sorting Operations (Bubble Sort swap)
function SortingViz({ step }) {
  let bars = [30, 10, 40, 20];
  let comp1 = -1;
  let comp2 = -1;

  if (step === 1) {
    bars = [10, 30, 40, 20]; // Swapped 30 and 10
    comp1 = 0; comp2 = 1;
  } else if (step === 2) {
    bars = [10, 30, 40, 20];
    comp1 = 1; comp2 = 2; // Comparing 30 and 40
  } else if (step === 3) {
    bars = [10, 30, 20, 40]; // Swapped 40 and 20
    comp1 = 2; comp2 = 3;
  }

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />
      
      <g transform="translate(80, 170)">
        {bars.map((val, idx) => {
          let height = val * 3;
          let isComparing = idx === comp1 || idx === comp2;
          let fill = isComparing ? "rgba(99, 102, 241, 0.2)" : "rgba(37, 99, 235, 0.08)";
          let stroke = isComparing ? "#6366F1" : "var(--dsa-primary)";
          let pulseClass = isComparing ? "anim-pulse-glow" : "";

          return (
            <g key={idx} transform={`translate(${idx * 90}, 0)`}>
              <rect className={pulseClass} x="0" y={-height} width="60" height={height} rx="6" fill={fill} stroke={stroke} strokeWidth="2.5" />
              <text x="30" y="-12" textAnchor="middle" fill="var(--dsa-text)" fontWeight="750" fontSize="13">{val}</text>
              <text x="30" y="20" textAnchor="middle" fill="var(--dsa-muted)" fontWeight="600" fontSize="11">[{idx}]</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// 11. Recursion operations
function RecursionViz({ step }) {
  let frames = [];
  if (step >= 0) frames.push('fact(3)');
  if (step >= 1) frames.push('fact(2)');
  if (step >= 2) frames.push('fact(1) -> 1');
  if (step >= 3) {
    frames = ['fact(3)', 'fact(2) -> 2'];
  }
  if (step >= 4) {
    frames = ['fact(3) -> 6'];
  }

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />
      
      {/* Recursion stack panel */}
      <g transform="translate(140, 40)">
        {frames.map((frame, idx) => {
          let isTop = idx === frames.length - 1;
          let fill = isTop ? "rgba(236, 72, 153, 0.15)" : "var(--dsa-card)";
          let stroke = isTop ? "#EC4899" : "var(--dsa-border)";

          return (
            <g key={idx} transform={`translate(0, ${110 - idx * 36})`}>
              <rect width="220" height="30" rx="6" fill={fill} stroke={stroke} strokeWidth="2" />
              <text x="110" y="19" textAnchor="middle" fill="var(--dsa-text)" fontWeight="750" fontSize="11" fontFamily="Fira Code, monospace">{frame}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// 12. Dynamic Programming operations
function DPViz({ step }) {
  const dpTable = [0, 1, null, null, null];
  if (step >= 1) dpTable[2] = 1;
  if (step >= 2) dpTable[3] = 2;
  if (step >= 3) dpTable[4] = 3;

  return (
    <svg viewBox="0 0 500 220" className="dsa-viz-svg">
      <rect x="10" y="10" width="480" height="200" rx="12" fill="var(--dsa-card)" stroke="var(--dsa-border)" strokeWidth="1" />
      
      <g transform="translate(50, 70)">
        {dpTable.map((val, idx) => {
          let isPrecomputed = idx < 2;
          let isLatestFilled = (step === 1 && idx === 2) || (step === 2 && idx === 3) || (step === 3 && idx === 4);
          let fill = isLatestFilled ? "rgba(16, 185, 129, 0.2)" : (isPrecomputed ? "rgba(37, 99, 235, 0.08)" : "var(--dsa-card)");
          let stroke = isLatestFilled ? "#10B981" : "var(--dsa-border)";
          let text = val !== null ? val : '?';

          return (
            <g key={idx} transform={`translate(${idx * 80}, 0)`}>
              <rect width="70" height="60" rx="8" fill={fill} stroke={stroke} strokeWidth="2.5" />
              <text x="35" y="36" textAnchor="middle" fill={val !== null ? "var(--dsa-text)" : "var(--dsa-muted)"} fontWeight="800" fontSize="15">{text}</text>
              <text x="35" y="76" textAnchor="middle" fill="var(--dsa-muted)" fontWeight="600" fontSize="11">dp[{idx}]</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// Visualizer dispatcher
function VizComponent({ vizType, step }) {
  switch (vizType) {
    case 'arrayViz':
      return <ArrayViz step={step} />;
    case 'linkedListViz':
      return <LinkedListViz step={step} />;
    case 'stackViz':
      return <StackViz step={step} />;
    case 'queueViz':
      return <QueueViz step={step} />;
    case 'treeViz':
      return <TreeViz step={step} />;
    case 'graphViz':
      return <GraphViz step={step} />;
    case 'heapViz':
      return <HeapViz step={step} />;
    case 'hashViz':
      return <HashViz step={step} />;
    case 'searchingViz':
      return <SearchingViz step={step} />;
    case 'sortingViz':
      return <SortingViz step={step} />;
    case 'recursionViz':
      return <RecursionViz step={step} />;
    case 'dpViz':
      return <DPViz step={step} />;
    default:
      return <div className="text-center p-8 text-gray-400">Visualization not implemented</div>;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN DSA LAB INTERACTIVE COMPONENT
// ═══════════════════════════════════════════════════════════
export default function DSALab() {
  const [level, setLevel] = useState('categories'); // 'categories', 'topics', 'concept'
  
  useEffect(() => {
    const handleBack = (e) => {
      if (e.defaultPrevented) return;
      if (level === 'concept') {
        e.preventDefault();
        setLevel('topics');
      } else if (level === 'topics') {
        e.preventDefault();
        setLevel('categories');
      }
    };
    window.addEventListener('eduverse-back', handleBack);
    return () => window.removeEventListener('eduverse-back', handleBack);
  }, [level]);

  const [category, setCategory] = useState(null);
  const [topic, setTopic] = useState(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [xp, setXp] = useState(() => Number(localStorage.getItem('dsa_xp') || 0));
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem('dsa_completed_topics');
    return saved ? JSON.parse(saved) : [];
  });

  // Stats computation
  const totalXP = xp;
  const streak = 5; // Mocked
  const totalCompleted = completedTopics.length;

  const openCategory = (cat) => {
    setCategory(cat);
    setLevel('topics');
  };

  const openTopic = (t) => {
    setTopic(t);
    setStep(0);
    setPlaying(false);
    setLevel('concept');
  };

  const goHome = () => {
    setLevel('categories');
    setCategory(null);
    setTopic(null);
  };

  const goTopics = () => {
    setLevel('topics');
    setTopic(null);
  };

  // Autoplay ticker
  useEffect(() => {
    let timer = null;
    if (playing && topic) {
      timer = setInterval(() => {
        setStep((currentStep) => {
          if (currentStep < topic.steps - 1) {
            return currentStep + 1;
          } else {
            setPlaying(false);
            // Award XP on module complete
            if (!completedTopics.includes(topic.id)) {
              const newCompleted = [...completedTopics, topic.id];
              setCompletedTopics(newCompleted);
              localStorage.setItem('dsa_completed_topics', JSON.stringify(newCompleted));
              const newXP = xp + (category?.xp || 50);
              setXp(newXP);
              localStorage.setItem('dsa_xp', newXP.toString());
            }
            return currentStep;
          }
        });
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playing, topic, completedTopics, category, xp]);

  const getCategoryProgress = (cat) => {
    if (!cat.topics || cat.topics.length === 0) return 0;
    const completedInCat = cat.topics.filter(t => completedTopics.includes(t.id)).length;
    return Math.round((completedInCat / cat.topics.length) * 100);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const filteredData = DSA_DATA.filter(cat =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dsa-lab p-6">
      
      {/* ─── Breadcrumbs ─── */}
      {level !== 'categories' && (
        <div className="dsa-breadcrumb">
          <button className="dsa-breadcrumb-btn" onClick={goHome}>
            <Home size={14} /> DSA Visual Lab
          </button>
          {level === 'topics' && (
            <>
              <span className="dsa-breadcrumb-sep">›</span>
              <span className="dsa-breadcrumb-current">{category?.title}</span>
            </>
          )}
          {level === 'concept' && (
            <>
              <span className="dsa-breadcrumb-sep">›</span>
              <button className="dsa-breadcrumb-btn" onClick={goTopics}>{category?.title}</button>
              <span className="dsa-breadcrumb-sep">›</span>
              <span className="dsa-breadcrumb-current">{topic?.title}</span>
            </>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* ─── LEVEL 1: DASHBOARD CATEGORIES ─── */}
        {level === 'categories' && (
          <motion.div key="categories" {...pageVariants}>
            
            {/* Top Stats Banner */}
            <div className="dsa-stats-banner">
              <div className="dsa-stat-card">
                <div className="dsa-stat-icon-wrapper" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--dsa-primary)' }}>✨</div>
                <div className="dsa-stat-info">
                  <span className="dsa-stat-value">{totalXP}</span>
                  <span className="dsa-stat-label">Total XP</span>
                </div>
              </div>
              <div className="dsa-stat-card">
                <div className="dsa-stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--dsa-warning)' }}>🔥</div>
                <div className="dsa-stat-info">
                  <span className="dsa-stat-value">{streak} Days</span>
                  <span className="dsa-stat-label">Streak</span>
                </div>
              </div>
              <div className="dsa-stat-card">
                <div className="dsa-stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--dsa-success)' }}>🏆</div>
                <div className="dsa-stat-info">
                  <span className="dsa-stat-value">{totalCompleted}</span>
                  <span className="dsa-stat-label">Modules Completed</span>
                </div>
              </div>
            </div>

            <div className="dsa-header">
              <div className="dsa-title-area">
                <h1>🧩 Data Structures & Algorithms Lab</h1>
                <p>Understand complex memory execution pathways with dynamic interactive visualizations.</p>
              </div>
              <div className="dsa-search-bar">
                <Search size={16} className="dsa-search-icon" />
                <input
                  type="text"
                  placeholder="Search DSA modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="dsa-grid">
              {filteredData.map((cat) => {
                const progress = getCategoryProgress(cat);
                const radius = 16;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (progress / 100) * circumference;

                return (
                  <motion.div
                    key={cat.id}
                    className={`dsa-card-el`}
                    style={{ '--card-color': cat.color, '--card-gradient': cat.gradient }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="dsa-card-top">
                      <div className="dsa-card-icon" style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)`, color: cat.color }}>
                        <cat.Icon size={24} />
                      </div>
                      
                      <div className="dsa-progress-ring-container">
                        <svg width="36" height="36">
                          <circle className="dsa-progress-ring-bg" cx="18" cy="18" r={radius} />
                          <circle
                            className="dsa-progress-ring-circle"
                            cx="18"
                            cy="18"
                            r={radius}
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            style={{ stroke: cat.color }}
                          />
                        </svg>
                        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '8px', fontWeight: 'bold' }}>
                          {progress}%
                        </span>
                      </div>

                      <span className={`dsa-card-badge ${cat.difficulty}`}>{cat.difficulty}</span>
                    </div>

                    <h3 className="dsa-card-title">{cat.title}</h3>
                    <p className="dsa-card-desc">{cat.description}</p>
                    
                    <div className="dsa-card-footer">
                      <div className="dsa-card-meta">
                        <span className="dsa-meta-item">⏱ {cat.duration}</span>
                        <span className="dsa-meta-item">💎 {cat.xp} XP</span>
                      </div>
                      <button
                        className="dsa-card-btn"
                        onClick={() => openCategory(cat)}
                        style={{ background: cat.color }}
                      >
                        <ArrowRight size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── LEVEL 2: TOPICS LIST ─── */}
        {level === 'topics' && category && (
          <motion.div key="topics" {...pageVariants}>
            <div className="dsa-header">
              <div className="dsa-title-area">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <category.Icon size={32} style={{ color: category.color }} />
                  {category.title}
                </h1>
                <p>{category.description}</p>
              </div>
              <button className="dsa-breadcrumb-btn" onClick={goHome} style={{ border: '1px solid var(--dsa-border)', padding: '10px 18px', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
            </div>

            <div className="dsa-grid" style={{ marginTop: '24px' }}>
              {category.topics.map((t, idx) => (
                <div key={t.id} className="dsa-card-el">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Topic {idx + 1}</span>
                  <h3 className="dsa-card-title">{t.title}</h3>
                  <p className="dsa-card-desc">{t.preview}</p>
                  <div className="dsa-card-footer">
                    <button className="dsa-card-btn" onClick={() => openTopic(t)} style={{ background: category.color, borderRadius: '10px', width: 'auto', height: 'auto', padding: '10px 18px', display: 'flex', gap: '8px' }}>
                      <Eye size={14} /> Visualize Lab
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── LEVEL 3: CONCEPT SIMULATOR ─── */}
        {level === 'concept' && topic && (
          <motion.div key="concept" {...pageVariants}>
            <div className="dsa-header">
              <div className="dsa-title-area">
                <h1>{topic.title}</h1>
                <p>Step through execution algorithms and see variable states change.</p>
              </div>
              <button className="dsa-breadcrumb-btn" onClick={goTopics} style={{ border: '1px solid var(--dsa-border)', padding: '10px 18px', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Back to Topics
              </button>
            </div>

            <div className="dsa-lab-panel">
              {/* Visualization Canvas */}
              <div className="dsa-viz-panel">
                <div className="dsa-viz-topbar">
                  <span className="dsa-viz-title">
                    <span className="dsa-live-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    Simulation Canvas
                  </span>
                  <span className="dsa-viz-badge">Step {step + 1} / {topic.steps}</span>
                </div>
                <div className="dsa-viz-canvas">
                  <VizComponent vizType={topic.vizType} step={step} />
                </div>
              </div>

              {/* Code Panel */}
              <div className="dsa-code-panel">
                <div className="dsa-code-topbar">
                  <div className="dsa-code-dots">
                    <span /><span /><span />
                  </div>
                  <span className="dsa-code-filename">algorithm.c</span>
                  <span className="dsa-code-lang">C Language</span>
                </div>
                <pre className="dsa-code-body" style={{ padding: '24px 0', overflowY: 'auto' }}>
                  {topic.code.map((line, idx) => {
                    const isHighlighted = line.steps.includes(step);
                    return (
                      <span
                        key={idx}
                        className={`dsa-code-line ${isHighlighted ? 'highlighted' : ''}`}
                      >
                        {line.text || ' '}
                      </span>
                    );
                  })}
                </pre>
              </div>
            </div>

            {/* Timeline Playback Controls */}
            <div className="dsa-timeline">
              <div className="dsa-timeline-label">⏱ Simulation Timeline</div>
              <div className="dsa-timeline-controls">
                <button className="dsa-tl-btn" title="Reset" onClick={() => { setStep(0); setPlaying(false); }}>
                  <RotateCcw size={15} />
                </button>
                <button className="dsa-tl-btn play-btn" title={playing ? 'Pause' : 'Play'} onClick={() => {
                  if (step >= topic.steps - 1) setStep(0);
                  setPlaying(!playing);
                }}>
                  {playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <div className="dsa-tl-slider-wrap">
                  <input
                    type="range"
                    className="dsa-tl-slider"
                    min={0}
                    max={topic.steps - 1}
                    value={step}
                    style={{ '--progress': `${(step / (topic.steps - 1)) * 100}%` }}
                    onChange={e => { setStep(Number(e.target.value)); setPlaying(false); }}
                  />
                  <div className="dsa-tl-steps">
                    {topic.stepLabels.map((lbl, idx) => (
                      <span
                        key={idx}
                        className={`dsa-tl-step-label ${idx === step ? 'active' : ''}`}
                        onClick={() => { setStep(idx); setPlaying(false); }}
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Explanation Card */}
            {topic.stepDescriptions?.[step] && (
              <motion.div
                key={`desc-${step}`}
                className="dsa-step-info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4>
                  <span className="dsa-step-num-badge">{step + 1}</span>
                  {topic.stepLabels?.[step]}
                </h4>
                <p>{topic.stepDescriptions[step]}</p>
              </motion.div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
