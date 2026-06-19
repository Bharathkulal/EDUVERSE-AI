import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Layers, Database, Filter, FolderOpen, Zap,
  ChevronRight, Play, Pause, RotateCcw, Eye, Terminal,
  ArrowLeft, BookOpen, Monitor, Home
} from 'lucide-react';
import './CSharpLab.css';

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════
const CSHARP_DATA = [
  {
    id: 'basics', title: 'Basics of C#', Icon: Code,
    color: '#2563EB', gradient: 'linear-gradient(135deg,#2563EB,#06B6D4)',
    description: 'Variables, types, control flow, and methods',
    topics: [
      {
        id: 'variables', title: 'Variables & Data Types', vizType: 'variables', steps: 5,
        preview: 'Declare int, string, bool, double and understand value vs reference types.',
        code: `// C# Data Types\nint age = 25;\nstring name = "Alice";\nbool isStudent = true;\ndouble gpa = 3.85;\n\n// Type inference with var\nvar score = 95;    // inferred: int\nvar city  = "NYC"; // inferred: string\n\n// Constants\nconst double PI = 3.14159;\n\n// String interpolation\nConsole.WriteLine(\n  $"Name: {name}, Age: {age}, GPA: {gpa}");\n// Output: Name: Alice, Age: 25, GPA: 3.85`,
        stepLabels: ['Declare int', 'Add string', 'Add bool', 'Add double', 'Interpolate'],
        stepDescriptions: [
          'We start with an integer. int age = 25 stores a whole number — 4 bytes, range -2B to +2B.',
          'string name = "Alice" stores text. Strings are reference types stored on the heap.',
          'bool isStudent = true stores a true/false value. Only 1 bit of data needed.',
          'double gpa = 3.85 stores a floating-point number with ~15 digits of precision.',
          'String interpolation $"{name}" inlines variables directly into strings at runtime.',
        ],
      },
      {
        id: 'control-flow', title: 'Control Flow', vizType: 'controlflow', steps: 4,
        preview: 'if/else, switch expressions, for, while, and foreach loops.',
        code: `// If / Else\nint score = 87;\nif (score >= 90)      Console.WriteLine("A");\nelse if (score >= 80) Console.WriteLine("B");\nelse                  Console.WriteLine("C");\n\n// Switch expression (C# 8+)\nstring grade = score switch {\n  >= 90 => "A", >= 80 => "B",\n  >= 70 => "C", _   => "F"\n};\n\n// For loop\nfor (int i = 0; i < 5; i++)\n  Console.WriteLine($"Step {i}");\n\n// Foreach loop\nint[] nums = { 1, 2, 3, 4, 5 };\nforeach (int n in nums)\n  Console.Write(n + " ");`,
        stepLabels: ['if/else', 'switch', 'for loop', 'foreach'],
        stepDescriptions: [
          'if/else checks conditions top-down. The first true branch executes; others are skipped.',
          'Switch expressions (C# 8+) are cleaner than switch statements — they return a value.',
          'The for loop runs while a condition holds. i++ increments the counter each iteration.',
          'foreach iterates every element in a collection without manual index management.',
        ],
      },
      {
        id: 'methods', title: 'Methods & Parameters', vizType: 'methods', steps: 4,
        preview: 'Define reusable methods with parameters, return types, and overloading.',
        code: `// Basic method\nstatic int Add(int a, int b) => a + b;\n\n// Method overloading\nstatic double Add(double a, double b)\n  => a + b;\n\n// Optional parameters\nstatic string Greet(\n  string name,\n  string greeting = "Hello")\n  => $"{greeting}, {name}!";\n\n// Params array\nstatic int Sum(params int[] nums)\n  => nums.Sum();\n\n// Usage\nConsole.WriteLine(Add(3, 4));        // 7\nConsole.WriteLine(Add(1.5, 2.5));    // 4.0\nConsole.WriteLine(Greet("Bob"));     // Hello, Bob!\nConsole.WriteLine(Sum(1,2,3,4,5));   // 15`,
        stepLabels: ['Define', 'Overload', 'Defaults', 'Call'],
        stepDescriptions: [
          'A method packages reusable logic. Expression-body (=>) is shorthand for single-line return.',
          'Overloading lets you reuse the same method name with different parameter types.',
          'Optional parameters have default values — callers can omit them for convenience.',
          'Calling a method executes its body and returns the result to the call site.',
        ],
      },
    ],
  },
  {
    id: 'oop', title: 'OOP in C#', Icon: Layers,
    color: '#7C3AED', gradient: 'linear-gradient(135deg,#7C3AED,#EC4899)',
    description: 'Classes, objects, inheritance, polymorphism & abstraction',
    topics: [
      {
        id: 'class-object', title: 'Class & Object', vizType: 'classObject', steps: 4,
        preview: 'Classes are blueprints; objects are living instances created in memory.',
        code: `// Class = Blueprint\npublic class Student {\n  // Properties\n  public string Name { get; set; }\n  public int    Age  { get; set; }\n  public double GPA  { get; set; }\n\n  // Constructor\n  public Student(string name, int age) {\n    Name = name;\n    Age  = age;\n    GPA  = 0.0;\n  }\n\n  // Method\n  public string Introduce() =>\n    $"Hi! I'm {Name}, age {Age}";\n}\n\n// Object = Instance\nvar s1 = new Student("Alice", 20);\nvar s2 = new Student("Bob",   22);\ns1.GPA = 3.9;\nConsole.WriteLine(s1.Introduce());\n// Hi! I'm Alice, age 20`,
        stepLabels: ['Class', 'Properties', 'Constructor', 'Instantiate'],
        stepDescriptions: [
          'A class defines the structure and behavior — like an architectural blueprint.',
          'Properties (Name, Age, GPA) store per-object data. { get; set; } is auto-implemented.',
          'The constructor runs when you use `new`, initializing the object\'s state.',
          '`new Student("Alice", 20)` creates an object on the heap; s1 holds a reference to it.',
        ],
      },
      {
        id: 'inheritance', title: 'Inheritance', vizType: 'inheritance', steps: 5,
        preview: 'Extend base classes and reuse code through the inheritance hierarchy.',
        code: `// Base Class\npublic class Animal {\n  public string Name  { get; set; }\n  public int    Age   { get; set; }\n  public virtual string Sound() => "...";\n  public void Breathe() =>\n    Console.WriteLine($"{Name} breathes");\n}\n\n// Derived: Dog\npublic class Dog : Animal {\n  public override string Sound() => "Woof!";\n  public void Fetch() =>\n    Console.WriteLine($"{Name} fetches!");\n}\n\n// Derived: Cat\npublic class Cat : Animal {\n  public override string Sound() => "Meow!";\n}\n\n// Polymorphic usage\nAnimal[] animals = { new Dog{Name="Rex"},\n                     new Cat{Name="Luna"} };\nforeach (var a in animals)\n  Console.WriteLine($"{a.Name}: {a.Sound()}");`,
        stepLabels: ['Base', 'virtual', 'Dog', 'Cat', 'Poly'],
        stepDescriptions: [
          'Animal is the base class — it defines shared data (Name, Age) and common behavior (Breathe).',
          '`virtual` marks Sound() as overridable. Without it, derived classes can\'t change behavior.',
          'Dog : Animal means Dog inherits from Animal. `override` replaces Sound() with "Woof!".',
          'Cat also inherits Animal, providing its own Sound(). Both reuse Breathe() for free.',
          'Treating Dog and Cat as Animal[] lets us call Sound() polymorphically — correct type, right behavior.',
        ],
      },
      {
        id: 'encapsulation', title: 'Encapsulation', vizType: 'encapsulation', steps: 4,
        preview: 'Hide internal state and expose controlled, safe public APIs.',
        code: `public class BankAccount {\n  // Private: hidden from outside\n  private double _balance;\n  private List<string> _history;\n\n  public BankAccount(double initial) {\n    _balance = initial;\n    _history = new List<string>();\n  }\n\n  // Public read-only property\n  public double Balance => _balance;\n\n  // Controlled deposit\n  public bool Deposit(double amount) {\n    if (amount <= 0) return false;\n    _balance += amount;\n    _history.Add($"+{amount:C}");\n    return true;\n  }\n\n  // Controlled withdrawal\n  public bool Withdraw(double amount) {\n    if (amount > _balance) return false;\n    _balance -= amount;\n    _history.Add($"-{amount:C}");\n    return true;\n  }\n}`,
        stepLabels: ['Private', 'Property', 'Deposit', 'Withdraw'],
        stepDescriptions: [
          '_balance is private — nothing outside can touch it directly, preventing invalid states.',
          'Balance is a public read-only property. External code can read but never write directly.',
          'Deposit validates the amount before adding it — only legal operations are allowed.',
          'Withdraw checks if funds are available before proceeding. The class protects its invariants.',
        ],
      },
      {
        id: 'polymorphism', title: 'Polymorphism', vizType: 'polymorphism', steps: 4,
        preview: 'One interface, many implementations — shapes, strategies, and more.',
        code: `// Interface contract\npublic interface IShape {\n  double Area();\n  double Perimeter();\n  string Describe();\n}\n\npublic class Circle : IShape {\n  private double R;\n  public Circle(double r) => R = r;\n  public double Area()      => Math.PI * R * R;\n  public double Perimeter() => 2 * Math.PI * R;\n  public string Describe()  => $"Circle r={R}";\n}\n\npublic class Rect : IShape {\n  private double W, H;\n  public Rect(double w, double h) { W=w; H=h; }\n  public double Area()      => W * H;\n  public double Perimeter() => 2 * (W + H);\n  public string Describe()  => $"Rect {W}x{H}";\n}\n\n// Polymorphism\nIShape[] shapes = { new Circle(5), new Rect(4,6) };\nforeach (var s in shapes)\n  Console.WriteLine($"{s.Describe()} A={s.Area():F1}");`,
        stepLabels: ['Interface', 'Circle', 'Rect', 'Dispatch'],
        stepDescriptions: [
          'IShape defines a contract — Area(), Perimeter(), Describe(). Any implementor must provide these.',
          'Circle implements IShape using its formula. The interface hides how it\'s calculated.',
          'Rect uses different math but satisfies the same interface. Callers don\'t need to know which.',
          'Storing both as IShape lets us call Area() polymorphically — the runtime picks the right version.',
        ],
      },
      {
        id: 'abstraction', title: 'Abstraction', vizType: 'abstraction', steps: 4,
        preview: 'Define abstract classes as partial templates that force subclass implementation.',
        code: `// Abstract class = partial blueprint\npublic abstract class Vehicle {\n  public string Brand { get; init; }\n\n  // Abstract: MUST be implemented\n  public abstract void Start();\n  public abstract int  FuelLevel();\n\n  // Concrete: shared behavior\n  public void Stop() =>\n    Console.WriteLine($"{Brand}: stopped.");\n\n  public string Status() =>\n    $"{Brand} fuel: {FuelLevel()}%";\n}\n\npublic class ElectricCar : Vehicle {\n  private int _battery = 80;\n  public override void Start() =>\n    Console.WriteLine($"{Brand}: silent EV start!");\n  public override int FuelLevel() => _battery;\n}\n\npublic class PetrolCar : Vehicle {\n  private int _tank = 60;\n  public override void Start() =>\n    Console.WriteLine($"{Brand}: vroom!");\n  public override int FuelLevel() => _tank;\n}`,
        stepLabels: ['Abstract', 'Concrete', 'ElectricCar', 'PetrolCar'],
        stepDescriptions: [
          'Abstract classes cannot be instantiated directly — they\'re templates with some gaps to fill.',
          'Stop() and Status() are concrete methods shared by all Vehicle subclasses.',
          'ElectricCar fills the gaps: Start() and FuelLevel() — its specific implementations.',
          'PetrolCar provides completely different Start() logic while reusing Stop() and Status().',
        ],
      },
    ],
  },
  {
    id: 'data-structures', title: 'Data Structures', Icon: Database,
    color: '#059669', gradient: 'linear-gradient(135deg,#059669,#0891B2)',
    description: 'Arrays, lists, stacks, queues, and dictionaries',
    topics: [
      {
        id: 'stack', title: 'Stack', vizType: 'stack', steps: 5,
        preview: 'LIFO — Last In, First Out. Push and Pop operations visualized.',
        code: `var stack = new Stack<int>();\n\n// Push: add to top\nstack.Push(10); // [10]\nstack.Push(20); // [10, 20]\nstack.Push(30); // [10, 20, 30]\n\n// Peek: look at top without removing\nConsole.WriteLine(stack.Peek()); // 30\n\n// Pop: remove and return top\nConsole.WriteLine(stack.Pop()); // 30 — [10,20]\nConsole.WriteLine(stack.Pop()); // 20 — [10]\nConsole.WriteLine(stack.Pop()); // 10 — []\n\n// Real use: undo history\nvar history = new Stack<string>();\nhistory.Push("Typed 'Hello'");\nhistory.Push("Deleted 'H'");\nhistory.Push("Typed 'J'");\nConsole.WriteLine("Undo: " + history.Pop());\n// Undo: Typed 'J'`,
        stepLabels: ['Empty', 'Push 10', 'Push 20', 'Push 30', 'Pop'],
        stepDescriptions: [
          'The stack starts empty. Think of it as a stack of plates — you can only access the top.',
          'Push(10) adds 10 to the top. Stack: [10]. The pointer (TOP) now points at 10.',
          'Push(20) — 20 sits on top of 10. Stack: [10, 20]. TOP → 20.',
          'Push(30) — 30 is now the topmost element. Stack: [10, 20, 30]. TOP → 30.',
          'Pop() removes and returns 30 (LIFO). Stack: [10, 20]. This is how undo operations work.',
        ],
      },
      {
        id: 'arrays', title: 'Arrays & Lists', vizType: 'arrays', steps: 4,
        preview: 'Fixed-size arrays vs dynamic List<T> — indexed, typed collections.',
        code: `// Fixed-size array\nint[] scores = { 85, 92, 78, 96, 88 };\nArray.Sort(scores);  // [78,85,88,92,96]\nConsole.WriteLine(scores[^1]); // 96 (last)\n\n// Dynamic List<T>\nvar names = new List<string>();\nnames.Add("Alice");\nnames.Add("Bob");\nnames.Remove("Alice");\nnames.Insert(0, "Charlie");\n\n// LINQ on list\nvar top = scores\n  .Where(s => s > 85)\n  .OrderByDescending(s => s);\n// [96, 92, 88]\n\n// 2D Array\nint[,] matrix = new int[3, 3];\nfor (int i = 0; i < 3; i++)\n  for (int j = 0; j < 3; j++)\n    matrix[i, j] = i * 3 + j + 1;`,
        stepLabels: ['Declare', 'Sort', 'List<T>', 'LINQ'],
        stepDescriptions: [
          'Arrays are fixed-length. int[] scores allocates 5 contiguous memory slots on the stack.',
          'Array.Sort() rearranges elements in-place. scores[^1] uses C# 8 index-from-end syntax.',
          'List<T> is dynamic — it grows/shrinks. Backed by an array that doubles when capacity is exceeded.',
          'LINQ works on any IEnumerable — where/orderby run lazily until you enumerate.',
        ],
      },
      {
        id: 'dictionary', title: 'Dictionary', vizType: 'dictionary', steps: 4,
        preview: 'Key-value pairs with O(1) average lookup via hashing.',
        code: `// Create dictionary\nvar grades = new Dictionary<string, int>();\n\n// Add entries\ngrades["Alice"]   = 95;\ngrades["Bob"]     = 88;\ngrades.Add("Eve", 92);\n\n// Safe lookup (no exception)\nif (grades.TryGetValue("Alice", out int score))\n  Console.WriteLine($"Alice: {score}"); // 95\n\n// Iterate\nforeach (var (key, val) in grades)\n  Console.WriteLine($"{key}: {val}");\n\n// Check & remove\nif (grades.ContainsKey("Bob"))\n  grades.Remove("Bob");\n\n// LINQ on Dictionary\nvar honor = grades\n  .Where(g => g.Value >= 90)\n  .Select(g => g.Key);\n// ["Alice", "Eve"]`,
        stepLabels: ['Create', 'Add', 'Lookup', 'Iterate'],
        stepDescriptions: [
          'Dictionary<K,V> is a hash table. Each key hashes to a bucket for O(1) average lookup.',
          'You can add via indexer (grades["Alice"] = 95) or .Add(). Duplicate keys throw an exception.',
          'TryGetValue is safe — returns false instead of throwing if the key is missing.',
          'Iterating yields KeyValuePair<K,V>. C# 8 deconstruction (key, val) keeps it clean.',
        ],
      },
    ],
  },
  {
    id: 'linq', title: 'LINQ & Collections', Icon: Filter,
    color: '#D97706', gradient: 'linear-gradient(135deg,#D97706,#EF4444)',
    description: 'Query any collection with SQL-like syntax',
    topics: [
      {
        id: 'linq-basics', title: 'LINQ Pipeline', vizType: 'linq', steps: 5,
        preview: 'Where, Select, OrderBy — compose a query pipeline over any IEnumerable.',
        code: `var numbers = Enumerable.Range(1, 10).ToList();\n// [1,2,3,4,5,6,7,8,9,10]\n\n// LINQ method chain (pipeline)\nvar result = numbers\n  .Where(n  => n % 2 == 0)       // filter evens\n  .Select(n  => n * n)            // square them\n  .OrderByDescending(n => n)      // sort descending\n  .Take(3)                        // first 3\n  .ToList();                      // execute!\n\n// Result: [100, 64, 36]\n\n// Query syntax (same result)\nvar query = (from n in numbers\n             where  n % 2 == 0\n             orderby n * n descending\n             select n * n)\n            .Take(3);\n\nresult.ForEach(Console.WriteLine);`,
        stepLabels: ['Source', 'Where', 'Select', 'OrderBy', 'Result'],
        stepDescriptions: [
          'Source: numbers [1..10]. LINQ operators are lazy — nothing runs until you enumerate.',
          'Where(n % 2 == 0) filters: only even numbers pass through → [2, 4, 6, 8, 10].',
          'Select(n => n*n) transforms each element: squares them → [4, 16, 36, 64, 100].',
          'OrderByDescending sorts from largest to smallest → [100, 64, 36, 16, 4].',
          'Take(3).ToList() triggers execution, materializing the result → [100, 64, 36].',
        ],
      },
      {
        id: 'linq-groupby', title: 'GroupBy & Aggregates', vizType: 'groupby', steps: 4,
        preview: 'Aggregate with Sum, Average, Min, Max and group with GroupBy.',
        code: `record Student(string Name, string Dept, int Score);\n\nvar students = new List<Student> {\n  new("Alice", "CS",   95),\n  new("Bob",   "CS",   82),\n  new("Eve",   "Math", 90),\n  new("Dan",   "Math", 78),\n  new("Sue",   "CS",   88),\n};\n\n// Aggregates\ndouble avg  = students.Average(s => s.Score);\nint    max  = students.Max(s => s.Score);\nint    top  = students.Count(s => s.Score >= 90);\n\n// GroupBy department\nvar byDept = students\n  .GroupBy(s => s.Dept)\n  .Select(g => new {\n    Dept    = g.Key,\n    Count   = g.Count(),\n    Average = g.Average(s => s.Score)\n  });\n\n// CS: 3 students, avg 88.3\n// Math: 2 students, avg 84.0`,
        stepLabels: ['Data', 'Avg/Max', 'GroupBy', 'Project'],
        stepDescriptions: [
          'We have 5 students in two departments. Records (C# 9) are immutable data carriers.',
          'Aggregates like Average/Max/Count compute scalar values over the whole collection.',
          'GroupBy(s => s.Dept) partitions the list — each group has a Key and its matching items.',
          'Select on groups projects each group into an anonymous object with computed stats.',
        ],
      },
    ],
  },
  {
    id: 'file-handling', title: 'File Handling', Icon: FolderOpen,
    color: '#0891B2', gradient: 'linear-gradient(135deg,#0891B2,#6366F1)',
    description: 'Read, write, and stream files with System.IO',
    topics: [
      {
        id: 'file-io', title: 'File Read & Write', vizType: 'fileio', steps: 4,
        preview: 'Use File class for quick I/O and StreamReader/Writer for large files.',
        code: `using System.IO;\n\n// Write entire file at once\nFile.WriteAllText("notes.txt",\n  "EduVerse Notes\\nLesson 1: Variables");\n\n// Append a line\nFile.AppendAllText("notes.txt",\n  "\\nLesson 2: Loops");\n\n// Read all text\nstring content = File.ReadAllText("notes.txt");\nConsole.WriteLine(content);\n\n// Read line by line\nstring[] lines = File.ReadAllLines("notes.txt");\nforeach (string line in lines)\n  Console.WriteLine($">> {line}");\n\n// Check & delete\nif (File.Exists("notes.txt"))\n  File.Delete("notes.txt");\n\n// Async version\nawait File.WriteAllTextAsync("async.txt", "data");`,
        stepLabels: ['Write', 'Append', 'Read', 'Delete'],
        stepDescriptions: [
          'File.WriteAllText creates (or overwrites) the file and writes the string in one call.',
          'AppendAllText adds to the end without erasing existing content.',
          'ReadAllText reads the entire file into a string. ReadAllLines splits by newline.',
          'Always check File.Exists before deleting. Use await for async I/O on large files.',
        ],
      },
      {
        id: 'streams', title: 'Streams & StreamReader', vizType: 'streams', steps: 4,
        preview: 'Use StreamReader/Writer for large files and efficient buffered I/O.',
        code: `using System.IO;\n\n// StreamWriter — buffered write\nusing (var writer = new StreamWriter("log.txt")) {\n  writer.WriteLine("[INFO]  App started");\n  writer.WriteLine("[INFO]  Loading data...");\n  writer.WriteLine("[WARN]  Cache miss");\n} // auto-flushed & closed\n\n// StreamReader — buffered read\nusing (var reader = new StreamReader("log.txt")) {\n  string? line;\n  while ((line = reader.ReadLine()) != null) {\n    if (line.Contains("[WARN]"))\n      Console.ForegroundColor = ConsoleColor.Yellow;\n    Console.WriteLine(line);\n    Console.ResetColor();\n  }\n}\n\n// Large file — async streaming\nawait using var sr = new StreamReader("big.csv");\nwhile (!sr.EndOfStream) {\n  var row = await sr.ReadLineAsync();\n  ProcessRow(row);\n}`,
        stepLabels: ['Open', 'Write', 'Read', 'Async'],
        stepDescriptions: [
          'StreamWriter wraps the file in a buffer. Data is written in chunks for better performance.',
          'writer.WriteLine adds a line with a newline. The using block guarantees Dispose() is called.',
          'StreamReader reads line-by-line — great for large files since it doesn\'t load all into memory.',
          'Async streaming with ReadLineAsync prevents blocking the thread during heavy file I/O.',
        ],
      },
    ],
  },
  {
    id: 'async', title: 'Async & Multithreading', Icon: Zap,
    color: '#DB2777', gradient: 'linear-gradient(135deg,#DB2777,#7C3AED)',
    description: 'async/await, Tasks, and parallel programming',
    topics: [
      {
        id: 'async-await', title: 'async / await', vizType: 'async', steps: 5,
        preview: 'Write non-blocking code using async methods and awaitable Tasks.',
        code: `using System.Net.Http;\n\n// Async method returns Task<T>\npublic async Task<string> FetchAsync(string url) {\n  using var http = new HttpClient();\n  // Thread is FREE while waiting for response\n  string data = await http.GetStringAsync(url);\n  return data;\n}\n\n// Async caller\npublic async Task RunAsync() {\n  Console.WriteLine("Starting fetch...");\n\n  // Run two fetches concurrently\n  var t1 = FetchAsync("https://api.example.com/a");\n  var t2 = FetchAsync("https://api.example.com/b");\n\n  // Await both — runs in parallel!\n  var results = await Task.WhenAll(t1, t2);\n\n  Console.WriteLine($"Got {results[0].Length} chars");\n  Console.WriteLine($"Got {results[1].Length} chars");\n}`,
        stepLabels: ['Sync', 'await', 'Free thread', 'Resume', 'WhenAll'],
        stepDescriptions: [
          'Without async, GetStringAsync would block the thread — freezing the app until the response arrives.',
          '`await` suspends the method and returns control to the caller. The thread is NOT blocked.',
          'While waiting, the thread is free to handle other requests, UI events, or other tasks.',
          'When the response arrives, the runtime resumes execution right after the await point.',
          'Task.WhenAll runs multiple async tasks concurrently — total time ≈ slowest task, not sum.',
        ],
      },
      {
        id: 'parallel', title: 'Parallel & PLINQ', vizType: 'parallel', steps: 4,
        preview: 'Use Parallel.For and PLINQ to spread CPU-bound work across cores.',
        code: `using System.Threading;\nusing System.Threading.Tasks;\n\n// Parallel.For — CPU-bound loops\nParallel.For(0, 8, i => {\n  int threadId = Thread.CurrentThread.ManagedThreadId;\n  Console.WriteLine($"Core {threadId}: item {i}");\n});\n\n// Parallel.ForEach\nvar items = Enumerable.Range(1, 1_000_000).ToList();\nlong total = 0;\nParallel.ForEach(items,\n  () => 0L,                          // local init\n  (item, _, local) => local + item,  // body\n  local => Interlocked.Add(ref total, local));\n\n// PLINQ — parallel LINQ\nvar result = items.AsParallel()\n                  .WithDegreeOfParallelism(4)\n                  .Where(x  => x % 2 == 0)\n                  .Select(x => (long)x * x)\n                  .Sum();\n\nConsole.WriteLine($"Sum: {result}");`,
        stepLabels: ['Sequential', 'Parallel.For', 'ForEach', 'PLINQ'],
        stepDescriptions: [
          'Sequential code uses one CPU core. With 8 items and 8 cores, you\'re leaving 7 cores idle.',
          'Parallel.For splits iterations across available CPU cores automatically.',
          'Parallel.ForEach with local state avoids lock contention — each thread accumulates locally.',
          'PLINQ adds .AsParallel() to any LINQ query — the runtime partitions data across cores.',
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// VISUALIZATIONS
// ═══════════════════════════════════════════════════════════

function ClassObjectViz({ step }) {
  const fields  = ['string Name', 'int    Age', 'double GPA'];
  const values  = ['"Alice"', '20', '3.9'];
  const showObj = step >= 3;
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      <defs>
        <marker id="arr1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#2563EB"/>
        </marker>
      </defs>
      {/* Blueprint label */}
      <text x="90" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">CLASS (Blueprint)</text>
      {/* Class box */}
      <rect x="20" y="30" width="140" height={step >= 1 ? (step >= 2 ? 160 : 70) : 40} rx="10" fill="white" stroke="#2563EB" strokeWidth="2"/>
      <rect x="20" y="30" width="140" height="36" rx="10" fill="#2563EB"/>
      <rect x="20" y="52" width="140" height="14" rx="0" fill="#2563EB"/>
      <text x="90" y="54" textAnchor="middle" fontSize="12" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">class Student</text>
      {step >= 1 && fields.slice(0, Math.min(step, 3)).map((f, i) => (
        <text key={i} x="34" y={82 + i * 24} fontSize="11" fill="#334155" fontFamily="Fira Code,monospace">
          <tspan fill="#7C3AED">public </tspan>
          <tspan fill="#0891B2">{f.split(' ')[0]} </tspan>
          <tspan fill="#0F172A">{f.split(' ')[1]}</tspan>
        </text>
      ))}
      {/* Arrow */}
      {step >= 3 && (
        <line x1="165" y1="110" x2="230" y2="110" stroke="#2563EB" strokeWidth="2" markerEnd="url(#arr1)" strokeDasharray="6,3"/>
      )}
      {/* new keyword */}
      {step >= 3 && (
        <text x="183" y="104" fontSize="10" fill="#2563EB" fontWeight="700" fontFamily="Fira Code,monospace">new</text>
      )}
      {/* Object box */}
      {showObj && (
        <>
          <text x="340" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">OBJECT (Instance)</text>
          <rect x="240" y="30" width="150" height="160" rx="10" fill="white" stroke="#10B981" strokeWidth="2"/>
          <rect x="240" y="30" width="150" height="36" rx="10" fill="#10B981"/>
          <rect x="240" y="52" width="150" height="14" fill="#10B981"/>
          <text x="315" y="54" textAnchor="middle" fontSize="12" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">s1 : Student</text>
          {fields.map((f, i) => (
            <g key={i}>
              <text x="254" y={82 + i * 32} fontSize="10" fill="#64748B" fontFamily="Fira Code,monospace">{f.split(' ')[1]}</text>
              <rect x="254" y={87 + i * 32} width="118" height="18" rx="4" fill="#F0FDF4" stroke="#10B981" strokeWidth="1"/>
              <text x="313" y={100 + i * 32} textAnchor="middle" fontSize="11" fill="#065F46" fontWeight="600" fontFamily="Fira Code,monospace">{values[i]}</text>
            </g>
          ))}
        </>
      )}
      {/* Memory label */}
      {step >= 3 && (
        <text x="315" y="210" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Inter,sans-serif">📍 Heap memory</text>
      )}
    </svg>
  );
}

function InheritanceViz({ step }) {
  const opacity = (minStep) => step >= minStep ? 1 : 0.1;
  const trans = 'all 0.5s ease';
  return (
    <svg viewBox="0 0 460 310" className="viz-svg">
      <defs>
        <marker id="inh-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#7C3AED"/>
        </marker>
      </defs>
      {/* Animal */}
      <g style={{opacity: 1, transition: trans}}>
        <rect x="155" y="10" width="150" height="70" rx="10" fill="#7C3AED"/>
        <text x="230" y="34" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">Animal</text>
        <text x="230" y="52" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)" fontFamily="Fira Code,monospace">Name, Age</text>
        <text x="230" y="68" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)" fontFamily="Fira Code,monospace">virtual Sound()</text>
      </g>
      {/* Lines */}
      <line x1="180" y1="80" x2="120" y2="155" stroke="#7C3AED" strokeWidth="2" markerEnd="url(#inh-arr)" style={{opacity: opacity(2), transition: trans}}/>
      <line x1="280" y1="80" x2="340" y2="155" stroke="#7C3AED" strokeWidth="2" markerEnd="url(#inh-arr)" style={{opacity: opacity(3), transition: trans}}/>
      {/* Dog */}
      <g style={{opacity: opacity(2), transition: trans}}>
        <rect x="40" y="155" width="160" height="80" rx="10" fill="white" stroke="#7C3AED" strokeWidth="2"/>
        <rect x="40" y="155" width="160" height="30" rx="10" fill="rgba(124,58,237,0.15)"/>
        <rect x="40" y="172" width="160" height="13" fill="rgba(124,58,237,0.15)"/>
        <text x="120" y="176" textAnchor="middle" fontSize="12" fontWeight="700" fill="#7C3AED" fontFamily="Fira Code,monospace">Dog : Animal</text>
        <text x="120" y="202" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">override Sound()</text>
        <text x="120" y="218" textAnchor="middle" fontSize="10" fill="#059669" fontWeight="600" fontFamily="Fira Code,monospace">→ "Woof! 🐕"</text>
        {step >= 4 && <text x="120" y="234" textAnchor="middle" fontSize="9" fill="#64748B" fontFamily="Fira Code,monospace">+ Fetch()</text>}
      </g>
      {/* Cat */}
      <g style={{opacity: opacity(3), transition: trans}}>
        <rect x="260" y="155" width="160" height="80" rx="10" fill="white" stroke="#7C3AED" strokeWidth="2"/>
        <rect x="260" y="155" width="160" height="30" rx="10" fill="rgba(124,58,237,0.15)"/>
        <rect x="260" y="172" width="160" height="13" fill="rgba(124,58,237,0.15)"/>
        <text x="340" y="176" textAnchor="middle" fontSize="12" fontWeight="700" fill="#7C3AED" fontFamily="Fira Code,monospace">Cat : Animal</text>
        <text x="340" y="202" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">override Sound()</text>
        <text x="340" y="218" textAnchor="middle" fontSize="10" fill="#059669" fontWeight="600" fontFamily="Fira Code,monospace">→ "Meow! 🐈"</text>
      </g>
      {/* Breathe shared */}
      {step >= 4 && (
        <g>
          <line x1="230" y1="80" x2="230" y2="270" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="5,4"/>
          <rect x="140" y="270" width="180" height="30" rx="8" fill="#F0FDF4" stroke="#10B981" strokeWidth="1.5"/>
          <text x="230" y="289" textAnchor="middle" fontSize="10" fontWeight="600" fill="#065F46" fontFamily="Inter,sans-serif">✓ Breathe() inherited by all</text>
        </g>
      )}
    </svg>
  );
}

function StackViz({ step }) {
  const items  = [
    { val: 10, color: '#2563EB' },
    { val: 20, color: '#7C3AED' },
    { val: 30, color: '#DB2777' },
  ];
  const visible = step === 4
    ? items.slice(0, 2)
    : items.slice(0, step === 0 ? 0 : step - 1 < 0 ? 0 : step - 1);
  const showPop = step === 4;

  return (
    <svg viewBox="0 0 460 300" className="viz-svg">
      {/* Stack frame */}
      <rect x="170" y="30" width="120" height="220" rx="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2"/>
      <text x="230" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">Stack Memory</text>
      <text x="230" y="265" textAnchor="middle" fontSize="10" fill="#94A3B8" fontFamily="Inter,sans-serif">↑ grows upward</text>

      {/* Stack items */}
      {visible.map((item, i) => {
        const y = 195 - i * 58;
        return (
          <g key={item.val}>
            <rect x="180" y={y} width="100" height="46" rx="8" fill={item.color}/>
            <text x="230" y={y + 28} textAnchor="middle" fontSize="18" fontWeight="800" fill="white" fontFamily="Fira Code,monospace">{item.val}</text>
          </g>
        );
      })}

      {/* TOP pointer */}
      {visible.length > 0 && (
        <>
          <text x="310" y={200 - (visible.length - 1) * 58 + 26} fontSize="11" fontWeight="700" fill="#10B981" fontFamily="Inter,sans-serif">← TOP</text>
        </>
      )}

      {/* Pop animation */}
      {showPop && (
        <g>
          <rect x="310" y="60" width="100" height="46" rx="8" fill="#DB2777" opacity="0.9"/>
          <text x="360" y="88" textAnchor="middle" fontSize="18" fontWeight="800" fill="white" fontFamily="Fira Code,monospace">30</text>
          <text x="360" y="120" textAnchor="middle" fontSize="11" fill="#DB2777" fontWeight="700" fontFamily="Inter,sans-serif">Pop() → 30</text>
          <line x1="310" y1="83" x2="290" y2="83" stroke="#DB2777" strokeWidth="2" strokeDasharray="4,3"/>
        </g>
      )}

      {/* Operation label */}
      <rect x="30" y="60" width="120" height="36" rx="8" fill={step === 0 ? '#F1F5F9' : step < 4 ? '#EFF6FF' : '#FEF2F2'} stroke={step === 0 ? '#E2E8F0' : step < 4 ? '#BFDBFE' : '#FECACA'} strokeWidth="1.5"/>
      <text x="90" y="82" textAnchor="middle" fontSize="12" fontWeight="700" fill={step === 0 ? '#94A3B8' : step < 4 ? '#1D4ED8' : '#DC2626'} fontFamily="Fira Code,monospace">
        {step === 0 ? 'Empty' : step === 1 ? 'Push(10)' : step === 2 ? 'Push(20)' : step === 3 ? 'Push(30)' : 'Pop()'}
      </text>
    </svg>
  );
}

function LinqViz({ step }) {
  const source  = [1,2,3,4,5,6,7,8,9,10];
  const evens   = [2,4,6,8,10];
  const squared = [4,16,36,64,100];
  const sorted  = [100,64,36,16,4];
  const result  = [100,64,36];

  const stages = [source, source, evens, squared, result];
  const labels = ['Source [1..10]', 'Source [1..10]', 'Where(even) → 5 items', 'Select(n²) → squared', 'Take(3) → [100, 64, 36]'];
  const colors = ['#64748B','#64748B','#2563EB','#7C3AED','#10B981'];
  const items  = stages[step] || source;

  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      {/* Pipeline stages */}
      {['Where', 'Select', 'OrderBy', 'Take'].map((op, i) => {
        const active = step >= i + 2;
        return (
          <g key={op}>
            <rect x={20 + i * 110} y="10" width="100" height="30" rx="8"
              fill={active ? colors[i+1] : '#F1F5F9'}
              stroke={active ? colors[i+1] : '#E2E8F0'}
              strokeWidth="1.5" opacity={active ? 1 : 0.5}/>
            <text x={70 + i * 110} y="30" textAnchor="middle" fontSize="11" fontWeight="700"
              fill={active ? 'white' : '#94A3B8'} fontFamily="Fira Code,monospace">.{op}()</text>
          </g>
        );
      })}

      {/* Label */}
      <text x="230" y="68" textAnchor="middle" fontSize="12" fontWeight="700" fill={colors[step]} fontFamily="Inter,sans-serif">{labels[step]}</text>

      {/* Items */}
      <g>
        {items.slice(0, 10).map((n, i) => {
          const cols = Math.min(items.length, 5);
          const row  = Math.floor(i / cols);
          const col  = i % cols;
          const cx   = 80 + col * 62;
          const cy   = 100 + row * 62;
          return (
            <g key={i}>
              <rect x={cx - 24} y={cy - 20} width="48" height="40" rx="8"
                fill={colors[step]} opacity={step === 0 ? 0.3 : 0.85}/>
              <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="800"
                fill="white" fontFamily="Fira Code,monospace">{n}</text>
            </g>
          );
        })}
      </g>

      {/* Count badge */}
      <text x="230" y="248" textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="Inter,sans-serif">
        {items.length} element{items.length !== 1 ? 's' : ''} {step >= 4 ? '✓ Result!' : step >= 1 ? 'remaining' : 'total'}
      </text>
    </svg>
  );
}

function AsyncViz({ step }) {
  const blocks = [
    { label: 'Console.Write\n("Starting")', color: '#2563EB', x: 30, w: 120, done: step >= 1 },
    { label: 'await\nFetchAsync()', color: '#F59E0B', x: 30, w: 120, done: step >= 2 },
    { label: 'Thread\nFREE →', color: '#10B981', x: 30, w: 120, done: step >= 2 },
    { label: 'Console.Write\n(result)', color: '#2563EB', x: 30, w: 120, done: step >= 4 },
  ];
  const taskY  = 100;
  const mainY  = 170;

  return (
    <svg viewBox="0 0 460 290" className="viz-svg">
      {/* Thread labels */}
      <text x="14" y={mainY - 10} fontSize="10" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">Main Thread</text>
      <text x="14" y={taskY - 10} fontSize="10" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">HTTP Task</text>

      {/* Timeline bars */}
      <rect x="14" y={mainY} width="420" height="28" rx="6" fill="#F1F5F9"/>
      <rect x="14" y={taskY} width="420" height="28" rx="6" fill="#F1F5F9"/>

      {/* Step 1: Main runs */}
      {step >= 1 && <rect x="14" y={mainY} width="80" height="28" rx="6" fill="#2563EB"/>}
      {step >= 1 && <text x="54" y={mainY+18} textAnchor="middle" fontSize="9" fill="white" fontFamily="Fira Code,monospace">Running</text>}

      {/* Step 2: await — main thread released */}
      {step >= 2 && (
        <>
          <rect x="94" y={mainY} width="180" height="28" rx="6" fill="#E2E8F0"/>
          <text x="184" y={mainY+18} textAnchor="middle" fontSize="9" fill="#94A3B8" fontFamily="Inter,sans-serif">⏸ Suspended (thread free)</text>
          {/* HTTP task runs */}
          <rect x="94" y={taskY} width="180" height="28" rx="6" fill="#F59E0B"/>
          <text x="184" y={taskY+18} textAnchor="middle" fontSize="9" fill="white" fontFamily="Fira Code,monospace">Fetching data…</text>
        </>
      )}

      {/* Step 3: HTTP done, notify */}
      {step >= 3 && (
        <>
          <rect x="274" y={taskY} width="50" height="28" rx="6" fill="#10B981"/>
          <text x="299" y={taskY+18} textAnchor="middle" fontSize="9" fill="white" fontFamily="Fira Code,monospace">Done!</text>
          <line x1="299" y1={taskY+28} x2="299" y2={mainY} stroke="#10B981" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#async-arr)"/>
        </>
      )}

      {/* Step 4: Main resumes */}
      {step >= 4 && (
        <>
          <rect x="274" y={mainY} width="160" height="28" rx="6" fill="#2563EB"/>
          <text x="354" y={mainY+18} textAnchor="middle" fontSize="9" fill="white" fontFamily="Fira Code,monospace">Resumed with result</text>
        </>
      )}

      {/* WhenAll label */}
      {step >= 4 && (
        <rect x="14" y="220" width="420" height="36" rx="8" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1.5"/>
      )}
      {step >= 4 && (
        <text x="224" y="243" textAnchor="middle" fontSize="11" fontWeight="600" fill="#065F46" fontFamily="Inter,sans-serif">
          Task.WhenAll → runs both concurrently ⚡
        </text>
      )}

      {/* Labels */}
      <text x="224" y="280" textAnchor="middle" fontSize="10" fill="#94A3B8" fontFamily="Inter,sans-serif">
        {step === 0 ? 'No async — thread blocks during I/O'
          : step === 1 ? 'Main thread starts executing'
          : step === 2 ? 'await suspends — thread is freed for other work'
          : step === 3 ? 'HTTP task completes and signals continuation'
          : 'Thread resumes execution after await point'}
      </text>

      <defs>
        <marker id="async-arr" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#10B981"/>
        </marker>
      </defs>
    </svg>
  );
}

function GenericViz({ step, topic }) {
  const colors = ['#2563EB','#7C3AED','#059669','#D97706','#DB2777','#0891B2'];
  const c = colors[step % colors.length];
  const boxes = [
    { label: 'Step 1', x: 60, y: 80 },
    { label: 'Step 2', x: 190, y: 80 },
    { label: 'Step 3', x: 320, y: 80 },
    { label: 'Result', x: 190, y: 190 },
  ];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      {boxes.slice(0, step + 1).map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width="110" height="60" rx="12" fill={i === step ? c : '#F1F5F9'} stroke={i === step ? c : '#E2E8F0'} strokeWidth="2"/>
          <text x={b.x + 55} y={b.y + 35} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={i === step ? 'white' : '#94A3B8'} fontFamily="Inter,sans-serif">{b.label}</text>
          {i < step && i < 2 && (
            <line x1={b.x + 110} y1={b.y + 30} x2={boxes[i+1].x} y2={boxes[i+1].y + 30}
              stroke="#E2E8F0" strokeWidth="2"/>
          )}
        </g>
      ))}
      <text x="230" y="260" textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="Inter,sans-serif">
        Step {step + 1} of {topic.steps}
      </text>
    </svg>
  );
}

