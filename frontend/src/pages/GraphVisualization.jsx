import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Zap, Play, Pause, SkipForward, SkipBack, RotateCcw,
  Plus, Link2, Trash2, Code2, Layers, Database, Info, Share2,
  Search, Minus, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import './DashboardTheme.css';

// ─── GRAPH ENGINE ────────────────────────────────────────────────
let nodeIdCounter = 0;
function createNode(label, x, y) {
  return {
    id: `gnode-${nodeIdCounter++}-${Date.now()}`,
    label,
    x: x || 300 + Math.random() * 200,
    y: y || 200 + Math.random() * 150,
    vx: 0, vy: 0,
  };
}

function createEdge(sourceId, targetId, weight = 1) {
  return { id: `edge-${sourceId}-${targetId}-${Date.now()}`, source: sourceId, target: targetId, weight };
}

// ─── ALGORITHMS ──────────────────────────────────────────────────
function bfsSteps(nodes, edges, startId, graphType) {
  const adj = buildAdj(nodes, edges, graphType);
  const steps = [];
  const visited = new Set();
  const queue = [startId];
  visited.add(startId);
  steps.push({ type: 'start', message: `BFS starting from ${getLbl(nodes, startId)}.`, activeNode: startId, queue: [...queue], visited: new Set(visited) });

  while (queue.length > 0) {
    const current = queue.shift();
    steps.push({ type: 'visit', message: `Visit node ${getLbl(nodes, current)}.`, activeNode: current, queue: [...queue], visited: new Set(visited) });
    const neighbors = adj[current] || [];
    for (const { to } of neighbors) {
      if (!visited.has(to)) {
        visited.add(to);
        queue.push(to);
        steps.push({ type: 'discover', message: `Discover ${getLbl(nodes, to)} from ${getLbl(nodes, current)}.`, activeNode: to, activeEdge: { from: current, to }, queue: [...queue], visited: new Set(visited) });
      }
    }
  }
  steps.push({ type: 'done', message: 'BFS complete.', visited: new Set(visited) });
  return steps;
}

function dfsSteps(nodes, edges, startId, graphType) {
  const adj = buildAdj(nodes, edges, graphType);
  const steps = [];
  const visited = new Set();
  const stack = [startId];
  steps.push({ type: 'start', message: `DFS starting from ${getLbl(nodes, startId)}.`, activeNode: startId, stack: [...stack], visited: new Set(visited) });

  while (stack.length > 0) {
    const current = stack.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    steps.push({ type: 'visit', message: `Visit node ${getLbl(nodes, current)}.`, activeNode: current, stack: [...stack], visited: new Set(visited) });
    const neighbors = (adj[current] || []).slice().reverse();
    for (const { to } of neighbors) {
      if (!visited.has(to)) {
        stack.push(to);
        steps.push({ type: 'discover', message: `Push ${getLbl(nodes, to)} to stack.`, activeNode: to, activeEdge: { from: current, to }, stack: [...stack], visited: new Set(visited) });
      }
    }
  }
  steps.push({ type: 'done', message: 'DFS complete.', visited: new Set(visited) });
  return steps;
}

function dijkstraSteps(nodes, edges, startId, graphType) {
  const adj = buildAdj(nodes, edges, graphType);
  const steps = [];
  const dist = {};
  const prev = {};
  const visited = new Set();
  const pq = [];

  for (const n of nodes) {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  }
  dist[startId] = 0;
  pq.push({ id: startId, dist: 0 });
  steps.push({ type: 'start', message: `Dijkstra from ${getLbl(nodes, startId)}. Set dist[${getLbl(nodes, startId)}]=0.`, activeNode: startId, dist: { ...dist }, visited: new Set(visited) });

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { id: u } = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    steps.push({ type: 'visit', message: `Process ${getLbl(nodes, u)} (dist=${dist[u]}).`, activeNode: u, dist: { ...dist }, visited: new Set(visited) });

    for (const { to, weight } of (adj[u] || [])) {
      if (!visited.has(to)) {
        const alt = dist[u] + weight;
        if (alt < dist[to]) {
          dist[to] = alt;
          prev[to] = u;
          pq.push({ id: to, dist: alt });
          steps.push({ type: 'relax', message: `Relax ${getLbl(nodes, to)}: dist = ${alt}.`, activeNode: to, activeEdge: { from: u, to }, dist: { ...dist }, visited: new Set(visited) });
        }
      }
    }
  }
  steps.push({ type: 'done', message: 'Dijkstra complete.', dist: { ...dist }, visited: new Set(visited) });
  return steps;
}

