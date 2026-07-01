import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation, Plus, Trash2, ChevronUp, ChevronDown, Download,
  CheckCircle, Sparkles, Play, Pencil, Square, Circle, Minus,
  Type, Image, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline, Move, X, Copy, Layers, MessageSquare, History,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, MousePointer
} from 'lucide-react';
import api from '../../api/axios';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ITSuite.css';

// ─── TRANSITIONS ────────────────────────────────────────────────────────────
const TRANSITIONS = {
  none: { initial: {}, animate: {}, exit: {} },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slideLeft: { initial: { x: '100%', opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: '-100%', opacity: 0 } },
  slideUp: { initial: { y: '100%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '-100%', opacity: 0 } },
  zoom: { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 1.5, opacity: 0 } },
};

// ─── THEME PALETTE ───────────────────────────────────────────────────────────
const THEMES = {
  default: { bg: '#ffffff', text: '#1f2937', accent: '#2563eb' },
  dark: { bg: '#111827', text: '#f9fafb', accent: '#60a5fa' },
  ocean: { bg: '#0f172a', text: '#e2e8f0', accent: '#06b6d4' },
  forest: { bg: '#064e3b', text: '#ecfdf5', accent: '#34d399' },
  sunset: { bg: '#7c2d12', text: '#fef3c7', accent: '#f97316' },
  royal: { bg: '#1e1b4b', text: '#ede9fe', accent: '#a78bfa' },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────
const makeId = () => Math.random().toString(36).slice(2, 8);

const newSlide = (theme = 'default') => ({
  id: `slide-${makeId()}`,
  theme,
  transition: 'fade',
  background: THEMES[theme].bg,
  speakerNotes: '',
  elements: [
    {
      id: `el-${makeId()}`,
      type: 'text',
      value: 'Click to edit title',
      x: 60, y: 120, width: 680, height: 90,
      fontSize: 36, bold: true, italic: false, underline: false,
      align: 'left', color: THEMES[theme].text
    },
    {
      id: `el-${makeId()}`,
      type: 'text',
      value: 'Add your content here',
      x: 60, y: 230, width: 680, height: 120,
      fontSize: 20, bold: false, italic: false, underline: false,
      align: 'left', color: THEMES[theme].text
    }
  ]
});

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function SlidesEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Document meta
  const [docName, setDocName] = useState('Untitled Presentation');
  const [saveStatus, setSaveStatus] = useState('Saved');

  // Slides state
  const [slides, setSlides] = useState([newSlide()]);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [selectedElId, setSelectedElId] = useState(null);
  const [editingElId, setEditingElId] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('default');

  // Presenter Mode
  const [presenterMode, setPresenterMode] = useState(false);
  const [presenterSlideIdx, setPresenterSlideIdx] = useState(0);
  const [laserMode, setLaserMode] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [penMode, setPenMode] = useState(false);
  const [penColor, setPenColor] = useState('#ff0000');
  const [penStrokes, setPenStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  const penCanvasRef = useRef(null);

  // Sidebar / panel
  const [activeSidebar, setActiveSidebar] = useState(null); // 'ai', 'notes', 'history'
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [speakerNotes, setSpeakerNotes] = useState('');
  const [versions, setVersions] = useState([]);

  // Drag/move state
  const [dragging, setDragging] = useState(null);

  const socketRef = useRef(null);
  const autosaveRef = useRef(null);
  const canvasRef = useRef(null);

  // ── LOAD ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/it-suite/documents/${id}`);
        setDocName(res.data.name);
        try {
          const parsed = JSON.parse(res.data.content || '[]');
          if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
        } catch { /* ignore */ }
      } catch {
        toast.error('Failed to load presentation');
        navigate('/it-suite');
      }
    };
    load();

    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const socket = io(socketUrl);
    socketRef.current = socket;
    socket.emit('join-document', { documentId: id, username: user?.name });
    socket.on('document-remote-update', ({ content }) => {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) setSlides(parsed);
      } catch { /* ignore */ }
    });
    return () => socket.disconnect();
  }, [id]);

  // ── SYNC SPEAKER NOTES ──
  useEffect(() => {
    const slide = slides[activeSlideIdx];
    if (slide) setSpeakerNotes(slide.speakerNotes || '');
  }, [activeSlideIdx, slides]);

  // ── SAVE ──
  const triggerSave = useCallback((updatedSlides) => {
    setSaveStatus('Saving…');
    const content = JSON.stringify(updatedSlides);
    if (socketRef.current) socketRef.current.emit('document-update', { documentId: id, content });
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(async () => {
      try {
        await api.put(`/it-suite/documents/${id}`, { content });
        setSaveStatus('Saved');
      } catch { setSaveStatus('Offline'); }
    }, 2000);
  }, [id]);

  const updateSlides = (updated) => {
    setSlides(updated);
    triggerSave(updated);
  };

  // ── SLIDE OPERATIONS ──
  const addSlide = () => {
    const updated = [...slides, newSlide(currentTheme)];
    updateSlides(updated);
    setActiveSlideIdx(updated.length - 1);
    setSelectedElId(null);
  };

  const deleteSlide = (idx) => {
    if (slides.length <= 1) { toast.error("Can't delete the only slide."); return; }
    const updated = slides.filter((_, i) => i !== idx);
    updateSlides(updated);
    setActiveSlideIdx(Math.min(idx, updated.length - 1));
    setSelectedElId(null);
  };

  const duplicateSlide = (idx) => {
    const clone = JSON.parse(JSON.stringify(slides[idx]));
    clone.id = `slide-${makeId()}`;
    clone.elements = clone.elements.map(e => ({ ...e, id: `el-${makeId()}` }));
    const updated = [...slides.slice(0, idx + 1), clone, ...slides.slice(idx + 1)];
    updateSlides(updated);
    setActiveSlideIdx(idx + 1);
  };

  const moveSlide = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= slides.length) return;
    const updated = [...slides];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updateSlides(updated);
    setActiveSlideIdx(newIdx);
  };

  const updateSlide = (idx, fields) => {
    const updated = slides.map((s, i) => i === idx ? { ...s, ...fields } : s);
    updateSlides(updated);
  };

  // ── ELEMENT OPERATIONS ──
  const activeSlide = () => slides[activeSlideIdx] || null;

  const addElement = (type) => {
    const defaults = {
      text: { value: 'New text', width: 300, height: 60, fontSize: 18, bold: false, italic: false, underline: false, align: 'left', color: THEMES[currentTheme].text },
      shape_rect: { width: 200, height: 120 },
      shape_circle: { width: 120, height: 120 },
      shape_line: { width: 200, height: 4 },
    };
    const el = {
      id: `el-${makeId()}`,
      type,
      x: 80 + Math.random() * 200,
      y: 80 + Math.random() * 150,
      fillColor: type !== 'text' ? THEMES[currentTheme].accent : undefined,
      borderColor: type !== 'text' ? THEMES[currentTheme].accent : undefined,
      ...(defaults[type] || defaults.text)
    };
    const s = activeSlide();
    if (!s) return;
    const updated = slides.map((sl, i) => i === activeSlideIdx ? { ...sl, elements: [...sl.elements, el] } : sl);
    updateSlides(updated);
    setSelectedElId(el.id);
  };

  const updateElement = (elId, fields) => {
    const updated = slides.map((sl, i) => i === activeSlideIdx
      ? { ...sl, elements: sl.elements.map(e => e.id === elId ? { ...e, ...fields } : e) }
      : sl
    );
    updateSlides(updated);
  };

  const deleteElement = (elId) => {
    const updated = slides.map((sl, i) => i === activeSlideIdx
      ? { ...sl, elements: sl.elements.filter(e => e.id !== elId) }
      : sl
    );
    updateSlides(updated);
    setSelectedElId(null);
  };

  const selectedEl = () => activeSlide()?.elements.find(e => e.id === selectedElId) || null;

  // ── DRAG MOVE ──
  const onElMouseDown = (e, elId) => {
    e.stopPropagation();
    setSelectedElId(elId);
    const el = activeSlide()?.elements.find(x => x.id === elId);
    if (!el) return;
    const startX = e.clientX - el.x;
    const startY = e.clientY - el.y;
    setDragging({ elId, startX, startY });
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      updateElement(dragging.elId, {
        x: Math.max(0, e.clientX - dragging.startX),
        y: Math.max(0, e.clientY - dragging.startY)
      });
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  // ── PRESENTER MODE ──
  const enterPresenter = () => {
    setPresenterSlideIdx(activeSlideIdx);
    setPenStrokes([]);
    setPresenterMode(true);
  };

  const exitPresenter = () => {
    setPresenterMode(false);
    setLaserMode(false);
    setPenMode(false);
  };

  const presenterKeyDown = useCallback((e) => {
    if (!presenterMode) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      setPresenterSlideIdx(i => Math.min(i + 1, slides.length - 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setPresenterSlideIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      exitPresenter();
    }
  }, [presenterMode, slides.length]);

  useEffect(() => {
    window.addEventListener('keydown', presenterKeyDown);
    return () => window.removeEventListener('keydown', presenterKeyDown);
  }, [presenterKeyDown]);

  // ── PEN DRAWING (PRESENTER) ──
  const onPenDown = (e) => {
    if (!penMode) return;
    const rect = penCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCurrentStroke({ color: penColor, points: [point] });
  };

  const onPenMove = (e) => {
    if (!penMode || !currentStroke) return;
    const rect = penCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCurrentStroke(s => ({ ...s, points: [...s.points, point] }));
  };

  const onPenUp = () => {
    if (!penMode || !currentStroke) return;
    setPenStrokes(ss => [...ss, currentStroke]);
    setCurrentStroke(null);
  };

  const strokePath = (points) => {
    if (points.length < 2) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // ── AI PRESENTATION GENERATOR ──
  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.post('/it-suite/ai', { action: 'generate_presentation', prompt: aiTopic });
      const text = res.data.text;
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']');
      if (jsonStart === -1 || jsonEnd === -1) { toast.error('AI returned unexpected format'); return; }
      const parsed = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      const generated = parsed.map((s) => {
        const slide = newSlide(currentTheme);
        slide.elements[0].value = s.title || 'Slide Title';
        slide.elements[1].value = Array.isArray(s.bullets) ? s.bullets.map(b => `• ${b}`).join('\n') : (s.content || '');
        return slide;
      });
      updateSlides(generated);
      setActiveSlideIdx(0);
      toast.success(`Generated ${generated.length} slides!`);
      setActiveSidebar(null);
    } catch (err) {
      toast.error('AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  // ── EXPORT PDF (print) ──
  const handleExport = () => {
    window.print();
    toast.success('Opening print dialog for PDF export');
  };

  // ── SPEAKER NOTES SAVE ──
  const saveNotes = (notes) => {
    setSpeakerNotes(notes);
    updateSlide(activeSlideIdx, { speakerNotes: notes });
  };

  // ── VERSIONS ──
  const loadVersions = async () => {
    try {
      const res = await api.get(`/it-suite/documents/${id}/versions`);
      setVersions(res.data || []);
    } catch { toast.error('Failed to load versions'); }
  };

  const restoreVersion = async (v) => {
    if (!window.confirm(`Restore to version ${v.version_number}?`)) return;
    try {
      const parsed = JSON.parse(v.content);
      if (Array.isArray(parsed)) {
        updateSlides(parsed);
        toast.success(`Restored version ${v.version_number}`);
        setActiveSidebar(null);
      }
    } catch { toast.error('Failed to parse version content'); }
  };

  // ── RENDER SLIDE CANVAS ──
  const renderSlide = (slide, { scale = 1, interactive = false } = {}) => {
    if (!slide) return null;
    const theme = THEMES[slide.theme || currentTheme] || THEMES.default;
    return (
      <div
        style={{
          width: 800 * scale,
          height: 450 * scale,
          background: slide.background || theme.bg,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif',
          flexShrink: 0,
        }}
        onClick={() => interactive && setSelectedElId(null)}
      >
        {slide.elements.map((el) => {
          const isSelected = interactive && selectedElId === el.id;
          const isEditing = interactive && editingElId === el.id;

          if (el.type === 'text') {
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: el.x * scale,
                  top: el.y * scale,
                  width: el.width * scale,
                  minHeight: el.height * scale,
                  fontSize: (el.fontSize || 18) * scale,
                  fontWeight: el.bold ? 'bold' : 'normal',
                  fontStyle: el.italic ? 'italic' : 'normal',
                  textDecoration: el.underline ? 'underline' : 'none',
                  textAlign: el.align || 'left',
                  color: el.color || theme.text,
                  cursor: interactive ? (dragging?.elId === el.id ? 'grabbing' : 'grab') : 'default',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxSizing: 'border-box',
                  padding: 4 * scale,
                  outline: isSelected ? `2px dashed ${theme.accent}` : 'none',
                  borderRadius: 4,
                  userSelect: interactive ? 'none' : 'text',
                }}
                onMouseDown={interactive ? (e) => onElMouseDown(e, el.id) : undefined}
                onDoubleClick={interactive ? (e) => { e.stopPropagation(); setEditingElId(el.id); } : undefined}
              >
                {isEditing ? (
                  <textarea
                    autoFocus
                    defaultValue={el.value}
                    onBlur={(e) => { updateElement(el.id, { value: e.target.value }); setEditingElId(null); }}
                    style={{
                      width: '100%', height: '100%', background: 'transparent', border: 'none',
                      outline: 'none', resize: 'none', font: 'inherit', color: 'inherit', textAlign: 'inherit',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span>{el.value}</span>
                )}
                {isSelected && interactive && (
                  <button
                    style={{ position: 'absolute', top: -12, right: -12, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                    onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            );
          }

          if (el.type === 'shape_rect') {
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute', left: el.x * scale, top: el.y * scale,
                  width: el.width * scale, height: el.height * scale,
                  background: el.fillColor || theme.accent, opacity: 0.8,
                  borderRadius: 8 * scale, cursor: interactive ? 'grab' : 'default',
                  outline: isSelected ? `2px dashed white` : 'none',
                }}
                onMouseDown={interactive ? (e) => onElMouseDown(e, el.id) : undefined}
              >
                {isSelected && interactive && (
                  <button
                    style={{ position: 'absolute', top: -12, right: -12, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', zIndex: 10 }}
                    onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            );
          }

          if (el.type === 'shape_circle') {
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute', left: el.x * scale, top: el.y * scale,
                  width: el.width * scale, height: el.height * scale,
                  background: el.fillColor || theme.accent, opacity: 0.8,
                  borderRadius: '50%', cursor: interactive ? 'grab' : 'default',
                  outline: isSelected ? `2px dashed white` : 'none',
                }}
                onMouseDown={interactive ? (e) => onElMouseDown(e, el.id) : undefined}
              >
                {isSelected && interactive && (
                  <button
                    style={{ position: 'absolute', top: -12, right: -12, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', zIndex: 10 }}
                    onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            );
          }

          if (el.type === 'shape_line') {
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute', left: el.x * scale, top: el.y * scale,
                  width: el.width * scale, height: 4 * scale,
                  background: el.fillColor || theme.accent, opacity: 0.9,
                  cursor: interactive ? 'grab' : 'default',
                  outline: isSelected ? `2px dashed white` : 'none',
                }}
                onMouseDown={interactive ? (e) => onElMouseDown(e, el.id) : undefined}
              />
            );
          }

          return null;
        })}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  PRESENTER MODE OVERLAY
  // ─────────────────────────────────────────────────────────────────────────
  if (presenterMode) {
    const presSlide = slides[presenterSlideIdx];
    const trans = TRANSITIONS[presSlide?.transition || 'fade'] || TRANSITIONS.fade;

    return (
      <div
        className="presenter-fullscreen-overlay"
        onMouseMove={(e) => {
          if (laserMode) setLaserPos({ x: e.clientX, y: e.clientY });
        }}
      >
        {/* Slide Canvas */}
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={presSlide?.id}
              initial={trans.initial}
              animate={trans.animate}
              exit={trans.exit}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ width: '100%', maxWidth: '90vw', aspectRatio: '16/9', position: 'relative' }}
            >
              {renderSlide(presSlide, { scale: 1.1 })}
            </motion.div>
          </AnimatePresence>

          {/* Drawing pen canvas overlay */}
          <svg
            ref={penCanvasRef}
            className="presentation-pen-canvas"
            onMouseDown={onPenDown}
            onMouseMove={onPenMove}
            onMouseUp={onPenUp}
            style={{ pointerEvents: penMode ? 'auto' : 'none' }}
          >
            {penStrokes.map((stroke, i) => (
              <path key={i} d={strokePath(stroke.points)} stroke={stroke.color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {currentStroke && (
              <path d={strokePath(currentStroke.points)} stroke={currentStroke.color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>

          {/* Laser pointer dot */}
          {laserMode && (
            <div
              className="presenter-laser-pointer"
              style={{ left: laserPos.x, top: laserPos.y }}
            />
          )}
        </div>

        {/* Presenter controls overlay at the bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-md rounded-2xl px-6 py-3 z-50">
          <button onClick={() => setPresenterSlideIdx(i => Math.max(0, i - 1))} className="p-2 text-white hover:text-blue-400 transition"><ChevronLeft size={22} /></button>
          <span className="text-white text-sm font-bold">{presenterSlideIdx + 1} / {slides.length}</span>
          <button onClick={() => setPresenterSlideIdx(i => Math.min(slides.length - 1, i + 1))} className="p-2 text-white hover:text-blue-400 transition"><ChevronRight size={22} /></button>
          <span className="h-5 w-px bg-white/30 mx-1" />
          <button
            onClick={() => setLaserMode(m => !m)}
            className={`p-2 rounded-lg transition ${laserMode ? 'bg-red-500 text-white' : 'text-white hover:text-red-400'}`}
            title="Laser Pointer"
          >
            <MousePointer size={18} />
          </button>
          <button
            onClick={() => { setPenMode(m => !m); setLaserMode(false); }}
            className={`p-2 rounded-lg transition ${penMode ? 'bg-yellow-500 text-black' : 'text-white hover:text-yellow-400'}`}
            title="Drawing Pen"
          >
            <Pencil size={18} />
          </button>
          {penMode && (
            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0" />
          )}
          {penMode && (
            <button onClick={() => setPenStrokes([])} className="text-white text-xs hover:text-red-400 transition font-bold">Clear</button>
          )}
          <span className="h-5 w-px bg-white/30 mx-1" />
          <button onClick={exitPresenter} className="p-2 text-white hover:text-red-400 transition" title="Exit Presenter"><X size={20} /></button>
        </div>

        {/* Speaker notes strip at bottom right */}
        {presSlide?.speakerNotes && (
          <div className="absolute bottom-20 right-6 max-w-xs bg-black/60 backdrop-blur-sm text-white text-xs p-3 rounded-xl border border-white/20">
            <p className="font-bold text-[10px] uppercase text-white/60 mb-1">Speaker Notes</p>
            <p className="whitespace-pre-wrap leading-relaxed">{presSlide.speakerNotes}</p>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  EDITOR MODE
  // ─────────────────────────────────────────────────────────────────────────
  const slide = activeSlide();
  const theme = THEMES[slide?.theme || currentTheme] || THEMES.default;
  const selEl = selectedEl();

  return (
    <div className="slides-editor-container w-full h-full flex flex-col bg-[var(--db-page-bg)]">

      {/* ── HEADER ── */}
      <div className="bg-[var(--db-card-bg)] border-b border-[var(--db-sidebar-border)] px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Presentation size={20} />
          </div>
          <div>
            <input
              type="text"
              value={docName}
              onChange={async (e) => { setDocName(e.target.value); await api.put(`/it-suite/documents/${id}`, { name: e.target.value }); }}
              className="text-lg font-bold bg-transparent border-b border-transparent hover:border-amber-400 focus:border-amber-500 focus:outline-none text-[var(--db-text-main)] max-w-xs"
            />
            <p className="text-[11px] text-[var(--db-text-muted)] flex items-center gap-1 mt-0.5">
              <CheckCircle size={11} className="text-emerald-500" /> {saveStatus}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-xs font-bold rounded-xl hover:bg-[var(--db-btn-secondary-hover)] transition cursor-pointer">
            <Download size={14} /> Export PDF
          </button>
          <button
            onClick={() => { setActiveSidebar(s => s === 'ai' ? null : 'ai'); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${activeSidebar === 'ai' ? 'bg-blue-600 text-white border-blue-600' : 'bg-[var(--db-input-bg)] border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
          >
            <Sparkles size={14} /> AI Generate
          </button>
          <button
            onClick={() => { setActiveSidebar(s => s === 'notes' ? null : 'notes'); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${activeSidebar === 'notes' ? 'bg-amber-500 text-white border-amber-500' : 'bg-[var(--db-input-bg)] border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
          >
            <MessageSquare size={14} /> Notes
          </button>
          <button
            onClick={() => { setActiveSidebar(s => s === 'history' ? null : 'history'); loadVersions(); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${activeSidebar === 'history' ? 'bg-purple-600 text-white border-purple-600' : 'bg-[var(--db-input-bg)] border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
          >
            <History size={14} /> History
          </button>
          <button
            onClick={enterPresenter}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg transition cursor-pointer"
          >
            <Play size={14} /> Present
          </button>
          <button onClick={() => navigate('/it-suite')} className="px-3 py-2 border border-[var(--db-sidebar-border)] text-xs font-bold rounded-xl hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer">
            Close
          </button>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="bg-[var(--db-card-bg)] border-b border-[var(--db-sidebar-border)] px-4 py-1.5 flex flex-wrap items-center gap-2">
        {/* Add elements */}
        <span className="text-[10px] uppercase font-extrabold text-[var(--db-text-muted)]">Insert</span>
        <button onClick={() => addElement('text')} className="flex items-center gap-1 px-2 py-1 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg text-[10px] font-bold hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer"><Type size={12} /> Text</button>
        <button onClick={() => addElement('shape_rect')} className="flex items-center gap-1 px-2 py-1 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg text-[10px] font-bold hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer"><Square size={12} /> Box</button>
        <button onClick={() => addElement('shape_circle')} className="flex items-center gap-1 px-2 py-1 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg text-[10px] font-bold hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer"><Circle size={12} /> Circle</button>
        <button onClick={() => addElement('shape_line')} className="flex items-center gap-1 px-2 py-1 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg text-[10px] font-bold hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer"><Minus size={12} /> Line</button>

        <span className="h-4 w-px bg-[var(--db-sidebar-border)]" />

        {/* Theme */}
        <span className="text-[10px] uppercase font-extrabold text-[var(--db-text-muted)]">Theme</span>
        {Object.keys(THEMES).map(t => (
          <button
            key={t}
            onClick={() => { setCurrentTheme(t); updateSlide(activeSlideIdx, { theme: t, background: THEMES[t].bg }); }}
            title={t}
            className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${slide?.theme === t ? 'border-blue-500 scale-125' : 'border-transparent'}`}
            style={{ background: THEMES[t].bg, boxShadow: '0 0 0 1px #ccc' }}
          />
        ))}

        <span className="h-4 w-px bg-[var(--db-sidebar-border)]" />

        {/* Slide Background */}
        <span className="text-[10px] font-bold text-[var(--db-text-muted)]">BG</span>
        <input
          type="color"
          value={slide?.background || '#ffffff'}
          onChange={(e) => updateSlide(activeSlideIdx, { background: e.target.value })}
          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
        />

        {/* Transition */}
        <span className="h-4 w-px bg-[var(--db-sidebar-border)]" />
        <span className="text-[10px] uppercase font-extrabold text-[var(--db-text-muted)]">Transition</span>
        <select
          value={slide?.transition || 'fade'}
          onChange={(e) => updateSlide(activeSlideIdx, { transition: e.target.value })}
          className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[10px] rounded-lg p-1.5 focus:outline-none text-[var(--db-text-main)] font-semibold"
        >
          {Object.keys(TRANSITIONS).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>

        {/* Selected element format controls */}
        {selEl && selEl.type === 'text' && (
          <>
            <span className="h-4 w-px bg-[var(--db-sidebar-border)]" />
            <button onClick={() => updateElement(selEl.id, { bold: !selEl.bold })} className={`p-1.5 rounded-lg ${selEl.bold ? 'bg-amber-100 text-amber-700' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}><Bold size={14} /></button>
            <button onClick={() => updateElement(selEl.id, { italic: !selEl.italic })} className={`p-1.5 rounded-lg ${selEl.italic ? 'bg-amber-100 text-amber-700' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}><Italic size={14} /></button>
            <button onClick={() => updateElement(selEl.id, { underline: !selEl.underline })} className={`p-1.5 rounded-lg ${selEl.underline ? 'bg-amber-100 text-amber-700' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}><Underline size={14} /></button>
            <select value={selEl.fontSize || 18} onChange={(e) => updateElement(selEl.id, { fontSize: parseInt(e.target.value) })} className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[10px] rounded-lg p-1 focus:outline-none font-semibold">
              {[12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64].map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
            <input type="color" value={selEl.color || '#111111'} onChange={(e) => updateElement(selEl.id, { color: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" title="Text Color" />
          </>
        )}
        {selEl && selEl.type !== 'text' && (
          <>
            <span className="h-4 w-px bg-[var(--db-sidebar-border)]" />
            <span className="text-[10px] font-bold text-[var(--db-text-muted)]">Color</span>
            <input type="color" value={selEl.fillColor || '#2563eb'} onChange={(e) => updateElement(selEl.id, { fillColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
          </>
        )}
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SLIDE PANEL (left) ── */}
        <div className="w-44 bg-[var(--db-card-bg)] border-r border-[var(--db-sidebar-border)] flex flex-col overflow-y-auto custom-sidebar-scroll p-2 gap-2 flex-shrink-0">
          {slides.map((s, idx) => {
            // Thumbnail: outer div is 160px wide, 16:9 = 90px tall
            // We render the full 800×450 slide inside, then scale down by 160/800 = 0.2
            const THUMB_W = 160;
            const THUMB_H = 90;
            const SLIDE_W = 800;
            const thumbScale = THUMB_W / SLIDE_W;
            return (
              <div
                key={s.id}
                style={{ width: THUMB_W, height: THUMB_H, position: 'relative', flexShrink: 0 }}
                className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${activeSlideIdx === idx ? 'border-amber-500 shadow-lg' : 'border-transparent hover:border-amber-300'}`}
                onClick={() => { setActiveSlideIdx(idx); setSelectedElId(null); }}
              >
                {/* Scaled-down slide */}
                <div
                  style={{
                    transform: `scale(${thumbScale})`,
                    transformOrigin: 'top left',
                    width: SLIDE_W,
                    height: SLIDE_W * (9 / 16),
                    pointerEvents: 'none',
                  }}
                >
                  {renderSlide(s, { scale: 1 })}
                </div>

                {/* Slide number badge */}
                <div className="absolute top-1 left-1.5 text-[9px] font-extrabold text-white bg-black/50 rounded px-1 z-10">{idx + 1}</div>

                {/* Reorder buttons */}
                <div className="absolute top-1 right-1 flex gap-0.5 z-10">
                  <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, -1); }} className="p-0.5 bg-black/40 text-white rounded hover:bg-black/70 transition"><ChevronUp size={10} /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, 1); }} className="p-0.5 bg-black/40 text-white rounded hover:bg-black/70 transition"><ChevronDown size={10} /></button>
                </div>

                {/* Slide action buttons */}
                <div className="absolute bottom-1 right-1 flex gap-0.5 z-10">
                  <button onClick={(e) => { e.stopPropagation(); duplicateSlide(idx); }} className="p-0.5 bg-black/40 text-white rounded hover:bg-black/70 transition"><Copy size={10} /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }} className="p-0.5 bg-red-500/80 text-white rounded hover:bg-red-600 transition"><X size={10} /></button>
                </div>
              </div>
            );
          })}

          {/* Add slide button */}
          <button
            onClick={addSlide}
            className="w-full py-3 border-2 border-dashed border-[var(--db-sidebar-border)] hover:border-amber-400 rounded-xl text-xs font-bold text-[var(--db-text-muted)] hover:text-amber-500 transition flex items-center justify-center gap-1 cursor-pointer flex-shrink-0"
          >
            <Plus size={14} /> Slide
          </button>
        </div>

        {/* ── CANVAS (center) ── */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-zinc-100 dark:bg-zinc-900">
          <div style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)', borderRadius: 16, overflow: 'hidden' }}>
            {renderSlide(slide, { scale: 1, interactive: true })}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <AnimatePresence>
          {activeSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[var(--db-card-bg)] border-l border-[var(--db-sidebar-border)] overflow-y-auto p-5 flex-shrink-0 custom-sidebar-scroll"
            >
              {/* AI Generation Panel */}
              {activeSidebar === 'ai' && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--db-sidebar-border)] pb-2 text-blue-500">
                    <Sparkles size={16} /> AI Presentation Generator
                  </h3>
                  <p className="text-[10px] text-[var(--db-text-muted)]">Enter your topic and the AI will generate a complete slide deck with titles and bullet points.</p>
                  <textarea
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. Introduction to Machine Learning, History of Ancient Rome..."
                    rows={4}
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl py-2 px-3 text-xs text-[var(--db-text-main)] focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <div>
                    <label className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase block mb-1">Apply Theme</label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys(THEMES).map(t => (
                        <button key={t} onClick={() => setCurrentTheme(t)} className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition cursor-pointer capitalize ${currentTheme === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-[var(--db-input-bg)] border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)]'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-60"
                  >
                    {aiLoading ? '⏳ Generating slides…' : '✨ Generate Presentation'}
                  </button>
                  <p className="text-[9px] text-[var(--db-text-muted)] text-center">⚠️ This will replace all existing slides.</p>
                </div>
              )}

              {/* Speaker Notes Panel */}
              {activeSidebar === 'notes' && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--db-sidebar-border)] pb-2 text-amber-500">
                    <MessageSquare size={16} /> Speaker Notes
                  </h3>
                  <p className="text-[10px] text-[var(--db-text-muted)]">Slide {activeSlideIdx + 1} of {slides.length}</p>
                  <textarea
                    value={speakerNotes}
                    onChange={(e) => saveNotes(e.target.value)}
                    placeholder="Write speaker notes here. These appear in Presenter Mode."
                    rows={10}
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl py-2 px-3 text-xs text-[var(--db-text-main)] focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>
              )}

              {/* Version History Panel */}
              {activeSidebar === 'history' && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--db-sidebar-border)] pb-2 text-purple-500">
                    <History size={16} /> Version History
                  </h3>
                  {versions.length === 0 ? (
                    <p className="text-xs text-[var(--db-text-muted)] text-center py-8">No previous versions found.</p>
                  ) : versions.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => restoreVersion(v)}
                      className="p-3 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl cursor-pointer hover:border-purple-400 transition"
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Version {v.version_number}</span>
                        <span className="text-[10px] text-[var(--db-text-muted)]">{new Date(v.created_at).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[10px] text-[var(--db-text-muted)]">By: {v.author_name || 'Autosave'}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
