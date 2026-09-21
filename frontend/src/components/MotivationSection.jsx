import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Lightbulb, BrainCircuit, Sparkles, Trophy, 
  Flame, Compass, Feather, GraduationCap, ArrowRight, 
  Quote, CheckCircle2, ShieldCheck, Zap, Layers, Cpu, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MINDSETS = [
  {
    id: 'architect',
    role: 'Senior System Architect',
    tag: 'Systemic Mastery & High Scale',
    icon: Cpu,
    badgeBg: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30',
    glowColor: 'glow-cyan',
    readingTitle: 'Distributed Consensus, Zero-Trust Paradigms & Concurrent Graph Execution',
    quote: 'Beside earned credentials, what keeps me returning to EduVerse is the cognitive friction. The visual execution engines and interactive state machine simulations provoke me to rethink how high-concurrency kernels handle distributed locks under extreme load.',
    author: 'Dr. Elena Rostova',
    credentials: 'Principal Architect & IEEE Fellow',
    sparks: ['Visual Concurrency Mechanics', 'Zero-Trust Protocol Interactive Proofs', 'Memory Optimization Benchmarks'],
    targetPath: '/subjects'
  },
  {
    id: 'researcher',
    role: 'AI Researcher & Scholar',
    tag: 'Theoretical Rigor & Mathematical Proofs',
    icon: BrainCircuit,
    badgeBg: 'bg-[#8B5CF6]/10 text-[#C084FC] border-[#8B5CF6]/30',
    glowColor: 'glow-purple',
    readingTitle: 'Calculus of Neural Manifolds & Higher-Order Gradient Flow Optimization',
    quote: 'Most online learning portals cater only to surface-level certificates. EduVerse is a rare sanctuary for high-density technical reading that provokes real mathematical inspiration. It bridges raw equations with intuitive geometric visualizers.',
    author: 'Marcus Vance, PhD',
    credentials: 'Computational Mathematics & Deep Learning Scholar',
    sparks: ['Geometric Intuition of Tensors', 'Real-Time Vector Field Dynamics', 'High-Density Academic Reading Tracks'],
    targetPath: '/math-visualizer'
  },
  {
    id: 'innovator',
    role: 'Cross-Disciplinary Tech Leader',
    tag: 'Visionary Synthesis & Breakthrough Ideation',
    icon: Lightbulb,
    badgeBg: 'bg-[#10B981]/10 text-[#34D399] border-[#10B981]/30',
    glowColor: 'glow-blue',
    readingTitle: 'Quantum-Resilient Systems & Algorithmic Elegance in Modern Architecture',
    quote: 'Higher-qualified professionals don’t visit a platform merely for badge collection; we visit to be inspired. Reading synthesized technical deep-dives on EduVerse stimulates non-obvious ideas that directly inform our product roadmap.',
    author: 'Siddharth Nair',
    credentials: 'VP of Engineering & Open Source Contributor',
    sparks: ['Cross-Domain Architectural Synthesis', 'Voice-Guided Technical Deep Dives', 'Interactive Problem-Solving Arena'],
    targetPath: '/study-materials'
  }
];

