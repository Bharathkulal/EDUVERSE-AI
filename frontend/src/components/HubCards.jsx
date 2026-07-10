import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  FileText, 
  TrendingUp, 
  Code2, 
  Bot, 
  Database, 
  Terminal, 
  Rocket, 
  Package, 
  ArrowRight 
} from 'lucide-react';

export default function HubCards({ isDark, onSelectView }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10 px-4">
      {/* LEFT CARD: THEORY */}
      <motion.div
        whileHover={{ y: -8, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="relative group cursor-pointer rounded-[32px] border overflow-hidden h-[460px] flex flex-col justify-between p-8 transition-all duration-300 bg-gradient-to-b from-[#120e2a]/95 to-[#080512]/98 border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_50px_rgba(139,92,246,0.18)] shadow-2xl shadow-purple-950/20"
        onClick={() => onSelectView('theory')}
      >
        {/* Glowing aura */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Background Image / Illustration */}
        <div 
          className="absolute right-[-20px] bottom-[-20px] w-[260px] h-[340px] bg-no-repeat bg-contain bg-right-bottom pointer-events-none transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          style={{ backgroundImage: "url('/theory_bg.png')" }}
        />

        <div className="space-y-6 text-left relative z-10">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-none text-white">
              Theory <br />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">Learning</span>
            </h2>
            <p className="text-xs mt-3 leading-relaxed max-w-[240px] text-slate-400">
              Explore concepts, architecture, interview questions, notes, and AI-powered explanations.
            </p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 group-hover:text-white transition">
              <BookOpen size={14} className="text-purple-400" />
              <span>Concepts</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 group-hover:text-white transition">
              <Brain size={14} className="text-purple-400" />
              <span>Explanations</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 group-hover:text-white transition">
              <FileText size={14} className="text-purple-400" />
              <span>Notes</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 group-hover:text-white transition">
              <div className="flex items-center justify-center w-5 h-5 rounded bg-purple-500/10 border border-purple-500/30 text-[9px] font-black text-purple-400 font-mono">AI</div>
              <span>AI Tutor</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 group-hover:text-white transition">
              <TrendingUp size={14} className="text-purple-400" />
              <span>Learning Paths</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 group-hover:text-white transition">
              <div className="flex items-center justify-center px-1.5 h-5 rounded bg-purple-500/10 border border-purple-500/30 text-[8px] font-black text-purple-400 font-mono">Q/A</div>
              <span>MCQs & Quizzes</span>
            </div>
          </div>
        </div>

        <button className="flex items-center justify-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-purple-400 hover:text-purple-300 transition group-hover:translate-x-1.5 duration-300 relative z-10 w-fit">
          <span>Enter Classroom</span>
          <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* RIGHT CARD: PRACTICAL */}
      <motion.div
        whileHover={{ y: -8, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="relative group cursor-pointer rounded-[32px] border overflow-hidden h-[460px] flex flex-col justify-between p-8 transition-all duration-300 bg-gradient-to-b from-[#0a1224]/95 to-[#040710]/98 border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_50px_rgba(6,182,212,0.18)] shadow-2xl shadow-cyan-950/20"
        onClick={() => onSelectView('practical')}
      >
        {/* Glowing aura */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Background Image / Illustration */}
        <div 
          className="absolute right-[-20px] bottom-[-20px] w-[260px] h-[340px] bg-no-repeat bg-contain bg-right-bottom pointer-events-none transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          style={{ backgroundImage: "url('/practical_bg.png')" }}
        />

        <div className="space-y-6 text-left relative z-10">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-none text-white">
              Practical <br />
              <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">Lab</span>
            </h2>
            <p className="text-xs mt-3 leading-relaxed max-w-[240px] text-slate-400">
              Apply your knowledge through coding exercises, real-world projects, and hands-on development.
            </p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-350 group-hover:text-white transition">
              <Code2 size={14} className="text-cyan-400" />
              <span>Coding Exercises</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-350 group-hover:text-white transition">
              <Bot size={14} className="text-cyan-400" />
              <span>AI Assistant</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-350 group-hover:text-white transition">
              <Database size={14} className="text-cyan-400" />
              <span>Database Practice</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-350 group-hover:text-white transition">
              <Terminal size={14} className="text-cyan-400" />
              <span>Debug Arena</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-350 group-hover:text-white transition">
              <Rocket size={14} className="text-cyan-400" />
              <span>Real Projects</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-350 group-hover:text-white transition">
              <Package size={14} className="text-cyan-400" />
              <span>Build & Deploy</span>
            </div>
          </div>
        </div>

        <button className="flex items-center justify-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition group-hover:translate-x-1.5 duration-300 relative z-10 w-fit">
          <span>Enter Practical Lab</span>
          <ArrowRight size={14} />
        </button>
      </motion.div>
    </div>
  );
}
