import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Zap, Play, Pause, SkipForward, SkipBack, RotateCcw,
  Plus, Minus, Search, Trash2, Code2, Cpu, Database, Info, GitMerge,
  ToggleLeft, ToggleRight, Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import './DashboardTheme.css';

// ─── BST / Binary Tree / AVL Engine ──────────────────────────────
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
    this.id = `node-${value}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }
}

function getHeight(node) {
  return node ? node.height : 0;
}

function getBalance(node) {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function updateHeight(node) {
  if (node) node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x) {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function bstInsert(root, value, steps, treeType) {
  function insert(node, val, depth, path) {
    if (!node) {
      const newNode = new TreeNode(val);
      steps.push({ type: 'place', value: val, path: [...path], message: `Placed ${val} at depth ${depth}.` });
      return newNode;
    }
    steps.push({ type: 'compare', value: val, at: node.value, path: [...path], message: `Compare ${val} with ${node.value}.` });
    if (val < node.value) {
      steps.push({ type: 'go_left', value: val, at: node.value, path: [...path, 'left'], message: `${val} < ${node.value}, go LEFT.` });
      node.left = insert(node.left, val, depth + 1, [...path, 'left']);
    } else if (val > node.value) {
      steps.push({ type: 'go_right', value: val, at: node.value, path: [...path, 'right'], message: `${val} > ${node.value}, go RIGHT.` });
      node.right = insert(node.right, val, depth + 1, [...path, 'right']);
    } else {
      steps.push({ type: 'duplicate', value: val, message: `${val} already exists in the tree.` });
      return node;
    }

    if (treeType === 'avl') {
      updateHeight(node);
      const balance = getBalance(node);
      if (balance > 1 && val < node.left.value) {
        steps.push({ type: 'rotation', rotation: 'LL', at: node.value, message: `LL Rotation at ${node.value}.` });
        return rotateRight(node);
      }
      if (balance < -1 && val > node.right.value) {
        steps.push({ type: 'rotation', rotation: 'RR', at: node.value, message: `RR Rotation at ${node.value}.` });
        return rotateLeft(node);
      }
      if (balance > 1 && val > node.left.value) {
        steps.push({ type: 'rotation', rotation: 'LR', at: node.value, message: `LR Rotation at ${node.value}.` });
        node.left = rotateLeft(node.left);
        return rotateRight(node);
      }
      if (balance < -1 && val < node.right.value) {
        steps.push({ type: 'rotation', rotation: 'RL', at: node.value, message: `RL Rotation at ${node.value}.` });
        node.right = rotateRight(node.right);
        return rotateLeft(node);
      }
    }
    updateHeight(node);
    return node;
  }
  return insert(root, value, 0, []);
}

function bstSearch(root, value, steps) {
  let current = root;
  const path = [];
  while (current) {
    steps.push({ type: 'compare', value, at: current.value, path: [...path], message: `Compare ${value} with ${current.value}.` });
    if (value === current.value) {
      steps.push({ type: 'found', value, path: [...path], message: `Found ${value}!` });
      return true;
    } else if (value < current.value) {
      steps.push({ type: 'go_left', value, at: current.value, path: [...path, 'left'], message: `${value} < ${current.value}, go LEFT.` });
      path.push('left');
      current = current.left;
    } else {
      steps.push({ type: 'go_right', value, at: current.value, path: [...path, 'right'], message: `${value} > ${current.value}, go RIGHT.` });
      path.push('right');
      current = current.right;
    }
  }
  steps.push({ type: 'not_found', value, message: `${value} not found in tree.` });
  return false;
}

function getMinNode(node) {
  while (node.left) node = node.left;
  return node;
}

function bstDelete(root, value, steps, treeType) {
  function deleteNode(node, val, path) {
    if (!node) {
      steps.push({ type: 'not_found', value: val, message: `${val} not found.` });
      return null;
    }
    steps.push({ type: 'compare', value: val, at: node.value, path: [...path], message: `Compare ${val} with ${node.value}.` });
    if (val < node.value) {
      steps.push({ type: 'go_left', value: val, at: node.value, path: [...path, 'left'], message: `${val} < ${node.value}, go LEFT.` });
      node.left = deleteNode(node.left, val, [...path, 'left']);
    } else if (val > node.value) {
      steps.push({ type: 'go_right', value: val, at: node.value, path: [...path, 'right'], message: `${val} > ${node.value}, go RIGHT.` });
      node.right = deleteNode(node.right, val, [...path, 'right']);
    } else {
      steps.push({ type: 'delete', value: val, path: [...path], message: `Deleting node ${val}.` });
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      const successor = getMinNode(node.right);
      steps.push({ type: 'replace', value: successor.value, oldValue: val, message: `Replace ${val} with inorder successor ${successor.value}.` });
      node.value = successor.value;
      node.id = `node-${node.value}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      node.right = deleteNode(node.right, successor.value, [...path, 'right']);
    }
    if (treeType === 'avl' && node) {
      updateHeight(node);
      const balance = getBalance(node);
      if (balance > 1 && getBalance(node.left) >= 0) {
        steps.push({ type: 'rotation', rotation: 'LL', at: node.value, message: `LL Rotation at ${node.value}.` });
        return rotateRight(node);
      }
      if (balance > 1 && getBalance(node.left) < 0) {
        steps.push({ type: 'rotation', rotation: 'LR', at: node.value, message: `LR Rotation at ${node.value}.` });
        node.left = rotateLeft(node.left);
        return rotateRight(node);
      }
      if (balance < -1 && getBalance(node.right) <= 0) {
        steps.push({ type: 'rotation', rotation: 'RR', at: node.value, message: `RR Rotation at ${node.value}.` });
        return rotateLeft(node);
      }
      if (balance < -1 && getBalance(node.right) > 0) {
        steps.push({ type: 'rotation', rotation: 'RL', at: node.value, message: `RL Rotation at ${node.value}.` });
        node.right = rotateRight(node.right);
        return rotateLeft(node);
      }
    }
    updateHeight(node);
    return node;
  }
  return deleteNode(root, value, []);
}

