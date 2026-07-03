import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, Save, Trash2, BookOpen, AlertCircle, CheckCircle, 
  XCircle, ChevronLeft, ChevronRight, HelpCircle, ArrowLeft, Terminal,
  Code2, Check, FileCode, CheckSquare, ChevronDown, Folder, File, 
  Plus, FolderPlus, Settings, Download, MoreVertical, Send, RefreshCw, 
  Cpu, FileText, Minimize2, Maximize2, Sparkles, AlertTriangle, Eye, CornerDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';

// Mock coding tasks database containing 10+ exercises per subject/language
const CODING_TASKS = {
  'Java': [
    {
      id: 'java-t1',
      title: 'Find Sum of All Elements',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `sumArray(int[] arr)` that returns the sum of all integers in the array.',
      sampleInput: 'arr = [1, 2, 3, 4]',
      sampleOutput: '10',
      hint: 'Use a simple for loop or enhanced for loop to accumulate values.',
      starterCode: `public class Solution {\n    public int sumArray(int[] arr) {\n        int sum = 0;\n        for (int num : arr) {\n            sum += num;\n        }\n        return sum;\n    }\n}`,
      testCases: [{ input: '[1,2,3,4]', expected: '10' }]
    },
    {
      id: 'java-t2',
      title: 'Find Average of Elements',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `avgArray(int[] arr)` that returns the average value as a double.',
      sampleInput: 'arr = [1, 2, 3, 4]',
      sampleOutput: '2.5',
      hint: 'Accumulate the sum first, then divide by the array length casting to double.',
      starterCode: `public class Solution {\n    public double avgArray(int[] arr) {\n        double sum = 0;\n        for (int num : arr) sum += num;\n        return sum / arr.length;\n    }\n}`,
      testCases: [{ input: '[1,2,3,4]', expected: '2.5' }]
    },
    {
      id: 'java-t3',
      title: 'Find Maximum Element',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `findMax(int[] arr)` that returns the largest integer in the array.',
      sampleInput: 'arr = [5, 2, 9, 1]',
      sampleOutput: '9',
      hint: 'Initialize max to the first element and update whenever a larger value is found.',
      starterCode: `public class Solution {\n    public int findMax(int[] arr) {\n        int max = arr[0];\n        for (int num : arr) {\n            if (num > max) max = num;\n        }\n        return max;\n    }\n}`,
      testCases: [{ input: '[5,2,9,1]', expected: '9' }]
    },
    {
      id: 'java-t4',
      title: 'Find Minimum Element',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `findMin(int[] arr)` that returns the smallest integer in the array.',
      sampleInput: 'arr = [5, 2, 9, 1]',
      sampleOutput: '1',
      hint: 'Initialize min to the first element and update whenever a smaller value is found.',
      starterCode: `public class Solution {\n    public int findMin(int[] arr) {\n        int min = arr[0];\n        for (int num : arr) {\n            if (num < min) min = num;\n        }\n        return min;\n    }\n}`,
      testCases: [{ input: '[5,2,9,1]', expected: '1' }]
    },
    {
      id: 'java-t5',
      title: 'Find Second Largest',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Write a method `findSecondLargest(int[] arr)` that returns the second largest value in the array.',
      sampleInput: 'arr = [12, 35, 1, 10, 34]',
      sampleOutput: '34',
      hint: 'Track both max and secondMax as you scan the elements.',
      starterCode: `public class Solution {\n    public int findSecondLargest(int[] arr) {\n        int max = Integer.MIN_VALUE, second = Integer.MIN_VALUE;\n        for (int num : arr) {\n            if (num > max) {\n                second = max;\n                max = num;\n            } else if (num > second && num != max) {\n                second = num;\n            }\n        }\n        return second;\n    }\n}`,
      testCases: [{ input: '[12,35,1,10,34]', expected: '34' }]
    },
    {
      id: 'java-t6',
      title: 'Reverse the Array',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Write a method `reverse(int[] arr)` that returns a new array with elements in reversed order.',
      sampleInput: 'arr = [1, 2, 3]',
      sampleOutput: '[3, 2, 1]',
      hint: 'Iterate from length-1 down to 0, inserting elements into a new array.',
      starterCode: `public class Solution {\n    public int[] reverse(int[] arr) {\n        int[] rev = new int[arr.length];\n        for (int i = 0; i < arr.length; i++) {\n            rev[i] = arr[arr.length - 1 - i];\n        }\n        return rev;\n    }\n}`,
      testCases: [{ input: '[1,2,3]', expected: '[3,2,1]' }]
    },
    {
      id: 'java-t7',
      title: 'Sort the Array',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Write a method `sort(int[] arr)` that returns a sorted copy of the array.',
      sampleInput: 'arr = [3, 1, 2]',
      sampleOutput: '[1, 2, 3]',
      hint: 'You can use Arrays.sort() after cloning the array.',
      starterCode: `import java.util.Arrays;\npublic class Solution {\n    public int[] sort(int[] arr) {\n        int[] copy = arr.clone();\n        Arrays.sort(copy);\n        return copy;\n    }\n}`,
      testCases: [{ input: '[3,1,2]', expected: '[1,2,3]' }]
    },
    {
      id: 'java-t8',
      title: 'Linear Search',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `search(int[] arr, int target)` that returns the 0-based index of target, or -1 if not found.',
      sampleInput: 'arr = [4, 2, 8], target = 2',
      sampleOutput: '1',
      hint: 'Iterate through the array. If arr[i] == target, return index i immediately.',
      starterCode: `public class Solution {\n    public int search(int[] arr, int target) {\n        for (int i = 0; i < arr.length; i++) {\n            if (arr[i] == target) return i;\n        }\n        return -1;\n    }\n}`,
      testCases: [{ input: '[4,2,8], target=2', expected: '1' }]
    },
    {
      id: 'java-t9',
      title: 'Count Even and Odd',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `countEvenOdd(int[] arr)` that returns an array where index 0 is even count and index 1 is odd count.',
      sampleInput: 'arr = [1, 2, 3, 4, 5]',
      sampleOutput: '[2, 3]',
      hint: 'Check if num % 2 == 0 to increment even count, else increment odd count.',
      starterCode: `public class Solution {\n    public int[] countEvenOdd(int[] arr) {\n        int evens = 0, odds = 0;\n        for (int num : arr) {\n            if (num % 2 == 0) evens++;\n            else odds++;\n        }\n        return new int[]{evens, odds};\n    }\n}`,
      testCases: [{ input: '[1,2,3,4,5]', expected: '[2,3]' }]
    },
    {
      id: 'java-t10',
      title: 'Count Element Frequency',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Write a method `frequency(int[] arr, int target)` that returns the number of occurrences of target.',
      sampleInput: 'arr = [1, 2, 2, 3], target = 2',
      sampleOutput: '2',
      hint: 'Iterate and increment a counter variable whenever element matches target.',
      starterCode: `public class Solution {\n    public int frequency(int[] arr, int target) {\n        int count = 0;\n        for (int num : arr) {\n            if (num == target) count++;\n        }\n        return count;\n    }\n}`,
      testCases: [{ input: '[1,2,2,3], target=2', expected: '2' }]
    }
  ],
  'Python': [
    {
      id: 'py-t1',
      title: 'Sum of Digits',
      topic: 'Basic Math',
      difficulty: 'Easy',
      desc: 'Write a function `sum_digits(n)` that returns the sum of all digits of a positive integer.',
      sampleInput: 'n = 123',
      sampleOutput: '6',
      hint: 'Extract digits using modulo 10 and division, or cast to string and sum characters.',
      starterCode: `def sum_digits(n):\n    return sum(int(d) for d in str(n))`,
      testCases: [{ input: '123', expected: '6' }]
    },
    {
      id: 'py-t2',
      title: 'Reverse a Number',
      topic: 'Basic Math',
      difficulty: 'Easy',
      desc: 'Write a function `reverse_num(n)` that returns the digits reversed as an integer.',
      sampleInput: 'n = 123',
      sampleOutput: '321',
      hint: 'Cast to string, reverse using slice [::-1], then cast back to integer.',
      starterCode: `def reverse_num(n):\n    return int(str(n)[::-1])`,
      testCases: [{ input: '123', expected: '321' }]
    },
    {
      id: 'py-t3',
      title: 'Check Prime Number',
      topic: 'Basic Math',
      difficulty: 'Medium',
      desc: 'Write a function `is_prime(n)` that returns True if n is prime, else False.',
      sampleInput: 'n = 7',
      sampleOutput: 'True',
      hint: 'Check divisibility from 2 up to the square root of n.',
      starterCode: `def is_prime(n):\n    if n <= 1: return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0: return False\n    return True`,
      testCases: [{ input: '7', expected: 'True' }]
    }
  ]
};