function EncapsulationViz({ step }) {
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      {/* Outer ring: public */}
      <circle cx="230" cy="140" r="120" fill="rgba(37,99,235,0.06)" stroke={step>=0?'#2563EB':'#E2E8F0'} strokeWidth="2" strokeDasharray={step>=0?'0':'8,4'}/>
      {/* Middle ring: protected */}
      <circle cx="230" cy="140" r="85" fill="rgba(124,58,237,0.07)" stroke={step>=1?'#7C3AED':'#E2E8F0'} strokeWidth="2" strokeDasharray={step>=1?'0':'8,4'}/>
      {/* Inner: private */}
      <circle cx="230" cy="140" r="50" fill="rgba(239,68,68,0.08)" stroke={step>=1?'#EF4444':'#E2E8F0'} strokeWidth="2"/>

      {/* Labels */}
      <text x="230" y="32" textAnchor="middle" fontSize="10" fontWeight="700" fill="#2563EB" fontFamily="Inter,sans-serif">public</text>
      <text x="230" y="66" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7C3AED" fontFamily="Inter,sans-serif">protected</text>
      <text x="230" y="130" textAnchor="middle" fontSize="10" fontWeight="700" fill="#EF4444" fontFamily="Inter,sans-serif">private</text>

      {/* Center: _balance */}
      <text x="230" y="147" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0F172A" fontFamily="Fira Code,monospace">_balance</text>

      {/* Public methods shown outside */}
      {step >= 2 && (
        <>
          <rect x="335" y="90" width="90" height="28" rx="8" fill="#10B981"/>
          <text x="380" y="108" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">Deposit()</text>
          <line x1="335" y1="104" x2="280" y2="130" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4,3"/>
        </>
      )}
      {step >= 3 && (
        <>
          <rect x="335" y="130" width="90" height="28" rx="8" fill="#F59E0B"/>
          <text x="380" y="148" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">Withdraw()</text>
          <line x1="335" y1="144" x2="280" y2="148" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,3"/>
        </>
      )}
      {/* Caption */}
      <text x="230" y="272" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Inter,sans-serif">
        {step===0?'public boundary visible to all'
          :step===1?'private state hidden inside class'
          :step===2?'Deposit() validated before touching _balance'
          :'Withdraw() checks funds — class owns invariants'}
      </text>
    </svg>
  );
}

