import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, SkipForward, SkipBack, RotateCcw, 
  ChevronRight, Cpu, Code2, Database, Zap, Settings, Info,
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Layers, Compass, Terminal, Film, Volume2,
  Timer, Heart, Trophy, AlertCircle, Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useVoiceAssistant } from '../context/VoiceContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import './DashboardTheme.css';

// Guided Practice tasks for Linked List
const PRACTICE_TASKS = [
  { step: 1, type: 'insertBeginning', value: 10, instruction: 'Insert 10 at the beginning of the list.', hint: 'Select "Insert Beginning", enter 10 in the value box, and click START ANIMATION.' },
  { step: 2, type: 'insertEnd', value: 20, instruction: 'Insert 20 at the end of the list.', hint: 'Select "Insert End", enter 20, and click START ANIMATION.' },
  { step: 3, type: 'insertPosition', value: 30, position: 2, instruction: 'Insert 30 at position index 2.', hint: 'Select "Insert at Position", enter 30 as value, 2 as position index, and run.' },
  { step: 4, type: 'deleteBeginning', instruction: 'Delete the node at the beginning of the list.', hint: 'Select "Delete Beginning" and click START ANIMATION.' },
  { step: 5, type: 'insertBeginning', value: 40, instruction: 'Insert 40 at the beginning of the list.', hint: 'Select "Insert Beginning", enter 40, and run.' },
  { step: 6, type: 'insertEnd', value: 50, instruction: 'Insert 50 at the end of the list.', hint: 'Select "Insert End", enter 50, and run.' },
  { step: 7, type: 'deleteEnd', instruction: 'Delete the node at the end of the list.', hint: 'Select "Delete End" and click START ANIMATION.' },
  { step: 8, type: 'deletePosition', position: 2, instruction: 'Delete the node at position index 2.', hint: 'Select "Delete at Position", enter 2 as position index, and run.' },
  { step: 9, type: 'insertEnd', value: 99, instruction: 'Insert 99 at the end of the list.', hint: 'Select "Insert End", enter 99, and run.' },
  { step: 10, type: 'clear', instruction: 'Clear the entire linked list.', hint: 'Select "Clear List" and click START ANIMATION.' }
];