function detectCycleSteps(nodes, edges, graphType) {
  const adj = buildAdj(nodes, edges, graphType);
  const steps = [];
  const visited = new Set();
  const recStack = new Set();
  let cycleFound = false;

  steps.push({ type: 'start', message: 'Starting cycle detection...', visited: new Set() });

  function dfs(u, parent) {
    visited.add(u);
    recStack.add(u);
    steps.push({ type: 'visit', message: `Visit ${getLbl(nodes, u)}.`, activeNode: u, visited: new Set(visited) });

    for (const { to } of (adj[u] || [])) {
      if (graphType === 'undirected' && to === parent) continue;
      if (recStack.has(to)) {
        steps.push({ type: 'cycle', message: `Cycle found! ${getLbl(nodes, u)} → ${getLbl(nodes, to)}.`, activeNode: to, activeEdge: { from: u, to }, visited: new Set(visited) });
        cycleFound = true;
        return true;
      }
      if (!visited.has(to)) {
        steps.push({ type: 'discover', message: `Explore edge ${getLbl(nodes, u)} → ${getLbl(nodes, to)}.`, activeEdge: { from: u, to }, visited: new Set(visited) });
        if (dfs(to, u)) return true;
      }
    }
    recStack.delete(u);
    return false;
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      if (dfs(n.id, null)) break;
    }
  }
  if (!cycleFound) {
    steps.push({ type: 'done', message: 'No cycle detected.', visited: new Set(visited) });
  } else {
    steps.push({ type: 'done', message: 'Cycle detection complete — cycle exists!', visited: new Set(visited) });
  }
  return steps;
}

function mstSteps(nodes, edges, graphType) {
  const steps = [];
  if (nodes.length === 0) return [{ type: 'done', message: 'No nodes in graph.' }];

  // Kruskal's
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const parent = {};
  const rank = {};
  for (const n of nodes) { parent[n.id] = n.id; rank[n.id] = 0; }

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a, b) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else { parent[rb] = ra; rank[ra]++; }
    return true;
  }

  const mstEdges = [];
  steps.push({ type: 'start', message: "Kruskal's MST: sorting edges by weight.", visited: new Set() });

  for (const edge of sortedEdges) {
    const src = edge.source, tgt = edge.target;
    steps.push({ type: 'consider', message: `Consider edge ${getLbl(nodes, src)} — ${getLbl(nodes, tgt)} (w=${edge.weight}).`, activeEdge: { from: src, to: tgt }, visited: new Set() });
    if (union(src, tgt)) {
      mstEdges.push(edge);
      steps.push({ type: 'accept', message: `Accept edge ${getLbl(nodes, src)} — ${getLbl(nodes, tgt)}.`, activeEdge: { from: src, to: tgt }, mstEdges: mstEdges.map(e => e.id), visited: new Set() });
    } else {
      steps.push({ type: 'reject', message: `Reject (would form cycle).`, activeEdge: { from: src, to: tgt }, visited: new Set() });
    }
  }
  const totalWeight = mstEdges.reduce((s, e) => s + e.weight, 0);
  steps.push({ type: 'done', message: `MST complete. Total weight: ${totalWeight}.`, mstEdges: mstEdges.map(e => e.id), visited: new Set() });
  return steps;
}

// Helpers
function buildAdj(nodes, edges, graphType) {
  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.source] = adj[e.source] || [];
    adj[e.source].push({ to: e.target, weight: e.weight });
    if (graphType !== 'directed') {
      adj[e.target] = adj[e.target] || [];
      adj[e.target].push({ to: e.source, weight: e.weight });
    }
  }
  return adj;
}

function getLbl(nodes, id) {
  const n = nodes.find(n => n.id === id);
  return n ? n.label : '?';
}

// ─── FORCE SIMULATION ────────────────────────────────────────────
function forceSimStep(nodes, edges, canvasW, canvasH) {
  const k = 120; // ideal spring length
  const repulsion = 5000;
  const damping = 0.85;
  const dt = 0.3;
  const cx = canvasW / 2, cy = canvasH / 2;

  // Repulsion between all pairs
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      let dx = nodes[j].x - nodes[i].x;
      let dy = nodes[j].y - nodes[i].y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = repulsion / (dist * dist);
      let fx = (dx / dist) * force;
      let fy = (dy / dist) * force;
      nodes[i].vx -= fx; nodes[i].vy -= fy;
      nodes[j].vx += fx; nodes[j].vy += fy;
    }
  }

  // Attraction along edges
  for (const e of edges) {
    const s = nodes.find(n => n.id === e.source);
    const t = nodes.find(n => n.id === e.target);
    if (!s || !t) continue;
    let dx = t.x - s.x;
    let dy = t.y - s.y;
    let dist = Math.sqrt(dx * dx + dy * dy) || 1;
    let force = (dist - k) * 0.05;
    let fx = (dx / dist) * force;
    let fy = (dy / dist) * force;
    s.vx += fx; s.vy += fy;
    t.vx -= fx; t.vy -= fy;
  }

  // Centering
  for (const n of nodes) {
    n.vx += (cx - n.x) * 0.002;
    n.vy += (cy - n.y) * 0.002;
  }

  // Apply
  for (const n of nodes) {
    n.vx *= damping;
    n.vy *= damping;
    n.x += n.vx * dt;
    n.y += n.vy * dt;
    n.x = Math.max(40, Math.min(canvasW - 40, n.x));
    n.y = Math.max(40, Math.min(canvasH - 40, n.y));
  }
}