function PolymorphismViz({ step }) {
  const shapes = [
    { label: 'Circle r=5', area: '78.5', perim: '31.4', color: '#2563EB', shape: 'circle' },
    { label: 'Rect 4×6',   area: '24.0', perim: '20.0', color: '#7C3AED', shape: 'rect' },
  ];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      {/* Interface box */}
      <rect x="155" y="10" width="150" height="70" rx="10" fill="#0F172A"/>
      <text x="230" y="34" textAnchor="middle" fontSize="12" fontWeight="700" fill="#60A5FA" fontFamily="Fira Code,monospace">«interface»</text>
      <text x="230" y="52" textAnchor="middle" fontSize="12" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">IShape</text>
      <text x="230" y="68" textAnchor="middle" fontSize="9" fill="#94A3B8" fontFamily="Fira Code,monospace">Area() · Perimeter()</text>

      {/* Lines to impls */}
      {step >= 1 && <line x1="190" y1="80" x2="120" y2="150" stroke="#2563EB" strokeWidth="2" strokeDasharray="5,4"/>}
      {step >= 2 && <line x1="270" y1="80" x2="340" y2="150" stroke="#7C3AED" strokeWidth="2" strokeDasharray="5,4"/>}

      {/* Circle */}
      {step >= 1 && (
        <g>
          <rect x="40" y="150" width="160" height="80" rx="10" fill="white" stroke="#2563EB" strokeWidth="2"/>
          <circle cx="90" cy="190" r="24" fill="rgba(37,99,235,0.15)" stroke="#2563EB" strokeWidth="2"/>
          <text x="145" y="178" textAnchor="middle" fontSize="11" fontWeight="700" fill="#2563EB" fontFamily="Fira Code,monospace">Circle</text>
          {step>=3&&<text x="145" y="196" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">A={shapes[0].area}</text>}
          {step>=3&&<text x="145" y="212" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">P={shapes[0].perim}</text>}
        </g>
      )}
      {/* Rect */}
      {step >= 2 && (
        <g>
          <rect x="260" y="150" width="160" height="80" rx="10" fill="white" stroke="#7C3AED" strokeWidth="2"/>
          <rect x="285" y="170" width="50" height="40" fill="rgba(124,58,237,0.15)" stroke="#7C3AED" strokeWidth="2"/>
          <text x="365" y="178" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7C3AED" fontFamily="Fira Code,monospace">Rect</text>
          {step>=3&&<text x="365" y="196" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">A={shapes[1].area}</text>}
          {step>=3&&<text x="365" y="212" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">P={shapes[1].perim}</text>}
        </g>
      )}
      {/* Polymorphic call */}
      {step >= 3 && (
        <rect x="80" y="248" width="300" height="28" rx="8" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1.5"/>
      )}
      {step >= 3 && (
        <text x="230" y="267" textAnchor="middle" fontSize="10" fontWeight="600" fill="#065F46" fontFamily="Fira Code,monospace">
          shapes.ForEach(s =&gt; s.Area()) ✓
        </text>
      )}
    </svg>
  );
}

function AbstractionViz({ step }) {
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      {/* Abstract Vehicle */}
      <rect x="130" y="10" width="200" height="90" rx="10" fill="white" stroke="#0891B2" strokeWidth="2" strokeDasharray={step<1?'8,4':'0'}/>
      <rect x="130" y="10" width="200" height="34" rx="10" fill="#0891B2"/>
      <rect x="130" y="32" width="200" height="12" fill="#0891B2"/>
      <text x="230" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">abstract Vehicle</text>
      <text x="230" y="60" textAnchor="middle" fontSize="10" fill="#0891B2" fontFamily="Fira Code,monospace">abstract Start()</text>
      <text x="230" y="76" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">concrete Stop() ✓</text>
      <text x="230" y="92" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">concrete Status() ✓</text>

      {/* Lines */}
      {step>=2&&<line x1="190" y1="100" x2="100" y2="170" stroke="#0891B2" strokeWidth="2"/>}
      {step>=3&&<line x1="270" y1="100" x2="360" y2="170" stroke="#0891B2" strokeWidth="2"/>}

      {/* ElectricCar */}
      {step>=2&&(
        <g>
          <rect x="20" y="170" width="160" height="80" rx="10" fill="white" stroke="#10B981" strokeWidth="2"/>
          <rect x="20" y="170" width="160" height="30" rx="10" fill="rgba(16,185,129,0.15)"/>
          <rect x="20" y="188" width="160" height="12" fill="rgba(16,185,129,0.15)"/>
          <text x="100" y="189" textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669" fontFamily="Fira Code,monospace">ElectricCar</text>
          <text x="100" y="214" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">Start(): silent EV</text>
          <text x="100" y="232" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Fira Code,monospace">FuelLevel(): 80%</text>
        </g>
      )}
      {/* PetrolCar */}
      {step>=3&&(
        <g>
          <rect x="280" y="170" width="160" height="80" rx="10" fill="white" stroke="#F59E0B" strokeWidth="2"/>
          <rect x="280" y="170" width="160" height="30" rx="10" fill="rgba(245,158,11,0.15)"/>
          <rect x="280" y="188" width="160" height="12" fill="rgba(245,158,11,0.15)"/>
          <text x="360" y="189" textAnchor="middle" fontSize="11" fontWeight="700" fill="#D97706" fontFamily="Fira Code,monospace">PetrolCar</text>
          <text x="360" y="214" textAnchor="middle" fontSize="10" fill="#334155" fontFamily="Fira Code,monospace">Start(): vroom!</text>
          <text x="360" y="232" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Fira Code,monospace">FuelLevel(): 60%</text>
        </g>
      )}
      <text x="230" y="270" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Inter,sans-serif">
        {step===0?'Abstract class — cannot be new\'d directly'
          :step===1?'Concrete methods are shared; abstract methods must be overridden'
          :step===2?'ElectricCar fills the abstract gap with its own Start()'
          :'PetrolCar provides different Start() — same contract, different behavior'}
      </text>
    </svg>
  );
}

function VariablesViz({ step }) {
  const vars = [
    { name: 'age', type: 'int', value: '25', color: '#2563EB', bytes: '4 bytes' },
    { name: 'name', type: 'string', value: '"Alice"', color: '#7C3AED', bytes: 'heap ref' },
    { name: 'isStudent', type: 'bool', value: 'true', color: '#059669', bytes: '1 bit' },
    { name: 'gpa', type: 'double', value: '3.85', color: '#D97706', bytes: '8 bytes' },
  ];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      <text x="230" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">Memory — Variable Boxes</text>
      {vars.slice(0, step === 0 ? 0 : step - 1).map((v, i) => (
        <g key={i}>
          <rect x={20 + i * 108} y="40" width="100" height="140" rx="10" fill="white" stroke={v.color} strokeWidth="2"/>
          <rect x={20 + i * 108} y="40" width="100" height="32" rx="10" fill={v.color}/>
          <rect x={20 + i * 108} y="60" width="100" height="12" rx="0" fill={v.color}/>
          <text x={70 + i * 108} y="62" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">{v.type}</text>
          <text x={70 + i * 108} y="92" textAnchor="middle" fontSize="13" fontWeight="800" fill={v.color} fontFamily="Fira Code,monospace">{v.value}</text>
          <text x={70 + i * 108} y="114" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Inter,sans-serif">{v.name}</text>
          <rect x={30 + i * 108} y="126" width="80" height="20" rx="5" fill={`${v.color}15`}/>
          <text x={70 + i * 108} y="140" textAnchor="middle" fontSize="9" fill={v.color} fontWeight="600" fontFamily="Inter,sans-serif">{v.bytes}</text>
        </g>
      ))}
      {step >= 5 && (
        <g>
          <rect x="20" y="200" width="420" height="32" rx="8" fill="rgba(37,99,235,0.08)" stroke="#2563EB" strokeWidth="1"/>
          <text x="230" y="221" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1D4ED8" fontFamily="Fira Code,monospace">$"Name: {'{'}name{'}'}, Age: {'{'}age{'}'}" → interpolated ✓</text>
        </g>
      )}
      {step === 0 && (
        <text x="230" y="150" textAnchor="middle" fontSize="13" fill="#94A3B8" fontFamily="Inter,sans-serif">Press ▶ to start adding variables</text>
      )}
    </svg>
  );
}

function FileIOViz({ step }) {
  const ops = [
    { icon: '📝', label: 'WriteAllText()', sub: 'Creates / overwrites file', color: '#2563EB' },
    { icon: '➕', label: 'AppendAllText()', sub: 'Adds to end of file', color: '#7C3AED' },
    { icon: '📖', label: 'ReadAllText()', sub: 'Reads entire file', color: '#059669' },
    { icon: '🗑', label: 'Delete()', sub: 'Removes file from disk', color: '#EF4444' },
  ];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      {/* File icon */}
      <rect x="185" y="30" width="90" height="110" rx="8" fill="white" stroke={step>=1?'#2563EB':'#E2E8F0'} strokeWidth="2"/>
      <polygon points="255,30 275,50 255,50" fill={step>=1?'#2563EB':'#E2E8F0'}/>
      <text x="230" y="80" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Fira Code,monospace">notes.txt</text>
      {step>=1&&<text x="230" y="98" textAnchor="middle" fontSize="9" fill="#334155" fontFamily="Fira Code,monospace">EduVerse Notes</text>}
      {step>=1&&<text x="230" y="113" textAnchor="middle" fontSize="9" fill="#334155" fontFamily="Fira Code,monospace">Lesson 1: Variables</text>}
      {step>=2&&<text x="230" y="128" textAnchor="middle" fontSize="9" fill="#7C3AED" fontFamily="Fira Code,monospace">Lesson 2: Loops</text>}

      {/* Operations */}
      {ops.slice(0, step).map((op, i) => (
        <g key={i}>
          <rect x={20+i*108} y="165" width="100" height="70" rx="10" fill="white" stroke={op.color} strokeWidth="1.5"/>
          <text x={70+i*108} y="188" textAnchor="middle" fontSize="18">{op.icon}</text>
          <text x={70+i*108} y="208" textAnchor="middle" fontSize="9" fontWeight="700" fill={op.color} fontFamily="Fira Code,monospace">{op.label}</text>
          <text x={70+i*108} y="224" textAnchor="middle" fontSize="8.5" fill="#64748B" fontFamily="Inter,sans-serif">{op.sub}</text>
        </g>
      ))}
      {step===0&&<text x="230" y="200" textAnchor="middle" fontSize="13" fill="#94A3B8" fontFamily="Inter,sans-serif">Press ▶ to start</text>}
    </svg>
  );
}

