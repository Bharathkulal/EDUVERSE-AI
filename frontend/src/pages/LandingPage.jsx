import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Play, Sparkles, Code2, BrainCircuit, Terminal, Blocks, 
  ArrowRight, Zap, Target, TrendingUp, Mic, ChevronDown,
  Brain, Compass, Trophy, Award, BarChart3, Bot, Layers,
  Cpu, MessageSquare, PlayCircle, Star, Quote, Briefcase,
  Download, Share2, ShieldCheck, Mail, Globe
} from 'lucide-react';
import LoginDrawer from '../components/LoginDrawer';
import logoImg from '../assets/logo.png';
import studentImg from '../assets/image.png';
import './LandingPage.css';

// Lenis smooth scroll implementation
function useLenis() {
  useEffect(() => {
    let lenisInst = null;
    let raf = 0;
    let cancelled = false;
    (async () => {
      try {
        const Lenis = (await import('lenis')).default;
        if (cancelled) return;
        const instance = new Lenis({
          duration: 1.25,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        lenisInst = instance;
        const loop = (time) => {
          instance.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } catch (err) {
        console.error('Lenis initialization failed:', err);
      }
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (lenisInst && typeof lenisInst.destroy === 'function') {
        lenisInst.destroy();
      }
    };
  }, []);
}

// Particle background emitter
function Particles({ count = 30, className = "" }) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-[1] overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37) % 100;
        const top = (i * 53) % 100;
        const delay = (i % 8) * 0.9;
        const dur = 10 + (i % 6) * 1.5;
        const size = 1.5 + (i % 3);
        const color = i % 3 === 0 ? "#00D4FF" : i % 3 === 1 ? "#8B5CF6" : "#4F7DFF";
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 10px ${color}`,
              animation: `drift ${dur}s linear ${delay}s infinite`,
              "--dx": `${(i % 5) * 12 - 24}px`,
              "--dy": `-${90 + (i % 4) * 25}px`,
            }}
          />
        );
      })}
    </div>
  );
}

// Reusable scroll reveal component
function Reveal({ children, variant = "fade-up", delay = 0, className = "", once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount: 0.2 });

  const getVariants = () => {
    switch (variant) {
      case "fade-up":
        return { hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0 } };
      case "fade-down":
        return { hidden: { opacity: 0, y: -35 }, visible: { opacity: 1, y: 0 } };
      case "slide-left":
        return { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } };
      case "slide-right":
        return { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } };
      case "scale-in":
        return { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } };
      case "blur-in":
        return { hidden: { opacity: 0, filter: "blur(8px)", y: 15 }, visible: { opacity: 1, filter: "blur(0px)", y: 0 } };
      default:
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={getVariants()}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

  // Initialize Lenis smooth scroll
  useLenis();

  // Mouse Parallax for Hero
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Header scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic Typing simulation state for code component
  const [typedCode, setTypedCode] = useState('');
  const codeString = `// AI-Generated Exception Handler\ntry {\n  user.processTransaction(payment);\n} catch (PaymentException ex) {\n  Logger.logWarning("Retrying connection...");\n  paymentGateway.retry(payment);\n}`;
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedCode(codeString.substring(0, index));
      index++;
      if (index > codeString.length) {
        setTimeout(() => { index = 0; }, 2000); // Pause on finish
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dark-landing-root relative min-h-screen bg-[#03050C]">
      {/* Background radial overlays */}
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-30 z-0" />
      <div className="pointer-events-none fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#4F7DFF]/10 to-transparent blur-[120px] z-0" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-[#8B5CF6]/10 to-transparent blur-[120px] z-0" />

      {/* ───────────────── GLASS NAVBAR ───────────────── */}
      <header className="fixed left-0 right-0 top-3 z-50 px-4 md:px-8 transition-all duration-300">
        <div className="mx-auto max-w-7xl rounded-2xl glass-strong px-6 py-3 flex items-center justify-between border border-white/5 shadow-2xl">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative h-8 w-8 rounded-lg flex items-center justify-center font-display text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(79,125,255,0.3)]" style={{ background: "linear-gradient(135deg,#4F7DFF,#8B5CF6)" }}>
              E
            </div>
            <span className="font-display text-sm font-extrabold tracking-tight text-white">EduVerse <span className="text-[#8B5CF6]">AI</span></span>
          </div>
          
          <nav className="hidden items-center gap-8 md:flex">
            {['Features', 'Platform', 'Journey', 'Analytics', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-widest text-white/70 transition-colors hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDrawerOpen(true)}
              className="btn-ghost rounded-xl px-5 py-2 text-xs font-bold"
            >
              Login
            </button>
            <button 
              onClick={() => setDrawerOpen(true)}
              className="btn-primary rounded-xl px-5 py-2 text-xs font-bold"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ───────────────── SECTION 1: HERO ───────────────── */}
      <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
        <Particles count={25} />
        <div className="mx-auto max-w-7xl w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left Column */}
          <div className="flex flex-col gap-5 text-left">
            <Reveal variant="fade-up" delay={0.1}>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-glow-pulse" />
                🚀 AI Powered Learning Platform
              </span>
            </Reveal>

            <Reveal variant="blur-in" delay={0.2}>
              <h1 className="font-display text-[clamp(2.5rem,5.2vw,4.2rem)] font-extrabold leading-[1.08] tracking-tight">
                Learn Smarter.<br />
                Build Your <span className="text-gradient">Future</span><br />
                with <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #4F7DFF 100%)' }}>AI.</span>
              </h1>
            </Reveal>

            <Reveal variant="fade-up" delay={0.3}>
              <p className="max-w-xl text-[14px] leading-relaxed text-white/60">
                EduVerse AI helps students learn smarter using Artificial Intelligence. Practice coding, generate quizzes, receive personalized recommendations, analyze progress, prepare for interviews, and master future-ready skills.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={0.4}>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button onClick={() => setDrawerOpen(true)} className="btn-primary rounded-2xl px-6 py-3.5 text-xs font-bold inline-flex items-center gap-2">
                  Start Learning <ArrowRight size={14} />
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-ghost rounded-2xl px-6 py-3.5 text-xs font-bold inline-flex items-center gap-2">
                  <PlayCircle size={14} /> Watch Demo
                </button>
              </div>
            </Reveal>

            {/* Bottom statistics grid row */}
            <Reveal variant="fade-up" delay={0.5} className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
              {[
                { val: '50K+', label: 'Students' },
                { val: '100+', label: 'Courses' },
                { val: '98%', label: 'Satisfaction' },
                { val: '24/7', label: 'AI Mentor' }
              ].map((stat, idx) => (
                <div key={idx} className="glass card-glow rounded-2xl p-3 text-center">
                  <div className="font-display text-lg font-bold text-gradient">{stat.val}</div>
                  <div className="text-[9px] uppercase tracking-wider text-white/50 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </Reveal>
          </div>

          {/* Right Column: Parallax 3D Hologram Student */}
          <div className="relative hidden lg:flex justify-center items-center">
            <motion.div 
              style={{ x: parallax.x * -12, y: parallax.y * -12 }}
              transition={{ type: "spring", stiffness: 60, damping: 20 }}
              className="relative max-h-[75vh] w-full"
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[75%] w-[75%] rounded-full bg-gradient-to-tr from-[#8B5CF6]/30 to-transparent blur-[70px] pointer-events-none" />
              <img 
                src={studentImg} 
                alt="AI Learning Concept" 
                className="relative z-10 mx-auto max-h-[75vh] object-contain animate-float-y-slow drop-shadow-[0_30px_60px_rgba(79,125,255,0.25)]" 
              />

              {/* Floating holographic metrics around character */}
              {[
                { label: 'AI Brain', sub: 'active', pos: 'top-[14%] left-[-2%]', color: '#8B5CF6', icon: <Brain size={12} /> },
                { label: 'Progress', sub: '+24% today', pos: 'top-[10%] right-[0%]', color: '#00D4FF', icon: <BarChart3 size={12} /> },
                { label: 'AI Mentor', sub: 'online', pos: 'bottom-[14%] left-[6%]', color: '#00D4FF', icon: <Bot size={12} /> },
                { label: 'XP Level 24', sub: 'Career Ready', pos: 'bottom-[18%] right-[2%]', color: '#4F7DFF', icon: <Trophy size={12} /> },
              ].map((chip, idx) => (
                <div 
                  key={idx} 
                  className={`absolute z-20 glass rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-2.5 ${chip.pos}`}
                  style={{ animation: `float-y 6s ease-in-out ${idx * 0.9}s infinite` }}
                >
                  <div className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${chip.color}15`, border: `1px solid ${chip.color}35`, color: chip.color }}>
                    {chip.icon}
                  </div>
                  <div className="leading-none text-left">
                    <div className="text-[11px] font-bold text-white">{chip.label}</div>
                    <div className="text-[9px] text-white/50 mt-0.5">{chip.sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-50">
          <span className="text-[9px] uppercase tracking-[0.35em] text-white/60">Scroll</span>
          <div className="h-8 w-4.5 rounded-full border border-white/20 relative flex justify-center">
            <span className="h-1.5 w-1 bg-white rounded-full scroll-dot mt-1.5" />
          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 2: WHY EDUVERSE ───────────────── */}
      <section id="features" className="relative py-28 border-t border-white/5 bg-[#050812]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Reveal variant="fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0d1121]/80 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4F7DFF] animate-pulse" /> Why EduVerse AI
              </span>
            </Reveal>
            <Reveal variant="blur-in" delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold">Why Choose <span className="text-gradient">EduVerse AI?</span></h2>
            </Reveal>
            <Reveal variant="fade-up" delay={0.2}>
              <p className="mt-4 text-[14px] text-white/50 leading-relaxed">
                Built on the belief that every student deserves a personal AI mentor. Here's what makes EduVerse different.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: <Brain className="text-[#a78bfa] w-5 h-5" />, 
                title: 'AI Powered Learning', 
                desc: 'Lessons that adapt to how you learn — pace, style, gaps and strengths.',
                glowClass: 'glow-purple'
              },
              { 
                icon: <Compass className="text-[#3b82f6] w-5 h-5" />, 
                title: 'Personalized Roadmaps', 
                desc: 'Custom learning paths from beginner to job-ready, planned by AI.',
                glowClass: 'glow-blue'
              },
              { 
                icon: <Terminal className="text-[#06b6d4] w-5 h-5" />, 
                title: 'Interactive Coding Labs', 
                desc: 'Practice in a real in-browser IDE with hints, tests and AI review.',
                glowClass: 'glow-cyan'
              },
              { 
                icon: <BarChart3 className="text-[#f59e0b] w-5 h-5" />, 
                title: 'Smart Progress Tracking', 
                desc: 'Skill graphs, weekly insights and predictions on your readiness.',
                glowClass: 'glow-amber'
              },
            ].map((card, i) => (
              <Reveal key={i} variant="scale-in" delay={i * 0.1} className={`glass card-glow ${card.glowClass} rounded-3xl p-7 relative overflow-hidden flex flex-col justify-between h-64`}>
                <div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border icon-container mb-5">
                    {card.icon}
                  </div>
                  <h3 className="font-display text-base font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{card.desc}</p>
                </div>
                <div className="text-[11px] font-medium text-white/40 hover:text-white/80 transition-colors cursor-pointer flex items-center gap-1.5">
                  Learn more <ArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 3: PLATFORM OVERVIEW ───────────────── */}
      <section id="platform" className="relative py-28 overflow-hidden bg-[#03050C]">
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-[#4F7DFF]/5 blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Reveal variant="fade-up">
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                💻 System Workspace
              </span>
            </Reveal>
            <Reveal variant="blur-in" delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold">One Platform. <span className="text-gradient">Infinite Possibilities.</span></h2>
            </Reveal>
          </div>

          <div className="relative mx-auto max-w-4xl pt-10">
            {/* Hologram mockup laptop */}
            <Reveal variant="scale-in" className="relative">
              <div className="relative aspect-[16/10] w-full rounded-[24px] border border-white/15 bg-gradient-to-b from-[#1b1f3c] to-[#0c0f24] p-2.5 shadow-[0_40px_100px_rgba(139,92,246,0.15)]">
                <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-[#070b1a] flex flex-col">
                  
                  {/* Dashboard Content Mock */}
                  <div className="grid grid-cols-[160px_1fr] h-full">
                    {/* Mock Sidebar */}
                    <div className="border-r border-white/5 bg-black/40 p-5 flex flex-col justify-between text-left">
                      <div className="space-y-6">
                        <div className="flex items-center gap-1.5 pb-3 border-b border-white/5">
                          <span className="h-2 w-2 rounded-full bg-[#ff5f56]" />
                          <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
                          <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <div className="space-y-2.5">
                          {['Dashboard', 'Courses', 'Coding', 'Analytics', 'Certificates'].map((sideItem, sIdx) => (
                            <div 
                              key={sIdx} 
                              className={`text-[10px] font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                                sIdx === 0 
                                  ? 'bg-white/10 text-white' 
                                  : 'text-white/40 hover:text-white/70'
                              }`}
                            >
                              {sideItem}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mock Dashboard Body */}
                    <div className="p-6 flex flex-col justify-between">
                      {/* Welcome Header */}
                      <div className="flex justify-between items-center text-left">
                        <div>
                          <div className="text-[10px] text-white/40">Welcome back,</div>
                          <div className="text-sm font-extrabold text-white mt-0.5">Alex Morgan</div>
                        </div>
                        <span className="text-[9px] bg-[#8B5CF6] text-white px-3 py-0.5 rounded-full font-bold shadow-lg shadow-[#8B5CF6]/20">Pro</span>
                      </div>

                      {/* Stat Cards */}
                      <div className="grid grid-cols-3 gap-3 my-4">
                        {[
                          { l: 'XP', v: '2,480', c: '#00D4FF' },
                          { l: 'Streak', v: '14 d', c: '#8B5CF6' },
                          { l: 'Score', v: '92%', c: '#00D4FF' },
                        ].map((stat, stIdx) => (
                          <div key={stIdx} className="bg-white/5 border border-white/5 rounded-xl p-3 text-left">
                            <div className="text-[9px] text-white/40 font-semibold">{stat.l}</div>
                            <div className="text-xs font-extrabold mt-1" style={{ color: stat.c }}>{stat.v}</div>
                          </div>
                        ))}
                      </div>

                      {/* Weekly Progress Graph */}
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-left flex flex-col justify-between mb-4">
                        <div className="text-[9px] text-white/40 font-semibold mb-2.5">Weekly Progress</div>
                        <div className="flex items-end justify-between gap-2 h-10">
                          {[25, 45, 35, 55, 90, 50, 80].map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 rounded-full bg-gradient-to-t from-[#4F7DFF] to-[#8B5CF6]" 
                              style={{ height: `${h}%` }} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Bottom Grid */}
                      <div className="grid grid-cols-2 gap-3 text-left">
                        {/* Next Lesson */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                          <div>
                            <div className="text-[9px] text-white/40 font-semibold">Next Lesson</div>
                            <div className="text-[10px] font-bold text-white mt-1">React Hooks Deep Dive</div>
                          </div>
                          <div className="w-full bg-white/10 h-1 rounded-full mt-3.5 overflow-hidden">
                            <div className="bg-[#00D4FF] h-full w-[60%]" />
                          </div>
                        </div>

                        {/* AI Suggestion */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                          <div>
                            <div className="text-[9px] text-white/40 font-semibold">AI Suggestion</div>
                            <div className="text-[10px] font-bold text-white mt-1">Try a Mock Interview</div>
                          </div>
                          <div className="text-[8px] text-[#00D4FF] font-semibold mt-2.5 flex items-center gap-1">
                            ✦ Recommended
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              {/* Laptop base silhouette */}
              <div className="relative mx-auto w-[106%] left-[-3%] h-2.5 bg-gradient-to-b from-[#1b1f3c] to-[#0a0d20] border-t border-white/15 rounded-b-[10px] shadow-[0_15px_30px_rgba(0,0,0,0.8)]" />
            </Reveal>

            {/* Floating platform chips surrounding mock */}
            {[
              { label: 'AI Mentor', pos: '-left-20 top-[12%]', delay: 0.1, icon: <Bot size={13} /> },
              { label: 'Coding Practice', pos: '-left-28 top-[48%]', delay: 0.5, icon: <Code2 size={13} /> },
              { label: 'Certificates', pos: '-left-16 bottom-[12%]', delay: 0.9, icon: <Award size={13} /> },
              
              { label: 'Quiz Generator', pos: '-right-24 top-[18%]', delay: 0.3, icon: <Sparkles size={13} /> },
              { label: 'Analytics', pos: '-right-24 top-[45%]', delay: 0.7, icon: <BarChart3 size={13} /> },
              { label: 'AI Assistant', pos: '-right-20 bottom-[15%]', delay: 1.1, icon: <MessageSquare size={13} /> },
            ].map((chip, idx) => (
              <div 
                key={idx}
                className={`absolute z-20 glass rounded-2xl px-4 py-2 shadow-[0_20px_45px_rgba(0,0,0,0.5)] flex items-center gap-3 border border-white/10 ${chip.pos}`}
                style={{ animation: `float-y 6s ease-in-out ${chip.delay}s infinite` }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                  {chip.icon}
                </div>
                <span className="text-[11px] font-bold text-white tracking-wide">{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 4: LEARNING JOURNEY ───────────────── */}
      <section id="journey" className="relative py-28 bg-[#050812] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Reveal variant="fade-up">
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                🗺 The Path Forward
              </span>
            </Reveal>
            <Reveal variant="blur-in" delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold">From Curious to <span className="text-gradient">Career-Ready</span></h2>
            </Reveal>
          </div>

          <div className="relative max-w-3xl mx-auto mt-16">
            {/* Timeline Spine */}
            <div className="absolute left-[30px] md:left-1/2 top-0 h-full w-[1px] bg-white/10 md:-translate-x-1/2" />
            
            <div className="space-y-12">
              {[
                { title: 'Learn Concepts', desc: 'Deconstruct complex topics visually with AI-curated tutorials.', icon: <Compass size={18} /> },
                { title: 'Practice in Sandbox', desc: 'Simulate values and build step-by-step logic checks.', icon: <Code2 size={18} /> },
                { title: 'Build Projects', desc: 'Assemble custom portfolios guided by smart templates.', icon: <Layers size={18} /> },
                { title: 'AI Assessment', desc: 'Verify skills under realistic timed testing runs.', icon: <Target size={18} /> },
                { title: 'Certification', desc: 'Claim secure cryptographically verified badges.', icon: <Award size={18} /> },
                { title: 'Career Prep', desc: 'Run mock coding interviews and tailor tech resumes.', icon: <Briefcase size={18} /> },
              ].map((step, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <Reveal key={idx} variant={isLeft ? 'slide-right' : 'slide-left'} className={`relative flex items-center md:gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="hidden md:block flex-1" />
                    
                    {/* Node Circle */}
                    <div className="absolute left-[30px] -translate-x-1/2 md:left-1/2 z-10">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl glass text-white shadow-xl bg-gradient-to-br from-[#4F7DFF]/20 to-[#8B5CF6]/20">
                        {step.icon}
                      </div>
                    </div>

                    <div className="flex-1 pl-16 md:pl-0">
                      <div className="glass card-glow rounded-3xl p-6 text-left">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00D4FF]">Milestone 0{idx + 1}</span>
                        <h3 className="font-display text-lg font-bold mt-1 text-white">{step.title}</h3>
                        <p className="text-xs text-white/50 mt-2 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 5: BENTO GRID ───────────────── */}
      <section className="relative py-28 bg-[#03050C] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Reveal variant="fade-up">
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                ⚡ Feature Suite
              </span>
            </Reveal>
            <Reveal variant="blur-in" delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold">Everything Beautifully <span className="text-gradient">Unified</span></h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px]">
            {/* AI Tutor Card (Double column & row size) */}
            <Reveal variant="scale-in" className="md:col-span-2 md:row-span-2 glass card-glow rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-[-40px] bottom-[-40px] w-80 h-80 bg-gradient-to-tr from-[#8B5CF6]/10 to-transparent blur-[60px]" />
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">EXCLUSIVE CORE</span>
                <h3 className="font-display text-2xl font-extrabold mt-4 text-white">AI Tutor & Co-Pilot</h3>
                <p className="text-xs text-white/50 mt-3 max-w-md leading-relaxed">
                  Stuck on recursion or pointers? Our AI Tutor acts as a live pairing mentor, breaking down complex data flows step-by-step with localized hints rather than giving raw solution outputs.
                </p>
              </div>
              <div className="glass rounded-2xl p-4 flex items-center gap-3 w-fit border border-white/10 z-10">
                <Bot className="text-[#00D4FF] animate-bounce" size={18} />
                <span className="text-xs font-semibold text-white/80">"Let's write a stack operations class together."</span>
              </div>
            </Reveal>

            {/* Other standard items */}
            {[
              { icon: <Terminal className="text-[#00D4FF]" />, title: 'Coding Compiler', desc: 'Compile inside your browser instantly.' },
              { icon: <Mic className="text-[#4F7DFF]" />, title: 'Mock Interviews', desc: 'Realistic AI feedback loops.' },
              { icon: <Layers className="text-amber-400" />, title: 'Smart Notes', desc: 'Summarize modules on-the-fly.' },
              { icon: <Sparkles className="text-[#8B5CF6]" />, title: 'Quiz Generator', desc: 'Create customized practice challenges.' },
              { icon: <Zap className="text-rose-500" />, title: 'Spaced Flashcards', desc: 'Optimized revision paths.' },
              { icon: <BarChart3 className="text-emerald-400" />, title: 'Learning Analytics', desc: 'Predictive score tracking.' },
              { icon: <Star className="text-violet-400" />, title: 'AI Recommendations', desc: 'Daily customized track suggestions.' },
            ].map((feat, i) => (
              <Reveal key={i} variant="scale-in" delay={i * 0.05} className="glass card-glow rounded-3xl p-6 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-white">{feat.title}</h4>
                  <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">{feat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 6: ANALYTICS PREVIEW ───────────────── */}
      <section id="analytics" className="relative py-28 bg-[#050812] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left */}
            <div className="text-left space-y-6">
              <Reveal variant="fade-up">
                <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                  📊 Metrics dashboard
                </span>
              </Reveal>
              <Reveal variant="blur-in" delay={0.1}>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">See Your <span className="text-gradient">Growth</span>, Live.</h2>
              </Reveal>
              <Reveal variant="fade-up" delay={0.2}>
                <p className="text-[14px] text-white/60 leading-relaxed">
                  EduVerse AI records micro-performance metrics across every quiz, assignment, and coding lab, feeding a predictive growth engine.
                </p>
              </Reveal>
              
              {/* Mini List */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { title: 'Skill Tree Level', val: 'Level 24' },
                  { title: 'Weekly Core Hours', val: '18.4 Hrs' },
                  { title: 'Avg Quiz Score', val: '92.4%' },
                  { title: 'Credentials Claimed', val: '6 Badges' },
                ].map((item, idx) => (
                  <Reveal key={idx} variant="fade-up" delay={0.15 * idx} className="border-l border-white/10 pl-4 py-1">
                    <span className="text-[10px] uppercase font-bold text-white/40 block tracking-wider">{item.title}</span>
                    <strong className="text-lg font-bold text-[#00D4FF] mt-1 block">{item.val}</strong>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Right: Mock Interactive Analytics Panel */}
            <Reveal variant="scale-in" className="glass rounded-[32px] p-6 border border-white/10 relative">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-white">Interactive Progress Hub</span>
                <span className="text-[10px] text-white/40">Updated 1m ago</span>
              </div>

              {/* Weekly Streak Rings & Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Weekly Goal', progress: 75, val: '15 / 20h', color: '#8B5CF6' },
                  { label: 'Quiz Accuracy', progress: 92, val: '92%', color: '#00D4FF' },
                  { label: 'Completed Labs', progress: 54, val: '6 / 11', color: '#4F7DFF' },
                ].map((statRing, rIdx) => (
                  <div key={rIdx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-white/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                        <circle className="transition-all duration-1000" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * statRing.progress) / 100} strokeLinecap="round" stroke={statRing.color} fill="transparent" r="40" cx="50" cy="50" />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-white">{statRing.progress}%</span>
                    </div>
                    <span className="text-[9px] text-white/50 font-semibold mt-3 uppercase tracking-wider">{statRing.label}</span>
                    <strong className="text-[11px] text-white mt-1">{statRing.val}</strong>
                  </div>
                ))}
              </div>

              {/* Progress Line Simulation */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-white/40 block mb-3 uppercase tracking-wider font-bold">XP Gain Speed</span>
                <div className="h-28 flex items-end gap-1.5 pt-2">
                  {[20, 30, 45, 38, 55, 68, 62, 85, 78, 92, 80, 95].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full rounded-t bg-gradient-to-t from-[#4F7DFF] to-[#00D4FF]" style={{ height: `${val}%` }} />
                      <span className="text-[8px] text-white/30">{idx + 1}d</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 7: CODING EXPERIENCE ───────────────── */}
      <section className="relative py-28 bg-[#03050C] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Code Editor */}
            <div className="lg:col-span-7">
              <Reveal variant="scale-in" className="glass-strong rounded-[20px] overflow-hidden text-left shadow-2xl">
                {/* Editor Tab bar */}
                <div className="bg-[#050812] border-b border-white/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500/80" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs font-mono text-white/50">TransactionHandler.cs</span>
                  </div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">C# Language</span>
                </div>

                {/* Editor screen */}
                <div className="p-6 font-mono text-xs text-white/80 min-h-[180px] bg-black/40 relative">
                  <pre className="leading-relaxed whitespace-pre-wrap">{typedCode}<span className="inline-block w-1.5 h-3.5 bg-[#00D4FF] ml-0.5 animate-glow-pulse" /></pre>
                </div>

                {/* Console output bar */}
                <div className="bg-[#050812] border-t border-white/5 p-4">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Compiler Output</div>
                  <div className="text-xs font-mono text-emerald-400">
                    [Success] Compilation finished. 0 warnings. 1 process verified.<br />
                    [Output] Retrying connection... Gateway ping returned 200 OK.
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Column: Descriptions & Leaderboard snippet */}
            <div className="lg:col-span-5 text-left space-y-6">
              <Reveal variant="fade-up">
                <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                  💻 Interactive IDE Sandbox
                </span>
              </Reveal>
              <Reveal variant="blur-in" delay={0.1}>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">Practical <span className="text-gradient">Coding Labs</span></h2>
              </Reveal>
              <Reveal variant="fade-up" delay={0.2}>
                <p className="text-[14px] text-white/60 leading-relaxed">
                  No software set-up needed. Write code immediately, receive AI-guided compilation hints, trace memory allocation changes, and compare performance logs on global leaderboard runs.
                </p>
              </Reveal>
              
              {/* Mini Leaderboard mockup */}
              <Reveal variant="scale-in" delay={0.3} className="glass rounded-2xl p-5 border border-white/5 space-y-3">
                <div className="text-xs font-bold text-white flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Module Leaderboard</span>
                  <span className="text-[10px] text-white/40">Weekly run</span>
                </div>
                {[
                  { rank: '01', name: 'Devon Lane', score: '10,480 XP', badge: '🥇' },
                  { rank: '02', name: 'Alex Johnson (You)', score: '9,840 XP', badge: '🥈' },
                  { rank: '03', name: 'Jane Cooper', score: '9,120 XP', badge: '🥉' },
                ].map((user, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white/40">{user.rank}</span>
                      <span className="font-bold text-white/80">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00D4FF] font-bold">{user.score}</span>
                      <span>{user.badge}</span>
                    </div>
                  </div>
                ))}
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 8: AI ASSISTANT ───────────────── */}
      <section className="relative py-28 bg-[#050812] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Content */}
            <div className="text-left space-y-6">
              <Reveal variant="fade-up">
                <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                  🤖 Live Assistant Interface
                </span>
              </Reveal>
              <Reveal variant="blur-in" delay={0.1}>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">Meet Your <span className="text-gradient">Personal Mentor</span></h2>
              </Reveal>
              <Reveal variant="fade-up" delay={0.2}>
                <p className="text-[14px] text-white/60 leading-relaxed">
                  Access 24/7 AI tutor co-pilot support. Chat via text, analyze homework scopes, generate tailored flashcards, or use our smart Voice Assistant to talk through code structures out loud.
                </p>
              </Reveal>

              {/* Voice waves simulation */}
              <Reveal variant="fade-up" delay={0.3} className="flex items-center gap-3 pt-2">
                <span className="text-xs text-white/50">Voice Input Status:</span>
                <div className="flex items-center gap-1.5 h-6">
                  {[12, 24, 16, 28, 20, 8, 14, 22, 10, 18].map((h, i) => (
                    <span 
                      key={i} 
                      className="w-1 rounded-full bg-[#00D4FF]" 
                      style={{ 
                        height: `${h}px`, 
                        animation: `glow-pulse 1.2s infinite ease-in-out`,
                        animationDelay: `${i * 0.12}s`
                      }} 
                    />
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Right: Futuristic Chat Mock */}
            <Reveal variant="scale-in" className="glass rounded-[32px] border border-white/10 p-6 flex flex-col justify-between h-[400px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00D4FF]" />
                  <span className="text-xs font-bold text-white">Voice Assistant Channel</span>
                </div>
                <span className="text-[10px] text-white/40">Connected</span>
              </div>

              {/* Chat bubbles */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3.5 max-w-[80%] text-left">
                    <div className="font-extrabold text-[#00D4FF] mb-1">AI Mentor</div>
                    "Hey Alex! Ready to try a quick exception handling practice quiz?"
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-[#4F7DFF]/15 border border-[#4F7DFF]/30 rounded-2xl rounded-tr-none p-3.5 max-w-[80%] text-left">
                    <div className="font-extrabold text-[#4F7DFF] mb-1">Alex</div>
                    "Sure! Set it to intermediate C# topics."
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3.5 max-w-[80%] text-left">
                    <div className="font-extrabold text-[#00D4FF] mb-1">AI Mentor</div>
                    "Perfect. Question: What is the main difference between throwing an exception vs rethrowing using throw?"
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="bg-white/5 rounded-2xl border border-white/5 p-3 flex items-center justify-between">
                <span className="text-xs text-white/40 pl-2">Ask a follow-up query...</span>
                <button className="bg-[#8B5CF6] text-white p-2 rounded-xl hover:scale-105 transition-transform">
                  <ArrowRight size={14} />
                </button>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 9: STUDENT SUCCESS ───────────────── */}
      <section className="relative py-28 bg-[#03050C] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Reveal variant="fade-up">
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                ⭐ Community success
              </span>
            </Reveal>
            <Reveal variant="blur-in" delay={0.1}>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold">Student <span className="text-gradient">Success Stories</span></h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Miller', role: 'Software Engineer at Microsoft', text: '“The interactive DSA visualizers helped me crack the tree traversal rounds. The feedback from Friday AI tutor is top-tier.”', xp: '28k XP' },
              { name: 'Brandon Cole', role: 'Full Stack Engineer at Stripe', text: '“I went from knowing basic HTML to designing relational database schemas and deploying APIs, guided step-by-step by AI.”', xp: '34k XP' },
              { name: 'Elena Rostova', role: 'Backend Engineer at Vercel', text: '“Interviews prep with AI mentor was a game changer. The mock interviews scoring logs matched my real interviews perfectly.”', xp: '24k XP' }
            ].map((user, idx) => (
              <Reveal key={idx} variant="scale-in" delay={idx * 0.1} className="glass card-glow rounded-3xl p-8 flex flex-col justify-between h-72">
                <div className="space-y-4">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed text-left">{user.text}</p>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4">
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <div className="text-[10px] text-white/40">{user.role}</div>
                  </div>
                  <span className="text-[10px] bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 px-2 py-0.5 rounded-full font-bold">
                    {user.xp}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 10: CERTIFICATES ───────────────── */}
      <section className="relative py-28 bg-[#050812] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Certificate Graphic Representation */}
            <Reveal variant="scale-in" className="relative flex justify-center">
              <div 
                className="w-full max-w-[420px] aspect-[1.4/1] rounded-[24px] border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden card-glow"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-[#00D4FF]/10 rounded-full blur-[40px]" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#00D4FF]">EduVerse credentials</span>
                    <h3 className="font-display text-xl font-bold mt-1.5 text-white">Full-Stack Architect</h3>
                  </div>
                  <Award size={36} className="text-[#00D4FF]" />
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Awarded to</div>
                  <div className="text-sm font-bold text-white">Alex Morgan</div>
                  <div className="text-[9px] text-white/50">Verification Code: EV-9824-AX7</div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px]">
                  <span className="text-white/40">Credential Status: <strong>Verified</strong></span>
                  <span className="text-[#8B5CF6]">Claimed June 2026</span>
                </div>
              </div>
            </Reveal>

            {/* Right: Info */}
            <div className="text-left space-y-6">
              <Reveal variant="fade-up">
                <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                  🏆 Verified Credentials
                </span>
              </Reveal>
              <Reveal variant="blur-in" delay={0.1}>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">Claim Your <span className="text-gradient">Certificate</span></h2>
              </Reveal>
              <Reveal variant="fade-up" delay={0.2}>
                <p className="text-[14px] text-white/60 leading-relaxed">
                  Earn cryptographically signed, verifiable completion documents for every track you master. Share directly with recruitment portals and add verified links onto your resume.
                </p>
              </Reveal>

              {/* Action options */}
              <Reveal variant="fade-up" delay={0.3} className="flex flex-wrap gap-3 pt-2">
                <button className="btn-ghost rounded-2xl px-5 py-3 text-xs font-bold inline-flex items-center gap-2">
                  <Download size={14} /> Download PDF
                </button>
                <button className="btn-ghost rounded-2xl px-5 py-3 text-xs font-bold inline-flex items-center gap-2">
                  <Share2 size={14} /> Share to LinkedIn
                </button>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 11: CALL TO ACTION ───────────────── */}
      <section className="relative py-32 bg-[#03050C] border-t border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="mx-auto max-w-4xl px-6 text-center space-y-8 relative z-10">
          <Reveal variant="scale-in" className="inline-flex h-16 w-16 place-items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4F7DFF] to-[#8B5CF6] text-white shadow-2xl">
            <Zap size={28} />
          </Reveal>
          
          <Reveal variant="blur-in" delay={0.1}>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight">
              Start Your AI Learning<br />
              <span className="text-gradient">Journey Today</span>
            </h2>
          </Reveal>
          
          <Reveal variant="fade-up" delay={0.2} className="max-w-2xl mx-auto">
            <p className="text-base text-white/60">
              Join thousands of students and engineers upgrading their coding skills, building portfolios, and scaling their careers with personalized artificial intelligence.
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={0.3}>
            <div className="flex gap-4 justify-center pt-4">
              <button onClick={() => setDrawerOpen(true)} className="btn-primary rounded-2xl text-xs font-bold px-8 py-4">
                Get Started Free
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-ghost rounded-2xl text-xs font-bold px-8 py-4">
                Explore Platform
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── SECTION 12: FOOTER ───────────────── */}
      <footer className="relative bg-[#02040A] border-t border-white/5 py-16 text-xs text-white/40">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Logo & Info */}
          <div className="text-left space-y-4">
            <img src={logoImg} alt="EduVerse Logo" className="h-6 w-auto object-contain" />
            <p className="leading-relaxed">
              Premium AI-powered student learning space. Mastering tech skills step-by-step through visualization.
            </p>
          </div>

          {/* Quick links */}
          <div className="text-left space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-[10px]">Curricular Labs</h4>
            <div className="flex flex-col gap-2">
              <a href="#features" className="hover:text-white transition-colors">Why Choose Us</a>
              <a href="#platform" className="hover:text-white transition-colors">Platform Overview</a>
              <a href="#journey" className="hover:text-white transition-colors">Timeline Journey</a>
            </div>
          </div>

          {/* Core Modules */}
          <div className="text-left space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-[10px]">Curriculum</h4>
            <div className="flex flex-col gap-2">
              <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/dashboard')}>Data Structures</span>
              <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/dashboard')}>C# Programming</span>
              <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/dashboard')}>Java Programming</span>
            </div>
          </div>

          {/* Social connections */}
          <div className="text-left space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-[10px]">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#00D4FF] transition-colors"><Globe size={16} /></a>
              <a href="#" className="hover:text-[#00D4FF] transition-colors"><Code2 size={16} /></a>
              <a href="#" className="hover:text-[#00D4FF] transition-colors"><Terminal size={16} /></a>
            </div>
            <p className="leading-relaxed">Contact: support@eduverse.ai</p>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} EduVerse AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* LoginDrawer for authentication */}
      <LoginDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onOpenRegister={() => navigate('/register')} />
    </div>
  );
}
