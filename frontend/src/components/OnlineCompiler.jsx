import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './OnlineCompiler.css';

// ─── Language configurations ─────────────────────────────────────────────────
const LANG_CONFIG = {
  python: {
    name: 'Python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    color: '#3B82F6',
    dotColor: '#60a5fa',
    fileExt: '.py',
    template: `# Python Program
# Write your code here and click Run ▶

def greet(name):
    return f"Hello, {name}!"

print(greet("EduVerse"))

# Try: arithmetic, loops, functions, classes
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print(f"Sum of {numbers} = {total}")
`,
  },
  java: {
    name: 'Java',
    pistonLang: 'java',
    pistonVersion: '15.0.2',
    color: '#F97316',
    dotColor: '#fb923c',
    fileExt: '.java',
    template: `// Java Program
// Write your code below and click Run ▶

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from EduVerse!");
        
        // Example: loop
        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }
        
        // Example: method call
        System.out.println("Square of 7 = " + square(7));
    }
    
    static int square(int n) {
        return n * n;
    }
}
`,
  },
  'advanced java': {
    name: 'Advanced Java',
    pistonLang: 'java',
    pistonVersion: '15.0.2',
    color: '#8B5CF6',
    dotColor: '#a78bfa',
    fileExt: '.java',
    template: `// Advanced Java — Collections & OOP
import java.util.*;
import java.util.stream.*;

public class Main {
    // Generic Stack implementation
    static class Stack<T> {
        private List<T> data = new ArrayList<>();
        public void push(T item) { data.add(item); }
        public T pop() { return data.isEmpty() ? null : data.remove(data.size()-1); }
        public String toString() { return data.toString(); }
    }

    public static void main(String[] args) {
        // Streams & Lambdas
        List<Integer> nums = Arrays.asList(1,2,3,4,5,6,7,8,9,10);
        int sumOfEvens = nums.stream()
            .filter(n -> n % 2 == 0)
            .mapToInt(Integer::intValue).sum();
        System.out.println("Sum of even numbers: " + sumOfEvens);

        // Generic Stack
        Stack<String> s = new Stack<>();
        s.push("Java"); s.push("OOP"); s.push("Streams");
        System.out.println("Stack: " + s);
        System.out.println("Popped: " + s.pop());
    }
}
`,
  },
  dbms: {
    name: 'DBMS / SQL',
    pistonLang: 'sqlite3',
    pistonVersion: '3.36.0',
    color: '#06B6D4',
    dotColor: '#22d3ee',
    fileExt: '.sql',
    template: `-- SQL / DBMS Queries
-- Write your SQL here and click Run ▶

-- Create a table
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  marks INTEGER,
  grade TEXT
);

-- Insert data
INSERT INTO students VALUES (1, 'Alice', 95, 'A');
INSERT INTO students VALUES (2, 'Bob', 78, 'B');
INSERT INTO students VALUES (3, 'Charlie', 88, 'A');
INSERT INTO students VALUES (4, 'Diana', 62, 'C');

-- Query all
SELECT * FROM students;

-- Query with condition
SELECT name, marks FROM students WHERE grade = 'A' ORDER BY marks DESC;

-- Aggregate
SELECT grade, COUNT(*) AS count, AVG(marks) AS avg_marks
FROM students GROUP BY grade;
`,
  },
  'c#': {
    name: 'C#',
    pistonLang: 'csharp',
    pistonVersion: '6.12.0',
    color: '#10B981',
    dotColor: '#34d399',
    fileExt: '.cs',
    template: `// C# Program
// Write your code below and click Run ▶

using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("Hello from EduVerse C#!");
        
        // LINQ example
        var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        var evens = numbers.Where(n => n % 2 == 0).ToList();
        Console.WriteLine("Even numbers: " + string.Join(", ", evens));
        
        // String interpolation
        string name = "EduVerse";
        int year = 2025;
        Console.WriteLine($"Welcome to {name} — {year}!");
        
        // Array + loop
        int[] scores = { 95, 88, 76, 92, 85 };
        double avg = scores.Average();
        Console.WriteLine($"Average score: {avg:F1}");
    }
}
`,
  },
};

// ─── Piston API executor ──────────────────────────────────────────────────────
const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

