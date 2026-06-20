import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Code2, BrainCircuit, Terminal, Blocks, Search, ArrowRight, Zap, Target, TrendingUp, Mic, Database } from 'lucide-react';
import LoginDrawer from '../components/LoginDrawer';

export default function LandingPage() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
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
  const heroCardsScale = useTransform(smoothProgress, [0, 0.15], [1, 0.8]);
  const heroCardsY = useTransform(smoothProgress, [0, 0.15], [0, -200]);

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

  return (
    <div ref={containerRef} className="h-[600vh] bg-loop relative bg-gradient-to-b from-[#F8FAFF] via-[#EAF2FF] to-[#DBE8FF]">
      
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-white/50 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="font-extrabold text-2xl tracking-tight text-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">E</div>
          EduVerse <span className="text-blue-600">AI</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setDrawerOpen(true)} className="text-slate-600 font-medium hover:text-slate-900 transition px-4 py-2">Sign In</button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary shadow-blue-500/20">Get Started</button>
        </div>
      </nav>

      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center pointer-events-none">
        
        {/* =========================================================
            SECTION 1: HERO
        ========================================================== */}
        <motion.div 
          style={{ 
            opacity: heroOpacity, 
            y: heroY, 
            pointerEvents: useTransform(smoothProgress, v => v < 0.15 ? "auto" : "none") 
          }} 
          className="absolute inset-0 flex flex-col md:flex-row items-center justify-center px-10 gap-16 max-w-7xl mx-auto w-full"
        >
          {/* Left: Text */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-medium text-sm w-fit shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-500" /> AI-Powered Interactive Learning
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              EduVerse AI
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium">
              Transforming DSA and programming into interactive, cinematic learning journeys.
            </p>
            <div className="flex gap-4 pt-4">
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-2 text-lg px-8 py-4">Explore Features <ArrowRight className="w-5 h-5"/></button>
              <button className="btn-secondary flex items-center gap-2 text-lg px-8 py-4"><Play className="w-5 h-5"/> View Demo</button>
            </div>
          </div>

          {/* Right: Floating Cards */}
          <motion.div style={{ scale: heroCardsScale, y: heroCardsY }} className="flex-1 relative h-[600px] w-full hidden md:block perspective-[1000px]">
            {/* Interactive DSA */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-10 right-20 w-64 card-glass shadow-xl border-blue-200 bg-white/80 backdrop-blur-xl z-20"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Code2 className="w-6 h-6"/></div>
              <h3 className="text-lg font-bold">Interactive DSA</h3>
            </motion.div>

            {/* AI Tutor */}
            <motion.div 
              animate={{ y: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute top-48 left-10 w-72 card-glass shadow-2xl border-purple-200 bg-white/80 backdrop-blur-xl z-30"
            >
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><BrainCircuit className="w-6 h-6"/></div>
              <h3 className="text-lg font-bold">Friday AI Tutor</h3>
              <p className="text-sm text-slate-500 mt-2">Always online, ready to explain.</p>
            </motion.div>

            {/* Code Execution */}
            <motion.div 
              animate={{ y: [-15, 15, -15], rotateZ: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-80 right-10 w-60 card-glass shadow-xl border-emerald-200 bg-white/80 backdrop-blur-xl z-20"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><Terminal className="w-6 h-6"/></div>
              <h3 className="text-lg font-bold">Live Execution</h3>
            </motion.div>

            {/* ML Analytics */}
            <motion.div 
              animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
              className="absolute top-0 left-20 w-56 card-glass shadow-md border-orange-200 bg-white/70 backdrop-blur-md z-10 scale-90"
            >
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5"/></div>
              <h3 className="text-md font-bold">ML Analytics</h3>
            </motion.div>

            {/* Voice Assistant */}
            <motion.div 
              animate={{ y: [8, -8, 8] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute bottom-10 left-32 w-52 card-glass shadow-lg border-rose-200 bg-white/70 backdrop-blur-md z-10 scale-95"
            >
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-3"><Mic className="w-5 h-5"/></div>
              <h3 className="text-md font-bold">Voice Assistant</h3>
            </motion.div>

          </motion.div>
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
            <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-4">A Premium Learning Engine</h2>
            <p className="text-xl text-slate-600">Built for speed, clarity, and deep understanding.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {[
              { title: "AI Tutor System", icon: BrainCircuit, color: "text-blue-500", bg: "bg-blue-50" },
              { title: "Interactive DSA Visualizer", icon: Blocks, color: "text-purple-500", bg: "bg-purple-50" },
              { title: "Code Execution Engine", icon: Terminal, color: "text-emerald-500", bg: "bg-emerald-50" },
              { title: "Smart Learning Dashboard", icon: Target, color: "text-orange-500", bg: "bg-orange-50" },
            ].map((feat, i) => (
              <motion.div key={i} whileHover={{ rotateX: 6, rotateY: -6, scale: 1.05 }} className="card-glass border-slate-200/60 shadow-xl p-8 cursor-pointer group">
                <div className={`w-14 h-14 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                  <feat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{feat.title}</h3>
                <p className="text-slate-500">Experience real-time feedback and dynamic visuals perfectly integrated into your workflow.</p>
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
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-slate-900">Visualize The Abstract</h2>
          <div className="flex flex-wrap justify-center gap-6 perspective-[1000px]">
            {['Stack', 'Queue', 'Linked List', 'Tree', 'Graph'].map((title, i) => {
              const transforms = [dsaCard1, dsaCard2, dsaCard3, dsaCard4, dsaCard5];
              return (
                <motion.div 
                  key={title} 
                  style={{ opacity: transforms[i], scale: transforms[i] }}
                  className="card-glass w-48 h-48 flex flex-col items-center justify-center gap-4 border-slate-200/50 shadow-2xl bg-white/80"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                    {title[0]}
                  </div>
                  <h3 className="font-bold text-slate-800">{title}</h3>
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
          <h2 className="text-5xl font-extrabold text-center mb-16 text-slate-900">How It Works</h2>
          <div className="relative flex flex-col gap-16 pl-10">
            {/* Animated Line */}
            <div className="absolute left-3 top-2 bottom-2 w-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="w-full bg-blue-500 rounded-full origin-top"
                style={{ scaleY: lineProgress, height: '100%' }}
              />
            </div>

            {[
              { title: "Choose Topic", desc: "Select from DSA, C#, or Java modules." },
              { title: "Learn Visually with AI", desc: "Watch animations while AI explains the logic." },
              { title: "Practice with Simulations", desc: "Write code and see it execute memory step-by-step." }
            ].map((step, i) => (
              <div key={i} className="relative flex items-center gap-8 group">
                <div className="absolute -left-[45px] w-8 h-8 rounded-full bg-blue-500 border-4 border-white shadow-lg text-white font-bold flex items-center justify-center text-xs z-10">
                  {i + 1}
                </div>
                <div className="card-glass border-slate-200 flex-1 hover:shadow-2xl transition-shadow cursor-default">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-lg">{step.desc}</p>
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
          <div className="bg-slate-900 rounded-[32px] w-full h-[500px] shadow-2xl overflow-hidden flex flex-col border border-slate-800 relative">
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-slate-400 font-mono text-sm ml-4 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-blue-400"/> Friday AI Tutor Session</span>
            </div>
            
            <div className="p-8 flex-1 flex flex-col gap-6 overflow-hidden">
              <motion.div style={{ opacity: msg1Opacity, y: msg1Y }} className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-md self-end font-medium">
                Can you explain how a Stack works in C#?
              </motion.div>
              
              <motion.div style={{ opacity: msg2Opacity, y: msg2Y }} className="bg-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-lg border border-slate-700">
                <p>A Stack follows the LIFO (Last In, First Out) principle. Here is how you initialize and push to it:</p>
                <div className="mt-4 bg-black/50 p-4 rounded-xl border border-slate-700 font-mono text-sm text-blue-300">
                  Stack&lt;string&gt; s = new Stack&lt;string&gt;();<br/>
                  s.Push("First");<br/>
                  s.Push("Second");
                </div>
              </motion.div>

              <motion.div style={{ opacity: msg3Opacity, y: msg3Y }} className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-md self-end font-medium">
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
          
          <motion.div style={{ y: particleY }} className="absolute inset-0 -z-10 overflow-hidden opacity-50 pointer-events-none">
             <div className="absolute top-[20%] left-[20%] w-32 h-32 bg-blue-400 rounded-full blur-[80px]"></div>
             <div className="absolute bottom-[20%] right-[20%] w-48 h-48 bg-indigo-500 rounded-full blur-[100px]"></div>
          </motion.div>

          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-8 shadow-2xl shadow-blue-500/50 animate-brain-pulse">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Experience the Future of Learning
          </h2>
          <p className="text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of students mastering complex concepts with EduVerse AI.
          </p>
          <div className="flex gap-6 justify-center">
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-xl px-10 py-5 rounded-2xl shadow-blue-500/30">Explore Modules</button>
            <button className="btn-secondary text-xl px-10 py-5 rounded-2xl border-slate-300">Launch Demo</button>
          </div>
        </motion.div>

      </div>
      
      <LoginDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onOpenRegister={() => navigate('/register')} />
    </div>
  );
}