function DictionaryViz({ step }) {
  const entries = [
    { key: '"Alice"', val: '95', hash: '0x2A4F', color: '#2563EB' },
    { key: '"Bob"',   val: '88', hash: '0x1B3E', color: '#7C3AED' },
    { key: '"Eve"',   val: '92', hash: '0x3C5A', color: '#059669' },
  ];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      <text x="230" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">Hash Table — Dictionary&lt;string, int&gt;</text>
      {/* Buckets */}
      {[0,1,2,3].map(i=>(
        <g key={i}>
          <rect x="200" y={35+i*50} width="60" height="38" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5"/>
          <text x="230" y={59+i*50} textAnchor="middle" fontSize="10" fill="#94A3B8" fontFamily="Fira Code,monospace">Bucket {i}</text>
        </g>
      ))}
      {/* Entries */}
      {entries.slice(0, step).map((e,i)=>(
        <g key={i}>
          <rect x="20" y={35+i*75} width="150" height="50" rx="8" fill="white" stroke={e.color} strokeWidth="1.5"/>
          <text x="95" y={56+i*75} textAnchor="middle" fontSize="11" fontWeight="700" fill={e.color} fontFamily="Fira Code,monospace">{e.key}</text>
          <text x="95" y={74+i*75} textAnchor="middle" fontSize="9" fill="#64748B" fontFamily="Inter,sans-serif">hash → {e.hash}</text>
          <line x1="170" y1={60+i*75} x2="200" y2={60+i*75} stroke={e.color} strokeWidth="1.5" strokeDasharray="4,3"/>
          <rect x="260" y={35+i*75} width="170" height="50" rx="8" fill={`${e.color}15`} stroke={e.color} strokeWidth="1"/>
          <text x="345" y={56+i*75} textAnchor="middle" fontSize="11" fontWeight="700" fill={e.color} fontFamily="Fira Code,monospace">Value: {e.val}</text>
          <text x="345" y={74+i*75} textAnchor="middle" fontSize="9" fill="#64748B" fontFamily="Inter,sans-serif">O(1) lookup ✓</text>
        </g>
      ))}
      {step>=4&&<text x="230" y="265" textAnchor="middle" fontSize="10" fill="#10B981" fontWeight="600" fontFamily="Inter,sans-serif">TryGetValue: safe lookup — no exceptions ✓</text>}
    </svg>
  );
}

