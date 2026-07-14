import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Trophy, Award, BookOpen, AlertCircle, Bookmark, Timer, CheckCircle2, 
  XCircle, ChevronLeft, ChevronRight, HelpCircle, Share2, Flame, ArrowLeft,
  Settings, Zap, Shield, Play
} from 'lucide-react';
import toast from 'react-hot-toast';

const SUBJECT_QUIZZES = {
  'FOC': [
    {
      id: 'foc-1',
      title: 'Computer Basics',
      desc: 'Introduction to hardware components, volatile/non-volatile memory, and bits.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['Hardware', 'Memory'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'fq1',
          type: 'mcq',
          question: 'Which component is commonly known as the brain of the computer?',
          code: null,
          options: { a: 'RAM', b: 'Hard Drive', c: 'Central Processing Unit (CPU)', d: 'Motherboard' },
          correct: 'c',
          topic: 'Hardware',
          explanation: 'The CPU performs all instructions and mathematical/logical tasks, acting as the primary thinking hub of the computer.'
        },
        {
          id: 'fq2',
          type: 'mcq',
          question: 'What is 1 Byte equivalent to?',
          code: null,
          options: { a: '4 bits', b: '8 bits', c: '16 bits', d: '1024 bits' },
          correct: 'b',
          topic: 'Hardware',
          explanation: '1 Byte is the standard unit of digital information storage made up of 8 individual bits.'
        },
        {
          id: 'fq3',
          type: 'mcq',
          question: 'Which of the following is an example of non-volatile memory?',
          code: null,
          options: { a: 'RAM', b: 'L1 Cache', c: 'ROM (Read Only Memory)', d: 'CPU Registers' },
          correct: 'c',
          topic: 'Memory',
          explanation: 'Non-volatile memory (like ROM, Flash, HDD) retains stored data even when the computer system is powered off.'
        }
      ]
    },
    {
      id: 'foc-2',
      title: 'Logic Gates & Arithmetic',
      desc: 'Boolean operations, XOR functions, and universal logic gate systems.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['Logic Gates', 'Binary'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'fq4',
          type: 'mcq',
          question: 'Which logic gate returns true only if all of its input lines are true?',
          code: null,
          options: { a: 'OR', b: 'AND', c: 'XOR', d: 'NAND' },
          correct: 'b',
          topic: 'Logic Gates',
          explanation: 'The AND gate logic requires all inputs (A and B) to be 1 (true) to output a 1.'
        },
        {
          id: 'fq5',
          type: 'mcq',
          question: 'What is the output of an XOR logic gate with inputs A=1 and B=1?',
          code: null,
          options: { a: '1 (true)', b: '0 (false)', c: 'Undefined', d: 'High Impedance' },
          correct: 'b',
          topic: 'Logic Gates',
          explanation: 'Exclusive OR (XOR) outputs true only when inputs differ (one is true, one is false). When both inputs are identical, the output is 0.'
        },
        {
          id: 'fq6',
          type: 'mcq',
          question: 'Which of the following is considered a Universal logic gate?',
          code: null,
          options: { a: 'AND', b: 'OR', c: 'NAND', d: 'NOT' },
          correct: 'c',
          topic: 'Logic Gates',
          explanation: 'NAND and NOR gates are universal gates because any other boolean logic function (AND, OR, NOT) can be constructed using only them.'
        }
      ]
    },
    {
      id: 'foc-3',
      title: 'Memory Org & CPU Scheduler',
      desc: 'Cache hierarchy, long-term schedulers, and program counter states.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['CPU Architecture', 'OS Scheduler'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'fq7',
          type: 'mcq',
          question: 'Which level of cache memory is closest to the CPU core and has the lowest latency?',
          code: null,
          options: { a: 'L1 Cache', b: 'L2 Cache', c: 'L3 Cache', d: 'System RAM' },
          correct: 'a',
          topic: 'CPU Architecture',
          explanation: 'L1 Cache is built directly inside the CPU core circuitry, providing the fastest access speeds, followed by L2 and L3 Cache.'
        },
        {
          id: 'fq8',
          type: 'mcq',
          question: 'What is the primary role of the Program Counter (PC) register?',
          code: null,
          options: { a: 'Stores execution speed stats', b: 'Holds the memory address of the next instruction to fetch and execute', c: 'Computes arithmetic results', d: 'Allocates memory stack ranges' },
          correct: 'b',
          topic: 'CPU Architecture',
          explanation: 'The PC register acts as an instruction pointer, holding the address of the next instruction in sequence to be fetched from memory.'
        },
        {
          id: 'fq9',
          type: 'mcq',
          question: 'Which operating system scheduler selects processes from pool storage to load into main memory?',
          code: null,
          options: { a: 'Short-term scheduler', b: 'Medium-term scheduler', c: 'Long-term scheduler', d: 'Thread scheduler' },
          correct: 'c',
          topic: 'OS Scheduler',
          explanation: 'The long-term (or job) scheduler determines process admission, selecting jobs from disk pool queues to be loaded into active RAM memory.'
        }
      ]
    }
  ],
  'Java': [
    {
      id: 'java-1',
      title: 'Java Fundamentals',
      desc: 'Introduction to data types, variable scopes, and operations.',
      difficulty: 'Easy',
      questionsCount: 5,
      estimatedTime: '5 mins',
      tags: ['Variables', 'Syntax'],
      bestScore: 80,
      lastScore: 60,
      completion: 100,
      status: 'Completed',
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Which of the following is NOT a primitive data type in Java?',
          code: null,
          options: { a: 'int', b: 'double', c: 'String', d: 'boolean' },
          correct: 'c',
          topic: 'Variables',
          explanation: 'String is a reference class type in Java (under java.lang package), not a primitive data type. Primitives include byte, short, int, long, float, double, char, and boolean.'
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What is the default value of a local object reference variable?',
          code: null,
          options: { a: 'null', b: 'undefined', c: 'garbage value', d: 'It does not have a default value and must be initialized before use.' },
          correct: 'd',
          topic: 'Variables',
          explanation: 'Local variables in Java are allocated on the stack and do not receive default values. You must explicitly initialize them before reading their value, or it results in a compile-time error.'
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'What will be the output of this code snippet?',
          code: `int x = 5;\nSystem.out.println(x++ + ++x);`,
          options: { a: '10', b: '12', c: '11', d: 'Compile Error' },
          correct: 'b',
          topic: 'Syntax',
          explanation: 'x++ returns the current value 5, then increments x to 6. ++x increments x from 6 to 7, then returns 7. Thus, 5 + 7 = 12.'
        },
        {
          id: 'q4',
          type: 'mcq',
          question: 'Which keyword is used to restrict inheritance of a class in Java?',
          code: null,
          options: { a: 'static', b: 'const', c: 'final', d: 'abstract' },
          correct: 'c',
          topic: 'Syntax',
          explanation: 'Declaring a class as "final" prevents it from being extended by any other subclasses (e.g., the String class is final).'
        },
        {
          id: 'q5',
          type: 'mcq',
          question: 'Which of these is checked at compile-time?',
          code: null,
          options: { a: 'RuntimeException', b: 'NullPointerException', c: 'IOException', d: 'ArrayIndexOutOfBoundsException' },
          correct: 'c',
          topic: 'Syntax',
          explanation: 'IOException is a Checked Exception, meaning the Java compiler forces developers to either catch or declare it in the method signature at compile-time.'
        }
      ]
    },
    {
      id: 'java-2',
      title: 'Object Oriented Programming',
      desc: 'Deep dive into polymorphism, abstract classes, interfaces, and encapsulation.',
      difficulty: 'Medium',
      questionsCount: 4,
      estimatedTime: '6 mins',
      tags: ['Polymorphism', 'Interfaces'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'q21',
          type: 'mcq',
          question: 'Can an interface have concrete methods in Java 8 and later?',
          code: null,
          options: { a: 'No, interfaces only have abstract declarations.', b: 'Yes, using the keywords default or static.', c: 'Yes, only using static.', d: 'Yes, but only if they are private.' },
          correct: 'b',
          topic: 'Interfaces',
          explanation: 'Java 8 introduced default and static interface methods to support interface extensions without breaking backward compatibility for older implementations.'
        },
        {
          id: 'q22',
          type: 'mcq',
          question: 'What is the output of this overloading test?',
          code: `class Parent {\n    void print() { System.out.print("P "); }\n}\nclass Child extends Parent {\n    void print() { System.out.print("C "); }\n}\nParent obj = new Child();\nobj.print();`,
          options: { a: 'P ', b: 'C ', c: 'P C ', d: 'Compile Error' },
          correct: 'b',
          topic: 'Polymorphism',
          explanation: 'This is runtime polymorphism (method overriding). Since the actual object instance created is Child, Child\'s print() method is executed at runtime.'
        },
        {
          id: 'q23',
          type: 'mcq',
          question: 'Which OOP concept is achieved by hiding internal data and requiring access via public getters/setters?',
          code: null,
          options: { a: 'Abstraction', b: 'Inheritance', c: 'Encapsulation', d: 'Polymorphism' },
          correct: 'c',
          topic: 'Polymorphism',
          explanation: 'Encapsulation wraps the variables and code together into a single unit, keeping fields private and exposing controlled public interface methods.'
        },
        {
          id: 'q24',
          type: 'mcq',
          question: 'Can you instantiate an abstract class in Java?',
          code: null,
          options: { a: 'Yes, using the new keyword.', b: 'No, abstract classes can never be instantiated directly.', c: 'Yes, by referencing its subclass.', d: 'Yes, but only through inheritance static helpers.' },
          correct: 'b',
          topic: 'Interfaces',
          explanation: 'Abstract classes are incomplete definitions and cannot be instantiated directly via "new". You can only instantiate concrete classes that extend them.'
        }
      ]
    },
    {
      id: 'java-3',
      title: 'Memory & Concurrency',
      desc: 'Garbage Collection pipelines, thread safety, and volatile registers.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['Garbage Collector', 'Multithreading'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'jq7',
          type: 'mcq',
          question: 'Where are objects allocated memory in Java runtime systems?',
          code: null,
          options: { a: 'Execution Stack', b: 'Method Area', c: 'Heap Memory', d: 'Thread Register registers' },
          correct: 'c',
          topic: 'Garbage Collector',
          explanation: 'Objects and their instance variables are allocated memory in the shared Heap region, while local reference pointers reside on the Stack.'
        },
        {
          id: 'jq8',
          type: 'mcq',
          question: 'Which keyword guarantees that thread writes to a variable are written directly to main memory, avoiding CPU register caching?',
          code: null,
          options: { a: 'synchronized', b: 'volatile', c: 'transient', d: 'final' },
          correct: 'b',
          topic: 'Multithreading',
          explanation: 'The volatile keyword ensures immediate visibility of variable writes across threads, skipping local CPU caches and reading/writing directly to main memory.'
        },
        {
          id: 'jq9',
          type: 'mcq',
          question: 'What is the purpose of the Stop-the-World phase in Java Garbage Collection?',
          code: null,
          options: { a: 'Saves active documents', b: 'Stops server requests permanently', c: 'Temporarily suspends application execution threads to safely perform garbage object audits', d: 'Compiles classes again' },
          correct: 'c',
          topic: 'Garbage Collector',
          explanation: 'Stop-the-World pauses all user execution threads so the GC process can safely reorganize reference graphs and remove garbage without reference states mutating.'
        }
      ]
    }
  ],
  'Advanced Java': [
    {
      id: 'advjava-1',
      title: 'Streams & Lambda Actions',
      desc: 'Intermediate vs terminal stream actions and Null checking.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['Streams API', 'Lambdas'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'ajq1',
          type: 'mcq',
          question: 'Which of the following is considered an intermediate Stream operation in Java?',
          code: null,
          options: { a: 'forEach', b: 'collect', c: 'map', d: 'count' },
          correct: 'c',
          topic: 'Streams API',
          explanation: 'Intermediate operations (like map, filter, sorted) transform streams and return new lazy Streams. Operations like collect and count are terminal.'
        },
        {
          id: 'ajq2',
          type: 'mcq',
          question: 'Does the forEach() operation on a Stream trigger execution of the stream pipeline?',
          code: null,
          options: { a: 'No, it is intermediate and lazy.', b: 'Yes, it is a terminal operation.', c: 'Only if parallel streams are used.', d: 'Only if it receives a consumer reference.' },
          correct: 'b',
          topic: 'Streams API',
          explanation: 'forEach is a terminal operation, meaning it executes all intermediate lazy computations and consumes the stream results.'
        },
        {
          id: 'ajq3',
          type: 'mcq',
          question: 'What is the result of Optional.ofNullable(null).orElse("Default")?',
          code: null,
          options: { a: 'Throws NullPointerException', b: 'null', c: '"Default"', d: 'Empty string' },
          correct: 'c',
          topic: 'Streams API',
          explanation: 'orElse() returns the specified fallback string if the Optional is empty, protecting against NullPointerExceptions.'
        }
      ]
    },
    {
      id: 'advjava-2',
      title: 'JDBC Connection Pools',
      desc: 'Understand JDBC architecture, statement types, and pooling.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['JDBC', 'SQL'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'q31',
          type: 'mcq',
          question: 'Which statement type is pre-compiled and helps prevent SQL Injection attacks?',
          code: null,
          options: { a: 'Statement', b: 'PreparedStatement', c: 'CallableStatement', d: 'ResultSet' },
          correct: 'b',
          topic: 'JDBC',
          explanation: 'PreparedStatement compiles the SQL template once and takes parameter markers (?). This isolates parameter values from query structure, blocking SQL injection.'
        },
        {
          id: 'q32',
          type: 'mcq',
          question: 'Which method is used to call stored procedures in database operations?',
          code: null,
          options: { a: 'prepareStatement()', b: 'createStatement()', c: 'prepareCall()', d: 'executeStoredProcedure()' },
          correct: 'c',
          topic: 'JDBC',
          explanation: 'The CallableStatement interface created via Connection.prepareCall() is designed to invoke SQL stored procedures containing IN, OUT, and INOUT parameter configurations.'
        },
        {
          id: 'q33',
          type: 'mcq',
          question: 'What is the main benefit of using a Connection Pool (like HikariCP)?',
          code: null,
          options: { a: 'Encrypts database payloads', b: 'Reuses existing connection channels to avoid expensive initial TCP handshakes', c: 'Speeds up SQL index building', d: 'Automatically formats queries' },
          correct: 'b',
          topic: 'JDBC',
          explanation: 'Creating connection threads is computationally expensive. Connection Pools maintain hot connections, recycling them to boost high-throughput database interaction speeds.'
        }
      ]
    },
    {
      id: 'advjava-3',
      title: 'Spring Framework Mechanics',
      desc: 'IOC, dependency injections, and bean scopes.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['Spring Core', 'Beans'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'ajq7',
          type: 'mcq',
          question: 'Which annotation registers a Java class as a generic Component bean candidate in Spring context?',
          code: null,
          options: { a: '@Bean', b: '@Service', c: '@Component', d: '@Autowired' },
          correct: 'c',
          topic: 'Spring Core',
          explanation: '@Component is the generic stereotype annotation indicating that a class is auto-detected and registered during Spring context component scans.'
        },
        {
          id: 'ajq8',
          type: 'mcq',
          question: 'Which bean scope instructs Spring to create a new separate instance for every single HTTP request?',
          code: null,
          options: { a: 'singleton', b: 'prototype', c: 'request', d: 'session' },
          correct: 'c',
          topic: 'Spring Core',
          explanation: 'The request scope instructs Spring to spawn a new instance of a bean for each HTTP request transaction. Singletons are global, prototypes spawn on context get request.'
        },
        {
          id: 'ajq9',
          type: 'mcq',
          question: 'Which meta-annotation integrates @Configuration, @EnableAutoConfiguration, and @ComponentScan?',
          code: null,
          options: { a: '@RestController', b: '@SpringBootApplication', c: '@EnableSpring', d: '@WebMvcTest' },
          correct: 'b',
          topic: 'Spring Core',
          explanation: '@SpringBootApplication is a convenience annotation that marks the main boot method, enabling autoconfiguration, component scan, and class configuration registers.'
        }
      ]
    }
  ],
  'Python': [
    {
      id: 'py-1',
      title: 'Lists & List Comprehensions',
      desc: 'Master pythonic iterations, comprehensions, and slicing scopes.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['Slicing', 'Comprehensions'],
      bestScore: 100,
      lastScore: 100,
      completion: 100,
      status: 'Completed',
      questions: [
        {
          id: 'q41',
          type: 'mcq',
          question: 'What does the slice list[::-1] evaluate to?',
          code: null,
          options: { a: 'Empties the array', b: 'Returns every other element', c: 'Reverses the array contents', d: 'Filters out duplicate values' },
          correct: 'c',
          topic: 'Slicing',
          explanation: 'Slicing with positive/negative steps [start:stop:step] reverses direction when the step is set to -1, returning a reversed copy of the list.'
        },
        {
          id: 'q42',
          type: 'mcq',
          question: 'What is the value of result in Python?',
          code: `nums = [1, 2, 3, 4]\nresult = [x * 2 for x in nums if x % 2 == 0]`,
          options: { a: '[2, 4, 6, 8]', b: '[4, 8]', c: '[2, 6]', d: '[2, 8]' },
          correct: 'b',
          topic: 'Comprehensions',
          explanation: 'The list comprehension filters nums to keep only even values (2, 4), then multiplies each by 2, resulting in [4, 8].'
        },
        {
          id: 'q43',
          type: 'mcq',
          question: 'What will be output by type( (1) ) and type( (1,) )?',
          code: null,
          options: { a: 'tuple, tuple', b: 'int, tuple', c: 'int, int', d: 'tuple, int' },
          correct: 'b',
          topic: 'Slicing',
          explanation: 'A single value inside parentheses (1) is evaluated as the value itself (integer). To instantiate a single-element tuple, a trailing comma is required (1,).'
        }
      ]
    },
    {
      id: 'py-2',
      title: 'Decorators & Closures',
      desc: 'Function wrappers, closure scopes, and exception blocks.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['Decorators', 'Syntax'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'pyq4',
          type: 'mcq',
          question: 'What is the primary role of a Python decorator?',
          code: null,
          options: { a: 'Deletes a function definition', b: 'Allows wrapping a function to modify its behavior dynamically without altering the original code structure', c: 'Speeds up execution of math loops', d: 'Compiles to binary files' },
          correct: 'b',
          topic: 'Decorators',
          explanation: 'Decorators wrap another function, allowing you to run execution code before/after the wrapped function executes, extending its behavior.'
        },
        {
          id: 'pyq5',
          type: 'mcq',
          question: 'Which keyword is used to create a generator function returning an iterator series?',
          code: null,
          options: { a: 'return', b: 'yield', c: 'generate', d: 'async' },
          correct: 'b',
          topic: 'Decorators',
          explanation: 'The yield keyword halts function execution temporarily, returning a value to the caller, and resumes state when the generator is iterated again.'
        },
        {
          id: 'pyq6',
          type: 'mcq',
          question: 'Which block in Python error handling is executed regardless of whether an exception is raised?',
          code: null,
          options: { a: 'except', b: 'else', c: 'finally', d: 'catch' },
          correct: 'c',
          topic: 'Syntax',
          explanation: 'The finally block executes cleanup instructions universally, regardless of whether exception errors occurred or were successfully handled.'
        }
      ]
    },
    {
      id: 'py-3',
      title: 'Generators & Metaclasses',
      desc: 'Class constructors, type overrides, and asyncio loops.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['Metaclasses', 'Concurrency'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'pyq7',
          type: 'mcq',
          question: 'What is the metaclass for all standard classes in Python?',
          code: null,
          options: { a: 'object', b: 'type', c: 'class', d: 'Meta' },
          correct: 'b',
          topic: 'Metaclasses',
          explanation: 'In Python, classes are themselves objects created by the "type" metaclass. Custom metaclasses extend type.'
        },
        {
          id: 'pyq8',
          type: 'mcq',
          question: 'Which function initializes and runs the event loop until a specified coroutine task finishes execution?',
          code: null,
          options: { a: 'asyncio.start()', b: 'asyncio.run()', c: 'loop.execute()', d: 'asyncio.await()' },
          correct: 'b',
          topic: 'Concurrency',
          explanation: 'asyncio.run() sets up the event loop, registers the root coroutine, runs it, and cleans up the loop afterwards.'
        },
        {
          id: 'pyq9',
          type: 'mcq',
          question: 'What is the purpose of declaring class variables using the `__slots__` attribute?',
          code: null,
          options: { a: 'Restricts variable type modifications', b: 'Instructs python to skip instance dictionary allocations (`__dict__`), saving memory', c: 'Encrypts class definitions', d: 'Creates private getters' },
          correct: 'b',
          topic: 'Metaclasses',
          explanation: 'Declaring `__slots__` tells Python to allocate static flat structures instead of dynamic dictionary hash maps, reducing memory size for millions of objects.'
        }
      ]
    }
  ],
  'C#': [
    {
      id: 'csharp-1',
      title: 'Types & Nullable Syntax',
      desc: 'Value types, reference types, and C# nullable types.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['Types', 'Syntax'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'csq1',
          type: 'mcq',
          question: 'Which of the following is considered a value type in C#?',
          code: null,
          options: { a: 'class', b: 'interface', c: 'struct', d: 'delegate' },
          correct: 'c',
          topic: 'Types',
          explanation: 'Structs and primitive types like int and bool are value types stored on the stack. Classes, interfaces, and delegates are reference types on the heap.'
        },
        {
          id: 'csq2',
          type: 'mcq',
          question: 'What is the default value of a boolean field variable in C#?',
          code: null,
          options: { a: 'null', b: 'true', c: 'false', d: '0' },
          correct: 'c',
          topic: 'Syntax',
          explanation: 'Boolean field variables in C# automatically initialize to false by default.'
        },
        {
          id: 'csq3',
          type: 'mcq',
          question: 'Which declaration indicates a nullable integer value type in C#?',
          code: null,
          options: { a: 'int?', b: 'Nullable(int)', c: 'int.Null', d: 'int!' },
          correct: 'a',
          topic: 'Syntax',
          explanation: 'Adding a question mark to a value type (int?) shorthand declares a Nullable<int> type which can accept null references.'
        }
      ]
    },
    {
      id: 'csharp-2',
      title: 'Properties & LINQ',
      desc: 'LINQ statements, properties, and multicast delegates.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['LINQ', 'Delegates'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'csq4',
          type: 'mcq',
          question: 'Which LINQ method filter keyword corresponds to a SQL WHERE query?',
          code: null,
          options: { a: 'Select', b: 'Where', c: 'Filter', d: 'Having' },
          correct: 'b',
          topic: 'LINQ',
          explanation: 'The LINQ Where operator filters sequence elements based on a conditional boolean predicate expression.'
        },
        {
          id: 'csq5',
          type: 'mcq',
          question: 'What is the default contextual parameter keyword name inside property setter blocks?',
          code: null,
          options: { a: 'input', b: 'setter', c: 'value', d: 'newValue' },
          correct: 'c',
          topic: 'LINQ',
          explanation: 'C# automatically binds incoming property mutation arguments to the implicit parameter named "value".'
        },
        {
          id: 'csq6',
          type: 'mcq',
          question: 'What occurs when a multicast delegate is invoked in C#?',
          code: null,
          options: { a: 'Executes a random target method', b: 'Executes all registered handler methods in chronological subscription order', c: 'Causes a compiler crash', d: 'Requires background threads' },
          correct: 'b',
          topic: 'Delegates',
          explanation: 'Multicast delegates support multiple method subscriptions, executing all handler methods sequentially in the invocation list.'
        }
      ]
    },
    {
      id: 'csharp-3',
      title: 'Tasks & GC Generations',
      desc: 'Task Parallel Library, unmanaged resources, and GC generations.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['GC', 'Tasks'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'csq7',
          type: 'mcq',
          question: 'Which class represents an asynchronous execution operation that returns a specific value?',
          code: null,
          options: { a: 'Thread', b: 'Task<TResult>', c: 'Action', d: 'AsyncResult' },
          correct: 'b',
          topic: 'Tasks',
          explanation: 'Task<TResult> represents an ongoing promise workflow, carrying its completed output payload on generic completion.'
        },
        {
          id: 'csq8',
          type: 'mcq',
          question: 'In .NET Garbage Collection architecture, what does Generation 0 hold?',
          code: null,
          options: { a: 'Large objects exceeding 85kb', b: 'Short-lived objects newly allocated in memory', c: 'Long-term static assets', d: 'Garbage roots waiting for compaction' },
          correct: 'b',
          topic: 'GC',
          explanation: 'Generation 0 contains young, short-lived objects. Surviving collections promote objects up to Gen 1 and eventually Gen 2.'
        },
        {
          id: 'csq9',
          type: 'mcq',
          question: 'Which syntax statement releases unmanaged resources automatically at scope exit?',
          code: null,
          options: { a: 'try-catch', b: 'using statement', c: 'dispose block', d: 'volatile lock' },
          correct: 'b',
          topic: 'GC',
          explanation: 'The using statement compiles to a try-finally block, ensuring Dispose() is called on IDisposable objects immediately when leaving the scope.'
        }
      ]
    }
  ],
  'DSA': [
    {
      id: 'dsa-e1',
      title: 'Linear Structures',
      desc: 'Arrays, search complexity, and LIFO/FIFO queues.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['Linear', 'Complexity'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'dsaq1',
          type: 'mcq',
          question: 'What is the time complexity of searching a value in an unsorted array of size N?',
          code: null,
          options: { a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N^2)' },
          correct: 'c',
          topic: 'Complexity',
          explanation: 'Searching in an unsorted array requires scanning elements one-by-one from index 0 up to N in the worst case (Linear Search, O(N)).'
        },
        {
          id: 'dsaq2',
          type: 'mcq',
          question: 'How many references (pointers) does a standard Doubly Linked List node contain?',
          code: null,
          options: { a: '1 pointer', b: '2 pointers (prev and next)', c: '3 pointers', d: 'None' },
          correct: 'b',
          topic: 'Linear',
          explanation: 'Each node in a doubly linked list links both forward (next) and backward (prev) to neighboring nodes.'
        },
        {
          id: 'dsaq3',
          type: 'mcq',
          question: 'Which data structure follows a Last-In, First-Out (LIFO) order?',
          code: null,
          options: { a: 'Queue', b: 'Stack', c: 'Binary Tree', d: 'Min Heap' },
          correct: 'b',
          topic: 'Linear',
          explanation: 'Stacks operate using LIFO logic, pushing/popping elements from the top of the stack. Queues use FIFO (First-In, First-Out).'
        }
      ]
    },
    {
      id: 'dsa-m1',
      title: 'Binary Trees & BSTs',
      desc: 'N-ary tree structure, search times, and traversal types.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['Trees', 'Complexity'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'dsaq4',
          type: 'mcq',
          question: 'What is the maximum number of children any node in a Binary Tree can have?',
          code: null,
          options: { a: '1 child', b: '2 children', c: 'Unlimited children', d: 'Based on node size' },
          correct: 'b',
          topic: 'Trees',
          explanation: 'Binary Trees restrict all node branches to a maximum degree of 2 (left and right).'
        },
        {
          id: 'dsaq5',
          type: 'mcq',
          question: 'What is the average-case time complexity of searching inside a balanced Binary Search Tree (BST)?',
          code: null,
          options: { a: 'O(N)', b: 'O(log N)', c: 'O(N log N)', d: 'O(1)' },
          correct: 'b',
          topic: 'Complexity',
          explanation: 'Balanced BST search rules cut search space in half at each depth level, resulting in logarithmic search times (O(log N)).'
        },
        {
          id: 'dsaq6',
          type: 'mcq',
          question: 'Which depth-first traversal strategy visits nodes in: Left, Root, Right sequence?',
          code: null,
          options: { a: 'Pre-order traversal', b: 'Post-order traversal', c: 'In-order traversal', d: 'Level-order traversal' },
          correct: 'c',
          topic: 'Trees',
          explanation: 'In-order traversal processes the left subtree, visits the root node, and then processes the right subtree. On BSTs, this yields sorted values.'
        }
      ]
    },
    {
      id: 'dsa-1',
      title: 'Sorting Algorithms',
      desc: 'Understand complexity limits of sorting models.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['Complexity', 'Algorithms'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'q51',
          type: 'mcq',
          question: 'What is the worst-case time complexity of Quick Sort?',
          code: null,
          options: { a: 'O(N log N)', b: 'O(N^2)', c: 'O(N)', d: 'O(log N)' },
          correct: 'b',
          topic: 'Complexity',
          explanation: 'Quick Sort degrades to O(N^2) complexity in cases where the selected pivot consistently cuts the array unbalanced (e.g., already sorted lists with first/last pivot elements).'
        },
        {
          id: 'q52',
          type: 'mcq',
          question: 'Which sorting model offers a guaranteed O(N log N) worst-case time and operates out-of-place?',
          code: null,
          options: { a: 'Bubble Sort', b: 'Insertion Sort', c: 'Merge Sort', d: 'Quick Sort' },
          correct: 'c',
          topic: 'Algorithms',
          explanation: 'Merge Sort divides the array into sublists, processes recursively, and merges them. It guarantees O(N log N) time complexity but requires auxiliary space proportional to list size.'
        },
        {
          id: 'q53',
          type: 'mcq',
          question: 'Is Bubble Sort a stable sorting algorithm?',
          code: null,
          options: { a: 'Yes, elements retain relative positions if values are equal.', b: 'No, it swaps values unpredictably.', c: 'Only if sorted in descending order.', d: 'Only for list sizes under 100.' },
          correct: 'a',
          topic: 'Algorithms',
          explanation: 'Stability means identical keys maintain chronological order. Bubble Sort only swaps if element values are strictly larger/smaller, preserving order when items are equal.'
        }
      ]
    }
  ],
  'DBMS': [
    {
      id: 'dbms-e1',
      title: 'Basic SQL Commands',
      desc: 'SQL filters, candidate keys, and relational joins.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['SQL', 'Syntax'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'dbq1',
          type: 'mcq',
          question: 'Which SQL clause is used to filter records from output results?',
          code: null,
          options: { a: 'WHERE', b: 'GROUP BY', c: 'ORDER BY', d: 'SELECT' },
          correct: 'a',
          topic: 'Syntax',
          explanation: 'The WHERE clause filters rows based on a specified boolean predicate condition before aggregation.'
        },
        {
          id: 'dbq2',
          type: 'mcq',
          question: 'What is the purpose of a Primary Key constraint?',
          code: null,
          options: { a: 'References another table', b: 'Allows duplicate nulls', c: 'Uniquely identifies each record/row in a table, enforcing uniqueness and non-null values', d: 'Index creation only' },
          correct: 'c',
          topic: 'SQL',
          explanation: 'Primary Keys uniquely identify rows, preventing duplicates and blocking NULL records.'
        },
        {
          id: 'dbq3',
          type: 'mcq',
          question: 'Which SQL join returns all records from both left and right tables regardless of matches?',
          code: null,
          options: { a: 'INNER JOIN', b: 'LEFT JOIN', c: 'RIGHT JOIN', d: 'FULL OUTER JOIN' },
          correct: 'd',
          topic: 'SQL',
          explanation: 'FULL OUTER JOIN merges left and right records, filling in NULLs on either side when match rows are absent.'
        }
      ]
    },
    {
      id: 'dbms-m1',
      title: 'SQL Grouping & Indexes',
      desc: 'HAVING statements, indexes, and ACID transactions.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['Transactions', 'SQL Keys'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'dbq4',
          type: 'mcq',
          question: 'Which SQL clause is used to filter group results created by a GROUP BY statement?',
          code: null,
          options: { a: 'WHERE', b: 'HAVING', c: 'FILTER', d: 'SELECT' },
          correct: 'b',
          topic: 'SQL Keys',
          explanation: 'WHERE filters rows before group aggregation. HAVING filters the completed group sets afterward.'
        },
        {
          id: 'dbq5',
          type: 'mcq',
          question: 'What is the primary benefit of creating an index on database tables?',
          code: null,
          options: { a: 'Protects table access security', b: 'Speeds up SELECT search query execution times', c: 'Reduces disk storage usage', d: 'Formats data attributes' },
          correct: 'b',
          topic: 'Transactions',
          explanation: 'Indexes create fast search trees (like B+ Trees), avoiding slow full-table scans for search criteria.'
        },
        {
          id: 'dbq6',
          type: 'mcq',
          question: 'What does the "I" represent in database transaction ACID properties?',
          code: null,
          options: { a: 'Integrity', b: 'Isolation', c: 'Inconsistency', d: 'Indexability' },
          correct: 'b',
          topic: 'Transactions',
          explanation: 'Isolation ensures concurrent transaction executions do not interfere with each other, producing identical states to sequential execution.'
        }
      ]
    },
    {
      id: 'dbms-1',
      title: 'SQL Normalization Levels',
      desc: 'Understand Normal Forms (1NF, 2NF, 3NF, BCNF).',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['Normalization', 'SQL Keys'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'q61',
          type: 'mcq',
          question: 'What is required for a table database to be in 2nd Normal Form (2NF)?',
          code: null,
          options: { a: 'Must resolve partial dependency issues.', b: 'Must eliminate transitive dependencies.', c: 'Must contain only atomic values.', d: 'Must reside in 1NF and resolve all partial functional dependencies on composite keys.' },
          correct: 'd',
          topic: 'Normalization',
          explanation: '2NF requires the database schema to be in 1NF and guarantees that all non-prime attributes depend entirely on the primary candidate key, eliminating partial dependencies.'
        },
        {
          id: 'q62',
          type: 'mcq',
          question: 'A table exhibits transitive dependency if A -> B and B -> C. Which normal form eliminates this?',
          code: null,
          options: { a: '1NF', b: '2NF', c: '3NF', d: '4NF' },
          correct: 'c',
          topic: 'Normalization',
          explanation: '3NF eliminates transitive dependencies (meaning a non-prime attribute depending on another non-prime attribute instead of directly on candidate keys).'
        },
        {
          id: 'q63',
          type: 'mcq',
          question: 'Which integrity rule guarantees that foreign keys always point to valid primary keys or contain null values?',
          code: null,
          options: { a: 'Entity Integrity Rule', b: 'Referential Integrity Rule', c: 'Domain Constraint Rule', d: 'Trigger Verification Rule' },
          correct: 'b',
          topic: 'SQL Keys',
          explanation: 'The Referential Integrity Rule states that every foreign key value must match an existing primary key value in its master table, maintaining lookup accuracy.'
        }
      ]
    }
  ],
  'Web Development': [
    {
      id: 'webdev-1',
      title: 'HTML & CSS Layouts',
      desc: 'Semantic tags, flexbox defaults, and z-index overlapping.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['HTML5', 'CSS Layout'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'wdq1',
          type: 'mcq',
          question: 'Which of the following is a semantic HTML5 block element?',
          code: null,
          options: { a: '<div>', b: '<span>', c: '<article>', d: '<b>' },
          correct: 'c',
          topic: 'HTML5',
          explanation: '<article> clearly describes its content role to browser and search engines, unlike generic <div> container tags.'
        },
        {
          id: 'wdq2',
          type: 'mcq',
          question: 'What is the default flex-direction setting in a CSS Flexbox container?',
          code: null,
          options: { a: 'column', b: 'row', c: 'row-reverse', d: 'wrap' },
          correct: 'b',
          topic: 'CSS Layout',
          explanation: 'By default, flex items lay out horizontally along the row axis unless configured otherwise.'
        },
        {
          id: 'wdq3',
          type: 'mcq',
          question: 'Which CSS property is used to control overlapping stacks of positioned elements?',
          code: null,
          options: { a: 'stack-order', b: 'z-index', c: 'layer-pos', d: 'float' },
          correct: 'b',
          topic: 'CSS Layout',
          explanation: 'z-index specifies the stack order of positioned elements (absolute, relative, fixed). Higher values render in front of lower values.'
        }
      ]
    },
    {
      id: 'webdev-2',
      title: 'JavaScript DOM & APIs',
      desc: 'JSON transformations, Native fetch, and Event Loops.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['JavaScript', 'DOM'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'wdq4',
          type: 'mcq',
          question: 'Which method transforms a JSON string back into a JavaScript object?',
          code: null,
          options: { a: 'JSON.stringify()', b: 'JSON.parse()', c: 'JSON.objectify()', d: 'Parse.JSON()' },
          correct: 'b',
          topic: 'JavaScript',
          explanation: 'JSON.parse() deserializes strings to objects, while JSON.stringify() compiles objects back to serialized strings.'
        },
        {
          id: 'wdq5',
          type: 'mcq',
          question: 'What is the role of the JavaScript Event Loop?',
          code: null,
          options: { a: 'Executes mathematical instructions', b: 'Monitors the call stack and message queues, processing tasks when stack threads clear', c: 'Forces page re-renders', d: 'Enables multicore calculations' },
          correct: 'b',
          topic: 'JavaScript',
          explanation: 'The Event Loop checks if the call stack is empty. If it is, it dequeues async callback events from the macro/micro task queues and executes them.'
        },
        {
          id: 'wdq6',
          type: 'mcq',
          question: 'Which built-in API method is used to make native promise-based HTTP network requests?',
          code: null,
          options: { a: 'xhr()', b: 'fetch()', c: 'request()', d: 'ajax()' },
          correct: 'b',
          topic: 'JavaScript',
          explanation: 'fetch() provides an modern, native Promise-based window global method to execute network calls, replacing legacy XMLHttpRequest APIs.'
        }
      ]
    },
    {
      id: 'webdev-3',
      title: 'React Core & Optimization',
      desc: 'Virtual DOM, expensive compute caching, and state updates.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['React', 'Optimizations'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'wdq7',
          type: 'mcq',
          question: 'What is the primary performance benefit of using a Virtual DOM in React?',
          code: null,
          options: { a: 'Enables offline data access', b: 'Batches changes and computes differential patches, minimizing slow direct DOM writes', c: 'Speeds up image loading processes', d: 'Bypasses javascript execution limits' },
          correct: 'b',
          topic: 'React',
          explanation: 'React compares Virtual DOM state trees via a diffing algorithm, making only the minimum necessary changes to the real DOM, boosting performance.'
        },
        {
          id: 'wdq8',
          type: 'mcq',
          question: 'Which React hook is used to cache (memoize) the result of expensive mathematical operations?',
          code: null,
          options: { a: 'useEffect', b: 'useCallback', c: 'useMemo', d: 'useRef' },
          correct: 'c',
          topic: 'Optimizations',
          explanation: 'useMemo memoizes computed values, only re-running calculations when dependency arrays change. useCallback memoizes the function reference itself.'
        },
        {
          id: 'wdq9',
          type: 'mcq',
          question: 'What occurs immediately when you trigger a state setter function in React?',
          code: null,
          options: { a: 'Clears storage databases', b: 'Schedules a component re-render phase in React loop queues', c: 'Deletes local cache pointers', d: 'Interrupts network requests' },
          correct: 'b',
          topic: 'React',
          explanation: 'State setter calls notify React that data has changed, scheduling a re-render of that component and its children to sync the UI.'
        }
      ]
    }
  ],
  'Mathematics': [
    {
      id: 'math-1',
      title: 'Linear Algebra basics',
      desc: 'Determinants, unit vectors, and transposes.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['Matrices', 'Vectors'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'mq1',
          type: 'mcq',
          question: 'What is the determinant of a 2x2 Identity Matrix?',
          code: null,
          options: { a: '0', b: '1', c: '2', d: '-1' },
          correct: 'b',
          topic: 'Matrices',
          explanation: 'The determinant of [[1, 0], [0, 1]] is (1*1 - 0*0) = 1.'
        },
        {
          id: 'mq2',
          type: 'mcq',
          question: 'What is a vector with a magnitude (length) equal to 1 called?',
          code: null,
          options: { a: 'Null vector', b: 'Unit vector', c: 'Eigenvector', d: 'Scalar vector' },
          correct: 'b',
          topic: 'Vectors',
          explanation: 'A unit vector has a length of exactly 1 unit, commonly used to denote direction.'
        },
        {
          id: 'mq3',
          type: 'mcq',
          question: 'If a matrix is symmetric, what is its transpose equal to?',
          code: null,
          options: { a: 'Identity matrix', b: 'The original matrix itself', c: 'Inverse matrix', d: 'Negative original matrix' },
          correct: 'b',
          topic: 'Matrices',
          explanation: 'A symmetric matrix satisfies A^T = A, meaning it is identical to its transpose.'
        }
      ]
    },
    {
      id: 'math-2',
      title: 'Calculus Rules',
      desc: 'Standard integration, derivatives, and product rule.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['Calculus', 'Derivatives'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'mq4',
          type: 'mcq',
          question: 'What is the derivative of sin(x) with respect to x?',
          code: null,
          options: { a: '-cos(x)', b: 'cos(x)', c: 'sin(x)', d: 'sec^2(x)' },
          correct: 'b',
          topic: 'Derivatives',
          explanation: 'd/dx(sin(x)) = cos(x). (d/dx(cos(x)) is -sin(x)).'
        },
        {
          id: 'mq5',
          type: 'mcq',
          question: 'What is the indefinite integral of 1/x with respect to x?',
          code: null,
          options: { a: 'x^0', b: 'ln|x| + C', c: '-1/x^2 + C', d: 'e^x + C' },
          correct: 'b',
          topic: 'Calculus',
          explanation: 'The anti-derivative of 1/x is the natural logarithm function ln|x| plus an integration constant C.'
        },
        {
          id: 'mq6',
          type: 'mcq',
          question: 'Which rule is used to differentiate a product of two functions (u * v)?',
          code: null,
          options: { a: 'Chain Rule', b: 'Quotient Rule', c: 'Product Rule', d: 'L\'Hopital\'s Rule' },
          correct: 'c',
          topic: 'Calculus',
          explanation: 'The Product Rule states that d/dx(u * v) = u * dv/dx + v * du/dx.'
        }
      ]
    },
    {
      id: 'math-3',
      title: 'Numerical Analysis',
      desc: 'Newton-Raphson, Simpson rule, and float errors.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['Numerical Integration', 'Root Finding'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'mq7',
          type: 'mcq',
          question: 'Which method approximates roots by calculating tangents to the curve?',
          code: null,
          options: { a: 'Bisection Method', b: 'Newton-Raphson Method', c: 'Simpson\'s Rule', d: 'Euler\'s Method' },
          correct: 'b',
          topic: 'Root Finding',
          explanation: 'Newton-Raphson uses tangent line intercepts (x_n1 = x_n - f(x_n)/f\'(x_n)) to find function roots.'
        },
        {
          id: 'mq8',
          type: 'mcq',
          question: 'What mathematical problem does Simpson\'s 1/3 Rule solve?',
          code: null,
          options: { a: 'Finding matrix determinants', b: 'Numerical Integration', c: 'Sorting datasets', d: 'Linear system equations' },
          correct: 'b',
          topic: 'Numerical Integration',
          explanation: 'Simpson\'s 1/3 Rule approximates definite integrals by fitting parabolas across intervals.'
        },
        {
          id: 'mq9',
          type: 'mcq',
          question: 'What is the primary error type in numerical iterations caused by limited machine decimal representation?',
          code: null,
          options: { a: 'Truncation Error', b: 'Round-off Error', c: 'Input Bias', d: 'Syntax Error' },
          correct: 'b',
          topic: 'Numerical Integration',
          explanation: 'Round-off error arises because computer hardware cannot store infinite decimal fractions, leading to small rounding discrepancies.'
        }
      ]
    }
  ],
  'Machine Learning': [
    {
      id: 'ml-1',
      title: 'Intro to ML',
      desc: 'Supervised vs Unsupervised models and best-fit lines.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['Supervised', 'Unsupervised'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'mlq1',
          type: 'mcq',
          question: 'Which task represents Supervised Learning?',
          code: null,
          options: { a: 'Grouping customers by purchasing behavior', b: 'Predicting house prices based on historical features', c: 'Reducing data dimensions', d: 'Market basket association analysis' },
          correct: 'b',
          topic: 'Supervised',
          explanation: 'Supervised learning requires labeled training data. Predicting house prices is a regression task utilizing labeled input records.'
        },
        {
          id: 'mlq2',
          type: 'mcq',
          question: 'K-Means clustering is an example of which learning style?',
          code: null,
          options: { a: 'Supervised Learning', b: 'Unsupervised Learning', c: 'Reinforcement Learning', d: 'Semi-supervised Learning' },
          correct: 'b',
          topic: 'Unsupervised',
          explanation: 'K-Means groups unlabeled datasets based on similarity patterns, representing unsupervised learning.'
        },
        {
          id: 'mlq3',
          type: 'mcq',
          question: 'What is the main goal of Simple Linear Regression?',
          code: null,
          options: { a: 'Construct classification trees', b: 'Find the line of best fit representing linear relationships between inputs and outputs', c: 'Cluster data centers', d: 'Optimize network weights' },
          correct: 'b',
          topic: 'Supervised',
          explanation: 'Linear regression models the relationship between dependent and independent variables by fitting a linear equation to observed data.'
        }
      ]
    },
    {
      id: 'ml-2',
      title: 'Evaluation & Overfitting',
      desc: 'Precision vs recall, L1/L2 regularization, and leaf nodes.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['Metrics', 'Regularization'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'mlq4',
          type: 'mcq',
          question: 'Which metric measures the ratio of true positives to all predicted positives?',
          code: null,
          options: { a: 'Recall', b: 'Precision', c: 'F1 Score', d: 'Accuracy' },
          correct: 'b',
          topic: 'Metrics',
          explanation: 'Precision = TP / (TP + FP), indicating the proportion of positive identifications that were actually correct.'
        },
        {
          id: 'mlq5',
          type: 'mcq',
          question: 'What problem does adding L1 (Lasso) or L2 (Ridge) regularization to model costs resolve?',
          code: null,
          options: { a: 'Underfitting', b: 'Overfitting', c: 'Data normalization', d: 'Missing attributes' },
          correct: 'b',
          topic: 'Regularization',
          explanation: 'Regularization penalizes large model weights, simplifying decision boundaries and preventing models from overfitting the training noise.'
        },
        {
          id: 'mlq6',
          type: 'mcq',
          question: 'What is a decision tree node called that has no children?',
          code: null,
          options: { a: 'Root node', b: 'Branch node', c: 'Leaf node', d: 'Internal node' },
          correct: 'c',
          topic: 'Metrics',
          explanation: 'Leaf nodes represent terminal decision outcomes, holding predicted values or classes without further branches.'
        }
      ]
    },
    {
      id: 'ml-3',
      title: 'Neural Networks & Adam',
      desc: 'Backpropagation, Softmax activations, and Adam optimization.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['Neural Networks', 'Optimizers'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'mlq7',
          type: 'mcq',
          question: 'Which algorithm computes loss function gradients to update weights in neural networks?',
          code: null,
          options: { a: 'Feedforward', b: 'Backpropagation', c: 'Principal Component Analysis', d: 'Stochastic Integration' },
          correct: 'b',
          topic: 'Neural Networks',
          explanation: 'Backpropagation calculates gradient error derivatives from the output layer backwards, enabling optimization steps.'
        },
        {
          id: 'mlq8',
          type: 'mcq',
          question: 'Which activation function is typically placed at the output layer of a multi-class neural network classifier?',
          code: null,
          options: { a: 'ReLU', b: 'Sigmoid', c: 'Softmax', d: 'Tanh' },
          correct: 'c',
          topic: 'Neural Networks',
          explanation: 'Softmax normalizes outputs into probability distributions summing to 1 across all target classes.'
        },
        {
          id: 'mlq9',
          type: 'mcq',
          question: 'Which description fits the Adam optimizer?',
          code: null,
          options: { a: 'Calculates simple gradients only', b: 'Combines gradient descent momentum with adaptive learning rates (RMSProp/AdaGrad)', c: 'Requires constant learning rates', d: 'Optimizes tree depths' },
          correct: 'b',
          topic: 'Optimizers',
          explanation: 'Adam (Adaptive Moment Estimation) tracks both first and second raw moment averages of gradients to scale step parameters dynamically.'
        }
      ]
    }
  ]
};;

