import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, X, Maximize2, Minimize2, 
  ChevronRight, Smartphone, Tablet as TabletIcon, RotateCw, Monitor,
  Sparkles, Code, BookOpen, GraduationCap, Award, Compass, Trophy, Zap, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Synthesize UI sound effects via Web Audio API so it requires no external assets
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'hover') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    // Web audio block
  }
};

let audioCtx = null;
let musicInterval = null;
let musicNodes = [];

const startBackgroundMusic = () => {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // Ambient arpeggio chord progression: Cmaj9 -> Am9 -> Fmaj9 -> G13
    const chords = [
      [261.63, 329.63, 392.00, 493.88, 523.25], // Cmaj9
      [220.00, 261.63, 329.63, 392.00, 440.00], // Am9
      [174.61, 220.00, 261.63, 329.63, 349.23], // Fmaj9
      [196.00, 246.94, 293.66, 392.00, 440.00]  // G13
    ];
    
    let chordIdx = 0;
    const playChord = () => {
      if (!audioCtx || audioCtx.state === 'closed') return;
      const t = audioCtx.currentTime;
      const notes = chords[chordIdx];
      
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        
        const delay = idx * 0.12;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.015, t + delay + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 2.8);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(t + delay);
        osc.stop(t + delay + 3.0);
        musicNodes.push(osc);
      });
      
      chordIdx = (chordIdx + 1) % chords.length;
    };
    
    playChord();
    musicInterval = setInterval(playChord, 3000);
  } catch (e) {}
};

const stopBackgroundMusic = () => {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  musicNodes.forEach(node => {
    try { node.stop(); } catch (e) {}
  });
  musicNodes = [];
  if (audioCtx) {
    try { audioCtx.close(); } catch (e) {}
    audioCtx = null;
  }
};

