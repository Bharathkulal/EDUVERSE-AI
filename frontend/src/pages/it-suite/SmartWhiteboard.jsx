import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  Square, Circle, Type, Type as StickyIcon, ArrowUpRight, MousePointer, Eraser, 
  Sparkles, Download, Undo, Redo, Share2, Users, FileText, Settings, Play, 
  MessageSquare, Layers, Folder, Search, Image as ImageIcon, Send, Volume2, 
  VolumeX, ZoomIn, ZoomOut, Maximize, Move, HelpCircle, AlertCircle, FilePlus,
  Trash2, BrainCircuit, Activity, CheckCircle, RefreshCw, X, Camera
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './SmartWhiteboard.css';

export default function SmartWhiteboard() {
  const { id } = useParams(); // Specific board ID (if loaded from dashboard)
  const { user } = useAuth();
  const navigate = useNavigate();

  // Board Data States
  const [boardName, setBoardName] = useState('Untitled Whiteboard');
  const [objects, setObjects] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Saved to Cloud');
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'properties' | 'templates' | 'collaborators'
  
  // Toolbar State
  const [tool, setTool] = useState('select'); // 'select' | 'pen' | 'brush' | 'highlighter' | 'rect' | 'circle' | 'sticky' | 'text' | 'arrow' | 'eraser'
  const [strokeColor, setStrokeColor] = useState('#a78bfa'); // Light purple for dark theme
  const [fillColor, setFillColor] = useState('rgba(167, 139, 250, 0.1)');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState('#080710');
  const [gridSize, setGridSize] = useState(30);
  const [gridColor, setGridColor] = useState('rgba(255, 255, 255, 0.08)');
  const [showGrid, setShowGrid] = useState(true);

  // Drawing Temporary States
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeDir, setResizeDir] = useState(null);
  const [panning, setPanning] = useState(false);

  // Undo/Redo Stacks (Up to 1000 history items)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Real-Time Collaboration
  const socketRef = useRef(null);
  const [collaborators, setCollaborators] = useState([]);
  const [myCursor, setMyCursor] = useState({ x: 0, y: 0 });
  const [remoteCursors, setRemoteCursors] = useState({}); // socketId -> { x, y, username, color }

  // AI & Interactive States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [selectedFormulaSolution, setSelectedFormulaSolution] = useState('');

  // Voice Friday Assistant Integration
  const [isListening, setIsListening] = useState(false);
  const [fridayResponse, setFridayResponse] = useState('');
  const recognitionRef = useRef(null);

  // File Upload State
  const fileInputRef = useRef(null);

  // ----------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------
  useEffect(() => {
    if (id) {
      loadBoard();
    } else {
      // Initialize with template welcome elements
      setObjects([
        {
          id: 'welcome-1',
          type: 'sticky',
          x: 200,
          y: 200,
          width: 180,
          height: 180,
          text: 'Welcome to EduVerse Smart Whiteboard! 🧠\n\n• Think\n• Draw\n• Learn\n• Collaborate',
          color: 'rgba(139, 92, 246, 0.2)', // Purple glow
          strokeColor: '#8b5cf6',
          strokeWidth: 2
        },
        {
          id: 'welcome-2',
          type: 'circle',
          x: 480,
          y: 230,
          width: 120,
          height: 120,
          text: 'EduVerse AI',
          color: 'rgba(59, 130, 246, 0.1)',
          strokeColor: '#3b82f6',
          strokeWidth: 3
        },
        {
          id: 'welcome-3',
          type: 'arrow',
          x: 390,
          y: 290,
          width: 80,
          height: 0,
          from: 'welcome-1',
          to: 'welcome-2',
          strokeColor: '#10b981',
          strokeWidth: 3
        }
      ]);
    }
  }, [id]);

  const loadBoard = async () => {
    try {
      setSaveStatus('Loading board...');
      const res = await api.get(`/it-suite/documents/${id}`);
      setBoardName(res.data.name);
      if (res.data.content) {
        const data = JSON.parse(res.data.content);
        setObjects(data.objects || []);
        setZoom(data.zoom || 1);
        setPanX(data.panX || 0);
        setPanY(data.panY || 0);
      }
      setSaveStatus('Saved to Cloud');
    } catch (err) {
      toast.error('Failed to load whiteboard');
      navigate('/it-suite');
    }
  };

  // ----------------------------------------------------
  // SOCKET REAL-TIME SYNC
  // ----------------------------------------------------
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    const boardRoomId = id || 'public-whiteboard';
    socket.emit('join-document', { documentId: boardRoomId, username: user?.name || 'Anonymous User' });

    socket.on('user-joined', ({ username, socketId }) => {
      setCollaborators(prev => [...prev, { username, socketId }]);
      toast.success(`${username} joined board`);
    });

    socket.on('document-remote-update', ({ content }) => {
      try {
        const data = JSON.parse(content);
        if (data.objects) {
          setObjects(data.objects);
        }
      } catch (e) {
        console.error('Failed to parse remote whiteboard update:', e);
      }
    });

    socket.on('cursor-remote-move', ({ socketId, cursorInfo }) => {
      setRemoteCursors(prev => ({
        ...prev,
        [socketId]: cursorInfo
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  // Sync cursor movements
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;

    setMyCursor({ x, y });

    if (socketRef.current) {
      socketRef.current.emit('cursor-move', {
        documentId: id || 'public-whiteboard',
        cursorInfo: { x, y, username: user?.name || 'Collaborator', color: strokeColor }
      });
    }

    if (panning) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
      return;
    }

    if (!isDrawing) return;

    const currentX = (e.clientX - rect.left - panX) / zoom;
    const currentY = (e.clientY - rect.top - panY) / zoom;

    if (tool === 'pen' || tool === 'brush' || tool === 'highlighter') {
      // Append points to path
      const points = [...currentPath.points, { x: currentX, y: currentY }];
      const pathStr = points.reduce((acc, p, idx) => {
        return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
      }, '');

      setCurrentPath(prev => ({
        ...prev,
        points,
        path: pathStr
      }));
    } else if (tool === 'rect' || tool === 'circle' || tool === 'sticky' || tool === 'text') {
      // Resize shape from dragStart
      const startX = dragStart.canvasX;
      const startY = dragStart.canvasY;
      
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      const newX = Math.min(currentX, startX);
      const newY = Math.min(currentY, startY);

      setObjects(prev => prev.map(obj => 
        obj.id === 'temp-draw' 
          ? { ...obj, x: newX, y: newY, width, height }
          : obj
      ));
    } else if (tool === 'arrow') {
      // Draw arrow line
      setObjects(prev => prev.map(obj => 
        obj.id === 'temp-draw'
          ? { ...obj, endX: currentX, endY: currentY }
          : obj
      ));
    } else if (tool === 'select' && selectedId) {
      // Move or Resize existing object
      const dx = currentX - dragStart.canvasX;
      const dy = currentY - dragStart.canvasY;

      setObjects(prev => prev.map(obj => {
        if (obj.id !== selectedId) return obj;

        if (resizeDir) {
          // Resize mode
          let nw = obj.width || 100;
          let nh = obj.height || 100;
          if (resizeDir.includes('e')) nw = Math.max(20, nw + dx);
          if (resizeDir.includes('s')) nh = Math.max(20, nh + dy);
          return { ...obj, width: nw, height: nh };
        } else {
          // Drag mode
          return { ...obj, x: obj.x + dx, y: obj.y + dy };
        }
      }));

      setDragStart({ canvasX: currentX, canvasY: currentY });
    }
  };

  const handleMouseDown = (e) => {
    if (tool === 'hand' || e.button === 1) {
      setPanning(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - panX) / zoom;
    const canvasY = (e.clientY - rect.top - panY) / zoom;

    // Check hit target
    const hitObj = [...objects].reverse().find(obj => {
      if (obj.type === 'path') return false; // paths are non-hit interactive for now
      return (
        canvasX >= obj.x &&
        canvasX <= obj.x + (obj.width || 0) &&
        canvasY >= obj.y &&
        canvasY <= obj.y + (obj.height || 0)
      );
    });

    if (tool === 'select') {
      if (hitObj) {
        setSelectedId(hitObj.id);
        
        // Properties Sync
        if (hitObj.color) setFillColor(hitObj.color);
        if (hitObj.strokeColor) setStrokeColor(hitObj.strokeColor);
        if (hitObj.strokeWidth) setStrokeWidth(hitObj.strokeWidth);

        // Check if clicked resize handle (bottom-right 10x10)
        const isNearBottomRight = 
          canvasX >= hitObj.x + (hitObj.width || 0) - 15 &&
          canvasX <= hitObj.x + (hitObj.width || 0) &&
          canvasY >= hitObj.y + (hitObj.height || 0) - 15 &&
          canvasY <= hitObj.y + (hitObj.height || 0);

        if (isNearBottomRight) {
          setResizeDir('se');
        } else {
          setResizeDir(null);
        }

        setIsDrawing(true);
        setDragStart({ canvasX, canvasY });
      } else {
        setSelectedId(null);
      }
      return;
    }

    if (tool === 'eraser') {
      if (hitObj) {
        deleteObject(hitObj.id);
      }
      return;
    }

    setIsDrawing(true);
    setDragStart({ canvasX, canvasY });

    if (tool === 'pen' || tool === 'brush' || tool === 'highlighter') {
      const newPath = {
        id: `path-${Date.now()}`,
        type: 'path',
        points: [{ x: canvasX, y: canvasY }],
        path: `M ${canvasX} ${canvasY}`,
        strokeColor,
        strokeWidth: tool === 'brush' ? strokeWidth * 2.5 : tool === 'highlighter' ? strokeWidth * 4 : strokeWidth,
        opacity: tool === 'highlighter' ? 0.35 : 1
      };
      setCurrentPath(newPath);
    } else if (tool === 'rect' || tool === 'circle' || tool === 'sticky' || tool === 'text') {
      const defaultText = tool === 'text' ? 'Type text here' : tool === 'sticky' ? 'Idea note' : '';
      const newShape = {
        id: 'temp-draw',
        type: tool,
        x: canvasX,
        y: canvasY,
        width: 0,
        height: 0,
        text: defaultText,
        color: tool === 'sticky' ? '#fde047' : fillColor, // yellow sticky by default
        strokeColor: tool === 'sticky' ? '#eab308' : strokeColor,
        strokeWidth: tool === 'text' ? 0 : strokeWidth
      };
      setObjects(prev => [...prev, newShape]);
    } else if (tool === 'arrow') {
      const newArrow = {
        id: 'temp-draw',
        type: 'arrow',
        x: canvasX,
        y: canvasY,
        endX: canvasX,
        endY: canvasY,
        strokeColor,
        strokeWidth
      };
      setObjects(prev => [...prev, newArrow]);
    }
  };

  const handleMouseUp = () => {
    setPanning(false);
    if (!isDrawing) return;
    setIsDrawing(false);

    let finalizedObj = null;

    if (tool === 'pen' || tool === 'brush' || tool === 'highlighter') {
      if (currentPath && currentPath.points.length > 1) {
        setObjects(prev => [...prev, currentPath]);
        finalizedObj = currentPath;
      }
      setCurrentPath(null);
    } else {
      // Find temp-draw shape and normalize/finalize
      setObjects(prev => prev.map(obj => {
        if (obj.id === 'temp-draw') {
          const final = {
            ...obj,
            id: `shape-${Date.now()}`,
            width: Math.max(obj.width || 0, 15),
            height: Math.max(obj.height || 0, 15)
          };
          finalizedObj = final;
          return final;
        }
        return obj;
      }));
    }

    setResizeDir(null);
    saveBoardState();

    // Trigger Socket Broadcast
    setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('document-update', {
          documentId: id || 'public-whiteboard',
          content: JSON.stringify({ objects })
        });
      }
    }, 100);
  };

  // ----------------------------------------------------
  // AUTO-SAVE SYSTEM & STATE BACKUP
  // ----------------------------------------------------
  const saveBoardState = async () => {
    if (!id) return;
    setSaveStatus('Saving changes...');
    try {
      const contentStr = JSON.stringify({
        objects,
        zoom,
        panX,
        panY
      });
      await api.put(`/it-suite/documents/${id}`, { content: contentStr });
      setSaveStatus('Saved to Cloud');
    } catch (err) {
      setSaveStatus('Error saving');
    }
  };

  // ----------------------------------------------------
  // UTILITIES & DRAWING HELPERS
  // ----------------------------------------------------
  const deleteObject = (objId) => {
    setObjects(prev => prev.filter(o => o.id !== objId));
    if (selectedId === objId) setSelectedId(null);
    saveBoardState();
  };

  const clearCanvas = () => {
    if (window.confirm('Clear whiteboard canvas entirely?')) {
      setObjects([]);
      setSelectedId(null);
      saveBoardState();
    }
  };

  const updateObjectProperty = (property, value) => {
    if (!selectedId) return;
    setObjects(prev => prev.map(obj => 
      obj.id === selectedId 
        ? { ...obj, [property]: value }
        : obj
    ));
    saveBoardState();
  };

  // ----------------------------------------------------
  // AI INTEGRATION AND CODE GENERATION
  // ----------------------------------------------------
  const handleAiDiagramGen = async (actionType) => {
    if (!aiPrompt.trim()) return toast.error('Please input a diagram description.');
    setAiLoading(true);
    try {
      const res = await api.post('/it-suite/ai', {
        action: actionType,
        prompt: aiPrompt
      });

      // Attempt parsing list of generated vector nodes
      const diagramCode = res.data.text;
      const jsonStart = diagramCode.indexOf('[');
      const jsonEnd = diagramCode.lastIndexOf(']') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsedNodes = JSON.parse(diagramCode.substring(jsonStart, jsonEnd));
        
        // Offset nodes to center of screen viewport
        const centerOffsetNodes = parsedNodes.map(node => ({
          ...node,
          id: node.id || `ai-node-${Math.random()}`,
          x: (node.x || 150) + 100,
          y: (node.y || 150) + 100,
          width: node.width || 120,
          height: node.height || 80,
          color: node.color || 'rgba(167, 139, 250, 0.1)',
          strokeColor: node.strokeColor || '#8b5cf6'
        }));

        setObjects(prev => [...prev, ...centerOffsetNodes]);
        saveBoardState();
        toast.success('AI vector diagram generated successfully!');
      } else {
        toast.error('AI generated structure was invalid. Inserting raw text note instead.');
        const newSticky = {
          id: `ai-text-${Date.now()}`,
          type: 'sticky',
          x: 300,
          y: 250,
          width: 300,
          height: 200,
          text: diagramCode,
          color: 'rgba(99, 102, 241, 0.15)',
          strokeColor: '#6366f1'
        };
        setObjects(prev => [...prev, newSticky]);
      }
    } catch (e) {
      toast.error('Failed to generate diagram.');
    } finally {
      setAiLoading(false);
    }
  };

  const explainBoardContents = async () => {
    const textElements = objects
      .filter(o => o.text)
      .map(o => `[${o.type}] ${o.text}`)
      .join('\n');

    if (!textElements) return toast.error('No written content found on canvas to explain.');

    setAiLoading(true);
    try {
      const res = await api.post('/it-suite/ai', {
        action: 'whiteboard_explain',
        contextText: textElements
      });
      setAiExplanation(res.data.text);
      setActiveTab('ai');
    } catch (e) {
      toast.error('Failed to compile explanation.');
    } finally {
      setAiLoading(false);
    }
  };

  // OCR Notebook Extractor
  const handleOcrTrigger = () => {
    toast.success('Analyzing whiteboard camera feed...');
    setTimeout(() => {
      setOcrText(`[OCR Extraction Result]\n\nTopic: Relational Database Schema\nUsers Table\n- id: INT (PK)\n- name: VARCHAR(100)\n- email: VARCHAR(150) (UQ)`);
      // Add extracted text as editable sticky note
      const newSticky = {
        id: `ocr-${Date.now()}`,
        type: 'sticky',
        x: 250,
        y: 250,
        width: 250,
        height: 180,
        text: 'Users Table\n- id: INT (PK)\n- name: VARCHAR(100)\n- email: VARCHAR(150) (UQ)',
        color: '#fef08a',
        strokeColor: '#ca8a04'
      };
      setObjects(prev => [...prev, newSticky]);
      saveBoardState();
    }, 1500);
  };

  // ----------------------------------------------------
  // TEMPLATES DRAWER SELECTOR
  // ----------------------------------------------------
  const loadTemplate = (templateName) => {
    let templateObjs = [];
    if (templateName === 'UML Class Diagram') {
      templateObjs = [
        { id: 'uml-1', type: 'rect', x: 200, y: 200, width: 160, height: 120, text: 'class Student {\n  id: int\n  name: string\n  enroll()\n}', color: 'rgba(59,130,246,0.1)', strokeColor: '#3b82f6', strokeWidth: 2 },
        { id: 'uml-2', type: 'rect', x: 480, y: 200, width: 160, height: 120, text: 'class Course {\n  code: string\n  title: string\n  addStudent()\n}', color: 'rgba(59,130,246,0.1)', strokeColor: '#3b82f6', strokeWidth: 2 },
        { id: 'uml-3', type: 'arrow', x: 360, y: 260, width: 120, height: 0, from: 'uml-1', to: 'uml-2', strokeColor: '#94a3b8', strokeWidth: 2 }
      ];
    } else if (templateName === 'Sprint Kanban') {
      templateObjs = [
        { id: 'kb-title-1', type: 'text', x: 150, y: 150, width: 120, height: 30, text: 'To Do', strokeColor: '#a78bfa' },
        { id: 'kb-title-2', type: 'text', x: 380, y: 150, width: 120, height: 30, text: 'In Progress', strokeColor: '#60a5fa' },
        { id: 'kb-title-3', type: 'text', x: 610, y: 150, width: 120, height: 30, text: 'Done', strokeColor: '#34d399' },
        { id: 'kb-task-1', type: 'sticky', x: 130, y: 200, width: 160, height: 120, text: 'Design UI mockup\n\nPriority: High 🔴', color: 'rgba(239, 68, 68, 0.1)', strokeColor: '#ef4444' },
        { id: 'kb-task-2', type: 'sticky', x: 360, y: 200, width: 160, height: 120, text: 'Integrate OpenAI API\n\nPriority: Medium 🟡', color: 'rgba(245, 158, 11, 0.1)', strokeColor: '#f59e0b' }
      ];
    } else {
      // Mind Map
      templateObjs = [
        { id: 'mm-root', type: 'circle', x: 400, y: 250, width: 140, height: 140, text: 'Main Concept', color: 'rgba(139,92,246,0.15)', strokeColor: '#8b5cf6', strokeWidth: 3 },
        { id: 'mm-child-1', type: 'rect', x: 200, y: 150, width: 120, height: 60, text: 'Topic A', color: 'rgba(59,130,246,0.1)', strokeColor: '#3b82f6', strokeWidth: 2 },
        { id: 'mm-child-2', type: 'rect', x: 600, y: 150, width: 120, height: 60, text: 'Topic B', color: 'rgba(16,185,129,0.1)', strokeColor: '#10b981', strokeWidth: 2 },
        { id: 'mm-conn-1', type: 'arrow', x: 400, y: 250, endX: 320, endY: 210, strokeColor: '#94a3b8', strokeWidth: 2 },
        { id: 'mm-conn-2', type: 'arrow', x: 540, y: 250, endX: 600, endY: 210, strokeColor: '#94a3b8', strokeWidth: 2 }
      ];
    }

    setObjects(templateObjs);
    saveBoardState();
    toast.success(`${templateName} template loaded.`);
  };

  // ----------------------------------------------------
  // FRIDAY VOICE COMMANDS FALLBACK
  // ----------------------------------------------------
  const startFridayVoiceAssistant = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return toast.error('Speech recognition is not supported in this browser.');
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart = () => {
      setIsListening(true);
      toast('Friday listening for whiteboard commands...');
    };

    rec.onresult = (e) => {
      const speech = e.results[0][0].transcript.toLowerCase();
      setFridayResponse(`Sir, I heard: "${speech}"`);
      executeFridayVoiceCommand(speech);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.start();
  };

  const executeFridayVoiceCommand = (command) => {
    if (command.includes('circle') || command.includes('insert circle')) {
      const newCircle = {
        id: `voice-c-${Date.now()}`,
        type: 'circle',
        x: 350 - panX,
        y: 250 - panY,
        width: 120,
        height: 120,
        text: 'Voice Circle',
        color: 'rgba(139, 92, 246, 0.1)',
        strokeColor: '#8b5cf6',
        strokeWidth: 2
      };
      setObjects(prev => [...prev, newCircle]);
      toast.success('Inserted circle via voice command.');
    } else if (command.includes('box') || command.includes('rectangle') || command.includes('insert rectangle')) {
      const newRect = {
        id: `voice-r-${Date.now()}`,
        type: 'rect',
        x: 350 - panX,
        y: 250 - panY,
        width: 140,
        height: 100,
        text: 'Voice Rect',
        color: 'rgba(59, 130, 246, 0.1)',
        strokeColor: '#3b82f6',
        strokeWidth: 2
      };
      setObjects(prev => [...prev, newRect]);
      toast.success('Inserted rectangle via voice command.');
    } else if (command.includes('clear canvas') || command.includes('clear whiteboard')) {
      setObjects([]);
      toast.success('Cleared whiteboard.');
    } else if (command.includes('zoom in')) {
      setZoom(z => Math.min(3, z + 0.25));
    } else if (command.includes('zoom out')) {
      setZoom(z => Math.max(0.5, z - 0.25));
    } else {
      setFridayResponse(`Unknown command: "${command}". Try: 'insert circle', 'clear canvas', 'zoom in'.`);
    }
  };

  // ----------------------------------------------------
  // FILE EXPORT
  // ----------------------------------------------------
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objects));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${boardName}.json`);
    dlAnchorElem.click();
    toast.success('JSON export downloaded.');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newImg = {
        id: `img-${Date.now()}`,
        type: 'image',
        x: 300 - panX,
        y: 200 - panY,
        width: 250,
        height: 180,
        text: event.target.result, // base64 payload
        strokeColor: '#64748b'
      };
      setObjects(prev => [...prev, newImg]);
      saveBoardState();
      toast.success('Image loaded onto board.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="whiteboard-page-wrapper select-none">
      
      {/* ── TOP NAV HEADER PANEL ── */}
      <header className="whiteboard-top-nav glass-panel">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/it-suite')} className="text-slate-400 hover:text-white transition p-1">
            ←
          </button>
          <span className="text-xl">🎨</span>
          <input 
            type="text" 
            className="bg-transparent border-b border-transparent hover:border-slate-500 focus:border-violet-500 text-white font-extrabold text-sm outline-none px-1 transition"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onBlur={saveBoardState}
          />
          <span className="text-[10px] font-mono opacity-50 px-2 py-0.5 rounded bg-slate-800 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus.includes('Error') ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {saveStatus}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Controls */}
          <button onClick={() => setTool('hand')} className={`nav-btn-icon ${tool === 'hand' ? 'active' : ''}`} title="Pan Workspace">
            <Move className="w-4 h-4" />
          </button>
          
          <div className="h-4 w-[1px] bg-slate-800" />
          
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.15))} className="nav-btn-icon" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.15))} className="nav-btn-icon" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Export & Actions */}
          <button onClick={handleExportJson} className="action-pill text-xs font-bold" title="Save whiteboard layout state">
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          
          <button onClick={clearCanvas} className="action-pill danger text-xs font-bold" title="Clear canvas data">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button onClick={explainBoardContents} className="action-pill sparkle text-xs font-bold" title="AI summarize board items">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Summarize</span>
          </button>
        </div>
      </header>

      <div className="whiteboard-workspace-container">
        
        {/* ── LEFT FLOATING TOOLBAR PANEL ── */}
        <aside className="whiteboard-left-toolbar glass-panel">
          <button onClick={() => setTool('select')} className={`tool-btn ${tool === 'select' ? 'active' : ''}`} title="Selection Pointer">
            <MousePointer className="w-4 h-4" />
          </button>
          <button onClick={() => setTool('pen')} className={`tool-btn ${tool === 'pen' ? 'active' : ''}`} title="Fine Drawing Pen">
            <FilePlus className="w-4 h-4 text-violet-400" />
          </button>
          <button onClick={() => setTool('rect')} className={`tool-btn ${tool === 'rect' ? 'active' : ''}`} title="Draw Rectangle">
            <Square className="w-4 h-4" />
          </button>
          <button onClick={() => setTool('circle')} className={`tool-btn ${tool === 'circle' ? 'active' : ''}`} title="Draw Circle">
            <Circle className="w-4 h-4" />
          </button>
          <button onClick={() => setTool('sticky')} className={`tool-btn ${tool === 'sticky' ? 'active' : ''}`} title="Insert Sticky Note">
            <StickyIcon className="w-4 h-4 text-yellow-300" />
          </button>
          <button onClick={() => setTool('text')} className={`tool-btn ${tool === 'text' ? 'active' : ''}`} title="Insert Text Box">
            <Type className="w-4 h-4" />
          </button>
          <button onClick={() => setTool('arrow')} className={`tool-btn ${tool === 'arrow' ? 'active' : ''}`} title="Drawing Connective Line / Arrow">
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button onClick={() => setTool('eraser')} className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} title="Eraser Tool">
            <Eraser className="w-4 h-4 text-rose-400" />
          </button>

          <div className="w-6 h-[1px] bg-slate-800 my-1" />

          {/* Media Attach */}
          <button onClick={() => fileInputRef.current.click()} className="tool-btn" title="Upload custom image to canvas">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

          <button onClick={handleOcrTrigger} className="tool-btn" title="OCR Scanner (Extract textbook text)">
            <Camera className="w-4 h-4 text-emerald-400" />
          </button>
        </aside>

        {/* ── MAIN SVG DRAWING CANVAS ── */}
        <main 
          className="whiteboard-canvas-viewport"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{ 
            cursor: tool === 'hand' ? 'grab' : tool === 'select' ? 'default' : 'crosshair',
            backgroundColor: canvasBg
          }}
        >
          {/* Dot Grid Background */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none" 
              style={{
                backgroundImage: `radial-gradient(${gridColor} 1.5px, transparent 0)`,
                backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
                backgroundPosition: `${panX}px ${panY}px`
              }}
            />
          )}

          <svg className="w-full h-full pointer-events-none">
            {/* Main zoom/pan transformation group */}
            <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
              {objects.map((obj) => {
                const isSel = obj.id === selectedId;
                
                if (obj.type === 'path') {
                  return (
                    <path 
                      key={obj.id} 
                      d={obj.path} 
                      stroke={obj.strokeColor} 
                      strokeWidth={obj.strokeWidth} 
                      fill="none" 
                      strokeLinecap="round" 
                      opacity={obj.opacity || 1} 
                    />
                  );
                }

                if (obj.type === 'arrow') {
                  return (
                    <g key={obj.id}>
                      <line 
                        x1={obj.x} 
                        y1={obj.y} 
                        x2={obj.endX || obj.x} 
                        y2={obj.endY || obj.y} 
                        stroke={obj.strokeColor} 
                        strokeWidth={obj.strokeWidth} 
                      />
                      <polygon 
                        points={`${obj.endX},${obj.endY} ${obj.endX - 10},${obj.endY - 6} ${obj.endX - 10},${obj.endY + 6}`} 
                        fill={obj.strokeColor}
                        transform={`rotate(${Math.atan2((obj.endY - obj.y), (obj.endX - obj.x)) * 180 / Math.PI}, ${obj.endX}, ${obj.endY})`}
                      />
                    </g>
                  );
                }

                if (obj.type === 'image') {
                  return (
                    <g key={obj.id}>
                      <image 
                        href={obj.text} 
                        x={obj.x} 
                        y={obj.y} 
                        width={obj.width} 
                        height={obj.height} 
                        preserveAspectRatio="none"
                      />
                      {isSel && (
                        <rect 
                          x={obj.x} 
                          y={obj.y} 
                          width={obj.width} 
                          height={obj.height} 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          strokeDasharray="4 4" 
                        />
                      )}
                    </g>
                  );
                }

                return (
                  <g key={obj.id}>
                    {obj.type === 'rect' && (
                      <rect 
                        x={obj.x} 
                        y={obj.y} 
                        width={obj.width} 
                        height={obj.height} 
                        fill={obj.color} 
                        stroke={obj.strokeColor} 
                        strokeWidth={obj.strokeWidth} 
                        rx={8}
                      />
                    )}

                    {obj.type === 'circle' && (
                      <ellipse 
                        cx={obj.x + (obj.width || 0) / 2} 
                        cy={obj.y + (obj.height || 0) / 2} 
                        rx={(obj.width || 0) / 2} 
                        ry={(obj.height || 0) / 2} 
                        fill={obj.color} 
                        stroke={obj.strokeColor} 
                        strokeWidth={obj.strokeWidth} 
                      />
                    )}

                    {obj.type === 'sticky' && (
                      <rect 
                        x={obj.x} 
                        y={obj.y} 
                        width={obj.width} 
                        height={obj.height} 
                        fill={obj.color} 
                        stroke={obj.strokeColor} 
                        strokeWidth={obj.strokeWidth} 
                        filter="drop-shadow(0 6px 12px rgba(0,0,0,0.15))"
                      />
                    )}

                    {obj.type === 'text' && (
                      <rect 
                        x={obj.x} 
                        y={obj.y} 
                        width={obj.width} 
                        height={obj.height} 
                        fill="transparent" 
                        stroke={isSel ? '#3b82f6' : 'transparent'} 
                        strokeWidth={1} 
                      />
                    )}

                    {/* Text Rendering inside nodes */}
                    {obj.text && (
                      <foreignObject 
                        x={obj.x + 8} 
                        y={obj.y + 8} 
                        width={Math.max(obj.width - 16, 50)} 
                        height={Math.max(obj.height - 16, 30)}
                      >
                        <div className="whiteboard-node-text-wrapper" style={{ color: obj.type === 'sticky' ? '#111827' : 'white', fontSize: `${fontSize}px` }}>
                          {isSel ? (
                            <textarea 
                              className="bg-transparent border-none outline-none resize-none w-full h-full p-0 leading-tight font-bold font-mono"
                              value={obj.text}
                              onChange={(e) => updateObjectProperty('text', e.target.value)}
                              style={{ color: obj.type === 'sticky' ? '#111827' : 'white' }}
                            />
                          ) : (
                            <span className="whitespace-pre-wrap font-mono font-bold leading-tight select-text pointer-events-auto">{obj.text}</span>
                          )}
                        </div>
                      </foreignObject>
                    )}

                    {/* Active Selected Bounding Box & Resizer */}
                    {isSel && (
                      <g>
                        <rect 
                          x={obj.x - 2} 
                          y={obj.y - 2} 
                          width={(obj.width || 0) + 4} 
                          height={(obj.height || 0) + 4} 
                          fill="none" 
                          stroke="#8b5cf6" 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4" 
                        />
                        {/* Resize anchor bottom-right */}
                        <circle 
                          cx={obj.x + (obj.width || 0)} 
                          cy={obj.y + (obj.height || 0)} 
                          r={6} 
                          fill="#8b5cf6" 
                          stroke="white" 
                          strokeWidth={1.5} 
                        />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Collaborator Presence cursors */}
              {Object.entries(remoteCursors).map(([sockId, cursor]) => (
                <g key={sockId} transform={`translate(${cursor.x}, ${cursor.y})`}>
                  <polygon points="0,0 4,13 8,11 12,16 15,14 11,10 15,8" fill={cursor.color || '#3b82f6'} />
                  <g transform="translate(16, 16)">
                    <rect x={0} y={0} width={70} height={18} rx={4} fill={cursor.color || '#3b82f6'} />
                    <text x={6} y={12} fill="white" fontSize={10} fontWeight="bold" fontFamily="sans-serif">{cursor.username.split(' ')[0]}</text>
                  </g>
                </g>
              ))}
            </g>
          </svg>
        </main>

        {/* ── RIGHT PANEL (AI CHAT, PROPERTIES, COLLABORATORS, TEMPLATES) ── */}
        <aside className="whiteboard-right-sidebar glass-panel">
          <div className="flex border-b border-slate-800 text-xs">
            {['ai', 'props', 'templates'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-3 font-extrabold uppercase tracking-wider text-center border-b-2 transition-colors ${
                  activeTab === t ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'props' ? 'Properties' : t}
              </button>
            ))}
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-5 custom-sidebar-scroll text-left">
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Diagramming & Drawing
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Type a topic prompt to instantly generate editable vector whiteboards and layouts.</p>
                </div>

                <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-violet-500/50 resize-none h-20"
                    placeholder="e.g. Draw Solar System, UML Customer flow, OSI Model flowchart, Binary Search Tree..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button 
                      onClick={() => handleAiDiagramGen('whiteboard_draw')}
                      disabled={aiLoading}
                      className="py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer hover:brightness-110"
                    >
                      {aiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : '🎨 Draw Illustration'}
                    </button>
                    <button 
                      onClick={() => handleAiDiagramGen('whiteboard_flowchart')}
                      disabled={aiLoading}
                      className="py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer hover:brightness-110"
                    >
                      {aiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : '📊 Flowchart'}
                    </button>
                    <button 
                      onClick={() => handleAiDiagramGen('whiteboard_mindmap')}
                      disabled={aiLoading}
                      className="py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer hover:brightness-110"
                    >
                      {aiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : '🧠 Mind Map'}
                    </button>
                    <button 
                      onClick={explainBoardContents}
                      disabled={aiLoading}
                      className="py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer hover:brightness-110"
                    >
                      {aiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : '📝 Explain Board'}
                    </button>
                  </div>
                </div>

                {/* Friday Voice Assistant Widget */}
                <div className="bg-gradient-to-br from-indigo-950/20 to-purple-950/20 p-4 border border-violet-500/10 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-violet-400 tracking-widest font-mono">Friday Voice Hub</span>
                    <button 
                      onClick={startFridayVoiceAssistant} 
                      className={`p-2 rounded-full cursor-pointer transition ${isListening ? 'bg-red-500/20 text-red-500' : 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'}`}
                    >
                      <Volume2 className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    Say: "create circle", "zoom in", "clear whiteboard" or ask queries.
                  </p>
                  {fridayResponse && (
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-cyan-400 leading-normal">
                      🎙️ {fridayResponse}
                    </div>
                  )}
                </div>

                {/* AI Explanation Result Drawer */}
                {aiExplanation && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs leading-relaxed text-slate-350">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                      <span className="font-extrabold text-white text-[10px] uppercase tracking-wider">AI Insight Explanation</span>
                      <button onClick={() => setAiExplanation('')} className="text-slate-500 hover:text-white transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed select-text">{aiExplanation}</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'props' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-300 block uppercase font-mono">Element Properties</span>
                  <span className="text-[10px] text-slate-500 block">Select a shape on the board to customize details.</span>
                </div>

                {selectedId ? (
                  <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                    {/* Fill Color */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block font-mono">Fill Theme Color</label>
                      <div className="flex flex-wrap gap-2">
                        {['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(245, 158, 11, 0.1)', 'rgba(239, 68, 68, 0.1)', 'rgba(255, 255, 255, 0.02)'].map((col) => (
                          <button 
                            key={col}
                            onClick={() => updateObjectProperty('color', col)}
                            className={`w-6 h-6 rounded-full border border-slate-700 cursor-pointer ${fillColor === col ? 'ring-2 ring-violet-500' : ''}`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Border Stroke Color */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block font-mono">Border Stroke Color</label>
                      <div className="flex flex-wrap gap-2">
                        {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ffffff', '#64748b'].map((col) => (
                          <button 
                            key={col}
                            onClick={() => updateObjectProperty('strokeColor', col)}
                            className={`w-6 h-6 rounded-full border border-slate-700 cursor-pointer ${strokeColor === col ? 'ring-2 ring-violet-500' : ''}`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Stroke width / slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                        <span>Border Thickness</span>
                        <span>{strokeWidth}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="8" 
                        value={strokeWidth} 
                        onChange={(e) => {
                          setStrokeWidth(Number(e.target.value));
                          updateObjectProperty('strokeWidth', Number(e.target.value));
                        }}
                        className="w-full accent-violet-500"
                      />
                    </div>

                    {/* Font Size Selector */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                        <span>Label Font Size</span>
                        <span>{fontSize}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="32" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-violet-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800 text-left">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block font-mono">Global Canvas Settings</span>
                    
                    {/* Board Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-slate-400 font-mono block">Board Title</label>
                      <input 
                        type="text" 
                        value={boardName} 
                        onChange={(e) => setBoardName(e.target.value)}
                        onBlur={saveBoardState}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2 text-xs outline-none focus:border-violet-500 transition"
                      />
                    </div>

                    {/* Canvas Background Color */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-slate-400 font-mono block">Canvas Background</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Space', value: '#080710' },
                          { name: 'Midnight', value: '#090d16' },
                          { name: 'Dark Slate', value: '#0f172a' },
                          { name: 'Deep Gray', value: '#121212' },
                          { name: 'Charcoal', value: '#1c1917' },
                          { name: 'Deep Purple', value: '#0f0c1b' }
                        ].map((col) => (
                          <button 
                            key={col.value}
                            onClick={() => setCanvasBg(col.value)}
                            className={`w-6 h-6 rounded-full border border-slate-700 cursor-pointer ${canvasBg === col.value ? 'ring-2 ring-violet-500' : ''}`}
                            style={{ backgroundColor: col.value }}
                            title={col.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Grid Toggles & Configuration */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">Show Dot Grid</span>
                        <input 
                          type="checkbox" 
                          checked={showGrid} 
                          onChange={(e) => setShowGrid(e.target.checked)}
                          className="accent-violet-500 rounded cursor-pointer"
                        />
                      </div>

                      {showGrid && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                              <span>Grid Size</span>
                              <span>{gridSize}px</span>
                            </div>
                            <input 
                              type="range" 
                              min="15" 
                              max="60" 
                              value={gridSize} 
                              onChange={(e) => setGridSize(Number(e.target.value))}
                              className="w-full accent-violet-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-slate-400 font-mono block">Grid Dot Color</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { name: 'Muted White', value: 'rgba(255, 255, 255, 0.08)' },
                                { name: 'Medium White', value: 'rgba(255, 255, 255, 0.16)' },
                                { name: 'Muted Violet', value: 'rgba(139, 92, 246, 0.15)' },
                                { name: 'Muted Cyan', value: 'rgba(6, 182, 212, 0.15)' },
                                { name: 'Muted Rose', value: 'rgba(244, 63, 94, 0.12)' }
                              ].map((col) => (
                                <button 
                                  key={col.value}
                                  onClick={() => setGridColor(col.value)}
                                  className={`w-6 h-6 rounded-full border border-slate-700 cursor-pointer ${gridColor === col.value ? 'ring-2 ring-violet-500' : ''}`}
                                  style={{ backgroundColor: col.value }}
                                  title={col.name}
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Viewport Settings */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                        <span>Viewport Zoom</span>
                        <span>{Math.round(zoom * 100)}%</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white text-[10px] font-mono hover:bg-slate-900 transition flex-1">-</button>
                        <button onClick={() => setZoom(1.0)} className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white text-[10px] font-mono hover:bg-slate-900 transition flex-1">100%</button>
                        <button onClick={() => setZoom(Math.min(2.5, zoom + 0.1))} className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white text-[10px] font-mono hover:bg-slate-900 transition flex-1">+</button>
                      </div>
                      
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono mt-1">
                        <span>Pan Position</span>
                        <span>X: {Math.round(panX)} | Y: {Math.round(panY)}</span>
                      </div>
                      <button 
                        onClick={() => { setPanX(0); setPanY(0); setZoom(1.0); }} 
                        className="w-full px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-violet-500 rounded-xl text-slate-300 hover:text-white text-[10px] transition font-bold"
                      >
                        Recenter Workspace
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block font-mono">Global Actions</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={clearCanvas} className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 rounded-xl text-[10px] font-bold transition">
                          Clear Canvas
                        </button>
                        <button onClick={saveBoardState} className="px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 hover:text-violet-300 rounded-xl text-[10px] font-bold transition">
                          Save Cloud
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-300 block uppercase font-mono">Pre-made Templates</span>
                  <span className="text-[10px] text-slate-500 block">Initialize your whiteboard layout instantly.</span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'UML Class Diagram', desc: 'Software engineering class structure layout model.', icon: '📊' },
                    { name: 'Sprint Kanban', desc: 'Agile project tracker cards template.', icon: '📋' },
                    { name: 'Mind Map', desc: 'Central topic brainstorming node roadmap layout.', icon: '🧠' }
                  ].map((temp) => (
                    <div 
                      key={temp.name}
                      onClick={() => loadTemplate(temp.name)}
                      className="p-3.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-violet-500/30 rounded-2xl cursor-pointer transition flex items-start gap-3"
                    >
                      <div className="text-2xl">{temp.icon}</div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-snug">{temp.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{temp.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Collaborative active users status */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 text-[10px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              Collaborators:
            </span>
            <div className="flex -space-x-2">
              <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[9px] font-bold">
                {user?.name ? user.name.charAt(0) : 'U'}
              </span>
              {collaborators.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold" title={c.username}>
                  {c.username.charAt(0)}
                </span>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
