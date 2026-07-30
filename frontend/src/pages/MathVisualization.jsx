import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import GlobalBackButton from '../components/GlobalBackButton';
import {
  BrainCircuit, Play, Pause, SkipBack, SkipForward, RotateCcw,
  Mic, MicOff, Upload, FileText, Keyboard, Copy, Download,
  ChevronDown, ChevronRight, Zap, Target, BookOpen, Lightbulb,
  Star, Clock, Cpu, TrendingUp, CheckCircle2, AlertCircle,
  X, Plus, Settings2, FastForward, Volume2, Camera
} from 'lucide-react';
import axios from 'axios';
import './DashboardTheme.css';

/* ─────────────────────────────────────────────────────────────────────────
   LATEX RENDERER  (Simple inline renderer without external deps)
───────────────────────────────────────────────────────────────────────── */
function LatexRender({ tex = '', className = '' }) {
  const rendered = useMemo(() => {
    if (!tex) return '';
    return tex
      .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\sqrt/g, '√')
      .replace(/\\approx/g, '≈')
      .replace(/\\pm/g, '±')
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\infty/g, '∞')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\rawText/g, '')
      .replace(/\\value/g, '')
      .replace(/\\varepsilon/g, 'ε')
      .replace(/\\epsilon/g, 'ε')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\int/g, '∫')
      .replace(/\\sum/g, 'Σ')
      .replace(/\\prod/g, 'Π')
      .replace(/\\partial/g, '∂')
      .replace(/\\nabla/g, '∇')
      .replace(/\\in/g, '∈')
      .replace(/\\subset/g, '⊂')
      .replace(/\\cup/g, '∪')
      .replace(/\\cap/g, '∩')
      .replace(/\\forall/g, '∀')
      .replace(/\\exists/g, '∃')
      .replace(/\\Rightarrow/g, '⟹')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\left/g, '')
      .replace(/\\right/g, '')
      .replace(/\\arrow/g, '→')
      .replace(/\\checkmark/g, '✓')
      .replace(/\\text\{([^}]*)\}/g, '$1')
      .replace(/\{([^}]*)\}/g, '$1')
      .replace(/\^([a-zA-Z0-9]+)/g, '^$1')
      .replace(/_([a-zA-Z0-9]+)/g, '_$1')
      .replace(/\\\\/g, '')
      .replace(/\\/g, '');
  }, [tex]);

  return <span className={className} style={{ fontFamily: "serif" }}>{rendered}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS GRAPH ENGINE
