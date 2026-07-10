import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import DBMSTheory from './DBMSTheory';
import DBMSLab from '../components/DBMSLab';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function DBMSHub() {
  const [activeView, setActiveView] = useState('hub'); // 'hub', 'theory', 'practical'
  const { isDarkMode: isDark } = useTheme();
  const navigate = useNavigate();

  if (activeView === 'theory') {
    return (
      <div className="relative">
        <button 
          onClick={() => setActiveView('hub')}
          className={`absolute top-4 left-4 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
            isDark 
              ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
          }`}
        >
          ← Back to DBMS Hub
        </button>
        <DBMSTheory />
      </div>
    );
  }

  if (activeView === 'practical') {
    return (
      <div className="relative">
        <button 
          onClick={() => setActiveView('hub')}
          className={`absolute top-4 left-4 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
            isDark 
              ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
          }`}
        >
          ← Back to DBMS Hub
        </button>
        <div className="pt-16">
          <DBMSLab />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[85vh] flex flex-col justify-center items-center font-sans p-6 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#070313] text-slate-100' : 'bg-slate-50/55 text-slate-900'
    }`}>
      {/* Background Glows */}
      {isDark && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Back Button to Subjects */}
      <button 
        onClick={() => navigate('/subjects')}
        className={`absolute top-6 left-6 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
          isDark 
            ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-cyan-500/20' 
            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
        }`}
      >
        <ArrowLeft size={16} /> Back to Subjects
      </button>

      {/* TOP SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl space-y-4 mb-12 z-10"
      >
        <div className="flex justify-center items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-teal-500/20 text-white font-black">
            🗄️
          </div>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black ${
          isDark 
            ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent' 
            : 'text-slate-900'
        }`}>
          Database Management (DBMS)
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Master Entity-Relationship design, schema normalizations (1NF/2NF/3NF), transactional ACID rules, and complex SQL joins inside our dynamic compiler.
        </p>

        {/* Progress bar */}
        <div className={`max-w-md mx-auto pt-4 flex items-center justify-between gap-4 p-4 rounded-2xl border ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-500" size={18} />
            <div className="text-left">
              <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Level</span>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Level 4 — DB Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-600">1,150 XP</span>
            <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>40% Complete</span>
          </div>
        </div>
      </motion.div>

      {/* CENTER: TWO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full z-10 px-4">
        {/* THEORY MODE */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={() => setActiveView('theory')}
          className={`p-8 rounded-[32px] border cursor-pointer flex flex-col justify-between h-[280px] transition-all relative overflow-hidden group ${
            isDark 
              ? 'bg-[#120e2a]/60 border-cyan-500/10 hover:border-cyan-500/35 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] shadow-xl shadow-cyan-950/20' 
              : 'bg-white border-slate-200 hover:shadow-2xl hover:shadow-slate-300/50 shadow-md'
          }`}
        >
          <div 
            className="absolute inset-0 bg-no-repeat bg-right-bottom pointer-events-none rounded-[32px] transition-opacity duration-300 opacity-[0.22] dark:opacity-[0.38] mix-blend-screen"
            style={{ backgroundImage: "url('/theory_bg.png')", backgroundSize: '60% auto' }}
          />
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl font-bold">
                <BookOpen size={22} />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Theory Studio</span>
            </div>
            <div className="space-y-1.5 text-left">
              <h3 className="text-xl font-bold">Interactive Voice Teacher</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-655'}`}>
                Study three-schema architectures, key relations, Normalization, ACID transactions, and lock structures with our bilingual audio coach.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end text-cyan-400 gap-1 text-xs font-bold font-mono uppercase tracking-wider group-hover:translate-x-1.5 transition-transform duration-300 relative z-10">
            <span>Enter Studio</span>
            <ArrowRight size={14} />
          </div>
        </motion.div>
 
        {/* PRACTICAL LAB */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={() => setActiveView('practical')}
          className={`p-8 rounded-[32px] border cursor-pointer flex flex-col justify-between h-[280px] transition-all relative overflow-hidden group ${
            isDark 
              ? 'bg-[#120e2a]/60 border-teal-500/10 hover:border-teal-500/35 hover:shadow-[0_0_40px_rgba(20,184,166,0.15)] shadow-xl shadow-teal-950/20' 
              : 'bg-white border-slate-200 hover:shadow-2xl hover:shadow-slate-300/50 shadow-md'
          }`}
        >
          <div 
            className="absolute inset-0 bg-no-repeat bg-right-bottom pointer-events-none rounded-[32px] transition-opacity duration-300 opacity-[0.22] dark:opacity-[0.38] mix-blend-screen"
            style={{ backgroundImage: "url('/practical_bg.png')", backgroundSize: '60% auto' }}
          />
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 text-2xl font-bold">
                <Code2 size={22} />
              </div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">SQLite Playground</span>
            </div>
            <div className="space-y-1.5 text-left">
              <h3 className="text-xl font-bold">Interactive SQL Lab</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-655'}`}>
                Write SQL tables, perform insert queries, join datasets, execute aggregate calculations, and preview memory grids dynamically.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end text-teal-400 gap-1 text-xs font-bold font-mono uppercase tracking-wider group-hover:translate-x-1.5 transition-transform duration-300 relative z-10">
            <span>Open Playground</span>
            <ArrowRight size={14} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