function getTraversalOrder(root, type) {
  const result = [];
  const callStack = [];
  function inorder(node, depth) {
    if (!node) return;
    callStack.push({ call: `inorder(${node.value})`, depth });
    inorder(node.left, depth + 1);
    result.push({ value: node.value, callStack: [...callStack] });
    inorder(node.right, depth + 1);
    callStack.pop();
  }
  function preorder(node, depth) {
    if (!node) return;
    callStack.push({ call: `preorder(${node.value})`, depth });
    result.push({ value: node.value, callStack: [...callStack] });
    preorder(node.left, depth + 1);
    preorder(node.right, depth + 1);
    callStack.pop();
  }
  function postorder(node, depth) {
    if (!node) return;
    callStack.push({ call: `postorder(${node.value})`, depth });
    postorder(node.left, depth + 1);
    postorder(node.right, depth + 1);
    result.push({ value: node.value, callStack: [...callStack] });
    callStack.pop();
  }
  if (type === 'inorder') inorder(root, 0);
  else if (type === 'preorder') preorder(root, 0);
  else postorder(root, 0);
  return result;
}

// ─── Layout Engine: assign x,y coordinates ──────────────────────
function assignPositions(root, canvasW, canvasH) {
  if (!root) return;
  const nodeCount = countNodes(root);
  const topPad = 50;
  const treeDepth = getTreeDepth(root);
  const levelH = Math.min(80, Math.max(50, (canvasH - topPad - 40) / Math.max(treeDepth, 1)));

  let index = 0;
  function inorderPos(node) {
    if (!node) return;
    inorderPos(node.left);
    node._index = index++;
    inorderPos(node.right);
  }
  inorderPos(root);

  const spacing = Math.min(90, Math.max(50, (canvasW - 80) / Math.max(nodeCount - 1, 1)));
  const startX = (canvasW - spacing * (nodeCount - 1)) / 2;

  function assignXY(node, depth) {
    if (!node) return;
    node.x = startX + node._index * spacing;
    node.y = topPad + depth * levelH;
    assignXY(node.left, depth + 1);
    assignXY(node.right, depth + 1);
  }
  assignXY(root, 0);
}

function countNodes(node) {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

function getTreeDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
}

function flattenTree(node) {
  if (!node) return [];
  return [...flattenTree(node.left), node, ...flattenTree(node.right)];
}

function getEdges(node) {
  const edges = [];
  function traverse(n) {
    if (!n) return;
    if (n.left) { edges.push({ from: n, to: n.left }); traverse(n.left); }
    if (n.right) { edges.push({ from: n, to: n.right }); traverse(n.right); }
  }
  traverse(node);
  return edges;
}