async function pistonRun(language, version, code, filename) {
  const response = await fetch(PISTON_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      version,
      files: [{ name: filename, content: code }],
      stdin: '',
      args: [],
      compile_timeout: 10000,
      run_timeout: 5000,
    }),
  });
  if (!response.ok) throw new Error(`Piston API error: ${response.statusText}`);
  return response.json();
}

// ─── Output line helpers ──────────────────────────────────────────────────────
let lineKey = 0;
function makeLines(text, cls) {
  return text
    .split('\n')
    .filter((l, i, arr) => !(i === arr.length - 1 && l === ''))
    .map(l => ({ id: lineKey++, text: l || '\u00a0', cls }));
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnlineCompiler({ language = 'python', title, subtitle }) {
  const langKey = language.toLowerCase();
  const cfg = LANG_CONFIG[langKey] || LANG_CONFIG.python;

  const [code, setCode] = useState(cfg.template);
  const [output, setOutput] = useState([]);
  const [status, setStatus] = useState({ dot: 'indigo', msg: 'Ready — write code and click Run ▶' });
  const [loading, setLoading] = useState({ run: false, compile: false, ai: false });
  const textareaRef = useRef(null);
  const outputEndRef = useRef(null);

  const lineCount = useMemo(() => code.split('\n').length, [code]);

  const scrollOutput = () => setTimeout(() => outputEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  const addLines = useCallback((lines) => {
    setOutput(prev => [...prev, ...lines]);
    scrollOutput();
  }, []);

  // ── RUN ────────────────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (loading.run || loading.compile || loading.ai) return;
    setLoading(p => ({ ...p, run: true }));
    setStatus({ dot: 'amber', msg: 'Executing code...' });
    const startLines = [
      { id: lineKey++, text: `▶  Running ${cfg.name} program...`, cls: 'oc-line-info' },
      { id: lineKey++, text: '─'.repeat(48), cls: 'oc-line-info' },
    ];
    setOutput(startLines);
    scrollOutput();
    try {
      const ext = cfg.fileExt;
      const fname = `main${ext}`;
      const result = await pistonRun(cfg.pistonLang, cfg.pistonVersion, code, fname);
      const runOut = result?.run?.output || result?.run?.stdout || '';
      const runErr = result?.run?.stderr || '';
      const compileErr = result?.compile?.stderr || '';
      const exitCode = result?.run?.code ?? 0;

      const lines = [];
      if (compileErr) lines.push(...makeLines(compileErr, 'oc-line-stderr'));
      if (runOut)   lines.push(...makeLines(runOut, 'oc-line-stdout'));
      if (runErr)   lines.push(...makeLines(runErr, 'oc-line-stderr'));
      if (!runOut && !runErr && !compileErr)
        lines.push({ id: lineKey++, text: '(no output)', cls: 'oc-line-info' });

      lines.push({ id: lineKey++, text: '─'.repeat(48), cls: 'oc-line-info' });
      if (exitCode === 0 && !compileErr) {
        lines.push({ id: lineKey++, text: `✓  Exited with code 0  |  ${new Date().toLocaleTimeString()}`, cls: 'oc-line-success' });
        setStatus({ dot: 'green', msg: `Program exited successfully (code 0)` });
      } else {
        lines.push({ id: lineKey++, text: `✗  Exited with code ${exitCode}  |  ${new Date().toLocaleTimeString()}`, cls: 'oc-line-stderr' });
        setStatus({ dot: 'red', msg: `Runtime error — exit code ${exitCode}. Try Auto-Correct ✨` });
      }
      addLines(lines);
    } catch (err) {
      addLines([{ id: lineKey++, text: `Network error: ${err.message}`, cls: 'oc-line-stderr' }]);
      setStatus({ dot: 'red', msg: 'Network error — check internet connection' });
    } finally {
      setLoading(p => ({ ...p, run: false }));
    }
  };

  // ── COMPILE ────────────────────────────────────────────────────────────────
  const handleCompile = async () => {
    if (loading.run || loading.compile || loading.ai) return;
    setLoading(p => ({ ...p, compile: true }));
    setStatus({ dot: 'indigo', msg: 'Compiling — checking for syntax errors...' });
    setOutput([{ id: lineKey++, text: `⚙  Compiling ${cfg.name} code...`, cls: 'oc-line-info' }]);
    try {
      const ext = cfg.fileExt;
      const result = await pistonRun(cfg.pistonLang, cfg.pistonVersion, code, `main${ext}`);
      const compileErr = result?.compile?.stderr || '';
      const runErr     = result?.run?.stderr || '';
      const exitCode   = result?.run?.code ?? 0;
      const lines = [];
      if (compileErr) {
        lines.push(...makeLines(compileErr, 'oc-line-stderr'));
        setStatus({ dot: 'red', msg: 'Compile errors found — try Auto-Correct ✨' });
      } else if (runErr) {
        lines.push(...makeLines(runErr, 'oc-line-warning'));
        setStatus({ dot: 'amber', msg: 'Compiled OK — runtime warnings detected' });
      } else if (exitCode === 0) {
        lines.push({ id: lineKey++, text: '✓  Compilation successful! No syntax errors found.', cls: 'oc-line-success' });
        setStatus({ dot: 'green', msg: 'Compiled successfully with 0 errors' });
      } else {
        lines.push({ id: lineKey++, text: `⚠  Exited with code ${exitCode}. Check runtime errors.`, cls: 'oc-line-warning' });
        setStatus({ dot: 'amber', msg: `Exit code ${exitCode}` });
      }
      addLines(lines);
    } catch (err) {
      addLines([{ id: lineKey++, text: `Compile check failed: ${err.message}`, cls: 'oc-line-stderr' }]);
      setStatus({ dot: 'red', msg: 'Compile check failed' });
    } finally {
      setLoading(p => ({ ...p, compile: false }));
    }
  };

  // ── AUTO-CORRECT (AI) ──────────────────────────────────────────────────────
  const handleAutoCorrect = async () => {
    if (loading.run || loading.compile || loading.ai) return;
    setLoading(p => ({ ...p, ai: true }));
    setStatus({ dot: 'amber', msg: '✨ AI Auto-Correct scanning code...' });
    addLines([{ id: lineKey++, text: '✨  AI analyzing and fixing your code...', cls: 'oc-line-ai' }]);

    try {
      // First run to capture errors
      const ext = cfg.fileExt;
      const result = await pistonRun(cfg.pistonLang, cfg.pistonVersion, code, `main${ext}`);
      const errorText = [result?.compile?.stderr, result?.run?.stderr].filter(Boolean).join('\n');

      const prompt = `You are an expert ${cfg.name} programmer and code debugger.
The user has the following ${cfg.name} code:

\`\`\`${cfg.pistonLang}
${code}
\`\`\`

${errorText ? `Errors found:\n${errorText}` : 'The code has no detected runtime errors but may have logical issues.'}

Task:
1. Fix ALL syntax errors, typos, and logical bugs.
2. Return ONLY the corrected, complete, runnable ${cfg.name} code.
3. Do NOT include any explanation, markdown fences, or extra text — just the raw fixed code.`;

      const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      if (!GEMINI_KEY) throw new Error('Gemini API key not configured (VITE_GEMINI_API_KEY)');

      const aiResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
          }),
        }
      );

      if (!aiResp.ok) throw new Error(`Gemini API error: ${aiResp.statusText}`);
      const aiData = await aiResp.json();
      const fixedCode = aiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!fixedCode) throw new Error('AI returned no correction');

      // Clean markdown fences if present
      const cleaned = fixedCode
        .replace(/^```[\w]*\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();

      setCode(cleaned);
      addLines([
        { id: lineKey++, text: '─'.repeat(48), cls: 'oc-line-ai' },
        { id: lineKey++, text: '✅  AI Auto-Correct applied! Code has been fixed.', cls: 'oc-line-success' },
        { id: lineKey++, text: '   Click ▶ Run to execute the corrected code.', cls: 'oc-line-ai' },
      ]);
      setStatus({ dot: 'green', msg: 'Auto-Correct complete — code fixed by AI ✨' });
    } catch (err) {
      addLines([{ id: lineKey++, text: `Auto-Correct error: ${err.message}`, cls: 'oc-line-stderr' }]);
      setStatus({ dot: 'red', msg: 'Auto-Correct failed — check API key' });
    } finally {
      setLoading(p => ({ ...p, ai: false }));
    }
  };

  // ── DELETE / RESET ─────────────────────────────────────────────────────────
  const handleDelete = () => {
    setCode(cfg.template);
    setOutput([{ id: lineKey++, text: '🗑  Editor cleared and reset to template.', cls: 'oc-line-info' }]);
    setStatus({ dot: 'indigo', msg: 'Reset to starter template — ready to write' });
    scrollOutput();
    textareaRef.current?.focus();
  };

  // ── Tab key support ────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  const isBusy = loading.run || loading.compile || loading.ai;

  return (
    <div className="oc-container">
      {title && (
        <div style={{ marginBottom: 20 }}>
          <div className="oc-section-title">
            <span style={{ fontSize: 22 }}>💻</span>
            {title}
          </div>
          {subtitle && <div className="oc-section-sub">{subtitle}</div>}
        </div>
      )}

      <div className="oc-wrapper">
        {/* Header */}
        <div className="oc-header">
          <div className="oc-lang-badge">
            <div className="oc-lang-dot" style={{ background: cfg.dotColor, boxShadow: `0 0 8px ${cfg.dotColor}` }} />
            <div>
              <div className="oc-lang-name">{cfg.name}</div>
              <div className="oc-lang-sub">Online Compiler · EduVerse IDE</div>
            </div>
          </div>
          <div className="oc-dots">
            <span style={{ background: '#ff5f57' }} />
            <span style={{ background: '#febc2e' }} />
            <span style={{ background: '#28c840' }} />
          </div>
        </div>

        {/* Toolbar — 4 action buttons */}
        <div className="oc-toolbar">
          <button
            id={`oc-run-${langKey}`}
            className="oc-btn oc-btn-run"
            onClick={handleRun}
            disabled={isBusy}
            title="Run — Execute the program"
          >
            {loading.run ? <div className="oc-btn-spinner" /> : <span>▶</span>}
            {loading.run ? 'Running...' : 'Run'}
          </button>

          <button
            id={`oc-compile-${langKey}`}
            className="oc-btn oc-btn-compile"
            onClick={handleCompile}
            disabled={isBusy}
            title="Compile — Check for syntax errors without running"
          >
            {loading.compile ? <div className="oc-btn-spinner" /> : <span>⚙</span>}
            {loading.compile ? 'Checking...' : 'Compile'}
          </button>

          <button
            id={`oc-autocorrect-${langKey}`}
            className="oc-btn oc-btn-autocorrect"
            onClick={handleAutoCorrect}
            disabled={isBusy}
            title="Auto-Correct — AI fixes all errors instantly"
          >
            {loading.ai ? <div className="oc-btn-spinner" /> : <span>✨</span>}
            {loading.ai ? 'AI Fixing...' : 'Auto-Correct'}
          </button>

          <button
            id={`oc-delete-${langKey}`}
            className="oc-btn oc-btn-delete"
            onClick={handleDelete}
            disabled={isBusy}
            title="Delete — Clear editor and reset to starter template"
          >
            <span>🗑</span>
            Delete
          </button>
        </div>

        {/* Code Editor with Line Numbers */}
        <div className="oc-editor-wrap">
          <div className="oc-line-numbers" aria-hidden="true">
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            className="oc-textarea"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            data-gramm="false"
            placeholder={`// Write your ${cfg.name} code here...`}
          />
        </div>

        {/* Status Bar */}
        <div className="oc-status-bar">
          <div className={`oc-status-dot ${status.dot}`} />
          <span>{status.msg}</span>
          <span style={{ marginLeft: 'auto', color: '#2d3748' }}>
            {lineCount} lines · {code.length} chars
          </span>
        </div>

        {/* Output Terminal */}
        <div className="oc-output">
          <div className="oc-output-header">
            <span className="oc-output-label">⬛ Terminal Output</span>
            <button className="oc-output-clear" onClick={() => setOutput([])}>
              Clear
            </button>
          </div>
          <div className="oc-output-body">
            <AnimatePresence initial={false}>
              {output.length === 0 ? (
                <span className="oc-output-empty">No output yet. Write code and click ▶ Run.</span>
              ) : (
                output.map(line => (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12 }}
                    className={line.cls}
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                  >
                    {line.text}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={outputEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