function ControlFlowViz({ step }) {
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      {/* if/else */}
      {step>=0&&<>
        <rect x="180" y="20" width="100" height="36" rx="8" fill="#2563EB"/>
        <text x="230" y="43" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">score=87</text>
        <line x1="230" y1="56" x2="230" y2="76" stroke="#2563EB" strokeWidth="2"/>
        <polygon points="230,76 220,56 240,56" fill="#2563EB"/>
        <rect x="155" y="76" width="150" height="36" rx="8" fill="white" stroke="#2563EB" strokeWidth="2"/>
        <text x="230" y="99" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2563EB" fontFamily="Fira Code,monospace">if score ≥ 90?</text>
      </>}
      {step>=0&&<>
        <line x1="155" y1="94" x2="80" y2="94" stroke="#EF4444" strokeWidth="2"/>
        <rect x="20" y="76" width="60" height="36" rx="8" fill="#EF4444"/>
        <text x="50" y="99" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">No→B</text>
        <line x1="305" y1="94" x2="360" y2="94" stroke="#10B981" strokeWidth="2"/>
        <rect x="360" y="76" width="60" height="36" rx="8" fill="#10B981"/>
        <text x="390" y="99" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">Yes→A</text>
      </>}
      {step>=1&&<>
        <rect x="130" y="136" width="200" height="36" rx="8" fill="#7C3AED"/>
        <text x="230" y="159" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">switch expression</text>
        <text x="230" y="192" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Fira Code,monospace">87 → grade = "B" ✓</text>
      </>}
      {step>=2&&<>
        <rect x="20" y="210" width="200" height="36" rx="8" fill="#059669"/>
        <text x="120" y="233" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">for i=0; i&lt;5; i++</text>
      </>}
      {step>=3&&<>
        <rect x="240" y="210" width="200" height="36" rx="8" fill="#D97706"/>
        <text x="340" y="233" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">foreach n in nums</text>
      </>}
    </svg>
  );
}