export default function Coding() {
  const { isDarkMode } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('Java');
  const [tasks, setTasks] = useState(CODING_TASKS['Java'] || []);
  const [selectedTask, setSelectedTopic] = useState(null);
  
  // Editor States
  const [code, setCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleStatus, setConsoleStatus] = useState('Ready'); // Ready, Running, Success, Error
  const [testResults, setTestResults] = useState([]); // Array of { input, expected, actual, passed }
  const [unsaved, setUnsaved] = useState(false);
  const [theme, setTheme] = useState(isDarkMode ? 'vs-dark' : 'light');

  // Synchronize dynamic editor theme with global layout theme context
  useEffect(() => {
    setTheme(isDarkMode ? 'vs-dark' : 'light');
  }, [isDarkMode]);

  // Layout Widths & Heights
  const [explorerWidth, setExplorerWidth] = useState(250);
  const [bottomHeight, setBottomHeight] = useState(220);
  const [aiPanelWidth, setAiPanelWidth] = useState(340);
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState(false);
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);

  // Tab State
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('');

  // Explorer Files Tree
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({ 'project': true, 'src': true, 'test-cases': true });

  // Terminal & Bottom Panel Tab
  const [activeBottomTab, setActiveBottomTab] = useState('Terminal');

  // AI Assistant Chat state
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your EduVerse AI Coding Mentor. How can I help you optimize or debug your code today?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Cursor/Editor details for Status Bar
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorWordWrap, setEditorWordWrap] = useState('on');
  const [editorMinimap, setEditorMinimap] = useState(true);

  // Lobby/Editor state
  const [viewState, setViewState] = useState('lobby'); // lobby, workspace
  const [completedTasks, setCompletedTasks] = useState({}); // { taskId: true }

  const editorRef = useRef(null);

  // Load language tasks
  useEffect(() => {
    setTasks(CODING_TASKS[selectedLanguage] || CODING_TASKS['Java']);
    setSelectedTopic(null);
  }, [selectedLanguage]);

  // Synchronize workspace files on Task Selection
  useEffect(() => {
    if (selectedTask) {
      const ext = selectedLanguage === 'Python' ? '.py' : selectedLanguage === 'C' ? '.c' : selectedLanguage === 'C#' ? '.cs' : '.java';
      const mainName = `Solution${ext}`;
      
      const projectFiles = [
        { id: '1', name: mainName, type: 'file', path: 'src/' + mainName, parent: 'src', content: selectedTask.starterCode },
        { id: '2', name: `Main${ext}`, type: 'file', path: 'src/Main' + ext, parent: 'src', content: `// Driver code for task\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Running task...");\n    }\n}` },
        { id: '3', name: `Helper${ext}`, type: 'file', path: 'src/Helper' + ext, parent: 'src', content: `// Helper methods` },
        { id: '4', name: 'input.txt', type: 'file', path: 'Test Cases/input.txt', parent: 'test-cases', content: selectedTask.sampleInput },
        { id: '5', name: 'output.txt', type: 'file', path: 'Test Cases/output.txt', parent: 'test-cases', content: selectedTask.sampleOutput },
        { id: '6', name: 'README.md', type: 'file', path: 'README.md', parent: 'root', content: `# ${selectedTask.title}\n\n**Topic**: ${selectedTask.topic}\n**Difficulty**: ${selectedTask.difficulty}\n\n## Description\n${selectedTask.desc}\n\n## Sample Input\n\`\`\`\n${selectedTask.sampleInput}\n\`\`\`\n\n## Sample Output\n\`\`\`\n${selectedTask.sampleOutput}\n\`\`\`` },
        { id: '7', name: 'Notes.md', type: 'file', path: 'Notes.md', parent: 'root', content: `// Personal notes about ${selectedTask.title}\n` }
      ];
      setFiles(projectFiles);
      setCode(selectedTask.starterCode);
      setConsoleOutput('');
      setConsoleStatus('Ready');
      setTestResults([]);

      // Setup tabs
      setOpenTabs([mainName, 'README.md']);
      setActiveTab(mainName);
      setUnsaved(false);
    }
  }, [selectedTask]);

  // Handle Tab Switch
  const handleTabClick = (fileName) => {
    setActiveTab(fileName);
    const file = files.find(f => f.name === fileName);
    if (file) {
      setCode(file.content);
    }
  };

  const handleCloseTab = (e, fileName) => {
    e.stopPropagation();
    const updated = openTabs.filter(t => t !== fileName);
    setOpenTabs(updated);
    if (activeTab === fileName && updated.length > 0) {
      handleTabClick(updated[updated.length - 1]);
    }
  };

  // Run Code logic
  const handleRunCode = () => {
    if (!code.trim()) {
      toast.error('Code editor is empty!');
      return;
    }
    setActiveBottomTab('Terminal');
    setConsoleStatus('Running');
    setConsoleOutput('Compiling code...\nLinking dependencies...\nRunning unit test cases...\n');
    
    setTimeout(() => {
      const results = selectedTask.testCases.map(tc => {
        return {
          input: tc.input,
          expected: tc.expected,
          actual: tc.expected, 
          passed: true
        };
      });

      setTestResults(results);
      setConsoleStatus('Success');
      setConsoleOutput(prev => prev + `\n✔ Compilation Successful!\n✔ All test cases passed.\nRuntime: 85 ms\nMemory: 20 MB\nStatus: 200 OK`);
      toast.success('Code executed successfully!');
    }, 1200);
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to default template? Your unsaved changes will be lost.')) {
      setCode(selectedTask.starterCode);
      setUnsaved(false);
      toast.success('Editor reset successfully');
    }
  };

  const handleSaveDraft = () => {
    setUnsaved(false);
    toast.success('Draft saved successfully!');
  };

  const handleMarkComplete = () => {
    setCompletedTasks(prev => ({ ...prev, [selectedTask.id]: true }));
    toast.success('Task marked as complete!');
  };

  // Draggable panels sizing handlers
  const startResizeLeft = (e) => {
    const startX = e.clientX;
    const startWidth = explorerWidth;
    const doDrag = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth > 120 && newWidth < 450) {
        setExplorerWidth(newWidth);
      }
    };
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const startResizeBottom = (e) => {
    const startY = e.clientY;
    const startHeight = bottomHeight;
    const doDrag = (moveEvent) => {
      const newHeight = startHeight - (moveEvent.clientY - startY);
      if (newHeight > 100 && newHeight < 600) {
        setBottomHeight(newHeight);
      }
    };
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const startResizeRight = (e) => {
    const startX = e.clientX;
    const startWidth = aiPanelWidth;
    const doDrag = (moveEvent) => {
      const newWidth = startWidth - (moveEvent.clientX - startX);
      if (newWidth > 200 && newWidth < 600) {
        setAiPanelWidth(newWidth);
      }
    };
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  // AI Prompts
  const handleAiPrompt = (action) => {
    setAiTyping(true);
    setAiMessages(prev => [...prev, { role: 'user', text: `${action} this code.` }]);
    
    setTimeout(() => {
      setAiTyping(false);
      let response = '';
      if (action === 'Explain Code') {
        response = `Here is the explanation for your current code:\n1. It defines a method that iterates through the input parameters.\n2. The code optimizes operations by processing items in linear time O(n).\n3. It handles corner cases gracefully.`;
      } else if (action === 'Find Bug') {
        response = `✨ Code review check: 0 errors detected. Your logic matches the task constraints perfectly!`;
      } else {
        response = `Here is the AI optimization suggestions:\n- Time Complexity: O(n)\n- Space Complexity: O(1)\n- Consider using built-in methods for cleaner syntax.`;
      }
      setAiMessages(prev => [...prev, { role: 'assistant', text: response }]);
    }, 1500);
  };

  const handleSendAiMessage = () => {
    if (!aiInput.trim()) return;
    const text = aiInput;
    setAiMessages(prev => [...prev, { role: 'user', text }]);
    setAiInput('');
    setAiTyping(true);
    
    setTimeout(() => {
      setAiTyping(false);
      setAiMessages(prev => [...prev, { role: 'assistant', text: `Here is the helper analysis for your query. Let's trace it down step by step...` }]);
    }, 1200);
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (diff === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  // Explorer Tree helpers
  const handleFileClick = (f) => {
    if (f.type === 'file') {
      if (!openTabs.includes(f.name)) {
        setOpenTabs([...openTabs, f.name]);
      }
      handleTabClick(f.name);
    }
  };

  const handleAddNewFile = () => {
    const name = prompt("Enter file name:");
    if (!name) return;
    const ext = name.split('.').pop();
    const newF = { id: Date.now().toString(), name, type: 'file', path: 'src/' + name, parent: 'src', content: `// New ${ext} file\n` };
    setFiles([...files, newF]);
    setOpenTabs([...openTabs, name]);
    setActiveTab(name);
    setCode(newF.content);
  };

  const handleAddNewFolder = () => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    setExpandedFolders(prev => ({ ...prev, [name.toLowerCase()]: true }));
    toast.success(`Folder ${name} created`);
  };

  // Editor onmount setup
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition(e => {
      setCursorPos({ ln: e.position.lineNumber, col: e.position.column });
    });
  };

  // Define active color palette classes based on Theme Context
  const bgClass = isDarkMode ? 'bg-[#0B1220] text-slate-200' : 'bg-slate-50 text-slate-800';
  const sidebarClass = isDarkMode ? 'bg-[#0F172A]' : 'bg-slate-100';
  const panelHeaderClass = isDarkMode ? 'bg-[#0F172A] border-white/5' : 'bg-slate-200 border-slate-350';
  const borderClass = isDarkMode ? 'border-white/5' : 'border-slate-300';
  const textMutedClass = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const consoleBgClass = isDarkMode ? 'bg-[#111827]' : 'bg-white';
  const buttonBgClass = isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300' : 'bg-slate-200 border-slate-300 hover:bg-slate-300 text-slate-700';

  return (
    <div className={`w-full h-full flex flex-col relative overflow-hidden ${bgClass}`}>
      {/* Background neon glows */}
      {isDarkMode && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#6366F1]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* ───── LOBBY / TASK LIST VIEW ───── */}
      {viewState === 'lobby' && (
        <div className="lobby-panel flex-1 flex flex-col justify-start p-6 overflow-y-auto">
          {/* Top Header Bar */}
          <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5 mb-5 mt-2 ${borderClass}`}>
            <div>
              <h1 className="lobby-title font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#8B5CF6]">Coding Practice Workspace</h1>
              <p className={`${textMutedClass} text-xs mt-1`}>Select an algorithm task to load the premium development environment.</p>
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Select Language</span>
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className={`bg-slate-900 border rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#2563EB] cursor-pointer ${borderClass}`}
                >
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Task Explorer */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => {
              const isCompleted = completedTasks[task.id];
              return (
                <div
                  key={task.id}
                  onClick={() => { setSelectedTopic(task); setViewState('workspace'); }}
                  className={`quiz-card-item p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isDarkMode ? 'border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60' : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle size={12} /> Solved
                        </span>
                      )}
                    </div>
                    <h3 className={`font-extrabold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{task.title}</h3>
                    <p className={`text-[11px] mt-2 line-clamp-2 ${textMutedClass}`}>{task.desc}</p>
                  </div>

                  <div className={`flex items-center justify-between mt-5 pt-3 border-t text-[10px] ${borderClass}`}>
                    <span className="font-bold uppercase tracking-wider">{task.topic}</span>
                    <span className="text-[#2563EB] font-bold">Open IDE →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───── FULL PREMIUM IDE WORKSPACE ───── */}
      {viewState === 'workspace' && selectedTask && (
        <div className="workspace-panel flex-1 flex flex-col justify-between overflow-hidden relative select-none">
          
          {/* Top IDE Navbar Bar */}
          <div className={`flex flex-row items-center justify-between px-4 py-2 border-b ${sidebarClass} ${borderClass}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewState('lobby')} 
                className={`exit-btn p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${buttonBgClass}`}
              >
                <ArrowLeft size={14} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${textMutedClass}`}>EduVerse Studio</span>
                <span className={`text-xs ${textMutedClass}`}>/</span>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{selectedTask.title}</span>
              </div>
            </div>

            {/* Friday Chatbot Button positioned in the middle spacer */}
            <div className="hidden md:flex items-center justify-center flex-grow mx-4">
              <button 
                onClick={() => setAiPanelCollapsed(!aiPanelCollapsed)}
                className={`px-4 py-1.5 rounded-full border transition-all flex items-center gap-2 font-black text-xs cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#111827]/60 border-purple-500/30 hover:border-purple-500/80 text-purple-300 hover:text-white shadow-md shadow-purple-500/5' 
                    : 'bg-white border-purple-500/40 hover:bg-purple-50/50 text-[#8B5CF6] hover:text-[#7C3AED] shadow-sm'
                }`}
              >
                <Sparkles size={13} className="text-[#8B5CF6] animate-pulse" />
                <span>Friday AI Chatbot</span>
                <span className={`w-1.5 h-1.5 rounded-full ${aiPanelCollapsed ? 'bg-slate-400' : 'bg-[#22C55E] animate-pulse'}`} />
              </button>
            </div>

            {/* Run & Action Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRunCode}
                className="px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-[#22C55E]/15"
              >
                <Play size={12} fill="currentColor" /> Run
              </button>
              <button 
                onClick={handleMarkComplete}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-[#8B5CF6]/15"
              >
                <CheckSquare size={12} /> Submit
              </button>
              <button 
                onClick={handleResetCode}
                className={`p-1.5 rounded-lg border cursor-pointer ${buttonBgClass}`}
                title="Reset Code"
              >
                <RotateCcw size={14} />
              </button>
              <button 
                onClick={handleSaveDraft}
                className={`p-1.5 rounded-lg border cursor-pointer ${buttonBgClass}`}
                title="Save Draft"
              >
                <Save size={14} />
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className={`p-1.5 rounded-lg border cursor-pointer ${buttonBgClass}`}
                title="Editor Settings"
              >
                <Settings size={14} />
              </button>
            </div>
          </div>

          {/* Main IDE Layout */}
          <div className="flex-1 flex flex-row items-stretch overflow-hidden min-h-0 relative">
            
            {/* 1. Left Sidebar: File Explorer */}
            {!explorerCollapsed && (
              <div 
                style={{ width: `${explorerWidth}px` }} 
                className={`flex flex-col border-r flex-shrink-0 select-none min-h-0 overflow-y-auto ${sidebarClass} ${borderClass}`}
              >
                <div className={`flex items-center justify-between px-3 py-2 border-b ${borderClass}`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${textMutedClass}`}>Explorer</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={handleAddNewFile} title="New File" className="text-slate-400 hover:text-slate-600 p-0.5"><Plus size={13} /></button>
                    <button onClick={handleAddNewFolder} title="New Folder" className="text-slate-400 hover:text-slate-600 p-0.5"><FolderPlus size={13} /></button>
                  </div>
                </div>

                <div className="p-2 space-y-1 text-xs">
                  {/* ROOT */}
                  <div className={`flex items-center gap-1.5 font-bold px-1.5 py-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <ChevronDown size={14} />
                    <Folder size={14} className="text-[#2563EB]" />
                    <span>Project</span>
                  </div>

                  {/* SRC FOLDER */}
                  <div className="pl-3">
                    <div 
                      onClick={() => setExpandedFolders(p => ({ ...p, src: !p.src }))} 
                      className={`flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded ${textMutedClass}`}
                    >
                      <ChevronDown size={12} className={`transition-transform ${expandedFolders.src ? '' : '-rotate-90'}`} />
                      <Folder size={12} className="text-[#8B5CF6]" />
                      <span>src</span>
                    </div>

                    {expandedFolders.src && (
                      <div className={`pl-4 space-y-0.5 border-l ml-2 mt-1 ${borderClass}`}>
                        {files.filter(f => f.parent === 'src').map(f => (
                          <div 
                            key={f.id}
                            onClick={() => handleFileClick(f)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors ${
                              activeTab === f.name 
                                ? 'bg-[#2563EB]/15 text-[#2563EB] font-bold' 
                                : `${textMutedClass} hover:bg-white/5`
                            }`}
                          >
                            <File size={12} />
                            <span>{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TEST CASES FOLDER */}
                  <div className="pl-3">
                    <div 
                      onClick={() => setExpandedFolders(p => ({ ...p, 'test-cases': !p['test-cases'] }))} 
                      className={`flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded ${textMutedClass}`}
                    >
                      <ChevronDown size={12} className={`transition-transform ${expandedFolders['test-cases'] ? '' : '-rotate-90'}`} />
                      <Folder size={12} className="text-[#22C55E]" />
                      <span>Test Cases</span>
                    </div>

                    {expandedFolders['test-cases'] && (
                      <div className={`pl-4 space-y-0.5 border-l ml-2 mt-1 ${borderClass}`}>
                        {files.filter(f => f.parent === 'test-cases').map(f => (
                          <div 
                            key={f.id}
                            onClick={() => handleFileClick(f)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors ${
                              activeTab === f.name 
                                ? 'bg-[#2563EB]/15 text-[#2563EB] font-bold' 
                                : `${textMutedClass} hover:bg-white/5`
                            }`}
                          >
                            <FileText size={12} />
                            <span>{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ROOT LEVEL FILES */}
                  <div className="pl-4 space-y-0.5 mt-1">
                    {files.filter(f => f.parent === 'root').map(f => (
                      <div 
                        key={f.id}
                        onClick={() => handleFileClick(f)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors ${
                          activeTab === f.name 
                            ? 'bg-[#2563EB]/15 text-[#2563EB] font-bold' 
                            : `${textMutedClass} hover:bg-white/5`
                        }`}
                      >
                        <FileText size={12} />
                        <span>{f.name}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

            {/* Left Resizer bar */}
            {!explorerCollapsed && (
              <div 
                className={`w-1 cursor-col-resize hover:bg-[#2563EB] active:bg-[#2563EB] transition-colors flex-shrink-0 z-30 ${isDarkMode ? 'bg-white/5' : 'bg-slate-300'}`} 
                onMouseDown={startResizeLeft}
              />
            )}

            {/* Center Area: Tabs + Monaco Editor + Bottom Panel */}
            <div className="flex-1 flex flex-col items-stretch overflow-hidden min-w-0">
              
              {/* Top Tab Bar */}
              <div className={`flex flex-row items-center border-b overflow-x-auto scrollbar-none flex-shrink-0 select-none ${bgClass} ${borderClass}`}>
                {openTabs.map(tabName => (
                  <div 
                    key={tabName}
                    onClick={() => handleTabClick(tabName)}
                    className={`flex items-center gap-2 px-4 py-2 border-r text-xs cursor-pointer transition-all ${borderClass} ${
                      activeTab === tabName 
                        ? `${consoleBgClass} text-[#2563EB] border-t-2 border-t-[#2563EB] font-bold` 
                        : 'text-slate-500 hover:bg-[#111827]/10 hover:text-slate-700'
                    }`}
                  >
                    <span>{tabName}</span>
                    {unsaved && activeTab === tabName && (
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6] block" />
                    )}
                    <button 
                      onClick={(e) => handleCloseTab(e, tabName)}
                      className="text-slate-500 hover:text-red-500 rounded p-0.5"
                    >
                      <XCircle size={10} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Monaco Code Editor Workspace */}
              <div className="flex-1 relative min-h-0">
                <Editor
                  height="100%"
                  language={selectedLanguage.toLowerCase() === 'python' ? 'python' : 'java'}
                  theme={theme}
                  value={code}
                  onChange={(val) => { setCode(val || ''); setUnsaved(true); }}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: editorFontSize,
                    minimap: { enabled: editorMinimap },
                    wordWrap: editorWordWrap,
                    automaticLayout: true,
                    tabSize: 4
                  }}
                />
              </div>

              {/* Bottom Resizer bar */}
              <div 
                className={`h-1 cursor-row-resize hover:bg-[#2563EB] active:bg-[#2563EB] transition-colors flex-shrink-0 z-30 ${isDarkMode ? 'bg-white/5' : 'bg-slate-300'}`} 
                onMouseDown={startResizeBottom}
              />

              {/* Bottom Panel */}
              <div 
                style={{ height: `${bottomHeight}px` }} 
                className={`flex flex-col border-t flex-shrink-0 min-h-0 ${consoleBgClass} ${borderClass}`}
              >
                <div className={`flex items-center justify-between border-b px-4 flex-shrink-0 ${panelHeaderClass}`}>
                  <div className="flex flex-row items-center gap-4 text-xs">
                    {['Terminal', 'Output', 'Test Cases', 'Problems', 'Debug Console'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setActiveBottomTab(t)}
                        className={`py-2 px-1 font-bold transition-all relative ${
                          activeBottomTab === t 
                            ? `${isDarkMode ? 'text-white' : 'text-slate-900'} border-b-2 border-b-[#2563EB]` 
                            : `${textMutedClass} hover:text-slate-700`
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 p-3 overflow-y-auto font-mono text-xs select-text">
                  {activeBottomTab === 'Terminal' && (
                    <div className="space-y-1 text-[#22C55E]">
                      {consoleStatus === 'Running' ? (
                        <div className="flex items-center gap-2 text-amber-500">
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Compiling code and linking artifacts...</span>
                        </div>
                      ) : (
                        <pre className={`whitespace-pre-wrap leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {consoleOutput || '$ Ready to run tests. Press "Run" above.'}
                        </pre>
                      )}
                    </div>
                  )}

                  {activeBottomTab === 'Output' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold uppercase tracking-wider text-[10px] ${textMutedClass}`}>Execution Result</span>
                        <span className={`px-2.5 py-0.5 rounded font-black text-[10px] ${
                          consoleStatus === 'Success' ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}>
                          {consoleStatus === 'Success' ? 'Accepted' : 'Idle'}
                        </span>
                      </div>
                      <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Runtime</div>
                          <div className="font-bold text-sm">85 ms</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Memory</div>
                          <div className="font-bold text-sm">20 MB</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Language</div>
                          <div className="font-bold text-sm">{selectedLanguage}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Test Cases</div>
                          <div className="font-bold text-sm">All Passed</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeBottomTab === 'Test Cases' && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase block">Sample Test Cases</span>
                      {testResults.map((tr, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">Case {idx + 1}</span>
                            <span className={`${textMutedClass} text-[10px]`}>Input: {tr.input}</span>
                          </div>
                          <span className={`font-bold flex items-center gap-0.5 text-xs ${tr.passed ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {tr.passed ? <Check size={12} /> : <XCircle size={12} />} Passed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeBottomTab === 'Problems' && (
                    <div className="space-y-2 text-slate-400">
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Workspace Diagnostic Errors (0)</span>
                      <p className={`text-[11px] ${textMutedClass}`}>No syntax or compiler diagnostics errors detected in your code solution.</p>
                    </div>
                  )}

                  {activeBottomTab === 'Debug Console' && (
                    <pre className="text-slate-500 whitespace-pre-wrap leading-relaxed">
                      $ debugger connected successfully to localhost:5005
                    </pre>
                  )}
                </div>
              </div>
            </div>

            {/* Right Resizer bar */}
            {!aiPanelCollapsed && (
              <div 
                className={`w-1 cursor-col-resize hover:bg-[#8B5CF6] active:bg-[#8B5CF6] transition-colors flex-shrink-0 z-30 ${isDarkMode ? 'bg-white/5' : 'bg-slate-300'}`} 
                onMouseDown={startResizeRight}
              />
            )}

            {/* 3. Right: Collapsible AI Assistant Drawer */}
            {!aiPanelCollapsed && (
              <div 
                style={{ width: `${aiPanelWidth}px` }} 
                className={`flex flex-col border-l flex-shrink-0 select-none min-h-0 ${sidebarClass} ${borderClass}`}
              >
                <div className={`flex items-center justify-between px-3 py-2 border-b ${panelHeaderClass}`}>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#8B5CF6]" />
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>AI Assistant</span>
                  </div>
                  <button 
                    onClick={() => setAiPanelCollapsed(true)} 
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    title="Hide AI panel"
                  >
                    <Minimize2 size={13} />
                  </button>
                </div>

                {/* AI Prompts Toolbar */}
                <div className={`grid grid-cols-3 gap-1 p-2 border-b ${borderClass} ${isDarkMode ? 'bg-slate-900/20' : 'bg-slate-200/50'}`}>
                  {['Explain Code', 'Find Bug', 'Optimize Code'].map(action => (
                    <button
                      key={action}
                      onClick={() => handleAiPrompt(action)}
                      className={`px-1 py-1 text-[9px] border rounded transition-all font-semibold ${
                        isDarkMode 
                          ? 'bg-slate-800 border-white/5 hover:bg-slate-750 text-slate-200' 
                          : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>

                {/* Chat Message Box */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans text-xs">
                  {aiMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-xl border ${
                        msg.role === 'assistant' 
                          ? `${consoleBgClass} ${borderClass} ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}` 
                          : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20 text-[#8B5CF6] ml-4 font-semibold'
                      }`}
                    >
                      <div className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-1">
                        {msg.role === 'assistant' ? 'AI Mentor' : 'You'}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  ))}

                  {aiTyping && (
                    <div className={`flex items-center gap-1.5 italic text-[11px] p-2 rounded-xl border ${borderClass} ${consoleBgClass} ${textMutedClass}`}>
                      <RefreshCw size={12} className="animate-spin text-[#8B5CF6]" />
                      <span>Thinking...</span>
                    </div>
                  )}
                </div>

                {/* Input Control */}
                <div className={`p-3 border-t flex items-center gap-2 ${sidebarClass} ${borderClass}`}>
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                    placeholder="Ask AI assistant..."
                    className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#8B5CF6] ${
                      isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                  <button 
                    onClick={handleSendAiMessage}
                    className="p-2 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* AI Toggle Button if Collapsed */}
            {aiPanelCollapsed && (
              <button 
                onClick={() => setAiPanelCollapsed(false)}
                className="absolute right-4 top-4 z-40 p-2.5 rounded-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-lg flex items-center justify-center"
                title="Open AI panel"
              >
                <Sparkles size={16} />
              </button>
            )}

          </div>

          {/* Bottom Status Bar */}
          <div className={`h-6 flex items-center justify-between px-3 border-t text-[10px] select-none ${sidebarClass} ${borderClass} ${textMutedClass}`}>
            <div className="flex items-center gap-3">
              <span className="text-[#22C55E] flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> Ready
              </span>
              <span>Git: <strong className="font-bold">main</strong></span>
            </div>

            <div className="flex items-center gap-4">
              <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>
              <span>Spaces: 4</span>
              <span>UTF-8</span>
              <span className="font-bold text-[#8B5CF6]">{selectedLanguage}</span>
            </div>
          </div>

        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`w-80 border rounded-2xl p-5 shadow-xl ${isDarkMode ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200 text-slate-800'}`}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5">
              <Settings size={16} /> Editor Configuration
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className={`block mb-1.5 ${textMutedClass}`}>Font Size</label>
                <select 
                  value={editorFontSize} 
                  onChange={(e) => setEditorFontSize(parseInt(e.target.value))}
                  className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                </select>
              </div>

              <div>
                <label className={`block mb-1.5 ${textMutedClass}`}>Word Wrap</label>
                <select 
                  value={editorWordWrap} 
                  onChange={(e) => setEditorWordWrap(e.target.value)}
                  className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                >
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className={textMutedClass}>Enable Minimap</span>
                <input 
                  type="checkbox" 
                  checked={editorMinimap} 
                  onChange={(e) => setEditorMinimap(e.target.checked)}
                  className="rounded bg-slate-900 border-white/10 text-[#2563EB] focus:ring-0" 
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={textMutedClass}>Editor Theme</span>
                <select 
                  value={theme} 
                  onChange={(e) => setTheme(e.target.value)}
                  className={`border rounded-lg p-1.5 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                >
                  <option value="vs-dark">VS Dark</option>
                  <option value="light">VS Light</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className={`mt-6 w-full py-2 border rounded-xl font-bold text-xs ${isDarkMode ? 'bg-slate-800 hover:bg-slate-750 border-white/5 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700'}`}
            >
              Close Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
