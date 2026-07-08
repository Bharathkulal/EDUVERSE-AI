import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MathTheory from './MathTheory';
import { useTheme } from '../context/ThemeContext';

export default function MathHub({ onSelectView, originalPracticalView }) {
  const [activeView, setActiveView] = useState('hub'); // 'hub', 'theory'
  const { isDarkMode: isDark } = useTheme();
  const navigate = useNavigate();

  if (activeView === 'theory') {
    return <MathTheory onBack={() => setActiveView('hub')} />;
  }

  return (
    <div className={`min-h-[85vh] flex flex-col justify-center items-center font-sans p-6 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#070313] text-slate-100' : 'bg-slate-50/50 text-slate-900'
    }`}>
      {/* Back Button to Subjects */}
      <button 
        onClick={() => navigate('/subjects')}
        className={`absolute top-6 left-6 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
          isDark 
            ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-purple-500/20' 
            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
        }`}
      >
        <ArrowLeft size={16} /> Back to Subjects
      </button>

      {/* Floating math symbols in background */}
      {isDark && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-10 left-10 text-4xl font-serif text-emerald-500 animate-pulse">∫ dx</div>
          <div className="absolute bottom-20 left-20 text-3xl font-serif text-blue-500">lim x→0</div>
          <div className="absolute top-20 right-20 text-4xl font-serif text-purple-500">∂y/∂x</div>
          <div className="absolute bottom-10 right-10 text-3xl font-serif text-teal-500">∑ n=1</div>
        </div>
      )}

      {/* Background Glows */}
      {isDark && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* TOP SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl space-y-4 mb-12 z-10"
      >
        <div className="flex justify-center items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 text-white font-bold">
            📐
          </div>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black ${
          isDark 
            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent' 
            : 'text-slate-900'
        }`}>
          Mathematics Classroom
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Step into a premium AI-guided interactive mathematics learning platform. Graph formulas, solve calculations step-by-step, and test probability matrices.
        </p>
      </motion.div>

      {/* CENTER: TWO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full z-10">
        
        {/* REDESIGNED PREMIUM THEORY CARD */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="relative group cursor-pointer p-[1px] rounded-3xl overflow-hidden"
          onClick={() => setActiveView('theory')}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/40 to-transparent opacity-50 group-hover:opacity-100 transition duration-300" />
          <div className={`relative p-8 rounded-3.5xl flex flex-col justify-between h-full border min-h-[360px] ${
            isDark ? 'bg-[#120e2a]/90 border-white/5' : 'bg-white border-slate-200 shadow-md group-hover:shadow-lg transition-shadow'
          }`}>
            <div className="space-y-6 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
              }`}>
                🏫
              </div>
              <div>
                <h2 className="text-2xl font-black group-hover:text-emerald-500 transition text-white">Theory Classroom</h2>
                <p className="text-xs mt-2 leading-relaxed text-slate-400">
                  AI voice guidance in Kannada, visual formula breakdowns, coin-roll simulation engines, and step-by-step calculation debuggers.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Kannada Voice', 'Graph Visuals', 'Solver Engine', 'Mistakes Detector', 'Practice'].map((feat, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-350' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                  }`}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition duration-300 mt-8 flex items-center justify-center gap-2 group-hover:gap-3">
              Continue Theory <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* PRACTICAL LAB CARD (Routes to existing practical layout) */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="relative group cursor-pointer p-[1px] rounded-3xl overflow-hidden"
          onClick={() => onSelectView('practical')}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/40 to-transparent opacity-50 group-hover:opacity-100 transition duration-300" />
          <div className={`relative p-8 rounded-3.5xl flex flex-col justify-between h-full border min-h-[360px] ${
            isDark ? 'bg-[#120e2a]/90 border-white/5' : 'bg-white border-slate-200 shadow-md group-hover:shadow-lg transition-shadow'
          }`}>
            <div className="space-y-6 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                isDark ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400' : 'bg-teal-50 border border-teal-100 text-teal-600'
              }`}>
                💻
              </div>
              <div>
                <h2 className="text-2xl font-black group-hover:text-teal-500 transition text-white">Practical Lab</h2>
                <p className="text-xs mt-2 leading-relaxed text-slate-400">
                  Run numerical codes, simulate Runge-Kutta equations, and compute linear algebra structures.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Numerical Methods', 'Calculus Simulator', 'Linear Algebra'].map((feat, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-teal-500/10 border border-teal-500/20 text-teal-350' : 'bg-teal-50 border border-teal-100 text-teal-600'
                  }`}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition duration-300 mt-8 flex items-center justify-center gap-2 group-hover:gap-3">
              Enter Practical Lab <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