───────────────────────────────────────────────────────────────────────── */
function GraphCanvas({ graphData, isDark }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ offsetX: 0, offsetY: 0, scale: 60, dragging: false, lastX: 0, lastY: 0 });

  const evalExpr = useCallback((expr, x) => {
    try {
      const cleanExpr = expr
        .replace(/Math\./g, '')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/pow/g, 'Math.pow')
        .replace(/exp/g, 'Math.exp')
        .replace(/log/g, 'Math.log')
        .replace(/pi/g, 'Math.PI')
        .replace(/E/g, 'Math.E')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/x\^2/g, 'x*x')
        .replace(/x\^3/g, 'x*x*x');
      return new Function('x', 'Math', '"use strict"; return (' + cleanExpr + ');')(x, Math);
    } catch { return NaN; }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const { offsetX, offsetY, scale } = stateRef.current;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = isDark ? '#0d0b1e' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Grid
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const originX = W / 2 + offsetX;
    const originY = H / 2 + offsetY;
    const step = scale;
    for (let x = originX % step; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = originY % step; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Axes
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(W, originY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, H); ctx.stroke();

    // Axis arrows
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.moveTo(W - 8, originY - 4); ctx.lineTo(W, originY); ctx.lineTo(W - 8, originY + 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(originX - 4, 8); ctx.lineTo(originX, 0); ctx.lineTo(originX + 4, 8); ctx.fill();

    // Axis labels
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('x', W - 14, originY - 8);
    ctx.fillText('y', originX + 8, 14);

    // Tick marks
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    const tickRange = Math.ceil(W / step) + 2;
    for (let i = -tickRange; i <= tickRange; i++) {
      if (i === 0) continue;
      const px = originX + i * step;
      ctx.beginPath(); ctx.moveTo(px, originY - 4); ctx.lineTo(px, originY + 4); ctx.stroke();
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
      ctx.fillText(i, px - 4, originY + 16);
    }
    const tickRangeY = Math.ceil(H / step) + 2;
    for (let i = -tickRangeY; i <= tickRangeY; i++) {
      if (i === 0) continue;
      const py = originY - i * step;
      ctx.beginPath(); ctx.moveTo(originX - 4, py); ctx.lineTo(originX + 4, py); ctx.stroke();
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
      ctx.fillText(i, originX + 7, py + 4);
    }

    // Shaded regions
    if (graphData?.shadedRegions) {
      graphData.shadedRegions.forEach(region => {
        const { fromX, toX, color } = region;
        if (graphData.equations && graphData.equations[0]) {
          const expr = graphData.equations[0].expression;
          ctx.beginPath();
          let started = false;
          const pxStart = originX + fromX * scale;
          const pxEnd = originX + toX * scale;
          ctx.moveTo(pxStart, originY);
          for (let px = pxStart; px <= pxEnd; px += 1) {
            const xVal = (px - originX) / scale;
            const yVal = evalExpr(expr, xVal);
            if (!isFinite(yVal) || isNaN(yVal)) continue;
            const py = originY - yVal * scale;
            if (!started) { ctx.lineTo(px, py); started = true; }
            else ctx.lineTo(px, py);
          }
          ctx.lineTo(pxEnd, originY);
          ctx.closePath();
          ctx.fillStyle = color || 'rgba(16, 185, 129, 0.15)';
          ctx.fill();
        }
      });
    }

    // Plot equations
    if (graphData?.equations) {
      graphData.equations.forEach(eq => {
        const { expression, color } = eq;
        ctx.strokeStyle = color || '#10b981';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = color || '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        let penDown = false;
        for (let px = 0; px < W; px += 1) {
          const xVal = (px - originX) / scale;
          const yVal = evalExpr(expression, xVal);
          if (!isFinite(yVal) || isNaN(yVal) || Math.abs(yVal) > 1e5) { penDown = false; continue; }
          const py = originY - yVal * scale;
          if (!penDown) { ctx.moveTo(px, py); penDown = true; }
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }

    // Plot points
    if (graphData?.points) {
      graphData.points.forEach(pt => {
        const px = originX + pt.x * scale;
        const py = originY - pt.y * scale;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = pt.color || '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = isDark ? '#fff' : '#1e293b';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(pt.label || `(${pt.x}, ${pt.y})`, px + 10, py - 8);
      });
    }
  }, [graphData, isDark, evalExpr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    draw();
  }, [draw, graphData]);

  // Interaction handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    stateRef.current.scale = Math.max(20, Math.min(300, stateRef.current.scale * delta));
    draw();
  }, [draw]);

  const handleMouseDown = useCallback((e) => {
    stateRef.current.dragging = true;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!stateRef.current.dragging) return;
    stateRef.current.offsetX += e.clientX - stateRef.current.lastX;
    stateRef.current.offsetY += e.clientY - stateRef.current.lastY;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
    draw();
  }, [draw]);

  const handleMouseUp = useCallback(() => { stateRef.current.dragging = false; }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing rounded-xl"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button onClick={() => { stateRef.current.scale *= 1.2; draw(); }} className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur text-white text-xs font-bold hover:bg-white/20 transition flex items-center justify-center">+</button>
        <button onClick={() => { stateRef.current.scale /= 1.2; draw(); }} className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur text-white text-xs font-bold hover:bg-white/20 transition flex items-center justify-center">−</button>
        <button onClick={() => { stateRef.current.scale = 60; stateRef.current.offsetX = 0; stateRef.current.offsetY = 0; draw(); }} className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur text-white text-xs font-bold hover:bg-white/20 transition flex items-center justify-center">⌖</button>
      </div>
      <div className="absolute bottom-3 left-3 text-xs text-white/40 select-none">Scroll to zoom · Drag to pan</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MATH KEYBOARD
───────────────────────────────────────────────────────────────────────── */
const MATH_KEYS = [
  ['x²', 'x³', 'xⁿ', '√', '∫', 'Σ', 'π', '∞'],
  ['sin(', 'cos(', 'tan(', 'ln(', 'log(', 'e^', '|x|', 'd/dx'],
  ['α', 'β', 'γ', 'θ', 'λ', 'μ', 'σ', 'ω'],
  ['≤', '≥', '≠', '±', '÷', '×', '(', ')'],
  ['lim ', 'lim x→0 ', 'lim x→∞ ', 'integrate ', 'differentiate ', 'Matrix(', '→', '←'],
];
const KEY_INSERT_MAP = {
  'x²': '^2', 'x³': '^3', 'xⁿ': '^', '√': 'sqrt(', '∫': 'integrate ',
  'Σ': 'sum ', 'π': 'pi', '∞': 'infinity', 'e^': 'e^(', '|x|': 'abs(',
  'd/dx': 'differentiate ', '≤': '<=', '≥': '>=', '≠': '!=', '±': '+-',
  '÷': '/', '×': '*',
};

function MathKeyboard({ onInsert, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      className="absolute bottom-full left-0 mb-2 z-50 p-4 rounded-2xl border border-purple-500/30 bg-[#0d0a20]/95 backdrop-blur-xl shadow-2xl shadow-purple-900/40"
      style={{ minWidth: 420 }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Math Keyboard</span>
        <button onClick={onClose} className="text-white/40 hover:text-white transition"><X size={14} /></button>
      </div>
      <div className="space-y-1.5">
        {MATH_KEYS.map((row, ri) => (
          <div key={ri} className="flex flex-wrap gap-1.5">
            {row.map(key => (
              <button
                key={key}
                onClick={() => onInsert(KEY_INSERT_MAP[key] || key)}
                className="px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-purple-500/25 border border-white/10 hover:border-purple-400/40 text-white text-xs font-mono transition-all duration-150 active:scale-95"
              >{key}</button>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP CARD
───────────────────────────────────────────────────────────────────────── */
function StepCard({ step, index, isActive, isDark, animDelay }) {
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isActive) { setTyped(''); setDone(false); return; }
    const full = step.explanation || '';
    let i = 0;
    setTyped('');
    setDone(false);
    const iv = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) { clearInterval(iv); setDone(true); }
    }, 18);
    return () => clearInterval(iv);
  }, [isActive, step.explanation]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animDelay * 0.1, type: 'spring', stiffness: 120 }}
      className={`relative rounded-2xl border p-5 transition-all duration-300 ${
        isActive
          ? 'border-emerald-500/60 bg-emerald-500/8 shadow-lg shadow-emerald-500/10'
          : isDark
            ? 'border-white/10 bg-white/4 hover:border-white/20'
            : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-400 to-teal-500" />
      )}
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
          isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/10 text-white/50'
        }`}>
          {step.number}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm mb-3 ${isActive ? 'text-emerald-300' : 'text-white/70'}`}>{step.title}</h4>
          
          {/* Equation rows */}
          <div className="space-y-2 mb-3">
            {step.formula && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-purple-400 font-bold w-20 flex-shrink-0 pt-0.5">Formula</span>
                <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-sm font-mono">
                  <LatexRender tex={step.formula} />
                </div>
              </div>
            )}
            {step.substitution && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-blue-400 font-bold w-20 flex-shrink-0 pt-0.5">Substitute</span>
                <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm font-mono">
                  <LatexRender tex={step.substitution} />
                </div>
              </div>
            )}
            {step.calculation && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-amber-400 font-bold w-20 flex-shrink-0 pt-0.5">Calculate</span>
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm font-mono">
                  <LatexRender tex={step.calculation} />
                </div>
              </div>
            )}
            {step.result && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-emerald-400 font-bold w-20 flex-shrink-0 pt-0.5">Result</span>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm font-bold font-mono">
                  <LatexRender tex={step.result} />
                </div>
              </div>
            )}
          </div>

          {/* Explanation */}
          {isActive && (
            <p className="text-xs text-white/65 leading-relaxed border-t border-white/10 pt-3 mt-2">
              {typed}<span className={`inline-block w-0.5 h-3 bg-emerald-400 ml-0.5 ${done ? 'opacity-0' : 'animate-pulse'}`} />
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function MathVisualization() {
  const { isDarkMode: isDark } = useTheme();

  // Input state
  const [problem, setProblem] = useState('');
  const [explanationMode, setExplanationMode] = useState('Intermediate');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);

  // Result state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Playback state
  const [playback, setPlayback] = useState('IDLE'); // IDLE | PLAYING | PAUSED | DONE
  const [currentStep, setCurrentStep] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const playbackRef = useRef(null);

  // Voice state
  const [voiceActive, setVoiceActive] = useState(false);
  const recognitionRef = useRef(null);

  // History state
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mathHistory') || '[]'); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);

  // PDF state
  const [pdfProblems, setPdfProblems] = useState([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('steps'); // steps | graph | metrics | suggestions

  const inputRef = useRef(null);

  // ── Playback engine ──────────────────────────────────────
  useEffect(() => {
    if (playback !== 'PLAYING' || !result?.steps) return;
    if (currentStep >= result.steps.length - 1) {
      setPlayback('DONE');
      return;
    }
    const delay = (2200 / speed);
    playbackRef.current = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, delay);
    return () => clearTimeout(playbackRef.current);
  }, [playback, currentStep, result, speed]);

  const handlePlay = () => {
    if (playback === 'DONE') { setCurrentStep(-1); setTimeout(() => { setCurrentStep(0); setPlayback('PLAYING'); }, 50); return; }
    if (playback === 'IDLE') { setCurrentStep(0); setPlayback('PLAYING'); return; }
    if (playback === 'PAUSED') { setPlayback('PLAYING'); return; }
    setPlayback('PAUSED');
  };

  const handleNext = () => {
    if (!result?.steps) return;
    setPlayback('PAUSED');
    setCurrentStep(p => Math.min(p + 1, result.steps.length - 1));
  };

  const handlePrev = () => {
    setPlayback('PAUSED');
    setCurrentStep(p => Math.max(p - 1, 0));
  };

  const handleReplay = () => {
    clearTimeout(playbackRef.current);
    setCurrentStep(-1);
    setPlayback('IDLE');
    setTimeout(() => { setCurrentStep(0); setPlayback('PLAYING'); }, 100);
  };

  // ── Solve ─────────────────────────────────────────────────
  const handleSolve = async (q = null) => {
    const query = q || problem.trim();
    if (!query) { setError('Please enter a mathematical problem to solve.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    setPlayback('IDLE');
    setCurrentStep(-1);
    setActiveTab('steps');
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(API + '/api/math/solve', { problem: query, explanationMode });
      if (!res.data.validation?.isValid && res.data.validation?.message) {
        setError(res.data.validation.message);
        setResult(res.data);
      } else {
        setResult(res.data);
        const entry = { problem: query, topic: res.data.analysis?.topic, ts: Date.now(), mode: explanationMode };
        const newHistory = [entry, ...history.filter(h => h.problem !== query)].slice(0, 20);
        setHistory(newHistory);
        localStorage.setItem('mathHistory', JSON.stringify(newHistory));
        setTimeout(() => { setCurrentStep(0); setPlayback('PLAYING'); }, 400);
      }
    } catch (err) {
      setError('Failed to connect to server. Check your connection or backend service.');
    } finally {
      setLoading(false);
    }
  };

  // ── Voice ─────────────────────────────────────────────────
  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Voice input not supported in this browser. Try Chrome.'); return;
    }
    if (voiceActive) { recognitionRef.current?.stop(); setVoiceActive(false); return; }
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    const r = new SR();
    r.lang = 'en-US'; r.interimResults = false;
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      const cleaned = t
        .replace(/square/gi, '^2').replace(/cube/gi, '^3').replace(/squared/gi, '^2')
        .replace(/cubed/gi, '^3').replace(/plus/gi, '+').replace(/minus/gi, '-')
        .replace(/times/gi, '*').replace(/divided by/gi, '/').replace(/equals/gi, '=')
        .replace(/to the power of/gi, '^').replace(/pi/gi, 'pi').replace(/infinity/gi, 'infinity')
        .replace(/sine/gi, 'sin').replace(/cosine/gi, 'cos').replace(/tangent/gi, 'tan');
      setProblem(cleaned);
      setVoiceActive(false);
    };
    r.onerror = () => setVoiceActive(false);
    r.onend = () => setVoiceActive(false);
    recognitionRef.current = r;
    r.start();
    setVoiceActive(true);
  };

  // ── Image OCR ─────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      setLoading(true);
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.post(API + '/api/math/ocr', { image: ev.target.result });
        if (res.data.equation) { setProblem(res.data.equation); inputRef.current?.focus(); }
      } catch { setError('OCR failed. Please try typing the equation.'); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  // ── PDF ───────────────────────────────────────────────────
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(API + '/api/math/extract-pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPdfProblems(res.data.problems || []);
      setShowPdfModal(true);
    } catch { setError('PDF extraction failed.'); }
    finally { setPdfLoading(false); }
  };

  // ── Copy Answer ───────────────────────────────────────────
  const handleCopyAnswer = () => {
    if (!result?.answers) return;
    navigator.clipboard.writeText(result.answers.join(', '));
  };

  // ── Download PDF ──────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!result) return;
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('EDUVERSE AI — Math Solution', 14, 22);
      doc.setFontSize(12);
      doc.text('Problem: ' + problem, 14, 35);
      doc.text('Topic: ' + (result.analysis?.topic || ''), 14, 45);
      doc.text('Algorithm: ' + (result.analysis?.algorithm || ''), 14, 55);
      doc.text('', 14, 65);
      doc.text('Steps:', 14, 72);
      let y = 82;
      (result.steps || []).forEach((step, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.text('Step ' + step.number + ': ' + step.title, 14, y); y += 8;
        doc.setFontSize(9);
        doc.text('Formula: ' + (step.formula || ''), 18, y); y += 6;
        doc.text('Explanation: ' + (step.explanation || ''), 18, y, { maxWidth: 175 }); y += 12;
      });
      if (result.answers?.length) {
        doc.setFontSize(13);
        doc.text('Final Answer: ' + result.answers.join(', '), 14, y + 5);
      }
      doc.save('math-solution-' + Date.now() + '.pdf');
    } catch { setError('PDF download requires browser PDF support.'); }
  };

  // ── Insert from keyboard ─────────────────────────────────
  const handleKeyboardInsert = (val) => {
    const el = inputRef.current;
    if (!el) { setProblem(p => p + val); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = problem.slice(0, start) + val + problem.slice(end);
    setProblem(newVal);
    setTimeout(() => { el.setSelectionRange(start + val.length, start + val.length); el.focus(); }, 0);
  };

  const MODES = ['Beginner', 'Intermediate', 'Engineering', 'Competitive Exams', 'Professor Mode', 'Only Formula', 'Quick Answer'];
  const EXAMPLE_PROBLEMS = [
    { label: 'Quadratic', q: 'x^2 + 4x + 4 = 0' },
    { label: 'Bisection', q: 'x^3 - x - 1 = 0' },
    { label: 'Integral', q: 'integrate x^2 sin(x)' },
    { label: 'Derivative', q: 'differentiate e^(x^2)' },
    { label: 'Limit', q: 'lim x→0 sinx/x' },
    { label: 'Matrix', q: 'determinant of matrix [[2,3],[1,4]]' },
  ];

  // Topology badge color
  const complexityColor = {
    Easy: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    Medium: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    Hard: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
  };

  return (
    <div className={'min-h-screen transition-colors duration-300 ' + (isDark ? 'bg-[#070313] text-slate-100' : 'bg-slate-50 text-slate-900')}>
      
      {/* AMBIENT BACKGROUND GLOWS */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-purple-600/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-emerald-600/6 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-blue-600/6 rounded-full blur-[100px]" />
        </div>
      )}

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        
        {/* HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <GlobalBackButton />
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <BrainCircuit size={20} className="text-white" />
                </div>
                <div>
                  <h1 className={'text-2xl font-black tracking-tight leading-tight ' + (isDark ? 'bg-gradient-to-r from-purple-300 via-indigo-300 to-cyan-300 bg-clip-text text-transparent' : 'text-slate-900')}>
                    AI Mathematics Laboratory
                  </h1>
                  <p className="text-xs text-white/40 mt-0.5">Wolfram Alpha × GeoGebra × Symbolab — Powered by AI</p>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} className="px-3 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white/60 hover:text-white text-xs font-medium transition flex items-center gap-2">
            <Clock size={13} /> History
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="space-y-6">

            {/* INPUT PANEL */}
            <div className={'rounded-3xl border p-6 ' + (isDark ? 'bg-white/4 border-white/10 backdrop-blur-sm' : 'bg-white border-slate-200 shadow-lg shadow-slate-100')}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">AI Input Engine</span>
              </div>

              {/* Main input */}
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSolve(); }}
                  placeholder="Type any mathematical equation, problem or expression...&#10;&#10;Examples: x³ − x − 1 = 0 · integrate x²sin(x) · lim x→0 sin(x)/x · differentiate e^(x²)"
                  rows={4}
                  className={'w-full rounded-2xl px-5 py-4 text-sm font-mono resize-none focus:outline-none transition-all duration-200 leading-relaxed ' + (
                    isDark
                      ? 'bg-[#0d0920] border border-purple-500/20 text-purple-100 placeholder:text-white/20 focus:border-purple-400/50 focus:shadow-lg focus:shadow-purple-500/10'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-300 focus:shadow-lg focus:shadow-purple-100'
                  )}
                />
                {showKeyboard && (
                  <AnimatePresence>
                    <MathKeyboard onInsert={handleKeyboardInsert} onClose={() => setShowKeyboard(false)} />
                  </AnimatePresence>
                )}
              </div>

              {/* Example chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {EXAMPLE_PROBLEMS.map(ex => (
                  <button key={ex.label} onClick={() => { setProblem(ex.q); inputRef.current?.focus(); }} className="px-3 py-1 rounded-full bg-white/6 hover:bg-purple-500/15 border border-white/10 hover:border-purple-400/30 text-xs text-white/50 hover:text-purple-300 transition-all duration-150">
                    {ex.label}
                  </button>
                ))}
              </div>

              {/* Controls row */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {/* Math Keyboard */}
                <button onClick={() => setShowKeyboard(!showKeyboard)} title="Math Keyboard" className={'p-2.5 rounded-xl border transition-all duration-150 ' + (showKeyboard ? 'bg-purple-500/20 border-purple-400/40 text-purple-300' : 'bg-white/6 border-white/10 text-white/50 hover:bg-white/10 hover:text-white')}>
                  <Keyboard size={15} />
                </button>

                {/* Voice */}
                <button onClick={handleVoice} title="Voice Input" className={'p-2.5 rounded-xl border transition-all duration-150 ' + (voiceActive ? 'bg-rose-500/20 border-rose-400/40 text-rose-300 animate-pulse' : 'bg-white/6 border-white/10 text-white/50 hover:bg-white/10 hover:text-white')}>
                  {voiceActive ? <MicOff size={15} /> : <Mic size={15} />}
                </button>

                {/* Image OCR */}
                <label title="Upload Image" className="p-2.5 rounded-xl border border-white/10 bg-white/6 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-150 cursor-pointer">
                  <Camera size={15} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                {/* PDF */}
                <label title="Upload PDF" className="p-2.5 rounded-xl border border-white/10 bg-white/6 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-150 cursor-pointer">
                  <FileText size={15} />
                  <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
                </label>

                {/* Explanation Mode */}
                <div className="relative">
                  <button onClick={() => setShowModeMenu(!showModeMenu)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-xs text-white/60 hover:text-white transition-all">
                    <Settings2 size={12} /> {explanationMode} <ChevronDown size={10} />
                  </button>
                  <AnimatePresence>
                    {showModeMenu && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute top-full mt-1 left-0 z-50 bg-[#0d0920] border border-purple-500/30 rounded-xl overflow-hidden shadow-xl min-w-40">
                        {MODES.map(m => (
                          <button key={m} onClick={() => { setExplanationMode(m); setShowModeMenu(false); }} className={'w-full text-left px-4 py-2.5 text-xs hover:bg-purple-500/15 transition ' + (m === explanationMode ? 'text-purple-300 bg-purple-500/10' : 'text-white/60')}>
                            {m}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* SOLVE BUTTON */}
                <button
                  onClick={() => handleSolve()}
                  disabled={loading || !problem.trim()}
                  className="ml-auto flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-700/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Solving...</>
                  ) : (
                    <><Zap size={15} /> Solve</>
                  )}
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-rose-500/30 bg-rose-500/8 p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-300">{error}</p>
                  <button onClick={() => setError('')} className="ml-auto text-white/30 hover:text-white"><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RESULT SECTION */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                  {/* AI Analysis Banner */}
                  <div className={'rounded-2xl border p-5 ' + (isDark ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200')}>
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <BrainCircuit size={14} className="text-purple-400" />
                          <span className="text-xs text-white/40">Topic</span>
                          <span className="text-xs font-bold text-purple-300 px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20">{result.analysis?.topic}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cpu size={14} className="text-blue-400" />
                          <span className="text-xs text-white/40">Algorithm</span>
                          <span className="text-xs font-bold text-blue-300 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">{result.analysis?.algorithm}</span>
                        </div>
                        <div className={'text-xs font-bold px-2 py-0.5 rounded-lg border ' + (complexityColor[result.analysis?.complexity] || complexityColor.Easy)}>
                          {result.analysis?.complexity}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/40">
                          <Target size={11} className="text-emerald-400" />
                          <span className="text-emerald-400 font-bold">{result.analysis?.confidence}%</span> confidence
                        </div>
                      </div>

                      {/* Playback Controls */}
                      <div className="flex items-center gap-2">
                        <button onClick={handlePrev} disabled={currentStep <= 0} className="p-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white/60 hover:text-white disabled:opacity-30 transition"><SkipBack size={13} /></button>
                        <button onClick={handlePlay} className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 transition active:scale-95">
                          {playback === 'PLAYING' ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button onClick={handleNext} disabled={!result.steps || currentStep >= result.steps.length - 1} className="p-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white/60 hover:text-white disabled:opacity-30 transition"><SkipForward size={13} /></button>
                        <button onClick={handleReplay} className="p-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white/60 hover:text-white transition"><RotateCcw size={13} /></button>
                        {/* Speed */}
                        <select value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="px-2 py-1 rounded-lg bg-white/8 border border-white/10 text-white/60 text-xs focus:outline-none">
                          {[0.25, 0.5, 1, 1.5, 2].map(s => <option key={s} value={s}>{s}×</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {result.steps && (
                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-xs text-white/30">{Math.max(0, currentStep + 1)}/{result.steps.length}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                            animate={{ width: result.steps.length ? (currentStep + 1) / result.steps.length * 100 + '%' : '0%' }}
                            transition={{ type: 'spring', stiffness: 100 }}
                          />
                        </div>
                        {playback === 'DONE' && <CheckCircle2 size={14} className="text-emerald-400" />}
                      </div>
                    )}
                  </div>

                  {/* TAB SWITCHER */}
                  <div className="flex gap-1 p-1 rounded-xl bg-white/6 border border-white/10 w-fit">
                    {[['steps', 'Steps'], ['graph', 'Graph'], ['metrics', 'Metrics'], ['suggestions', 'AI Tips']].map(([id, label]) => (
                      <button key={id} onClick={() => setActiveTab(id)} className={'px-4 py-2 rounded-lg text-xs font-bold transition-all ' + (activeTab === id ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-white/40 hover:text-white/70')}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* TAB CONTENT */}
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>

                      {/* ── STEPS TAB ─── */}
                      {activeTab === 'steps' && (
                        <div className="space-y-3">
                          {(result.steps || []).map((step, i) => (
                            <StepCard key={i} step={step} index={i} isActive={i === currentStep} isDark={isDark} animDelay={i} />
                          ))}
                        </div>
                      )}

                      {/* ── GRAPH TAB ─── */}
                      {activeTab === 'graph' && (
                        <div className={'rounded-2xl border overflow-hidden ' + (isDark ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200')} style={{ height: 440 }}>
                          {result.graph && result.graph.type !== 'none' ? (
                            <GraphCanvas graphData={result.graph} isDark={isDark} />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
                              <TrendingUp size={40} className="opacity-20" />
                              <p className="text-sm">No graph available for this problem type.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── METRICS TAB ─── */}
                      {activeTab === 'metrics' && result.liveMetrics && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            { label: 'Convergence', value: result.liveMetrics.convergenceRate, icon: TrendingUp, color: 'purple' },
                            { label: 'Tolerance', value: result.liveMetrics.tolerance, icon: Target, color: 'blue' },
                            { label: 'Memory', value: result.liveMetrics.memoryEstimate, icon: Cpu, color: 'emerald' },
                            { label: 'Complexity', value: result.liveMetrics.timeComplexity, icon: Zap, color: 'amber' },
                          ].map(m => (
                            <div key={m.label} className={'rounded-2xl border p-5 ' + (isDark ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200')}>
                              <m.icon size={18} className={'text-' + m.color + '-400 mb-3'} />
                              <p className="text-xs text-white/40 mb-1">{m.label}</p>
                              <p className="text-sm font-bold text-white">{m.value}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── SUGGESTIONS TAB ─── */}
                      {activeTab === 'suggestions' && result.suggestions && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { title: 'Similar Questions', items: result.suggestions.similarQuestions, icon: BookOpen, color: 'purple' },
                            { title: 'Practice Problems', items: result.suggestions.practiceProblems, icon: Target, color: 'blue' },
                            { title: 'Shortcuts & Tricks', items: result.suggestions.shortcuts, icon: Zap, color: 'amber' },
                            { title: 'Exam Tips', items: result.suggestions.examTips, icon: Star, color: 'emerald' },
                            { title: 'Common Mistakes', items: result.suggestions.commonMistakes, icon: AlertCircle, color: 'rose' },
                          ].map(section => (
                            section.items?.length > 0 && (
                              <div key={section.title} className={'rounded-2xl border p-5 ' + (isDark ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200')}>
                                <div className="flex items-center gap-2 mb-3">
                                  <section.icon size={14} className={'text-' + section.color + '-400'} />
                                  <span className={'text-xs font-bold uppercase tracking-wider text-' + section.color + '-400'}>{section.title}</span>
                                </div>
                                <ul className="space-y-2">
                                  {section.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-white/60 leading-relaxed">
                                      <ChevronRight size={10} className={'text-' + section.color + '-400 mt-1 flex-shrink-0'} />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────────── */}
          <div className="space-y-5">

            {/* SOLUTION CARD */}
            <AnimatePresence>
              {result?.answers && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Final Answer</span>
                  </div>
                  <div className="space-y-2 mb-5">
                    {result.answers.map((ans, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-lg font-bold text-emerald-300 font-mono">
                          <LatexRender tex={ans} />
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopyAnswer} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 text-xs text-white/60 hover:text-white transition">
                      <Copy size={12} /> Copy
                    </button>
                    <button onClick={handleDownloadPdf} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 text-xs text-white/60 hover:text-white transition">
                      <Download size={12} /> PDF
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* HISTORY PANEL */}
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={'rounded-3xl border p-5 ' + (isDark ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200')}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2"><Clock size={12} /> Recent History</span>
                    <button onClick={() => { setHistory([]); localStorage.removeItem('mathHistory'); }} className="text-xs text-white/30 hover:text-rose-400 transition">Clear</button>
                  </div>
                  {history.length === 0 ? (
                    <p className="text-xs text-white/30 text-center py-6">No history yet. Solve a problem to get started.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {history.map((h, i) => (
                        <button key={i} onClick={() => { setProblem(h.problem); setShowHistory(false); handleSolve(h.problem); }} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/8 transition group">
                          <p className="text-xs font-mono text-white/70 group-hover:text-white truncate">{h.problem}</p>
                          <p className="text-[10px] text-white/30 mt-0.5">{h.topic} · {h.mode}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMPTY STATE */}
            {!result && !loading && (
              <div className={'rounded-3xl border p-8 text-center ' + (isDark ? 'bg-white/3 border-white/8' : 'bg-white border-slate-200')}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
                  <BrainCircuit size={28} className="text-purple-400" />
                </div>
                <h3 className="font-bold text-white/70 mb-2">AI Math Engine Ready</h3>
                <p className="text-xs text-white/35 leading-relaxed mb-6">Type any mathematical problem — from basic algebra to advanced numerical methods. The AI automatically identifies the topic, selects the optimal algorithm, and walks through every step.</p>
                <div className="space-y-2">
                  {EXAMPLE_PROBLEMS.map(ex => (
                    <button key={ex.label} onClick={() => { setProblem(ex.q); handleSolve(ex.q); }} className="w-full text-left px-4 py-2.5 rounded-xl bg-white/6 hover:bg-purple-500/10 border border-white/8 hover:border-purple-500/25 transition group">
                      <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300">{ex.label}</span>
                      <span className="text-xs text-white/35 font-mono ml-3">{ex.q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LOADING STATE */}
            {loading && (
              <div className={'rounded-3xl border p-8 text-center ' + (isDark ? 'bg-white/3 border-white/8' : 'bg-white border-slate-200')}>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-300">AI Solving...</p>
                    <p className="text-xs text-white/30 mt-1">Analyzing topic · Selecting algorithm · Computing steps</p>
                  </div>
                  <div className="w-full space-y-2">
                    {['Detecting equation type', 'Selecting optimal algorithm', 'Computing step-by-step solution', 'Generating graph data'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: i * 0.2 + 's' }} />
                        <span className="text-xs text-white/35">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF MODAL */}
      <AnimatePresence>
        {showPdfModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#0d0920] border border-purple-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Extracted Problems from PDF</h3>
                <button onClick={() => setShowPdfModal(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pdfProblems.map((p, i) => (
                  <button key={i} onClick={() => { setProblem(p); setShowPdfModal(false); }} className="w-full text-left px-4 py-3 rounded-xl bg-white/6 hover:bg-purple-500/10 border border-white/8 hover:border-purple-500/25 transition">
                    <span className="text-xs text-white/40 mr-2">#{i + 1}</span>
                    <span className="text-sm font-mono text-white/80">{p}</span>
                  </button>
                ))}
                {pdfProblems.length === 0 && <p className="text-center text-xs text-white/30 py-8">No solvable equations found in this PDF.</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