export default function MotivationSection({ onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('architect');
  const navigate = useNavigate();

  const activeMindset = MINDSETS.find(m => m.id === activeTab) || MINDSETS[0];

  return (
    <section id="motivation" className="relative py-28 bg-[#040612] border-t border-white/5 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#00D4FF]/10 via-[#8B5CF6]/15 to-[#3B82F6]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] glass text-white/90 border border-white/10 shadow-lg">
            <Sparkles size={14} className="text-[#00D4FF] animate-pulse" />
            <span>Beyond Credentials & Paper Degrees</span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Why High-Caliber Minds Visit EduVerse:<br />
            <span className="text-gradient">To Read, Provoke Thought & Fuel Inspiration</span>
          </h2>

          <p className="text-sm md:text-base text-white/60 leading-relaxed font-normal">
            Credentials certify past milestones; active intellectual reading shapes future breakthroughs. 
            EduVerse is designed for scholars, domain experts, senior engineers, and curious researchers 
            seeking deep conceptual friction, cross-disciplinary synthesis, and transformative mastery.
          </p>
        </div>

        {/* 4 Core Pillars of Motivation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          
          {/* Pillar 1 */}
          <div className="card-glow glow-cyan rounded-2xl border border-white/10 p-6 glass text-left space-y-4 relative group">
            <div className="h-12 w-12 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] group-hover:scale-110 transition-transform">
              <BrainCircuit size={24} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Provoke Cognitive Friction</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Surpass surface tutorials. Engage with multi-variable visualizers, algorithmic trade-off simulators, and non-trivial edge cases that challenge assumptions.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#00D4FF]">
              <Flame size={12} /> Deep Mental Stimulation
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="card-glow glow-purple rounded-2xl border border-white/10 p-6 glass text-left space-y-4 relative group">
            <div className="h-12 w-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#C084FC] group-hover:scale-110 transition-transform">
              <Lightbulb size={24} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Spark Visionary Ideas</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Bridge abstract mathematical logic, neural dynamics, and system architecture to generate non-obvious insights and fuel original research.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#C084FC]">
              <Sparkles size={12} /> Cross-Domain Synthesis
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="card-glow glow-blue rounded-2xl border border-white/10 p-6 glass text-left space-y-4 relative group">
            <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#60A5FA] group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">High-Density Reading</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Immerse in curated academic digests, voice-assisted reading tracks, and interactive code codices engineered for rapid, high-signal cognitive assimilation.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#60A5FA]">
              <Feather size={12} /> Zero-Fluff Precision
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="card-glow glow-[#10B981] rounded-2xl border border-white/10 p-6 glass text-left space-y-4 relative group">
            <div className="h-12 w-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#34D399] group-hover:scale-110 transition-transform">
              <Award size={24} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Mastery Beside Credentials</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              While credentials verify completion for resumes, true experts visit for perpetual learning, intellectual fulfillment, and mastering complex real-world systems.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#34D399]">
              <Trophy size={12} /> Intrinsic Excellence
            </div>
          </div>

        </div>

        {/* Interactive Mindset Reader Showcase */}
        <div className="glass-strong rounded-3xl border border-white/10 p-6 md:p-10 relative overflow-hidden shadow-2xl">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-8 border-b border-white/5">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#00D4FF]">Intellectual Reading Perspectives</span>
              <h3 className="font-display text-2xl font-extrabold text-white mt-1">What Brings Qualified Experts to the Portal?</h3>
            </div>

            {/* Mindset Selector Tabs */}
            <div className="flex flex-wrap gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {MINDSETS.map((m) => {
                const IconComponent = m.icon;
                const isActive = activeTab === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveTab(m.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#4F7DFF] to-[#8B5CF6] text-white shadow-lg scale-105' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent size={14} />
                    <span>{m.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Content Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMindset.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 text-left items-center"
            >
              {/* Left Column: Quote & Testimonial (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${activeMindset.badgeBg}`}>
                    <GraduationCap size={12} />
                    {activeMindset.tag}
                  </span>
                </div>

                {/* Quote Box */}
                <div className="relative pl-6 border-l-2 border-[#8B5CF6]">
                  <Quote size={28} className="text-white/10 absolute -top-2 -left-3" />
                  <p className="text-sm md:text-base text-white/90 italic leading-relaxed font-normal">
                    "{activeMindset.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center font-bold text-white text-xs">
                    {activeMindset.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeMindset.author}</h4>
                    <p className="text-[11px] text-white/50">{activeMindset.credentials}</p>
                  </div>
                </div>

              </div>

              {/* Right Column: Reading Track Focus & Sparks (5 cols) */}
              <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-5">
                
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Current Reading Track</span>
                  <h4 className="font-display text-sm font-bold text-white mt-1 leading-snug">
                    {activeMindset.readingTitle}
                  </h4>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#00D4FF]">Intellectual Sparks</span>
                  <div className="space-y-2">
                    {activeMindset.sparks.map((spark, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                        <CheckCircle2 size={14} className="text-[#34D399] shrink-0" />
                        <span>{spark}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button 
                    onClick={() => navigate(activeMindset.targetPath)}
                    className="btn-primary rounded-xl text-xs font-bold px-4 py-2.5 inline-flex items-center gap-2 w-full justify-center"
                  >
                    <span>Read Track & Explore</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

          {/* Bottom Action bar in card */}
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-white/50">
              <ShieldCheck size={16} className="text-[#00D4FF]" />
              <span>Designed for rigorous reading, deep focus, and high intellectual productivity.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/study-materials')}
                className="text-white/80 hover:text-white font-semibold underline underline-offset-4 cursor-pointer text-xs"
              >
                Browse Academic Content Hub &rarr;
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
