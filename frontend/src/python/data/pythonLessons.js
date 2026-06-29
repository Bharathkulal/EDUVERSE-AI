/**
 * PYTHON LESSONS DATA
 * ─────────────────────────────────────────────
 * Each lesson object is self-contained.
 * To add lesson 11, just push a new object here — no component changes needed.
 *
 * Fields:
 *  id          - unique number
 *  slug        - URL-safe identifier  (used in /python/course/:slug)
 *  title       - displayed lesson title
 *  difficulty  - 'Beginner' | 'Intermediate' | 'Advanced'
 *  duration    - human-readable string
 *  xp          - XP reward for completing
 *  accent      - theme colour (hex)
 *  icon        - emoji icon
 *  description - short summary
 *  topics      - chip list shown on the card
 *  script      - AI teacher narration lines (array of {text, type})
 *  codeExamples- array of {title, code, explanation, output}
 *  quiz        - {mcq: [...], coding: [...]}
 *  summary     - wrap-up text
 */

export const PYTHON_LESSONS = [
  /* ─────────────── LESSON 1 ─────────────── */
  {
    id: 1,
    slug: 'python-fundamentals',
    title: 'Python Fundamentals',
    difficulty: 'Beginner',
    duration: '45 mins',
    xp: 100,
    accent: '#3B82F6',
    icon: '🐍',
    description: 'Begin your Python journey! Learn variables, data types, I/O and comments — the building blocks of every Python program.',
    topics: ['Variables', 'Data Types', 'Input & Output', 'Comments'],
    script: [
      { type: 'intro',    text: "Welcome to Python Fundamentals! I'm your AI teacher, and together we're going to learn Python — one of the most powerful and beginner-friendly languages in the world." },
      { type: 'concept',  text: "Let's start with variables. In Python, a variable is like a labelled box that stores a value. You simply write the name, an equals sign, and the value. Python figures out the type automatically!" },
      { type: 'code',     text: "Here's your first example. We declare three variables — name, age, and gpa — then print them using the print() function. Notice how clean and readable the code is!" },
      { type: 'explain',  text: "Python has several core data types: str for text, int for whole numbers, float for decimals, bool for True/False, and None for absence of value. You can check any type with the built-in type() function." },
      { type: 'warn',     text: "Watch out! Variable names must start with a letter or underscore, never a number. Also, Python is case-sensitive — 'Name' and 'name' are two different variables!" },
      { type: 'code',     text: "Now let's look at input and output. The input() function reads text from the user. Since it always returns a string, we use int() or float() to convert numbers." },
      { type: 'quiz',     text: "Quick check! What data type does the input() function always return? Think carefully before answering." },
      { type: 'congrats', text: "Excellent work! You've mastered the fundamentals. Variables, data types, input, output, and comments — you're already writing real Python code. Let's move on!" },
      { type: 'summary',  text: "In this lesson we covered: variables and assignment, Python's core data types (str, int, float, bool), the print() and input() functions, and how to add single and multi-line comments." }
    ],
    codeExamples: [
      {
        title: 'Variables & Data Types',
        code: `# Declare variables
name = "Alice"        # str  — text
age  = 20             # int  — whole number
gpa  = 9.5            # float — decimal
is_student = True     # bool  — True/False

# Print them
print(name)           # Alice
print(age)            # 20
print(type(gpa))      # <class 'float'>`,
        explanation: 'Python automatically infers the type from the value assigned.',
        output: 'Alice\n20\n<class \'float\'>'
      },
      {
        title: 'Input & Output',
        code: `# Read user input
name = input("Enter your name: ")
age  = int(input("Enter your age: "))

# Formatted output
print(f"Hello, {name}! You are {age} years old.")`,
        explanation: 'input() always returns a string. Wrap with int() or float() to convert.',
        output: 'Hello, Alice! You are 20 years old.'
      },
      {
        title: 'Comments',
        code: `# This is a single-line comment

"""
This is a multi-line comment (docstring).
Use it to describe functions or modules.
"""

x = 42  # inline comment`,
        explanation: 'Comments are ignored by Python — they help humans understand the code.',
        output: '(no output — comments are not executed)'
      }
    ],
    quiz: {
      mcq: [
        {
          id: 'q1', question: 'What does the input() function always return?',
          options: ['int', 'float', 'str', 'bool'], correct: 'str',
          explanation: 'input() always returns a string. You must cast it to int/float manually.'
        },
        {
          id: 'q2', question: 'Which of the following is a valid variable name in Python?',
          options: ['2name', '_myVar', 'class', 'my-var'], correct: '_myVar',
          explanation: 'Variable names can contain letters, digits, and underscores but cannot start with a digit or be a reserved keyword.'
        },
        {
          id: 'q3', question: 'What is the output of: print(type(3.14))?',
          options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'double'>"], correct: "<class 'float'>",
          explanation: '3.14 is a floating-point literal, so its type is float.'
        },
        {
          id: 'q4', question: 'Which symbol is used for single-line comments in Python?',
          options: ['//', '#', '--', '/* */'], correct: '#',
          explanation: 'Python uses # for single-line comments.'
        },
        {
          id: 'q5', question: 'What is the value of: bool(0)?',
          options: ['True', 'False', '0', 'None'], correct: 'False',
          explanation: '0 is falsy in Python. bool(0) evaluates to False.'
        }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Type Converter',
          description: 'Write a program that reads a number from the user and prints its integer and float versions.',
          starterCode: `# Read a number from the user
num = input("Enter a number: ")

# TODO: Print int version and float version
`,
          solution: `num = input("Enter a number: ")
print(int(float(num)))
print(float(num))`
        },
        {
          id: 'c2',
          title: 'Personal Info Printer',
          description: 'Ask the user for their name and age. Print a greeting using an f-string.',
          starterCode: `# Read name and age
name = input("Name: ")
age  = int(input("Age: "))

# TODO: Print: Hello, <name>! You are <age> years old.
`,
          solution: `name = input("Name: ")
age = int(input("Age: "))
print(f"Hello, {name}! You are {age} years old.")`
        }
      ]
    },
    summary: 'You\'ve completed Python Fundamentals! You can now declare variables, use Python\'s core data types, read user input, display output with print(), and write helpful comments. These are the foundations every Python developer builds upon.'
  },

  /* ─────────────── LESSON 2 ─────────────── */
  {
    id: 2,
    slug: 'operators-and-expressions',
    title: 'Operators & Expressions',
    difficulty: 'Beginner',
    duration: '35 mins',
    xp: 100,
    accent: '#06B6D4',
    icon: '➕',
    description: 'Master Python\'s operators to build powerful expressions — arithmetic, comparison, logical, and assignment.',
    topics: ['Arithmetic Operators', 'Logical Operators', 'Comparison Operators', 'Assignment Operators'],
    script: [
      { type: 'intro',   text: "Operators are the verbs of programming — they tell Python what to DO with your data. Let's explore all the operators Python gives us." },
      { type: 'concept', text: "Arithmetic operators work just like math: + adds, - subtracts, * multiplies, / divides. But Python has two special ones: // for integer division and % for the remainder (modulo)." },
      { type: 'code',    text: "Let's see arithmetic in action. Notice that 7 divided by 2 gives 3.5 in Python 3, but 7 // 2 gives 3 — dropping the decimal." },
      { type: 'concept', text: "Comparison operators return True or False. They compare two values: == for equality, != for not equal, < > for less/greater than." },
      { type: 'concept', text: "Logical operators combine boolean expressions: 'and' requires both to be True, 'or' requires at least one, and 'not' flips the result." },
      { type: 'warn',    text: "A very common mistake: confusing = (assignment) with == (comparison). Writing if x = 5 is a syntax error — always use == inside conditions!" },
      { type: 'quiz',    text: "What is the result of 17 % 5? Remember, modulo gives you the remainder." },
      { type: 'summary', text: "Great job! You now understand all Python operators — arithmetic, comparison, logical, and assignment. Operators are everywhere in Python programs." }
    ],
    codeExamples: [
      {
        title: 'Arithmetic Operators',
        code: `a, b = 17, 5

print(a + b)   # 22  — addition
print(a - b)   # 12  — subtraction
print(a * b)   # 85  — multiplication
print(a / b)   # 3.4 — true division
print(a // b)  # 3   — floor division
print(a % b)   # 2   — modulo (remainder)
print(a ** b)  # 1419857 — exponentiation`,
        explanation: '// floors the result; % gives the remainder; ** raises to a power.',
        output: '22\n12\n85\n3.4\n3\n2\n1419857'
      },
      {
        title: 'Comparison & Logical',
        code: `x, y = 10, 20

print(x == y)          # False
print(x != y)          # True
print(x < y)           # True
print(x >= 10)         # True

print(x > 5 and y > 5) # True
print(x > 15 or y > 15)# True
print(not (x == y))    # True`,
        explanation: 'Comparison operators return booleans. Logical operators combine them.',
        output: 'False\nTrue\nTrue\nTrue\nTrue\nTrue\nTrue'
      },
      {
        title: 'Assignment Operators',
        code: `n = 10
n += 5   # n = n + 5  → 15
n -= 3   # n = n - 3  → 12
n *= 2   # n = n * 2  → 24
n //= 4  # n = n // 4 → 6
n **= 2  # n = n ** 2 → 36
print(n) # 36`,
        explanation: 'Augmented assignment operators are shorthand for update operations.',
        output: '36'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What does 17 % 5 evaluate to?', options: ['3', '2', '3.4', '0'], correct: '2', explanation: 'Modulo gives the remainder: 17 = 5*3 + 2, so 17 % 5 = 2.' },
        { id: 'q2', question: 'Which operator is used for exponentiation in Python?', options: ['^', '**', 'pow', '//'], correct: '**', explanation: '** is Python\'s exponentiation operator. 2**3 = 8.' },
        { id: 'q3', question: 'What is the result of: True and False?', options: ['True', 'False', 'None', 'Error'], correct: 'False', explanation: 'and requires both operands to be True. Since one is False, the result is False.' },
        { id: 'q4', question: 'What does // do?', options: ['True division', 'Floor division', 'Modulo', 'Exponent'], correct: 'Floor division', explanation: '// performs integer (floor) division, discarding the fractional part.' },
        { id: 'q5', question: 'What is wrong with: if x = 5:?', options: ['Nothing', 'Should use ==', 'Should use ===', 'Should use !='], correct: 'Should use ==', explanation: '= is assignment; == is comparison. Conditions require ==.' }
      ],
      coding: [
        { id: 'c1', title: 'Calculator', description: 'Write a program that takes two numbers and prints: sum, difference, product, quotient, and remainder.', starterCode: `a = int(input("Enter first number: "))
b = int(input("Enter second number: "))
# TODO: print sum, difference, product, quotient, remainder
`, solution: `a = int(input("Enter first number: "))
b = int(input("Enter second number: "))
print(a + b, a - b, a * b, a / b, a % b)` },
        { id: 'c2', title: 'Even or Odd', description: 'Read a number. Print "Even" if divisible by 2, else print "Odd".', starterCode: `n = int(input("Number: "))
# TODO: use % to check even/odd
`, solution: `n = int(input("Number: "))
print("Even" if n % 2 == 0 else "Odd")` }
      ]
    },
    summary: 'You\'ve mastered Python operators! Arithmetic, comparison, logical, and assignment operators form the backbone of all Python expressions and logic.'
  },

  /* ─────────────── LESSON 3 ─────────────── */
  {
    id: 3,
    slug: 'conditional-statements',
    title: 'Conditional Statements',
    difficulty: 'Beginner',
    duration: '40 mins',
    xp: 120,
    accent: '#10B981',
    icon: '🔀',
    description: 'Make decisions in your code using if, elif, and else. Learn nested conditions and real-world branching logic.',
    topics: ['if', 'else', 'elif', 'Nested Conditions'],
    script: [
      { type: 'intro',   text: "Every program needs to make decisions. That's what conditional statements do — they let your code choose different paths based on conditions." },
      { type: 'concept', text: "The if statement runs a block only if a condition is True. The else block runs when the condition is False. The elif (else-if) lets you chain multiple conditions." },
      { type: 'code',    text: "Here's a grade calculator. Based on the score, we use if/elif/else to print a letter grade. Notice Python uses indentation — 4 spaces — to define blocks. No curly braces needed!" },
      { type: 'warn',    text: "Indentation is critical in Python! A wrong indent is a syntax error. Always use 4 spaces (or a consistent tab) per level of nesting." },
      { type: 'concept', text: "Nested conditions are if statements inside other if statements. They're powerful but can get hard to read — use elif to flatten the logic when possible." },
      { type: 'quiz',    text: "If score is 75, which condition in if score >= 90: elif score >= 75: else: would match?" },
      { type: 'summary', text: "Perfect! You can now branch your Python programs using if, elif, and else. These are the decision-makers of every program you'll ever write." }
    ],
    codeExamples: [
      {
        title: 'if / elif / else',
        code: `score = 82

if score >= 90:
    grade = 'A'
elif score >= 75:
    grade = 'B'
elif score >= 60:
    grade = 'C'
else:
    grade = 'F'

print(f"Grade: {grade}")  # Grade: B`,
        explanation: 'Python evaluates conditions top-down and runs the first matching block.',
        output: 'Grade: B'
      },
      {
        title: 'Nested Conditions',
        code: `age = 20
has_id = True

if age >= 18:
    if has_id:
        print("Access granted")
    else:
        print("ID required")
else:
    print("Underage — access denied")`,
        explanation: 'Nested ifs check conditions within conditions. Flatten with elif when possible.',
        output: 'Access granted'
      },
      {
        title: 'Ternary / One-liner',
        code: `x = 7
result = "Odd" if x % 2 != 0 else "Even"
print(result)  # Odd`,
        explanation: 'Python\'s ternary expression: value_if_true if condition else value_if_false',
        output: 'Odd'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What keyword is used for "else if" in Python?', options: ['elseif', 'elsif', 'elif', 'else if'], correct: 'elif', explanation: 'Python uses elif (not "else if" or "elseif") for chained conditions.' },
        { id: 'q2', question: 'What defines a block in Python?', options: ['Curly braces {}', 'begin/end keywords', 'Indentation', 'Parentheses ()'], correct: 'Indentation', explanation: 'Python uses indentation (typically 4 spaces) to define code blocks.' },
        { id: 'q3', question: 'What is the output of: x = 5; print("High" if x > 3 else "Low")?', options: ['Low', 'High', 'True', 'Error'], correct: 'High', explanation: '5 > 3 is True, so the ternary returns "High".' },
        { id: 'q4', question: 'Can an if statement exist without an else?', options: ['No', 'Yes', 'Only with elif', 'Only in functions'], correct: 'Yes', explanation: 'else is optional. An if block can stand alone.' },
        { id: 'q5', question: 'How many elif blocks can you have?', options: ['Only 1', 'Only 2', 'Up to 10', 'Unlimited'], correct: 'Unlimited', explanation: 'You can chain as many elif blocks as needed.' }
      ],
      coding: [
        { id: 'c1', title: 'Grade Calculator', description: 'Read a score (0–100) and print A (>=90), B (>=75), C (>=60), or F.', starterCode: `score = int(input("Score: "))
# TODO: print the grade
`, solution: `score = int(input("Score: "))
if score >= 90: print("A")
elif score >= 75: print("B")
elif score >= 60: print("C")
else: print("F")` },
        { id: 'c2', title: 'Login Check', description: 'Check if username is "admin" AND password is "1234". Print "Login successful" or "Invalid credentials".', starterCode: `username = input("Username: ")
password = input("Password: ")
# TODO: check credentials
`, solution: `username = input("Username: ")
password = input("Password: ")
if username == "admin" and password == "1234":
    print("Login successful")
else:
    print("Invalid credentials")` }
      ]
    },
    summary: 'Conditional statements are the decision-making heart of Python. You now know how to use if, elif, else, nested conditions, and the one-line ternary operator.'
  },

  /* ─────────────── LESSON 4 ─────────────── */
  {
    id: 4,
    slug: 'loops',
    title: 'Loops',
    difficulty: 'Beginner',
    duration: '50 mins',
    xp: 150,
    accent: '#8B5CF6',
    icon: '🔁',
    description: 'Automate repetitive tasks using for and while loops. Control loop flow with break, continue, and pass.',
    topics: ['for', 'while', 'break', 'continue', 'pass'],
    script: [
      { type: 'intro',   text: "Loops are Python's superpower for automation. Instead of writing the same line 100 times, you write a loop that repeats it for you." },
      { type: 'concept', text: "The for loop iterates over any sequence — a list, a string, or a range of numbers. range(n) generates numbers from 0 to n-1." },
      { type: 'code',    text: "Here's a for loop printing numbers 1 to 5 using range(1, 6). Notice range's second argument is exclusive — it stops before 6." },
      { type: 'concept', text: "The while loop runs as long as a condition is True. Be careful: if the condition never becomes False, you get an infinite loop!" },
      { type: 'concept', text: "break exits the loop immediately. continue skips the current iteration and goes to the next. pass is a placeholder — it does nothing but prevents empty block errors." },
      { type: 'warn',    text: "Infinite loops are a beginner trap! Always make sure the while condition will eventually become False, or include a break statement." },
      { type: 'quiz',    text: "What is the output of: for i in range(2, 8, 2): print(i)? Think about start, stop, and step." },
      { type: 'summary', text: "You now command Python's loop structures! for loops, while loops, and the control keywords break, continue, and pass give you complete control over repetition." }
    ],
    codeExamples: [
      {
        title: 'for Loop with range()',
        code: `# Print 1 to 5
for i in range(1, 6):
    print(i)

# Sum with for loop
total = 0
for n in [10, 20, 30]:
    total += n
print(f"Sum: {total}")  # Sum: 60`,
        explanation: 'range(start, stop, step) — stop is exclusive. Lists can be iterated directly.',
        output: '1\n2\n3\n4\n5\nSum: 60'
      },
      {
        title: 'while Loop',
        code: `count = 1
while count <= 5:
    print(f"Count: {count}")
    count += 1  # IMPORTANT: update the counter!

print("Done")`,
        explanation: 'while runs until the condition becomes False. Always update the condition variable!',
        output: 'Count: 1\nCount: 2\nCount: 3\nCount: 4\nCount: 5\nDone'
      },
      {
        title: 'break / continue / pass',
        code: `# break — exit loop early
for i in range(10):
    if i == 5:
        break
    print(i)  # prints 0–4

# continue — skip current iteration
for i in range(5):
    if i == 2:
        continue
    print(i)  # prints 0,1,3,4

# pass — placeholder
for i in range(3):
    pass  # TODO: add logic later`,
        explanation: 'break exits; continue skips; pass is a no-op placeholder.',
        output: '0\n1\n2\n3\n4\n0\n1\n3\n4'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What does range(2, 8, 2) generate?', options: ['2,4,6,8', '2,4,6', '2,3,4,5,6,7', '0,2,4,6'], correct: '2,4,6', explanation: 'range(start=2, stop=8, step=2) → 2, 4, 6. Stop (8) is exclusive.' },
        { id: 'q2', question: 'Which statement immediately exits a loop?', options: ['exit', 'stop', 'break', 'return'], correct: 'break', explanation: 'break immediately terminates the nearest enclosing loop.' },
        { id: 'q3', question: 'What does continue do?', options: ['Exits loop', 'Restarts program', 'Skips current iteration', 'Pauses loop'], correct: 'Skips current iteration', explanation: 'continue skips the rest of the current iteration and moves to the next.' },
        { id: 'q4', question: 'What is the risk with a while loop?', options: ['Slow compilation', 'Infinite loop', 'Memory leak', 'Type error'], correct: 'Infinite loop', explanation: 'If the while condition never becomes False, the loop runs forever.' },
        { id: 'q5', question: 'What does pass do?', options: ['Exits function', 'Skips iteration', 'Does nothing (placeholder)', 'Prints blank line'], correct: 'Does nothing (placeholder)', explanation: 'pass is a no-operation statement used as a placeholder in empty blocks.' }
      ],
      coding: [
        { id: 'c1', title: 'Multiplication Table', description: 'Print the multiplication table for a given number (1 to 10).', starterCode: `n = int(input("Number: "))
# TODO: print n*1 through n*10
`, solution: `n = int(input("Number: "))
for i in range(1, 11):
    print(f"{n} x {i} = {n*i}")` },
        { id: 'c2', title: 'Find First Multiple', description: 'Find the first multiple of 7 greater than 50 using a while loop.', starterCode: `n = 51
# TODO: find first multiple of 7 > 50
`, solution: `n = 51
while n % 7 != 0:
    n += 1
print(n)` }
      ]
    },
    summary: 'Loops let you automate repetition elegantly. You now know for loops with range(), while loops, and flow control with break, continue, and pass.'
  },

  /* ─────────────── LESSON 5 ─────────────── */
  {
    id: 5,
    slug: 'functions',
    title: 'Functions',
    difficulty: 'Beginner',
    duration: '45 mins',
    xp: 150,
    accent: '#F59E0B',
    icon: '⚙️',
    description: 'Write reusable code blocks with functions. Master parameters, return values, lambda expressions, and variable scope.',
    topics: ['Parameters', 'Return', 'Lambda', 'Scope'],
    script: [
      { type: 'intro',   text: "Functions are the key to writing clean, reusable code. Instead of repeating yourself, you define a function once and call it anywhere." },
      { type: 'concept', text: "You define a function with the def keyword, give it a name, list its parameters in parentheses, and write the body with indentation. The return statement sends a value back to the caller." },
      { type: 'code',    text: "Here's a greet function that takes a name and returns a greeting string. Then we have an add function that takes two numbers and returns their sum." },
      { type: 'concept', text: "Lambda functions are anonymous — they have no name. They're perfect for short, one-line computations. The syntax is: lambda parameters: expression." },
      { type: 'concept', text: "Scope defines where variables are visible. Local variables live inside a function. Global variables are defined at module level. Use the global keyword sparingly." },
      { type: 'warn',    text: "Avoid modifying global variables from inside functions — it causes hard-to-trace bugs. Pass data in as parameters and receive it back via return instead." },
      { type: 'quiz',    text: "If you define x = 10 inside a function, can you access x outside the function?" },
      { type: 'summary', text: "Functions are the foundation of clean Python code. You now know how to define functions, use parameters and return values, write lambdas, and understand scope." }
    ],
    codeExamples: [
      {
        title: 'Defining & Calling Functions',
        code: `def greet(name):
    """Return a greeting string."""
    return f"Hello, {name}!"

def add(a, b=0):   # b has default value
    return a + b

print(greet("Alice"))   # Hello, Alice!
print(add(5, 3))        # 8
print(add(7))           # 7  (b defaults to 0)`,
        explanation: 'Parameters can have default values. Docstrings document the function.',
        output: 'Hello, Alice!\n8\n7'
      },
      {
        title: 'Lambda Functions',
        code: `# Traditional function
def square(x):
    return x ** 2

# Lambda equivalent
square = lambda x: x ** 2

# Lambda in action
nums = [3, 1, 4, 1, 5]
nums.sort(key=lambda x: -x)   # sort descending
print(nums)   # [5, 4, 3, 1, 1]`,
        explanation: 'Lambdas are compact anonymous functions, often used as arguments.',
        output: '[5, 4, 3, 1, 1]'
      },
      {
        title: 'Variable Scope',
        code: `x = "global"

def show_scope():
    x = "local"    # new local variable
    print(x)       # local

show_scope()   # local
print(x)       # global (unchanged)`,
        explanation: 'Variables inside functions are local. They don\'t affect global ones.',
        output: 'local\nglobal'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What keyword is used to define a function in Python?', options: ['func', 'define', 'def', 'function'], correct: 'def', explanation: 'Functions are defined with the def keyword.' },
        { id: 'q2', question: 'What does a function without a return statement return?', options: ['0', 'False', 'None', 'Error'], correct: 'None', explanation: 'If no return is specified, Python implicitly returns None.' },
        { id: 'q3', question: 'What is a lambda function?', options: ['A class method', 'An anonymous one-line function', 'A recursive function', 'A global function'], correct: 'An anonymous one-line function', explanation: 'Lambda creates an anonymous function in a single expression.' },
        { id: 'q4', question: 'What is the scope of a variable defined inside a function?', options: ['Global', 'Module', 'Local', 'Universal'], correct: 'Local', explanation: 'Variables defined inside a function are local to that function.' },
        { id: 'q5', question: 'What syntax gives a parameter a default value?', options: ['param=value', 'param:value', 'default(param)', 'param?=value'], correct: 'param=value', explanation: 'Default values are set with param=value in the function signature.' }
      ],
      coding: [
        { id: 'c1', title: 'Factorial Function', description: 'Write a recursive function factorial(n) that returns n!', starterCode: `def factorial(n):
    # TODO: return n! recursively
    pass

print(factorial(5))  # 120
`, solution: `def factorial(n):
    if n <= 1: return 1
    return n * factorial(n - 1)
print(factorial(5))` },
        { id: 'c2', title: 'Lambda Filter', description: 'Use a lambda with filter() to get all even numbers from [1..10].', starterCode: `nums = list(range(1, 11))
# TODO: filter even numbers using lambda
`, solution: `nums = list(range(1, 11))
evens = list(filter(lambda x: x % 2 == 0, nums))
print(evens)` }
      ]
    },
    summary: 'Functions make code reusable, readable, and maintainable. You\'ve learned def, parameters, return values, default arguments, lambda, and scope — powerful tools for every Python project.'
  },

  /* ─────────────── LESSON 6 ─────────────── */
  {
    id: 6,
    slug: 'strings',
    title: 'Strings',
    difficulty: 'Beginner',
    duration: '45 mins',
    xp: 150,
    accent: '#EC4899',
    icon: '📝',
    description: 'Unlock the full power of Python strings — indexing, slicing, formatting, and Python\'s rich collection of built-in string methods.',
    topics: ['Indexing', 'Slicing', 'Formatting', 'Built-in Methods'],
    script: [
      { type: 'intro',   text: "Strings are everywhere in programming — names, messages, file paths, web data. Python has incredibly rich string handling built right in." },
      { type: 'concept', text: "A string is a sequence of characters. You can access individual characters using their index. Remember: Python uses zero-based indexing — the first character is at index 0." },
      { type: 'code',    text: "Slicing lets you extract a substring using [start:stop:step]. It's one of Python's most elegant features. You can even reverse a string with [::-1]!" },
      { type: 'concept', text: "Python has three ways to format strings: the % operator (old), str.format() (modern), and f-strings (fastest and most readable, Python 3.6+). Always prefer f-strings." },
      { type: 'code',    text: "Python's built-in string methods are incredibly powerful: upper(), lower(), strip(), split(), replace(), find(), startswith(), endswith(), and many more." },
      { type: 'warn',    text: "Strings in Python are immutable — you can't change them in place. Methods like upper() and replace() return NEW strings; they don't modify the original." },
      { type: 'quiz',    text: "What does 'python'[2:5] return? Count carefully from index 0." },
      { type: 'summary', text: "You've mastered Python strings! Indexing, slicing, f-strings, and built-in methods give you complete power over text manipulation." }
    ],
    codeExamples: [
      {
        title: 'Indexing & Slicing',
        code: `s = "Python"
#    P y t h o n
#    0 1 2 3 4 5  (forward)
#   -6-5-4-3-2-1  (backward)

print(s[0])      # P
print(s[-1])     # n  (last character)
print(s[1:4])    # yth
print(s[::2])    # Pto  (every 2nd char)
print(s[::-1])   # nohtyP  (reversed)`,
        explanation: 'Negative indices count from the end. Slicing is [start:stop:step].',
        output: 'P\nn\nyth\nPto\nnohtyP'
      },
      {
        title: 'String Formatting',
        code: `name = "Alice"
score = 95.5

# f-string (recommended)
print(f"Name: {name}, Score: {score:.1f}")

# format()
print("Name: {}, Score: {:.1f}".format(name, score))

# Padding & alignment
print(f"{'Left':<10}|{'Right':>10}")`,
        explanation: 'f-strings support formatting specifiers like :.1f for 1 decimal place.',
        output: 'Name: Alice, Score: 95.5\nName: Alice, Score: 95.5\nLeft      |     Right'
      },
      {
        title: 'Built-in Methods',
        code: `text = "  Hello, World!  "

print(text.strip())        # "Hello, World!"
print(text.lower())        # "  hello, world!  "
print(text.upper())        # "  HELLO, WORLD!  "
print(text.replace(",","")) # "  Hello World!  "
words = "a,b,c".split(",") # ['a', 'b', 'c']
print(",".join(words))     # "a,b,c"
print("hello".startswith("he"))  # True`,
        explanation: 'Strings are immutable — methods return new strings.',
        output: 'Hello, World!\n  hello, world!  \n  HELLO, WORLD!  \n  Hello World!  \na,b,c\nTrue'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: "What does 'python'[2:5] return?", options: ["'tho'", "'yth'", "'pyt'", "'hon'"], correct: "'tho'", explanation: "Indexing: p=0,y=1,t=2,h=3,o=4,n=5. [2:5] = t,h,o = 'tho'." },
        { id: 'q2', question: "How do you reverse a string s?", options: ["s.reverse()", "reverse(s)", "s[::-1]", "s[0:-1]"], correct: "s[::-1]", explanation: "s[::-1] uses slicing with step -1 to reverse the string." },
        { id: 'q3', question: "Strings in Python are:", options: ["Mutable", "Immutable", "Dynamic", "Typed"], correct: "Immutable", explanation: "You cannot modify a string in place. Methods return new strings." },
        { id: 'q4', question: "Which f-string formats a float to 2 decimal places?", options: ["f'{x:2f}'", "f'{x:.2f}'", "f'{x::2}'", "f'{x%2}'"], correct: "f'{x:.2f}'", explanation: ":.2f specifies 2 decimal places in an f-string." },
        { id: 'q5', question: "What does 'hello'.upper() return?", options: ["'Hello'", "'HELLO'", "'hello'", "None"], correct: "'HELLO'", explanation: "upper() returns a new string with all characters uppercased." }
      ],
      coding: [
        { id: 'c1', title: 'Palindrome Check', description: 'Write a function that returns True if a string is a palindrome (reads same forward and backward), ignoring case.', starterCode: `def is_palindrome(s):
    # TODO: check if s is a palindrome (ignore case)
    pass

print(is_palindrome("Racecar"))  # True
print(is_palindrome("hello"))    # False
`, solution: `def is_palindrome(s):
    s = s.lower()
    return s == s[::-1]
print(is_palindrome("Racecar"))
print(is_palindrome("hello"))` },
        { id: 'c2', title: 'Word Counter', description: 'Read a sentence and print the number of words and the most frequent character.', starterCode: `sentence = input("Enter a sentence: ")
# TODO: print word count and most frequent char
`, solution: `sentence = input("Enter a sentence: ")
print("Words:", len(sentence.split()))
freq = max(set(sentence.replace(" ","")), key=sentence.count)
print("Most frequent char:", freq)` }
      ]
    },
    summary: 'Python strings are powerful and flexible. You\'ve mastered zero-based indexing, slicing syntax, f-string formatting, and essential built-in methods like strip(), split(), replace(), and more.'
  },

  /* ─────────────── LESSON 7 ─────────────── */
  {
    id: 7,
    slug: 'lists',
    title: 'Lists',
    difficulty: 'Beginner',
    duration: '50 mins',
    xp: 180,
    accent: '#F97316',
    icon: '📋',
    description: 'Python\'s most versatile data structure. Learn CRUD operations, slicing, sorting, and the elegant list comprehension syntax.',
    topics: ['CRUD', 'Slicing', 'List Comprehensions'],
    script: [
      { type: 'intro',   text: "Lists are Python's workhorse data structure. They hold ordered collections of items — numbers, strings, even other lists!" },
      { type: 'concept', text: "Lists are mutable — you can add, remove, and change items after creation. Square brackets define a list, and comma-separated values are its elements." },
      { type: 'code',    text: "Creating, reading, updating, and deleting — the four CRUD operations. append() adds to the end, insert() adds at a position, remove() deletes by value, pop() deletes by index." },
      { type: 'concept', text: "List slicing works exactly like string slicing: [start:stop:step]. You can extract sublists, reverse lists, and step through them." },
      { type: 'concept', text: "List comprehensions are Python's most elegant feature — they create lists in a single readable line. The syntax is: [expression for item in iterable if condition]." },
      { type: 'warn',    text: "Be careful with list copying! Writing b = a doesn't copy — both variables point to the SAME list. Use b = a.copy() or b = a[:] for a true independent copy." },
      { type: 'quiz',    text: "What does [x**2 for x in range(5)] produce? Compute x squared for each x from 0 to 4." },
      { type: 'summary', text: "Lists are everywhere in Python. You now know CRUD operations, slicing, sorting, and the powerful list comprehension syntax." }
    ],
    codeExamples: [
      {
        title: 'CRUD Operations',
        code: `fruits = ["apple", "banana", "cherry"]

# Read
print(fruits[0])          # apple
print(fruits[-1])         # cherry

# Create (add)
fruits.append("mango")    # add to end
fruits.insert(1, "grape") # insert at index 1

# Update
fruits[0] = "avocado"

# Delete
fruits.remove("banana")   # by value
popped = fruits.pop()     # remove last

print(fruits)`,
        explanation: 'Lists support dynamic add, read, update, delete operations.',
        output: 'apple\ncherry\n[\'avocado\', \'grape\', \'cherry\']'
      },
      {
        title: 'Sorting & Slicing',
        code: `nums = [3, 1, 4, 1, 5, 9, 2, 6]

# Sorting
nums.sort()               # in-place ascending
print(nums)               # [1,1,2,3,4,5,6,9]

sorted_desc = sorted(nums, reverse=True)
print(sorted_desc)        # [9,6,5,4,3,2,1,1]

# Slicing
print(nums[2:5])          # [2,3,4]
print(nums[::-1])         # reversed`,
        explanation: 'sort() modifies in place; sorted() returns a new list.',
        output: '[1, 1, 2, 3, 4, 5, 6, 9]\n[9, 6, 5, 4, 3, 2, 1, 1]\n[2, 3, 4]\n[9, 6, 5, 4, 3, 2, 1, 1]'
      },
      {
        title: 'List Comprehensions',
        code: `# Traditional loop
squares = []
for x in range(5):
    squares.append(x ** 2)

# List comprehension (elegant!)
squares = [x ** 2 for x in range(5)]
print(squares)  # [0, 1, 4, 9, 16]

# With condition
evens = [x for x in range(10) if x % 2 == 0]
print(evens)    # [0, 2, 4, 6, 8]`,
        explanation: '[expression for item in iterable if condition] — concise and Pythonic.',
        output: '[0, 1, 4, 9, 16]\n[0, 2, 4, 6, 8]'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What does list.append(x) do?', options: ['Add x at index 0', 'Add x to the end', 'Remove x', 'Sort the list'], correct: 'Add x to the end', explanation: 'append() always adds the element to the end of the list.' },
        { id: 'q2', question: 'What is [x**2 for x in range(3)]?', options: ['[1,4,9]', '[0,1,4]', '[0,1,2]', '[1,2,3]'], correct: '[0,1,4]', explanation: 'range(3) gives 0,1,2. Their squares are 0,1,4.' },
        { id: 'q3', question: 'How do you safely copy a list?', options: ['b=a', 'b=copy(a)', 'b=a.copy()', 'b=a.clone()'], correct: 'b=a.copy()', explanation: 'b=a creates a reference, not a copy. Use b=a.copy() or b=a[:].' },
        { id: 'q4', question: 'What does pop() do without an argument?', options: ['Removes first element', 'Removes last element', 'Clears list', 'Returns list length'], correct: 'Removes last element', explanation: 'pop() with no argument removes and returns the last element.' },
        { id: 'q5', question: 'What is the difference between sort() and sorted()?', options: ['No difference', 'sort() is in-place; sorted() returns new list', 'sorted() is in-place; sort() returns new', 'sorted() only works on numbers'], correct: 'sort() is in-place; sorted() returns new list', explanation: 'sort() mutates the list; sorted() returns a new sorted list.' }
      ],
      coding: [
        { id: 'c1', title: 'Filter & Transform', description: 'Given a list of numbers, create a new list with only the even numbers squared.', starterCode: `nums = [1, 2, 3, 4, 5, 6, 7, 8]
# TODO: even numbers squared using comprehension
`, solution: `nums = [1, 2, 3, 4, 5, 6, 7, 8]
result = [x**2 for x in nums if x % 2 == 0]
print(result)` },
        { id: 'c2', title: 'Duplicate Remover', description: 'Remove duplicates from a list while preserving order.', starterCode: `items = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
# TODO: remove duplicates, keep order
`, solution: `items = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
seen = set()
unique = [x for x in items if not (x in seen or seen.add(x))]
print(unique)` }
      ]
    },
    summary: 'Lists are Python\'s most versatile collection. You\'ve mastered CRUD operations, slicing, sorting with sort()/sorted(), and writing elegant list comprehensions.'
  },

  /* ─────────────── LESSON 8 ─────────────── */
  {
    id: 8,
    slug: 'tuples',
    title: 'Tuples',
    difficulty: 'Beginner',
    duration: '25 mins',
    xp: 80,
    accent: '#64748B',
    icon: '📦',
    description: 'Understand tuples — immutable ordered sequences perfect for fixed data, multiple return values, and dictionary keys.',
    topics: ['Immutability', 'Packing & Unpacking', 'Named Tuples', 'Use Cases'],
    script: [
      { type: 'intro',   text: "Tuples look like lists but with one crucial difference — they're immutable. Once created, their contents cannot change." },
      { type: 'concept', text: "Tuples are defined with parentheses (or even without them). They support indexing and slicing like lists, but you cannot append, remove, or change elements." },
      { type: 'code',    text: "A key feature is tuple unpacking — assigning multiple variables in one line. Functions can also return multiple values using tuples." },
      { type: 'concept', text: "Because tuples are immutable, they can be used as dictionary keys (lists cannot). They're also faster than lists and signal 'this data should not change'." },
      { type: 'quiz',    text: "Can you use a tuple as a dictionary key? Think about what makes a valid dictionary key in Python." },
      { type: 'summary', text: "Tuples are lightweight, fast, and immutable. Use them for fixed data, multiple return values, and as dictionary keys." }
    ],
    codeExamples: [
      {
        title: 'Creating & Accessing Tuples',
        code: `# Creating tuples
point = (3, 7)
rgb   = (255, 128, 0)
single = (42,)   # single-element needs comma

# Accessing
print(point[0])   # 3
print(rgb[-1])    # 0

# Immutability
# point[0] = 5   # ← TypeError! Cannot modify tuple`,
        explanation: 'Tuples are immutable. Use (value,) for a single-element tuple.',
        output: '3\n0'
      },
      {
        title: 'Packing & Unpacking',
        code: `# Packing
coords = 10, 20   # no parentheses needed

# Unpacking
x, y = coords
print(x, y)      # 10 20

# Swap variables elegantly
a, b = 5, 10
a, b = b, a
print(a, b)      # 10 5

# Function returning multiple values
def min_max(lst):
    return min(lst), max(lst)

lo, hi = min_max([3,1,4,1,5,9])
print(lo, hi)    # 1 9`,
        explanation: 'Tuple unpacking is one of Python\'s most elegant features.',
        output: '10 20\n10 5\n1 9'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Can you modify a tuple after creation?', options: ['Yes', 'No', 'Only the first element', 'Only with special methods'], correct: 'No', explanation: 'Tuples are immutable — their contents cannot be changed after creation.' },
        { id: 'q2', question: 'How do you create a single-element tuple?', options: ['(5)', '(5,)', '[5]', 'tuple(5)'], correct: '(5,)', explanation: 'A trailing comma is required for single-element tuples: (5,).' },
        { id: 'q3', question: 'Can tuples be used as dictionary keys?', options: ['Yes', 'No', 'Only if they contain strings', 'Only if they have one element'], correct: 'Yes', explanation: 'Tuples are hashable (immutable), so they can be used as dict keys. Lists cannot.' },
        { id: 'q4', question: 'What is tuple unpacking?', options: ['Converting tuple to list', 'Assigning tuple elements to variables', 'Removing elements', 'Sorting a tuple'], correct: 'Assigning tuple elements to variables', explanation: 'a, b = (1, 2) assigns 1 to a and 2 to b — that is tuple unpacking.' },
        { id: 'q5', question: 'Which is faster for iteration: list or tuple?', options: ['List', 'Tuple', 'Same speed', 'Depends on size'], correct: 'Tuple', explanation: 'Tuples are slightly faster to iterate than lists due to immutability optimizations.' }
      ],
      coding: [
        { id: 'c1', title: 'Coordinate System', description: 'Create a function that takes two points as tuples and returns the distance between them.', starterCode: `import math

def distance(p1, p2):
    # TODO: return Euclidean distance
    pass

print(distance((0,0), (3,4)))  # 5.0
`, solution: `import math
def distance(p1, p2):
    return math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
print(distance((0,0), (3,4)))` },
        { id: 'c2', title: 'Swap Without Temp', description: 'Swap two variables using tuple unpacking (no temporary variable).', starterCode: `a = "hello"
b = "world"
# TODO: swap a and b using tuple unpacking
`, solution: `a = "hello"
b = "world"
a, b = b, a
print(a, b)` }
      ]
    },
    summary: 'Tuples are immutable, fast, and hashable. Use them for fixed data collections, elegant multiple return values, and as dictionary keys.'
  },

  /* ─────────────── LESSON 9 ─────────────── */
  {
    id: 9,
    slug: 'sets',
    title: 'Sets',
    difficulty: 'Beginner',
    duration: '30 mins',
    xp: 100,
    accent: '#14B8A6',
    icon: '🔵',
    description: 'Learn Python sets — unordered collections of unique elements with powerful mathematical set operations.',
    topics: ['Creating Sets', 'Set Operations', 'Membership Testing', 'Set Comprehensions'],
    script: [
      { type: 'intro',   text: "Sets solve a very common problem: collections where every element must be unique. Think of them as mathematical sets — union, intersection, difference." },
      { type: 'concept', text: "A set is defined with curly braces or the set() constructor. Duplicate values are automatically discarded. Sets are unordered — elements have no guaranteed position." },
      { type: 'code',    text: "The most powerful feature of sets is their mathematical operations: union (|), intersection (&), difference (-), and symmetric difference (^)." },
      { type: 'concept', text: "Membership testing with 'in' is extremely fast on sets — O(1) time complexity, compared to O(n) for lists. Use sets when you frequently check if an item exists." },
      { type: 'warn',    text: "To create an empty set, use set() — NOT {}. Curly braces without items create an empty DICTIONARY, not a set!" },
      { type: 'quiz',    text: "What is {1,2,3} & {2,3,4}? The & operator gives you elements that are in BOTH sets." },
      { type: 'summary', text: "Sets are perfect for unique collections, fast membership testing, and mathematical set operations. A powerful tool in your Python toolkit!" }
    ],
    codeExamples: [
      {
        title: 'Creating & Using Sets',
        code: `# Creating sets
nums = {1, 2, 3, 4, 5}
words = set(["hello", "world", "hello"])  # deduplicates

print(words)     # {'world', 'hello'}  (no duplicates)

# Adding and removing
nums.add(6)
nums.discard(3)  # safe remove (no error if missing)

# Membership test (O(1)!)
print(4 in nums)  # True`,
        explanation: 'Sets automatically deduplicate. discard() is safer than remove().',
        output: "{'world', 'hello'}\nTrue"
      },
      {
        title: 'Set Operations',
        code: `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)   # Union:        {1,2,3,4,5,6}
print(a & b)   # Intersection: {3,4}
print(a - b)   # Difference:   {1,2}
print(a ^ b)   # Sym. diff:    {1,2,5,6}

# Check relationships
print({1,2}.issubset({1,2,3}))   # True
print({1,2,3}.issuperset({1,2})) # True`,
        explanation: '|=union, &=intersection, -=difference, ^=symmetric difference.',
        output: '{1, 2, 3, 4, 5, 6}\n{3, 4}\n{1, 2}\n{1, 2, 5, 6}\nTrue\nTrue'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'How do you create an empty set?', options: ['{}', 'set()', 'Set()', '[]'], correct: 'set()', explanation: '{} creates an empty dictionary, not a set. Use set() for an empty set.' },
        { id: 'q2', question: 'What does {1,2,3} & {2,3,4} return?', options: ['{1,2,3,4}', '{2,3}', '{1,4}', '{1,2,3,4}'], correct: '{2,3}', explanation: '& is intersection — elements present in BOTH sets.' },
        { id: 'q3', question: 'Are sets ordered in Python?', options: ['Yes, by insertion', 'Yes, by value', 'No', 'Only if sorted'], correct: 'No', explanation: 'Sets are unordered — elements have no guaranteed position.' },
        { id: 'q4', question: 'What is the time complexity of "in" for sets?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct: 'O(1)', explanation: 'Sets use hash tables, making membership testing O(1) on average.' },
        { id: 'q5', question: 'What does the | operator do with sets?', options: ['Intersection', 'Difference', 'Union', 'Complement'], correct: 'Union', explanation: '| gives the union — all elements from both sets combined.' }
      ],
      coding: [
        { id: 'c1', title: 'Unique Elements', description: 'Given a list with duplicates, return only unique elements using a set.', starterCode: `data = [1, 2, 2, 3, 4, 4, 5, 1]
# TODO: print unique elements
`, solution: `data = [1, 2, 2, 3, 4, 4, 5, 1]
print(set(data))` },
        { id: 'c2', title: 'Common Friends', description: 'Given two sets of friend names, find the mutual friends.', starterCode: `alice_friends = {"Bob", "Charlie", "Diana", "Eve"}
bob_friends   = {"Alice", "Charlie", "Frank", "Eve"}
# TODO: print mutual friends
`, solution: `alice_friends = {"Bob", "Charlie", "Diana", "Eve"}
bob_friends = {"Alice", "Charlie", "Frank", "Eve"}
print(alice_friends & bob_friends)` }
      ]
    },
    summary: 'Sets are ideal for unique collections and fast lookups. You\'ve learned to create sets, use set operations (union, intersection, difference), and leverage O(1) membership testing.'
  },

  /* ─────────────── LESSON 10 ─────────────── */
  {
    id: 10,
    slug: 'dictionaries',
    title: 'Dictionaries',
    difficulty: 'Beginner',
    duration: '45 mins',
    xp: 150,
    accent: '#A855F7',
    icon: '📖',
    description: 'Master Python dictionaries — the most powerful built-in data structure for storing key-value pairs with lightning-fast lookups.',
    topics: ['Key-Value Pairs', 'CRUD Operations', 'Iteration', 'Dict Comprehensions'],
    script: [
      { type: 'intro',   text: "Dictionaries are Python's key-value data store — like a real dictionary where you look up a word (key) to find its definition (value). They're incredibly fast and flexible." },
      { type: 'concept', text: "A dictionary is defined with curly braces containing key: value pairs. Keys must be unique and immutable (strings, numbers, tuples). Values can be anything." },
      { type: 'code',    text: "Let's see CRUD operations on dictionaries. You access values by key, add new pairs by assignment, update existing ones the same way, and delete with del or pop()." },
      { type: 'concept', text: "Iterating a dictionary: keys() gives all keys, values() gives all values, and items() gives key-value pairs as tuples — perfect for loops." },
      { type: 'concept', text: "Dict comprehensions create dictionaries elegantly, just like list comprehensions. The syntax is: {key: value for item in iterable if condition}." },
      { type: 'warn',    text: "If you access a key that doesn't exist, you get a KeyError. Always use get(key, default) when you're not sure a key exists — it returns the default instead of crashing." },
      { type: 'quiz',    text: "What does dict.get('missing_key', 'default') return if 'missing_key' is not in the dict?" },
      { type: 'summary', text: "Dictionaries are essential in Python — from configuration to databases to JSON parsing. You now know CRUD, iteration, comprehensions, and safe key access." }
    ],
    codeExamples: [
      {
        title: 'Creating & CRUD Operations',
        code: `student = {
    "name": "Alice",
    "age": 20,
    "gpa": 9.5
}

# Read
print(student["name"])       # Alice
print(student.get("grade", "N/A"))  # N/A (safe)

# Create / Update
student["email"] = "alice@example.com"  # new key
student["age"] = 21                     # update

# Delete
del student["gpa"]
removed = student.pop("age")

print(student)`,
        explanation: 'Use get() for safe access. del and pop() both remove keys.',
        output: "Alice\nN/A\n{'name': 'Alice', 'email': 'alice@example.com'}"
      },
      {
        title: 'Iterating Dictionaries',
        code: `scores = {"Alice": 90, "Bob": 85, "Carol": 92}

# Iterate keys
for name in scores:
    print(name)

# Iterate values
for score in scores.values():
    print(score)

# Iterate key-value pairs
for name, score in scores.items():
    print(f"{name}: {score}")`,
        explanation: 'keys(), values(), and items() provide flexible iteration.',
        output: 'Alice\nBob\nCarol\n90\n85\n92\nAlice: 90\nBob: 85\nCarol: 92'
      },
      {
        title: 'Dict Comprehensions',
        code: `# Square of numbers as dict
squares = {x: x**2 for x in range(1, 6)}
print(squares)  # {1:1, 2:4, 3:9, 4:16, 5:25}

# Filter — only high scorers
scores = {"Alice": 90, "Bob": 60, "Carol": 92}
top = {k: v for k, v in scores.items() if v >= 80}
print(top)  # {'Alice': 90, 'Carol': 92}`,
        explanation: '{key: value for item in iterable if condition} — concise dict creation.',
        output: '{1: 1, 2: 4, 3: 9, 4: 16, 5: 25}\n{\'Alice\': 90, \'Carol\': 92}'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What does dict.get("key", "default") return if "key" is missing?', options: ['None', 'KeyError', '"default"', '""'], correct: '"default"', explanation: 'get() returns the second argument if the key is not found — no exception.' },
        { id: 'q2', question: 'Which of these can be a dictionary key?', options: ['[1,2]', '{1:2}', '(1,2)', 'set()'], correct: '(1,2)', explanation: 'Keys must be hashable. Tuples are hashable; lists and sets are not.' },
        { id: 'q3', question: 'What does dict.items() return?', options: ['Just keys', 'Just values', 'Key-value tuple pairs', 'A list of dicts'], correct: 'Key-value tuple pairs', explanation: 'items() returns a view of (key, value) tuple pairs.' },
        { id: 'q4', question: 'What happens when you access a missing key with dict["key"]?', options: ['Returns None', 'Returns ""', 'Raises KeyError', 'Creates the key'], correct: 'Raises KeyError', explanation: 'Direct key access raises KeyError if the key doesn\'t exist. Use get() to avoid this.' },
        { id: 'q5', question: 'Are dictionary keys guaranteed to be unique?', options: ['Yes', 'No', 'Only string keys', 'Only numeric keys'], correct: 'Yes', explanation: 'Dictionary keys are always unique. Assigning to an existing key overwrites the value.' }
      ],
      coding: [
        { id: 'c1', title: 'Word Frequency Counter', description: 'Count how many times each word appears in a sentence using a dictionary.', starterCode: `sentence = "the cat sat on the mat the cat"
# TODO: count word frequencies
`, solution: `sentence = "the cat sat on the mat the cat"
freq = {}
for word in sentence.split():
    freq[word] = freq.get(word, 0) + 1
print(freq)` },
        { id: 'c2', title: 'Grade Book', description: 'Create a grade book dict, then filter and print students with GPA >= 3.5.', starterCode: `grades = {"Alice": 3.8, "Bob": 3.2, "Carol": 3.9, "Dan": 3.1}
# TODO: print students with GPA >= 3.5
`, solution: `grades = {"Alice": 3.8, "Bob": 3.2, "Carol": 3.9, "Dan": 3.1}
honor_roll = {k: v for k, v in grades.items() if v >= 3.5}
print(honor_roll)` }
      ]
    },
    summary: 'Dictionaries are the backbone of Python applications. You\'ve mastered key-value storage, CRUD operations, iteration with items(), and elegant dict comprehensions.'
  }
];

export default PYTHON_LESSONS;
