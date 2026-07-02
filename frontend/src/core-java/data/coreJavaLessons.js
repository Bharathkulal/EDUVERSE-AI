export const CORE_JAVA_LESSONS = [
  {
    id: 1,
    slug: 'java-basics',
    title: 'Java Basics & Architecture',
    difficulty: 'Beginner',
    duration: '30 mins',
    xp: 150,
    accent: '#3B82F6',
    icon: '☕',
    description: 'Understand the JVM, JDK, JRE, compilation workflow, and your first Java program structure.',
    topics: ['Java Virtual Machine', 'Compilation Steps', 'Class Structure', 'Main Method'],
    realWorldExamples: [
      { area: 'Enterprise Apps', desc: 'Android OS uses a JVM-like environment (ART) to run Java/Kotlin compiled bytecode across thousands of different mobile phone chips.' },
      { area: 'Web Apps', desc: 'Bank transactional systems compile Java code once and run it on secure Unix servers or Windows clouds without code modifications.' }
    ],
    script: [
      { type: 'intro', text: "Welcome to Java Basics! Java is a high-level, class-based, object-oriented language built on the principle of Write Once, Run Anywhere." },
      { type: 'concept', text: "When you write Java code, it is saved in a .java file. The javac compiler translates this code into bytecode stored in a .class file." },
      { type: 'concept', text: "The Java Virtual Machine, or JVM, reads this bytecode and translates it into native machine instructions for your computer." },
      { type: 'code', text: "Look at the class structure. A basic program requires a class definition, inside which resides the main method: public static void main." }
    ],
    codeBreakdown: {
      code: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World\");\n  }\n}",
      tokens: [
        { word: "public", type: "Keyword", meaning: "Access modifier making this class visible to any other class in the application." },
        { word: "class", type: "Keyword", meaning: "Declares a new blueprint class definition." },
        { word: "Main", type: "Identifier", meaning: "The name of the class, matching the filename Main.java." },
        { word: "static", type: "Keyword", meaning: "Enables execution without requiring instantiation of an object first." },
        { word: "void", type: "Keyword", meaning: "Indicates that the main method does not return any value after completion." }
      ]
    },
    memorySteps: [
      { step: 1, title: 'JVM Loading Class', stack: ['[JVM Loader]'], heap: [], desc: 'JVM locates Main.class and loads it into the Method Area.' },
      { step: 2, title: 'Main Stack Frame Created', stack: ['main() Frame', '[JVM Loader]'], heap: [], desc: 'A stack frame is pushed onto the thread call stack for the main method execution.' },
      { step: 3, title: 'Output execution', stack: ['main() Frame', '[JVM Loader]'], heap: [], desc: 'System.out stream outputs "Hello World" directly to the console terminal.' }
    ],
    commonMistakes: [
      { wrong: "class main { }", correct: "class Main { }", explanation: "Java is strictly case-sensitive. Class names must match filenames, usually starting with an uppercase letter." },
      { wrong: "void main(String[] args)", correct: "public static void main(String[] args)", explanation: "JVM cannot locate or invoke the main method if it lacks 'public' or 'static' modifiers." }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which component translates Java source code into bytecode?', options: ['JVM', 'JRE', 'Compiler (javac)', 'OS Linker'], correct: 'Compiler (javac)', explanation: 'javac compiles your .java files into .class files (bytecode).' },
        { id: 'q2', question: 'What does "Write Once, Run Anywhere" refer to?', options: ['Platform independence via JVM', 'Single thread locks', 'Code formatting rules', 'Automatic garbage collection'], correct: 'Platform independence via JVM', explanation: 'Any system with a compatible JVM can execute bytecode class files.' }
      ]
    },
    flashcards: [
      { q: "What is JRE?", a: "Java Runtime Environment containing JVM and platform libraries to execute applications." },
      { q: "What is JDK?", a: "Java Development Kit containing JRE, compilers, debuggers, and tools needed to write Java programs." }
    ],
    revision: {
      short: "Java is compiled to bytecode by javac, then interpreted by the JVM. Execution starts at public static void main(String[] args).",
      long: "Java is a strongly typed, class-based, object-oriented language. The compilation workflow translates source code into architecture-neutral bytecode. The JVM executes this bytecode on host operating systems, using garbage collection to manage memory automatically."
    }
  },
  {
    id: 2,
    slug: 'variables-datatypes',
    title: 'Variables & Data Types',
    difficulty: 'Beginner',
    duration: '35 mins',
    xp: 180,
    accent: '#10B981',
    icon: '📦',
    description: 'Declare variables, master primitives (int, double, char) versus reference types (Objects, Strings).',
    topics: ['Primitive Data Types', 'Reference Types', 'Variable Declaration', 'Memory Allocations'],
    realWorldExamples: [
      { area: 'Financial Data', desc: 'Bank accounts store interest rates using `double` and balances using `long` to maintain precision.' },
      { area: 'Gaming Systems', desc: 'Game states store player score as an `int` and character status as a `boolean` (alive/dead).' }
    ],
    script: [
      { type: 'intro', text: "Let's explore variables! In Java, a variable is a named memory location that stores data during execution." },
      { type: 'concept', text: "Java has 8 primitive data types: byte, short, int, long, float, double, boolean, and char. Primitives store values directly in Stack memory." },
      { type: 'concept', text: "Reference types, like Strings and user-defined objects, store reference addresses pointing to actual objects residing in Heap memory." }
    ],
    codeBreakdown: {
      code: "int score = 100;\nString player = \"Hero\";",
      tokens: [
        { word: "int", type: "Type", meaning: "Primitive type representing a 32-bit signed integer value." },
        { word: "score", type: "Variable", meaning: "Variable name identifiers holding the integer value." },
        { word: "100", type: "Literal", meaning: "Constant integer literal value stored in stack memory." },
        { word: "String", type: "Type", meaning: "Reference type class representing character sequences." }
      ]
    },
    memorySteps: [
      { step: 1, title: 'Declare Primitive score', stack: ['score = 100'], heap: [], desc: 'Int value 100 is allocated directly in stack memory.' },
      { step: 2, title: 'Declare String Reference', stack: ['player = @0xFF', 'score = 100'], heap: ['@0xFF: "Hero"'], desc: 'Heap creates the string object "Hero". Stack stores its pointer address (@0xFF).' }
    ],
    commonMistakes: [
      { wrong: "int value = \"99\";", correct: "int value = 99; / String value = \"99\";", explanation: "Java is statically and strongly typed. You cannot assign a String literal to an integer variable without parsing." }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Where are primitive variables stored in Java?', options: ['Heap Memory', 'Stack Memory', 'Method Area', 'Disk Cache'], correct: 'Stack Memory', explanation: 'Local variables and primitive values are stored directly inside the execution stack.' }
      ]
    },
    flashcards: [
      { q: "Name the 8 primitive types.", a: "byte, short, int, long, float, double, boolean, char" }
    ],
    revision: {
      short: "Primitives store values in stack memory. Reference types store memory addresses pointing to objects on the heap.",
      long: "All variables must be declared with a data type. Primitives (e.g., int, double) are lightweight and stored directly in stack frames. Reference types (e.g., String, user classes) are heavier, dynamically allocated on the heap, and referenced via pointers on the stack."
    }
  },
  {
    id: 3,
    slug: 'operators-operations',
    title: 'Java Operations & Operators',
    difficulty: 'Beginner',
    duration: '30 mins',
    xp: 160,
    accent: '#F59E0B',
    icon: '⚡',
    description: 'Learn arithmetic, logical, relational, bitwise, assignment, and ternary operators.',
    topics: ['Arithmetic Operations', 'Relational Checks', 'Logical Conditions', 'Ternary Operator'],
    realWorldExamples: [
      { area: 'E-Commerce Checkouts', desc: 'Calculating total order pricing uses arithmetic operations, while checking discount eligibility uses logical AND operators.' }
    ],
    script: [
      { type: 'intro', text: "Operations form the core logic. Operators let us perform mathematical, relational, and logical computations." },
      { type: 'concept', text: "Arithmetic operators (+, -, *, /, %) perform standard math. Relational operators (>, <, ==) check conditions, returning booleans." },
      { type: 'concept', text: "Ternary operator is a shorthand conditional: condition ? valueIfTrue : valueIfFalse." }
    ],
    codeBreakdown: {
      code: "boolean isAdult = age >= 18;\nint tax = isAdult ? 20 : 0;",
      tokens: [
        { word: "boolean", type: "Type", meaning: "Data type storing true or false values." },
        { word: "isAdult", type: "Variable", meaning: "Boolean variable indicating if age condition is satisfied." },
        { word: "age >= 18", type: "Condition", meaning: "Relational check comparing value of age against 18." },
        { word: "?", type: "Operator", meaning: "Ternary operator symbol checking the boolean condition." }
      ]
    },
    memorySteps: [
      { step: 1, title: 'Execute age check', stack: ['age = 20', 'isAdult = true'], heap: [], desc: 'Relational logic evaluates 20 >= 18 to true, updating stack.' },
      { step: 2, title: 'Evaluate tax ternary', stack: ['age = 20', 'isAdult = true', 'tax = 20'], heap: [], desc: 'Ternary evaluates true branch, assigning 20 to tax.' }
    ],
    commonMistakes: [
      { wrong: "if (a = b) { }", correct: "if (a == b) { }", explanation: "Single equals (=) is the assignment operator. Use double equals (==) to perform equality checks." }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is the result of 17 % 5 in Java?', options: ['3', '2', '1', '0'], correct: '2', explanation: 'The modulo operator % returns the remainder of integer division: 17 = 5 * 3 + 2.' }
      ]
    },
    flashcards: [
      { q: "What does the ternary operator do?", a: "Provides a single-line conditional assignment: condition ? true_val : false_val." }
    ],
    revision: {
      short: "Java supports arithmetic, comparison, logical, and ternary operators for math and logical evaluation.",
      long: "Operators are structural tokens that instruct JVM to execute specific mathematical or logical evaluations. Relational and logical operators combine variables to control execution flows."
    }
  },
  {
    id: 4,
    slug: 'oop-concepts',
    title: 'Object-Oriented Programming (OOP)',
    difficulty: 'Intermediate',
    duration: '70 mins',
    xp: 300,
    accent: '#8B5CF6',
    icon: '🧩',
    description: 'Learn Classes, Objects, Inheritance, Polymorphism, Encapsulation, and Abstraction.',
    topics: ['Classes & Objects', 'Encapsulation & Private fields', 'Inheritance (extends)', 'Polymorphism (overriding)'],
    realWorldExamples: [
      { area: 'Online Banking', desc: 'BankAccount class encapsulates client balances, protecting fields behind verifyPin() methods.' },
      { area: 'Game Entities', desc: 'An abstract Superclass Player inherited by Knight and Mage classes overriding attack() methods.' }
    ],
    script: [
      { type: 'intro', text: "Welcome to OOP! Object-Oriented Programming models software as real-world objects containing state and behavior." },
      { type: 'concept', text: "A Class is a blueprint. An Object is an instance created using the 'new' keyword, allocated in Heap memory." },
      { type: 'concept', text: "Encapsulation keeps fields private, exposing getter/setter methods. Inheritance allows code reuse. Polymorphism overrides behaviors." }
    ],
    codeBreakdown: {
      code: "class Dog extends Animal {\n  @Override\n  void speak() {\n    System.out.println(\"Woof\");\n  }\n}",
      tokens: [
        { word: "extends", type: "Keyword", meaning: "Creates subclass inheritance from parent Animal class." },
        { word: "@Override", type: "Annotation", meaning: "Informs compiler this method replaces a superclass method." },
        { word: "void", type: "Keyword", meaning: "Method has no return values." }
      ]
    },
    memorySteps: [
      { step: 1, title: 'Instantiating new Dog', stack: ['dogRef = @0xAA'], heap: ['@0xAA: Dog object { name: null }'], desc: 'Heap allocates a new Dog object. Stack reference variable dogRef points to its heap address (@0xAA).' },
      { step: 2, title: 'Initializing fields', stack: ['dogRef = @0xAA'], heap: ['@0xAA: Dog object { name: "Buddy" }'], desc: 'Constructor initializes properties inside heap memory block.' }
    ],
    commonMistakes: [
      { wrong: "Dog d; d.bark();", correct: "Dog d = new Dog(); d.bark();", explanation: "Declaring reference variable d is not enough. You must initialize it using 'new' or else calling methods throws a NullPointerException." }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which keyword implements inheritance in Java classes?', options: ['implements', 'extends', 'inherits', 'super'], correct: 'extends', explanation: 'The extends keyword creates a subclass inheriting methods/fields from a single parent class.' }
      ]
    },
    flashcards: [
      { q: "What is Polymorphism?", a: "The ability of an object to take on many forms, such as calling overridden subclass methods via a superclass reference." }
    ],
    revision: {
      short: "OOP structures programs into classes and objects. Its four pillars are Inheritance, Polymorphism, Encapsulation, and Abstraction.",
      long: "Classes are templates outlining static states and dynamic behaviors. When instantiated, instance data sits in the heap, managed by reference pointers in the active stack frame. Encapsulation restricts state access to getters/setters, protecting business rules."
    }
  },
  {
    id: 5,
    slug: 'collections-framework',
    title: 'Java Collections Framework',
    difficulty: 'Intermediate',
    duration: '50 mins',
    xp: 250,
    accent: '#EC4899',
    icon: '📚',
    description: 'Master dynamic data collections: ArrayList, LinkedList, HashMap, and HashSet.',
    topics: ['Dynamic Lists', 'Uniqueness Sets', 'Key-Value Mapping', 'Iterator Loops'],
    realWorldExamples: [
      { area: 'Shopping Carts', desc: 'An ArrayList stores ordered items added by a user, letting them increase quantities dynamically.' },
      { area: 'User Profiles', desc: 'A HashMap records username keys mapped to Profile metadata objects for O(1) query lookups.' }
    ],
    script: [
      { type: 'intro', text: "Let's explore Collections! Traditional arrays have fixed sizes, but the Collections Framework provides dynamic datastructures." },
      { type: 'concept', text: "ArrayList manages elements dynamically using internal arrays. LinkedList uses node pointers." },
      { type: 'concept', text: "HashSet prevents duplicates. HashMap maps unique keys to values for efficient lookups." }
    ],
    codeBreakdown: {
      code: "List<String> list = new ArrayList<>();\nlist.add(\"Java\");",
      tokens: [
        { word: "List", type: "Interface", meaning: "Standard interface representing ordered collections." },
        { word: "ArrayList", type: "Class", meaning: "Class implementation of List using resizing arrays." },
        { word: "add", type: "Method", meaning: "Inserts a new element at the end of the dynamic list." }
      ]
    },
    memorySteps: [
      { step: 1, title: 'Create list reference', stack: ['list = @0xBC'], heap: ['@0xBC: ArrayList { size: 0, elementData: [] }'], desc: 'Stack references list object on heap.' },
      { step: 2, title: 'Insert element "Java"', stack: ['list = @0xBC'], heap: ['@0xBC: ArrayList { size: 1, elementData: ["Java"] }'], desc: 'Value is stored inside heap array. Size updates.' }
    ],
    commonMistakes: [
      { wrong: "ArrayList<int> list;", correct: "ArrayList<Integer> list;", explanation: "Collections do not support primitive types directly. You must use wrapper classes like Integer, Double, or Character." }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which collection guarantees uniqueness of elements?', options: ['ArrayList', 'LinkedList', 'HashSet', 'Vector'], correct: 'HashSet', explanation: 'HashSet implements Set interface which prevents duplicate items by utilizing hashing functions.' }
      ]
    },
    flashcards: [
      { q: "What is HashMap?", a: "A collection mapping key objects to value objects, allowing rapid O(1) average lookup times." }
    ],
    revision: {
      short: "Collections manage resizing groups of objects. Choose ArrayList for indexing, HashSet for uniqueness, and HashMap for mappings.",
      long: "Collections are generic frameworks that hold dynamic references on the heap. Standard collections (List, Set, Map) decouple database/memory storage patterns, simplifying object array management."
    }
  }
];
