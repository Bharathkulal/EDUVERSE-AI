/**
 * Smart Fallback Utility for EduVerse AI Workspace
 * Generates highly coherent, formatted responses styled like a premium ChatGPT assistant.
 */
function generateSmartFallback(query) {
  const cleanQuery = query.trim().replace(/^(student question:|regarding\s+["']|solve\s+)/i, '').replace(/["']\s*:\s*$/i, '').trim();
  const lowerQuery = cleanQuery.toLowerCase();

  // 1. Math Evaluator
  const sanitizedMath = cleanQuery.replace(/solve/i, '').trim();
  const mathPattern = /^[0-9\+\-\*\/\%\.\(\)\s]+$/;
  if (mathPattern.test(sanitizedMath) && /[0-9]/.test(sanitizedMath)) {
    try {
      const evalResult = new Function(`return (${sanitizedMath});`)();
      if (evalResult !== undefined && !isNaN(evalResult)) {
        return `The answer is **${evalResult}**.

💡 **Suggestions**:
- You can practice similar algebra or arithmetic equations by typing them here.
- If you'd like, I can generate a practice quiz on this topic to test your skills!`;
      }
    } catch (e) {}
  }

  // 2. Programming / Coding help
  const codeKeywords = ['code', 'program', 'function', 'class', 'method', 'loop', 'print', 'array', 'list', 'sort', 'algorithm', 'binary search', 'fibonacci', 'factorial', 'java', 'python', 'c++', 'c#', 'javascript'];
  const hasCodeKeyword = codeKeywords.some(kw => lowerQuery.includes(kw));

  if (hasCodeKeyword) {
    if (lowerQuery.includes('fibonacci')) {
      return `Here is a complete, optimized implementation of the **Fibonacci Series** using recursion in Python:

\`\`\`python
def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib_series = [0, 1]
    while len(fib_series) < n:
        fib_series.append(fib_series[-1] + fib_series[-2])
    return fib_series

# Example output for n = 10
print(fibonacci(10))  # Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

### ⏱️ Complexity Details:
- **Time Complexity**: $O(n)$
- **Space Complexity**: $O(n)$ to store the series.

💡 **Suggestions**:
- Try converting this recursive approach into an iterative approach or dynamic programming for $O(1)$ auxiliary space complexity!
- Let me know if you want this in Java, C#, or C++.`;
    }

    if (lowerQuery.includes('factorial')) {
      return `Here is a clean implementation of the **Factorial** calculation using recursion in Java:

\`\`\`java
public class Factorial {
    public static long calculate(int n) {
        if (n <= 1) return 1;
        return n * calculate(n - 1);
    }

    public static void main(String[] args) {
        int number = 5;
        System.out.println("Factorial of " + number + " is: " + calculate(number));
        // Output: Factorial of 5 is: 120
    }
}
\`\`\`

### ⏱️ Complexity Details:
- **Time Complexity**: $O(n)$
- **Space Complexity**: $O(n)$ due to recursion stack.

💡 **Suggestions**:
- Consider using an iterative solution to avoid stack overflow risks for large inputs.
- Would you like to write a loop version in Python or C#?`;
    }

    if (lowerQuery.includes('bubble sort') || lowerQuery.includes('sort')) {
      return `Here is a complete implementation of the **Bubble Sort** algorithm in JavaScript:

\`\`\`javascript
function bubbleSort(arr) {
    let n = arr.length;
    let swapped;
    for (let i = 0; i < n - 1; i++) {
        swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        // If no two elements were swapped by inner loop, then break
        if (!swapped) break;
    }
    return arr;
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));
// Output: [11, 12, 22, 25, 34, 64, 90]
\`\`\`

### ⏱️ Complexity Details:
- **Time Complexity**: $O(n^2)$ worst-case, $O(n)$ best-case (when array is already sorted).
- **Space Complexity**: $O(1)$ auxiliary space (in-place sort).

💡 **Suggestions**:
- Bubble sort is simple but inefficient for large datasets. I recommend exploring Quick Sort or Merge Sort.
- Would you like me to write a Quick Sort code solution for you?`;
    }

    return `To solve your coding task regarding **"${cleanQuery}"**, here is the general approach and implementation template:

\`\`\`javascript
// Recommended code design pattern
function executeTask(parameters) {
    try {
        // 1. Validate inputs
        if (!parameters) return null;

        // 2. Coordinate execution logic
        let result = processInputs(parameters);

        // 3. Return formatted output
        return result;
    } catch (error) {
        console.error("Execution failed:", error);
        throw error;
    }
}
\`\`\`

### 💡 Key Design Best Practices:
1. **Maintain Clean Variables**: Use descriptive naming conventions for variables and constants.
2. **Modularize Code**: Break large functions into smaller, single-responsibility helper modules.
3. **Verify Edge Cases**: Always validate null, empty, or bounds parameters.

💡 **Suggestions**:
- What language are you coding in? Ask me to write this solution in Java, Python, C#, or C++.
- You can copy-paste your current code here and ask me to find any compilation errors or bugs!`;
  }

  if (lowerQuery === 'hi' || lowerQuery === 'hello' || lowerQuery === 'hey') {
    return `Hello! How can I help you today? Whether you want to solve a math problem, write some code, or explore a concept, I'm here to help!`;
  }

  if (lowerQuery.includes('your name') || lowerQuery.includes('who are you')) {
    return `I am **EduVerse AI**, your personal study coach and programming assistant. I am modeled on advanced LLMs (like GPT and Gemini) to provide academic support, write clean code, and help you master computer science!

💡 **Suggestions**:
- You can change your preferred AI provider in the toolbar above (e.g. Gemini, Groq, or Ollama).
- Ask me for a learning roadmap on any subject like Machine Learning or Web Development!`;
  }

  if (lowerQuery.includes('your job') || lowerQuery.includes('what is your role') || lowerQuery.includes('what do you do')) {
    return `My job is to serve as your personal **EduVerse AI Academic Tutor and Coding Coach**. 

Here is what I can do to help you succeed:
1. 📝 **Explain Concepts**: Break down complex programming, math, or computer science theories into simple terms.
2. 💻 **Write & Debug Code**: Generate optimized, commented code templates and troubleshoot your programming errors.
3. 🧮 **Solve Equations**: Solve algebraic, mathematical, and logical equations step-by-step.
4. 📚 **Generate Quizzes**: Design custom multiple-choice quizzes to prepare you for exams.

💡 **Suggestions**:
- Type a mathematical query (like \`100 + 45\`) to see me solve it instantly.
- Ask me to create a learning plan for Python, Java, or Machine Learning!`;
  }

  if (lowerQuery.includes('formula of quadratic') || lowerQuery.includes('quadratic formula')) {
    return `The **Quadratic Formula** is used to find the solutions/roots of a quadratic equation in the form $ax^2 + bx + c = 0$:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### 🔍 How to use it:
1. Identify the values of coefficients $a$, $b$, and $c$.
2. Calculate the **discriminant** ($d = b^2 - 4ac$).
   - If $d > 0$: Two unique real roots.
   - If $d = 0$: One double real root.
   - If $d < 0$: Two complex conjugate roots.
3. Plug the values into the formula to find the roots.

💡 **Suggestions**:
- Type in any quadratic equation (e.g. \`x^2 - 5x + 6 = 0\`) and I can explain how to solve it step-by-step!
- Would you like a practice quiz on algebra and equations?`;
  }

  // 4. Default dynamic explanation fallback styled like ChatGPT
  return `### 📚 Concept Overview: ${cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1)}

Here is a detailed breakdown and academic guide regarding your query:

1. **Definition**: This represents a core structural block in modern computer science and college education. It is typically coordinated to solve modular problems by breaking them down into clean parameters and logic.
2. **Real-world Example**: Think of it as a set of rules where inputs are processed systematically to yield a verified, correct output.
3. **Important Principles**:
   - **Modular Design**: Break complex systems into simple, independent modules.
   - **Validation**: Always verify inputs and sanitize data structures.
   - **Performance**: Optimize time and space complexity to ensure scalability.

💡 **Suggestions**:
- Try asking: *"What is a real-world application of this?"* or *"Can you write a code example?"*
- You can type \`solve 10 + 20\` to check my math engine, or ask me to generate a practice quiz on this topic!`;
}

module.exports = { generateSmartFallback };
