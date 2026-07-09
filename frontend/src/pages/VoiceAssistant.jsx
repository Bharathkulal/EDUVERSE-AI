import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Send, Paperclip, Search, BookOpen, Brain, 
  Sparkles, Code, FileText, CheckSquare, Trophy, Flame, 
  Bell, Settings, Award, HelpCircle, BarChart2, RefreshCw,
  Clock, BookOpenText, ChevronRight, User
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FridayFloatingOrb from '../components/VoiceAssistant/FridayFloatingOrb';
import './VoiceAssistant.css';

export default function VoiceAssistant() {
  const [assistantState, setAssistantState] = useState('idle'); // idle, listening, thinking, speaking
  const [inputVal, setInputVal] = useState('');
  const [activeCategory, setActiveCategory] = useState('tutor'); // tutor, pgcet, question-bank, coding, search, pdf
  const [subject, setSubject] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // PDF State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfContext, setPdfContext] = useState(null);
  const [pdfActionLoading, setPdfActionLoading] = useState(false);

  // Mentor & Stats State
  const [mentorData, setMentorData] = useState({
    recommendations: [],
    streak: 0,
    dailyGoal: '',
    reminders: []
  });
  const [statsData, setStatsData] = useState({
    readinessPercentage: 0,
    learningStreak: 0,
    completedTopics: 0,
    studyHours: 0,
    quizHistory: []
  });

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const isMountedRef = useRef(true);

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
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping, transcript]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      setChatHistory(res.data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMentorData = async () => {
    try {
      const res = await api.get('/friday/mentor');
      setMentorData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/friday/stats');
      setStatsData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setAssistantState('listening');
        setTranscript('');
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      };

      rec.onresult = (event) => {
        const current = event.resultIndex;
        const resultText = event.results[current][0].transcript;
        setTranscript(resultText);
      };

      rec.onend = () => {
        setAssistantState('idle');
      };

      rec.onerror = (event) => {
        setAssistantState('idle');
        toast.error(`Voice input error: ${event.error}`);
      };

      recognitionRef.current = rec;
    }
  };

  const speakResponse = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#`_\-]/g, '')
      .replace(/\[.*\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => { if (isMountedRef.current) setAssistantState('speaking'); };
    utterance.onend = () => { if (isMountedRef.current) setAssistantState('idle'); };
    utterance.onerror = () => { if (isMountedRef.current) setAssistantState('idle'); };

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) => v.name.includes('Google US English') || v.name.includes('Female') || v.name.includes('Zira')
    );
    if (femaleVoice) utterance.voice = femaleVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleMicrophoneClick = () => {
    if (assistantState === 'listening') {
      recognitionRef.current?.stop();
    } else if (assistantState === 'speaking') {
      window.speechSynthesis.cancel();
      setAssistantState('idle');
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          recognitionRef.current.stop();
        }
      } else {
        toast.error('Voice recognition is not supported in this browser. Try Chrome or Edge.');
      }
    }
  };

  useEffect(() => {
    if (transcript && assistantState === 'idle') {
      sendMessage(transcript);
      setTranscript('');
    }
  }, [assistantState, transcript]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    setChatHistory((prev) => [...prev, { message: messageText, response: '', pending: true }]);
    setIsTyping(true);
    setAssistantState('thinking');

    try {
      let endpoint = '/friday/chat';
      let payload = { message: messageText, category: activeCategory, subject };

      if (activeCategory === 'pdf' && pdfContext) {
        endpoint = '/friday/pdf-action';
        payload = { action: 'question', question: messageText };
      }

      const { data } = await api.post(endpoint, payload);

      setChatHistory((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0) {
          updated[lastIdx] = { message: messageText, response: data.response, pending: false };
        }
        return updated;
      });

      speakResponse(data.response);
    } catch (err) {
      toast.error(err.response?.data?.message || 'F.R.I.D.A.Y. request failed.');
      setChatHistory((prev) => prev.slice(0, -1));
      setAssistantState('idle');
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const msg = inputVal;
    setInputVal('');
    sendMessage(msg);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setAssistantState('thinking');
    const formData = new FormData();
    formData.append('file', file);
    const toastId = toast.loading('F.R.I.D.A.Y. is parsing document contents...');

    try {
      const { data } = await api.post('/friday/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPdfContext(data);
      toast.success(data.message, { id: toastId });
      handlePdfAction('summary');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload PDF.', { id: toastId });
      setPdfFile(null);
    } finally {
      setAssistantState('idle');
    }
  };

  const handlePdfAction = async (actionType) => {
    if (!pdfContext) {
      toast.error('Please upload a PDF file first.');
      return;
    }
    setPdfActionLoading(true);
    setAssistantState('thinking');
    setIsTyping(true);

    const descMap = {
      summary: 'Generating summary...',
      notes: 'Formulating revision notes...',
      quiz: 'Generating 5 mock MCQs...'
    };

    setChatHistory((prev) => [
      ...prev,
      { message: `Protocol triggered: ${descMap[actionType]}`, response: '', pending: true }
    ]);

    try {
      const { data } = await api.post('/friday/pdf-action', { action: actionType });
      setChatHistory((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0) {
          updated[lastIdx] = {
            message: `Protocol: ${actionType.toUpperCase()} of ${pdfContext.filename}`,
            response: data.response,
            pending: false
          };
        }
        return updated;
      });
      speakResponse(`I have generated the ${actionType} output, student.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process PDF action.');
      setChatHistory((prev) => prev.slice(0, -1));
    } finally {
      setAssistantState('idle');
      setIsTyping(false);
      setPdfActionLoading(false);
    }
  };

  const handleQuickAction = (actionLabel, defaultCategory) => {
    setActiveCategory(defaultCategory);
    if (defaultCategory === 'pdf') {
      fileInputRef.current?.click();
    } else {
      let promptMsg = '';
      if (actionLabel === 'Explain Topic') promptMsg = 'Explain the features of Java for 5 marks';
      if (actionLabel === 'Generate Notes') promptMsg = 'Create study notes for Computer Network OSI Layers';
      if (actionLabel === 'Mock Test') promptMsg = 'Give 20 important DBMS questions for PGCET';
      if (actionLabel === 'Coding Help') promptMsg = 'Write a Python program to reverse a linked list and explain details';
      if (actionLabel === 'PGCET Practice') promptMsg = 'Analyze previous year DBMS questions for PGCET and list important areas';
      if (actionLabel === 'Ask AI') promptMsg = 'Explain Binary Search Tree insertion algorithm';
      if (actionLabel === 'Analytics') promptMsg = 'Analyze my study profile and give learning advice';

      setInputVal(promptMsg);
    }
  };

  return (
    <div className="friday-premium-dashboard relative">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Moving Background Stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="friday-star"
          style={{
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 95}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${i * 0.8}s`
          }}
        />
      ))}

      {/* Control Room HUD Header */}
      <header className="friday-hud-navbar px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 rounded-xl border border-white/5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="friday-hud-logo text-xl font-black text-white flex items-center gap-2">
              F.R.I.D.A.Y. <span className="text-[10px] py-0.5 px-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full font-sans uppercase font-bold tracking-wider">v3.5 Core</span>
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Educational Operating System HUD</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-white/5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-300">Protocol Active: 4d Streak</span>
          </div>

          <input
            type="text"
            className="px-3 py-1.5 bg-slate-950/60 border border-purple-500/20 rounded-lg text-xs text-purple-200 outline-none w-[170px] text-center"
            placeholder="Focus: e.g. DBMS, Java"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/60 border border-purple-500/20 rounded-lg text-xs text-cyan-300 outline-none cursor-pointer"
          >
            <option value="tutor">🧠 AI Tutor Mode</option>
            <option value="pgcet">⚡ PGCET Assistant</option>
            <option value="question-bank">❓ Question Bank Helper</option>
            <option value="coding">💻 Coding Assistant</option>
            <option value="search">🌐 Web Search Grounding</option>
            <option value="pdf">📄 PDF Learning</option>
          </select>
        </div>
      </header>

      {/* Responsive Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: AI Voice Core */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="friday-glass-card p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-[380px] h-full">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1">Hologram Interface</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Voice Core matrix</h3>
            </div>

            {/* Reactor Core Orb */}
            <div className="friday-orb-container my-6 cursor-pointer" onClick={handleMicrophoneClick}>
              <FridayFloatingOrb state={assistantState} size={135} />
            </div>

            {/* Info Status */}
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase">
                {assistantState === 'idle' && 'Core Ready'}
                {assistantState === 'listening' && 'Recording Waveform...'}
                {assistantState === 'thinking' && 'Analyzing Synapses...'}
                {assistantState === 'speaking' && 'Speaking protocols active'}
              </p>
              <div className="flex justify-center mt-3">
                <div className={`friday-pulse-wave-lines ${assistantState !== 'idle' ? 'active' : ''}`}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="friday-pulse-line" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Main AI Conversation Area */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="friday-glass-card rounded-2xl flex flex-col h-[520px] lg:h-[550px] overflow-hidden">
            {/* Conversation Log */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {chatHistory.length === 0 && !transcript && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-4">
                  <div className="p-4 rounded-full bg-slate-900/50 border border-white/5">
                    <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Initialize F.R.I.D.A.Y.</h3>
                    <p className="text-xs text-slate-400 max-w-[340px] mt-1">
                      Welcome, student. Ready to execute educational assistance. Use voice commands or select quick protocols below.
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {chatHistory.map((chat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {/* User Bubble */}
                    <div className="flex justify-end">
                      <div className="friday-chat-user-bubble text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] text-xs leading-relaxed">
                        {chat.message}
                      </div>
                    </div>

                    {/* AI Bubble */}
                    <div className="flex justify-start">
                      <div className="friday-chat-ai-bubble text-slate-200 px-4 py-3 rounded-2xl rounded-tl-none max-w-[90%] text-xs leading-relaxed whitespace-pre-wrap">
                        {chat.pending ? (
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">Processing Matrix</span>
                            <div className="friday-typing-dots">
                              <div className="friday-typing-dot" />
                              <div className="friday-typing-dot" />
                              <div className="friday-typing-dot" />
                            </div>
                          </div>
                        ) : (
                          chat.response
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Speech transcript */}
              {transcript && (
                <div className="flex justify-end">
                  <div className="bg-pink-600/30 border border-pink-500/30 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[85%] text-xs italic animate-pulse">
                    🎙️ {transcript}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* PDF Uploader Panel */}
            {activeCategory === 'pdf' && (
              <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-semibold text-slate-200 truncate block max-w-[150px]">
                      {pdfContext ? pdfContext.filename : 'Ready for upload'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handlePdfAction('summary')}
                    className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-[10px] text-blue-300 rounded hover:bg-blue-500/35 transition"
                    disabled={pdfActionLoading || !pdfContext}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => handlePdfAction('notes')}
                    className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-300 rounded hover:bg-purple-500/35 transition"
                    disabled={pdfActionLoading || !pdfContext}
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => handlePdfAction('quiz')}
                    className="px-2 py-1 bg-pink-500/20 border border-pink-500/30 text-[10px] text-pink-300 rounded hover:bg-pink-500/35 transition"
                    disabled={pdfActionLoading || !pdfContext}
                  >
                    Quiz
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-slate-800 text-[10px] text-slate-300 rounded hover:bg-slate-700 transition"
                  >
                    Upload PDF
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handlePdfUpload}
                />
              </div>
            )}

            {/* Form Input */}
            <form onSubmit={handleFormSubmit} className="p-4 border-t border-white/5 bg-slate-950/45 flex items-center gap-3">
              <div className="flex-1 friday-chat-input-wrapper">
                <input
                  type="text"
                  className="friday-chat-input w-full"
                  placeholder={
                    activeCategory === 'pdf'
                      ? 'Type a question about the PDF contents...'
                      : 'Ask F.R.I.D.A.Y. a question...'
                  }
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={isTyping}
                />
              </div>
              <button
                type="submit"
                className="p-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full hover:shadow-purple-500/20 shadow-lg transition active:scale-95 text-white shrink-0"
                disabled={isTyping || !inputVal.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Progress & Mentor Suggestions */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Circular progress dial card */}
          <div className="friday-glass-card p-5 rounded-2xl flex flex-col items-center">
            <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">Readiness Matrix</h4>
            
            <div className="friday-readiness-dial my-2">
              <svg width="110" height="110">
                <circle
                  cx="55"
                  cy="55"
                  r="45"
                  className="friday-circular-progress-bg"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="55"
                  cy="55"
                  r="45"
                  stroke="url(#dialRedesignGradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (282.7 * statsData.readinessPercentage) / 100}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="dialRedesignGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="friday-readiness-dial-value text-xl font-bold">{statsData.readinessPercentage}%</div>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">PGCET Preparedness</span>

            <div className="grid grid-cols-2 gap-4 w-full mt-5 border-t border-white/5 pt-4 text-left">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Study duration</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {statsData.studyHours}h
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Units Done</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <BookOpenText className="w-3.5 h-3.5 text-purple-400" /> {statsData.completedTopics}
                </span>
              </div>
            </div>
          </div>

          {/* AI Mentor card */}
          <div className="friday-glass-card p-5 rounded-2xl flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" /> Mentor Protocols
              </h4>

              <div className="space-y-3 mt-3 max-h-[200px] overflow-y-auto pr-1">
                {mentorData.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/50 border border-white/5 rounded-xl text-xs text-slate-300 leading-relaxed relative hover:border-cyan-500/20 transition">
                    {rec.replace(/^\d+\.\s*/, '')}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" /> Streak: <strong className="text-white">{statsData.learningStreak}d</strong>
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" /> Goal: <strong className="text-white">{mentorData.dailyGoal || '2h'}</strong>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Launch Cards Section */}
      <div className="friday-glass-card p-6 rounded-2xl mt-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-400" /> Quick Launch Core Protocols
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Explain Topic', category: 'tutor', desc: 'Concept detail', icon: <BookOpen className="w-5 h-5 text-purple-400" /> },
            { label: 'Generate Notes', category: 'tutor', desc: 'Revision PDF', icon: <FileText className="w-5 h-5 text-blue-400" /> },
            { label: 'Mock Test', category: 'pgcet', desc: '20 questions', icon: <CheckSquare className="w-5 h-5 text-emerald-400" /> },
            { label: 'Upload PDF', category: 'pdf', desc: 'Parse papers', icon: <Paperclip className="w-5 h-5 text-amber-400" /> },
            { label: 'Coding Help', category: 'coding', desc: 'Write & debug', icon: <Code className="w-5 h-5 text-pink-400" /> },
            { label: 'PGCET Practice', category: 'pgcet', desc: 'Revision tips', icon: <Trophy className="w-5 h-5 text-indigo-400" /> },
            { label: 'Ask AI', category: 'tutor', desc: 'Doubt clearing', icon: <HelpCircle className="w-5 h-5 text-rose-400" /> },
            { label: 'Analytics', category: 'tutor', desc: 'ML Insights', icon: <BarChart2 className="w-5 h-5 text-cyan-400" /> }
          ].map((act, i) => (
            <div
              key={i}
              onClick={() => handleQuickAction(act.label, act.category)}
              className="friday-action-lift-card p-4 bg-slate-950/40 border border-white/5 rounded-xl cursor-pointer text-center select-none flex flex-col items-center gap-2 justify-center"
            >
              {act.icon}
              <div className="font-bold text-xs text-white truncate max-w-full">{act.label}</div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">{act.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