// Challenge Level missions for Linked List
const CHALLENGE_MISSIONS = [
  {
    level: 1,
    description: 'Insert Beginning 10, then Insert End 20. What is the value of the head node?',
    actions: [
      { type: 'insertBeginning', value: 10 },
      { type: 'insertEnd', value: 20 }
    ],
    options: ['10', '20', 'None', '-1'],
    correct: '10'
  },
  {
    level: 2,
    description: 'Insert End 15, Insert End 30, and Delete Beginning. What is the head node\'s value?',
    actions: [
      { type: 'insertEnd', value: 15 },
      { type: 'insertEnd', value: 30 },
      { type: 'deleteBeginning' }
    ],
    options: ['15', '30', 'None', 'Error'],
    correct: '30'
  },
  {
    level: 3,
    description: 'Insert Beginning 40, then Insert at Position 2 with 50. Is the list empty?',
    actions: [
      { type: 'insertBeginning', value: 40 },
      { type: 'insertPosition', value: 50, position: 2 }
    ],
    options: ['Yes', 'No', 'Underflow', 'Overflow'],
    correct: 'No'
  },
  {
    level: 4,
    description: 'Insert End 100, Insert End 200, and Delete End. What is the number of nodes in the list?',
    actions: [
      { type: 'insertEnd', value: 100 },
      { type: 'insertEnd', value: 200 },
      { type: 'deleteEnd' }
    ],
    options: ['0', '1', '2', '3'],
    correct: '1'
  },
  {
    level: 5,
    description: 'Complete: Insert Beginning 9, then Delete Beginning. What is the value of Head pointer?',
    actions: [
      { type: 'insertBeginning', value: 9 },
      { type: 'deleteBeginning' }
    ],
    options: ['0', '-1', 'NULL', '9'],
    correct: 'NULL'
  }
];

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
  const [operation, setOperation] = useState('insertBeginning'); 
  const [inputValue, setInputValue] = useState('10');
  const [inputPosition, setInputPosition] = useState('2');
  const [activeTab, setActiveTab] = useState('code'); // code, variables, memory
  const [speed, setSpeed] = useState(1);
  
  // Settings Toggles
  const [showAddresses, setShowAddresses] = useState(true);
  const [showPointerNames, setShowPointerNames] = useState(true);
  const [showComplexity, setShowComplexity] = useState(true);

  // Linked list nodes state
  const [nodes, setNodes] = useState([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  // Debugger Execution State
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);
  const pendingNodesRef = useRef(null); 
  const isAnimatingRef = useRef(false); 

  // Mode Selection
  const [mode, setMode] = useState('Learn');

  // Debugger queue log
  const [operationsQueue, setOperationsQueue] = useState([]);
  const [currentOpIndex, setCurrentOpIndex] = useState(-1);

  // Practice Mode State
  const [practiceStep, setPracticeStep] = useState(0); 
  const [practiceXp, setPracticeXp] = useState(0);
  const [practiceAccuracy, setPracticeAccuracy] = useState(100);
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [practiceCorrectCount, setPracticeCorrectCount] = useState(0);
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [showHintIndex, setShowHintIndex] = useState(0);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [lastExplanation, setLastExplanation] = useState(null);

  // Challenge Mode State
  const [challengeStep, setChallengeStep] = useState(1);
  const [challengeXp, setChallengeXp] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(25);
  const [challengeFinished, setChallengeFinished] = useState(false);
  const [challengeFailed, setChallengeFailed] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSimulatingChallenge, setIsSimulatingChallenge] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

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

    demoSteps.push({
      label: "🎥 Welcome to the Auto Tour! We start with an empty Linked List.",
      activeLine: 7,
      nodes: [],
      wires: [],
      variables: { head: 'NULL', current: 'NULL', newNode: 'NULL' }
    });

    demoSteps.push({
      label: "Step 1: Allocate memory for the Head Node with data: 10.",
      activeLine: 8,
      nodes: [{ id: 1, value: 10, address: '0x101', state: 'new' }],
      wires: [],
      variables: { head: 'NULL', current: 'NULL', newNode: '0x101' }
    });

    demoSteps.push({
      label: "Step 2: Point the HEAD pointer to our new node at 0x101.",
      activeLine: 10,
      nodes: [{ id: 1, value: 10, address: '0x101', state: 'default' }],
      wires: [],
      variables: { head: '0x101', current: 'NULL', newNode: 'NULL' }
    });

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

    setSteps(demoSteps);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    
    // reset after demo completes
    const totalDemoDuration = demoSteps.length * (1500 / speed) + 500;
    setTimeout(() => {
      setIsDemoRunning(false);
      handleReset();
    }, totalDemoDuration);
  };

  // Generate intermediate steps for operations
  const generateSteps = () => {
    const newSteps = [];
    const val = parseInt(inputValue) || 10;
    const pos = parseInt(inputPosition) || 1;
    const initialNodes = [...nodes];

    if (operation === 'insertBeginning') {
      newSteps.push({
        label: "Initial linked list state.",
        activeLine: 7,
        nodes: initialNodes.map(n => ({ ...n, state: 'default' })),
        wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
        variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: 'NULL' }
      });

      const newNodeObj = { id: 99, value: val, address: '0x101', state: 'new', isVirtual: true };
      newSteps.push({
        label: `Allocate memory for new node with value ${val}.`,
        activeLine: 8,
        nodes: [newNodeObj, ...initialNodes.map(n => ({ ...n, state: 'default' }))],
        wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
        variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: '0x101' }
      });

      newSteps.push({
        label: `Point new node's next pointer to current head (${initialNodes[0]?.address || 'NULL'}).`,
        activeLine: 9,
        nodes: [newNodeObj, ...initialNodes.map(n => ({ ...n, state: 'default' }))],
        wires: ['new', ...initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none')],
        variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: '0x101' }
      });

      newSteps.push({
        label: "Update HEAD pointer to point to the new node at 0x101.",
        activeLine: 10,
        nodes: [{ ...newNodeObj, state: 'default' }, ...initialNodes.map(n => ({ ...n, state: 'default' }))],
        wires: ['default', ...initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none')],
        variables: { head: '0x101', current: 'NULL', newNode: 'NULL' }
      });

      setSteps(newSteps);
      setCurrentStepIndex(0);
      return;
    }

    if (operation === 'insertEnd') {
      newSteps.push({
        label: "Initial linked list state.",
        activeLine: 7,
        nodes: initialNodes.map(n => ({ ...n, state: 'default' })),
        wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
        variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: 'NULL' }
      });

      const newNodeObj = { id: 99, value: val, address: '0x200', state: 'new', isVirtual: true };
      newSteps.push({
        label: `Allocate memory for new node with value ${val}.`,
        activeLine: 8,
        nodes: [...initialNodes.map(n => ({ ...n, state: 'default' })), newNodeObj],
        wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
        variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: '0x200' }
      });

      if (initialNodes.length === 0) {
        newSteps.push({
          label: "List is empty, updating HEAD pointer to point to new node.",
          activeLine: 10,
          nodes: [{ ...newNodeObj, state: 'default' }],
          wires: [],
          variables: { head: '0x200', current: 'NULL', newNode: 'NULL' }
        });
        setSteps(newSteps);
        setCurrentStepIndex(0);
        return;
      }

      newSteps.push({
        label: "Point traversal pointer 'current' to HEAD.",
        activeLine: 13,
        nodes: [...initialNodes.map((n, i) => ({ ...n, state: i === 0 ? 'active' : 'default' })), newNodeObj],
        wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
        variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[0]?.address || 'NULL', newNode: '0x200' }
      });

      for (let i = 1; i < initialNodes.length; i++) {
        newSteps.push({
          label: `Traverse current. Current is at node index ${i}.`,
          activeLine: 15,
          nodes: [...initialNodes.map((n, idx) => ({ ...n, state: idx === i ? 'active' : 'default' })), newNodeObj],
          wires: initialNodes.map((_, idx) => {
            if (idx === i - 1) return 'traversal';
            return idx < initialNodes.length - 1 ? 'default' : 'none';
          }),
          variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[i]?.address || 'NULL', newNode: '0x200' }
        });
      }

      newSteps.push({
        label: "Link last node next pointer to new node.",
        activeLine: 18,
        nodes: [...initialNodes.map((n, idx) => ({ ...n, state: idx === initialNodes.length - 1 ? 'active' : 'default' })), { ...newNodeObj, state: 'default' }],
        wires: [...initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'), 'new'],
        variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[initialNodes.length - 1]?.address || 'NULL', newNode: '0x200' }
      });

      setSteps(newSteps);
      setCurrentStepIndex(0);
      return;
    }

    if (operation === 'insertPosition') {
      newSteps.push({
        label: "Initial linked list state.",
        activeLine: 7,
        nodes: initialNodes.map(n => ({ ...n, state: 'default' })),
        wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
        variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: 'NULL' }
      });

      const newNodeObj = { id: 99, value: val, address: '0x200', state: 'new', isVirtual: true };
      newSteps.push({
        label: `Allocate memory for new node with value ${val}.`,
        activeLine: 8,
        nodes: [...initialNodes.map(n => ({ ...n, state: 'default' })), newNodeObj],
        wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
        variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: '0x200' }
      });

      newSteps.push({
        label: "Point traversal pointer 'current' to HEAD.",
        activeLine: 13,
        nodes: [...initialNodes.map((n, i) => ({ ...n, state: i === 0 ? 'active' : 'default' })), newNodeObj],
        wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
        variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[0]?.address || 'NULL', newNode: '0x200' }
      });

      const maxTraverse = Math.min(pos - 1, initialNodes.length);
      for (let i = 1; i < maxTraverse; i++) {
        newSteps.push({
          label: `Traverse current. Current is at index ${i}.`,
          activeLine: 15,
          nodes: [...initialNodes.map((n, idx) => ({ ...n, state: idx === i ? 'active' : 'default' })), newNodeObj],
          wires: initialNodes.map((_, idx) => {
            if (idx === i - 1) return 'traversal';
            return idx < initialNodes.length - 1 ? 'default' : 'none';
          }),
          variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[i]?.address || 'NULL', newNode: '0x200' }
        });
      }

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
          'new-next'
        ],
        variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[maxTraverse - 1]?.address || 'NULL', newNode: '0x200' }
      });

      const finalNodes = [...initialNodes];
      finalNodes.splice(maxTraverse, 0, { id: 99, value: val, address: '0x200' });
      newSteps.push({
        label: "Update current->next to point to the new node.",
        activeLine: 18,
        nodes: finalNodes.map((n) => ({ ...n, state: n.id === 99 ? 'new' : 'default' })),
        wires: finalNodes.map((_, i) => i < finalNodes.length - 1 ? (i === maxTraverse - 1 || i === maxTraverse ? 'new' : 'default') : 'none'),
        variables: { head: finalNodes[0]?.address || 'NULL', current: finalNodes[maxTraverse - 1]?.address || 'NULL', newNode: '0x200' }
      });

      setSteps(newSteps);
      setCurrentStepIndex(0);
      return;
    }

    // Default Fallback
    newSteps.push({
      label: "Initial linked list state.",
      activeLine: 7,
      nodes: initialNodes.map(n => ({ ...n, state: 'default' })),
      wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
      variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: 'NULL' }
    });
    setSteps(newSteps);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
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

  // Challenge Timer Loop
  useEffect(() => {
    let timer;
    if (mode === 'Challenge' && !challengeFinished && !challengeFailed && !isSimulatingChallenge) {
      if (timeLeft <= 0) {
        handleChallengeWrong();
      } else {
        timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, mode, challengeFinished, challengeFailed, isSimulatingChallenge]);

  // Mode Reset
  useEffect(() => {
    handleReset();
    if (mode === 'Practice') {
      setPracticeStep(0);
      setPracticeFinished(false);
      setPracticeAttempts(0);
      setPracticeCorrectCount(0);
      setPracticeAccuracy(100);
      setPracticeXp(0);
      setPracticeFeedback(null);
      setShowHintIndex(0);
      setUnlockedBadges([]);
      setLastExplanation(null);
    } else if (mode === 'Challenge') {
      setChallengeStep(1);
      setChallengeFinished(false);
      setChallengeFailed(false);
      setLives(3);
      setTimeLeft(25);
      setChallengeXp(0);
      setSelectedOption(null);
      setIsSimulatingChallenge(false);
      setUnlockedAchievements([]);
    }
  }, [mode]);

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
    setNodes([]);
    setOperationsQueue([]);
    setCurrentOpIndex(-1);
  };

  const activeStep = steps[currentStepIndex] || {
    label: "Loading...",
    activeLine: 7,
    nodes: nodes.map(n => ({ ...n, state: 'default' })),
    wires: [],
    variables: { head: 'NULL', current: 'NULL', newNode: 'NULL' }
  };

  // Perform operational change
  const executeDirectOperation = () => {
    if (isPlaying) return; 
    
    const val = parseInt(inputValue) || 10;
    const pos = parseInt(inputPosition) || 1;
    let nextNodes = [...nodes];
    const newAddr = `0x${Math.floor(Math.random() * 900 + 100)}`;

    const opData = { type: operation, value: val, position: pos };
    const nextQueue = [...operationsQueue, opData];
    setOperationsQueue(nextQueue);
    setCurrentOpIndex(nextQueue.length - 1);

    if (mode === 'Practice') {
      validatePracticeAction(operation, val, pos);
      return;
    }

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

    pendingNodesRef.current = nextNodes;
    generateSteps();
    setCurrentStepIndex(0);
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  };

  // Direct operations (for simulation/challenge)
  const handleInsertBeginningDirect = (val) => {
    setNodes(prev => [{ id: Date.now() + Math.random(), value: val, address: `0x${Math.floor(Math.random() * 900 + 100)}` }, ...prev]);
  };

  const handleInsertEndDirect = (val) => {
    setNodes(prev => [...prev, { id: Date.now() + Math.random(), value: val, address: `0x${Math.floor(Math.random() * 900 + 100)}` }]);
  };

  const handleInsertPositionDirect = (val, pos) => {
    setNodes(prev => {
      const next = [...prev];
      const index = Math.max(0, Math.min(pos - 1, next.length));
      next.splice(index, 0, { id: Date.now() + Math.random(), value: val, address: `0x${Math.floor(Math.random() * 900 + 100)}` });
      return next;
    });
  };

  const handleDeleteBeginningDirect = () => {
    setNodes(prev => prev.slice(1));
  };

  const handleDeleteEndDirect = () => {
    setNodes(prev => prev.slice(0, -1));
  };

  const handleDeletePositionDirect = (pos) => {
    setNodes(prev => {
      const next = [...prev];
      const index = Math.max(0, Math.min(pos - 1, next.length - 1));
      next.splice(index, 1);
      return next;
    });
  };

  // PRACTICE VALIDATION
  const validatePracticeAction = (actionType, val = null, pos = null) => {
    const currentTask = PRACTICE_TASKS[practiceStep];
    const newAttempts = practiceAttempts + 1;
    setPracticeAttempts(newAttempts);

    let isCorrect = false;
    if (actionType === currentTask.type) {
      if (actionType.includes('insert')) {
        isCorrect = (val === currentTask.value);
        if (actionType.includes('Position')) {
          isCorrect = isCorrect && (pos === currentTask.position);
        }
      } else if (actionType.includes('delete') && actionType.includes('Position')) {
        isCorrect = (pos === currentTask.position);
      } else {
        isCorrect = true;
      }
    }

    if (!isCorrect) {
      const correctOpText = currentTask.type === 'insertBeginning' ? `Insert Beginning (${currentTask.value})` : currentTask.type;
      setPracticeFeedback({
        type: 'incorrect',
        msg: `Incorrect operation. Please perform "${correctOpText}".`,
        hint: currentTask.hint
      });
      setShowHintIndex(prev => Math.min(prev + 1, 3));
      setPracticeAccuracy(Math.round((practiceCorrectCount / newAttempts) * 100));
    } else {
      setPracticeCorrectCount(prev => prev + 1);
      setPracticeAccuracy(Math.round(((practiceCorrectCount + 1) / newAttempts) * 100));
      
      // Perform operation directly
      if (actionType === 'insertBeginning') {
        handleInsertBeginningDirect(val);
      } else if (actionType === 'insertEnd') {
        handleInsertEndDirect(val);
      } else if (actionType === 'insertPosition') {
        handleInsertPositionDirect(val, pos);
      } else if (actionType === 'deleteBeginning') {
        handleDeleteBeginningDirect();
      } else if (actionType === 'deleteEnd') {
        handleDeleteEndDirect();
      } else if (actionType === 'deletePosition') {
        handleDeletePositionDirect(pos);
      } else if (actionType === 'clear') {
        setNodes([]);
      }

      setPracticeXp(prev => prev + 20);
      setPracticeFeedback({
        type: 'correct',
        msg: `Superb! Successfully executed ${actionType}.`,
        hint: null
      });
      setShowHintIndex(0);
      setInputValue('10');

      const nextStep = practiceStep + 1;
      setPracticeStep(nextStep);

      let badges = [...unlockedBadges];
      if (nextStep === 1) badges.push('List Explorer');
      if (nextStep === 5) badges.push('List Architect');
      if (nextStep === 10) badges.push('Grandmaster List Master');
      setUnlockedBadges(badges);

      if (nextStep >= PRACTICE_TASKS.length) {
        setPracticeFinished(true);
      }
    }
  };

  // CHALLENGE LOGIC
  const startChallengeSimulation = async () => {
    if (isSimulatingChallenge) return;
    setIsSimulatingChallenge(true);
    setNodes([]);

    const currentMission = CHALLENGE_MISSIONS[challengeStep - 1];
    for (let op of currentMission.actions) {
      if (op.type === 'insertBeginning') {
        handleInsertBeginningDirect(op.value);
      } else if (op.type === 'insertEnd') {
        handleInsertEndDirect(op.value);
      } else if (op.type === 'insertPosition') {
        handleInsertPositionDirect(op.value, op.position);
      } else if (op.type === 'deleteBeginning') {
        handleDeleteBeginningDirect();
      } else if (op.type === 'deleteEnd') {
        handleDeleteEndDirect();
      }
      await new Promise(r => setTimeout(r, 1200));
    }
    setIsSimulatingChallenge(false);
  };

  const handleChallengeAnswer = (answer) => {
    setSelectedOption(answer);
    const currentMission = CHALLENGE_MISSIONS[challengeStep - 1];

    if (answer === currentMission.correct) {
      setChallengeXp(prev => prev + 120);

      let achievements = [...unlockedAchievements];
      if (challengeStep === 1) achievements.push('Head Pointer Analyst');
      if (challengeStep === 3) achievements.push('Position Master');
      if (challengeStep === 5) achievements.push('Perfect Node Architect');
      setUnlockedAchievements(achievements);

      setTimeout(() => {
        if (challengeStep < CHALLENGE_MISSIONS.length) {
          setChallengeStep(prev => prev + 1);
          setTimeLeft(25);
          setSelectedOption(null);
          setNodes([]);
        } else {
          setChallengeFinished(true);
        }
      }, 1000);
    } else {
      handleChallengeWrong();
    }
  };

  const handleChallengeWrong = () => {
    const nextLives = lives - 1;
    setLives(nextLives);
    if (nextLives <= 0) {
      setChallengeFailed(true);
    } else {
      setTimeLeft(25);
      setSelectedOption(null);
      setNodes([]);
    }
  };

  const getCCode = () => {
    return [
      { line: 1, text: 'struct Node {' },
      { line: 2, text: '    int data;' },
      { line: 3, text: '    struct Node* next;' },
      { line: 4, text: '};' },
      { line: 5, text: 'struct Node* head = NULL;' },
      { line: 6, text: '' },
      { line: 7, text: 'void insertBeginning(int val) {' },
      { line: 8, text: '    struct Node* newNode = malloc(sizeof(struct Node));' },
      { line: 9, text: '    newNode->data = val;' },
      { line: 10, text: '    newNode->next = head;' },
      { line: 11, text: '    head = newNode;' },
      { line: 12, text: '}' },
      { line: 13, text: 'void insertEnd(int val) {' },
      { line: 14, text: '    struct Node* temp = head;' },
      { line: 15, text: '    while(temp->next != NULL) temp = temp->next;' },
      { line: 16, text: '    struct Node* newNode = malloc(sizeof(struct Node));' },
      { line: 17, text: '    newNode->data = val;' },
      { line: 18, text: '    newNode->next = NULL;' },
      { line: 19, text: '    temp->next = newNode;' },
      { line: 20, text: '}' }
    ];
  };

  return (
    <div className={`w-full flex flex-col font-sans db-page-wrapper transition-colors duration-300 ${
      isDarkMode ? 'bg-[#001621] text-[#f8fafc]' : 'bg-white text-slate-800'
    } overflow-x-hidden ${isGameRotated ? 'rotate-landscape-mode' : 'min-h-screen lg:h-screen lg:overflow-hidden'}`}>
      
      {/* HEADER BREADCRUMB */}
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

        <div className="flex items-center gap-4">
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

      {/* MAIN WORKSPACE */}
      <main className={`flex-1 flex max-w-[1920px] mx-auto w-full overflow-hidden ${
        isGameRotated 
          ? 'flex-row h-[calc(100vw-64px)]' 
          : 'flex-col lg:flex-row h-auto lg:h-[calc(100vh-64px)]'
      }`}>
        
        {/* LEFT PANEL: CONFIG */}
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

            {/* Auto Demo, Mode indicator & Speed Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <button 
                  onClick={startAutoDemo}
                  disabled={isDemoRunning}
                  className={`flex-1 py-2 rounded-xl text-xs font-black shadow flex items-center justify-center gap-1.5 transition-all ${
                    isDemoRunning 
                      ? 'bg-slate-400 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-emerald-500/25 shadow-lg'
                  }`}
                >
                  <Film className="w-4 h-4 animate-pulse" />
                  <span>🎥 Auto Demo</span>
                </button>
                
                <div className={`flex-1 py-2 rounded-xl border text-[10px] uppercase font-bold tracking-widest text-center transition-all ${
                  isDarkMode ? 'bg-[#001621]/80 border-[#FF4103]/20 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  {listType} List
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold">Simulation Speed</label>
                <div className={`flex items-center p-0.5 rounded-xl border ${isDarkMode ? 'bg-[#001621] border-[#FF4103]/20' : 'bg-white border-slate-200'}`}>
                  {[0.5, 1, 2].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setSpeed(s)}
                      className={`flex-1 py-1 text-xs font-black rounded-lg transition-all ${
                        speed === s ? 'bg-[#3B82F6] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
            <div className={`border-t pt-4 space-y-3 border-[var(--db-card-border)]`}>
              <label className="block text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold">Debugger Controller</label>
              
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {operationsQueue.map((op, idx) => (
                  <span 
                    key={idx} 
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border transition-all ${
                      currentOpIndex === idx 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-105' 
                        : idx < currentOpIndex
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-[var(--db-card-bg-elevated)] text-[var(--db-text-muted)] border-[var(--db-card-border)]'
                    }`}
                  >
                    {op.type === 'insertBeginning' ? `InsBeg(${op.value})` : op.type === 'insertEnd' ? `InsEnd(${op.value})` : op.type === 'insertPosition' ? `InsPos(${op.value},${op.position})` : `${op.type}()`}
                  </span>
                ))}
              </div>

              <div className={`flex items-center justify-between p-1.5 rounded-xl border gap-1 bg-[var(--db-card-bg-elevated)] border-[var(--db-card-border)]`}>
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
          <div className={`border-t pt-4 space-y-2 relative overflow-hidden border-[var(--db-card-border)]`}>
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

        {/* CENTER PANEL: VISUALIZER */}
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
            <div className="flex gap-2">
              {['Learn', 'Practice', 'Challenge'].map(m => (
                <button 
                  key={m} onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${mode === m ? 'bg-[var(--db-btn-secondary-bg)] text-[var(--db-text-main)] border border-[var(--db-card-border)]' : 'bg-[var(--db-card-bg-elevated)] text-[var(--db-text-muted)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* LEARN MODE VIEW */}
          {mode === 'Learn' && (
            <>
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
                    {showPointerNames && activeStep.nodes?.length > 0 && (
                      <div className="absolute -top-14 left-8 flex flex-col items-center">
                        <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-md shadow-sm border ${
                          isDarkMode ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>HEAD</span>
                        <div className="w-[2px] h-5 bg-emerald-400/60"></div>
                      </div>
                    )}

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
                            {/* Blue and White Nodes (light/dark adaptive custom combinations) */}
                            <div 
                              className={`relative flex rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                                isActive 
                                  ? 'shadow-[0_8px_30px_rgba(59,130,246,0.4)] border-blue-600' 
                                  : isNew 
                                    ? 'shadow-[0_8px_30px_rgba(59,130,246,0.3)] border-blue-500' 
                                    : isHead 
                                      ? 'shadow-[0_8px_30px_rgba(59,130,246,0.4)] border-blue-600' 
                                      : 'shadow-[0_4px_16px_rgba(0,0,0,0.08)] border-slate-200 dark:border-slate-700'
                              }`}
                              style={{ width: '140px', height: '64px' }}
                            >
                              {/* Left side (value container) */}
                              <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${
                                (isActive || isNew || isHead) 
                                  ? 'bg-blue-600' 
                                  : 'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700'
                              }`}>
                                <span className={`text-2xl font-black leading-none ${
                                  (isActive || isNew || isHead) 
                                    ? 'text-[#171717]' 
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}>{node.value}</span>
                              </div>

                              {/* Right side (pointer box) */}
                              <div className={`flex items-center justify-center transition-all duration-300 ${
                                (isActive || isNew || isHead) 
                                  ? 'bg-blue-800' 
                                  : 'bg-slate-50 dark:bg-slate-850'
                              }`} style={{ width: '44px' }}>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                  isActive ? 'bg-white/30 animate-pulse' : ''
                                }`}>
                                  <div className={`w-2.5 h-2.5 rounded-full ${
                                    (isActive || isNew || isHead) 
                                      ? 'bg-white' 
                                      : 'bg-slate-400 dark:bg-slate-500'
                                  }`} />
                                </div>
                              </div>
                            </div>

                            {showAddresses && (
                              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-slate-400">
                                {node.address}
                              </div>
                            )}

                            {isNew && (
                              <div className="absolute -top-7 left-0 right-0 text-center">
                                <span className="text-[8px] font-extrabold tracking-widest text-blue-500 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                  NEW NODE
                                </span>
                              </div>
                            )}

                            {isActive && (
                              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                                <div className="w-[2px] h-3 bg-blue-600"></div>
                                <span className="text-[8px] font-extrabold tracking-wider text-white bg-blue-600 px-2.5 py-0.5 rounded-md shadow-md uppercase">CURRENT</span>
                              </div>
                            )}

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
                                        stroke="#3b82f6" 
                                        strokeWidth="2.5"
                                        strokeDasharray="6,3"
                                      />
                                      <polygon points="36,28 46,32 36,36" fill="#3b82f6" />
                                    </>
                                  ) : (
                                    <>
                                      <motion.line 
                                        x1="-20" y1="32" x2="38" y2="32" 
                                        stroke={
                                          activeStep.wires?.[index] === 'traversal' 
                                            ? '#3b82f6' 
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
                                            ? '#3b82f6' 
                                            : (isDarkMode ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.5)')
                                        } 
                                        filter={activeStep.wires?.[index] === 'traversal' ? `url(#glow-${index})` : 'none'}
                                      />
                                      {activeStep.wires?.[index] === 'traversal' && (
                                        <motion.circle 
                                          r="3.5" 
                                          fill="#3b82f6" 
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

                    {activeStep.nodes?.length > 0 && (
                      <div className="flex items-center shrink-0 ml-1">
                        <div className={`text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          NULL
                        </div>
                      </div>
                    )}
                  </div>
                )}

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

              {/* Bottom Explanation */}
              <div className={`border-t p-5 flex flex-col justify-center items-center gap-1.5 z-10 transition-colors duration-300 ${
                isDarkMode ? 'border-[#FF4103]/10 bg-[#001621]/90 text-white' : 'border-slate-200 bg-white text-slate-800'
              }`}>
                <h4 className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#3B82F6]" /> Step Explanation
                </h4>
                <span className="text-xs font-semibold text-center max-w-lg leading-relaxed">{activeStep.label}</span>
              </div>
            </>
          )}

          {/* PRACTICE MODE VIEW */}
          {mode === 'Practice' && (
            <div className="flex-1 flex flex-col md:flex-row items-stretch justify-between p-6 pt-20 gap-6 overflow-y-auto">
              
              {/* Left Col: Linked List Visualizer */}
              <div className="flex-1 flex flex-col items-center justify-center pb-4 border-r border-[var(--db-card-border)] pr-4 overflow-x-auto">
                <div 
                  style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center' }}
                  className="flex items-center justify-center gap-1.5 relative px-8"
                >
                  {showPointerNames && nodes.length > 0 && (
                    <div className="absolute -top-12 left-4 flex flex-col items-center">
                      <span className="text-[8px] font-black tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">HEAD</span>
                      <div className="w-[1.5px] h-3 bg-emerald-500/40"></div>
                    </div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {nodes.map((node, index) => {
                      const isHead = index === 0;
                      return (
                        <motion.div 
                          key={node.id} 
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center shrink-0 relative"
                        >
                          <div 
                            className={`flex rounded-lg overflow-hidden border transition-all ${
                              isHead 
                                ? 'border-blue-600 bg-blue-600' 
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                            style={{ width: '100px', height: '48px' }}
                          >
                            <div className={`flex-1 flex items-center justify-center ${isHead ? 'bg-blue-600' : 'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700'}`}>
                              <span className={`text-base font-black ${isHead ? 'text-[#171717]' : 'text-slate-800 dark:text-slate-200'}`}>{node.value}</span>
                            </div>
                            <div className={`flex items-center justify-center ${isHead ? 'bg-blue-800' : 'bg-slate-50'}`} style={{ width: '30px' }}>
                              <div className={`w-2 h-2 rounded-full ${isHead ? 'bg-white' : 'bg-slate-400'}`} />
                            </div>
                          </div>

                          {index < (nodes.length - 1) && (
                            <div className="flex items-center justify-center relative shrink-0" style={{ width: '32px', height: '48px' }}>
                              <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 32 48">
                                <line x1="-10" y1="24" x2="22" y2="24" stroke="#3b82f6" strokeWidth="2" />
                                <polygon points="18,20 25,24 18,28" fill="#3b82f6" />
                              </svg>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {nodes.length > 0 && (
                    <div className="text-[10px] font-mono font-bold px-2 py-1 rounded border border-slate-200 text-slate-400 ml-1">
                      NULL
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Guided Practice Details */}
              <div className="flex-1 flex flex-col justify-between gap-4 overflow-y-auto">
                {practiceFinished ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-[var(--db-text-main)] mb-1">Practice Complete!</h2>
                    <p className="text-sm text-[var(--db-text-muted)] mb-6">You successfully completed all guided operations for Linked List.</p>
                    
                    <div className="grid grid-cols-3 gap-3 w-full mb-6">
                      <div className="bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
                        <span className="block text-[10px] text-[var(--db-text-muted)]">XP Earned</span>
                        <span className="text-lg font-black text-blue-500">+{practiceXp} XP</span>
                      </div>
                      <div className="bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
                        <span className="block text-[10px] text-[var(--db-text-muted)]">Accuracy</span>
                        <span className="text-lg font-black text-emerald-500">{practiceAccuracy}%</span>
                      </div>
                      <div className="bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
                        <span className="block text-[10px] text-[var(--db-text-muted)]">Attempts</span>
                        <span className="text-lg font-black text-purple-500">{practiceAttempts}</span>
                      </div>
                    </div>

                    <div className="w-full mb-6 text-left">
                      <h4 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-2">Unlocked Badges</h4>
                      <div className="flex flex-wrap gap-2">
                        {unlockedBadges.map((badge, idx) => (
                          <span key={idx} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-full">
                            🎓 {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <button onClick={() => setMode('Practice')} className="flex-1 py-3 bg-[var(--db-card-bg-elevated)] hover:bg-[var(--db-btn-secondary-hover)] text-[var(--db-text-main)] font-black text-xs rounded-xl border border-[var(--db-card-border)]">
                        Restart
                      </button>
                      <button onClick={() => setMode('Challenge')} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg">
                        Start Challenge
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-[var(--db-card-border)] pb-2">
                      <div>
                        <span className="text-[10px] font-black text-[var(--db-text-muted)] uppercase block">Question {practiceStep + 1} / 10</span>
                        <span className="text-xs font-black text-blue-500">+{practiceXp} XP</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase block">Accuracy</span>
                        <span className="text-xs font-black text-emerald-500">{practiceAccuracy}%</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 rounded-xl shadow-inner relative overflow-hidden">
                      <span className="absolute right-3 top-3 text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Mission {practiceStep + 1}</span>
                      <h4 className="text-xs text-[var(--db-text-secondary)] font-bold mb-1">Target Operation:</h4>
                      <p className="text-sm font-bold text-[var(--db-text-main)] leading-relaxed">
                        {PRACTICE_TASKS[practiceStep]?.instruction}
                      </p>
                    </div>

                    {practiceFeedback && (
                      <div className={`p-3 rounded-xl border text-xs font-bold ${
                        practiceFeedback.type === 'correct' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        <div>{practiceFeedback.msg}</div>
                        {practiceFeedback.hint && <div className="mt-1 font-normal opacity-90">{practiceFeedback.hint}</div>}
                      </div>
                    )}

                    <div className="border border-[var(--db-card-border)] p-3 rounded-xl bg-[var(--db-card-bg)]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider">Guided Hints</span>
                        <button onClick={() => setShowHintIndex(prev => Math.min(prev + 1, 3))} className="text-[10px] text-blue-500 font-black hover:underline">Need Help? ({showHintIndex}/3)</button>
                      </div>
                      {showHintIndex > 0 && (
                        <div className="text-xs text-[var(--db-text-secondary)] font-medium italic">
                          💡 Hint: {PRACTICE_TASKS[practiceStep]?.hint}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[10px] font-bold text-[var(--db-text-muted)]">
                        <span>Progress: {practiceStep * 10}%</span>
                        <span>Accuracy: {practiceAccuracy}%</span>
                      </div>
                      <div className="w-full bg-[var(--db-card-bg-elevated)] h-1.5 rounded-full overflow-hidden border border-[var(--db-card-border)]">
                        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${practiceStep * 10}%` }}></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

          {/* CHALLENGE MODE VIEW */}
          {mode === 'Challenge' && (
            <div className="flex-1 flex flex-col md:flex-row items-stretch justify-between p-6 pt-20 gap-6 overflow-y-auto">
              
              {/* Left Col: Linked List Visualizer */}
              <div className="flex-1 flex flex-col items-center justify-center pb-4 border-r border-[var(--db-card-border)] pr-4 overflow-x-auto">
                <div 
                  style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center' }}
                  className="flex items-center justify-center gap-1.5 relative px-8"
                >
                  {showPointerNames && nodes.length > 0 && (
                    <div className="absolute -top-12 left-4 flex flex-col items-center">
                      <span className="text-[8px] font-black tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">HEAD</span>
                      <div className="w-[1.5px] h-3 bg-emerald-500/40"></div>
                    </div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {nodes.map((node, index) => {
                      const isHead = index === 0;
                      return (
                        <motion.div 
                          key={node.id} 
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center shrink-0 relative"
                        >
                          <div 
                            className={`flex rounded-lg overflow-hidden border transition-all ${
                              isHead 
                                ? 'border-blue-600 bg-blue-600' 
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                            style={{ width: '100px', height: '48px' }}
                          >
                            <div className={`flex-1 flex items-center justify-center ${isHead ? 'bg-blue-600' : 'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700'}`}>
                              <span className={`text-base font-black ${isHead ? 'text-[#171717]' : 'text-slate-800 dark:text-slate-200'}`}>{node.value}</span>
                            </div>
                            <div className={`flex items-center justify-center ${isHead ? 'bg-blue-800' : 'bg-slate-50'}`} style={{ width: '30px' }}>
                              <div className={`w-2 h-2 rounded-full ${isHead ? 'bg-white' : 'bg-slate-400'}`} />
                            </div>
                          </div>

                          {index < (nodes.length - 1) && (
                            <div className="flex items-center justify-center relative shrink-0" style={{ width: '32px', height: '48px' }}>
                              <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 32 48">
                                <line x1="-10" y1="24" x2="22" y2="24" stroke="#3b82f6" strokeWidth="2" />
                                <polygon points="18,20 25,24 18,28" fill="#3b82f6" />
                              </svg>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {nodes.length > 0 && (
                    <div className="text-[10px] font-mono font-bold px-2 py-1 rounded border border-slate-200 text-slate-400 ml-1">
                      NULL
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Guided Challenge Details */}
              <div className="flex-1 flex flex-col justify-between gap-4 overflow-y-auto">
                {challengeFailed ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-red-500 mb-1">Challenge Failed</h2>
                    <p className="text-sm text-[var(--db-text-muted)] mb-6">You ran out of lives. Review Linked List operations and try again!</p>
                    <button onClick={() => setMode('Challenge')} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all">
                      Try Again
                    </button>
                  </motion.div>
                ) : challengeFinished ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-[var(--db-text-main)] mb-1">Challenge Cleared!</h2>
                    <p className="text-sm text-[var(--db-text-muted)] mb-4">Superb! You are a Linked List Champion!</p>
                    
                    <div className="bg-[var(--db-card-bg-elevated)] p-4 rounded-xl border border-[var(--db-card-border)] w-full mb-6">
                      <span className="block text-xs text-[var(--db-text-muted)]">Total score</span>
                      <span className="text-3xl font-black text-yellow-400">+{challengeXp} XP</span>
                    </div>

                    <div className="w-full mb-6 text-left">
                      <h4 className="text-xs font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-2">Unlocked Achievements</h4>
                      <div className="flex flex-wrap gap-2">
                        {unlockedAchievements.map((badge, idx) => (
                          <span key={idx} className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-black px-3 py-1.5 rounded-full">
                            ✨ {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <button onClick={() => setMode('Challenge')} className="flex-1 py-3 bg-[var(--db-card-bg-elevated)] hover:bg-[var(--db-btn-secondary-hover)] text-[var(--db-text-main)] font-black text-xs rounded-xl border border-[var(--db-card-border)]">
                        Retry
                      </button>
                      <button onClick={() => navigate('/subjects')} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs rounded-xl">
                        Main Dashboard
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-[var(--db-card-border)] pb-2">
                      <div className="flex items-center gap-1.5">
                        <Timer className={`w-4 h-4 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />
                        <span className={`text-xs font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-[var(--db-text-main)]'}`}>{timeLeft}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} />
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-[var(--db-text-muted)] uppercase block">Level {challengeStep} / 5</span>
                        <span className="text-xs font-black text-yellow-400">+{challengeXp} XP</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4 rounded-xl relative">
                      <span className="absolute right-3 top-3 text-[10px] bg-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Mission {challengeStep}</span>
                      <h4 className="text-xs text-[var(--db-text-secondary)] font-bold mb-1">Objective:</h4>
                      <p className="text-sm font-bold text-[var(--db-text-main)] leading-relaxed mb-4">
                        {CHALLENGE_MISSIONS[challengeStep - 1]?.description}
                      </p>
                      
                      {CHALLENGE_MISSIONS[challengeStep - 1]?.actions?.length > 0 && (
                        <button 
                          onClick={startChallengeSimulation} 
                          disabled={isSimulatingChallenge}
                          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Start Operations
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {CHALLENGE_MISSIONS[challengeStep - 1]?.options?.map((opt, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleChallengeAnswer(opt)}
                          disabled={isSimulatingChallenge}
                          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border text-center ${
                            selectedOption === opt 
                              ? opt === CHALLENGE_MISSIONS[challengeStep - 1].correct 
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                : 'bg-red-500/20 border-red-500/50 text-red-400'
                              : 'bg-[var(--db-card-bg-elevated)] border-[var(--db-card-border)] text-[var(--db-text-secondary)] hover:border-purple-400 hover:text-purple-400'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <div className="border border-[var(--db-card-border)] rounded-xl p-3 bg-[var(--db-card-bg)]">
                      <h5 className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mb-2">Global Live Leaderboard</h5>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Alex', xp: '610 XP', acc: '100%' },
                          { name: 'Sarah', xp: '540 XP', acc: '95%' },
                          { name: 'You', xp: `${challengeXp} XP`, acc: `${lives === 3 ? '100%' : lives === 2 ? '66%' : '33%'}`, isMe: true }
                        ].map((user, idx) => (
                          <div key={idx} className={`flex items-center justify-between text-[11px] px-2 py-1 rounded-lg ${user.isMe ? 'bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20' : 'text-[var(--db-text-muted)]'}`}>
                            <span>{idx + 1}. {user.name}</span>
                            <span>{user.xp} | {user.acc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}
        </div>

        {/* RIGHT PANEL: CODE */}
        <div className={`border-l flex flex-col overflow-hidden shrink-0 relative z-10 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#001621]/80 border-l border-[#FF4103]/10' : 'bg-white border-slate-200'
        } ${isGameRotated ? 'w-[30%] h-full' : 'w-full lg:w-[30%] h-auto lg:h-full'}`}>
          
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

        </div>
      </main>
    </div>
  );
}
