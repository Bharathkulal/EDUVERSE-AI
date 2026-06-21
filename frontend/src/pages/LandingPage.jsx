import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Play, Sparkles, Code2, BrainCircuit, Terminal, Blocks, 
  ArrowRight, Zap, Target, TrendingUp, Mic, ChevronDown 
} from 'lucide-react';
import LoginDrawer from '../components/LoginDrawer';
import logoImg from '../assets/logo.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Global scroll progress
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Smooth out the scroll progress for inertia feel
  const smoothProgress = useSpring(scrollYProgress, { damping: 15, stiffness: 100, mass: 0.5 });

  /* -------------------------------------------------------------------------
     Section 1: Hero Transforms
  -------------------------------------------------------------------------- */
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.15], [0, -100]);

  /* -------------------------------------------------------------------------
     Section 2: Features Transforms
  -------------------------------------------------------------------------- */
  const featOpacity = useTransform(smoothProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
  const featY = useTransform(smoothProgress, [0.1, 0.2, 0.3, 0.4], [100, 0, 0, -100]);
  const featBlur = useTransform(smoothProgress, [0.1, 0.15], ["blur(10px)", "blur(0px)"]);

  /* -------------------------------------------------------------------------
     Section 3: DSA Interactive Transforms
  -------------------------------------------------------------------------- */
  const dsaOpacity = useTransform(smoothProgress, [0.35, 0.45, 0.55, 0.65], [0, 1, 1, 0]);
  const dsaScale = useTransform(smoothProgress, [0.35, 0.45], [0.8, 1]);
  
  // Staggered card pop-ins for DSA
  const dsaCard1 = useTransform(smoothProgress, [0.40, 0.45], [0, 1]);
  const dsaCard2 = useTransform(smoothProgress, [0.42, 0.47], [0, 1]);
  const dsaCard3 = useTransform(smoothProgress, [0.44, 0.49], [0, 1]);
  const dsaCard4 = useTransform(smoothProgress, [0.46, 0.51], [0, 1]);
  const dsaCard5 = useTransform(smoothProgress, [0.48, 0.53], [0, 1]);

  /* -------------------------------------------------------------------------
     Section 4: How it Works Transforms
  -------------------------------------------------------------------------- */
  const howOpacity = useTransform(smoothProgress, [0.55, 0.65, 0.75, 0.85], [0, 1, 1, 0]);
  const lineProgress = useTransform(smoothProgress, [0.60, 0.75], [0, 1]);

  /* -------------------------------------------------------------------------
     Section 5: AI Tutor Transforms
  -------------------------------------------------------------------------- */
  const aiOpacity = useTransform(smoothProgress, [0.75, 0.82, 0.9, 0.98], [0, 1, 1, 0]);
  const aiY = useTransform(smoothProgress, [0.75, 0.82], [100, 0]);
  
  const msg1Opacity = useTransform(smoothProgress, [0.78, 0.80], [0, 1]);
  const msg1Y = useTransform(smoothProgress, [0.78, 0.80], [20, 0]);
  
  const msg2Opacity = useTransform(smoothProgress, [0.81, 0.83], [0, 1]);
  const msg2Y = useTransform(smoothProgress, [0.81, 0.83], [20, 0]);

  const msg3Opacity = useTransform(smoothProgress, [0.85, 0.87], [0, 1]);
  const msg3Y = useTransform(smoothProgress, [0.85, 0.87], [20, 0]);

  /* -------------------------------------------------------------------------
     Section 6: Final CTA Transforms
  -------------------------------------------------------------------------- */
  const ctaOpacity = useTransform(smoothProgress, [0.92, 0.98], [0, 1]);
  const ctaScale = useTransform(smoothProgress, [0.92, 0.98], [0.8, 1]);
  const particleY = useTransform(smoothProgress, [0.9, 1], [100, -200]);

  // Custom JS-controlled video fade loop
  useEffect(() => {
    let animationFrameId;
    const video = videoRef.current;

    const updateOpacity = () => {
      if (video && video.duration) {
        const curTime = video.currentTime;
        const duration = video.duration;
        let opacity = 1;

        if (curTime < 0.5) {
          opacity = curTime / 0.5;
        } else if (curTime > duration - 0.5) {
          opacity = Math.max(0, (duration - curTime) / 0.5);
        }

        video.style.opacity = opacity;
      }
      animationFrameId = requestAnimationFrame(updateOpacity);
    };

    updateOpacity();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (video) {
      video.style.opacity = 0;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch((err) => console.log('Video playback error:', err));
        }
      }, 100);
    }
  };

  return (
    <div ref={containerRef} className="h-[600vh] bg-[hsl(260,87%,3%)] text-[hsl(40,6%,95%)] relative font-sans">
      
      {/* Background Video Wrapper (Fixed behind all content) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0, transition: 'opacity 0.1s ease-out' }}
        />
      </div>

      {/* Blurred Overlay Shape */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-70 bg-gray-950 blur-[100px] pointer-events-none z-0" />

      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(260,87%,3%)]/60 backdrop-blur-md">
        <nav className="w-full py-5 px-8 flex flex-row justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img src={logoImg} alt="EduVerse AI" className="h-[32px] w-auto object-contain" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button className="flex items-center gap-1 text-[hsl(40,6%,95%)]/90 hover:text-white transition duration-300 font-medium text-sm">
              Features <ChevronDown className="w-4 h-4 opacity-75" />
            </button>
            <button className="text-[hsl(40,6%,95%)]/90 hover:text-white transition duration-300 font-medium text-sm">
              Solutions
            </button>
            <button className="text-[hsl(40,6%,95%)]/90 hover:text-white transition duration-300 font-medium text-sm">
              Plans
            </button>
            <button className="flex items-center gap-1 text-[hsl(40,6%,95%)]/90 hover:text-white transition duration-300 font-medium text-sm">
              Learning <ChevronDown className="w-4 h-4 opacity-75" />
            </button>
          </div>

          <div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="liquid-glass rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/5 transition duration-300 active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </nav>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[hsl(40,6%,95%)]/20 to-transparent mt-[3px]" />
      </header>

      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center pointer-events-none z-10">
        
        {/* =========================================================
            SECTION 1: HERO
        ========================================================== */}
        <motion.div 
          style={{ 
            opacity: heroOpacity, 
            y: heroY, 
            pointerEvents: useTransform(smoothProgress, v => v < 0.15 ? "auto" : "none") 
          }} 
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        >
          <div className="max-w-6xl mx-auto flex flex-col items-center">
            {/* Headline */}
            <h1 
              className="text-[64px] sm:text-[110px] md:text-[220px] font-normal leading-[1.02] tracking-[-0.024em] font-headline select-none"
              style={{ fontFamily: "'General Sans', sans-serif" }}
            >
              EduVerse{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(to left, #6366f1, #a855f7, #fcd34d)',
                  WebkitBackgroundClip: 'text'
                }}
              >
                AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[hsl(40,6%,82%)] text-base md:text-lg leading-8 max-w-md mt-[9px] opacity-80 whitespace-pre-line">
              The most powerful AI ever deployed {'\n'} in gamified learning
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="liquid-glass rounded-xl px-[29px] py-[24px] mt-[25px] font-semibold text-base transition-all duration-300 hover:bg-white/5 hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              Get Started
            </button>
          </div>

          {/* Logo Marquee (Pinned to bottom of Hero viewport) */}
          <div className="absolute bottom-10 w-full max-w-5xl px-6 flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="text-[hsl(40,6%,95%)]/50 text-sm font-medium min-w-[200px] text-center md:text-left leading-relaxed">
              Innovative learning {'\n'} core features
            </div>

            <div className="flex-1 overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
              <div className="flex gap-16 animate-marquee whitespace-nowrap py-2">
                {[
                  { name: 'Interactive DSA Labs', letter: 'D' },
                  { name: 'Friday AI Tutor', letter: 'A' },
                  { name: 'Live Sandbox', letter: 'L' },
                  { name: 'Gamified Arena', letter: 'G' },
                  { name: 'Voice Assistant', letter: 'V' },
                  { name: 'ML Analytics', letter: 'M' },
                ].concat([
                  { name: 'Interactive DSA Labs', letter: 'D' },
                  { name: 'Friday AI Tutor', letter: 'A' },
                  { name: 'Live Sandbox', letter: 'L' },
                  { name: 'Gamified Arena', letter: 'G' },
                  { name: 'Voice Assistant', letter: 'V' },
                  { name: 'ML Analytics', letter: 'M' },
                ]).map((logo, idx) => (
                  <div key={idx} className="inline-flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg liquid-glass flex items-center justify-center text-xs font-bold text-[hsl(40,6%,95%)] shadow-inner select-none">
                      {logo.letter}
                    </div>
                    <span className="text-base font-semibold text-[hsl(40,6%,95%)] select-none">
                      {logo.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================
            SECTION 2: FEATURES GRID
        ========================================================== */}
        <motion.div 
          style={{ 
            opacity: featOpacity, 
            y: featY, 
            filter: featBlur,
            pointerEvents: useTransform(smoothProgress, v => v > 0.1 && v < 0.4 ? "auto" : "none") 
          }} 
          className="absolute inset-0 flex flex-col items-center justify-center px-10 max-w-7xl mx-auto w-full"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'General Sans', sans-serif" }}>
              A Premium Learning Engine
            </h2>
            <p className="text-xl text-[hsl(40,6%,82%)] opacity-85">Built for speed, clarity, and deep understanding.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {[
              { title: "AI Tutor System", icon: BrainCircuit, color: "text-indigo-400", bg: "bg-indigo-500/10" },
              { title: "Interactive DSA Visualizer", icon: Blocks, color: "text-purple-400", bg: "bg-purple-500/10" },
              { title: "Code Execution Engine", icon: Terminal, color: "text-amber-400", bg: "bg-amber-500/10" },
              { title: "Smart Learning Dashboard", icon: Target, color: "text-rose-400", bg: "bg-rose-500/10" },
            ].map((feat, i) => (
              <motion.div key={i} whileHover={{ rotateX: 3, rotateY: -3, scale: 1.02 }} className="liquid-glass rounded-[20px] p-8 cursor-pointer group">
                <div className={`w-14 h-14 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                  <feat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-[hsl(40,6%,95%)] mb-2" style={{ fontFamily: "'General Sans', sans-serif" }}>{feat.title}</h3>
                <p className="text-[hsl(40,6%,82%)]/70">Experience real-time feedback and dynamic visuals perfectly integrated into your workflow.</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* =========================================================
            SECTION 3: DSA PREVIEW
        ========================================================== */}
        <motion.div 
          style={{ 
            opacity: dsaOpacity, 
            scale: dsaScale,
            pointerEvents: useTransform(smoothProgress, v => v > 0.35 && v < 0.65 ? "auto" : "none")
          }} 
          className="absolute inset-0 flex flex-col items-center justify-center px-10 max-w-7xl mx-auto w-full"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16" style={{ fontFamily: "'General Sans', sans-serif" }}>
            Visualize The Abstract
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {['Stack', 'Queue', 'Linked List', 'Tree', 'Graph'].map((title, i) => {
              const transforms = [dsaCard1, dsaCard2, dsaCard3, dsaCard4, dsaCard5];
              return (
                <motion.div 
                  key={title} 
                  style={{ opacity: transforms[i], scale: transforms[i] }}
                  className="liquid-glass w-48 h-48 flex flex-col items-center justify-center gap-4 rounded-[20px] shadow-2xl"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                    {title[0]}
                  </div>
                  <h3 className="font-bold text-[hsl(40,6%,95%)]">{title}</h3>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* =========================================================
            SECTION 4: HOW IT WORKS
        ========================================================== */}
        <motion.div 
          style={{ 
            opacity: howOpacity,
            pointerEvents: useTransform(smoothProgress, v => v > 0.55 && v < 0.85 ? "auto" : "none")
          }} 
          className="absolute inset-0 flex flex-col items-center justify-center px-10 max-w-4xl mx-auto w-full"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16" style={{ fontFamily: "'General Sans', sans-serif" }}>
            How It Works
          </h2>
          <div className="relative flex flex-col gap-12 pl-10 w-full">
            {/* Animated Line */}
            <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-amber-500 rounded-full origin-top"
                style={{ scaleY: lineProgress, height: '100%' }}
              />
            </div>

            {[
              { title: "Choose Topic", desc: "Select from DSA, C#, or Java modules." },
              { title: "Learn Visually with AI", desc: "Watch animations while AI explains the logic." },
              { title: "Practice with Simulations", desc: "Write code and see it execute memory step-by-step." }
            ].map((step, i) => (
              <div key={i} className="relative flex items-center gap-8">
                <div className="absolute -left-[45px] w-8 h-8 rounded-full bg-indigo-600 border-4 border-[hsl(260,87%,3%)] shadow-lg text-white font-bold flex items-center justify-center text-xs z-10">
                  {i + 1}
                </div>
                <div className="liquid-glass rounded-xl p-6 flex-1 hover:bg-white/5 transition-all">
                  <h3 className="text-2xl font-bold text-[hsl(40,6%,95%)] mb-2" style={{ fontFamily: "'General Sans', sans-serif" }}>{step.title}</h3>
                  <p className="text-[hsl(40,6%,82%)]/80 text-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* =========================================================
            SECTION 5: AI TUTOR PREVIEW
        ========================================================== */}
        <motion.div 
          style={{ 
            opacity: aiOpacity, 
            y: aiY,
            pointerEvents: useTransform(smoothProgress, v => v > 0.75 && v < 0.98 ? "auto" : "none")
          }} 
          className="absolute inset-0 flex flex-col items-center justify-center px-10 max-w-5xl mx-auto w-full"
        >
          <div className="liquid-glass rounded-[32px] w-full h-[500px] shadow-2xl overflow-hidden flex flex-col border border-white/5 relative">
            <div className="bg-white/5 p-4 border-b border-white/5 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-slate-400 font-mono text-sm ml-4 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400"/> Friday AI Tutor Session
              </span>
            </div>
            
            <div className="p-8 flex-1 flex flex-col gap-6 overflow-hidden">
              <motion.div style={{ opacity: msg1Opacity, y: msg1Y }} className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-md self-end font-medium">
                Can you explain how a Stack works in C#?
              </motion.div>
              
              <motion.div style={{ opacity: msg2Opacity, y: msg2Y }} className="bg-white/5 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-lg border border-white/5">
                <p>A Stack follows the LIFO (Last In, First Out) principle. Here is how you initialize and push to it:</p>
                <div className="mt-4 bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-sm text-indigo-300">
                  Stack&lt;string&gt; s = new Stack&lt;string&gt;();<br/>
                  s.Push("First");<br/>
                  s.Push("Second");
                </div>
              </motion.div>

              <motion.div style={{ opacity: msg3Opacity, y: msg3Y }} className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-md self-end font-medium">
                Ah! So "Second" will be popped first.
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================
            SECTION 6: FINAL CTA
        ========================================================== */}
        <motion.div 
          style={{ 
            opacity: ctaOpacity, 
            scale: ctaScale,
            pointerEvents: useTransform(smoothProgress, v => v > 0.92 ? "auto" : "none")
          }} 
          className="absolute inset-0 flex flex-col items-center justify-center px-10 max-w-4xl mx-auto w-full text-center"
        >
          <motion.div style={{ y: particleY }} className="absolute inset-0 -z-10 overflow-hidden opacity-30 pointer-events-none">
             <div className="absolute top-[20%] left-[20%] w-32 h-32 bg-indigo-400 rounded-full blur-[80px]"></div>
             <div className="absolute bottom-[20%] right-[20%] w-48 h-48 bg-purple-500 rounded-full blur-[100px]"></div>
          </motion.div>

          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-500/50 animate-brain-pulse">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6" style={{ fontFamily: "'General Sans', sans-serif" }}>
            Experience the Future of Learning
          </h2>
          <p className="text-2xl text-[hsl(40,6%,82%)] mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of students mastering complex concepts with EduVerse AI.
          </p>
          <div className="flex gap-6 justify-center">
            <button onClick={() => navigate('/dashboard')} className="liquid-glass rounded-2xl text-xl px-10 py-5 font-semibold hover:bg-white/5 active:scale-95 transition-all">
              Explore Modules
            </button>
            <button onClick={() => setDrawerOpen(true)} className="liquid-glass rounded-2xl text-xl px-10 py-5 font-semibold hover:bg-white/5 active:scale-95 transition-all">
              Get Started
            </button>
          </div>
        </motion.div>

      </div>
      
      {/* LoginDrawer */}
      <LoginDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onOpenRegister={() => navigate('/register')} />
    </div>
  );
}
