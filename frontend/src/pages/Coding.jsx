import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, Save, Trash2, BookOpen, AlertCircle, CheckCircle, 
  XCircle, ChevronLeft, ChevronRight, HelpCircle, ArrowLeft, Terminal as TerminalIcon,
  Code2, Check, FileCode, CheckSquare, ChevronDown, Folder, File, 
  Plus, FolderPlus, Settings as SettingsIcon, Download, MoreVertical, Send, RefreshCw, 
  Cpu, FileText, Minimize2, Maximize2, Sparkles, AlertTriangle, Eye, CornerDownRight,
  GitBranch, GitCommit, GitPullRequest, Search, FileUp, FolderUp, Globe, Settings, 
  Copy, Clipboard, Info, BookOpenCheck, ExternalLink, Lightbulb, Grid, Columns, ListFilter, Trash
} from 'lucide-react';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import heroCharacter from '../assets/hero_character.png';

export default function Coding() {
  const { isDarkMode } = useTheme();

  // IDE core state
  const [activeProject, setActiveProject] = useState(null); // 'project-initialized' or null (for welcome screen)
  const [recentProjects, setRecentProjects] = useState(['BinaryTreeVisualizer', 'EduVerseChatAPI', 'ReactCompilerSandbox']);
  const [viewState, setViewState] = useState('workspace'); // 'workspace' or 'welcome'
  
  // Left Sidebar panel selection: explorer, search, git, settings, analysis
  const [activeSidebarTab, setActiveSidebarTab] = useState('explorer');

  // File explorer tree state
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({ 'root': true, 'src': true });
  const [clipboard, setClipboard] = useState(null); // { file, action: 'copy'|'cut' }
  const [explorerSearch, setExplorerSearch] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'type'

  // Tab & Split editor states
  const [openTabsLeft, setOpenTabsLeft] = useState([]);
  const [activeTabLeft, setActiveTabLeft] = useState('');
  const [openTabsRight, setOpenTabsRight] = useState([]);
  const [activeTabRight, setActiveTabRight] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [splitOrientation, setSplitOrientation] = useState('vertical'); // 'vertical' | 'horizontal'

  // Code editor settings
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorWordWrap, setEditorWordWrap] = useState('on');
  const [editorMinimap, setEditorMinimap] = useState(true);
  const [theme, setTheme] = useState(isDarkMode ? 'vs-dark' : 'light');

  // Terminal & Bottom Panel Tab
  const [activeBottomTab, setActiveBottomTab] = useState('Terminal');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleStatus, setConsoleStatus] = useState('Ready'); // Ready, Running, Success, Error
  const [compileStage, setCompileStage] = useState(''); // 'syntax', 'compiling', 'running', 'done'
  const [testResults, setTestResults] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]); // List of compiler errors
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null); // For AI Quick Fix modal/card

  // Git Source Control State
  const [gitStatus, setGitStatus] = useState({ staged: [], unstaged: [] });
  const [gitBranch, setGitBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [gitHistory, setGitHistory] = useState([
    { id: '1', hash: '8f2a1b3', message: 'Initial commit with project template', author: 'Friday AI' }
  ]);
  const [showDiff, setShowDiff] = useState(false);
  const [diffFile, setDiffFile] = useState(null);

  // AI Assistant Drawer State
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: "Welcome to EduVerse Studio! I am Friday, your AI Programming Guide. You can write your custom code, debug compiler errors in real time, or link your GitHub repository. Let's start building!" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Settings & Configuration Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [autosave, setAutosave] = useState(true);

  // Active cursor position
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });

  // Resizable panel dimensions
  const [explorerWidth, setExplorerWidth] = useState(240);
  const [aiPanelWidth, setAiPanelWidth] = useState(300);
  const [bottomHeight, setBottomHeight] = useState(180);
  const [unsaved, setUnsaved] = useState(false);

  // Resize mouse events handlers
  const startResizeLeft = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      const newWidth = Math.max(160, Math.min(450, moveEvent.clientX - 48));
      setExplorerWidth(newWidth);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startResizeRight = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      const newWidth = Math.max(200, Math.min(500, window.innerWidth - moveEvent.clientX));
      setAiPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startResizeBottom = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      const newHeight = Math.max(80, Math.min(450, window.innerHeight - moveEvent.clientY - 24));
      setBottomHeight(newHeight);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ ln: e.position.lineNumber, col: e.position.column });
    });
  };

  const selectedLanguage = (activeTabLeft && activeTabLeft.endsWith('.java')) ? 'Java' : (activeTabLeft && activeTabLeft.endsWith('.py')) ? 'Python' : 'Plaintext';

  // Sync Monaco editor theme with global layout isDarkMode
  useEffect(() => {
    setTheme(isDarkMode ? 'vs-dark' : 'light');
  }, [isDarkMode]);

  // Initial welcome setup or project template
  const handleCreateNewProject = (name = 'MyEduProject') => {
    const initialFiles = [
      { id: '1', name: 'Solution.java', type: 'file', path: 'src/Solution.java', parent: 'src', content: `public class Solution {\n    public static void main(String[] args) {\n        // Write your java logic here\n        System.out.println("Hello from EduVerse Studio!");\n    }\n}` },
      { id: '2', name: 'README.md', type: 'file', path: 'README.md', parent: 'root', content: `# ${name}\n\nWelcome to your browser-based IDE workspace!\n\n## Getting Started\n1. Open \`src/Solution.java\`\n2. Click the **Run** button on the header toolbar.\n3. Chat with Friday AI to get instant code explanations.` },
      { id: '3', name: 'input.txt', type: 'file', path: 'src/input.txt', parent: 'src', content: 'Sample input data...' },
      { id: '4', name: 'output.txt', type: 'file', path: 'src/output.txt', parent: 'src', content: '' }
    ];
    setFiles(initialFiles);
    setOpenTabsLeft(['Solution.java', 'README.md']);
    setActiveTabLeft('Solution.java');
    setActiveProject(name);
    setGitStatus({ staged: [], unstaged: ['Solution.java', 'README.md'] });
    toast.success(`Project ${name} created successfully!`);
  };

  const handleImportProject = () => {
    handleCreateNewProject('ImportedProject');
    toast.success('Successfully imported project artifacts.');
  };

  const handleCloneRepo = () => {
    const url = prompt("Enter Git repository URL:");
    if (!url) return;
    handleCreateNewProject('ClonedRepository');
    setGitBranch('main');
    toast.success('Cloned repository into workspace.');
  };


  // Switch tabs & sync Monaco content
  const handleTabClick = (fileName, splitSide = 'left') => {
    const file = files.find(f => f.name === fileName);
    if (!file) return;

    if (splitSide === 'left') {
      setActiveTabLeft(fileName);
    } else {
      setActiveTabRight(fileName);
    }
  };

  const handleCloseTab = (e, fileName, splitSide = 'left') => {
    e.stopPropagation();
    if (splitSide === 'left') {
      const updated = openTabsLeft.filter(t => t !== fileName);
      setOpenTabsLeft(updated);
      if (activeTabLeft === fileName && updated.length > 0) {
        handleTabClick(updated[updated.length - 1], 'left');
      }
    } else {
      const updated = openTabsRight.filter(t => t !== fileName);
      setOpenTabsRight(updated);
      if (activeTabRight === fileName && updated.length > 0) {
        handleTabClick(updated[updated.length - 1], 'right');
      }
    }
  };

  // Monaco code editing sync
  const getActiveCode = (side = 'left') => {
    const activeName = side === 'left' ? activeTabLeft : activeTabRight;
    const file = files.find(f => f.name === activeName);
    return file ? file.content : '';
  };

  const setActiveCode = (newVal, side = 'left') => {
    const activeName = side === 'left' ? activeTabLeft : activeTabRight;
    setFiles(prev => prev.map(f => f.name === activeName ? { ...f, content: newVal } : f));

    // Register Git modified status
    if (activeName && !gitStatus.unstaged.includes(activeName)) {
      setGitStatus(prev => ({ ...prev, unstaged: [...prev.unstaged, activeName] }));
    }

    // Diagnostics simulation: scan for typos on the fly
    if (activeName && activeName.endsWith('.java')) {
      const issues = [];
      if (!newVal.includes(';')) {
        issues.push({
          line: 4,
          severity: 'error',
          message: 'Missing semicolon \';\' at the end of the statement.',
          title: 'Syntax Error: Semicolon Expected',
          reason: 'Java requires every standalone statement to end with a semicolon.',
          solution: 'Add a \';\' at the end of line 4.',
          example: 'System.out.println("Hello");',
          fixTime: '15 seconds',
          difficulty: 'Easy'
        });
      }
      if (newVal.includes('Solution') && !newVal.includes('class Solution')) {
        issues.push({
          line: 1,
          severity: 'warning',
          message: 'Class name must match file name.',
          title: 'File mismatch warning',
          reason: 'Java class naming rules require public classes to match the container filename.',
          solution: 'Rename the class declaration to Solution.',
          example: 'public class Solution {}',
          fixTime: '30 seconds',
          difficulty: 'Medium'
        });
      }
      setDiagnostics(issues);
    }
  };

  // Compile and run code workflow
  const handleCompileAndRun = () => {
    const currentCode = getActiveCode('left');
    if (!currentCode.trim()) {
      toast.error('No code available to compile!');
      return;
    }

    // Block run if we have critical errors
    const criticalError = diagnostics.find(d => d.severity === 'error');
    if (criticalError) {
      toast.error(`Compilation Blocked: Please fix the compiler error on line ${criticalError.line} first!`);
      setActiveBottomTab('Problems');
      setSelectedDiagnostic(criticalError);
      return;
    }

    setActiveBottomTab('Terminal');
    setConsoleStatus('Running');
    setCompileStage('syntax');
    setConsoleOutput('Checking code syntax rules...\n');

    setTimeout(() => {
      setCompileStage('compiling');
      setConsoleOutput(prev => prev + '⚙ Compiler: generating Java bytecode Solution.class...\n');
      
      setTimeout(() => {
        setCompileStage('running');
        setConsoleOutput(prev => prev + '▶ JVM: executing Solution.class Solution.main()...\n');

        setTimeout(() => {
          setCompileStage('done');
          setConsoleStatus('Success');
          setConsoleOutput(prev => prev + `\n--------------------------------\nHello from EduVerse Studio!\n\nExecution Time: 45 ms\nMemory Usage: 18.2 MB\nDiagnostics: 0 syntax issues found.\nCode Quality Score: 96%\nReadability Score: 92%\nPerformance Score: 98%\n--------------------------------\n`);
          toast.success('Project compiled and executed successfully!');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // One-click AI Auto Correct Fix Application
  const handleApplyQuickFix = (issue) => {
    const currentCode = getActiveCode('left');
    let fixedCode = currentCode;

    if (issue.title.includes('Semicolon')) {
      fixedCode = currentCode.replace('System.out.println("Hello from EduVerse Studio!")', 'System.out.println("Hello from EduVerse Studio!");');
    } else if (issue.title.includes('mismatch')) {
      fixedCode = currentCode.replace(/class\s+\w+/, 'class Solution');
    }

    setActiveCode(fixedCode, 'left');
    setDiagnostics(prev => prev.filter(d => d.title !== issue.title));
    setSelectedDiagnostic(null);
    toast.success('AI Quick Fix applied successfully!');
  };

  const handleSaveDraft = () => {
    setUnsaved(false);
    toast.success('Draft saved successfully!');
  };

  // Local File Explorer Helpers
  const handleCreateFile = () => {
    const name = prompt("Enter new file name:");
    if (!name) return;
    const newFile = { id: Date.now().toString(), name, type: 'file', path: `src/${name}`, parent: 'src', content: '// New Code File\n' };
    setFiles(prev => [...prev, newFile]);
    setOpenTabsLeft(prev => [...prev, name]);
    setActiveTabLeft(name);
    toast.success(`Created file ${name}`);
  };

  const handleCreateFolder = () => {
    const name = prompt("Enter new folder name:");
    if (!name) return;
    setExpandedFolders(prev => ({ ...prev, [name.toLowerCase()]: true }));
    toast.success(`Created folder ${name}`);
  };

  const handleDeleteFile = (fileName) => {
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      setFiles(prev => prev.filter(f => f.name !== fileName));
      setOpenTabsLeft(prev => prev.filter(t => t !== fileName));
      setOpenTabsRight(prev => prev.filter(t => t !== fileName));
      toast.success(`Deleted file ${fileName}`);
    }
  };

  // AI assistant prompts
  const handleSendAiMessage = () => {
    if (!aiInput.trim()) return;
    const text = aiInput;
    setAiMessages(prev => [...prev, { role: 'user', text }]);
    setAiInput('');
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      setAiMessages(prev => [...prev, { role: 'assistant', text: `I scanned Solution.java. Your current code is clean. Let's walk through how to optimize the loop complexity from O(n) to O(1) if you want.` }]);
    }, 1200);
  };

  const handleAiCommand = (cmd) => {
    setAiTyping(true);
    setAiMessages(prev => [...prev, { role: 'user', text: `${cmd} current file.` }]);

    setTimeout(() => {
      setAiTyping(false);
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Here is the AI review for Solution.java:\n\n1. **Complexity**: Time O(1) | Space O(1).\n2. **Security**: Zero SQL Injection vulnerability risks.\n3. **Refactoring recommendation**: Keep static helper variables final to reduce garbage collect overhead.` 
      }]);
    }, 1500);
  };

  // Theme-based class definitions
  const bgClass = isDarkMode ? 'bg-[#070814] text-slate-200' : 'bg-slate-50 text-slate-800';
  const sidebarClass = isDarkMode ? 'bg-[#090A1A] border-white/5' : 'bg-slate-100 border-slate-300';
  const borderClass = isDarkMode ? 'border-white/5' : 'border-slate-250';
  const panelHeaderClass = isDarkMode ? 'bg-[#090A1A] border-white/5' : 'bg-slate-200 border-slate-300';
  const textMutedClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const consoleBgClass = isDarkMode ? 'bg-[#080916]' : 'bg-white';
  const buttonBgClass = isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300' : 'bg-slate-200 border-slate-300 hover:bg-slate-300 text-slate-700';

  return (
    <div className={`w-full h-full flex flex-col relative ${activeProject ? 'overflow-hidden' : 'overflow-y-auto'} ${bgClass}`}>

      {/* ─── CASE A: WELCOME HOME SCREEN STATE ─── */}
      {!activeProject && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none relative bg-[#070814]">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-45 z-0" style={{ backgroundImage: "url('/practical_bg.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070814]/80 via-transparent to-[#070814]/85 pointer-events-none z-0" />
          
          {/* Neon background flares */}
          <div className="absolute top-[-10%] right-[-15%] w-[55%] h-[55%] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] left-[-15%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="grain-overlay" />

          {/* Centered content wrapper */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl">
            <div className="relative mb-6 w-36 h-36 flex items-center justify-center">
              <img src={heroCharacter} alt="EduVerse Hero" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>

            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#6366F1]">
              Welcome to EduVerse AI Studio
            </h1>
            <p className={`text-sm mt-2 max-w-md ${textMutedClass}`}>
              A professional browser-based IDE workspace integrated with Friday AI code coaching, local files integration, and visual DSA analysis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 max-w-lg w-full">
              <div className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                isDarkMode ? 'bg-[#090A1A]/80 border-white/5 hover:border-[#8B5CF6]/50 shadow-lg backdrop-blur-md' : 'bg-white border-slate-200 hover:border-[#8B5CF6]'
              }`} onClick={() => handleCreateNewProject('EduVerse_Demo')}>
                <h3 className="font-extrabold text-sm text-[#2563EB]">Start Coding</h3>
                <p className={`text-[11px] mt-1 ${textMutedClass}`}>Initialize a completely empty project directory.</p>
                <div className="flex flex-col gap-2 mt-4 text-xs font-semibold text-slate-400">
                  <span 
                    onClick={(e) => { e.stopPropagation(); handleCreateNewProject('EduVerse_Demo'); handleCreateFile(); }}
                    className="flex items-center gap-2 hover:text-white cursor-pointer"
                  >
                    <Plus size={14} /> New File
                  </span>
                  <span 
                    onClick={(e) => { e.stopPropagation(); handleCreateNewProject('EduVerse_Demo'); handleCreateFolder(); }}
                    className="flex items-center gap-2 hover:text-white cursor-pointer"
                  >
                    <FolderPlus size={14} /> New Folder
                  </span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                isDarkMode ? 'bg-[#090A1A]/80 border-white/5 hover:border-[#8B5CF6]/50 shadow-lg backdrop-blur-md' : 'bg-white border-slate-200 hover:border-[#8B5CF6]'
              }`}>
                <h3 className="font-extrabold text-sm text-[#8B5CF6]">Import & Connect</h3>
                <p className={`text-[11px] mt-1 ${textMutedClass}`}>Clone from GitHub or open your system local directories.</p>
                <div className="flex flex-col gap-2 mt-4 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-2 hover:text-white" onClick={handleCloneRepo}><GitBranch size={14} /> Clone Repository</span>
                  <span className="flex items-center gap-2 hover:text-white" onClick={handleImportProject}><Folder size={14} /> Open Local Folder</span>
                </div>
              </div>
            </div>

            {/* Recent projects */}
            <div className="mt-10 w-full max-w-md text-left">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${textMutedClass}`}>Recent Workspace Projects</span>
              <div className="space-y-2 mt-3">
                {recentProjects.map(proj => (
                  <div 
                    key={proj}
                    onClick={() => handleCreateNewProject(proj)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isDarkMode ? 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">{proj}</span>
                    <span className="text-[10px] text-slate-500">2 hours ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── CASE B: ACTIVE IDE WORKSPACE STATE ─── */}
      {activeProject && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
          
          {/* Top Main Toolbar */}
          <div className={`flex flex-row items-center justify-between px-4 py-2 border-b ${sidebarClass}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveProject(null)} 
                className={`exit-btn p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${buttonBgClass}`}
              >
                <ArrowLeft size={14} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8B5CF6] font-bold">EduVerse Studio</span>
                <span className="text-xs text-slate-500">/</span>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-350' : 'text-slate-700'}`}>{activeProject}</span>
              </div>
            </div>

            {/* Friday AI chatbot toggle button in the middle spacer */}
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

            {/* Header Action Run & Settings Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCompileAndRun}
                className="px-3.5 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-[#22C55E]/15"
              >
                <Play size={12} fill="currentColor" /> Run Code
              </button>
              <button 
                onClick={() => setIsSplit(!isSplit)}
                className={`p-1.5 rounded-lg border cursor-pointer ${buttonBgClass}`}
                title="Split Editor layout"
              >
                <Columns size={14} />
              </button>
              <button 
                onClick={handleSaveDraft}
                className={`p-1.5 rounded-lg border cursor-pointer ${buttonBgClass}`}
                title="Save directly to disk"
              >
                <Save size={14} />
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className={`p-1.5 rounded-lg border cursor-pointer ${buttonBgClass}`}
                title="Workspace settings"
              >
                <SettingsIcon size={14} />
              </button>
            </div>
          </div>

          {/* Core IDE panels */}
          <div className="flex-grow flex flex-row items-stretch overflow-hidden min-h-0 relative">
            
            {/* Left Tiny Activity Bar */}
            <div className={`w-12 border-r flex flex-col justify-between items-center py-4 select-none ${sidebarClass}`}>
              <div className="flex flex-col gap-5 items-center w-full">
                {['explorer', 'search', 'git', 'analysis'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveSidebarTab(tab)}
                    className={`p-2 rounded-xl transition-all relative ${
                      activeSidebarTab === tab ? 'bg-[#2563EB]/15 text-[#2563EB]' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab === 'explorer' && <FileText size={20} />}
                    {tab === 'search' && <Search size={20} />}
                    {tab === 'git' && <GitBranch size={20} />}
                    {tab === 'analysis' && <Cpu size={20} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Resizable Left Panel view content */}
            <div 
              style={{ width: `${explorerWidth}px` }} 
              className={`flex flex-col border-r flex-shrink-0 min-h-0 overflow-y-auto select-none ${sidebarClass}`}
            >
              
              {/* Explorer tab view */}
              {activeSidebarTab === 'explorer' && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">File Tree Explorer</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={handleCreateFile} className="text-slate-400 hover:text-white p-0.5"><Plus size={13} /></button>
                      <button onClick={handleCreateFolder} className="text-slate-400 hover:text-white p-0.5"><FolderPlus size={13} /></button>
                    </div>
                  </div>

                  <div className="p-2 space-y-1 text-xs">
                    {/* Project root folder */}
                    <div className={`flex items-center gap-1.5 font-bold px-1.5 py-1 ${isDarkMode ? 'text-slate-350' : 'text-slate-700'}`}>
                      <ChevronDown size={14} />
                      <Folder size={14} className="text-[#2563EB]" />
                      <span>{activeProject}</span>
                    </div>

                    <div className="pl-3 space-y-1.5">
                      {/* Src Folder */}
                      <div onClick={() => setExpandedFolders(p => ({ ...p, src: !p.src }))} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer">
                        <ChevronDown size={12} className={`transition-transform ${expandedFolders.src ? '' : '-rotate-90'}`} />
                        <Folder size={12} className="text-[#8B5CF6]" />
                        <span>src</span>
                      </div>

                      {expandedFolders.src && (
                        <div className="pl-4 space-y-1 border-l border-white/5 ml-2 mt-1">
                          {files.map(f => (
                            <div 
                              key={f.id} 
                              onClick={() => handleTabClick(f.name, 'left')}
                              className={`flex items-center justify-between group px-2 py-1 rounded cursor-pointer ${
                                activeTabLeft === f.name ? 'bg-[#2563EB]/15 text-[#60A5FA]' : 'text-slate-400 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <FileCode size={12} />
                                <span>{f.name}</span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.name); }}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                              >
                                <Trash size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Project files */}
              {activeSidebarTab === 'search' && (
                <div className="p-3 space-y-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Search Workspace</span>
                  <input 
                    type="text" 
                    placeholder="Search query in project..." 
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-[#8B5CF6] text-white"
                  />
                  <div className="text-xs text-slate-500">No search query entered. Enter a keyword to scan lines.</div>
                </div>
              )}

              {/* Source Control git status panel */}
              {activeSidebarTab === 'git' && (
                <div className="p-3 flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Git Source Control</span>
                    
                    <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Current Branch:</span>
                        <span className="text-purple-400 font-bold flex items-center gap-1"><GitBranch size={12} /> {gitBranch}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Unstaged Changes: {gitStatus.unstaged.length} files</div>
                    </div>

                    <div className="space-y-1">
                      {gitStatus.unstaged.map(f => (
                        <div key={f} className="flex items-center justify-between text-xs p-1.5 bg-slate-900/20 rounded border border-white/5">
                          <span className="font-mono text-slate-350">{f}</span>
                          <span className="text-amber-400 text-[10px] font-bold">Modified</span>
                        </div>
                      ))}
                    </div>

                    <textarea
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Commit message..."
                      className="w-full h-16 bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                    
                    <button 
                      onClick={() => {
                        if (!commitMessage.trim()) return;
                        setGitHistory([{ id: Date.now().toString(), hash: 'a12b3c', message: commitMessage, author: 'Friday AI' }, ...gitHistory]);
                        setCommitMessage('');
                        setGitStatus({ staged: [], unstaged: [] });
                        toast.success('Successfully committed code changes.');
                      }}
                      className="w-full py-1.5 rounded bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs"
                    >
                      Commit to {gitBranch}
                    </button>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <span className="text-[10px] text-slate-500 uppercase block mb-2">Commit logs</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {gitHistory.map(g => (
                        <div key={g.id} className="p-2 rounded bg-slate-900/60 border border-white/5 text-[10px]">
                          <div className="flex justify-between font-mono text-slate-400 font-bold">
                            <span>{g.hash}</span>
                            <span>{g.author}</span>
                          </div>
                          <p className="text-slate-300 mt-1 truncate">{g.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Project Health analysis tab */}
              {activeSidebarTab === 'analysis' && (
                <div className="p-3 space-y-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Project Quality Analysis</span>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs space-y-3">
                    <div>
                      <div className="text-slate-400">Project Health Score</div>
                      <div className="text-xl font-black text-emerald-400">94 / 100</div>
                    </div>
                    <div className="h-[2px] bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[94%]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                      <div>Unused Files: 0</div>
                      <div>Dead Methods: 1</div>
                      <div>Duplicate Code: 0%</div>
                      <div>Documentation: 80%</div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Left resizer handle bar */}
            <div className={`w-1 cursor-col-resize hover:bg-[#2563EB] active:bg-[#2563EB] transition-colors flex-shrink-0 z-35 ${isDarkMode ? 'bg-white/5' : 'bg-slate-300'}`} 
              onMouseDown={startResizeLeft}
            />

            {/* Center Area: Tabs + split Monaco Editor + bottom panel workspace */}
            <div className="flex-grow flex flex-col items-stretch overflow-hidden min-w-0">
              
              {/* Tab navigation headers */}
              <div className={`flex flex-row items-center justify-between border-b ${consoleBgClass} ${borderClass}`}>
                <div className="flex flex-row items-center overflow-x-auto scrollbar-none">
                  {openTabsLeft.map(tabName => (
                    <div 
                      key={tabName}
                      onClick={() => handleTabClick(tabName, 'left')}
                      className={`flex items-center gap-2 px-4 py-2 border-r text-xs cursor-pointer transition-all ${borderClass} ${
                        activeTabLeft === tabName 
                          ? `${bgClass} text-[#2563EB] border-t-2 border-t-[#2563EB] font-bold` 
                          : `${textMutedClass} hover:bg-white/5`
                      }`}
                    >
                      <FileCode size={12} />
                      <span>{tabName}</span>
                      <button onClick={(e) => handleCloseTab(e, tabName, 'left')} className="text-slate-500 hover:text-red-500 rounded p-0.5"><XCircle size={10} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Split screen content layout */}
              <div className={`flex-1 flex min-h-0 ${splitOrientation === 'horizontal' ? 'flex-col' : 'flex-row'}`}>
                {/* Left Editor */}
                <div className="flex-1 bg-[#111827] relative min-h-0">
                  <Editor
                    height="100%"
                    language={(activeTabLeft && activeTabLeft.endsWith('.md')) ? 'markdown' : (activeTabLeft && activeTabLeft.endsWith('.txt')) ? 'plaintext' : 'java'}
                    theme={theme}
                    value={getActiveCode('left')}
                    onChange={(val) => setActiveCode(val || '', 'left')}
                    onMount={handleEditorDidMount}
                    options={{
                      fontSize: editorFontSize,
                      minimap: { enabled: editorMinimap },
                      wordWrap: editorWordWrap,
                      automaticLayout: true,
                      tabSize: 4
                    }}
                  />

                  {/* Monaco Diagnostics Light Bulb overlay warning */}
                  {diagnostics.length > 0 && (
                    <div className="absolute top-4 right-4 z-40 bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-xl p-3 max-w-xs text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Lightbulb size={14} className="animate-bounce" />
                        <span>Friday AI Quick Fix</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">{diagnostics[0].message}</p>
                      <button 
                        onClick={() => handleApplyQuickFix(diagnostics[0])}
                        className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded hover:bg-amber-450 transition-colors"
                      >
                        Apply Fix
                      </button>
                    </div>
                  )}
                </div>

                {/* Split editor view if toggled */}
                {isSplit && (
                  <>
                    <div className={`cursor-resize bg-slate-700 ${splitOrientation === 'horizontal' ? 'h-1' : 'w-1'}`} />
                    <div className="flex-1 bg-[#111827] relative min-h-0">
                      <Editor
                        height="100%"
                        language="java"
                        theme={theme}
                        value="// Split Screen Secondary File View..."
                        options={{
                          fontSize: editorFontSize,
                          minimap: { enabled: false },
                          wordWrap: editorWordWrap,
                          automaticLayout: true
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Drag handle */}
              <div className={`h-1 cursor-row-resize hover:bg-[#2563EB] active:bg-[#2563EB] transition-colors flex-shrink-0 z-35 ${isDarkMode ? 'bg-white/5' : 'bg-slate-300'}`} 
                onMouseDown={startResizeBottom}
              />

              {/* Bottom Terminal Output tabs panel */}
              <div 
                style={{ height: `${bottomHeight}px` }} 
                className={`flex flex-col border-t flex-shrink-0 min-h-0 ${consoleBgClass} ${borderClass}`}
              >
                <div className={`flex items-center justify-between border-b px-4 flex-shrink-0 ${panelHeaderClass}`}>
                  <div className="flex flex-row items-center gap-4 text-xs">
                    {['Terminal', 'Output', 'Problems', 'Debug Console', 'Test Cases'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveBottomTab(tab)}
                        className={`py-2 px-1 font-bold transition-all relative ${
                          activeBottomTab === tab 
                            ? `${isDarkMode ? 'text-white' : 'text-slate-900'} border-b-2 border-b-[#2563EB]` 
                            : `${textMutedClass} hover:text-slate-700`
                        }`}
                      >
                        {tab}
                        {tab === 'Problems' && diagnostics.length > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px]">{diagnostics.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-grow p-3 overflow-y-auto font-mono text-xs select-text">
                  
                  {activeBottomTab === 'Terminal' && (
                    <div className="space-y-1">
                      {consoleStatus === 'Running' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-amber-400">
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Stage: {compileStage.toUpperCase()} analysis in progress...</span>
                          </div>
                          <pre className="text-slate-500">{consoleOutput}</pre>
                        </div>
                      ) : (
                        <pre className={`whitespace-pre-wrap leading-relaxed ${isDarkMode ? 'text-slate-350' : 'text-slate-700'}`}>
                          {consoleOutput || '$ Ready to compile. Press "Run Code" button.'}
                        </pre>
                      )}
                    </div>
                  )}

                  {activeBottomTab === 'Output' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase">Execution Result</span>
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded text-[10px] font-bold">Passed</span>
                      </div>
                      <pre className="text-slate-400 text-[11px]">Compile version: OpenJDK 17.0.2\nOutput matches expected test logs.</pre>
                    </div>
                  )}

                  {activeBottomTab === 'Problems' && (
                    <div className="space-y-2">
                      {diagnostics.length === 0 ? (
                        <span className="text-slate-500">No compiler diagnostics issues detected. Ready!</span>
                      ) : (
                        <div className="space-y-2">
                          {diagnostics.map((d, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedDiagnostic(d)}
                              className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/5 hover:border-red-500/40 transition-colors cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2 text-red-400">
                                <AlertTriangle size={14} />
                                <span className="font-bold">Line {d.line}:</span>
                                <span>{d.message}</span>
                              </div>
                              <span className="text-[#8B5CF6] text-[10px] font-black hover:underline">AI Error Explanation →</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeBottomTab === 'Debug Console' && (
                    <span className="text-slate-500">$ debugger active...</span>
                  )}

                  {activeBottomTab === 'Test Cases' && (
                    <div className="p-2 bg-slate-900/20 border border-white/5 rounded-lg text-slate-400">
                      <span>Standard Input/Output files present in Explorer:</span>
                      <pre className="mt-2 text-slate-500">{"input.txt -> Sample input data...\noutput.txt -> [Write values here]"}</pre>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Right side AI Drawer Panel */}
            {!aiPanelCollapsed && (
              <>
                <div className={`w-1 cursor-col-resize hover:bg-[#8B5CF6] active:bg-[#8B5CF6] transition-colors flex-shrink-0 z-35 ${isDarkMode ? 'bg-white/5' : 'bg-slate-300'}`} 
                  onMouseDown={startResizeRight}
                />
                
                <div 
                  style={{ width: `${aiPanelWidth}px` }} 
                  className={`flex flex-col border-l flex-shrink-0 select-none min-h-0 ${sidebarClass}`}
                >
                  
                  {/* AI diagnostic helper widget if selected */}
                  {selectedDiagnostic && (
                    <div className="p-3 border-b border-red-500/10 bg-red-500/5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-red-400 font-bold flex items-center gap-1"><AlertTriangle size={12} /> Diagnostic Helper</span>
                        <button onClick={() => setSelectedDiagnostic(null)} className="text-slate-400 hover:text-white text-[10px]">✕</button>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">{selectedDiagnostic.title}</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{selectedDiagnostic.reason}</p>
                      
                      <div className="bg-slate-950 p-2 rounded border border-white/5 font-mono text-[10px] text-slate-400 mt-2">
                        {selectedDiagnostic.solution}
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2">
                        <span>Fix Time: {selectedDiagnostic.fixTime}</span>
                        <span>Level: {selectedDiagnostic.difficulty}</span>
                      </div>

                      <button 
                        onClick={() => handleApplyQuickFix(selectedDiagnostic)}
                        className="w-full py-1.5 mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-xs rounded-lg shadow"
                      >
                        Apply Fix Preview
                      </button>
                    </div>
                  )}

                  <div className={`flex items-center justify-between px-3 py-2 border-b ${panelHeaderClass}`}>
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#8B5CF6]" />
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Friday AI Mentor</span>
                    </div>
                    <button onClick={() => setAiPanelCollapsed(true)} className="text-slate-400 hover:text-white p-0.5"><Minimize2 size={13} /></button>
                  </div>

                  {/* AI Quick Prompts List */}
                  <div className="grid grid-cols-2 gap-1.5 p-3 border-b border-white/5">
                    {['Explain Code', 'Find Bug', 'Optimize Code', 'Complexity'].map(action => (
                      <button
                        key={action}
                        onClick={() => handleAiCommand(action)}
                        className={`px-2 py-1 text-[10px] border rounded transition-all font-semibold ${
                          isDarkMode 
                            ? 'bg-slate-800 border-white/5 hover:bg-slate-750 text-slate-200' 
                            : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm'
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  {/* Chat message content list */}
                  <div className="flex-grow p-3 overflow-y-auto space-y-3 font-sans text-xs">
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
                          {msg.role === 'assistant' ? 'Friday AI' : 'You'}
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                    ))}

                    {aiTyping && (
                      <div className={`flex items-center gap-1.5 italic text-[11px] p-2 rounded-xl border ${borderClass} ${consoleBgClass} ${textMutedClass}`}>
                        <RefreshCw size={12} className="animate-spin text-[#8B5CF6]" />
                        <span>Friday is analyzing...</span>
                      </div>
                    )}
                  </div>

                  {/* AI input text box */}
                  <div className={`p-3 border-t flex items-center gap-2 ${sidebarClass} ${borderClass}`}>
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                      placeholder="Ask Friday AI..."
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
              </>
            )}

            {/* Floating button to trigger panel if collapsed */}
            {aiPanelCollapsed && (
              <button 
                onClick={() => setAiPanelCollapsed(false)}
                className="absolute right-4 top-4 z-40 p-2.5 rounded-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-lg flex items-center justify-center cursor-pointer"
                title="Open Friday AI panel"
              >
                <Sparkles size={16} />
              </button>
            )}

          </div>

          {/* Bottom Status bar indicators */}
          <div className={`h-6 flex items-center justify-between px-3 border-t text-[10px] select-none ${sidebarClass} ${borderClass} ${textMutedClass}`}>
            <div className="flex items-center gap-3">
              <span className="text-[#22C55E] flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> Running local
              </span>
              <span>Git: <strong className="font-bold">{gitBranch}</strong></span>
              {diagnostics.length > 0 && (
                <span className="text-red-400 font-bold flex items-center gap-0.5">
                  <AlertTriangle size={10} /> {diagnostics.length}
                </span>
              )}
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

      {/* Settings Modal config options */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm border rounded-2xl p-5 shadow-xl ${isDarkMode ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200 text-slate-800'}`}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5">
              <SettingsIcon size={16} /> EduVerse Studio Settings
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
                <span className={textMutedClass}>Autosave drafts</span>
                <input 
                  type="checkbox" 
                  checked={autosave} 
                  onChange={(e) => setAutosave(e.target.checked)}
                  className="rounded bg-slate-900 border-white/10 text-[#2563EB] focus:ring-0" 
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={textMutedClass}>Monaco Editor Minimap</span>
                <input 
                  type="checkbox" 
                  checked={editorMinimap} 
                  onChange={(e) => setEditorMinimap(e.target.checked)}
                  className="rounded bg-slate-900 border-white/10 text-[#2563EB] focus:ring-0" 
                />
              </div>
            </div>
            <button 
              onClick={() => setShowSettingsModal(false)}
              className={`mt-6 w-full py-2 border rounded-xl font-bold text-xs ${isDarkMode ? 'bg-slate-800 hover:bg-slate-750 border-white/5 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700'}`}
            >
              Close settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
