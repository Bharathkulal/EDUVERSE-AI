import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, SkipForward, SkipBack, RotateCcw, 
  ChevronRight, Cpu, Code2, Database, Zap, Settings, Info,
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Layers, Compass, Terminal, Film
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useVoiceAssistant } from '../context/VoiceContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import './DashboardTheme.css';

export default function LinkedListVisualization() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { isEnabled, toggleEnabled } = useVoiceAssistant();
  
  // Custom Zoom and Pan State
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const [isGameRotated, setIsGameRotated] = useState(localStorage.getItem('dsa_game_mode') === 'true');
  const [listType, setListType] = useState('singly'); // singly, doubly, circular
  const [operation, setOperation] = useState('insertBeginning'); // default to insertBeginning since empty
  const [inputValue, setInputValue] = useState('10');
  const [inputPosition, setInputPosition] = useState('2');
  const [activeTab, setActiveTab] = useState('code'); // code, variables, memory
  const [speed, setSpeed] = useState(1);
  
  // Settings Toggles
  const [showAddresses, setShowAddresses] = useState(true);
  const [showPointerNames, setShowPointerNames] = useState(true);
  const [showCodeSync, setShowCodeSync] = useState(true);
  const [showComplexity, setShowComplexity] = useState(true);

  // Linked list state starts empty
  const [nodes, setNodes] = useState([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  // Debugger Execution State
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);
  const pendingNodesRef = useRef(null); // Stores final nodes to commit after animation
  const isAnimatingRef = useRef(false); // Prevent generateSteps during animation

  // Zoom / Pan handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.interactive-control')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const nextScale = e.deltaY < 0 ? zoomScale * zoomFactor : zoomScale / zoomFactor;
    setZoomScale(Math.max(0.4, Math.min(nextScale, 2.5)));
  };

  const resetCanvas = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Autoplay Tour Video Demo Mode
  const startAutoDemo = () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);
    
    const demoSteps = [];

    // Step 0: Start Empty
    demoSteps.push({
      label: "🎥 Welcome to the Auto Tour! We start with an empty Linked List.",
      activeLine: 7,
      nodes: [],
      wires: [],
      variables: { head: 'NULL', current: 'NULL', newNode: 'NULL' }
    });

    // Step 1: Create Head Node (10)
    demoSteps.push({
      label: "Step 1: Allocate memory for the Head Node with data: 10.",
      activeLine: 8,
      nodes: [{ id: 1, value: 10, address: '0x101', state: 'new' }],
      wires: [],
      variables: { head: 'NULL', current: 'NULL', newNode: '0x101' }
    });

    // Step 2: Point head pointer to the head node
    demoSteps.push({
      label: "Step 2: Point the HEAD pointer to our new node at 0x101.",
      activeLine: 10,
      nodes: [{ id: 1, value: 10, address: '0x101', state: 'default' }],
      wires: [],
      variables: { head: '0x101', current: 'NULL', newNode: 'NULL' }
    });

    // Step 3: Create Second Node (20)
    demoSteps.push({
      label: "Step 3: Allocate memory for a new node with data: 20 at 0x102.",
      activeLine: 8,
      nodes: [
        { id: 1, value: 10, address: '0x101', state: 'default' },
        { id: 2, value: 20, address: '0x102', state: 'new' }
      ],
      wires: [],
      variables: { head: '0x101', current: 'NULL', newNode: '0x102' }
    });

    // Step 4: Link first node next to second node
    demoSteps.push({
      label: "Step 4: Update first node's next pointer to point to the new node at 0x102.",
      activeLine: 18,
      nodes: [
        { id: 1, value: 10, address: '0x101', state: 'default' },
        { id: 2, value: 20, address: '0x102', state: 'new' }
      ],
      wires: ['new'],
      variables: { head: '0x101', current: '0x101', newNode: '0x102' }
    });

    // Step 5: Complete insertion
    demoSteps.push({
      label: "Step 5: Node 20 is successfully linked at the end of Node 10.",
      activeLine: 19,
      nodes: [
        { id: 1, value: 10, address: '0x101', state: 'default' },
        { id: 2, value: 20, address: '0x102', state: 'default' }
      ],
      wires: ['default'],
      variables: { head: '0x101', current: 'NULL', newNode: 'NULL' }
    });

    // Step 6: Create Third Node (30)
    demoSteps.push({
      label: "Step 6: Allocate memory for a new node with data: 30 at 0x103.",
      activeLine: 8,
      nodes: [
        { id: 1, value: 10, address: '0x101', state: 'default' },
        { id: 2, value: 20, address: '0x102', state: 'default' },
        { id: 3, value: 30, address: '0x103', state: 'new' }
      ],
      wires: ['default', 'none'],
      variables: { head: '0x101', current: 'NULL', newNode: '0x103' }
    });

    // Step 7: Link second node next to third node
    demoSteps.push({
      label: "Step 7: Update second node's next pointer to point to the new node at 0x103.",
      activeLine: 18,
      nodes: [
        { id: 1, value: 10, address: '0x101', state: 'default' },
        { id: 2, value: 20, address: '0x102', state: 'default' },
        { id: 3, value: 30, address: '0x103', state: 'new' }
      ],
      wires: ['default', 'new'],
      variables: { head: '0x101', current: '0x102', newNode: '0x103' }
    });

    // Step 8: Completed list tour
    demoSteps.push({
      label: "🎉 Auto Tour Complete! You now have a Linked List with nodes 10 -> 20 -> 30.",
      activeLine: 19,
      nodes: [
        { id: 1, value: 10, address: '0x101', state: 'default' },
        { id: 2, value: 20, address: '0x102', state: 'default' },
        { id: 3, value: 30, address: '0x103', state: 'default' }
      ],
      wires: ['default', 'default'],
      variables: { head: '0x101', current: 'NULL', newNode: 'NULL' }
    });

    setSteps(demoSteps);
    setCurrentStepIndex(0);
    setIsPlaying(true); 
    
    setNodes([
      { id: 1, value: 10, address: '0x101' },
      { id: 2, value: 20, address: '0x102' },
      { id: 3, value: 30, address: '0x103' }
    ]);
    
    setIsDemoRunning(false);
  };

  // Code Definition for C
  const getCCode = () => {
    if (listType === 'doubly') {
      return [
        { line: 1, text: "struct Node {" },
        { line: 2, text: "    int data;" },
        { line: 3, text: "    struct Node* next;" },
        { line: 4, text: "    struct Node* prev;" },
        { line: 5, text: "};" },
        { line: 6, text: "" },
        { line: 7, text: "void insertAtPos(struct Node** head, int val, int pos) {" },
        { line: 8, text: "    struct Node* newNode = createNode(val);" },
        { line: 9, text: "    if (pos == 1) {" },
        { line: 10, text: "        newNode->next = *head;" },
        { line: 11, text: "        if (*head) (*head)->prev = newNode;" },
        { line: 12, text: "        *head = newNode;" },
        { line: 13, text: "        return;" },
        { line: 14, text: "    }" },
        { line: 15, text: "    struct Node* current = *head;" },
        { line: 16, text: "    for(int i=1; i < pos-1 && current; i++) {" },
        { line: 17, text: "        current = current->next;" },
        { line: 18, text: "    }" },
        { line: 19, text: "    newNode->next = current->next;" },
        { line: 20, text: "    if (current->next) current->next->prev = newNode;" },
        { line: 21, text: "    current->next = newNode;" },
        { line: 22, text: "    newNode->prev = current;" },
        { line: 23, text: "}" }
      ];
    } else if (listType === 'circular') {
      return [
        { line: 1, text: "struct Node {" },
        { line: 2, text: "    int data;" },
        { line: 3, text: "    struct Node* next;" },
        { line: 4, text: "};" },
        { line: 5, text: "" },
        { line: 6, text: "void insertAtPos(struct Node** head, int val, int pos) {" },
        { line: 7, text: "    struct Node* newNode = createNode(val);" },
        { line: 8, text: "    if (pos == 1) {" },
        { line: 9, text: "        struct Node* temp = *head;" },
        { line: 10, text: "        while(temp->next != *head) temp = temp->next;" },
        { line: 11, text: "        newNode->next = *head;" },
        { line: 12, text: "        temp->next = newNode;" },
        { line: 13, text: "        *head = newNode;" },
        { line: 14, text: "        return;" },
        { line: 15, text: "    }" },
        { line: 16, text: "    struct Node* current = *head;" },
        { line: 17, text: "    for(int i=1; i < pos-1; i++) {" },
        { line: 18, text: "        current = current->next;" },
        { line: 19, text: "    }" },
        { line: 20, text: "    newNode->next = current->next;" },
        { line: 21, text: "    current->next = newNode;" },
        { line: 22, text: "}" }
      ];
    } else {
      // Singly
      return [
        { line: 1, text: "struct Node {" },
        { line: 2, text: "    int data;" },
        { line: 3, text: "    struct Node* next;" },
        { line: 4, text: "};" },
        { line: 5, text: "" },
        { line: 6, text: "void insertAtPos(struct Node** head, int val, int pos) {" },
        { line: 7, text: "    struct Node* newNode = createNode(val);" },
        { line: 8, text: "    if (pos == 1) {" },
        { line: 9, text: "        newNode->next = *head;" },
        { line: 10, text: "        *head = newNode;" },
        { line: 11, text: "        return;" },
        { line: 12, text: "    }" },
        { line: 13, text: "    struct Node* current = *head;" },
        { line: 14, text: "    for(int i=1; i < pos-1; i++) {" },
        { line: 15, text: "        current = current->next;" },
        { line: 16, text: "    }" },
        { line: 17, text: "    newNode->next = current->next;" },
        { line: 18, text: "    current->next = newNode;" },
        { line: 19, text: "}" }
      ];
    }
  };

  // Generate steps based on active operations
  const generateSteps = () => {
    const val = parseInt(inputValue) || 10;
    const pos = parseInt(inputPosition) || 2;
    const initialNodes = [...nodes];
    const newSteps = [];

    // If list is empty
    if (initialNodes.length === 0) {
      if (operation.includes('insert')) {
        // Step 0: Initial State
        newSteps.push({
          label: "Linked List is empty. HEAD points to NULL.",
          activeLine: 7,
          nodes: [],
          wires: [],
          variables: { head: 'NULL', current: 'NULL', newNode: 'NULL' }
        });

        // Step 1: Create New Node
        const newNodeObj = { id: 99, value: val, address: '0x101', state: 'new', isVirtual: true };
        newSteps.push({
          label: `Allocate memory for HEAD node with data: ${val}.`,
          activeLine: 8,
          nodes: [newNodeObj],
          wires: [],
          variables: { head: 'NULL', current: 'NULL', newNode: '0x101' }
        });

        // Step 2: Point HEAD -> New Node
        newSteps.push({
          label: "Update HEAD pointer to point to the new node at 0x101.",
          activeLine: 10,
          nodes: [{ ...newNodeObj, state: 'default' }],
          wires: [],
          variables: { head: '0x101', current: 'NULL', newNode: 'NULL' }
        });

        setSteps(newSteps);
        setCurrentStepIndex(0);
        return;
      } else {
        newSteps.push({
          label: "Linked List is empty. No operations to animate.",
          activeLine: 7,
          nodes: [],
          wires: [],
          variables: { head: 'NULL', current: 'NULL', newNode: 'NULL' }
        });
        setSteps(newSteps);
        setCurrentStepIndex(0);
        return;
      }
    }

    // Step 0: Initial State
    newSteps.push({
      label: "Initial linked list state before operation starts.",
      activeLine: 7,
      nodes: initialNodes.map(n => ({ ...n, state: 'default' })),
      wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
      variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: 'NULL' }
    });

    // Step 1: Create New Node
    const newNodeObj = { id: 99, value: val, address: '0x200', state: 'new', isVirtual: true };
    newSteps.push({
      label: `Allocate memory for new node with data: ${val}.`,
      activeLine: 8,
      nodes: [...initialNodes.map(n => ({ ...n, state: 'default' })), newNodeObj],
      wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
      variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: '0x200' }
    });

    // Step 2: Initialize Traversal (Set current to head)
    newSteps.push({
      label: "Point traversal pointer 'current' to HEAD.",
      activeLine: 13,
      nodes: [...initialNodes.map((n, i) => ({ ...n, state: i === 0 ? 'active' : 'default' })), newNodeObj],
      wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
      variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[0]?.address || 'NULL', newNode: '0x200' }
    });

    // Step 3: Traverse to Position
    const maxTraverse = Math.min(pos - 1, initialNodes.length);
    for (let i = 1; i < maxTraverse; i++) {
      newSteps.push({
        label: `Traverse current pointer next. Current is at node index ${i}.`,
        activeLine: 15,
        nodes: [...initialNodes.map((n, idx) => ({ ...n, state: idx === i ? 'active' : 'default' })), newNodeObj],
        wires: initialNodes.map((_, idx) => {
          if (idx === i - 1) return 'traversal';
          return idx < initialNodes.length - 1 ? 'default' : 'none';
        }),
        variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[i]?.address || 'NULL', newNode: '0x200' }
      });
    }

    // Step 4: Link New Node -> Next Node
    const nextNodeAddress = initialNodes[maxTraverse]?.address || 'NULL';
    newSteps.push({
      label: `Set newNode->next to current->next (${nextNodeAddress}).`,
      activeLine: 17,
      nodes: [...initialNodes.map((n, idx) => ({ ...n, state: idx === maxTraverse - 1 ? 'active' : 'default' })), { ...newNodeObj, state: 'new' }],
      wires: [
        ...initialNodes.map((_, idx) => {
          if (idx === maxTraverse - 1) return 'disconnecting';
          return idx < initialNodes.length - 1 ? 'default' : 'none';
        }),
        'new-next' // Virtual pointer from new node
      ],
      variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[maxTraverse - 1]?.address || 'NULL', newNode: '0x200' }
    });

    // Step 5: Link Current Node -> New Node
    const finalNodes = [...initialNodes];
    finalNodes.splice(maxTraverse, 0, { id: 99, value: val, address: '0x200' });
    newSteps.push({
      label: "Update current->next to point to the new node.",
      activeLine: 18,
      nodes: finalNodes.map((n) => ({ ...n, state: n.id === 99 ? 'new' : 'default' })),
      wires: finalNodes.map((_, i) => i < finalNodes.length - 1 ? (i === maxTraverse - 1 || i === maxTraverse ? 'new' : 'default') : 'none'),
      variables: { head: finalNodes[0]?.address || 'NULL', current: finalNodes[maxTraverse - 1]?.address || 'NULL', newNode: '0x200' }
    });

    // Step 6: Final clean state
    newSteps.push({
      label: "Insertion operation complete. Linked List is synchronized.",
      activeLine: 19,
      nodes: finalNodes.map(n => ({ ...n, state: 'default' })),
      wires: finalNodes.map((_, i) => i < finalNodes.length - 1 ? 'default' : 'none'),
      variables: { head: finalNodes[0]?.address || 'NULL', current: 'NULL', newNode: 'NULL' }
    });

    setSteps(newSteps);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    // Don't regenerate steps while an animation is actively playing
    if (isAnimatingRef.current) return;
    generateSteps();
  }, [listType, operation, nodes]);

  // Handle playing simulation
  useEffect(() => {
    if (isPlaying) {
      isAnimatingRef.current = true;
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            isAnimatingRef.current = false;
            // Auto-commit pending nodes after animation finishes
            if (pendingNodesRef.current) {
              setTimeout(() => {
                setNodes(pendingNodesRef.current);
                pendingNodesRef.current = null;
              }, 600);
            }
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / speed);
    } else {
      clearInterval(playTimerRef.current);
    }
    return () => clearInterval(playTimerRef.current);
  }, [isPlaying, steps, speed]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
  };
  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const activeStep = steps[currentStepIndex] || {
    label: "Loading...",
    activeLine: 7,
    nodes: nodes.map(n => ({ ...n, state: 'default' })),
    wires: [],
    variables: { head: 'NULL', current: 'NULL', newNode: 'NULL' }
  };

  // Perform operational change — compute final nodes, generate steps, and animate
  const executeDirectOperation = () => {
    if (isPlaying) return; // Don't allow while already animating
    
    const val = parseInt(inputValue) || 10;
    const pos = parseInt(inputPosition) || 1;
    let nextNodes = [...nodes];
    const newAddr = `0x${Math.floor(Math.random() * 900 + 100)}`;

    if (operation === 'insertBeginning') {
      nextNodes.unshift({ id: Date.now(), value: val, address: newAddr });
    } else if (operation === 'insertEnd') {
      nextNodes.push({ id: Date.now(), value: val, address: newAddr });
    } else if (operation === 'insertPosition') {
      const index = Math.max(0, Math.min(pos - 1, nextNodes.length));
      nextNodes.splice(index, 0, { id: Date.now(), value: val, address: newAddr });
    } else if (operation === 'deleteBeginning') {
      nextNodes.shift();
    } else if (operation === 'deleteEnd') {
      nextNodes.pop();
    } else if (operation === 'deletePosition') {
      const index = Math.max(0, Math.min(pos - 1, nextNodes.length - 1));
      nextNodes.splice(index, 1);
    } else if (operation === 'clear') {
      nextNodes = [];
    }

    // Store the final nodes to commit after animation completes
    pendingNodesRef.current = nextNodes;
    
    // Generate steps based on current state, then start playing
    generateSteps();
    setCurrentStepIndex(0);
    // Small delay to ensure steps are set before playing
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  };

  return (
    <div className={`w-full flex flex-col font-sans db-page-wrapper transition-colors duration-300 ${
      isDarkMode ? 'bg-[#001621] text-[#f8fafc]' : 'bg-white text-slate-800'
    } overflow-x-hidden ${isGameRotated ? 'rotate-landscape-mode' : 'min-h-screen lg:h-screen lg:overflow-hidden'}`}>
      
      {/* 1. TOP HEADER BAR */}
      <header className={`h-16 shrink-0 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#001621]/90 border-b border-[#FF4103]/20 shadow-2xl' : 'bg-white border-b border-slate-200 shadow-sm'
      } flex items-center justify-between px-6 relative z-20`}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-all border ${
            isDarkMode ? 'hover:bg-[#FF4103]/10 text-[#FF4103] border-[#FF4103]/20' : 'hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className={`text-sm font-black tracking-widest ${isDarkMode ? 'text-[#FF4103]' : 'text-slate-800'}`}>EDUVERSE AI</span>
            <span className="text-xs text-slate-500 font-semibold">Linked List Visual Lab</span>
          </div>
        </div>

        {/* Current State / Speed Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={startAutoDemo}
            disabled={isDemoRunning}
            className={`px-3 py-1.5 rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition-all ${
              isDemoRunning 
                ? 'bg-slate-400 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-emerald-500/25 shadow-lg'
            }`}
          >
            <Film className="w-4 h-4 animate-pulse" />
            <span>🎥 Auto Demo</span>
          </button>

          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] uppercase font-bold tracking-widest ${
            isDarkMode ? 'bg-[#001621]/80 border-[#FF4103]/20' : 'bg-white border-slate-200'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4103] animate-pulse"></span>
            Mode: {listType} List
          </div>

          <div className={`flex items-center p-0.5 rounded-xl border ${isDarkMode ? 'bg-[#001621] border-[#FF4103]/20' : 'bg-white border-slate-200'}`}>
            {[0.5, 1, 2].map(s => (
              <button 
                key={s} 
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                  speed === s ? 'bg-[#3B82F6] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Game Mode Rotate Button */}
          <button 
            onClick={() => {
              const nextVal = !isGameRotated;
              setIsGameRotated(nextVal);
              localStorage.setItem('dsa_game_mode', nextVal ? 'true' : 'false');
            }}
            className="px-3.5 py-1.5 bg-[#FF4103] text-white rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-[#d63200]"
          >
            <span>🎮 Rotate UI</span>
          </button>
          <ThemeToggleButton />
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className={`flex-1 flex max-w-[1920px] mx-auto w-full overflow-hidden ${
        isGameRotated 
          ? 'flex-row h-[calc(100vw-64px)]' 
          : 'flex-col lg:flex-row h-auto lg:h-[calc(100vh-64px)]'
      }`}>
        
        {/* ==========================================
            LEFT PANEL: INTERACTIVE CONFIG (25% Width)
        =========================================== */}
        <div className={`p-6 flex flex-col justify-between overflow-y-auto shrink-0 relative z-10 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#001621]/80 border-r border-[#FF4103]/10' : 'bg-white border-r border-slate-200'
        } ${isGameRotated ? 'w-[25%] h-full gap-4' : 'w-full lg:w-[25%] h-auto lg:h-full gap-8'}`}>
          
          <div className="space-y-6">
            <div className={`border-b pb-4 ${isDarkMode ? 'border-[#FF4103]/10' : 'border-slate-200'}`}>
              <h2 className="text-lg font-black text-[#3B82F6] flex items-center gap-2 tracking-wider">
                <Compass className="w-5 h-5 animate-spin" /> CONFIG LAB
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Set up architecture node insertions or deletions.</p>
            </div>

            {/* List Type Segmented Toggle */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold">List Architecture</label>
              <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${isDarkMode ? 'bg-[#001621] border-[#FF4103]/20' : 'bg-slate-50 border-slate-200'}`}>
                {['singly', 'doubly', 'circular'].map(type => (
                  <button 
                    key={type} 
                    onClick={() => setListType(type)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                      listType === type ? 'bg-[#3B82F6] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector & Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold">Operation</label>
                <select 
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className={`w-full border text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] ${
                    isDarkMode ? 'bg-[#001621] border-[#FF4103]/20 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="insertBeginning">Insert Beginning</option>
                  <option value="insertEnd">Insert End</option>
                  <option value="insertPosition">Insert at Position</option>
                  <option value="deleteBeginning">Delete Beginning</option>
                  <option value="deleteEnd">Delete End</option>
                  <option value="deletePosition">Delete at Position</option>
                  <option value="clear">Clear List</option>
                </select>
              </div>

              {/* Value Input */}
              {operation.includes('insert') && (
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold">Value</label>
                  <input 
                    type="number" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter Value"
                    className={`w-full border text-sm font-bold py-2 px-3 rounded-xl focus:outline-none focus:border-[#3B82F6] text-center ${
                      isDarkMode ? 'bg-[#001621] border-[#FF4103]/20 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              )}

              {/* Position Input */}
              {operation.includes('Position') && (
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold">Position Index</label>
                  <input 
                    type="number" 
                    value={inputPosition}
                    onChange={(e) => setInputPosition(e.target.value)}
                    placeholder="Enter Position"
                    className={`w-full border text-sm font-bold py-2 px-3 rounded-xl focus:outline-none focus:border-[#3B82F6] text-center ${
                      isDarkMode ? 'bg-[#001621] border-[#FF4103]/20 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              )}

              <button 
                onClick={executeDirectOperation}
                disabled={isPlaying}
                className={`w-full text-white text-xs font-black py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
                  isPlaying 
                    ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-[#3B82F6]/20'
                }`}
              >
                {isPlaying ? (
                  <><Pause className="w-3.5 h-3.5" /> ANIMATING...</>
                ) : (
                  <><Play className="w-3.5 h-3.5 fill-current" /> START ANIMATION</>
                )}
              </button>
            </div>

            {/* Debugger Actions */}
            <div className={`border-t pt-4 space-y-3 ${isDarkMode ? 'border-[#FF4103]/10' : 'border-slate-200'}`}>
              <label className="block text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold">Debugger Controller</label>
              <div className={`flex items-center justify-between p-1.5 rounded-xl border gap-1 ${
                isDarkMode ? 'bg-[#001621] border-[#FF4103]/20' : 'bg-slate-50 border-slate-200'
              }`}>
                <button onClick={handleReset} className="p-2 hover:bg-[#3B82F6]/10 rounded-lg transition text-slate-400 hover:text-slate-800" title="Reset Simulation">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={handlePrev} className="p-2 hover:bg-[#3B82F6]/10 rounded-lg transition text-slate-400 hover:text-slate-800" title="Previous Step">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={handlePlayPause} className="p-2.5 bg-[#3B82F6] text-white hover:bg-[#2563EB] rounded-lg transition shadow-lg shadow-[#3B82F6]/20" title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button onClick={handleNext} className="p-2 hover:bg-[#3B82F6]/10 rounded-lg transition text-slate-400 hover:text-slate-800" title="Next Step">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Settings Display Toggles */}
          <div className={`border-t pt-4 space-y-2 relative overflow-hidden ${isDarkMode ? 'border-[#FF4103]/10' : 'border-slate-200'}`}>
            {/* Watermark Background */}
            <div className="absolute right-0 bottom-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none select-none flex flex-col items-center justify-center translate-y-1 translate-x-1">
              <Volume2 className="w-16 h-16 text-blue-500" />
              <span className="text-[14px] font-black tracking-widest text-blue-500 -mt-1">FRIDAY</span>
            </div>

            {[
              { label: "Show Memory Addresses", state: showAddresses, set: setShowAddresses },
              { label: "Show Pointer Badges", state: showPointerNames, set: setShowPointerNames },
              { label: "Show Interactive Complexity", state: showComplexity, set: setShowComplexity },
              { label: "Enable Friday Voice Guide", state: isEnabled, set: toggleEnabled, isFridayToggle: true }
            ].map(opt => (
              <label key={opt.label} className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors relative z-10">
                <input 
                  type="checkbox" 
                  checked={opt.state} 
                  onChange={(e) => opt.isFridayToggle ? opt.set() : opt.set(e.target.checked)}
                  className="accent-[#3B82F6] rounded border-slate-300"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ==========================================
            CENTER PANEL: INFINITE CANVAS VISUALIZER (45% Width)
        =========================================== */}
        <div 
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`flex-1 flex flex-col relative justify-between overflow-hidden cursor-grab active:cursor-grabbing shrink-0 select-none transition-colors duration-300 ${
            isDarkMode ? 'bg-[#001621]/90' : 'bg-white'
          } ${isGameRotated ? 'w-[45%] h-full' : 'w-full lg:w-[45%] h-[580px] lg:h-full'}`}
        >
          {/* SVG Background Grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDarkMode ? "#FF4103" : "#3B82F6"} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Top Canvas Bar */}
          <div className={`h-12 border-b px-6 flex items-center justify-between text-[10px] font-mono shrink-0 relative z-10 transition-colors duration-300 ${
            isDarkMode ? 'border-[#FF4103]/10 bg-[#001621]/80 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
          }`}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              STEP: <span className="text-[#3B82F6] font-black">{currentStepIndex + 1} / {steps.length}</span>
            </span>
            <div className="flex items-center gap-2">
              <button onClick={resetCanvas} className={`p-1 rounded border transition-all ${
                isDarkMode ? 'hover:bg-[#FF4103]/10 border-[#FF4103]/20 text-[#FF4103]' : 'hover:bg-slate-100 border-slate-300 text-slate-700'
              }`} title="Recenter View">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <span className="border-l border-slate-300 h-4 mx-1"></span>
              <span>SCALE: {Math.round(zoomScale * 100)}%</span>
            </div>
          </div>

          {/* Core Transforming Group */}
          <div className="flex-1 w-full flex flex-col justify-center items-center relative overflow-hidden">
            {activeStep.nodes?.length === 0 ? (
              <div className="flex flex-col items-center gap-4 text-center max-w-xs relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#3B82F6]/10 border-2 border-dashed border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
                  <Database className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">List is Empty</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Please create a head node using "Insert Beginning" or trigger the Auto Demo above.</p>
              </div>
            ) : (
              <div 
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                  transformOrigin: 'center',
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
                className="flex items-center justify-center gap-1.5 flex-wrap max-w-2xl relative z-10 px-12"
              >
                {/* Head pointer name banner */}
                {showPointerNames && activeStep.nodes?.length > 0 && (
                  <div className="absolute -top-14 left-8 flex flex-col items-center">
                    <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-md shadow-sm border ${
                      isDarkMode ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>HEAD</span>
                    <div className="w-[2px] h-5 bg-emerald-400/60"></div>
                  </div>
                )}

                {/* Node Rendering Loop */}
                <AnimatePresence mode="popLayout">
                  {activeStep.nodes?.map((node, index) => {
                    const isNew = node.state === 'new';
                    const isActive = node.state === 'active';
                    const isHead = index === 0;

                    return (
                      <motion.div 
                        key={node.id} 
                        layout
                        initial={{ scale: 0.5, opacity: 0, y: -50 }}
                        animate={{ 
                          scale: isActive ? 1.05 : 1, 
                          opacity: 1, 
                          y: isNew ? -70 : 0,
                        }}
                        exit={{ scale: 0.5, opacity: 0, y: 50, transition: { duration: 0.3 } }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="flex items-center shrink-0 relative"
                      >
                        {/* Node Card */}
                        <div 
                          className={`relative flex rounded-xl overflow-hidden transition-all duration-300 ${
                            isActive 
                              ? 'shadow-[0_8px_30px_rgba(79,70,229,0.4)]' 
                              : isNew 
                                ? 'shadow-[0_8px_30px_rgba(79,70,229,0.3)]' 
                                : 'shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
                          }`}
                          style={{ width: '140px', height: '64px' }}
                        >
                          {/* Data Part (Left ~70%) */}
                          <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? 'bg-[#4F46E5]' 
                              : isNew 
                                ? 'bg-[#4338CA]' 
                                : isHead 
                                  ? 'bg-[#4F46E5]' 
                                  : isDarkMode 
                                    ? 'bg-[#0f1c2e] border-r border-slate-700' 
                                    : 'bg-white border-r border-slate-200'
                          }`}>
                            <span className={`text-2xl font-black leading-none ${
                              (isActive || isNew || isHead) 
                                ? 'text-white' 
                                : isDarkMode 
                                  ? 'text-slate-200' 
                                  : 'text-slate-700'
                            }`}>{node.value}</span>
                          </div>

                          {/* Link Part (Right ~30%) */}
                          <div className={`flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? 'bg-[#3730A3]' 
                              : isNew 
                                ? 'bg-[#312E81]' 
                                : isHead 
                                  ? 'bg-[#3730A3]' 
                                  : isDarkMode 
                                    ? 'bg-[#0a1420]' 
                                    : 'bg-slate-50'
                          }`} style={{ width: '44px' }}>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                              isActive ? 'bg-white/30 animate-pulse' : ''
                            }`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                (isActive || isNew || isHead) 
                                  ? 'bg-white/80' 
                                  : isDarkMode 
                                    ? 'bg-slate-500' 
                                    : 'bg-slate-400'
                              }`} />
                            </div>
                          </div>

                          {/* Outer border */}
                          <div className={`absolute inset-0 rounded-xl border-2 pointer-events-none ${
                            isActive 
                              ? 'border-[#4F46E5]' 
                              : isNew 
                                ? 'border-[#4338CA]' 
                                : isHead 
                                  ? 'border-[#4F46E5]' 
                                  : isDarkMode 
                                    ? 'border-slate-700' 
                                    : 'border-slate-200'
                          }`} />
                        </div>

                        {/* Memory Address Badge (below node) */}
                        {showAddresses && (
                          <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold ${
                            isDarkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {node.address}
                          </div>
                        )}

                        {/* Top banner label for New Node */}
                        {isNew && (
                          <div className="absolute -top-7 left-0 right-0 text-center">
                            <span className="text-[8px] font-extrabold tracking-widest text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              NEW NODE
                            </span>
                          </div>
                        )}

                        {/* Pointer label under active node */}
                        {isActive && (
                          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                            <div className="w-[2px] h-3 bg-[#4F46E5]"></div>
                            <span className="text-[8px] font-extrabold tracking-wider text-white bg-[#4F46E5] px-2.5 py-0.5 rounded-md shadow-md uppercase">CURRENT</span>
                          </div>
                        )}

                        {/* SVG Connector Arrow */}
                        {index < (activeStep.nodes?.length - 1) && (
                          <div className="flex items-center justify-center relative shrink-0" style={{ width: '48px', height: '64px' }}>
                            <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 48 64">
                              <defs>
                                <filter id={`glow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="2" result="blur" />
                                  <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                  </feMerge>
                                </filter>
                              </defs>
                              {isNew ? (
                                <>
                                  <path 
                                    d="M -20,-46 C 14,-46 14,32 38,32" 
                                    fill="none" 
                                    stroke="#4F46E5" 
                                    strokeWidth="2.5"
                                    strokeDasharray="6,3"
                                  />
                                  <polygon points="36,28 46,32 36,36" fill="#4F46E5" />
                                </>
                              ) : (
                                <>
                                  <motion.line 
                                    x1="-20" y1="32" x2="38" y2="32" 
                                    stroke={
                                      activeStep.wires?.[index] === 'traversal' 
                                        ? '#4F46E5' 
                                        : (isDarkMode ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.5)')
                                    } 
                                    strokeWidth={activeStep.wires?.[index] === 'traversal' ? '4' : '2.5'}
                                    strokeDasharray={activeStep.wires?.[index] === 'traversal' ? '8, 4' : 'none'}
                                    animate={activeStep.wires?.[index] === 'traversal' ? { strokeDashoffset: [0, -24] } : {}}
                                    transition={{ ease: "linear", duration: 0.5, repeat: Infinity }}
                                    filter={activeStep.wires?.[index] === 'traversal' ? `url(#glow-${index})` : 'none'}
                                  />
                                  <polygon 
                                    points="36,28 46,32 36,36" 
                                    fill={
                                      activeStep.wires?.[index] === 'traversal' 
                                        ? '#4F46E5' 
                                        : (isDarkMode ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.5)')
                                    } 
                                    filter={activeStep.wires?.[index] === 'traversal' ? `url(#glow-${index})` : 'none'}
                                  />
                                  {activeStep.wires?.[index] === 'traversal' && (
                                    <motion.circle 
                                      r="3.5" 
                                      fill="#4F46E5" 
                                      cy="32"
                                      animate={{ cx: [-20, 46] }} 
                                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                      filter={`url(#glow-${index})`}
                                    />
                                  )}
                                </>
                              )}
                            </svg>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* NULL terminator */}
                {activeStep.nodes?.length > 0 && (
                  <div className={`flex items-center shrink-0 ml-1`}>
                    <div className={`text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      NULL
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Circular list loopback representation */}
            {listType === 'circular' && activeStep.nodes?.length > 0 && (
              <div className="absolute bottom-12 w-full max-w-sm h-8 flex items-center justify-center">
                <svg className="w-full h-12" viewBox="0 0 400 40">
                  <path d="M 320,10 C 320,30 80,30 80,10" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4,4" className="opacity-40" />
                  <polygon points="76,14 80,4 84,14" fill="#3B82F6" className="opacity-60" />
                  <text x="140" y="32" fill="#3B82F6" className="text-[9px] font-mono font-bold tracking-widest opacity-60">LOOPBACK TO HEAD</text>
                </svg>
              </div>
            )}
          </div>

          {/* Bottom Execution Log / Explanation */}
          <div className={`border-t p-5 flex flex-col justify-center items-center gap-1.5 z-10 transition-colors duration-300 ${
            isDarkMode ? 'border-[#FF4103]/10 bg-[#001621]/90 text-white' : 'border-slate-200 bg-white text-slate-800'
          }`}>
            <h4 className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#3B82F6]" /> Step Explanation
            </h4>
            <span className="text-xs font-semibold text-center max-w-lg leading-relaxed">{activeStep.label}</span>
          </div>
        </div>

        {/* ==========================================
            RIGHT PANEL: CODE / WORKSPACE (30% Width)
        =========================================== */}
        <div className={`border-l flex flex-col overflow-hidden shrink-0 relative z-10 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#001621]/80 border-[#FF4103]/10' : 'bg-white border-slate-200'
        } ${isGameRotated ? 'w-[30%] h-full' : 'w-full lg:w-[30%] h-auto lg:h-full'}`}>
          
          {/* Work Tabs */}
          <div className={`grid grid-cols-3 border-b shrink-0 transition-colors duration-300 ${
            isDarkMode ? 'border-[#FF4103]/10 bg-[#001621]/90' : 'border-slate-200 bg-slate-50'
          }`}>
            {[
              { id: 'code', label: 'C Code', icon: Code2 },
              { id: 'variables', label: 'Variables', icon: Cpu },
              { id: 'memory', label: 'Heap Map', icon: Database }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
                  activeTab === tab.id 
                    ? 'border-[#3B82F6] text-[#3B82F6] bg-white/5' 
                    : 'border-transparent text-slate-400 hover:text-slate-800'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className={`flex-1 overflow-auto p-5 transition-colors duration-300 ${isDarkMode ? 'bg-[#001621]' : 'bg-white'}`}>
            <AnimatePresence mode="wait">
              {activeTab === 'code' && (
                <motion.div 
                  key="code" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="font-mono text-xs leading-relaxed space-y-1 h-full"
                >
                  <pre className={`text-[11px] p-4 rounded-xl border overflow-y-auto h-full font-mono transition-colors duration-300 ${
                    isDarkMode ? 'bg-[#001621] border-[#FF4103]/20' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <code>
                      {getCCode().map((line) => {
                        const isLineActive = activeStep.activeLine === line.line;
                        return (
                          <div 
                            key={line.line}
                            className={`py-0.5 px-2 rounded transition-all duration-200 flex items-start ${
                              isLineActive 
                                ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-l-4 border-[#3B82F6] font-bold' 
                                : 'border-l-4 border-transparent text-slate-400'
                            }`}
                          >
                            <span className="w-6 text-slate-500 select-none shrink-0 text-right mr-2">{line.line}</span>
                            <span className="whitespace-pre">{line.text}</span>
                          </div>
                        );
                      })}
                    </code>
                  </pre>
                </motion.div>
              )}

              {activeTab === 'variables' && (
                <motion.div 
                  key="variables" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="space-y-4 font-mono text-xs text-slate-600"
                >
                  <h4 className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider mb-2">Live Stack Frame</h4>
                  <div className={`border rounded-xl p-4 space-y-3 shadow-inner ${
                    isDarkMode ? 'bg-[#001621] border-[#FF4103]/20' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                      <span className="text-slate-500">head</span>
                      <span className="font-bold text-xs">{activeStep.variables?.head}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                      <span className="text-slate-500">current</span>
                      <span className="text-[#3B82F6] font-bold text-xs">{activeStep.variables?.current}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                      <span className="text-slate-500">newNode</span>
                      <span className="text-blue-500 font-bold text-xs">{activeStep.variables?.newNode}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'memory' && (
                <motion.div 
                  key="memory" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="space-y-4 font-mono text-xs text-slate-600"
                >
                  <h4 className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider mb-2">Heap Allocation</h4>
                  <div className="space-y-2">
                    {activeStep.nodes?.map((node, i) => (
                      <div key={node.id} className={`flex items-center gap-3 border p-2.5 rounded-lg justify-between shadow-inner ${
                        isDarkMode ? 'bg-[#001621] border-[#FF4103]/20' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-[#3B82F6] text-[10px] font-bold">{node.address}</span>
                        <div className="flex gap-2">
                          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 text-[10px] font-bold">Val: {node.value}</span>
                          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[#3B82F6] text-[10px] font-bold">
                            Next: {i < activeStep.nodes.length - 1 ? activeStep.nodes[i+1].address : 'NULL'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Complexity panel overlay */}
          {showComplexity && (
            <div className={`border-t p-4 space-y-2 transition-colors duration-300 ${
              isDarkMode ? 'bg-[#001621] border-t border-[#FF4103]/20' : 'bg-white border-t border-slate-200'
            }`}>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>TIME COMPLEXITY:</span>
                <span className="text-[#3B82F6] font-mono font-black">O(N)</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>SPACE COMPLEXITY:</span>
                <span className="text-[#3B82F6] font-mono font-black">O(1)</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
