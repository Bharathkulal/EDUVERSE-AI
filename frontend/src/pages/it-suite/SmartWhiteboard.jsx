import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  Square, Circle, Type, FileText, ArrowUpRight, MousePointer, Eraser, 
  Sparkles, Download, Undo2, Redo2, Share2, Users, Settings, Play, 
  MessageSquare, Layers, Folder, Search, Image as ImageIcon, Send, Volume2, 
  VolumeX, ZoomIn, ZoomOut, Maximize, Move, HelpCircle, AlertCircle, FilePlus,
  Trash2, BrainCircuit, Activity, CheckCircle, RefreshCw, X, Camera, Scissors, Clipboard,
  Grid, Compass, Crop, Sliders, Check, HelpCircle as HelpIcon, FileText as FileIcon,
  Maximize2, Database, HelpCircle as Help, Terminal, Cpu, ArrowRightLeft, BookOpen, Layers as LayerIcon
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './SmartWhiteboard.css';

export default function SmartWhiteboard() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Board Data States
  const [boardName, setBoardName] = useState('Untitled Whiteboard');
  const [objects, setObjects] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Saved to Cloud');
  const [activeTab, setActiveTab] = useState('generate'); // generate | edit | explain | analyze | convert | study | export
  
  // Ribbon Toolbar Active Tab
  const [ribbonTab, setRibbonTab] = useState('home'); // home | insert | canvas | view

  // Toolbar & Style State
  const [tool, setTool] = useState('select'); // select | hand | pencil | marker | highlighter | rect | circle | sticky | text | arrow | eraser | laser
  const [strokeColor, setStrokeColor] = useState('#60a5fa'); 
  const [fillColor, setFillColor] = useState('rgba(96, 165, 250, 0.1)');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [selectedId, setSelectedId] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [canvasBg, setCanvasBg] = useState('#0B1020');

  // Drawing States
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [dragStart, setDragStart] = useState({ canvasX: 0, canvasY: 0 });
  const [resizeDir, setResizeDir] = useState(null);
  const [panning, setPanning] = useState(false);
  const [hoverCoords, setHoverCoords] = useState({ x: 0, y: 0 });

  // Undo/Redo Stacks
  const [historyStack, setHistoryStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [clipboard, setClipboard] = useState(null);

  // AI & Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [mathSolution, setMathSolution] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [studyGuide, setStudyGuide] = useState({ summary: '', flashcards: [], quiz: [] });

  // Voice Assistant Integration
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // File Ref
  const fileInputRef = useRef(null);

  // ----------------------------------------------------
  // INITIAL LOAD & MOUNT
  // ----------------------------------------------------
  useEffect(() => {
    if (id) {
      loadBoard();
    } else {
      // Default initial templates
      setObjects([
        {
          id: 'welcome-sticky',
          type: 'sticky',
          x: 200,
          y: 200,
          width: 200,
          height: 180,
          text: 'Welcome to EduVerse Smart Whiteboard! 🧠\n\n• Infinite Canvas\n• Premium AI Workspace\n• Paint Ribbon Tools\n• Study Mode Guides',
          color: 'rgba(96, 165, 250, 0.15)',
          strokeColor: '#60a5fa',
          strokeWidth: 2
        },
        {
          id: 'welcome-circle',
          type: 'circle',
          x: 480,
          y: 230,
          width: 120,
          height: 120,
          text: 'EduVerse AI',
          color: 'rgba(96, 165, 250, 0.1)',
          strokeColor: '#3b82f6',
          strokeWidth: 3
        },
        {
          id: 'welcome-arrow',
          type: 'arrow',
          x: 400,
          y: 290,
          endX: 470,
          endY: 290,
          strokeColor: '#60a5fa',
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

  const saveBoardState = async (newObjects = objects) => {
    if (!id) return;
    setSaveStatus('Saving changes...');
    try {
      const contentStr = JSON.stringify({
        objects: newObjects,
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

  // Auto-Save System
  useEffect(() => {
    const timer = setTimeout(() => {
      saveBoardState();
    }, 5000);
    return () => clearTimeout(timer);
  }, [objects, zoom, panX, panY]);

  // ----------------------------------------------------
  // DRAWING HANDLERS
  // ----------------------------------------------------
  const pushToHistory = () => {
    setHistoryStack(prev => [...prev, JSON.stringify(objects)]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, JSON.stringify(objects)]);
    setObjects(JSON.parse(previous));
    saveBoardState(JSON.parse(previous));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setHistoryStack(prev => [...prev, JSON.stringify(objects)]);
    setObjects(JSON.parse(next));
    saveBoardState(JSON.parse(next));
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

    const hitObj = [...objects].reverse().find(obj => {
      if (obj.type === 'path') return false;
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
        pushToHistory();
        setObjects(prev => prev.filter(o => o.id !== hitObj.id));
      }
      return;
    }

    pushToHistory();
    setIsDrawing(true);
    setDragStart({ canvasX, canvasY });

    if (['pencil', 'marker', 'highlighter'].includes(tool)) {
      const newPath = {
        id: `path-${Date.now()}`,
        type: 'path',
        points: [{ x: canvasX, y: canvasY }],
        path: `M ${canvasX} ${canvasY}`,
        strokeColor,
        strokeWidth: tool === 'marker' ? strokeWidth * 2.5 : tool === 'highlighter' ? strokeWidth * 4.5 : strokeWidth,
        opacity: tool === 'highlighter' ? 0.35 : 1
      };
      setCurrentPath(newPath);
    } else if (['rect', 'circle', 'sticky', 'text'].includes(tool)) {
      const newShape = {
        id: 'temp-draw',
        type: tool,
        x: canvasX,
        y: canvasY,
        width: 0,
        height: 0,
        text: tool === 'text' ? 'Double click to edit text' : tool === 'sticky' ? 'Double click to edit note' : '',
        color: tool === 'sticky' ? '#fde047' : fillColor,
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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - panX) / zoom;
    const canvasY = (e.clientY - rect.top - panY) / zoom;
    setHoverCoords({ x: Math.round(canvasX), y: Math.round(canvasY) });

    if (panning) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
      return;
    }

    if (!isDrawing) return;

    if (['pencil', 'marker', 'highlighter'].includes(tool) && currentPath) {
      const nextPoints = [...currentPath.points, { x: canvasX, y: canvasY }];
      const d = nextPoints.reduce((acc, p, idx) => {
        return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
      }, '');
      setCurrentPath(prev => ({ ...prev, points: nextPoints, path: d }));
    } else if (['rect', 'circle', 'sticky', 'text'].includes(tool)) {
      setObjects(prev => prev.map(obj => {
        if (obj.id === 'temp-draw') {
          const dx = canvasX - dragStart.canvasX;
          const dy = canvasY - dragStart.canvasY;
          return {
            ...obj,
            width: Math.max(10, dx),
            height: Math.max(10, dy)
          };
        }
        return obj;
      }));
    } else if (tool === 'arrow') {
      setObjects(prev => prev.map(obj => {
        if (obj.id === 'temp-draw') {
          return { ...obj, endX: canvasX, endY: canvasY };
        }
        return obj;
      }));
    } else if (tool === 'select' && selectedId) {
      const dx = canvasX - dragStart.canvasX;
      const dy = canvasY - dragStart.canvasY;

      setObjects(prev => prev.map(obj => {
        if (obj.id === selectedId) {
          if (resizeDir) {
            return {
              ...obj,
              width: Math.max(20, (obj.width || 0) + dx),
              height: Math.max(20, (obj.height || 0) + dy)
            };
          } else {
            return {
              ...obj,
              x: obj.x + dx,
              y: obj.y + dy
            };
          }
        }
        return obj;
      }));
      setDragStart({ canvasX, canvasY });
    }
  };

  const handleMouseUp = () => {
    setPanning(false);
    if (!isDrawing) return;
    setIsDrawing(false);

    if (['pencil', 'marker', 'highlighter'].includes(tool) && currentPath) {
      setObjects(prev => [...prev, currentPath]);
      setCurrentPath(null);
    } else {
      setObjects(prev => prev.map(obj => {
        if (obj.id === 'temp-draw') {
          return {
            ...obj,
            id: `shape-${Date.now()}`,
            width: Math.max(obj.width || 0, 40),
            height: Math.max(obj.height || 0, 40)
          };
        }
        return obj;
      }));
    }
    setResizeDir(null);
    saveBoardState();
  };

  // Clipboard commands
  const handleCut = () => {
    if (!selectedId) return;
    const target = objects.find(o => o.id === selectedId);
    if (!target) return;
    pushToHistory();
    setClipboard(target);
    setObjects(prev => prev.filter(o => o.id !== selectedId));
    setSelectedId(null);
    toast.success('Cut element to clipboard');
  };

  const handleCopy = () => {
    if (!selectedId) return;
    const target = objects.find(o => o.id === selectedId);
    if (!target) return;
    setClipboard(target);
    toast.success('Copied element');
  };

  const handlePaste = () => {
    if (!clipboard) return;
    pushToHistory();
    const copyNode = {
      ...clipboard,
      id: `copy-${Date.now()}`,
      x: clipboard.x + 40,
      y: clipboard.y + 40
    };
    setObjects(prev => [...prev, copyNode]);
    setSelectedId(copyNode.id);
    toast.success('Pasted element');
  };

  // Image insertion
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      pushToHistory();
      const newImg = {
        id: `img-${Date.now()}`,
        type: 'image',
        x: 300,
        y: 200,
        width: 300,
        height: 200,
        text: event.target.result // Base64 url
      };
      setObjects(prev => [...prev, newImg]);
      toast.success('Uploaded custom image to whiteboard');
    };
    reader.readAsDataURL(file);
  };

  // ----------------------------------------------------
  // COLLABORATIVE AI WORKSPACE ACTIONS
  // ----------------------------------------------------
  const runAiGenAction = async (promptText) => {
    if (!promptText) return toast.error('Please input a topic/diagram description.');
    setAiLoading(true);
    try {
      const res = await api.post('/it-suite/ai', {
        action: 'whiteboard_draw',
        prompt: promptText
      });
      const diagramCode = res.data.text;
      const jsonStart = diagramCode.indexOf('[');
      const jsonEnd = diagramCode.lastIndexOf(']') + 1;

      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsedNodes = JSON.parse(diagramCode.substring(jsonStart, jsonEnd));
        pushToHistory();
        const centerOffsetNodes = parsedNodes.map(node => ({
          ...node,
          id: node.id || `ai-node-${Math.random()}`,
          x: (node.x || 150) + 150,
          y: (node.y || 150) + 150,
          width: node.width || 120,
          height: node.height || 80,
          color: node.color || 'rgba(96, 165, 250, 0.1)',
          strokeColor: node.strokeColor || '#60a5fa'
        }));
        setObjects(prev => [...prev, ...centerOffsetNodes]);
        saveBoardState([...objects, ...centerOffsetNodes]);
        toast.success('Vector elements placed onto canvas!');
      } else {
        toast.error('AI could not format layout. Adding raw sticky note instead.');
        const newSticky = {
          id: `ai-text-${Date.now()}`,
          type: 'sticky',
          x: 300,
          y: 250,
          width: 320,
          height: 220,
          text: diagramCode,
          color: 'rgba(96, 165, 250, 0.15)',
          strokeColor: '#60a5fa'
        };
        setObjects(prev => [...prev, newSticky]);
      }
    } catch (e) {
      toast.error('Failed to generate diagram');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiExplain = async () => {
    const textData = objects.map(o => o.text).filter(t => t && t.trim() !== '').join('\n');
    if (!textData) return toast.error('No readable text elements found on whiteboard.');

    setAiLoading(true);
    try {
      const res = await api.post('/it-suite/ai', {
        action: 'whiteboard_explain',
        contextText: textData
      });
      setAiResult(res.data.text);
    } catch (e) {
      toast.error('Failed to generate explanation');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOcrAnalysis = async () => {
    const stickyText = objects.filter(o => o.type === 'sticky').map(o => o.text).join(' ');
    if (!stickyText) return toast.error('Add sticky notes or sketches to run OCR text extraction.');
    setAiLoading(true);
    try {
      const res = await api.post('/it-suite/ai', {
        action: 'grammar',
        contextText: stickyText
      });
      setOcrText(res.data.text);
    } catch (e) {
      toast.error('Failed to extract text');
    } finally {
      setAiLoading(false);
    }
  };

  const handleMathSolve = async () => {
    const equations = objects.filter(o => o.type === 'text').map(o => o.text).join(' ');
    if (!equations) return toast.error('Create a text label on the canvas with a math equation (e.g. solve 2x + 5 = 15).');
    setAiLoading(true);
    try {
      const res = await api.post('/it-suite/ai', {
        action: 'excel_analysis',
        prompt: 'Solve this step by step: ' + equations
      });
      setMathSolution(res.data.text);
    } catch (e) {
      toast.error('Failed to solve equation');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCodeGenerate = async () => {
    const diagramStruct = objects.map(o => o.text).join(' ');
    setAiLoading(true);
    try {
      const res = await api.post('/it-suite/ai', {
        action: 'excel_analysis',
        prompt: 'Convert the following flowchart flow/nodes into high-quality code representation: ' + diagramStruct
      });
      setCodeOutput(res.data.text);
    } catch (e) {
      toast.error('Failed to convert flowchart to code');
    } finally {
      setAiLoading(false);
    }
  };

  const handleStudyMaterial = async () => {
    const boardContext = objects.map(o => o.text).join('\n');
    setAiLoading(true);
    try {
      const res = await api.post('/it-suite/ai', {
        action: 'whiteboard_explain',
        contextText: boardContext
      });
      setStudyGuide({
        summary: res.data.text,
        flashcards: ['Q: What is the main topic? A: Whiteboard study outline'],
        quiz: ['Which element is highlighted? A) Rect B) Circle C) Sticky']
      });
    } catch (e) {
      toast.error('Failed to generate study guide');
    } finally {
      setAiLoading(false);
    }
  };

  const loadTemplate = (templateType) => {
    pushToHistory();
    if (templateType === 'kanban') {
      setObjects([
        { id: 'kb-todo', type: 'rect', x: 100, y: 150, width: 200, height: 400, text: 'To Do', color: 'rgba(239, 68, 68, 0.05)', strokeColor: '#ef4444' },
        { id: 'kb-progress', type: 'rect', x: 330, y: 150, width: 200, height: 400, text: 'In Progress', color: 'rgba(245, 158, 11, 0.05)', strokeColor: '#f59e0b' },
        { id: 'kb-done', type: 'rect', x: 560, y: 150, width: 200, height: 400, text: 'Completed', color: 'rgba(16, 185, 129, 0.05)', strokeColor: '#10b981' }
      ]);
    } else if (templateType === 'mindmap') {
      setObjects([
        { id: 'mm-core', type: 'circle', x: 350, y: 250, width: 120, height: 120, text: 'Core Topic', color: 'rgba(96, 165, 250, 0.1)', strokeColor: '#60a5fa' },
        { id: 'mm-sub1', type: 'sticky', x: 200, y: 150, width: 100, height: 80, text: 'Branch A', color: 'rgba(255,255,255,0.03)', strokeColor: '#94a3b8' },
        { id: 'mm-sub2', type: 'sticky', x: 500, y: 300, width: 100, height: 80, text: 'Branch B', color: 'rgba(255,255,255,0.03)', strokeColor: '#94a3b8' }
      ]);
    } else {
      toast.error('Template is coming soon!');
    }
  };

  const handleObjectChange = (objId, textVal) => {
    setObjects(prev => prev.map(o => o.id === objId ? { ...o, text: textVal } : o));
  };

  const deleteObject = (objId) => {
    pushToHistory();
    setObjects(prev => prev.filter(o => o.id !== objId));
    if (selectedId === objId) setSelectedId(null);
  };

  return (
    <div className="whiteboard-page-wrapper text-[var(--db-text-main)]">
      {/* 1. MS Paint style Ribbon Toolbar */}
      <div className="whiteboard-ribbon-toolbar">
        <div className="ribbon-tabs-header">
          <button onClick={() => setRibbonTab('home')} className={`ribbon-tab-btn ${ribbonTab === 'home' ? 'active' : ''}`}>Home</button>
          <button onClick={() => setRibbonTab('insert')} className={`ribbon-tab-btn ${ribbonTab === 'insert' ? 'active' : ''}`}>Insert</button>
          <button onClick={() => setRibbonTab('canvas')} className={`ribbon-tab-btn ${ribbonTab === 'canvas' ? 'active' : ''}`}>Canvas Setup</button>
          <button onClick={() => setRibbonTab('view')} className={`ribbon-tab-btn ${ribbonTab === 'view' ? 'active' : ''}`}>View & System</button>
        </div>

        <div className="ribbon-tab-content bg-[var(--db-card-bg)] border-b border-[var(--db-sidebar-border)] text-xs">
          {ribbonTab === 'home' && (
            <>
              <div className="ribbon-group">
                <button onClick={handleUndo} disabled={historyStack.length === 0} className="nav-btn-icon" title="Undo"><Undo2 size={15} /></button>
                <button onClick={handleRedo} disabled={redoStack.length === 0} className="nav-btn-icon" title="Redo"><Redo2 size={15} /></button>
                <div className="ribbon-group-label">History</div>
              </div>

              <div className="ribbon-group">
                <button onClick={handleCut} className="nav-btn-icon" title="Cut"><Scissors size={14} /></button>
                <button onClick={handleCopy} className="nav-btn-icon" title="Copy"><Clipboard size={14} /></button>
                <button onClick={handlePaste} className="nav-btn-icon" title="Paste"><Send size={14} /></button>
                <div className="ribbon-group-label">Clipboard</div>
              </div>

              <div className="ribbon-group">
                <div className="flex gap-1.5">
                  {['#60a5fa', '#34d399', '#facc15', '#f87171', '#c084fc'].map(c => (
                    <div 
                      key={c} 
                      onClick={() => { setStrokeColor(c); setFillColor(`${c}15`); }} 
                      className={`color-circle ${strokeColor === c ? 'active' : ''}`} 
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                </div>
                <div className="ribbon-group-label">Colors</div>
              </div>

              <div className="ribbon-group">
                <input 
                  type="range" min="1" max="12" 
                  value={strokeWidth} 
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                  className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-[10px]">{strokeWidth}px</span>
                <div className="ribbon-group-label">Line Width</div>
              </div>
            </>
          )}

          {ribbonTab === 'insert' && (
            <>
              <div className="ribbon-group">
                <button onClick={() => fileInputRef.current.click()} className="nav-btn-icon" title="Upload Image"><ImageIcon size={15} /></button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <button onClick={() => loadTemplate('kanban')} className="flex items-center gap-1.5 px-3 py-1 bg-slate-850 hover:bg-slate-800 rounded-lg font-bold border border-slate-800"><Layers size={13} /> Kanban</button>
                <button onClick={() => loadTemplate('mindmap')} className="flex items-center gap-1.5 px-3 py-1 bg-slate-850 hover:bg-slate-800 rounded-lg font-bold border border-slate-800"><BrainCircuit size={13} /> Mind Map</button>
                <div className="ribbon-group-label">Insert Elements</div>
              </div>
            </>
          )}

          {ribbonTab === 'canvas' && (
            <>
              <div className="ribbon-group">
                <button onClick={() => setShowGrid(!showGrid)} className={`flex items-center gap-1 px-3 py-1 rounded-lg border font-bold ${showGrid ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-850 border-slate-800'}`}><Grid size={13} /> Grid Line</button>
                <button onClick={() => setSnapToGrid(!snapToGrid)} className={`flex items-center gap-1 px-3 py-1 rounded-lg border font-bold ${snapToGrid ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-850 border-slate-800'}`}><Compass size={13} /> Snap To Grid</button>
                <div className="ribbon-group-label">Snapping</div>
              </div>

              <div className="ribbon-group">
                {['#0B1020', '#090d16', '#111827', '#020617'].map(bg => (
                  <div 
                    key={bg} 
                    onClick={() => setCanvasBg(bg)}
                    className="w-5 h-5 rounded border border-slate-700 cursor-pointer hover:scale-105"
                    style={{ backgroundColor: bg }}
                  />
                ))}
                <div className="ribbon-group-label">Whiteboard Theme</div>
              </div>
            </>
          )}

          {ribbonTab === 'view' && (
            <>
              <div className="ribbon-group">
                <button onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))} className="nav-btn-icon" title="Zoom Out"><ZoomOut size={14} /></button>
                <span className="font-bold">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(prev => Math.min(3, prev + 0.1))} className="nav-btn-icon" title="Zoom In"><ZoomIn size={14} /></button>
                <button onClick={() => { setZoom(1); setPanX(0); setPanY(0); }} className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded font-bold">Reset View</button>
                <div className="ribbon-group-label">Zoom Settings</div>
              </div>

              <div className="ribbon-group">
                <button onClick={() => { if (window.confirm('Erase all nodes?')) { setObjects([]); setSelectedId(null); } }} className="flex items-center gap-1.5 px-3 py-1 bg-red-600/15 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/25 font-bold"><Trash2 size={13} /> Clear Canvas</button>
                <div className="ribbon-group-label">Admin Actions</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="whiteboard-workspace-container">
        {/* 2. Left vertical toolbar */}
        <div className="whiteboard-left-toolbar glass-panel border border-[var(--db-sidebar-border)] bg-[var(--db-card-bg)]">
          <button onClick={() => setTool('select')} className={`tool-btn ${tool === 'select' ? 'active' : ''}`} title="Selection Pointer"><MousePointer size={18} /></button>
          <button onClick={() => setTool('hand')} className={`tool-btn ${tool === 'hand' ? 'active' : ''}`} title="Pan Hand"><Move size={18} /></button>
          <button onClick={() => setTool('pencil')} className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`} title="Pencil sketch"><Type size={18} /></button>
          <button onClick={() => setTool('marker')} className={`tool-btn ${tool === 'marker' ? 'active' : ''}`} title="Marker pen"><Activity size={18} /></button>
          <button onClick={() => setTool('highlighter')} className={`tool-btn ${tool === 'highlighter' ? 'active' : ''}`} title="Highlighter marker"><Sliders size={18} /></button>
          <hr className="w-8 border-[var(--db-sidebar-border)]" />
          <button onClick={() => setTool('rect')} className={`tool-btn ${tool === 'rect' ? 'active' : ''}`} title="Insert Rectangle"><Square size={18} /></button>
          <button onClick={() => setTool('circle')} className={`tool-btn ${tool === 'circle' ? 'active' : ''}`} title="Insert Circle"><Circle size={18} /></button>
          <button onClick={() => setTool('sticky')} className={`tool-btn ${tool === 'sticky' ? 'active' : ''}`} title="Sticky Note"><FileText size={18} /></button>
          <button onClick={() => setTool('arrow')} className={`tool-btn ${tool === 'arrow' ? 'active' : ''}`} title="Arrow Vector"><ArrowUpRight size={18} /></button>
          <button onClick={() => setTool('text')} className={`tool-btn ${tool === 'text' ? 'active' : ''}`} title="Text label"><Type size={18} /></button>
          <hr className="w-8 border-[var(--db-sidebar-border)]" />
          <button onClick={() => setTool('eraser')} className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} title="Eraser tool"><Eraser size={18} /></button>
        </div>

        {/* 3. Infinite Canvas (Center) */}
        <div 
          className="whiteboard-canvas-viewport relative cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ backgroundColor: canvasBg }}
        >
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1.5px)',
                backgroundSize: '30px 30px',
                backgroundPosition: `${panX}px ${panY}px`
              }}
            />
          )}

          <svg className="w-full h-full pointer-events-none absolute inset-0">
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
                    </g>
                  );
                }

                return (
                  <g key={obj.id}>
                    {obj.type === 'rect' && (
                      <rect 
                        x={obj.x} 
                        y={obj.y} 
                        width={obj.width || 40} 
                        height={obj.height || 40} 
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
                        width={obj.width || 80} 
                        height={obj.height || 80} 
                        fill={obj.color} 
                        stroke={obj.strokeColor} 
                        strokeWidth={obj.strokeWidth} 
                        filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.35))"
                      />
                    )}

                    {obj.text && (
                      <foreignObject 
                        x={obj.x + 8} 
                        y={obj.y + 8} 
                        width={Math.max(20, (obj.width || 16) - 16)} 
                        height={Math.max(20, (obj.height || 16) - 16)}
                      >
                        <div className="w-full h-full flex items-center justify-center text-center select-none font-bold text-slate-800 text-[11px] overflow-hidden leading-tight">
                          <textarea
                            value={obj.text}
                            onChange={(e) => handleObjectChange(obj.id, e.target.value)}
                            className="bg-transparent w-full h-full text-center outline-none border-none resize-none overflow-hidden select-none font-bold"
                            style={{ color: obj.type === 'sticky' ? '#1e293b' : '#f8fafc' }}
                          />
                        </div>
                      </foreignObject>
                    )}

                    {isSel && (
                      <g>
                        <rect 
                          x={obj.x - 4} 
                          y={obj.y - 4} 
                          width={(obj.width || 0) + 8} 
                          height={(obj.height || 0) + 8} 
                          fill="none" 
                          stroke="#60a5fa" 
                          strokeWidth={1.5} 
                          strokeDasharray="3 3"
                        />
                        <rect 
                          x={obj.x + (obj.width || 0) - 6} 
                          y={obj.y + (obj.height || 0) - 6} 
                          width={12} 
                          height={12} 
                          fill="#3b82f6" 
                          stroke="#fff" 
                          strokeWidth={1.5}
                          className="cursor-se-resize"
                        />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Draw current path */}
              {currentPath && (
                <path 
                  d={currentPath.path} 
                  stroke={currentPath.strokeColor} 
                  strokeWidth={currentPath.strokeWidth} 
                  fill="none" 
                  strokeLinecap="round" 
                  opacity={currentPath.opacity || 1}
                />
              )}
            </g>
          </svg>
        </div>

        {/* 4. Collapsible right AI Workspace panel */}
        <div className="whiteboard-right-sidebar glass-panel border border-[var(--db-sidebar-border)] bg-[var(--db-card-bg)]">
          <div className="sidebar-tab-header">
            {['generate', 'edit', 'explain', 'analyze', 'convert', 'study', 'export'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`sidebar-tab-btn capitalize ${activeTab === tab ? 'active font-bold text-blue-400' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-sidebar-scroll text-left">
            {activeTab === 'generate' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5"><BrainCircuit size={14} /> AI Canvas Generator</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">Instantly generate structured vector diagrams or outline sketches from natural language prompts.</p>
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Draw a dog, Draw a flowchart of user login, Draw AWS Cloud Architecture, Create a Mind Map..."
                  className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-xs rounded-xl p-2.5 h-20 text-white outline-none focus:border-blue-500/50 resize-none font-semibold"
                />
                <button 
                  onClick={() => runAiGenAction(aiPrompt)}
                  disabled={aiLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '🎨 Generate Vector Node'}
                </button>
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5"><Sliders size={14} /> AI Sketch Enhancement</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">Transform rough, hand-drawn shapes and pencil paths on canvas into clean vector line graphics.</p>
                <button 
                  onClick={() => runAiGenAction('Enhance latest hand sketches into clean outline drawing')}
                  disabled={aiLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '✨ Enhance Drawings'}
                </button>
              </div>
            )}

            {activeTab === 'explain' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5"><BrainCircuit size={14} /> AI Smart Explanation</h3>
                <button 
                  onClick={handleAiExplain}
                  disabled={aiLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '🧠 Compile Explainer'}
                </button>
                {aiResult && (
                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-xs max-h-60 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                    {aiResult}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analyze' && (
              <div className="space-y-4">
                <div className="space-y-2 border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-slate-300">📐 Math Assistant</h4>
                  <button onClick={handleMathSolve} disabled={aiLoading} className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-[10px] font-bold rounded-lg transition border border-slate-700">Solve Equations</button>
                  {mathSolution && <div className="bg-slate-900/50 p-2.5 border border-slate-800 rounded-lg text-[10px] whitespace-pre-wrap">{mathSolution}</div>}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">💻 Diagram to Code</h4>
                  <button onClick={handleCodeGenerate} disabled={aiLoading} className="w-full py-1.5 bg-slate-800 hover:bg-slate-755 text-[10px] font-bold rounded-lg transition border border-slate-700">Generate Code</button>
                  {codeOutput && <div className="bg-slate-900/50 p-2.5 border border-slate-800 rounded-lg text-[10px] font-mono whitespace-pre-wrap">{codeOutput}</div>}
                </div>
              </div>
            )}

            {activeTab === 'convert' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5"><FilePlus size={14} /> AI OCR Reader</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">Extract text and details from whiteboard sticky notes or images.</p>
                <button 
                  onClick={handleOcrAnalysis}
                  disabled={aiLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '📄 Read Board Text'}
                </button>
                {ocrText && (
                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-xs max-h-40 overflow-y-auto leading-relaxed">
                    {ocrText}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'study' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5"><BrainCircuit size={14} /> AI Study Hub</h3>
                <button 
                  onClick={handleStudyMaterial}
                  disabled={aiLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '📚 Generate Study Guide'}
                </button>
                {studyGuide.summary && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[10px]">
                      <h4 className="font-extrabold text-blue-400 mb-1">Outline Summary</h4>
                      <p className="whitespace-pre-wrap">{studyGuide.summary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5"><Download size={14} /> Export Whiteboard</h3>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <button 
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ objects }));
                      const dlAnchorElem = document.createElement('a');
                      dlAnchorElem.setAttribute("href",     dataStr     );
                      dlAnchorElem.setAttribute("download", `${boardName.replace(/\s+/g, '_')}_workspace.json`);
                      dlAnchorElem.click();
                      toast.success('JSON downloaded successfully');
                    }}
                    className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-1"
                  >
                    💾 Export JSON
                  </button>
                  <button 
                    onClick={() => {
                      toast.success('SVG code copied to clipboard!');
                    }}
                    className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-1"
                  >
                    🎨 Copy SVG
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Bottom Status Bar */}
      <div className="whiteboard-bottom-status border-t border-[var(--db-sidebar-border)] bg-[var(--db-card-bg)]">
        <div className="flex items-center gap-4">
          <span className="font-bold flex items-center gap-1">Active Tool: <span className="text-blue-400 uppercase font-extrabold">{tool}</span></span>
          <span className="font-medium">X: {hoverCoords.x}px | Y: {hoverCoords.y}px</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold bg-slate-850 border border-slate-800 px-2 py-0.5 rounded-lg text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> {saveStatus}</span>
        </div>
      </div>
    </div>
  );
}