// ─── PSEUDOCODE DEFINITIONS ─────────────────────────────────────
const PSEUDOCODES = {
  bfs: [
    { id: 1, text: 'function BFS(graph, start):' },
    { id: 2, text: '    create queue Q' },
    { id: 3, text: '    mark start as visited' },
    { id: 4, text: '    enqueue(Q, start)' },
    { id: 5, text: '    while Q is not empty:' },
    { id: 6, text: '        node = dequeue(Q)' },
    { id: 7, text: '        process(node)' },
    { id: 8, text: '        for neighbor in adj(node):' },
    { id: 9, text: '            if not visited:' },
    { id: 10, text: '                mark visited' },
    { id: 11, text: '                enqueue(Q, neighbor)' },
  ],
  dfs: [
    { id: 1, text: 'function DFS(graph, start):' },
    { id: 2, text: '    create stack S' },
    { id: 3, text: '    push(S, start)' },
    { id: 4, text: '    while S is not empty:' },
    { id: 5, text: '        node = pop(S)' },
    { id: 6, text: '        if not visited:' },
    { id: 7, text: '            mark visited' },
    { id: 8, text: '            process(node)' },
    { id: 9, text: '            for neighbor in adj(node):' },
    { id: 10, text: '                if not visited:' },
    { id: 11, text: '                    push(S, neighbor)' },
  ],
  dijkstra: [
    { id: 1, text: 'function Dijkstra(graph, start):' },
    { id: 2, text: '    dist[start] = 0' },
    { id: 3, text: '    for all other v: dist[v] = ∞' },
    { id: 4, text: '    PQ = {(start, 0)}' },
    { id: 5, text: '    while PQ not empty:' },
    { id: 6, text: '        u = extract_min(PQ)' },
    { id: 7, text: '        for (u, v, w) in edges:' },
    { id: 8, text: '            if dist[u] + w < dist[v]:' },
    { id: 9, text: '                dist[v] = dist[u] + w' },
    { id: 10, text: '                update PQ' },
    { id: 11, text: '    return dist' },
  ],
  cycle: [
    { id: 1, text: 'function detectCycle(graph):' },
    { id: 2, text: '    for each node:' },
    { id: 3, text: '        if not visited:' },
    { id: 4, text: '            if DFS(node) finds back edge:' },
    { id: 5, text: '                return "Cycle Found"' },
    { id: 6, text: '    return "No Cycle"' },
  ],
  mst: [
    { id: 1, text: "function Kruskal(graph):" },
    { id: 2, text: '    sort edges by weight' },
    { id: 3, text: '    MST = {}' },
    { id: 4, text: '    for each edge (u, v, w):' },
    { id: 5, text: '        if find(u) ≠ find(v):' },
    { id: 6, text: '            union(u, v)' },
    { id: 7, text: '            MST.add(edge)' },
    { id: 8, text: '    return MST' },
  ],
};

