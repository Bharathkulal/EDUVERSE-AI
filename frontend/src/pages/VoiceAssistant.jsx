import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, Paperclip, BookOpen, Brain,
  Sparkles, Code, FileText, CheckSquare, Trophy, Flame,
  Settings, Award, HelpCircle, BarChart2,
  Clock, BookOpenText, Volume2, VolumeX, Play, Pause,
  Zap, Star, Target, TrendingUp, MessageSquare, Headphones,
  ChevronRight, RefreshCw, Globe, Languages, Smile, Layers,
  Activity, Cpu, Radio, Wifi, Shield, User, X, Plus
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FridayFloatingOrb from '../components/VoiceAssistant/FridayFloatingOrb';
import './VoiceAssistant.css';

/* ── Fixed star / particle positions (avoids random-on-re-render) ── */
const STARS = Array.from({ length: 30 }, (_, i) => ({
  top: ((i * 37 + 13) % 93),
  left: ((i * 61 + 7) % 97),
  size: ((i * 17) % 3) + 1,
  delay: (i * 0.4) % 5,
}));
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  top: ((i * 43 + 11) % 90),
  left: ((i * 71 + 19) % 95),
  size: ((i * 7) % 4) + 3,
  duration: ((i * 3 + 8) % 10) + 8,
  delay: (i * 1.3) % 8,
  color: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#2563eb' : '#00d4ff',
}));

const COMMANDS = [
  { label: 'Explain Again', icon: '🔁' }, { label: 'Repeat', icon: '🔄' },
  { label: 'Slow Down', icon: '🐢' }, { label: 'Speak Faster', icon: '⚡' },
  { label: 'Next Topic', icon: '⏭' }, { label: 'Previous Topic', icon: '⏮' },
  { label: 'Translate Kannada', icon: '🇮🇳' }, { label: 'Translate English', icon: '🇺🇸' },
  { label: 'Give Example', icon: '💡' }, { label: 'Quiz Me', icon: '📝' },
  { label: 'Stop', icon: '⏹' }, { label: 'Resume', icon: '▶' },
];

const VOICE_STYLES = ['Natural', 'Professional', 'Friendly', 'Motivational'];

const ACTIVITY = [
  { time: '09:00', label: 'Completed Java Lesson', icon: '📚', color: '#10b981' },
  { time: '09:30', label: 'Completed Quiz — 87%', icon: '🎯', color: '#7c3aed' },
  { time: '09:40', label: 'Voice Practice Session', icon: '🎙', color: '#2563eb' },
  { time: '10:05', label: 'AI Conversation (24 min)', icon: '🤖', color: '#00d4ff' },
];

const DEMO_MESSAGES = [
  { role: 'ai', text: 'Hello! Today we will explore Queue Data Structures — a foundational concept in Computer Science.' },
  { role: 'user', text: 'What is FIFO?' },
  { role: 'ai', text: 'FIFO stands for "First In, First Out". The first element added to the queue is the first one to be removed — just like a real-life queue at a ticket counter!' },
  { role: 'user', text: 'Give me a real-world example.' },
  { role: 'ai', text: 'Great question! Imagine a printer queue — documents are printed in the order they were sent. The first document sent is printed first. That\'s FIFO in action! 🖨️' },
];