function MethodsViz({ step }) {
  const methods = [
    { sig: 'Add(int, int)', returns: '7', color: '#2563EB' },
    { sig: 'Add(double, double)', returns: '4.0', color: '#7C3AED' },
    { sig: 'Greet("Bob")', returns: '"Hello, Bob!"', color: '#059669' },
    { sig: 'Sum(1,2,3,4,5)', returns: '15', color: '#D97706' },
  ];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      <text x="230" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">Method Call Stack</text>
      {methods.slice(0, step).map((m,i)=>(
        <g key={i}>
          <rect x="40" y={36+i*56} width="200" height="44" rx="8" fill="white" stroke={m.color} strokeWidth="1.5"/>
          <text x="140" y={55+i*56} textAnchor="middle" fontSize="11" fontWeight="700" fill={m.color} fontFamily="Fira Code,monospace">{m.sig}</text>
          <text x="140" y={73+i*56} textAnchor="middle" fontSize="9" fill="#64748B" fontFamily="Inter,sans-serif">Returns: {m.returns}</text>
          <line x1="240" y1={58+i*56} x2="270" y2={58+i*56} stroke={m.color} strokeWidth="1.5" markerEnd={`url(#m-arr-${i})`}/>
          <defs><marker id={`m-arr-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={m.color}/></marker></defs>
          <rect x="270" y={40+i*56} width="100" height="36" rx="8" fill={`${m.color}15`} stroke={m.color} strokeWidth="1"/>
          <text x="320" y={63+i*56} textAnchor="middle" fontSize="14" fontWeight="800" fill={m.color} fontFamily="Fira Code,monospace">{m.returns}</text>
        </g>
      ))}
      {step===0&&<text x="230" y="150" textAnchor="middle" fontSize="13" fill="#94A3B8" fontFamily="Inter,sans-serif">Press ▶ to call methods</text>}
    </svg>
  );
}

function ArraysViz({ step }) {
  const arr = [78,85,88,92,96];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      <text x="230" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">int[] scores — Contiguous Memory</text>
      {arr.map((v,i)=>{
        const sorted = step>=1;
        const val = sorted ? arr[i] : [85,92,78,96,88][i];
        return (
          <g key={i}>
            <rect x={30+i*80} y="36" width="72" height="60" rx="8" fill={step>=2&&i===4?'#10B981':'white'} stroke={step>=2&&i===4?'#10B981':'#2563EB'} strokeWidth="2"/>
            <text x={66+i*80} y="62" textAnchor="middle" fontSize="16" fontWeight="800" fill={step>=2&&i===4?'white':'#0F172A'} fontFamily="Fira Code,monospace">{val}</text>
            <text x={66+i*80} y="86" textAnchor="middle" fontSize="10" fill="#94A3B8" fontFamily="Fira Code,monospace">[{i}]</text>
          </g>
        );
      })}
      {step>=2&&<text x="350" y="68" textAnchor="start" fontSize="12" fill="#10B981" fontWeight="700" fontFamily="Fira Code,monospace">← [^1]</text>}
      {step>=1&&<text x="230" y="120" textAnchor="middle" fontSize="10" fill="#2563EB" fontWeight="600" fontFamily="Inter,sans-serif">Array.Sort() → ascending order</text>}
      {step>=3&&(
        <g>
          <rect x="40" y="138" width="380" height="50" rx="8" fill="rgba(124,58,237,0.08)" stroke="#7C3AED" strokeWidth="1.5"/>
          <text x="230" y="158" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7C3AED" fontFamily="Fira Code,monospace">List&lt;string&gt; — dynamic, grows as needed</text>
          <text x="230" y="177" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="Inter,sans-serif">Add · Remove · Insert · Count</text>
        </g>
      )}
      {step>=4&&(
        <rect x="40" y="200" width="380" height="40" rx="8" fill="rgba(37,99,235,0.08)" stroke="#2563EB" strokeWidth="1"/>
      )}
      {step>=4&&<text x="230" y="225" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1D4ED8" fontFamily="Fira Code,monospace">.Where(s=&gt;s&gt;85).OrderByDescending()...</text>}
    </svg>
  );
}

function GroupByViz({ step }) {
  const depts = [
    { name:'CS',   students:['Alice 95','Bob 82','Sue 88'], avg:'88.3', color:'#2563EB' },
    { name:'Math', students:['Eve 90','Dan 78'],           avg:'84.0', color:'#7C3AED' },
  ];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      <text x="230" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">GroupBy(s =&gt; s.Dept)</text>
      {step>=1&&depts.map((d,di)=>(
        <g key={di}>
          <rect x={20+di*230} y="36" width="210" height={30+d.students.length*26} rx="10" fill="white" stroke={d.color} strokeWidth="2"/>
          <rect x={20+di*230} y="36" width="210" height="30" rx="10" fill={d.color}/>
          <rect x={20+di*230} y="54" width="210" height="12" fill={d.color}/>
          <text x={125+di*230} y="56" textAnchor="middle" fontSize="12" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">{d.name} Dept</text>
          {d.students.map((s,si)=>(
            <text key={si} x={125+di*230} y={78+si*26} textAnchor="middle" fontSize="11" fill="#334155" fontFamily="Fira Code,monospace">{s}</text>
          ))}
          {step>=2&&(
            <g>
              <rect x={30+di*230} y={36+30+d.students.length*26-4} width="190" height="28" rx="6" fill={`${d.color}15`}/>
              <text x={125+di*230} y={36+30+d.students.length*26+14} textAnchor="middle" fontSize="11" fontWeight="700" fill={d.color} fontFamily="Fira Code,monospace">Avg: {d.avg}</text>
            </g>
          )}
        </g>
      ))}
      {step>=3&&(
        <g>
          <rect x="60" y="230" width="340" height="36" rx="8" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1.5"/>
          <text x="230" y="253" textAnchor="middle" fontSize="11" fontWeight="600" fill="#065F46" fontFamily="Fira Code,monospace">Count=5, Max=95, Avg(all)=86.6</text>
        </g>
      )}
      {step===0&&<text x="230" y="150" textAnchor="middle" fontSize="13" fill="#94A3B8" fontFamily="Inter,sans-serif">Press ▶ to group students</text>}
    </svg>
  );
}

function StreamsViz({ step }) {
  const lines = ['[INFO]  App started', '[INFO]  Loading data...', '[WARN]  Cache miss'];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      <text x="230" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">Buffered Stream I/O</text>
      {/* StreamWriter */}
      {step>=1&&<rect x="20" y="36" width="120" height="36" rx="8" fill="#2563EB"/>}
      {step>=1&&<text x="80" y="59" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily="Fira Code,monospace">StreamWriter</text>}
      {/* Buffer */}
      {step>=1&&<rect x="160" y="36" width="130" height="36" rx="8" fill="white" stroke="#7C3AED" strokeWidth="2"/>}
      {step>=1&&<text x="225" y="59" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7C3AED" fontFamily="Fira Code,monospace">Buffer (4KB)</text>}
      {step>=1&&<line x1="140" y1="54" x2="160" y2="54" stroke="#2563EB" strokeWidth="2"/>}
      {/* Disk */}
      {step>=1&&<rect x="310" y="36" width="100" height="36" rx="8" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2"/>}
      {step>=1&&<text x="360" y="59" textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748B" fontFamily="Fira Code,monospace">💾 log.txt</text>}
      {step>=2&&<line x1="290" y1="54" x2="310" y2="54" stroke="#7C3AED" strokeWidth="2" strokeDasharray="4,3"/>}
      {/* Lines in file */}
      {step>=2&&lines.map((l,i)=>(
        <g key={i}>
          <rect x="20" y={100+i*42} width="420" height="32" rx="6" fill={l.includes('WARN')?'rgba(245,158,11,0.1)':'rgba(37,99,235,0.06)'} stroke={l.includes('WARN')?'#F59E0B':'#BFDBFE'} strokeWidth="1"/>
          <text x="36" y={121+i*42} fontSize="11" fontFamily="Fira Code,monospace" fill={l.includes('WARN')?'#92400E':'#1D4ED8'}>{l}</text>
        </g>
      ))}
      {step>=3&&<rect x="60" y="240" width="340" height="30" rx="8" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1.5"/>}
      {step>=3&&<text x="230" y="260" textAnchor="middle" fontSize="11" fontWeight="600" fill="#065F46" fontFamily="Fira Code,monospace">await ReadLineAsync() — non-blocking ✓</text>}
    </svg>
  );
}

function ParallelViz({ step }) {
  const threads = [0,1,2,3];
  return (
    <svg viewBox="0 0 460 280" className="viz-svg">
      <text x="230" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B" fontFamily="Inter,sans-serif">Parallel Execution — 4 Threads</text>
      {/* Sequential */}
      {step>=0&&(
        <g>
          <text x="14" y="52" fontSize="10" fontWeight="700" fill="#EF4444" fontFamily="Inter,sans-serif">Sequential (slow):</text>
          <rect x="14" y="58" width={step>=1?60:380} height="20" rx="4" fill="#EF4444" opacity="0.7"/>
          <text x="204" y="73" textAnchor="middle" fontSize="9" fill="white" fontFamily="Inter,sans-serif">Single thread</text>
        </g>
      )}
      {/* Parallel */}
      {step>=1&&threads.map(i=>(
        <g key={i}>
          <text x="14" y={102+i*38} fontSize="9" fontWeight="600" fill="#64748B" fontFamily="Inter,sans-serif">T{i+1}</text>
          <rect x="34" y={88+i*38} width={step>=2?200:0} height="22" rx="4" fill="#2563EB" opacity={0.7+i*0.07}/>
          {step>=2&&<text x="134" y={104+i*38} textAnchor="middle" fontSize="9" fill="white" fontFamily="Inter,sans-serif">Processing chunk {i+1}</text>}
        </g>
      ))}
      {step>=1&&<text x="14" y="88" fontSize="10" fontWeight="700" fill="#2563EB" fontFamily="Inter,sans-serif">Parallel (fast):</text>}
      {step>=3&&(
        <g>
          <rect x="14" y="245" width="430" height="28" rx="8" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1.5"/>
          <text x="229" y="264" textAnchor="middle" fontSize="11" fontWeight="600" fill="#065F46" fontFamily="Fira Code,monospace">.AsParallel().Where().Select() — PLINQ ✓</text>
        </g>
      )}
    </svg>
  );
}

// ─── Viz Router ─────────────────────────────────────────────
function VizComponent({ vizType, step, topic }) {
  const props = { step, topic };
  const map = {
    classObject:   ClassObjectViz,
    inheritance:   InheritanceViz,
    stack:         StackViz,
    linq:          LinqViz,
    async:         AsyncViz,
    encapsulation: EncapsulationViz,
    polymorphism:  PolymorphismViz,
    abstraction:   AbstractionViz,
    variables:     VariablesViz,
    fileio:        FileIOViz,
    dictionary:    DictionaryViz,
    controlflow:   ControlFlowViz,
    methods:       MethodsViz,
    arrays:        ArraysViz,
    groupby:       GroupByViz,
    streams:       StreamsViz,
    parallel:      ParallelViz,
  };
  const Comp = map[vizType];
  return Comp ? <Comp {...props} /> : <GenericViz {...props} />;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function CSharpLab() {
  const [level,    setLevel]    = useState('categories');
  const [category, setCategory] = useState(null);
  const [topic,    setTopic]    = useState(null);
  const [mode,     setMode]     = useState('learn');
  const [step,     setStep]     = useState(0);
  const [playing,  setPlaying]  = useState(false);

  // Auto-play
  useEffect(() => {
    if (!playing || !topic) return;
    if (step >= topic.steps - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 1300);
    return () => clearTimeout(t);
  }, [playing, step, topic]);

  const openCategory = useCallback((cat) => {
    setCategory(cat);
    setLevel('topics');
  }, []);

  const openTopic = useCallback((t) => {
    setTopic(t);
    setStep(0);
    setPlaying(false);
    setMode('learn');
    setLevel('concept');
  }, []);

  const goHome = () => { setLevel('categories'); setCategory(null); setTopic(null); };
  const goTopics = () => { setLevel('topics'); setTopic(null); };

  const sliderProgress = topic ? (step / (topic.steps - 1)) * 100 : 0;

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <div className="csharp-lab">

      {/* ─── BREADCRUMB ─── */}
      {level !== 'categories' && (
        <div className="cs-breadcrumb">
          <button className="cs-breadcrumb-btn" onClick={goHome}>
            <Home size={14}/> C# Lab
          </button>
          {level === 'topics' && (
            <><span className="cs-breadcrumb-sep">›</span>
            <span className="cs-breadcrumb-current">{category?.title}</span></>
          )}
          {level === 'concept' && (
            <>
              <span className="cs-breadcrumb-sep">›</span>
              <button className="cs-breadcrumb-btn" onClick={goTopics}>{category?.title}</button>
              <span className="cs-breadcrumb-sep">›</span>
              <span className="cs-breadcrumb-current">{topic?.title}</span>
            </>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════════════════
            LEVEL 1: CATEGORIES
            ══════════════════════════════════════════════ */}
        {level === 'categories' && (
          <motion.div key="categories" {...pageVariants}>
            <div className="cs-lab-header">
              <h1 className="cs-lab-title">⌨ C# Interactive Lab</h1>
              <p className="cs-lab-subtitle">
                Choose a module to begin. Visualize concepts, run code, and simulate execution step-by-step.
              </p>
            </div>
            <div className="cs-category-grid">
              {CSHARP_DATA.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  className="cs-category-card"
                  style={{ '--card-gradient': cat.gradient, '--card-color': cat.color }}
                  onClick={() => openCategory(cat)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.07 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="cs-category-glow" />
                  <div className="cs-category-icon">
                    <cat.Icon size={24} strokeWidth={2} />
                  </div>
                  <h3 className="cs-category-title">{cat.title}</h3>
                  <p className="cs-category-desc">{cat.description}</p>
                  <div className="cs-category-meta">
                    <span className="cs-category-count">{cat.topics.length} topics</span>
                    <span className="cs-category-enter">
                      Enter Module <ChevronRight size={14} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════
            LEVEL 2: TOPICS
            ══════════════════════════════════════════════ */}
        {level === 'topics' && category && (
          <motion.div key="topics" {...pageVariants}>
            <div className="cs-topics-header">
              <div className="cs-topics-icon" style={{ background: category.gradient }}>
                <category.Icon size={26} strokeWidth={2} color="white" />
              </div>
              <div>
                <h2 className="cs-topics-title">{category.title}</h2>
                <p className="cs-topics-desc">{category.description}</p>
              </div>
            </div>
            <div className="cs-topic-grid">
              {category.topics.map((t, idx) => (
                <motion.div
                  key={t.id}
                  className="cs-topic-card"
                  style={{ '--card-color': category.color }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.08 } }}
                >
                  <div className="cs-topic-num">Topic {idx + 1}</div>
                  <h3 className="cs-topic-title">{t.title}</h3>
                  <p className="cs-topic-preview">{t.preview}</p>
                  <div className="cs-topic-actions">
                    <button className="cs-btn-viz primary" onClick={() => openTopic(t)}>
                      <Eye size={14} /> Visualize
                    </button>
                    <button className="cs-btn-viz outline" onClick={() => openTopic(t)}>
                      <Terminal size={14} /> Practice Code
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════
            LEVEL 3: CONCEPT VIEW
            ══════════════════════════════════════════════ */}
        {level === 'concept' && topic && (
          <motion.div key="concept" {...pageVariants}>

            {/* Mode Bar */}
            <div className="cs-mode-bar">
              <span className="cs-mode-topic-name">{topic.title}</span>
              <div className="cs-mode-right">
                <span className="cs-mode-label">Mode:</span>
                <div className="cs-mode-toggle">
                  <button
                    className={`cs-mode-btn ${mode === 'learn' ? 'active' : ''}`}
                    onClick={() => setMode('learn')}
                  >
                    <BookOpen size={14} /> Learn
                  </button>
                  <button
                    className={`cs-mode-btn ${mode === 'simulate' ? 'active' : ''}`}
                    onClick={() => { setMode('simulate'); setStep(0); setPlaying(false); }}
                  >
                    <Monitor size={14} /> Simulate
                  </button>
                </div>
              </div>
            </div>

            {/* Split Pane: Code | Visualization */}
            <div className="cs-split-pane">

              {/* Code Panel */}
              <div className="cs-code-panel">
                <div className="cs-code-topbar">
                  <div className="cs-code-dots">
                    <span/><span/><span/>
                  </div>
                  <span className="cs-code-filename">Program.cs</span>
                  <span className="cs-code-lang">C#</span>
                </div>
                <pre className="cs-code-body">{topic.code}</pre>
              </div>

              {/* Visualization Panel */}
              <div className="cs-viz-panel">
                <div className="cs-viz-topbar">
                  <span className="cs-viz-title">
                    <span className="cs-viz-live-dot" style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:'#10B981', animation:'pulse-live 1.5s infinite' }}/>
                    Live Visualization
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 12px', background: 'rgba(37,99,235,0.08)', color: 'var(--cs-primary)', borderRadius: 20 }}>
                    Step {step + 1} / {topic.steps}
                  </span>
                </div>
                <div className="cs-viz-canvas">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                      <VizComponent vizType={topic.vizType} step={step} topic={topic} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Timeline Controls */}
            <div className="cs-timeline">
              <div className="cs-timeline-label">⏱ Execution Timeline</div>
              <div className="cs-timeline-controls">
                <button className="cs-tl-btn" title="Reset" onClick={() => { setStep(0); setPlaying(false); }}>
                  <RotateCcw size={15}/>
                </button>
                <button className="cs-tl-btn play-btn" title={playing ? 'Pause' : 'Play'} onClick={() => {
                  if (step >= topic.steps - 1) setStep(0);
                  setPlaying(p => !p);
                }}>
                  {playing ? <Pause size={15}/> : <Play size={15}/>}
                </button>
                <div className="cs-tl-slider-wrap">
                  <input
                    type="range"
                    className="cs-tl-slider"
                    min={0} max={topic.steps - 1}
                    value={step}
                    style={{ '--progress': `${sliderProgress}%` }}
                    onChange={e => { setStep(Number(e.target.value)); setPlaying(false); }}
                  />
                  <div className="cs-tl-steps">
                    {topic.stepLabels?.map((label, i) => (
                      <span key={i} className={`cs-tl-step-label ${i === step ? 'active' : ''}`}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Description */}
            {topic.stepDescriptions?.[step] && (
              <motion.div
                key={`desc-${step}`}
                className="cs-step-info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginTop: 16 }}
              >
                <h4>
                  <span className="cs-step-num-badge">{step + 1}</span>
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