// Mock student stats
const INITIAL_STATS = {
  totalAttempted: 4,
  totalSolved: 12,
  accuracy: 85,
  streak: 3,
  badges: ['Java Beginner', 'Python Explorer']
};

export default function QuizArena({ onExit }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState('Java');
  const [selectedMode, setSelectedMode] = useState('Practice'); // Practice, Exam, Challenge
  const [quizzes, setQuizzes] = useState(SUBJECT_QUIZZES['Java']);
  
  const quizId = searchParams.get('quiz');
  const selectedQuiz = quizzes.find(q => q.id === quizId) || null;
  const gameState = searchParams.get('state') || 'lobby';

  const setSelectedQuiz = (quiz) => {
    if (quiz) {
      setSearchParams({ module: 'quiz', quiz: quiz.id, state: 'lobby' });
    } else {
      setSearchParams({ module: 'quiz', state: 'lobby' });
    }
  };
  
  // Game states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionKey }
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // { questionId: true } (Practice mode immediate views)
  const [bookmarked, setBookmarked] = useState({}); // { questionId: true }
  
  // Timers
  const [timerLeft, setTimerLeft] = useState(300); // 5 mins in seconds
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef(null);

  // Stats
  const [stats, setStats] = useState(INITIAL_STATS);

  // Sync quizzes when subject changes
  useEffect(() => {
    setQuizzes(SUBJECT_QUIZZES[selectedSubject] || []);
    setSearchParams({ module: 'quiz', state: 'lobby' });
  }, [selectedSubject]);

  // Handle timer inside Exam/Challenge modes
  useEffect(() => {
    if (gameState === 'in-quiz') {
      setTimeTaken(0);
      setTimerLeft(selectedQuiz ? selectedQuiz.questions.length * 60 : 300);
      
      timerRef.current = setInterval(() => {
        setTimeTaken(prev => prev + 1);
        if (selectedMode !== 'Practice') {
          setTimerLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleSubmitQuiz(true); // Auto-submit on timeout
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState, selectedMode]);

  const handleStartQuiz = () => {
    if (!selectedQuiz) return;
    setAnswers({});
    setSubmittedAnswers({});
    setBookmarked({});
    setCurrentQuestionIdx(0);
    setSearchParams({ module: 'quiz', quiz: selectedQuiz.id, state: 'in-quiz' });
  };

  const handleOptionSelect = (optKey) => {
    if (gameState !== 'in-quiz') return;
    const currentQuestion = selectedQuiz.questions[currentQuestionIdx];
    
    // In practice mode, if already submitted this question, freeze option choice
    if (selectedMode === 'Practice' && submittedAnswers[currentQuestion.id]) {
      return;
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optKey
    }));
  };

  const handlePracticeSubmitQuestion = () => {
    const currentQuestion = selectedQuiz.questions[currentQuestionIdx];
    if (!answers[currentQuestion.id]) {
      toast.error('Please select an option first!');
      return;
    }
    setSubmittedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: true
    }));
  };

  const handleSubmitQuiz = (isTimeout = false) => {
    clearInterval(timerRef.current);
    if (isTimeout) {
      toast.error("Time's up! Submitting your answers.");
    } else {
      toast.success("Quiz submitted successfully!");
    }

    // Calculate score
    let correctCount = 0;
    selectedQuiz.questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / selectedQuiz.questions.length) * 100);
    
    // Update local quiz variables
    selectedQuiz.lastScore = percent;
    if (percent > selectedQuiz.bestScore) {
      selectedQuiz.bestScore = percent;
    }
    selectedQuiz.completion = 100;
    selectedQuiz.status = 'Completed';

    // Update global Stats
    setStats(prev => {
      const newAttempted = prev.totalAttempted + 1;
      const newSolved = prev.totalSolved + selectedQuiz.questions.length;
      const newAccuracy = Math.round((prev.accuracy * prev.totalAttempted + percent) / newAttempted);
      let newBadges = [...prev.badges];
      
      if (newAttempted >= 5 && !newBadges.includes('Quiz master')) {
        newBadges.push('Quiz master');
        toast.success("🏆 Unlocked new Badge: Quiz master!");
      }

      return {
        ...prev,
        totalAttempted: newAttempted,
        totalSolved: newSolved,
        accuracy: newAccuracy,
        badges: newBadges
      };
    });

    setSearchParams({ module: 'quiz', quiz: selectedQuiz.id, state: 'results' });
  };

  const toggleBookmark = (qId) => {
    setBookmarked(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
    toast.success(bookmarked[qId] ? 'Removed bookmark' : 'Bookmarked question for review');
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (diff === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  return (
    <div className="quiz-arena-container h-full flex flex-col relative overflow-y-auto">
      {/* Background canvas elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#06b6d4]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ───── LOBBY / QUIZ EXPLORER ───── */}
      {gameState === 'lobby' && (
        <div className="lobby-panel flex-1 flex flex-col justify-start">
          
          {/* Top Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-5 mt-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="lobby-title font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">Quiz Arena</h1>
              </div>
              <p className="text-slate-400 text-xs mt-1">Test your skills. Practice topics. Track progress.</p>
            </div>

            {/* Dropdown Filters & Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Select Subject</span>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="FOC">Fundamentals of Computing</option>
                  <option value="Java">Java Basics</option>
                  <option value="Advanced Java">Advanced Java</option>
                  <option value="Python">Python Modules</option>
                  <option value="C#">C# Programming</option>
                  <option value="DSA">Data Structures & Algorithms</option>
                  <option value="DBMS">Database Systems</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Machine Learning">Machine Learning</option>
                </select>
              </div>

              {/* Mode Selection */}
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Select Mode</span>
                <div className="flex bg-slate-900 border border-white/10 p-0.5 rounded-xl">
                  {['Practice', 'Exam', 'Challenge'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`quiz-mode-btn px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedMode === mode ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Chips */}
              <div className="flex gap-2 ml-auto md:ml-0 mt-3 md:mt-0">
                <div className="stat-chip bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Accuracy</span>
                  <span className="text-xs font-extrabold text-emerald-400">{stats.accuracy}%</span>
                </div>
                <div className="stat-chip bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Streak</span>
                  <span className="text-xs font-extrabold text-orange-400 flex items-center gap-0.5">
                    <Flame size={12} className="fill-orange-400" /> {stats.streak}d
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Area – Two Columns */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            
            {/* Left Column: Quiz List Panel (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-cyan-400" /> Available Quizzes ({quizzes.length})
              </h2>
              
              <div className="space-y-3 overflow-y-auto max-h-[380px] pr-2 scrollbar-thin">
                {quizzes.map((quiz) => {
                  const isSelected = selectedQuiz?.id === quiz.id;
                  return (
                    <div
                      key={quiz.id}
                      onClick={() => setSelectedQuiz(quiz)}
                      className={`quiz-card-item p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-500/10' 
                          : 'border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                        <span className="text-[10px] font-bold quiz-status-label">
                          {quiz.status}
                        </span>
                      </div>
                      
                      <h3 className="font-extrabold text-sm text-slate-100">{quiz.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{quiz.desc}</p>
                      
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                        <span>{quiz.questionsCount} Questions</span>
                        <span>{quiz.estimatedTime}</span>
                      </div>

                      {/* Completion Progress Bar */}
                      {quiz.completion > 0 && (
                        <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500" 
                            style={{ width: `${quiz.completion}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Quiz Details Panel (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              {selectedQuiz ? (
                <div className="quiz-detail-panel flex-1 p-6 rounded-2xl border border-white/5 bg-slate-900/20 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header Details */}
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selectedQuiz.tags.map((tag, idx) => (
                          <span key={idx} className="bg-slate-800 border border-white/5 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-xl font-black text-slate-100">{selectedQuiz.title}</h2>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedQuiz.desc}</p>
                    </div>

                    {/* Meta stats list */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg border border-white/5 text-cyan-400">
                          <Timer size={18} />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Time Allocated</div>
                          <div className="text-xs font-extrabold text-slate-200">{selectedQuiz.estimatedTime}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg border border-white/5 text-purple-400">
                          <HelpCircle size={18} />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Total Questions</div>
                          <div className="text-xs font-extrabold text-slate-200">{selectedQuiz.questionsCount} items</div>
                        </div>
                      </div>
                    </div>

                    {/* Past Scores Summary */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex justify-around">
                      <div className="text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Best Score</span>
                        <span className="text-sm font-extrabold text-cyan-400">{selectedQuiz.bestScore}%</span>
                      </div>
                      <div className="w-px bg-white/5" />
                      <div className="text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Last Attempt</span>
                        <span className="text-sm font-extrabold text-slate-300">{selectedQuiz.lastScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={handleStartQuiz}
                    className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-extrabold text-sm hover:scale-[1.01] transition-transform cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <Play size={16} fill="white" /> Start Quiz ({selectedMode} Mode)
                  </button>
                </div>
              ) : (
                <div className="quiz-detail-panel flex-1 p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center text-slate-500">
                  <HelpCircle size={48} className="text-slate-600 mb-3" />
                  <p className="text-sm font-bold">No Quiz Selected</p>
                  <p className="text-xs text-slate-500 mt-1">Pick a quiz from the list on the left to view details and launch the arena.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar – Live Stats */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6 text-[10px] text-slate-500">
            <span>Subject: <strong className="text-slate-300">{selectedSubject}</strong></span>
            <span>Available Quizzes: <strong className="text-slate-300">{quizzes.length}</strong></span>
            <span>Completed Badges: <strong className="text-cyan-400">{stats.badges.join(', ')}</strong></span>
          </div>
        </div>
      )}

      {/* ───── IN-QUIZ QUESTION VIEWER ───── */}
      {gameState === 'in-quiz' && (
        <div className="in-quiz-panel flex-1 flex flex-col justify-between p-4">
          
          {/* Top Breadcrumbs & Timers */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <span>Quiz Arena</span>
                <ChevronRight size={10} />
                <span>{selectedSubject}</span>
                <ChevronRight size={10} />
                <span className="text-cyan-400">{selectedQuiz.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400">
                Question {currentQuestionIdx + 1} of {selectedQuiz.questions.length}
              </span>
              
              {/* Timer for Exam and Challenge mode */}
              {selectedMode !== 'Practice' && (
                <div className="timer-badge flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-lg text-xs font-bold">
                  <Timer size={14} />
                  <span>{formatTimer(timerLeft)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Question workspace layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side: Question and options (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="quiz-question-box p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-500">Question {currentQuestionIdx + 1}</span>
                <h2 className="text-base font-extrabold text-slate-200 leading-relaxed">
                  {selectedQuiz.questions[currentQuestionIdx].question}
                </h2>

                {/* Formatted Code Block if question has code */}
                {selectedQuiz.questions[currentQuestionIdx].code && (
                  <pre className="p-4 rounded-xl bg-slate-950/80 border border-white/5 text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed">
                    <code>{selectedQuiz.questions[currentQuestionIdx].code}</code>
                  </pre>
                )}
              </div>

              {/* Options selection stack */}
              <div className="space-y-2">
                {Object.entries(selectedQuiz.questions[currentQuestionIdx].options).map(([key, value]) => {
                  const isSelected = answers[selectedQuiz.questions[currentQuestionIdx].id] === key;
                  const isSubmitted = submittedAnswers[selectedQuiz.questions[currentQuestionIdx].id];
                  const isCorrect = selectedQuiz.questions[currentQuestionIdx].correct === key;

                  let borderClass = 'border-white/5 bg-slate-900/20 hover:bg-slate-900/40';
                  if (isSelected) borderClass = 'border-cyan-500 bg-cyan-500/5';
                  if (isSubmitted) {
                    if (isCorrect) borderClass = 'border-emerald-500 bg-emerald-500/5';
                    else if (isSelected) borderClass = 'border-rose-500 bg-rose-500/5';
                  }

                  return (
                    <button
                      key={key}
                      disabled={isSubmitted}
                      onClick={() => handleOptionSelect(key)}
                      className={`quiz-option-btn w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${borderClass}`}
                    >
                      <span className={`quiz-option-letter w-6 h-6 rounded-lg text-xs font-black uppercase flex items-center justify-center ${
                        isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {key}
                      </span>
                      <span className="quiz-option-text text-sm font-semibold text-slate-300">{value}</span>
                      
                      {isSubmitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 ml-auto" />}
                      {isSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-400 ml-auto" />}
                    </button>
                  );
                })}
              </div>

              {/* Practice Mode immediate Explanation box */}
              {selectedMode === 'Practice' && submittedAnswers[selectedQuiz.questions[currentQuestionIdx].id] && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs text-slate-300 leading-relaxed"
                >
                  <div className="font-extrabold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Teacher's Explanation
                  </div>
                  {selectedQuiz.questions[currentQuestionIdx].explanation}
                </motion.div>
              )}
            </div>

            {/* Right side Info Column (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="quiz-stats-sidebar p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                <h4 className="text-[10px] text-slate-500 uppercase font-black">Question Stats</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Difficulty</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      selectedQuiz.questions[currentQuestionIdx].topic === 'Complexity' || selectedQuiz.questions[currentQuestionIdx].topic === 'Normalization' 
                        ? getDifficultyColor('Hard') 
                        : getDifficultyColor('Easy')
                    }`}>
                      {selectedQuiz.difficulty}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Topic Area</span>
                    <span className="text-slate-300 font-extrabold">{selectedQuiz.questions[currentQuestionIdx].topic}</span>
                  </div>
                </div>

                {/* Question operations */}
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => toggleBookmark(selectedQuiz.questions[currentQuestionIdx].id)}
                    className="flex-1 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bookmark size={14} className={bookmarked[selectedQuiz.questions[currentQuestionIdx].id] ? 'fill-cyan-400 text-cyan-400' : ''} />
                    Bookmark
                  </button>

                  <button
                    onClick={() => toast.success('Question flagged for review')}
                    className="py-2 px-3 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-rose-400 flex items-center justify-center cursor-pointer"
                  >
                    <AlertCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
            <button
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Middle Action button depending on mode */}
            {selectedMode === 'Practice' && !submittedAnswers[selectedQuiz.questions[currentQuestionIdx].id] ? (
              <button
                onClick={handlePracticeSubmitQuestion}
                className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md shadow-cyan-600/25 cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <div className="text-[11px] text-slate-500">
                {selectedMode === 'Practice' ? 'Answer Checked ✔' : 'Auto-saved'}
              </div>
            )}

            {currentQuestionIdx < selectedQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSubmitQuiz(false)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 cursor-pointer"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {/* ───── RESULTS & REVIEW SCREEN ───── */}
      {gameState === 'results' && (
        <div className="results-panel flex-1 flex flex-col justify-start p-4">
          
          {/* Top banner summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 rounded-3xl bg-slate-900/60 border border-white/5 mb-6 mt-2">
            
            {/* Left: Medal / Trophy display */}
            <div className="text-center md:text-left flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/10 mx-auto md:mx-0">
                <Trophy fill="white" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-100">Review Completed!</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Quiz: {selectedQuiz.title}</p>
              </div>
            </div>

            {/* Middle: Score stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-black block">Your Score</span>
                <span className="text-2xl font-black text-slate-200">
                  {Math.round(selectedQuiz.lastScore * selectedQuiz.questions.length / 100)} / {selectedQuiz.questions.length}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-black block">Accuracy</span>
                <span className="text-2xl font-black text-emerald-400">{selectedQuiz.lastScore}%</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleStartQuiz}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Back to Lobby
              </button>
            </div>
          </div>

          {/* Topic Performance Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
              <span className="text-[9px] text-emerald-400 uppercase font-black block mb-2">Strong Topics</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedQuiz.lastScore >= 60 ? (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-500/20">
                    {selectedQuiz.questions[0].topic} Basics (High Mastery)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Answer correctly to build strong topics.</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5">
              <span className="text-[9px] text-rose-400 uppercase font-black block mb-2">Needs Improvement</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedQuiz.lastScore < 80 ? (
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-rose-500/20">
                    {selectedQuiz.questions[0].topic} Operations (Focus Needed)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Excellent accuracy across all topics!</span>
                )}
              </div>
            </div>
          </div>

          {/* Per-Question Review List */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Per-Question Review</h3>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {selectedQuiz.questions.map((q, idx) => {
                const userAns = answers[q.id];
                const isCorrect = userAns === q.correct;
                
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Question {idx + 1}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isCorrect ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-200">{q.question}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Your Answer</span>
                        <span className={`font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({userAns || '-'}) {q.options[userAns] || 'Unanswered'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Correct Option</span>
                        <span className="font-semibold text-emerald-400">
                          ({q.correct}) {q.options[q.correct]}
                        </span>
                      </div>
                    </div>

                    {/* Explanations section */}
                    <div className="p-3 bg-slate-950 rounded-lg border border-white/5 text-[11px] text-slate-400 mt-2 leading-relaxed">
                      <strong className="text-cyan-400">Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