function getActivePseudoLine(algorithm, step) {
  if (!step) return -1;
  if (algorithm === 'bfs') {
    if (step.type === 'start') return 1;
    if (step.type === 'visit') return 7;
    if (step.type === 'discover') return 11;
    if (step.type === 'done') return 5;
  } else if (algorithm === 'dfs') {
    if (step.type === 'start') return 1;
    if (step.type === 'visit') return 8;
    if (step.type === 'discover') return 11;
    if (step.type === 'done') return 4;
  } else if (algorithm === 'dijkstra') {
    if (step.type === 'start') return 2;
    if (step.type === 'visit') return 6;
    if (step.type === 'relax') return 9;
    if (step.type === 'done') return 11;
  } else if (algorithm === 'cycle') {
    if (step.type === 'start') return 1;
    if (step.type === 'visit') return 3;
    if (step.type === 'discover') return 4;
    if (step.type === 'cycle') return 5;
    if (step.type === 'done') return 6;
  } else if (algorithm === 'mst') {
    if (step.type === 'start') return 2;
    if (step.type === 'consider') return 4;
    if (step.type === 'accept') return 7;
    if (step.type === 'reject') return 5;
    if (step.type === 'done') return 8;
  }
  return -1;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function GraphVisualization() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 400 });

  // Graph state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [graphType, setGraphType] = useState('undirected');
  const [inputValue, setInputValue] = useState('');
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeWeight, setEdgeWeight] = useState('1');

  // Algorithm
  const [algorithm, setAlgorithm] = useState('bfs');
  const [animSteps, setAnimSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const playRef = useRef(null);

  // Auto mode
  const [autoMode, setAutoMode] = useState(false);
  const autoModeRef = useRef(false);

  // Visual state
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activeEdge, setActiveEdge] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [mstEdgeIds, setMstEdgeIds] = useState(new Set());
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dragNode, setDragNode] = useState(null);

  // Right panel
  const [activeTab, setActiveTab] = useState('code');

  // History
  const [history, setHistory] = useState([]);
  const addHistory = (msg) => setHistory(prev => [{ msg, time: Date.now() }, ...prev].slice(0, 12));

  // Physics
  const physicsRef = useRef(null);

  // ─── Resize observer ─────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setCanvasSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ─── Force simulation ────────────────────────────────────────
  useEffect(() => {
    if (nodes.length < 2) return;
    let running = true;
    let frame = 0;
    function tick() {
      if (!running || frame > 200) return;
      forceSimStep(nodes, edges, canvasSize.w, canvasSize.h);
      setNodes(prev => prev.map(n => ({ ...n })));
      frame++;
      physicsRef.current = requestAnimationFrame(tick);
    }
    tick();
    return () => { running = false; cancelAnimationFrame(physicsRef.current); };
  }, [nodes.length, edges.length, canvasSize]);

  // ─── Playback ────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying && animSteps.length > 0) {
      playRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= animSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200 / speed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, animSteps, speed]);

  // ─── Step highlight ──────────────────────────────────────────
  useEffect(() => {
    if (currentStep < 0 || currentStep >= animSteps.length) return;
    const step = animSteps[currentStep];
    if (!step) return;
    setActiveNodeId(step.activeNode || null);
    setActiveEdge(step.activeEdge || null);
    if (step.visited) setVisitedNodes(step.visited);
    if (step.mstEdges) setMstEdgeIds(new Set(step.mstEdges));
  }, [currentStep, animSteps]);

  useEffect(() => { autoModeRef.current = autoMode; }, [autoMode]);

  // ─── Node operations ────────────────────────────────────────
  const handleAddNode = useCallback(() => {
    let label = inputValue.trim();
    if (!label) label = String.fromCharCode(65 + nodes.length % 26) + (nodes.length >= 26 ? Math.floor(nodes.length / 26) : '');
    if (nodes.find(n => n.label === label)) { addHistory(`Node "${label}" already exists.`); return; }
    const newNode = createNode(label, canvasSize.w / 2 + (Math.random() - 0.5) * 100, canvasSize.h / 2 + (Math.random() - 0.5) * 100);
    setNodes(prev => [...prev, newNode]);
    setInputValue('');
    addHistory(`Added node ${label}`);
  }, [inputValue, nodes, canvasSize]);

  const handleAddEdge = () => {
    const src = nodes.find(n => n.label === edgeSource.trim());
    const tgt = nodes.find(n => n.label === edgeTarget.trim());
    if (!src || !tgt) { addHistory('Invalid edge nodes.'); return; }
    if (src.id === tgt.id) { addHistory('Self-loops not supported.'); return; }
    const exists = edges.find(e => e.source === src.id && e.target === tgt.id);
    if (exists) { addHistory('Edge already exists.'); return; }
    const w = parseFloat(edgeWeight) || 1;
    setEdges(prev => [...prev, createEdge(src.id, tgt.id, w)]);
    addHistory(`Edge ${src.label} → ${tgt.label} (w=${w})`);
    setEdgeSource('');
    setEdgeTarget('');
    setEdgeWeight('1');
  };

  const handleDeleteNode = () => {
    const label = inputValue.trim();
    const node = nodes.find(n => n.label === label);
    if (!node) return;
    setNodes(prev => prev.filter(n => n.id !== node.id));
    setEdges(prev => prev.filter(e => e.source !== node.id && e.target !== node.id));
    addHistory(`Deleted node ${label}`);
    setInputValue('');
  };

  const handleReset = () => {
    setNodes([]); setEdges([]);
    setAnimSteps([]); setCurrentStep(-1);
    setIsPlaying(false); setAutoMode(false);
    setActiveNodeId(null); setActiveEdge(null);
    setVisitedNodes(new Set()); setMstEdgeIds(new Set());
    addHistory('Graph cleared');
  };

  // ─── Run Algorithm ──────────────────────────────────────────
  const handleRunAlgorithm = useCallback(() => {
    if (nodes.length === 0) return;
    let steps = [];
    const startNode = nodes[0].id;
    if (algorithm === 'bfs') steps = bfsSteps(nodes, edges, startNode, graphType);
    else if (algorithm === 'dfs') steps = dfsSteps(nodes, edges, startNode, graphType);
    else if (algorithm === 'dijkstra') steps = dijkstraSteps(nodes, edges, startNode, graphType);
    else if (algorithm === 'cycle') steps = detectCycleSteps(nodes, edges, graphType);
    else if (algorithm === 'mst') steps = mstSteps(nodes, edges, graphType);

    setAnimSteps(steps);
    setCurrentStep(0);
    setIsPlaying(true);
    setVisitedNodes(new Set());
    setMstEdgeIds(new Set());
    addHistory(`Running ${algorithm.toUpperCase()}`);
  }, [nodes, edges, algorithm, graphType]);

  // ─── Auto mode: build graph then run ────────────────────────
  const autoAddAndRun = useCallback(() => {
    // Build a sample graph
    const sampleLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const cx = canvasSize.w / 2, cy = canvasSize.h / 2, r = Math.min(cx, cy) * 0.6;
    const newNodes = sampleLabels.map((lbl, i) => {
      const angle = (i / sampleLabels.length) * Math.PI * 2 - Math.PI / 2;
      return createNode(lbl, cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    });
    const sampleEdges = [
      [0, 1, 4], [0, 2, 2], [1, 2, 1], [1, 3, 5], [2, 4, 3], [3, 5, 2], [4, 5, 1], [3, 4, 4]
    ].map(([s, t, w]) => createEdge(newNodes[s].id, newNodes[t].id, graphType === 'weighted' ? w : 1));

    setNodes(newNodes);
    setEdges(sampleEdges);
    addHistory('Auto-built sample graph');

    // Run algorithm after a short delay
    setTimeout(() => {
      if (!autoModeRef.current) return;
      let steps = [];
      const startNode = newNodes[0].id;
      if (algorithm === 'bfs') steps = bfsSteps(newNodes, sampleEdges, startNode, graphType);
      else if (algorithm === 'dfs') steps = dfsSteps(newNodes, sampleEdges, startNode, graphType);
      else if (algorithm === 'dijkstra') steps = dijkstraSteps(newNodes, sampleEdges, startNode, graphType);
      else if (algorithm === 'cycle') steps = detectCycleSteps(newNodes, sampleEdges, graphType);
      else if (algorithm === 'mst') steps = mstSteps(newNodes, sampleEdges, graphType);
      setAnimSteps(steps);
      setCurrentStep(0);
      setIsPlaying(true);
      addHistory(`Auto-running ${algorithm.toUpperCase()}`);
    }, 800);
  }, [algorithm, graphType, canvasSize]);

  // ─── Playback Controls ──────────────────────────────────────
  const handlePlayPause = () => {
    if (isPlaying || autoMode) {
      setIsPlaying(false);
      setAutoMode(false);
      return;
    }
    if (animSteps.length === 0 && nodes.length === 0) {
      setAutoMode(true);
      autoAddAndRun();
      return;
    }
    if (animSteps.length === 0 && nodes.length > 0) {
      handleRunAlgorithm();
      return;
    }
    setIsPlaying(true);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStep < animSteps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleAnimReset = () => {
    setIsPlaying(false);
    setAutoMode(false);
    setAnimSteps([]); setCurrentStep(-1);
    setNodes([]); setEdges([]);
    setActiveNodeId(null); setActiveEdge(null);
    setVisitedNodes(new Set()); setMstEdgeIds(new Set());
    addHistory('Restarted — graph cleared');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleAddNode(); };

  // ─── Drag handlers ──────────────────────────────────────────
  const handleMouseDown = (nodeId, e) => {
    e.preventDefault();
    setDragNode(nodeId);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragNode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNodes(prev => prev.map(n => n.id === dragNode ? { ...n, x, y, vx: 0, vy: 0 } : n));
  }, [dragNode]);

  const handleMouseUp = useCallback(() => { setDragNode(null); }, []);

  useEffect(() => {
    if (dragNode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }
  }, [dragNode, handleMouseMove, handleMouseUp]);

  // ─── Derived ─────────────────────────────────────────────────
  const currentStepData = currentStep >= 0 && currentStep < animSteps.length ? animSteps[currentStep] : null;
  const activeMessage = currentStepData ? currentStepData.message : 'Build a graph and run an algorithm.';
  const pseudoLines = PSEUDOCODES[algorithm] || [];
  const activePseudoLine = getActivePseudoLine(algorithm, currentStepData);

  // Queue/Stack for call stack tab
  const getQueueOrStack = () => {
    if (!currentStepData) return [];
    if (currentStepData.queue) return currentStepData.queue.map(id => getLbl(nodes, id));
    if (currentStepData.stack) return currentStepData.stack.map(id => getLbl(nodes, id));
    return [];
  };

  // Node style
  const getNodeStyle = (node) => {
    if (activeNodeId === node.id) return { bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8', glow: true };
    if (visitedNodes.has(node.id)) return { bg: '#D1FAE5', border: '#10B981', text: '#059669', glow: false };
    return { bg: '#FFFFFF', border: '#CBD5E1', text: '#334155', glow: false };
  };

  // Edge style
  const getEdgeStyle = (edge) => {
    const isActive = activeEdge && ((activeEdge.from === edge.source && activeEdge.to === edge.target) || (activeEdge.from === edge.target && activeEdge.to === edge.source));
    const isMst = mstEdgeIds.has(edge.id);
    if (isActive) return { stroke: '#2563EB', width: 4, glow: true };
    if (isMst) return { stroke: '#F59E0B', width: 3.5, glow: true };
    const srcVisited = visitedNodes.has(edge.source) && visitedNodes.has(edge.target);
    if (srcVisited) return { stroke: '#10B981', width: 2.5, glow: false };
    return { stroke: '#CBD5E1', width: 2, glow: false };
  };

  // Curved path for edges
  const getEdgePath = (edge) => {
    const s = nodes.find(n => n.id === edge.source);
    const t = nodes.find(n => n.id === edge.target);
    if (!s || !t) return '';
    const dx = t.x - s.x, dy = t.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    // Perpendicular offset for curve
    const offset = Math.min(30, dist * 0.15);
    const mx = (s.x + t.x) / 2 + (-dy / dist) * offset;
    const my = (s.y + t.y) / 2 + (dx / dist) * offset;
    return `M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}`;
  };

  // Arrow for directed
  const getArrowAtEnd = (edge) => {
    const s = nodes.find(n => n.id === edge.source);
    const t = nodes.find(n => n.id === edge.target);
    if (!s || !t) return null;
    const dx = t.x - s.x, dy = t.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const r = 24; // node radius
    const ex = t.x - (dx / dist) * r;
    const ey = t.y - (dy / dist) * r;
    const angle = Math.atan2(dy, dx);
    const arrowLen = 12, spread = 0.4;
    const p1x = ex - arrowLen * Math.cos(angle - spread);
    const p1y = ey - arrowLen * Math.sin(angle - spread);
    const p2x = ex - arrowLen * Math.cos(angle + spread);
    const p2y = ey - arrowLen * Math.sin(angle + spread);
    return `M ${ex} ${ey} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`;
  };

  // Weight badge position
  const getWeightPos = (edge) => {
    const s = nodes.find(n => n.id === edge.source);
    const t = nodes.find(n => n.id === edge.target);
    if (!s || !t) return { x: 0, y: 0 };
    const dx = t.x - s.x, dy = t.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = Math.min(30, dist * 0.15);
    return {
      x: (s.x + t.x) / 2 + (-dy / dist) * offset * 0.5,
      y: (s.y + t.y) / 2 + (dx / dist) * offset * 0.5 - 8,
    };
  };

  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col font-sans db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>

      {/* HEADER BREADCRUMB */}
      <header className="h-16 shrink-0 flex items-center justify-between px-8 shadow-sm relative z-10" style={{ background: 'var(--db-card-bg)', borderBottom: '1px solid var(--db-header-border)' }}>
        <div className="flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-full transition">
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--db-text-main)' }} />
        </button>
        <div className="flex items-center text-sm font-medium gap-2" style={{ color: 'var(--db-text-muted)' }}>
          <span>Home</span> <ChevronRight className="w-4 h-4" />
          <span>Subjects</span> <ChevronRight className="w-4 h-4" />
          <span>DSA</span> <ChevronRight className="w-4 h-4" />
          <span className="text-blue-500 font-bold">Graphs</span> <ChevronRight className="w-4 h-4" />
          <span style={{ color: 'var(--db-text-main)' }}>Visual Lab</span>
        </div>
        </div>
        <ThemeToggleButton />
      </header>

      {/* MAIN 3-PANEL LAYOUT */}
      <main className="flex-1 p-5 gap-5 flex h-[calc(100vh-64px)] max-w-[1920px] mx-auto w-full overflow-hidden">

        {/* ═══════════════════════════════════════════════
            LEFT PANEL: CONTROL CENTER (22%)
        ═══════════════════════════════════════════════ */}
        <div className="w-[22%] min-w-[280px] h-full bg-white/70 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-lg p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">

            {/* Header */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-blue-500" /> Graph Lab
              </h2>
              <p className="text-[#64748B] text-[11px]">Create, connect, and visualize graph algorithms live.</p>
            </div>

            {/* Graph Type Selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Graph Type</label>
              <div className="grid grid-cols-3 gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
                {[
                  { id: 'undirected', label: 'Undirected' },
                  { id: 'directed', label: 'Directed' },
                  { id: 'weighted', label: 'Weighted' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setGraphType(t.id)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${graphType === t.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Node Operations */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Node Operations</label>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 shadow-inner">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter node value..."
                  className="w-full text-center text-lg font-bold bg-white border-2 border-slate-200 rounded-xl py-2.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-slate-800 placeholder-slate-300"
                />
                <div className="flex justify-center gap-1.5 mt-3">
                  {['A', 'B', 'C', 'D'].map(v => (
                    <button
                      key={v}
                      onClick={() => setInputValue(v)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition shadow-sm"
                    >
                      [{v}]
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAddNode}
                  className="w-full mt-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Node
                </button>
              </div>

              {/* Edge Add */}
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 shadow-inner space-y-2">
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Add Edge</label>
                <div className="grid grid-cols-2 gap-2">
                  <input value={edgeSource} onChange={e => setEdgeSource(e.target.value)} placeholder="From" className="text-center text-sm font-bold bg-white border-2 border-slate-200 rounded-lg py-1.5 focus:outline-none focus:border-blue-500 transition text-slate-800 placeholder-slate-300" />
                  <input value={edgeTarget} onChange={e => setEdgeTarget(e.target.value)} placeholder="To" className="text-center text-sm font-bold bg-white border-2 border-slate-200 rounded-lg py-1.5 focus:outline-none focus:border-blue-500 transition text-slate-800 placeholder-slate-300" />
                </div>
                {graphType === 'weighted' && (
                  <input value={edgeWeight} onChange={e => setEdgeWeight(e.target.value)} placeholder="Weight" type="number" className="w-full text-center text-sm font-bold bg-white border-2 border-slate-200 rounded-lg py-1.5 focus:outline-none focus:border-blue-500 transition text-slate-800 placeholder-slate-300" />
                )}
                <button onClick={handleAddEdge} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                  <Link2 className="w-3.5 h-3.5" /> Add Edge
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleDeleteNode} className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-[#EF4444] border border-red-200 font-bold py-2 rounded-xl transition-colors text-xs">
                  <Minus className="w-3.5 h-3.5" /> Delete
                </button>
                <button onClick={handleReset} className="flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold py-2 rounded-xl transition-colors text-xs">
                  <Trash2 className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Algorithm Section */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Algorithm</label>
              <div className="grid grid-cols-1 gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
                {[
                  { id: 'bfs', label: 'BFS Traversal' },
                  { id: 'dfs', label: 'DFS Traversal' },
                  { id: 'dijkstra', label: 'Dijkstra Path' },
                  { id: 'cycle', label: 'Detect Cycle' },
                  { id: 'mst', label: 'MST (Kruskal)' },
                ].map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAlgorithm(a.id)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all text-left px-3 ${algorithm === a.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRunAlgorithm}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Run Algorithm
              </button>
            </div>

            {/* Execution Debugger */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Execution Debugger</label>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 gap-1">
                <button onClick={handleAnimReset} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500 hover:text-slate-800" title="Restart">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={handlePrev} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500 hover:text-slate-800" title="Previous Step">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={handlePlayPause} className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition" title={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button onClick={handleNext} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500 hover:text-slate-800" title="Next Step">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Speed */}
            <div className="border-t border-slate-200 pt-4 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Speed</span>
                <span>{speed}x</span>
              </div>
              <div className="flex justify-between items-center bg-slate-100 p-1 rounded-xl">
                {[0.5, 1, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${speed === s ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: Stats */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5 mt-4">
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>Graph Type:</span>
              <span className="text-slate-800 uppercase">{graphType}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>Nodes:</span>
              <span className="text-slate-800">{nodes.length}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>Edges:</span>
              <span className="text-slate-800">{edges.length}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>Algorithm:</span>
              <span className="text-emerald-600 uppercase">{algorithm}</span>
            </div>
          </div>
        </div>


        {/* ═══════════════════════════════════════════════
            CENTER PANEL: GRAPH CANVAS (45%)
        ═══════════════════════════════════════════════ */}
        <div className="w-[45%] h-full bg-white/70 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-lg flex flex-col relative overflow-hidden">

          {/* Top bar */}
          <div className="h-12 border-b border-slate-200 bg-slate-50/80 px-6 flex items-center justify-between text-xs font-mono text-slate-500 shrink-0">
            <span>Status: <span className="text-blue-600 uppercase font-extrabold">{isPlaying ? 'Running' : animSteps.length > 0 ? 'Paused' : 'Idle'}</span></span>
            <span>{animSteps.length > 0 ? `Step ${currentStep + 1} / ${animSteps.length}` : `Nodes: ${nodes.length} | Edges: ${edges.length}`}</span>
          </div>

          {/* SVG Canvas */}
          <div ref={canvasRef} className="flex-1 relative overflow-hidden" style={{ cursor: dragNode ? 'grabbing' : 'default' }}>
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <filter id="graph-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="edge-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Edges */}
              {edges.map(edge => {
                const style = getEdgeStyle(edge);
                const path = getEdgePath(edge);
                const wPos = getWeightPos(edge);
                return (
                  <g key={edge.id}>
                    <path
                      d={path}
                      fill="none"
                      stroke={style.stroke}
                      strokeWidth={style.width}
                      strokeLinecap="round"
                      filter={style.glow ? 'url(#edge-glow)' : 'none'}
                      style={{ transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    />
                    {/* Directed arrow */}
                    {graphType === 'directed' && (
                      <path d={getArrowAtEnd(edge)} fill={style.stroke} style={{ transition: 'all 0.5s ease' }} />
                    )}
                    {/* Weight badge */}
                    {(graphType === 'weighted') && (
                      <g>
                        <rect x={wPos.x - 12} y={wPos.y - 8} width={24} height={16} rx={6} fill="white" stroke="#E2E8F0" strokeWidth="1" />
                        <text x={wPos.x} y={wPos.y + 3} textAnchor="middle" fill="#475569" fontSize="9" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">
                          {edge.weight}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const style = getNodeStyle(node);
                const isHovered = hoveredNode === node.id;
                const r = isHovered ? 28 : 24;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ transition: dragNode === node.id ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', cursor: 'grab' }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onMouseDown={(e) => handleMouseDown(node.id, e)}
                  >
                    {/* Glow ring */}
                    {style.glow && (
                      <circle r={r + 10} fill="none" stroke={style.border} strokeWidth="2" opacity="0.25" className="graph-glow-ring" />
                    )}

                    {/* Outer shadow */}
                    <circle r={r + 1} fill="none" stroke={style.border} strokeWidth="1" opacity="0.15" />

                    {/* Main circle */}
                    <circle
                      r={r}
                      fill={style.bg}
                      stroke={style.border}
                      strokeWidth="2.5"
                      filter={style.glow ? 'url(#graph-glow)' : 'none'}
                      style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Label */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={style.text}
                      fontSize="14"
                      fontWeight="800"
                      fontFamily="Inter, system-ui, sans-serif"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Glow animation CSS */}
            <style>{`
              .graph-glow-ring {
                animation: graphGlowPulse 1.5s ease-in-out infinite;
              }
              @keyframes graphGlowPulse {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 0.4; }
              }
            `}</style>

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Share2 className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Add nodes to start building your graph.</p>
                  <p className="text-slate-300 text-xs mt-1">Or click ▶ Play to auto-build a sample.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer: Step explanation */}
          <div className="border-t border-slate-200 bg-slate-50/80 p-4 flex flex-col justify-center items-center gap-1 shrink-0">
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> AI Explanation
            </h4>
            <AnimatePresence mode="wait">
              <motion.span
                key={activeMessage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-semibold text-slate-700 text-center max-w-md"
              >
                {activeMessage}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>


        {/* ═══════════════════════════════════════════════
            RIGHT PANEL: CODE / CALL STACK (33%)
        ═══════════════════════════════════════════════ */}
        <div className="w-[33%] min-w-[300px] h-full bg-white/70 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-lg flex flex-col overflow-hidden">

          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 shrink-0 bg-slate-50">
            {[
              { id: 'code', label: 'Pseudocode', icon: Code2 },
              { id: 'callstack', label: 'Call Stack', icon: Layers },
              { id: 'details', label: 'Details', icon: Database },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-5 bg-white">
            <AnimatePresence mode="wait">

              {/* Pseudocode Tab */}
              {activeTab === 'code' && (
                <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{algorithm.toUpperCase()} Pseudocode</h4>
                  <pre className="text-[12px] bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-y-auto font-mono flex-1">
                    <code>
                      {pseudoLines.map(line => (
                        <div
                          key={line.id}
                          className={`py-0.5 px-2 rounded transition-all duration-200 flex items-start ${activePseudoLine === line.id ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500 font-bold' : 'border-l-4 border-transparent text-slate-600'}`}
                        >
                          <span className="w-5 text-slate-400 select-none shrink-0 text-right mr-2">{line.id}</span>
                          <span className="whitespace-pre">{line.text}</span>
                        </div>
                      ))}
                    </code>
                  </pre>

                  {/* Visited nodes visualization */}
                  {visitedNodes.size > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Visited Order</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {[...visitedNodes].map((id, i) => (
                          <span key={id} className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-emerald-50 border-emerald-300 text-emerald-700">
                            {getLbl(nodes, id)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Call Stack / Queue Tab */}
              {activeTab === 'callstack' && (
                <motion.div key="callstack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 h-full">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {algorithm === 'bfs' ? 'Queue Visualizer' : algorithm === 'dfs' ? 'Stack Visualizer' : algorithm === 'dijkstra' ? 'Priority Queue' : 'Execution State'}
                  </h4>
                  {getQueueOrStack().length > 0 ? (
                    <div className="space-y-1.5">
                      {getQueueOrStack().map((item, i) => (
                        <motion.div
                          key={`${item}-${i}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-mono ${
                            i === 0 ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                            {i + 1}
                          </span>
                          <span>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                      <Layers className="w-12 h-12 mb-3" />
                      <p className="text-xs font-medium text-slate-400">Run an algorithm to see the queue/stack.</p>
                    </div>
                  )}

                  {/* Distance map for Dijkstra */}
                  {algorithm === 'dijkstra' && currentStepData?.dist && (
                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Distance Map</h4>
                      <div className="space-y-1">
                        {Object.entries(currentStepData.dist).map(([id, d]) => (
                          <div key={id} className="flex justify-between text-xs font-mono">
                            <span className="text-slate-600">{getLbl(nodes, id)}</span>
                            <span className={`font-bold ${d === Infinity ? 'text-slate-300' : 'text-blue-600'}`}>{d === Infinity ? '∞' : d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Time Complexity</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
                      {[
                        { op: 'BFS / DFS', best: 'O(V + E)', worst: 'O(V + E)' },
                        { op: 'Dijkstra', best: 'O((V+E) log V)', worst: 'O((V+E) log V)' },
                        { op: 'Cycle Detection', best: 'O(V + E)', worst: 'O(V + E)' },
                        { op: "Kruskal's MST", best: 'O(E log E)', worst: 'O(E log E)' },
                      ].map(row => (
                        <div key={row.op} className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0">
                          <span className="text-xs text-slate-600 font-medium">{row.op}</span>
                          <span className="text-emerald-600 font-bold text-[10px]">{row.worst}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Space Complexity</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-medium">Storage</span>
                        <span className="text-emerald-600 font-bold text-xs">O(V + E)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Operation Log</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 max-h-48 overflow-y-auto shadow-inner">
                      {history.length > 0 ? history.map((h, i) => (
                        <div key={i} className={`text-[11px] font-mono ${i === 0 ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                          &gt; {h.msg}
                        </div>
                      )) : (
                        <p className="text-slate-400 text-xs">No operations yet.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Adjacency List</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 max-h-48 overflow-y-auto shadow-inner font-mono text-[11px]">
                      {nodes.length > 0 ? nodes.map(n => {
                        const adj = edges
                          .filter(e => e.source === n.id || (graphType !== 'directed' && e.target === n.id))
                          .map(e => {
                            const otherId = e.source === n.id ? e.target : e.source;
                            const other = nodes.find(nn => nn.id === otherId);
                            return other ? (graphType === 'weighted' ? `${other.label}(${e.weight})` : other.label) : '?';
                          });
                        return (
                          <div key={n.id} className="text-slate-600">
                            <span className="text-blue-600 font-bold">{n.label}</span> → [{adj.join(', ')}]
                          </div>
                        );
                      }) : (
                        <p className="text-slate-400">No nodes.</p>
                      )}
                    </div>
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