export default function WatchDemoModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'video', 'tour', 'sandbox', 'mobile'
  
  // Header state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Video State
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoChapter, setVideoChapter] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoInterval = useRef(null);

  const videoChapters = [
    { label: 'Welcome', time: '00:00', duration: 10 },
    { label: 'Dashboard', time: '00:10', duration: 15 },
    { label: 'AI Teacher', time: '00:25', duration: 15 },
    { label: 'Java Learning', time: '00:40', duration: 15 },
    { label: 'Mathematics', time: '00:55', duration: 15 },
    { label: 'DSA Visualization', time: '01:10', duration: 15 },
    { label: 'AI Coding Lab', time: '01:25', duration: 15 },
    { label: 'Career Hub', time: '01:40', duration: 10 },
    { label: 'Certificates', time: '01:50', duration: 10 },
    { label: 'Start Learning', time: '02:00', duration: 10 },
  ];

  // Tour State
  const [tourStep, setTourStep] = useState(0);
  const tourSteps = [
    {
      title: 'Welcome Screen',
      desc: 'EduVerse AI: Where smart learning meets advanced artificial intelligence.',
      highlight: 'Get ready for an fully personalized, gamified workspace.'
    },
    {
      title: 'Dashboard Overview',
      desc: 'Track your XP level, daily streak, and unlock academic certificates.',
      highlight: 'Earn rewards, claim daily combos, and track stats live.'
    },
    {
      title: 'Core Java Learning',
      desc: 'Redesigned core Java hub carrying theoretical structures and tabbed practical playgrounds.',
      highlight: 'Learn syntax rules under direct AI voice explanations.'
    },
    {
      title: 'Python Learning',
      desc: 'Write custom codes, compile instantly, and receive live suggestions.',
      highlight: 'Instant code reviews.'
    },
    {
      title: 'Mathematics Classroom',
      desc: 'Interactive parabolas, formula breakdowns, and statistics simulators.',
      highlight: 'Calculus derivatives and matrices dynamically computed.'
    },
    {
      title: 'DSA Visualizations',
      desc: 'Visualize stack elements, queues, and hierarchical search trees.',
      highlight: 'See nodes shift in real-time.'
    },
    {
      title: 'AI Helper Features',
      desc: 'Your personal AI tutor: doubt solvers and automatic revisions.',
      highlight: 'Explain topics in Kannada instantly.'
    },
    {
      title: 'Career Placement Hub',
      desc: 'Build resume structures, practice mock interviews, and claim certificates.',
      highlight: 'Placement-ready guides.'
    },
    {
      title: 'Ready to Master?',
      desc: 'Join 50k+ students learning future-ready skills.',
      highlight: 'Start your journey completely free today!'
    }
  ];

  // Mobile Mockup State
  const [deviceType, setDeviceType] = useState('iPhone'); // 'iPhone', 'Android', 'Tablet'
  const [isPortrait, setIsPortrait] = useState(true);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    playSound('click');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Video progress simulator
  useEffect(() => {
    if (activeTab === 'video' && isPlaying) {
      videoInterval.current = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          // Sync with chapters
          const currentSeconds = (next / 100) * 120;
          let accum = 0;
          const idx = videoChapters.findIndex(chap => {
            accum += chap.duration;
            return currentSeconds < accum;
          });
          if (idx !== -1) setVideoChapter(idx);
          return next;
        });
      }, 1200);
    } else {
      clearInterval(videoInterval.current);
    }
    return () => clearInterval(videoInterval.current);
  }, [activeTab, isPlaying]);

  // Background music effect
  useEffect(() => {
    if (activeTab === 'video' && isPlaying && !isMuted) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    return () => stopBackgroundMusic();
  }, [activeTab, isPlaying, isMuted]);

  // Stop music on modal close
  useEffect(() => {
    if (!isOpen) {
      stopBackgroundMusic();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto">
        
        {/* Floating gradient mesh background particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 right-10 text-4xl text-white/5 font-mono">{"{ code }"}</div>
          <div className="absolute bottom-10 left-10 text-4xl text-white/5 font-serif">∫ dx</div>
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-6xl bg-slate-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col justify-between min-h-[85vh] z-10"
        >
          {/* HEADER AREA */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 inline-block mb-2">
                🚀 Welcome to EDUVERSE AI
              </span>
              <h1 className="text-xl md:text-2xl font-black text-white">Experience the Future of AI Learning</h1>
              <p className="text-xs text-slate-400">Cinematic Tour • 2 Minutes</p>
            </div>
            
            {/* Window Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsMuted(!isMuted); playSound('click'); }}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button 
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* MAIN MODAL BODY CONTAINER */}
          <div className="flex-1 flex flex-col justify-center py-4">
            
            {/* VIEW 1: MENU OF DEMO OPTIONS */}
            {activeTab === 'menu' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* CARD 1: WATCH CINEMATIC DEMO */}
                <div 
                  onClick={() => { setActiveTab('video'); playSound('click'); setIsPlaying(true); }}
                  className="group relative cursor-pointer p-[1px] rounded-3xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-transparent opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none" />
                  <div className="relative p-6 rounded-3.5xl flex flex-col justify-between h-full bg-[#120e2a]/90 border border-white/5 min-h-[300px]">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-2xl">🎥</div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">Watch Product Demo</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">Watch a high-fidelity cinematic walkthrough of the platform key capabilities.</p>
                    </div>
                    <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1">
                      ▶ Play Demo
                    </button>
                  </div>
                </div>

                {/* CARD 2: INTERACTIVE PRODUCT TOUR */}
                <div 
                  onClick={() => { setActiveTab('tour'); playSound('click'); }}
                  className="group relative cursor-pointer p-[1px] rounded-3xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-transparent opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none" />
                  <div className="relative p-6 rounded-3.5xl flex flex-col justify-between h-full bg-[#120e2a]/90 border border-white/5 min-h-[300px]">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-2xl">🚀</div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">Interactive Product Tour</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">Explore the learning workspace step-by-step with guided instructions.</p>
                    </div>
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition">
                      Start Tour
                    </button>
                  </div>
                </div>

                {/* CARD 3: TRY WITHOUT LOGIN SANDBOX */}
                <div 
                  onClick={() => { setActiveTab('sandbox'); playSound('success'); }}
                  className="group relative cursor-pointer p-[1px] rounded-3xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/30 to-transparent opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none" />
                  <div className="relative p-6 rounded-3.5xl flex flex-col justify-between h-full bg-[#120e2a]/90 border border-white/5 min-h-[300px]">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-2xl">🎮</div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">Try Demo Without Login</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">Access core compilers, classrooms, and visualizers without an account.</p>
                    </div>
                    <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">
                      Launch Demo
                    </button>
                  </div>
                </div>

                {/* CARD 4: MOBILE PREVIEW MOCKUP */}
                <div 
                  onClick={() => { setActiveTab('mobile'); playSound('click'); }}
                  className="group relative cursor-pointer p-[1px] rounded-3xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/30 to-transparent opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none" />
                  <div className="relative p-6 rounded-3.5xl flex flex-col justify-between h-full bg-[#120e2a]/90 border border-white/5 min-h-[300px]">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-2xl">📱</div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">Mobile Experience</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">Preview how EduVerse AI responsive modules fit smaller tablet and phone screens.</p>
                    </div>
                    <button className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition">
                      Open Preview
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: CINEMATIC VIDEO SIMULATOR */}
            {activeTab === 'video' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black flex flex-col justify-between p-6 group">
                  
                  {/* Floating Chapters display */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-white/15 px-3 py-1.5 rounded-lg text-[10px] font-bold text-purple-400">
                    Chapter: {videoChapters[videoChapter].label} ({videoChapters[videoChapter].time})
                  </div>

                  {/* Playback Simulation Graphic Canvas */}
                  <div className="flex-1 flex items-center justify-center w-full h-full relative overflow-hidden">
                    {isPlaying ? (
                      <motion.div 
                        key={videoChapter}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex flex-col items-center justify-center p-4 relative z-10"
                      >
                        {videoChapter === 0 && (
                          <div className="text-center space-y-3">
                            <h2 className="text-3xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Welcome to EduVerse AI</h2>
                            <p className="text-xs text-slate-400">The next-generation smart workspace powered by advanced AI models.</p>
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" style={{ animationDelay: `${i * 0.2}s` }} />)}
                            </div>
                          </div>
                        )}

                        {videoChapter === 1 && (
                          <div className="w-full max-w-sm p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-3">
                            <span className="text-[9px] uppercase font-bold text-indigo-400">Academic Stats Dashboard</span>
                            <div className="grid grid-cols-2 gap-3 text-white">
                              <div className="p-2 rounded bg-black/40 border border-white/5">
                                <span className="text-[8px] text-slate-500 block uppercase">Daily Streak</span>
                                <strong className="text-sm">5 Days 🔥</strong>
                              </div>
                              <div className="p-2 rounded bg-black/40 border border-white/5">
                                <span className="text-[8px] text-slate-500 block uppercase">Level XP</span>
                                <strong className="text-sm">450 XP 🏆</strong>
                              </div>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full w-[45%]" />
                            </div>
                          </div>
                        )}

                        {videoChapter === 2 && (
                          <div className="text-center space-y-4">
                            <span className="text-[9px] uppercase font-bold text-violet-400 block">AI Voice Assistant</span>
                            {/* Voice equalizer waves */}
                            <div className="flex gap-1 justify-center items-end h-8">
                              {[15, 25, 12, 30, 18, 22, 10, 28].map((h, i) => (
                                <motion.div 
                                  key={i} 
                                  animate={{ height: [10, h, 10] }}
                                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                  className="w-1 bg-purple-500 rounded-full" 
                                />
                              ))}
                            </div>
                            <p className="text-xs italic text-slate-300 bg-purple-500/5 border border-purple-500/10 px-4 py-2 rounded-xl">"Explaining the concepts in your selected language..."</p>
                          </div>
                        )}

                        {videoChapter === 3 && (
                          <div className="w-full max-w-md p-4 rounded-xl bg-[#090b16] border border-white/5 text-left font-mono text-[10px]">
                            <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
                              <span className="text-slate-500">CoreJavaHub.java</span>
                              <span className="text-emerald-400 font-bold">RUN ACTIVE</span>
                            </div>
                            <div className="space-y-1 text-slate-300">
                              <div><span className="text-purple-400">public class</span> <span className="text-blue-400">Main</span> {"{"}</div>
                              <div className="pl-4"><span className="text-purple-400">public static void</span> <span className="text-yellow-400">main</span>(String[] args) {"{"}</div>
                              <div className="pl-8 text-emerald-400">System.out.println("Hello, EduVerse!");</div>
                              <div className="pl-4">{"}"}</div>
                              <div>{"}"}</div>
                            </div>
                          </div>
                        )}

                        {videoChapter === 4 && (
                          <div className="w-[180px] h-[120px] border border-white/10 rounded-xl bg-black flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-5">
                              {Array.from({ length: 16 }).map((_, i) => <div key={i} className="border border-white" />)}
                            </div>
                            {/* Axis */}
                            <div className="absolute w-full h-[1px] bg-slate-800" />
                            <div className="absolute h-full w-[1px] bg-slate-800" />
                            {/* Wave representation */}
                            <svg className="w-full h-full stroke-purple-500 fill-none" viewBox="0 0 100 40">
                              <path d="M 10,20 Q 30,5 50,20 T 90,20" strokeWidth="1.5" />
                            </svg>
                            <span className="absolute bottom-1 right-1 text-[8px] font-mono text-purple-400">y = sin(x)</span>
                          </div>
                        )}

                        {videoChapter === 5 && (
                          <div className="flex gap-6 justify-center items-center">
                            {[
                              { label: 'Root (15)', active: true },
                              { label: 'Left (10)', active: false },
                              { label: 'Right (20)', active: false }
                            ].map((node, i) => (
                              <div 
                                key={i} 
                                className={`w-14 h-14 rounded-full border flex items-center justify-center text-[9px] font-mono ${
                                  node.active ? 'border-purple-500 bg-purple-500/10 text-white font-bold' : 'border-slate-800 bg-slate-950 text-slate-400'
                                }`}
                              >
                                {node.label}
                              </div>
                            ))}
                          </div>
                        )}

                        {videoChapter === 6 && (
                          <div className="w-full max-w-sm p-4 rounded-xl bg-black border border-white/5 text-left font-mono text-[9px] text-slate-400">
                            <div>$ javac Compiler.java</div>
                            <div className="text-emerald-400">Compilation successful. 0 errors, 0 warnings.</div>
                            <div className="text-purple-400 mt-2">💡 AI suggestion: optimize memory layout using cache structures.</div>
                          </div>
                        )}

                        {videoChapter === 7 && (
                          <div className="w-full max-w-sm p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-3">
                            <span className="text-[9px] uppercase font-bold text-blue-400 block">Career Prep Hub Checklist</span>
                            <div className="space-y-1 text-slate-350 text-xs">
                              <div className="flex items-center gap-1.5"><CheckCircle2 className="text-emerald-500 w-3 h-3" /> Resume Builder (Completed)</div>
                              <div className="flex items-center gap-1.5"><CheckCircle2 className="text-emerald-500 w-3 h-3" /> AI Interview Simulation (Passed)</div>
                              <div className="flex items-center gap-1.5"><CheckCircle2 className="text-emerald-500 w-3 h-3" /> Mock Placement Tests (Ready)</div>
                            </div>
                          </div>
                        )}

                        {videoChapter === 8 && (
                          <div className="text-center space-y-3">
                            <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-xl mx-auto animate-bounce">🎓</div>
                            <h3 className="text-sm font-bold text-white">Claim Verification Certificates</h3>
                            <p className="text-[10px] text-slate-500">Official, shareable, secure blockchain records for every completed course.</p>
                          </div>
                        )}

                        {videoChapter === 9 && (
                          <div className="text-center space-y-3">
                            <span className="text-4xl block animate-spin" style={{ animationDuration: '4s' }}>✨</span>
                            <h3 className="text-base font-black text-white">Join the Future Today</h3>
                            <p className="text-xs text-slate-400">Your personalized learning assistant is waiting.</p>
                          </div>
                        )}

                      </motion.div>
                    ) : (
                      <div className="text-center space-y-4">
                        <button 
                          onClick={() => setIsPlaying(true)}
                          className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg cursor-pointer mx-auto"
                        >
                          <Play size={24} fill="currentColor" />
                        </button>
                        <p className="text-xs text-slate-500">Click to start the cinematic walkthrough</p>
                      </div>
                    )}
                  </div>

                  {/* Modern Glass Video Controls */}
                  <div className="bg-black/65 backdrop-blur-md border border-white/10 p-4 rounded-xl space-y-3">
                    {/* Progress slider */}
                    <div className="relative w-full h-1 bg-white/20 rounded overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-purple-500" style={{ width: `${videoProgress}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="text-white hover:text-purple-400 transition"
                        >
                          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        </button>
                        <span className="font-mono text-[10px] text-slate-400">
                          {Math.floor((videoProgress / 100) * 120 / 60)}:
                          {String(Math.floor((videoProgress / 100) * 120 % 60)).padStart(2, '0')} / 02:00
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-slate-400">
                        <button className="hover:text-white transition">Subtitles (On)</button>
                        <button className="hover:text-white transition">1080p</button>
                        <button onClick={() => { playSound('click'); setVideoProgress(100); }} className="hover:text-white transition">Skip Demo</button>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => { setActiveTab('menu'); setIsPlaying(false); }}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-white/5"
                  >
                    Back to Menu
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: INTERACTIVE GUIDED TOUR */}
            {activeTab === 'tour' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <span className="text-4xl">🚀</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    Tour Step {tourStep + 1} of {tourSteps.length}
                  </span>
                  <h3 className="text-2xl font-black text-white">{tourSteps[tourStep].title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{tourSteps[tourStep].desc}</p>
                </div>

                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-xs font-bold text-blue-300">
                  ⚡ {tourSteps[tourStep].highlight}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button 
                    disabled={tourStep === 0}
                    onClick={() => { setTourStep(prev => prev - 1); playSound('click'); }}
                    className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    Previous
                  </button>

                  {tourStep < tourSteps.length - 1 ? (
                    <button 
                      onClick={() => { setTourStep(prev => prev + 1); playSound('click'); }}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      Next Step <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => { 
                        playSound('success');
                        setActiveTab('menu'); 
                        setTourStep(0); 
                        onClose();
                        navigate('/subjects');
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-xl shadow-lg"
                    >
                      Start Learning Free
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW 4: SANDBOX TRY WITHOUT LOGIN */}
            {activeTab === 'sandbox' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Demo Mode Banner */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4 max-w-4xl mx-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <strong className="text-xs text-amber-200 block">DEMO MODE ACTIVE</strong>
                      <span className="text-[10px] text-slate-400">Saving progress, earning certifications, and leaderboards are disabled. Log in to claim achievements.</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onClose(); navigate('/subjects'); }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-slate-950 text-xs font-bold rounded-xl transition"
                  >
                    Launch Full Sandbox
                  </button>
                </div>

                {/* Selector cards to mock platforms */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {[
                    { title: 'Core Java IDE', icon: '☕', link: '/subjects' },
                    { title: 'Python Classroom', icon: '🐍', link: '/subjects' },
                    { title: 'Math Visualizer', icon: '📐', link: '/subjects' },
                    { title: 'DSA Lab Board', icon: '🧮', link: '/subjects' }
                  ].map((card, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        playSound('click');
                        onClose();
                        navigate(card.link);
                      }}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 transition text-center cursor-pointer space-y-3"
                    >
                      <span className="text-3xl block">{card.icon}</span>
                      <strong className="text-xs text-slate-200 block">{card.title}</strong>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => setActiveTab('menu')}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-white/5"
                  >
                    Back to Menu
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW 5: MOBILE/TABLET PREVIEW */}
            {activeTab === 'mobile' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Selection Bar */}
                <div className="flex justify-center gap-3">
                  {['iPhone', 'Android', 'Tablet'].map(dev => (
                    <button
                      key={dev}
                      onClick={() => { setDeviceType(dev); playSound('click'); }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${deviceType === dev ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                    >
                      {dev}
                    </button>
                  ))}
                  <button 
                    onClick={() => { setIsPortrait(!isPortrait); playSound('click'); }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold border border-slate-800 text-slate-400 hover:text-white flex items-center gap-1.5"
                  >
                    <RotateCw size={12} /> {isPortrait ? 'Landscape' : 'Portrait'}
                  </button>
                </div>

                {/* Device Frame Representation */}
                <div className="flex justify-center items-center py-4">
                  <motion.div
                    animate={{ 
                      width: deviceType === 'Tablet' ? (isPortrait ? 400 : 540) : (isPortrait ? 220 : 420),
                      height: deviceType === 'Tablet' ? (isPortrait ? 540 : 400) : (isPortrait ? 420 : 220),
                      rotate: 0
                    }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="border-8 border-slate-900 rounded-3xl bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 text-center"
                  >
                    {/* Speaker Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-slate-900 rounded-full" />
                    
                    <div className="flex-1 flex flex-col justify-center items-center p-2">
                      <GraduationCap className="text-cyan-400 animate-bounce mb-2" size={32} />
                      <strong className="text-xs text-white block">EduVerse AI Mobile</strong>
                      <span className="text-[9px] text-slate-400 mt-1">Responsive compiler & theory modules run natively at 60 FPS on iOS and Android.</span>
                    </div>

                    <span className="text-[8px] uppercase tracking-widest text-slate-600 block">EduVerse OS</span>
                  </motion.div>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => setActiveTab('menu')}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-white/5"
                  >
                    Back to Menu
                  </button>
                </div>
              </motion.div>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
