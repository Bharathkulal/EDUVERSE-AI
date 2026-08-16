import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, X, Maximize2, Minimize2, 
  ChevronRight, Smartphone, Tablet as TabletIcon, RotateCw, Monitor,
  Sparkles, Code, BookOpen, GraduationCap, Award, Compass, Trophy, Zap, CheckCircle2,
  Sun, Moon, Info, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

function TypingText({ text, speed = 25 }) {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

export default function WatchDemoModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { startGuestSession } = useAuth();
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

  // Redesigned Device Simulator States
  const [deviceType, setDeviceType] = useState('iPhone'); // 'iPhone', 'Android', 'Tablet', 'Desktop', 'Windows', 'macOS'
  const [isPortrait, setIsPortrait] = useState(true);
  const [demoRunning, setDemoRunning] = useState(true);
  const [demoStep, setDemoStep] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'dashboard', 'learn', 'math', 'math-solved', 'coding', 'coding-terminal', 'ai-chat', 'notes'
  const [simulatedDarkMode, setSimulatedDarkMode] = useState(true);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Window width and height tracking for fluid responsive scaling of device mockups
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute scale and height dynamically to prevent any cropping/overflow on smaller screens
  const getDeviceDimensions = () => {
    let width = 300;
    let height = 600;
    if (deviceType === 'Tablet') {
      width = isPortrait ? 420 : 567;
      height = isPortrait ? 567 : 420;
    } else if (deviceType === 'Desktop') {
      width = 640;
      height = 375;
    } else if (deviceType === 'Windows' || deviceType === 'macOS') {
      width = 600;
      height = 366;
    } else {
      // iPhone / Android
      width = isPortrait ? 300 : 600;
      height = isPortrait ? 600 : 300;
    }
    const maxAllowedWidth = Math.min(windowWidth - 64, 1100);
    const maxAllowedHeight = Math.max(250, windowHeight - 320);
    const scaleWidth = maxAllowedWidth < width ? maxAllowedWidth / width : 1;
    const scaleHeight = maxAllowedHeight < height ? maxAllowedHeight / height : 1;
    const scale = Math.max(0.45, Math.min(scaleWidth, scaleHeight, 1));
    return { width, height, scale };
  };
  const { height: baseHeight, scale: deviceScale } = getDeviceDimensions();

  const simulatorSteps = useRef([
    { screen: 'home', desc: 'Home Screen' },
    { screen: 'dashboard', desc: 'Open Dashboard' },
    { screen: 'learn', desc: 'Open Learn Modules' },
    { screen: 'math', desc: 'Open Mathematics' },
    { screen: 'math-solved', desc: 'Solve Equation' },
    { screen: 'coding', desc: 'Open Coding IDE' },
    { screen: 'coding-terminal', desc: 'Execute Python Code' },
    { screen: 'ai-chat', desc: 'AI Explains Output' },
    { screen: 'notes', desc: 'Generate Study Notes' }
  ]).current;

  // Handle step changes safely and synchronously
  const goToStep = useCallback((stepIndex) => {
    try {
      const idx = (stepIndex + simulatorSteps.length) % simulatorSteps.length;
      setDemoStep(idx);
      setCurrentScreen(simulatorSteps[idx].screen);
    } catch (e) {
      console.error("Animation step transition crash:", e);
      // Auto-restart recovery mechanism
      setDemoStep(0);
      setCurrentScreen('home');
    }
  }, [simulatorSteps]);

  // Main Autoplay Timer with proper dependencies, clean up and hover pause support
  useEffect(() => {
    if (activeTab !== 'mobile' || !demoRunning || isHovered || !isOpen) {
      return;
    }
    const timer = setInterval(() => {
      goToStep(demoStep + 1);
    }, 3800);
    return () => clearInterval(timer);
  }, [activeTab, demoRunning, isHovered, isOpen, demoStep, goToStep]);

  // Keyboard navigation listener (ArrowRight/Left to navigate, Space to toggle play/pause)
  useEffect(() => {
    if (activeTab !== 'mobile' || !isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        playSound('click');
        goToStep(demoStep + 1);
      } else if (e.key === 'ArrowLeft') {
        playSound('click');
        goToStep(demoStep - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        playSound('click');
        setDemoRunning(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isOpen, demoStep, goToStep]);

  // Touch Swipe Gesture Tracking
  const touchStart = useRef(0);
  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    if (Math.abs(diff) > 55) {
      playSound('click');
      if (diff > 0) {
        goToStep(demoStep + 1); // Swipe left -> next
      } else {
        goToStep(demoStep - 1); // Swipe right -> prev
      }
    }
  };

  const handleDoubleClickRestart = () => {
    playSound('success');
    goToStep(0);
    setDemoRunning(true);
    toast.success("Demo restarted!");
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - (box.width / 2);
    const y = e.clientY - box.top - (box.height / 2);
    setMousePos({ x: (x / (box.width / 2)) * 12, y: -(y / (box.height / 2)) * 12 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHovered(false);
  };

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
      <div className="fixed inset-0 z-50 flex justify-center items-center p-4 md:p-6 bg-black/95 backdrop-blur-xl">
        
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
          className="relative w-full max-w-6xl bg-slate-950/85 border border-white/10 rounded-3xl shadow-2xl p-5 md:p-6 flex flex-col justify-between my-auto z-10 max-h-[90vh] overflow-y-auto custom-sidebar-scroll"
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
                    onClick={() => { startGuestSession(); onClose(); navigate('/subjects'); }}
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
                        startGuestSession();
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
                className="space-y-8 text-left max-w-5xl mx-auto"
              >
                {/* Device Selector Toolbar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'iPhone', label: '📱 iPhone' },
                      { id: 'Android', label: '🤖 Android' },
                      { id: 'Tablet', label: '📟 Tablet' },
                      { id: 'Desktop', label: '🖥️ Desktop' },
                      { id: 'Windows', label: '🪟 Windows' },
                      { id: 'macOS', label: '🍎 macOS' }
                    ].map(dev => (
                      <button
                        key={dev.id}
                        onClick={() => { setDeviceType(dev.id); if (dev.id === 'Desktop' || dev.id === 'Windows' || dev.id === 'macOS') { setIsPortrait(false); } playSound('click'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-0 ${
                          deviceType === dev.id 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-650 text-white shadow-lg' 
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {dev.label}
                      </button>
                    ))}
                  </div>

                  {/* Device orientation and controllers */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(deviceType === 'iPhone' || deviceType === 'Android' || deviceType === 'Tablet') && (
                      <button
                        onClick={() => { setIsPortrait(!isPortrait); playSound('click'); }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer border border-white/5"
                      >
                        <RotateCw size={12} /> Rotate View
                      </button>
                    )}

                    <button
                      onClick={() => { setDemoRunning(!demoRunning); playSound('click'); }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer border-0 ${
                        demoRunning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}
                    >
                      {demoRunning ? <Pause size={12} /> : <Play size={12} />}
                      {demoRunning ? 'Pause Demo' : 'Play Demo'}
                    </button>

                    <button
                      onClick={() => { setDemoStep(0); setCurrentScreen('home'); playSound('click'); }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer border border-white/5"
                    >
                      <RotateCcw size={12} /> Restart
                    </button>

                    <button
                      onClick={() => { setSimulatedDarkMode(!simulatedDarkMode); playSound('click'); }}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition cursor-pointer border border-white/5"
                    >
                      {simulatedDarkMode ? <Sun size={13} /> : <Moon size={13} />}
                    </button>

                    <button
                      onClick={() => { setShowDeviceInfo(!showDeviceInfo); playSound('click'); }}
                      className={`p-1.5 rounded-lg transition cursor-pointer border border-white/5 ${
                        showDeviceInfo ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Info size={13} />
                    </button>
                  </div>
                </div>

                {/* ─── PREMIUM DEVICE CANVAS SHOWCASE ─── */}
                <div 
                  className="relative flex justify-center items-center py-8 px-4 md:px-12 bg-slate-955/45 backdrop-blur-xl rounded-3xl border border-white/10 select-none cursor-grab active:cursor-grabbing overflow-visible transition-all duration-500 shadow-2xl shadow-indigo-950/20"
                  style={{ minHeight: `${Math.max(380, baseHeight * deviceScale + 120)}px` }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseEnter={() => setIsHovered(true)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onDoubleClick={handleDoubleClickRestart}
                >
                  {/* Glassmorphic layered background gradients */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/10 via-slate-900/20 to-blue-900/10 rounded-3xl pointer-events-none" />
                  
                  {/* Corner Accent Brackets */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/15 rounded-tl-lg pointer-events-none" />
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/15 rounded-tr-lg pointer-events-none" />
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/15 rounded-bl-lg pointer-events-none" />
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/15 rounded-br-lg pointer-events-none" />

                  {/* Soft ambient glow behind the phone */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

                  {/* Floating Particle Accents */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/30"
                        style={{
                          top: `${15 + i * 14}%`,
                          left: `${10 + (i * 17) % 80}%`,
                        }}
                        animate={{
                          y: [0, -25, 0],
                          opacity: [0.15, 0.45, 0.15],
                          scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                          duration: 4 + i,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.5
                        }}
                      />
                    ))}
                  </div>

                  {/* Dynamic 3D shadow linked to the device float */}
                  <motion.div 
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full bg-black/60 blur-xl pointer-events-none z-0"
                    animate={{
                      width: [Math.max(120, 240 * deviceScale), Math.max(90, 190 * deviceScale), Math.max(120, 240 * deviceScale)],
                      height: [14, 8, 14],
                      opacity: [0.7, 0.4, 0.7]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* The interactive floating container */}
                  <motion.div 
                    className="relative z-10 transition-all duration-300 ease-out"
                    animate={{
                      y: [0, -18, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      transform: `perspective(1200px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg) scale(${deviceScale})`,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {deviceType === 'iPhone' && (
                      <div 
                        className={`border-[10px] border-slate-900 bg-[#080a13] shadow-2xl relative transition-all duration-500 rounded-[40px] ${
                          isPortrait ? 'w-[300px] h-[600px]' : 'w-[600px] h-[300px]'
                        }`}
                        style={{
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 4px rgba(255,255,255,0.15)'
                        }}
                      >
                        {isPortrait ? (
                          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-45 border border-white/5 flex items-center justify-between px-3 text-[7px] text-white/55 font-mono select-none">
                            <span className="w-1.5 h-1.5 bg-blue-500/80 rounded-full animate-ping" />
                            <span>EDUVERSE OS</span>
                            <div className="flex gap-0.5 items-center">
                              <span className="w-1 h-1 bg-green-500 rounded-full" />
                              <div className="w-1 h-2 bg-slate-800 rounded-t" />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-28 bg-black rounded-full z-45 border border-white/5 flex flex-col items-center justify-between py-3 text-[7px] text-white/55 font-mono select-none">
                            <span className="w-1.5 h-1.5 bg-blue-500/80 rounded-full animate-ping" />
                            <span className="rotate-90">EDUVERSE</span>
                            <span className="w-1 h-1 bg-green-500 rounded-full" />
                          </div>
                        )}

                        <div className="w-full h-full rounded-[30px] overflow-hidden p-3 pt-7 pb-4 bg-slate-950 flex flex-col justify-between text-left text-white relative">
                          <SimulatedScreenContent screen={currentScreen} setScreen={setCurrentScreen} isDarkMode={simulatedDarkMode} isPortrait={isPortrait} />
                        </div>
                      </div>
                    )}

                    {deviceType === 'Android' && (
                      <div 
                        className={`border-[8px] border-slate-900 bg-[#080a13] shadow-2xl relative transition-all duration-500 rounded-[28px] ${
                          isPortrait ? 'w-[300px] h-[600px]' : 'w-[600px] h-[300px]'
                        }`}
                        style={{
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 2px rgba(255,255,255,0.1)'
                        }}
                      >
                        {isPortrait ? (
                          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-45 border border-white/5" />
                        ) : (
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full z-45 border border-white/5" />
                        )}

                        <div className="w-full h-full rounded-[20px] overflow-hidden p-3 pt-8 pb-3 bg-slate-950 flex flex-col justify-between text-left text-white relative">
                          <SimulatedScreenContent screen={currentScreen} setScreen={setCurrentScreen} isDarkMode={simulatedDarkMode} isPortrait={isPortrait} />
                        </div>
                      </div>
                    )}

                    {deviceType === 'Tablet' && (
                      <div 
                        className={`border-[12px] border-slate-900 bg-[#080a13] shadow-2xl relative transition-all duration-500 rounded-[32px] ${
                          isPortrait ? 'w-[420px] h-[567px]' : 'w-[567px] h-[420px]'
                        }`}
                        style={{
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 3px rgba(255,255,255,0.15)'
                        }}
                      >
                        {isPortrait ? (
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rounded-full z-45 border border-white/5" />
                        ) : (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full z-45 border border-white/5" />
                        )}

                        <div className="w-full h-full rounded-[22px] overflow-hidden p-4 pt-6 pb-4 bg-slate-950 flex flex-col justify-between text-left text-white relative">
                          <SimulatedScreenContent screen={currentScreen} setScreen={setCurrentScreen} isDarkMode={simulatedDarkMode} isPortrait={isPortrait} />
                        </div>
                      </div>
                    )}

                    {deviceType === 'Desktop' && (
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-[640px] h-[375px] border-[10px] border-slate-900 bg-[#080a13] shadow-2xl relative rounded-t-[16px] rounded-b-[4px] overflow-hidden flex flex-col justify-between"
                          style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}
                        >
                          <div className="flex-1 w-full overflow-hidden p-4 bg-slate-950 flex flex-col justify-between text-left text-white relative">
                            <SimulatedScreenContent screen={currentScreen} setScreen={setCurrentScreen} isDarkMode={simulatedDarkMode} isPortrait={false} isDesktop />
                          </div>
                        </div>
                        <div className="w-24 h-16 bg-slate-800 border-x border-slate-700/30" />
                        <div className="w-48 h-3 bg-slate-900 rounded-t-lg shadow-md" />
                      </div>
                    )}

                    {deviceType === 'Windows' && (
                      <div 
                        className="w-[600px] h-[366px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex flex-col shadow-2xl"
                        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}
                      >
                        <div className="h-8 bg-slate-900 px-3 flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-white/5">
                          <span className="flex items-center gap-1.5">🪟 EduVerse AI App - Windows</span>
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-700" />
                            <span className="w-2 h-2 rounded-full bg-slate-700" />
                            <span className="w-2 h-2 rounded-full bg-red-750" />
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden p-4 bg-slate-950 flex flex-col justify-between text-left text-white relative">
                          <SimulatedScreenContent screen={currentScreen} setScreen={setCurrentScreen} isDarkMode={simulatedDarkMode} isPortrait={false} isDesktop />
                        </div>
                      </div>
                    )}

                    {deviceType === 'macOS' && (
                      <div 
                        className="w-[600px] h-[366px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex flex-col shadow-2xl"
                        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}
                      >
                        <div className="h-8 bg-[#181a24] px-4 flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-white/5">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500/80" />
                            <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                            <span className="w-2 h-2 rounded-full bg-green-500/80" />
                          </div>
                          <span>🍎 EduVerse AI - macOS App</span>
                          <span className="w-4" />
                        </div>
                        <div className="flex-1 overflow-hidden p-4 bg-slate-950 flex flex-col justify-between text-left text-white relative">
                          <SimulatedScreenContent screen={currentScreen} setScreen={setCurrentScreen} isDarkMode={simulatedDarkMode} isPortrait={false} isDesktop />
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {showDeviceInfo && (
                    <div className="absolute top-4 left-4 max-w-xs p-4 rounded-xl bg-slate-950/95 border border-white/10 backdrop-blur-md text-[10px] leading-relaxed z-50 text-slate-400 space-y-2">
                      <h4 className="font-extrabold text-white flex items-center gap-1.5"><Sparkles size={10} className="text-blue-400" /> Emulator Hardware Info</h4>
                      <p>• <strong>Selected Mockup:</strong> {deviceType}</p>
                      <p>• <strong>Rendering mode:</strong> GPU 3D Matrix Transform</p>
                      <p>• <strong>Fluid rate:</strong> 60 FPS transitions</p>
                      <p>• <strong>Orientation:</strong> {isPortrait ? 'Portrait' : 'Landscape'}</p>
                    </div>
                  )}

                  {/* Interactive Status Indicator Pill */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-slate-900/80 backdrop-blur-lg border border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400 shadow-lg flex items-center gap-2.5 z-20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span>Hover to tilt 3D canvas • Click elements inside screen to interact</span>
                  </div>
                </div>

                {/* ─── REDESIGNED AUTO DEMO PROGRESS BAR ─── */}
                <div className="bg-slate-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                  {/* Step Info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Current Demo Module</span>
                      <h3 className="text-base font-extrabold text-white mt-0.5 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent capitalize">
                        {simulatorSteps[demoStep].desc}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">Step {demoStep + 1} of {simulatorSteps.length}</span>
                      <span className="h-4 w-px bg-white/10" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {demoRunning && !isHovered ? 'Running' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Indicator Dots / Pill bars */}
                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                    {simulatorSteps.map((step, idx) => {
                      const isActive = demoStep === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            goToStep(idx);
                            setDemoRunning(false); // Pause autoplay on manual click
                            playSound('click');
                          }}
                          className={`relative h-2.5 rounded-full overflow-hidden transition-all duration-305 cursor-pointer border-0 ${
                            isActive ? 'bg-indigo-950 ring-1 ring-indigo-500/50' : 'bg-white/5 hover:bg-white/10'
                          }`}
                          title={step.desc}
                        >
                          {isActive && demoRunning && !isHovered && (
                            <motion.div
                              key={demoStep}
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 3.8, ease: 'linear' }}
                              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                            />
                          )}
                          {isActive && (!demoRunning || isHovered) && (
                            <div className="absolute inset-0 bg-blue-500" />
                          )}
                          {idx < demoStep && (
                            <div className="absolute inset-0 bg-indigo-500/40" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Step labels selector list */}
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {simulatorSteps.map((step, idx) => {
                      const isActive = demoStep === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            goToStep(idx);
                            setDemoRunning(false);
                            playSound('click');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer border-0 ${
                            isActive 
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {step.desc.replace('Open ', '')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Keyboard + gesture legend */}
                <div className="flex flex-wrap justify-center gap-4 text-[10px] text-slate-650 font-mono">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 text-[9px]">←</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 text-[9px]">→</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1.5"><kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 text-[9px]">Space</kbd> Play/Pause</span>
                  <span>👆 Swipe on mobile</span>
                  <span>⏸ Hover to pause</span>
                  <span>↩ Double-click restart</span>
                </div>

                {/* Install Platforms section */}
                <div className="p-8 rounded-3xl bg-gradient-to-b from-[#090e18] to-[#04060c] border border-white/5 space-y-6 text-center">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Download & Install EDUVERSE AI</h3>
                    <p className="text-xs text-slate-400 mt-1">Get the native desktop wrapper or mobile application on all systems</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[
                      { name: 'Android APK', icon: '🤖', badge: null, desc: 'Direct Package' },
                      { name: 'Google Play', icon: '🛍️', badge: null, desc: 'Play Store' },
                      { name: 'Apple App Store', icon: '🍏', badge: 'Coming Soon', desc: 'iOS App' },
                      { name: 'Windows Client', icon: '🪟', badge: null, desc: 'Desktop Installer' },
                      { name: 'macOS Client', icon: '🍎', badge: 'Coming Soon', desc: 'Silicon/Intel' },
                      { name: 'Linux Binary', icon: '🐧', badge: null, desc: 'Debian/Arch' },
                      { name: 'Web Version', icon: '🛜', badge: null, desc: 'PWA Web' }
                    ].map((plat, idx) => (
                      <div 
                        key={idx}
                        className="group p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-blue-500/30 transition flex flex-col items-center justify-between text-center relative"
                      >
                        {plat.badge && (
                          <span className="absolute top-2 right-2 text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">{plat.badge}</span>
                        )}
                        <span className="text-2xl mt-2 block filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{plat.icon}</span>
                        <div className="mt-3">
                          <strong className="text-xs text-slate-200 block group-hover:text-white transition">{plat.name}</strong>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{plat.desc}</span>
                        </div>
                        <button 
                          disabled={!!plat.badge}
                          onClick={() => { toast.success(`${plat.name} download started!`); playSound('click'); }}
                          className={`mt-4 w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition border-0 cursor-pointer ${
                            plat.badge 
                              ? 'bg-slate-950 text-slate-600' 
                              : 'bg-white/5 text-white hover:bg-blue-600'
                          }`}
                        >
                          {plat.badge ? 'Locked' : 'Get App'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button 
                    onClick={() => setActiveTab('menu')}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-white/5 cursor-pointer"
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

function SimulatedScreenContent({ screen, setScreen, isDarkMode, isPortrait, isDesktop = false }) {
  const themeBg = isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const cardBg = isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-100 border-slate-200';
  const borderCol = isDarkMode ? 'border-white/5' : 'border-slate-200';

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
      }
    } catch(e){}
  };

  return (
    <div className={`w-full h-full flex flex-col justify-between ${themeBg} font-sans overflow-hidden text-left relative z-10 rounded-xl`}>
      {/* 1. Status Bar */}
      {!isDesktop && (
        <div className="h-6 flex items-center justify-between px-3 text-[9px] font-black uppercase text-slate-500 z-40 relative">
          <span>9:41 AM</span>
          <div className="flex items-center gap-1">
            <span>📶</span>
            <span>🛜</span>
            <span>98% 🔋</span>
          </div>
        </div>
      )}

      {/* 2. Main simulated screen page */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-4 custom-sidebar-scroll select-none relative min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, scale: 0.96, x: 12, filter: 'drop-shadow(0 0 0px rgba(59,130,246,0))' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0, 
              filter: 'drop-shadow(0 4px 12px rgba(59,130,246,0.12))' 
            }}
            exit={{ opacity: 0, scale: 0.96, x: -12 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="w-full space-y-4"
          >
            {/* SCREEN 1: Home View */}
            {screen === 'home' && (
              <div className="space-y-4 text-left">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-blue-400">EduVerse AI Platform</span>
                  <h4 className="text-sm font-black leading-tight flex items-center gap-1.5 mt-0.5">
                    Hello Student 👋
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-none mt-1">Welcome Back</p>
                </div>

                {/* Quick Actions Grid */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-slate-500">Quick Actions</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Learn', icon: '📚', target: 'learn' },
                      { label: 'AI Tutor', icon: '🤖', target: 'ai-chat' },
                      { label: 'Coding Lab', icon: '💻', target: 'coding' },
                      { label: 'Mathematics', icon: '🧮', target: 'math' },
                      { label: 'Science Lab', icon: '🧪', target: 'learn' },
                      { label: 'Dashboard', icon: '📊', target: 'dashboard' }
                    ].map((act, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => { setScreen(act.target); playSound('click'); }}
                        className={`p-2 rounded-xl border flex items-center gap-2 ${cardBg} hover:border-blue-500/30 transition cursor-pointer active:scale-95`}
                      >
                        <span className="text-base">{act.icon}</span>
                        <strong className="text-[9px] font-black">{act.label}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Progress */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-slate-500">Recent Learning</span>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Continue Python', progress: 65, color: 'bg-emerald-500' },
                      { name: 'Continue Java', progress: 42, color: 'bg-blue-500' }
                    ].map((prog, idx) => (
                      <div key={idx} className={`p-2 rounded-xl border ${cardBg}`}>
                        <div className="flex justify-between text-[8px] font-bold">
                          <span>{prog.name}</span>
                          <span>{prog.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div className={`h-full ${prog.color}`} style={{ width: `${prog.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: Dashboard View */}
            {screen === 'dashboard' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-black text-blue-400">Student Analytics</span>
                  <h4 className="text-sm font-black mt-0.5">My Learning Center</h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                    <span className="text-[8px] text-slate-500 uppercase font-black block">Total XP</span>
                    <strong className="text-sm font-extrabold mt-1 block">1,850 XP</strong>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                    <span className="text-[8px] text-slate-500 uppercase font-black block">Rank Tier</span>
                    <strong className="text-sm text-teal-400 font-extrabold mt-1 block">Level 12</strong>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${cardBg} space-y-2`}>
                  <span className="text-[9px] font-black uppercase text-slate-500">Weekly Activity Log</span>
                  <div className="flex justify-between items-end h-16 pt-2">
                    {[45, 60, 30, 90, 15, 75, 50].map((h, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-2.5 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t" style={{ height: `${h}%` }} />
                        <span className="text-[7px] text-slate-650">Day {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: Learn Subjects View */}
            {screen === 'learn' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-black text-blue-400">Modules Catalog</span>
                  <h4 className="text-sm font-black mt-0.5">Academic Subjects</h4>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Core Java Programming', desc: 'Object-oriented logic compilers.', icon: '☕', label: '12 topics' },
                    { title: 'Advanced Python IDE', desc: 'Data structures & algorithm visualizer.', icon: '🐍', label: '8 topics' },
                    { title: 'Mathematics Studio', desc: 'Step-by-step calculus solvers.', icon: '🧮', label: '15 topics' }
                  ].map((sub, idx) => (
                    <div key={idx} className={`p-3 rounded-2xl border flex gap-3 items-start ${cardBg}`}>
                      <span className="text-2xl">{sub.icon}</span>
                      <div className="text-left">
                        <strong className="text-[10px] font-extrabold block leading-tight">{sub.title}</strong>
                        <span className="text-[8px] text-slate-400 block mt-1 leading-snug">{sub.desc}</span>
                        <span className="text-[7px] uppercase font-black text-blue-400 mt-2 block">{sub.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN 4: Mathematics input screen */}
            {screen === 'math' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-black text-blue-400">Mathematics Studio</span>
                  <h4 className="text-sm font-black mt-0.5">Equation Solver</h4>
                </div>

                <div className={`p-3 rounded-xl border ${cardBg} space-y-3`}>
                  <label className="text-[9px] font-bold text-slate-400 block">Input Formula:</label>
                  <div className="bg-slate-950 border border-white/10 rounded-lg p-2 font-mono text-[10px] text-emerald-400">
                    y = 3x^2 + 5x - 2
                  </div>
                  <div className="w-full h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[9px] font-black uppercase text-white animate-pulse">
                    Clicking Solve...
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 5: Mathematics solved screen */}
            {screen === 'math-solved' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-black text-teal-400">Derivation Results</span>
                  <h4 className="text-sm font-black mt-0.5">Step-by-Step Solve</h4>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Step 1: Identify coordinates', text: 'Quadratic equation a=3, b=5, c=-2' },
                    { title: 'Step 2: Calculate Delta Δ', text: 'Δ = b² - 4ac = 25 + 24 = 49' },
                    { title: 'Step 3: Extract roots variables', text: 'x = (-5 ± √49) / 6 => x = 1/3, -2' }
                  ].map((step, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl border ${cardBg} text-left`}>
                      <strong className="text-[9px] font-extrabold text-blue-400 block">{step.title}</strong>
                      <span className="text-[8px] text-slate-400 block mt-1 leading-normal">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN 6: Coding IDE screen */}
            {screen === 'coding' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-black text-blue-400">Python compiler</span>
                  <h4 className="text-sm font-black mt-0.5">Coding Sandbox</h4>
                </div>

                <div className="flex-grow flex flex-col font-mono text-[9px] leading-normal bg-slate-950 border border-white/10 rounded-xl overflow-hidden p-3 h-28 justify-between">
                  <span className="text-emerald-400 block text-left">
                    def sum(a, b):<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;return a + b<br />
                    <br />
                    print(sum(4, 5))
                  </span>
                  <span className="text-[7px] text-slate-650 block border-t border-white/5 pt-1 text-right">Click Run Code...</span>
                </div>
              </div>
            )}

            {/* SCREEN 7: Coding IDE output screen */}
            {screen === 'coding-terminal' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-black text-teal-400">Execution Output</span>
                  <h4 className="text-sm font-black mt-0.5">Terminal Logs</h4>
                </div>

                <div className="space-y-2">
                  <div className="font-mono text-[10px] bg-black p-3 rounded-lg text-emerald-400 border border-white/10 text-left">
                    $ python script.py<br />
                    9<br />
                    <br />
                    [Process completed successfully]
                  </div>
                  <div className={`p-2.5 rounded-xl border ${cardBg} flex gap-2 items-center`}>
                    <span className="text-sm">🤖</span>
                    <span className="text-[8px] text-slate-400 leading-snug">
                      <strong>AI explanation:</strong> <TypingText text="The code declares a function adding parameters 4 and 5 returning 9." speed={22} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 8: AI Chat tutor screen */}
            {screen === 'ai-chat' && (
              <div className="space-y-4 flex flex-col h-full justify-between pb-1 text-left">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] uppercase font-black text-blue-400">Classroom Guide</span>
                    <h4 className="text-sm font-black mt-0.5">AI Classroom Guide</h4>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col items-end">
                      <div className="bg-blue-600 text-white p-2 rounded-xl rounded-tr-none text-[9px] max-w-[85%] leading-normal text-left">
                        Explain recursion in JavaScript.
                      </div>
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="bg-slate-900 border border-white/10 text-slate-350 p-2 rounded-xl rounded-tl-none text-[9px] max-w-[85%] leading-relaxed text-left">
                        <TypingText text="Recursion occurs when a function calls itself until reaching a base condition parameters." speed={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 9: Generated Notes checklist screen */}
            {screen === 'notes' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-black text-blue-400">Notes Engine</span>
                  <h4 className="text-sm font-black mt-0.5">Study Material</h4>
                </div>

                <div className={`p-3 rounded-xl border ${cardBg} space-y-2`}>
                  <span className="text-[9px] font-black uppercase text-slate-500 block mb-1">Generated Checklists:</span>
                  {[
                    'Recursion Stack Frame',
                    'Base Condition Variables',
                    'Tail Call Optimizations'
                  ].map((note, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[9px] text-slate-300">
                      <span className="text-teal-400">✓</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Bottom OS Navigation bar */}
      {!isDesktop && (
        <div className={`h-11 border-t ${borderCol} flex items-center justify-between px-4 text-[9px] font-black uppercase text-slate-500 z-40 relative bg-slate-955/80`}>
          {[
            { name: 'Home', screen: 'home', icon: '🏠' },
            { name: 'Learn', screen: 'learn', icon: '📚' },
            { name: 'AI', screen: 'ai-chat', icon: '🤖' },
            { name: 'Community', screen: 'notes', icon: '👥' },
            { name: 'Profile', screen: 'dashboard', icon: '👤' }
          ].map((nav, idx) => (
            <div key={idx} onClick={() => { setScreen(nav.screen); playSound('click'); }} className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-95">
              <span className="text-xs">{nav.icon}</span>
              <span className="text-[7px] tracking-tight">{nav.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}