// Deep clone tree
function cloneTree(node) {
  if (!node) return null;
  const n = new TreeNode(node.value);
  n.id = node.id;
  n.height = node.height;
  n.x = node.x;
  n.y = node.y;
  n.left = cloneTree(node.left);
  n.right = cloneTree(node.right);
  return n;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function TreeVisualization() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isGameRotated, setIsGameRotated] = useState(localStorage.getItem('dsa_game_mode') === 'true');
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 400 });

  // Tree state
  const [treeRoot, setTreeRoot] = useState(null);
  const [treeType, setTreeType] = useState('bst'); // binary, bst, avl
  const [inputValue, setInputValue] = useState('');

  // Animation
  const [animSteps, setAnimSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const playRef = useRef(null);

  // Highlighted nodes
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [activeNodeValue, setActiveNodeValue] = useState(null);
  const [foundNode, setFoundNode] = useState(null);
  const [deletedNode, setDeletedNode] = useState(null);

  // Traversal
  const [traversalType, setTraversalType] = useState('inorder');
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [traversalIndex, setTraversalIndex] = useState(-1);
  const [callStack, setCallStack] = useState([]);

  // Toggles
  const [showTraversalPath, setShowTraversalPath] = useState(true);
  const [showCallStack, setShowCallStack] = useState(true);
  const [showPseudocode, setShowPseudocode] = useState(true);

  // Right panel tab
  const [activeTab, setActiveTab] = useState('code'); // code, callstack, complexity

  // Hover state
  const [hoveredNode, setHoveredNode] = useState(null);

  // History log
  const [history, setHistory] = useState([]);

  // Pending tree root (applied after animation completes)
  const [pendingTreeRoot, setPendingTreeRoot] = useState(null);

  // Auto-mode: continuously insert random values
  const [autoMode, setAutoMode] = useState(false);
  const autoModeRef = useRef(false);

  // Resize observer for canvas
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setCanvasSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Recalculate positions when tree or canvas changes
  useEffect(() => {
    if (treeRoot) {
      assignPositions(treeRoot, canvasSize.w, canvasSize.h);
      setTreeRoot(prev => cloneTree(prev)); // trigger re-render with new positions
    }
  }, [canvasSize]);

  // Seed initial tree
  useEffect(() => {
    setTreeRoot(null);
    setHistory([{ msg: 'Tree initialized (Empty)', time: Date.now() }]);
  }, [treeType]);

  // Playback
  useEffect(() => {
    if (isPlaying) {
      if (animSteps.length > 0) {
        playRef.current = setInterval(() => {
          setCurrentStep(prev => {
            if (prev >= animSteps.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }, 1200 / speed);
      } else if (traversalOrder.length > 0) {
        playRef.current = setInterval(() => {
          setTraversalIndex(prev => {
            if (prev >= traversalOrder.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }, 800 / speed);
      }
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, animSteps, traversalOrder, speed]);

  // Keep autoModeRef in sync
  useEffect(() => {
    autoModeRef.current = autoMode;
  }, [autoMode]);

  // Commit pending tree when animation finishes, then chain next auto-insert
  useEffect(() => {
    if (!isPlaying && pendingTreeRoot && animSteps.length > 0 && currentStep >= animSteps.length - 1) {
      const newRoot = pendingTreeRoot.root;
      const msg = pendingTreeRoot.msg;
      setTreeRoot(newRoot);
      addHistory(msg);
      setPendingTreeRoot(null);

      // If auto-mode is on, queue the next random insert after a short delay
      if (autoModeRef.current) {
        setTimeout(() => {
          if (!autoModeRef.current) return;
          const val = Math.floor(Math.random() * 99) + 1;
          const steps = [];
          steps.push({ type: 'start', message: `Insert ${val} into ${treeType.toUpperCase()} tree.` });
          const nextRoot = bstInsert(cloneTree(newRoot), val, steps, treeType);
          steps.push({ type: 'done', message: `Insert operation complete.` });
          assignPositions(nextRoot, canvasSize.w, canvasSize.h);
          setAnimSteps(steps);
          setCurrentStep(0);
          setIsPlaying(true);
          setFoundNode(null);
          setDeletedNode(null);
          setHighlightedNodes(new Set());
          setTraversalOrder([]);
          setTraversalIndex(-1);
          setPendingTreeRoot({ root: nextRoot, msg: `Inserted ${val}` });
        }, 600);
      }
    }
  }, [isPlaying, pendingTreeRoot, animSteps, currentStep, treeType, canvasSize]);

  // Process current step highlight
  useEffect(() => {
    if (currentStep < 0 || currentStep >= animSteps.length) return;
    const step = animSteps[currentStep];
    if (!step) return;

    if (step.type === 'found') {
      setFoundNode(step.value);
      setActiveNodeValue(step.value);
    } else if (step.type === 'delete') {
      setDeletedNode(step.value);
      setActiveNodeValue(step.value);
    } else if (step.type === 'compare' || step.type === 'go_left' || step.type === 'go_right') {
      setActiveNodeValue(step.at);
      setFoundNode(null);
      setDeletedNode(null);
    } else if (step.type === 'place') {
      setActiveNodeValue(step.value);
      setFoundNode(step.value);
      setDeletedNode(null);
    } else if (step.type === 'rotation') {
      setActiveNodeValue(step.at);
    } else {
      setActiveNodeValue(null);
    }
  }, [currentStep, animSteps]);

  // Traversal playback
  useEffect(() => {
    if (traversalOrder.length > 0 && traversalIndex >= 0 && traversalIndex < traversalOrder.length) {
      const item = traversalOrder[traversalIndex];
      setActiveNodeValue(item.value);
      setCallStack(item.callStack || []);
      setHighlightedNodes(prev => {
        const s = new Set(prev);
        s.add(item.value);
        return s;
      });
    }
  }, [traversalIndex, traversalOrder]);

  const addHistory = (msg) => setHistory(prev => [{ msg, time: Date.now() }, ...prev].slice(0, 8));

  // ─── Operations ────────────────────────────────────────────────
  const doInsert = useCallback((overrideVal) => {
    let val = overrideVal;
    if (val === undefined || val === null) {
      val = parseInt(inputValue);
    }
    if (isNaN(val)) {
      // Auto-generate a random value between 1 and 99
      val = Math.floor(Math.random() * 99) + 1;
    }
    const steps = [];
    steps.push({ type: 'start', message: `Insert ${val} into ${treeType.toUpperCase()} tree.` });
    const newRoot = bstInsert(cloneTree(treeRoot), val, steps, treeType);
    steps.push({ type: 'done', message: `Insert operation complete.` });
    assignPositions(newRoot, canvasSize.w, canvasSize.h);
    setAnimSteps(steps);
    setCurrentStep(0);
    setIsPlaying(true);
    setFoundNode(null);
    setDeletedNode(null);
    setHighlightedNodes(new Set());
    setTraversalOrder([]);
    setTraversalIndex(-1);
    setPendingTreeRoot({ root: newRoot, msg: `Inserted ${val}` });
    setInputValue('');
  }, [inputValue, treeRoot, treeType, canvasSize, speed]);

  const handleInsert = useCallback(() => {
    doInsert();
  }, [doInsert]);

  const handleDelete = useCallback(() => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const steps = [];
    steps.push({ type: 'start', message: `Delete ${val} from ${treeType.toUpperCase()} tree.` });
    const newRoot = bstDelete(cloneTree(treeRoot), val, steps, treeType);
    steps.push({ type: 'done', message: `Delete operation complete.` });
    assignPositions(newRoot, canvasSize.w, canvasSize.h);
    setAnimSteps(steps);
    setCurrentStep(0);
    setIsPlaying(true);
    setFoundNode(null);
    setDeletedNode(null);
    setHighlightedNodes(new Set());
    setTraversalOrder([]);
    setTraversalIndex(-1);
    setPendingTreeRoot({ root: newRoot, msg: `Deleted ${val}` });
    setInputValue('');
  }, [inputValue, treeRoot, treeType, canvasSize, speed]);

  const handleSearch = useCallback(() => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const steps = [];
    steps.push({ type: 'start', message: `Search for ${val}.` });
    bstSearch(treeRoot, val, steps);
    steps.push({ type: 'done', message: `Search operation complete.` });
    setAnimSteps(steps);
    setCurrentStep(0);
    setIsPlaying(true);
    setFoundNode(null);
    setDeletedNode(null);
    setHighlightedNodes(new Set());
    setTraversalOrder([]);
    setTraversalIndex(-1);
    addHistory(`Searched ${val}`);
    setInputValue('');
  }, [inputValue, treeRoot]);

  const handleReset = () => {
    setTreeRoot(null);
    setAnimSteps([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    setAutoMode(false);
    setHighlightedNodes(new Set());
    setActiveNodeValue(null);
    setFoundNode(null);
    setDeletedNode(null);
    setTraversalOrder([]);
    setTraversalIndex(-1);
    setCallStack([]);
    setPendingTreeRoot(null);
    addHistory('Tree cleared');
  };

  const handleTraversal = () => {
    if (!treeRoot) return;
    const order = getTraversalOrder(treeRoot, traversalType);
    setTraversalOrder(order);
    setTraversalIndex(0);
    setHighlightedNodes(new Set());
    setActiveNodeValue(null);
    setFoundNode(null);
    setDeletedNode(null);
    setAnimSteps([]);
    setCurrentStep(-1);
    addHistory(`${traversalType.charAt(0).toUpperCase() + traversalType.slice(1)} traversal`);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (isPlaying || autoMode) {
      // Pause everything
      setIsPlaying(false);
      setAutoMode(false);
      return;
    }
    // If no animation is queued, start auto-mode (continuous random inserts)
    if (animSteps.length === 0 && traversalOrder.length === 0) {
      setAutoMode(true);
      doInsert(NaN); // First random insert kicks off the chain
      return;
    }
    // Resume existing animation
    setIsPlaying(true);
  };
  
  const handleNext = () => {
    setIsPlaying(false);
    if (animSteps.length > 0) {
      if (currentStep < animSteps.length - 1) setCurrentStep(currentStep + 1);
    } else if (traversalOrder.length > 0) {
      if (traversalIndex < traversalOrder.length - 1) setTraversalIndex(traversalIndex + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (animSteps.length > 0) {
      if (currentStep > 0) setCurrentStep(currentStep - 1);
    } else if (traversalOrder.length > 0) {
      if (traversalIndex > 0) setTraversalIndex(traversalIndex - 1);
    }
  };

  const handleAnimReset = () => {
    setIsPlaying(false);
    setAutoMode(false);
    setAnimSteps([]);
    setCurrentStep(-1);
    setTreeRoot(null);
    setPendingTreeRoot(null);
    setHighlightedNodes(new Set());
    setActiveNodeValue(null);
    setFoundNode(null);
    setDeletedNode(null);
    setTraversalOrder([]);
    setTraversalIndex(-1);
    setCallStack([]);
    addHistory('Restarted — tree cleared');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleInsert();
  };

  // ─── Derived data ─────────────────────────────────────────────
  const nodes = treeRoot ? flattenTree(treeRoot) : [];
  const edges = treeRoot ? getEdges(treeRoot) : [];
  const activeMessage = currentStep >= 0 && currentStep < animSteps.length
    ? animSteps[currentStep].message
    : traversalIndex >= 0 && traversalIndex < traversalOrder.length
      ? `Visiting: ${traversalOrder[traversalIndex].value}`
      : 'Click an operation to begin.';

  // Pseudocode
  const getPseudocode = () => {
    const step = currentStep >= 0 && currentStep < animSteps.length ? animSteps[currentStep] : null;
    const lines = [
      { id: 1, text: 'function insert(root, value):' },
      { id: 2, text: '    if root is NULL:' },
      { id: 3, text: '        return new Node(value)' },
      { id: 4, text: '    if value < root.data:' },
      { id: 5, text: '        root.left = insert(root.left, value)' },
      { id: 6, text: '    else if value > root.data:' },
      { id: 7, text: '        root.right = insert(root.right, value)' },
      { id: 8, text: '    update height(root)' },
      { id: 9, text: '    check balance & rotate if needed' },
      { id: 10, text: '    return root' },
    ];
    let activeLine = -1;
    if (step) {
      if (step.type === 'start') activeLine = 1;
      else if (step.type === 'place') activeLine = 3;
      else if (step.type === 'compare') activeLine = 4;
      else if (step.type === 'go_left') activeLine = 5;
      else if (step.type === 'go_right') activeLine = 7;
      else if (step.type === 'rotation') activeLine = 9;
      else if (step.type === 'done') activeLine = 10;
    }
    return { lines, activeLine };
  };

  const { lines: pseudoLines, activeLine } = getPseudocode();

  // Node color logic
  const getNodeStyle = (node) => {
    const val = node.value;
    if (deletedNode === val) return { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626', glow: '0 0 20px rgba(239,68,68,0.5)' };
    if (foundNode === val) return { bg: '#D1FAE5', border: '#10B981', text: '#059669', glow: '0 0 20px rgba(16,185,129,0.5)' };
    if (activeNodeValue === val) return { bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8', glow: '0 0 20px rgba(37,99,235,0.4)' };
    if (highlightedNodes.has(val)) return { bg: '#FEF3C7', border: '#F59E0B', text: '#D97706', glow: '0 0 12px rgba(245,158,11,0.3)' };
    if (isDarkMode) {
      return { bg: '#1b124c', border: '#8b5cf6', text: '#e9d5ff', glow: '0 0 15px rgba(139,92,246,0.3)' };
    }
    return { bg: '#FFFFFF', border: '#CBD5E1', text: '#334155', glow: 'none' };
  };

  return (
    <div className={`w-full flex flex-col font-sans db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'} ${isGameRotated ? 'rotate-landscape-mode' : 'min-h-screen lg:h-screen lg:overflow-hidden'}`}>

      {/* HEADER BREADCRUMB */}
      <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 shadow-sm relative z-10" style={{ background: 'var(--db-card-bg)', borderBottom: '1px solid var(--db-header-border)' }}>
        <div className="flex items-center overflow-hidden">
        <button onClick={() => navigate(-1)} className="mr-2 lg:mr-4 p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-full transition shrink-0">
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--db-text-main)' }} />
        </button>
        <div className="flex items-center text-xs lg:text-sm font-medium gap-1.5 lg:gap-2 truncate" style={{ color: 'var(--db-text-muted)' }}>
          <span>Home</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
          <span>Subjects</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
          <span>DSA</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
          <span className="text-blue-500 font-bold">Trees</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
          <span style={{ color: 'var(--db-text-main)' }} className="truncate">Visual Lab</span>
        </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {/* Game Mode Rotate Button */}
          <button 
            onClick={() => {
              const nextVal = !isGameRotated;
              setIsGameRotated(nextVal);
              localStorage.setItem('dsa_game_mode', nextVal ? 'true' : 'false');
            }}
            className="px-2.5 py-1.5 lg:px-3.5 lg:py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-[10px] lg:text-xs font-black shadow flex items-center gap-1 lg:gap-1.5 cursor-pointer"
          >
            <span>🎮 Game Mode</span>
          </button>
          <ThemeToggleButton />
        </div>
      </header>

      {/* MAIN 3-PANEL LAYOUT */}
      <main className={`flex-1 p-4 lg:p-5 gap-5 flex max-w-[1920px] mx-auto w-full ${
        isGameRotated 
          ? 'flex-row h-[calc(100vw-64px)] overflow-hidden' 
          : 'flex-col lg:flex-row h-auto lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden'
      }`}>

        {/* ═══════════════════════════════════════════════
            LEFT PANEL: CONTROL CENTER (22%)
        ═══════════════════════════════════════════════ */}
        <div className={`backdrop-blur-xl border rounded-[24px] shadow-lg p-5 flex flex-col justify-between overflow-y-auto shrink-0 transition-colors duration-250 ${
          isDarkMode 
            ? 'bg-[#120e2a]/95 border-purple-500/10 text-white' 
            : 'bg-white/70 border-[#E2E8F0] text-slate-800'
        } ${
          isGameRotated 
            ? 'w-[22%] min-w-[240px] h-full gap-2 p-4' 
            : 'w-full lg:w-[22%] lg:min-w-[280px] h-auto lg:h-full gap-6 lg:gap-0'
        }`}>
          <div className="space-y-5">

            {/* Header */}
            <div>
              <h2 className={`text-xl font-extrabold flex items-center gap-2 mb-1 ${isDarkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                <Zap className="w-5 h-5 text-blue-500" /> Tree Lab
              </h2>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-[#64748B]'}`}>Insert, delete, search, and visualize tree operations live.</p>
            </div>

            {/* Tree Type Selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Tree Type</label>
              <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${isDarkMode ? 'bg-[#181236] border-purple-500/10' : 'bg-[#F1F5F9] border-slate-200'}`}>
                {[
                  { id: 'binary', label: 'Binary' },
                  { id: 'bst', label: 'BST' },
                  { id: 'avl', label: 'AVL' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTreeType(t.id)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      treeType === t.id 
                        ? isDarkMode 
                          ? 'bg-purple-650 text-white shadow-sm border border-purple-500/20' 
                          : 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                        : isDarkMode 
                          ? 'text-slate-400 hover:text-slate-200' 
                          : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Node Operations */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Node Operations</label>
              <div className={`p-3 rounded-2xl border shadow-inner ${isDarkMode ? 'bg-[#140f30]/60 border-purple-500/10' : 'bg-[#F8FAFC] border-slate-200'}`}>
                <input
                  type="number"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter node value..."
                  className={`w-full text-center text-lg font-bold border-2 rounded-xl py-2.5 focus:outline-none focus:ring-4 transition-all ${
                    isDarkMode 
                      ? 'bg-[#0b071e] border-purple-500/20 text-white placeholder-slate-600 focus:border-purple-500 focus:ring-purple-500/20' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                <div className="flex justify-center gap-1.5 mt-3">
                  {[15, 25, 45, 90].map(v => (
                    <button
                      key={v}
                      onClick={() => setInputValue(v.toString())}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-sm border ${
                        isDarkMode 
                          ? 'bg-[#181236] border-purple-500/25 text-purple-200 hover:border-purple-400 hover:text-purple-100' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      [{v}]
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleInsert}
                  className={`w-full mt-3 font-bold text-sm py-2.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-650 text-white shadow-purple-550/20 hover:opacity-95' 
                      : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-500/30'
                  }`}
                >
                  <Plus className="w-4 h-4" /> Insert Node
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={handleDelete} 
                  className={`flex items-center justify-center gap-1 border font-bold py-2 rounded-xl transition-colors text-xs ${
                    isDarkMode 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                      : 'bg-red-50 border-red-200 text-[#EF4444] hover:bg-red-100'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" /> Delete
                </button>
                <button 
                  onClick={handleSearch} 
                  className={`flex items-center justify-center gap-1 border font-bold py-2 rounded-xl transition-colors text-xs ${
                    isDarkMode 
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20' 
                      : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" /> Search
                </button>
                <button 
                  onClick={handleReset} 
                  className={`flex items-center justify-center gap-1 border font-bold py-2 rounded-xl transition-colors text-xs ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Traversal */}
            <div className={`border-t pt-4 space-y-3 ${isDarkMode ? 'border-purple-500/10' : 'border-slate-200'}`}>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Traversal Mode</label>
              <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${isDarkMode ? 'bg-[#181236] border-purple-500/10' : 'bg-[#F1F5F9] border-slate-200'}`}>
                {['inorder', 'preorder', 'postorder'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTraversalType(t)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${
                      traversalType === t 
                        ? isDarkMode 
                          ? 'bg-purple-650 text-white shadow-sm border border-purple-500/20' 
                          : 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                        : isDarkMode 
                          ? 'text-slate-400 hover:text-slate-200' 
                          : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={handleTraversal}
                className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/10 hover:opacity-95' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Run Traversal
              </button>
            </div>

            {/* Playback Controls */}
            <div className={`border-t pt-4 space-y-3 ${isDarkMode ? 'border-purple-500/10' : 'border-slate-200'}`}>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Execution Debugger</label>
              <div className={`flex items-center justify-between p-2 rounded-xl border gap-1 ${isDarkMode ? 'bg-[#140f30]/60 border-purple-500/10' : 'bg-slate-50 border-slate-200'}`}>
                <button 
                  onClick={handleAnimReset} 
                  className={`p-2 rounded-lg transition ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-850 hover:bg-slate-250'}`} 
                  title="Reset Step"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={handlePrev} 
                  className={`p-2 rounded-lg transition ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-850 hover:bg-slate-250'}`} 
                  title="Previous Step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={handlePlayPause} className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition" title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button 
                  onClick={handleNext} 
                  className={`p-2 rounded-lg transition ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-850 hover:bg-slate-250'}`} 
                  title="Next Step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Speed */}
            <div className={`border-t pt-4 space-y-1 ${isDarkMode ? 'border-purple-500/10' : 'border-slate-200'}`}>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Speed</span>
                <span>{speed}x</span>
              </div>
              <div className={`flex justify-between items-center p-1 rounded-xl ${isDarkMode ? 'bg-[#181236]' : 'bg-slate-100'}`}>
                {[0.5, 1, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                      speed === s 
                        ? isDarkMode 
                          ? 'bg-purple-650 text-white shadow' 
                          : 'bg-white shadow text-blue-600' 
                        : isDarkMode 
                          ? 'text-slate-450 hover:text-slate-200' 
                          : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Options */}
            <div className={`border-t pt-4 space-y-2 ${isDarkMode ? 'border-purple-500/10' : 'border-slate-200'}`}>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Display Options</label>
              {[
                { label: 'Show Traversal Path', state: showTraversalPath, set: setShowTraversalPath },
                { label: 'Show Call Stack', state: showCallStack, set: setShowCallStack },
                { label: 'Show Pseudocode', state: showPseudocode, set: setShowPseudocode },
              ].map(opt => (
                <label key={opt.label} className={`flex items-center gap-2.5 text-xs cursor-pointer transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-800'}`}>
                  <input
                    type="checkbox"
                    checked={opt.state}
                    onChange={e => opt.set(e.target.checked)}
                    className="accent-blue-600 rounded border-slate-300"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bottom: Complexity */}
          <div className={`border p-3 rounded-xl space-y-1.5 mt-4 ${isDarkMode ? 'bg-[#150d30]/60 border-purple-500/15' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`flex justify-between text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Tree Type:</span>
              <span className={isDarkMode ? 'text-purple-300 uppercase' : 'text-slate-800 uppercase'}>{treeType}</span>
            </div>
            <div className={`flex justify-between text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Nodes:</span>
              <span className={isDarkMode ? 'text-purple-300' : 'text-slate-800'}>{nodes.length}</span>
            </div>
            <div className={`flex justify-between text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Height:</span>
              <span className={isDarkMode ? 'text-purple-300' : 'text-slate-800'}>{treeRoot ? getTreeDepth(treeRoot) : 0}</span>
            </div>
            <div className={`flex justify-between text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Insert / Search:</span>
              <span className="text-emerald-500">{treeType === 'avl' ? 'O(log n)' : 'O(h)'}</span>
            </div>
            <div className={`flex justify-between text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Delete:</span>
              <span className="text-emerald-500">{treeType === 'avl' ? 'O(log n)' : 'O(h)'}</span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            CENTER PANEL: TREE CANVAS (45%)
        ═══════════════════════════════════════════════ */}
        <div className={`backdrop-blur-xl rounded-[24px] shadow-lg flex flex-col relative overflow-hidden shrink-0 border ${
          isDarkMode 
            ? 'bg-[#0f0b21]/90 border-purple-500/10 text-white' 
            : 'bg-white/70 border-[#E2E8F0]'
        } ${
          isGameRotated 
            ? 'w-[45%] h-full' 
            : 'w-full lg:w-[45%] h-[580px] lg:h-full'
        }`}>

          {/* Top bar */}
          <div className={`h-12 border-b px-6 flex items-center justify-between text-xs font-mono shrink-0 ${
            isDarkMode 
              ? 'border-purple-500/10 bg-[#120e2a]/80 text-purple-300' 
              : 'border-slate-200 bg-slate-50/80 text-slate-500'
          }`}>
            <span>Status: <span className={isDarkMode ? "text-purple-400 uppercase font-extrabold" : "text-blue-600 uppercase font-extrabold"}>{isPlaying ? 'Animating' : traversalIndex >= 0 ? 'Traversing' : 'Idle'}</span></span>
            <span>{animSteps.length > 0 ? `Step ${currentStep + 1} / ${animSteps.length}` : `Nodes: ${nodes.length}`}</span>
          </div>

          {/* SVG Canvas */}
          <div ref={canvasRef} className="flex-1 relative overflow-hidden">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Edges */}
              {edges.map((edge, i) => {
                const isActive = activeNodeValue === edge.from.value || activeNodeValue === edge.to.value;
                return (
                  <line
                    key={`edge-${edge.from.id}-${edge.to.id}`}
                    x1={edge.from.x}
                    y1={edge.from.y}
                    x2={edge.to.x}
                    y2={edge.to.y}
                    stroke={isActive ? '#2563EB' : '#CBD5E1'}
                    strokeWidth={isActive ? 3 : 2}
                    strokeLinecap="round"
                    style={{ transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const style = getNodeStyle(node);
                const isHovered = hoveredNode === node.value;
                const isActive = style.glow !== 'none';
                const r = isHovered ? 26 : 22;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredNode(node.value)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Glow ring for active nodes */}
                    {isActive && (
                      <circle
                        r={r + 8}
                        fill="none"
                        stroke={style.border}
                        strokeWidth="2"
                        opacity="0.25"
                        className="tree-glow-ring"
                      />
                    )}

                    {/* Outer shadow circle */}
                    <circle
                      r={r + 1}
                      fill="none"
                      stroke={style.border}
                      strokeWidth="1"
                      opacity="0.15"
                    />

                    {/* Main circle */}
                    <circle
                      r={r}
                      fill={style.bg}
                      stroke={style.border}
                      strokeWidth="2.5"
                      filter={isActive ? 'url(#glow-blue)' : 'none'}
                      style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Value text */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={style.text}
                      fontSize="14"
                      fontWeight="800"
                      fontFamily="Inter, system-ui, sans-serif"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.value}
                    </text>

                    {/* Hover tooltip */}
                    {isHovered && (
                      <g style={{ pointerEvents: 'none' }}>
                        <rect x={-60} y={-56} width={120} height={28} rx={8} fill="#1E293B" opacity={0.95} />
                        <text x={0} y={-39} textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
                          val={node.value}  h={node.height}  bf={getBalance(node)}
                        </text>
                      </g>
                    )}

                    {/* ROOT label */}
                    {treeRoot && node.value === treeRoot.value && (
                      <g>
                        <rect x={-20} y={-r - 22} width={40} height={16} rx={5} fill="#2563EB" />
                        <text x={0} y={-r - 12} textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">ROOT</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* CSS for glow animation */}
            <style>{`
              .tree-glow-ring {
                animation: treeGlowPulse 1.5s ease-in-out infinite;
              }
              @keyframes treeGlowPulse {
                0%, 100% { r: ${22 + 6}; opacity: 0.2; }
                50% { r: ${22 + 12}; opacity: 0.35; }
              }
            `}</style>

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <GitMerge className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Insert a node to start building your tree.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer: Step explanation */}
          <div className={`border-t p-4 flex flex-col justify-center items-center gap-1 shrink-0 ${
            isDarkMode 
              ? 'border-purple-500/10 bg-[#120e2a]/80' 
              : 'border-slate-200 bg-slate-50/80'
          }`}>
            <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
              isDarkMode ? 'text-purple-400' : 'text-blue-600'
            }`}>
              <Info className="w-3.5 h-3.5" /> AI Explanation
            </h4>
            <AnimatePresence mode="wait">
              <motion.span
                key={activeMessage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`text-xs font-semibold text-center max-w-md ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {activeMessage}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            RIGHT PANEL: CODE / CALL STACK (33%)
        ═══════════════════════════════════════════════ */}
        <div className={`backdrop-blur-xl rounded-[24px] shadow-lg flex flex-col overflow-hidden shrink-0 border ${
          isDarkMode 
            ? 'bg-[#120e2a]/80 border-purple-500/10 text-white' 
            : 'bg-white/70 border-[#E2E8F0]'
        } ${
          isGameRotated 
            ? 'w-[33%] h-full' 
            : 'w-full lg:w-[33%] lg:min-w-[300px] h-auto lg:h-full'
        }`}>

          {/* Tabs */}
          <div className={`grid grid-cols-3 border-b shrink-0 ${
            isDarkMode ? 'border-purple-500/10 bg-[#0f0b21]' : 'border-slate-200 bg-slate-50'
          }`}>
            {[
              { id: 'code', label: 'Pseudocode', icon: Code2 },
              { id: 'callstack', label: 'Call Stack', icon: Layers },
              { id: 'complexity', label: 'Details', icon: Database },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
                  activeTab === tab.id 
                    ? isDarkMode 
                      ? 'border-purple-500 text-purple-400 bg-[#120e2a]/50' 
                      : 'border-blue-600 text-blue-600 bg-white' 
                    : isDarkMode 
                      ? 'border-transparent text-slate-400 hover:text-slate-200' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className={`flex-1 overflow-auto p-5 transition-colors ${isDarkMode ? 'bg-[#120e2a]/30' : 'bg-white'}`}>
            <AnimatePresence mode="wait">

              {/* Pseudocode Tab */}
              {activeTab === 'code' && (
                <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col gap-4">
                  <pre className={`text-[12px] p-4 rounded-xl border overflow-y-auto font-mono flex-1 ${
                    isDarkMode ? 'bg-[#0b071e] border-purple-500/10 text-purple-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <code>
                      {pseudoLines.map(line => (
                        <div
                          key={line.id}
                          className={`py-0.5 px-2 rounded transition-all duration-200 flex items-start ${
                            activeLine === line.id 
                              ? isDarkMode 
                                ? 'bg-purple-600/35 text-white border-l-4 border-purple-500 font-bold' 
                                : 'bg-blue-100 text-blue-900 border-l-4 border-blue-500 font-bold' 
                              : isDarkMode 
                                ? 'border-l-4 border-transparent text-slate-300' 
                                : 'border-l-4 border-transparent text-slate-600'
                          }`}
                        >
                          <span className="w-5 text-slate-450 select-none shrink-0 text-right mr-2">{line.id}</span>
                          <span className="whitespace-pre">{line.text}</span>
                        </div>
                      ))}
                    </code>
                  </pre>

                  {/* Traversal Result */}
                  {showTraversalPath && traversalOrder.length > 0 && (
                    <div className={`border rounded-xl p-3 ${isDarkMode ? 'bg-[#0b071e]/85 border-purple-500/15' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {traversalType} Traversal Result
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {traversalOrder.map((item, i) => (
                          <span
                            key={i}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                              i < traversalIndex 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
                                : i === traversalIndex 
                                  ? isDarkMode 
                                    ? 'bg-purple-500/20 border-purple-500 text-purple-200 ring-2 ring-purple-500/20' 
                                    : 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-300'
                                  : isDarkMode 
                                    ? 'bg-[#181236]/80 border-purple-550/15 text-slate-500' 
                                    : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            {item.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Call Stack Tab */}
              {activeTab === 'callstack' && (
                <motion.div key="callstack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 h-full">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recursive Call Stack</h4>
                  {callStack.length > 0 ? (
                    <div className="space-y-1.5">
                      {[...callStack].reverse().map((item, i) => (
                        <motion.div
                          key={`${item.call}-${i}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-mono ${
                            i === 0 
                              ? isDarkMode 
                                ? 'bg-purple-500/20 border-purple-500/30 text-purple-200 font-bold shadow-sm' 
                                : 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-sm' 
                              : isDarkMode 
                                ? 'bg-[#0b071e]/70 border-purple-550/10 text-slate-350' 
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            isDarkMode ? 'bg-purple-950/80 text-purple-300' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {callStack.length - i}
                          </span>
                          <span>{item.call}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                      <Layers className="w-12 h-12 mb-3" />
                      <p className="text-xs font-medium text-slate-400">Run a traversal to see the recursive call stack.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Complexity / Details Tab */}
              {activeTab === 'complexity' && (
                <motion.div key="complexity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Time Complexity</h4>
                    <div className={`border rounded-xl p-4 space-y-3 shadow-inner ${
                      isDarkMode ? 'bg-[#0b071e]/85 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      {[
                        { op: 'Insert', best: 'O(log n)', worst: treeType === 'avl' ? 'O(log n)' : 'O(n)' },
                        { op: 'Search', best: 'O(log n)', worst: treeType === 'avl' ? 'O(log n)' : 'O(n)' },
                        { op: 'Delete', best: 'O(log n)', worst: treeType === 'avl' ? 'O(log n)' : 'O(n)' },
                        { op: 'Traversal', best: 'O(n)', worst: 'O(n)' },
                      ].map(row => (
                        <div key={row.op} className={`flex justify-between items-center py-1 border-b last:border-0 ${
                          isDarkMode ? 'border-purple-500/10' : 'border-slate-200'
                        }`}>
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{row.op}</span>
                          <div className="flex gap-3 text-[10px]">
                            <span className="text-emerald-500 font-bold">Best: {row.best}</span>
                            <span className="text-amber-500 font-bold">Worst: {row.worst}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Space Complexity</h4>
                    <div className={`border rounded-xl p-4 shadow-inner ${isDarkMode ? 'bg-[#0b071e]/85 border-purple-500/10' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Storage</span>
                        <span className="text-emerald-500 font-bold text-xs">O(n)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Operation Log</h4>
                    <div className={`border rounded-xl p-3 space-y-1.5 max-h-48 overflow-y-auto shadow-inner ${
                      isDarkMode ? 'bg-[#0b071e]/85 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      {history.length > 0 ? history.map((h, i) => (
                        <div key={i} className={`text-[11px] font-mono ${
                          i === 0 
                            ? isDarkMode 
                              ? 'text-purple-300 font-bold' 
                              : 'text-slate-800 font-bold' 
                            : isDarkMode 
                              ? 'text-slate-400' 
                              : 'text-slate-500'
                        }`}>
                          &gt; {h.msg}
                        </div>
                      )) : (
                        <p className="text-slate-400 text-xs">No operations yet.</p>
                      )}
                    </div>
                  </div>

                  {treeType === 'avl' && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">AVL Rotations</h4>
                      <div className={`border rounded-xl p-4 space-y-2 shadow-inner text-xs ${
                        isDarkMode ? 'bg-[#0b071e]/85 border-purple-500/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-100 text-blue-600'
                          }`}>LL</span>
                          <span>Single Right Rotation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-100 text-blue-600'
                          }`}>RR</span>
                          <span>Single Left Rotation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-650'
                          }`}>LR</span>
                          <span>Left-Right Double Rotation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-655'
                          }`}>RL</span>
                          <span>Right-Left Double Rotation</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
  );
}