export default function VoiceAssistant() {
  /* ── Core State ── */
  const [assistantState, setAssistantState] = useState('idle');
  const [inputVal, setInputVal] = useState('');
  const [activeCategory, setActiveCategory] = useState('tutor');
  const [subject, setSubject] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  /* ── PDF ── */
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfContext, setPdfContext] = useState(null);
  const [pdfActionLoading, setPdfActionLoading] = useState(false);

  /* ── API Data ── */
  const [mentorData, setMentorData] = useState({ recommendations: [], streak: 0, dailyGoal: '', reminders: [] });
  const [statsData, setStatsData] = useState({ readinessPercentage: 0, learningStreak: 0, completedTopics: 0, studyHours: 0, quizHistory: [] });

  /* ── UI State ── */
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(0.85);
  const [voiceStyle, setVoiceStyle] = useState('Natural');
  const [vizBars] = useState(() => Array.from({ length: 24 }, (_, i) => ((i * 37 + 11) % 70) + 10));
  const [activeVizBars, setActiveVizBars] = useState(vizBars.map(() => 8));

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);
  const vizIntervalRef = useRef(null);

  /* ── Init ── */
  useEffect(() => {
    isMountedRef.current = true;
    fetchHistory();
    fetchMentorData();
    fetchStats();
    initSpeechRecognition();
    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) recognitionRef.current.abort();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      clearInterval(vizIntervalRef.current);
    };
  }, []);

  /* ── Visualizer animation ── */
  useEffect(() => {
    clearInterval(vizIntervalRef.current);
    if (assistantState !== 'idle') {
      vizIntervalRef.current = setInterval(() => {
        setActiveVizBars(vizBars.map(() => Math.random() * 60 + 5));
      }, 120);
    } else {
      setActiveVizBars(vizBars.map(() => 8));
    }
    return () => clearInterval(vizIntervalRef.current);
  }, [assistantState]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isTyping, transcript]);

  const fetchHistory = async () => {
    try { const res = await api.get('/ai/history'); setChatHistory(res.data.reverse()); } catch {}
  };
  const fetchMentorData = async () => {
    try { const res = await api.get('/friday/mentor'); setMentorData(res.data); } catch {}
  };
  const fetchStats = async () => {
    try { const res = await api.get('/friday/stats'); setStatsData(res.data); } catch {}
  };

  const initSpeechRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false; rec.interimResults = true; rec.lang = 'en-US';
    rec.onstart = () => { setAssistantState('listening'); setTranscript(''); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
    rec.onresult = (e) => { setTranscript(e.results[e.resultIndex][0].transcript); };
    rec.onend = () => { setAssistantState('idle'); };
    rec.onerror = (e) => { setAssistantState('idle'); toast.error(`Voice error: ${e.error}`); };
    recognitionRef.current = rec;
  };

  const speakResponse = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#`_\-]/g, '').replace(/\[.*\]/g, '').trim();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = speechSpeed; utt.pitch = pitch; utt.volume = volume;
    utt.onstart = () => { if (isMountedRef.current) setAssistantState('speaking'); };
    utt.onend = () => { if (isMountedRef.current) setAssistantState('idle'); };
    utt.onerror = () => { if (isMountedRef.current) setAssistantState('idle'); };
    const voices = window.speechSynthesis.getVoices();
    const fv = voices.find(v => v.name.includes('Google US English') || v.name.includes('Female') || v.name.includes('Zira'));
    if (fv) utt.voice = fv;
    window.speechSynthesis.speak(utt);
  };

  const handleMicrophoneClick = () => {
    if (assistantState === 'listening') { recognitionRef.current?.stop(); }
    else if (assistantState === 'speaking') { window.speechSynthesis.cancel(); setAssistantState('idle'); }
    else {
      if (recognitionRef.current) { try { recognitionRef.current.start(); } catch { recognitionRef.current.stop(); } }
      else toast.error('Voice not supported. Try Chrome or Edge.');
    }
  };

  useEffect(() => {
    if (transcript && assistantState === 'idle') { sendMessage(transcript); setTranscript(''); }
  }, [assistantState, transcript]);

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    setChatHistory(p => [...p, { message: msg, response: '', pending: true }]);
    setIsTyping(true); setAssistantState('thinking');
    try {
      let endpoint = '/friday/chat';
      let payload = { message: msg, category: activeCategory, subject };
      if (activeCategory === 'pdf' && pdfContext) { endpoint = '/friday/pdf-action'; payload = { action: 'question', question: msg }; }
      const { data } = await api.post(endpoint, payload);
      setChatHistory(p => { const u = [...p]; u[u.length - 1] = { message: msg, response: data.response, pending: false }; return u; });
      speakResponse(data.response);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI request failed.');
      setChatHistory(p => p.slice(0, -1)); setAssistantState('idle');
    } finally { setIsTyping(false); }
  };

  const handleFormSubmit = (e) => { e.preventDefault(); if (!inputVal.trim()) return; const m = inputVal; setInputVal(''); sendMessage(m); };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setPdfFile(file); setAssistantState('thinking');
    const fd = new FormData(); fd.append('file', file);
    const tid = toast.loading('Parsing document…');
    try {
      const { data } = await api.post('/friday/upload-pdf', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPdfContext(data); toast.success(data.message, { id: tid }); handlePdfAction('summary');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed.', { id: tid }); setPdfFile(null); }
    finally { setAssistantState('idle'); }
  };

  const handlePdfAction = async (actionType) => {
    if (!pdfContext) { toast.error('Upload a PDF first.'); return; }
    setPdfActionLoading(true); setAssistantState('thinking'); setIsTyping(true);
    const descMap = { summary: 'Generating summary…', notes: 'Formulating notes…', quiz: 'Generating MCQs…' };
    setChatHistory(p => [...p, { message: `Protocol: ${descMap[actionType]}`, response: '', pending: true }]);
    try {
      const { data } = await api.post('/friday/pdf-action', { action: actionType });
      setChatHistory(p => { const u = [...p]; u[u.length - 1] = { message: `Protocol: ${actionType.toUpperCase()} — ${pdfContext.filename}`, response: data.response, pending: false }; return u; });
      speakResponse(`I have generated the ${actionType} output.`);
    } catch (err) { toast.error(err.response?.data?.message || 'PDF action failed.'); setChatHistory(p => p.slice(0, -1)); }
    finally { setAssistantState('idle'); setIsTyping(false); setPdfActionLoading(false); }
  };

  const handleQuickAction = (label, cat) => {
    setActiveCategory(cat);
    if (cat === 'pdf') { fileInputRef.current?.click(); return; }
    const prompts = {
      'Explain Topic': 'Explain the features of Java for 5 marks',
      'Generate Notes': 'Create study notes for Computer Network OSI Layers',
      'Mock Test': 'Give 20 important DBMS questions for PGCET',
      'Coding Help': 'Write a Python program to reverse a linked list and explain it',
      'PGCET Practice': 'Analyze previous year DBMS questions for PGCET',
      'Ask AI': 'Explain Binary Search Tree insertion algorithm',
      'Analytics': 'Analyze my study profile and give learning advice',
    };
    setInputVal(prompts[label] || '');
  };

  const handleCommand = (cmd) => {
    const map = {
      'Explain Again': 'Please explain that again more clearly',
      'Repeat': 'Can you repeat what you just said?',
      'Slow Down': 'Please slow down your explanation',
      'Speak Faster': 'You can speak a bit faster',
      'Next Topic': 'Move to the next topic please',
      'Previous Topic': 'Go back to the previous topic',
      'Translate Kannada': 'Translate your last explanation to Kannada',
      'Translate English': 'Translate your last explanation to English',
      'Give Example': 'Give me a real-world example of this',
      'Quiz Me': 'Quiz me on what we just learned',
      'Stop': null,
      'Resume': null,
    };
    if (cmd === 'Stop') { window.speechSynthesis.cancel(); setAssistantState('idle'); return; }
    if (cmd === 'Resume') { handleMicrophoneClick(); return; }
    if (map[cmd]) sendMessage(map[cmd]);
  };

  const orbStateLabel = {
    idle: '● Ready',
    listening: '🎙 Listening…',
    thinking: '⚙ Thinking…',
    speaking: '🔊 Speaking…',
  };

  const completedMessages = useMemo(() =>
    chatHistory.length > 0 ? chatHistory : DEMO_MESSAGES,
    [chatHistory]
  );

  const readinessR = 45;
  const readinessCircumference = 2 * Math.PI * readinessR;
  const readinessDashOffset = readinessCircumference - (readinessCircumference * (statsData.readinessPercentage || 72)) / 100;

  return (
    <div className="va-page">
      {/* ── Animated Background ── */}
      <div className="va-bg-layer">
        <div className="va-grid" />
        <div className="va-bg-blob" />
        <div className="va-bg-blob" />
        <div className="va-bg-blob" />
        {STARS.map((s, i) => (
          <div key={i} className="va-star" style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }} />
        ))}
        {PARTICLES.map((p, i) => (
          <div key={i} className="va-particle" style={{ top: `${p.top}%`, left: `${p.left}%`, width: p.size, height: p.size, background: p.color, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`, opacity: 0.4 }} />
        ))}
      </div>

      <div className="va-content space-y-5">

        {/* ══════════════════════════════
            HERO SECTION
        ══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="va-card va-card-neon va-card-glow-purple"
        >
          <div className="va-hero grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left — Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="va-section-label">EduVerse AI</p>
                  <h1 className="va-hero-title">🎙 AI Voice Teacher</h1>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="va-hero-tagline">
                  Learn Naturally.<br />
                  Speak Freely.<br />
                  Understand Better.
                </h2>
              </div>

              {/* Current lesson */}
              <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="va-section-label">Current Lesson</p>
                  <div className="flex items-center gap-2">
                    <div className="va-status-dot" />
                    <span className="text-xs font-bold text-emerald-400">
                      {orbStateLabel[assistantState]}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-bold text-white">Introduction to Data Structures</p>

                {/* Waveform */}
                <div className={`va-waveform ${assistantState !== 'idle' ? 'active' : ''}`}>
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className="va-wave-bar"
                      style={{
                        '--h': `${activeVizBars[i % activeVizBars.length] || 20}px`,
                        height: assistantState !== 'idle' ? `${activeVizBars[i % activeVizBars.length] || 20}px` : undefined,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { label: 'Current Topic', value: 'Stacks & Queues', icon: <Layers className="w-3 h-3 text-violet-400" /> },
                    { label: 'Remaining', value: '12 min', icon: <Clock className="w-3 h-3 text-blue-400" /> },
                    { label: 'AI Confidence', value: '98%', icon: <Brain className="w-3 h-3 text-cyan-400" /> },
                    { label: 'Language', value: 'EN / KN', icon: <Languages className="w-3 h-3 text-green-400" /> },
                    { label: 'Voice', value: 'Natural Female', icon: <Volume2 className="w-3 h-3 text-pink-400" /> },
                    { label: 'Difficulty', value: 'Intermediate', icon: <Target className="w-3 h-3 text-amber-400" /> },
                  ].map((m, i) => (
                    <div key={i} className="va-meta-chip flex-col items-start gap-0.5 rounded-xl" style={{ borderRadius: 12 }}>
                      <div className="flex items-center gap-1">{m.icon}<span className="text-[9px] uppercase tracking-wider opacity-60">{m.label}</span></div>
                      <span className="text-xs font-bold text-white">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category + Subject selectors */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={activeCategory}
                  onChange={e => setActiveCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-violet-300 cursor-pointer outline-none"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <option value="tutor">🧠 AI Tutor Mode</option>
                  <option value="pgcet">⚡ PGCET Assistant</option>
                  <option value="question-bank">❓ Question Bank</option>
                  <option value="coding">💻 Coding Assistant</option>
                  <option value="search">🌐 Web Search</option>
                  <option value="pdf">📄 PDF Learning</option>
                </select>
                <input
                  type="text"
                  placeholder="Focus: e.g. DBMS, Java…"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs text-violet-200 outline-none flex-1 min-w-[140px]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            {/* Right — AI Orb */}
            <div className="flex flex-col items-center gap-6">
              <div className="va-orb-wrap" onClick={handleMicrophoneClick}>
                <div
                  className="va-orb-halo"
                  style={{ background: `radial-gradient(circle, ${assistantState === 'listening' ? 'rgba(236,72,153,0.3)' : assistantState === 'speaking' ? 'rgba(0,212,255,0.3)' : 'rgba(124,58,237,0.3)'} 0%, transparent 70%)` }}
                />
                <div className="va-orb-ring va-orb-ring-1" />
                <div className="va-orb-ring va-orb-ring-2" />
                <div className="va-orb-ring va-orb-ring-3" />
                <div className={`va-orb-core ${assistantState}`}>
                  <Mic className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold" style={{ color: '#a78bfa' }}>
                  {assistantState === 'idle'     && 'Tap to Start Teaching'}
                  {assistantState === 'listening' && '🔴 Recording your voice…'}
                  {assistantState === 'thinking'  && '⚙ Processing your question…'}
                  {assistantState === 'speaking'  && '🔊 AI Teacher is speaking…'}
                </p>
                <p className="text-[10px] text-slate-500">Nova Voice AI • Natural Female • v3.5</p>
              </div>

              {/* Quick action grid */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
                {[
                  { label: 'Explain', cat: 'tutor', icon: <BookOpen className="w-4 h-4 text-violet-400" /> },
                  { label: 'Notes', cat: 'tutor', icon: <FileText className="w-4 h-4 text-blue-400" /> },
                  { label: 'Mock Test', cat: 'pgcet', icon: <CheckSquare className="w-4 h-4 text-green-400" /> },
                  { label: 'Coding', cat: 'coding', icon: <Code className="w-4 h-4 text-pink-400" /> },
                  { label: 'Upload PDF', cat: 'pdf', icon: <Paperclip className="w-4 h-4 text-amber-400" /> },
                  { label: 'PGCET', cat: 'pgcet', icon: <Trophy className="w-4 h-4 text-indigo-400" /> },
                  { label: 'Ask AI', cat: 'tutor', icon: <HelpCircle className="w-4 h-4 text-rose-400" /> },
                  { label: 'Analytics', cat: 'tutor', icon: <BarChart2 className="w-4 h-4 text-cyan-400" /> },
                ].map((a, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleQuickAction(a.label === 'Explain' ? 'Explain Topic' : a.label === 'Notes' ? 'Generate Notes' : a.label, a.cat)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {a.icon}
                    <span className="text-[9px] font-bold text-slate-400 leading-tight text-center">{a.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════
            MAIN 3-COLUMN AREA
        ══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT: Visualizer + Teacher Personality ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Realtime Visualizer */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="va-card va-card-glow-cyan p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="va-section-label flex items-center gap-2"><Activity className="w-3 h-3 text-cyan-400" /> Voice Visualizer</p>
                <div className={`w-2 h-2 rounded-full ${assistantState !== 'idle' ? 'bg-cyan-400' : 'bg-slate-600'}`} style={{ boxShadow: assistantState !== 'idle' ? '0 0 6px #00d4ff' : 'none' }} />
              </div>

              {/* Frequency bars */}
              <div className="flex items-end gap-0.5 h-16 justify-center">
                {vizBars.map((_, i) => (
                  <div
                    key={i}
                    className="va-visualizer-bar flex-1"
                    style={{
                      height: assistantState !== 'idle' ? `${activeVizBars[i] || 8}px` : `${(i % 5 + 1) * 4}px`,
                      animationDelay: `${i * 0.05}s`,
                      opacity: assistantState !== 'idle' ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Confidence', value: assistantState === 'speaking' ? '98%' : '—', color: '#10b981' },
                  { label: 'Noise Level', value: 'Low', color: '#7c3aed' },
                  { label: 'Mic Sensitivity', value: 'High', color: '#2563eb' },
                  { label: 'Latency', value: '42ms', color: '#00d4ff' },
                  { label: 'Voice Quality', value: '9.4/10', color: '#ec4899' },
                  { label: 'Intensity', value: assistantState !== 'idle' ? '●●●●○' : '○○○○○', color: '#f59e0b' },
                ].map((m, i) => (
                  <div key={i} className="p-2 rounded-xl space-y-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">{m.label}</p>
                    <p className="text-xs font-bold" style={{ color: m.color }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Teacher Personality */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="va-card p-5 space-y-4">
              <p className="va-section-label flex items-center gap-2"><Smile className="w-3 h-3 text-pink-400" /> AI Teacher Personality</p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-violet-500/30">🤖</div>
                <div>
                  <p className="text-sm font-black text-white">Nova Voice AI</p>
                  <p className="text-[10px] text-slate-400">EduVerse v3.5 Core</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Mood', value: 'Friendly 😊', color: '#10b981' },
                  { label: 'Teaching Style', value: 'Interactive' },
                  { label: 'Patience Level', value: 'High ∞' },
                  { label: 'Memory', value: 'Recalls past lessons' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{r.label}</span>
                    <span className="font-bold" style={{ color: r.color || '#a78bfa' }}>{r.value}</span>
                  </div>
                ))}

                {[
                  { label: 'Creativity', pct: 95, color: '#7c3aed' },
                  { label: 'Humor', pct: 70, color: '#ec4899' },
                  { label: 'Engagement', pct: 98, color: '#00d4ff' },
                ].map((b, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{b.label}</span>
                      <span className="font-bold" style={{ color: b.color }}>{b.pct}%</span>
                    </div>
                    <div className="va-mini-bar">
                      <motion.div
                        className="va-mini-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                        style={{ background: `linear-gradient(90deg, ${b.color}, #00d4ff)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── CENTER: Conversation + Voice Commands ── */}
          <div className="lg:col-span-6 space-y-5">

            {/* Live Conversation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="va-card va-card-neon flex flex-col" style={{ height: 480 }}>
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
                <p className="va-section-label flex items-center gap-2"><MessageSquare className="w-3 h-3 text-violet-400" /> Live AI Conversation</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    {assistantState === 'speaking' ? '🔊 Speaking' : assistantState === 'listening' ? '🎙 Listening' : assistantState === 'thinking' ? '⚙ Thinking' : '● Live'}
                  </span>
                </div>
              </div>

              <div className="flex-1 px-5 py-3 overflow-y-auto space-y-4 va-scroll">
                <AnimatePresence initial={false}>
                  {completedMessages.map((chat, idx) => {
                    const isAI = 'role' in chat ? chat.role === 'ai' : true;
                    const isUser = 'role' in chat ? chat.role === 'user' : false;
                    const msgText = 'role' in chat ? chat.text : undefined;
                    const userMsg = isUser ? msgText : chat.message;
                    const aiMsg = isAI ? msgText || chat.response : chat.response;

                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
                        {'role' in chat ? (
                          chat.role === 'user' ? (
                            <div className="flex justify-end">
                              <div className="va-bubble-user text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-[80%] text-sm leading-relaxed">
                                {chat.text}
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-start">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-xs">🤖</div>
                              <div className="va-bubble-ai text-slate-200 px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] text-sm leading-relaxed">{chat.text}</div>
                            </div>
                          )
                        ) : (
                          <>
                            <div className="flex justify-end">
                              <div className="va-bubble-user text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-[80%] text-sm leading-relaxed">{chat.message}</div>
                            </div>
                            <div className="flex gap-2 items-start">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-xs">🤖</div>
                              <div className="va-bubble-ai text-slate-200 px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap">
                                {chat.pending ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-violet-400 font-bold text-[10px] uppercase tracking-wider">Thinking</span>
                                    <div className="friday-typing-dots">
                                      <div className="friday-typing-dot" /><div className="friday-typing-dot" /><div className="friday-typing-dot" />
                                    </div>
                                  </div>
                                ) : chat.response}
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {transcript && (
                  <div className="flex justify-end">
                    <div className="px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] text-sm italic animate-pulse" style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', color: '#f9a8d4' }}>
                      🎙 {transcript}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* PDF panel */}
              {activeCategory === 'pdf' && (
                <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><FileText className="w-3 h-3 text-cyan-400" />{pdfContext ? pdfContext.filename : 'No PDF loaded'}</span>
                  <div className="flex gap-1">
                    {['summary', 'notes', 'quiz'].map(a => (
                      <button key={a} onClick={() => handlePdfAction(a)} disabled={pdfActionLoading || !pdfContext}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg transition" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', color: '#c4b5fd' }}>
                        {a.charAt(0).toUpperCase() + a.slice(1)}
                      </button>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()} className="px-2 py-1 text-[10px] font-bold rounded-lg transition" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                      Upload
                    </button>
                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleFormSubmit} className="p-4 border-t border-white/5 flex items-center gap-3" style={{ background: 'rgba(0,0,0,0.15)' }}>
                <div className="flex-1">
                  <input
                    className="va-chat-input"
                    placeholder={activeCategory === 'pdf' ? 'Ask about the PDF…' : 'Ask your AI Teacher anything…'}
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    disabled={isTyping}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  type="submit"
                  disabled={isTyping || !inputVal.trim()}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={handleMicrophoneClick}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{
                    background: assistantState === 'listening'
                      ? 'linear-gradient(135deg,#ec4899,#be185d)'
                      : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: assistantState === 'listening' ? '0 0 20px rgba(236,72,153,0.5)' : 'none',
                  }}
                >
                  {assistantState === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-slate-300" />}
                </motion.button>
              </form>
            </motion.div>

            {/* Voice Commands */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="va-card p-5 space-y-4">
              <p className="va-section-label flex items-center gap-2"><Radio className="w-3 h-3 text-violet-400" /> Voice Commands</p>
              <div className="flex flex-wrap gap-2">
                {COMMANDS.map((c, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCommand(c.label)}
                    className="va-cmd-chip"
                  >
                    <span>{c.icon}</span> {c.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Lesson Card + Stats + Settings ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Current Lesson Progress */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="va-card p-5 space-y-4">
              <p className="va-section-label flex items-center gap-2"><BookOpen className="w-3 h-3 text-blue-400" /> Lesson Progress</p>

              {/* Progress Ring */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <svg width="90" height="90">
                    <defs>
                      <linearGradient id="vaRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#00d4ff" />
                      </linearGradient>
                    </defs>
                    <circle cx="45" cy="45" r={readinessR} className="va-progress-ring-track" strokeWidth="6" fill="transparent" />
                    <circle cx="45" cy="45" r={readinessR} className="va-progress-ring-fill" strokeWidth="7" fill="transparent"
                      strokeDasharray={readinessCircumference}
                      strokeDashoffset={readinessDashOffset}
                      transform="rotate(-90 45 45)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-white">{statsData.readinessPercentage || 72}%</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider">Ready</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase">Chapter</p>
                    <p className="text-xs font-bold text-white truncate">Data Structures Ch.3</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase">XP Reward</p>
                    <p className="text-xs font-bold text-amber-400">+250 XP</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase">Est. Finish</p>
                    <p className="text-xs font-bold text-cyan-400">12 min</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Study Hours', value: `${statsData.studyHours || 4}h`, icon: <Clock className="w-3 h-3 text-cyan-400" /> },
                  { label: 'Topics Done', value: statsData.completedTopics || 12, icon: <BookOpenText className="w-3 h-3 text-violet-400" /> },
                ].map((s, i) => (
                  <div key={i} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-1 mb-0.5">{s.icon}<span className="text-[9px] text-slate-500 uppercase">{s.label}</span></div>
                    <span className="text-sm font-black text-white">{s.value}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleMicrophoneClick}
                className="w-full py-2.5 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
              >
                <Play className="w-3.5 h-3.5" /> Resume Lesson
              </motion.button>
            </motion.div>

            {/* Voice Settings */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="va-card p-5 space-y-4">
              <p className="va-section-label flex items-center gap-2"><Settings className="w-3 h-3 text-slate-400" /> Voice Settings</p>

              <div className="space-y-4">
                {[
                  { label: 'Speech Speed', value: speechSpeed, min: 0.5, max: 2, step: 0.1, set: setSpeechSpeed, color: '#7c3aed', display: `${speechSpeed.toFixed(1)}×` },
                  { label: 'Pitch', value: pitch, min: 0.5, max: 2, step: 0.1, set: setPitch, color: '#2563eb', display: pitch.toFixed(1) },
                  { label: 'Volume', value: volume, min: 0, max: 1, step: 0.05, set: setVolume, color: '#00d4ff', display: `${Math.round(volume * 100)}%` },
                ].map((s, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{s.label}</span>
                      <span className="font-bold" style={{ color: s.color }}>{s.display}</span>
                    </div>
                    <input
                      type="range"
                      className="va-slider"
                      min={s.min} max={s.max} step={s.step}
                      value={s.value}
                      onChange={e => s.set(parseFloat(e.target.value))}
                      style={{ accentColor: s.color }}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Voice Style</p>
                <div className="flex flex-wrap gap-1.5">
                  {VOICE_STYLES.map(s => (
                    <button key={s} onClick={() => setVoiceStyle(s)} className={`va-voice-style-btn ${voiceStyle === s ? 'active' : ''}`}>{s}</button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Mentor */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="va-card p-5 space-y-3">
              <p className="va-section-label flex items-center gap-2"><Brain className="w-3 h-3 text-cyan-400" /> AI Mentor Tips</p>
              <div className="space-y-2 max-h-36 overflow-y-auto va-scroll">
                {(mentorData.recommendations.length > 0 ? mentorData.recommendations : [
                  'Focus on Queue operations today — very likely in exams!',
                  'Review Stack implementation with arrays for deeper understanding.',
                  'Practice 5 DSA problems daily to build problem-solving speed.',
                ]).map((r, i) => (
                  <div key={i} className="p-2.5 rounded-xl text-xs text-slate-300 leading-relaxed" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <span className="text-violet-400 font-bold mr-1">{i + 1}.</span>{r.replace(/^\d+\.\s*/, '')}
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-1 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
                <span className="flex items-center gap-1 text-slate-400"><Flame className="w-3.5 h-3.5 text-orange-500" /> Streak: <strong className="text-white ml-1">{statsData.learningStreak || 4}d</strong></span>
                <span className="flex items-center gap-1 text-slate-400"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Goal: <strong className="text-white ml-1">{mentorData.dailyGoal || '2h'}</strong></span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════
            SMART AI INSIGHTS
        ══════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="va-card p-6 space-y-4">
          <p className="va-section-label flex items-center gap-2"><Zap className="w-3 h-3 text-amber-400" /> Smart AI Insights</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            {[
              { label: 'Topics Learned', value: statsData.completedTopics || 24, icon: '📚', color: '#7c3aed' },
              { label: 'Questions Asked', value: chatHistory.length || 47, icon: '❓', color: '#2563eb' },
              { label: 'Avg Response', value: '1.2s', icon: '⚡', color: '#00d4ff' },
              { label: 'Speaking Acc.', value: '94%', icon: '🎙', color: '#10b981' },
              { label: 'Listening Acc.', value: '97%', icon: '👂', color: '#ec4899' },
              { label: 'Pronunciation', value: '89%', icon: '🗣', color: '#f59e0b' },
              { label: 'Learning Speed', value: '1.4×', icon: '🚀', color: '#8b5cf6' },
              { label: 'AI Engagement', value: '96%', icon: '🤖', color: '#06b6d4' },
              { label: 'Retention', value: '82%', icon: '🧠', color: '#84cc16' },
            ].map((s, i) => (
              <motion.div key={i} whileHover={{ y: -3, scale: 1.02 }} className="va-stat-badge text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider leading-tight mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════
            ACHIEVEMENTS + ACTIVITY
        ══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="va-card p-5 space-y-4">
            <p className="va-section-label flex items-center gap-2"><Award className="w-3 h-3 text-amber-400" /> Achievements</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Speaking Time', value: `${statsData.studyHours || 3.2}h Today`, icon: '🎙', color: '#7c3aed' },
                { label: 'Weekly Streak', value: `${statsData.learningStreak || 4} Days`, icon: '🔥', color: '#f59e0b' },
                { label: 'Longest Session', value: '47 min', icon: '⏱', color: '#10b981' },
                { label: 'XP Earned', value: `${(statsData.completedTopics || 24) * 50} XP`, icon: '⚡', color: '#00d4ff' },
                { label: 'Lessons Done', value: statsData.completedTopics || 18, icon: '📖', color: '#ec4899' },
                { label: 'Certificates', value: 3, icon: '🏆', color: '#84cc16' },
              ].map((a, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} className="va-achievement">
                  <div className="text-2xl">{a.icon}</div>
                  <div className="font-black text-sm" style={{ color: a.color }}>{a.value}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">{a.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="va-card p-5 space-y-4">
            <p className="va-section-label flex items-center gap-2"><Clock className="w-3 h-3 text-slate-400" /> Recent Activity</p>
            <div className="relative pl-5 space-y-5">
              <div className="va-timeline-line absolute left-2 top-0 bottom-0" />
              {ACTIVITY.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="relative flex items-start gap-3">
                  <div className="va-timeline-dot absolute -left-3 top-1" style={{ borderColor: a.color, boxShadow: `0 0 8px ${a.color}50` }} />
                  <div className="flex-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{a.icon} {a.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: a.color }}>{a.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>

      {/* ══════════════════════════════
          STICKY BOTTOM ACTION BAR
      ══════════════════════════════ */}
      <div className="va-action-bar">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMicrophoneClick}
          className={`va-action-btn ${assistantState === 'listening' ? 'danger' : 'primary'}`}
        >
          {assistantState === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {assistantState === 'listening' ? 'Stop Listening' : '🎤 Start Listening'}
        </motion.button>

        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => sendMessage('Read the current lesson content aloud')}
          className="va-action-btn"
        >
          <Volume2 className="w-4 h-4" /> 🔊 Read Lesson
        </motion.button>

        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => { setIsPaused(true); window.speechSynthesis.pause(); }}
          className="va-action-btn"
        >
          <Pause className="w-4 h-4" /> Pause
        </motion.button>

        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => { setIsPaused(false); window.speechSynthesis.resume(); }}
          className="va-action-btn"
        >
          <Play className="w-4 h-4" /> Resume
        </motion.button>

        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => sendMessage('Give me my current lesson notes')}
          className="va-action-btn"
        >
          <FileText className="w-4 h-4" /> 📖 Open Notes
        </motion.button>

        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => sendMessage('Quiz me on what we just learned')}
          className="va-action-btn"
        >
          <CheckSquare className="w-4 h-4" /> 📝 Quiz Me
        </motion.button>

        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setVoiceStyle(vs => VOICE_STYLES[(VOICE_STYLES.indexOf(vs) + 1) % VOICE_STYLES.length])}
          className="va-action-btn"
        >
          <Headphones className="w-4 h-4" /> 🎧 {voiceStyle}
        </motion.button>

        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setActiveCategory(c => c === 'tutor' ? 'pgcet' : 'tutor')}
          className="va-action-btn"
        >
          <Settings className="w-4 h-4" /> ⚙ Mode: {activeCategory}
        </motion.button>
      </div>
    </div>
  );
}
