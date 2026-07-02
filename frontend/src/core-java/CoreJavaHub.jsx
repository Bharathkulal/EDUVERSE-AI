import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CoreJavaCoursePage from './CoreJavaCoursePage';
import CoreJavaPracticalLab from './CoreJavaPracticalLab';
import { useTheme } from '../context/ThemeContext';
import LearningHubBackground from '../components/LearningHubBackground';

export default function CoreJavaHub() {
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
          ← Back to Java Hub
        </button>
        <CoreJavaCoursePage />
      </div>
    );
  }

  if (activeView === 'practical') {
    return <CoreJavaPracticalLab onBack={() => setActiveView('hub')} />;
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

      {/* Background patterns */}
      <LearningHubBackground isDark={isDark} />

      {/* TOP SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl space-y-4 mb-12 z-10"
      >
        <div className="flex justify-center items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-650 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/20">
            ☕
          </div>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black ${
          isDark 
            ? 'bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent' 
            : 'text-slate-900'
        }`}>
          Java Core Fundamentals
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Master variables, compilation pipelines, standard operations, OOP paradigms, exception hierarchies, and core collections.
        </p>

        {/* Progress bar */}
        <div className={`max-w-md mx-auto pt-4 flex items-center justify-between gap-4 p-4 rounded-2xl border ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-500" size={18} />
            <div className="text-left">
              <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Level</span>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Level 2 — Explorer</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-650">700 XP</span>
            <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>40% Complete</span>
          </div>
        </div>
      </motion.div>

      {/* CENTER: TWO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full z-10">
        
        {/* LEFT CARD: THEORY */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="relative group cursor-pointer p-[1px] rounded-3xl overflow-hidden"
          onClick={() => setActiveView('theory')}
        >
          <div className={`absolute inset-0 bg-gradient-to-b from-orange-500/40 to-transparent opacity-50 group-hover:opacity-100 transition duration-300`} />
          <div className={`relative p-8 rounded-3.5xl flex flex-col justify-between h-full border min-h-[360px] ${
            isDark ? 'bg-[#120e2a]/90 border-white/5' : 'bg-white border-slate-200 shadow-md group-hover:shadow-lg transition-shadow'
          }`}>
            <div className="space-y-6 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                isDark ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' : 'bg-orange-50 border border-orange-100 text-orange-600'
              }`}>
                📚
              </div>
              <div>
                <h2 className={`text-2xl font-black group-hover:text-orange-500 transition ${isDark ? 'text-white' : 'text-slate-800'}`}>Theory Learning</h2>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Learn concepts, runtime operations, execution flows, voice-guided details, flashcards, and chapter assessments.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Voice Teacher', 'Analogies', 'Code Breakdowns', 'MCQs', 'Revision Guides'].map((feat, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-orange-500/10 border border-orange-500/20 text-orange-300' : 'bg-orange-50 border border-orange-100 text-orange-600'
                  }`}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition duration-300 mt-8 flex items-center justify-center gap-2 group-hover:gap-3">
              Continue Theory <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* RIGHT CARD: PRACTICAL */}
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="relative group cursor-pointer p-[1px] rounded-3xl overflow-hidden"
          onClick={() => setActiveView('practical')}
        >
          <div className={`absolute inset-0 bg-gradient-to-b from-purple-500/40 to-transparent opacity-50 group-hover:opacity-100 transition duration-300`} />
          <div className={`relative p-8 rounded-3.5xl flex flex-col justify-between h-full border min-h-[360px] ${
            isDark ? 'bg-[#120e2a]/90 border-white/5' : 'bg-white border-slate-200 shadow-md group-hover:shadow-lg transition-shadow'
          }`}>
            <div className="space-y-6 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                isDark ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 'bg-purple-50 border border-purple-100 text-purple-600'
              }`}>
                💻
              </div>
              <div>
                <h2 className={`text-2xl font-black group-hover:text-purple-500 transition ${isDark ? 'text-white' : 'text-slate-800'}`}>Practical Lab</h2>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Build modular projects, compile code inside the sandbox, animate collections data flows, and resolve runtime exception bugs.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {['IDE Sandbox', 'Collections Vis', 'OOP Hierarchy', 'Exceptions Sim', 'AI Code Reviews'].map((feat, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' : 'bg-purple-50 border border-purple-100 text-purple-600'
                  }`}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-purple-600 hover:bg-purple-750 text-white text-xs font-bold rounded-xl transition duration-300 mt-8 flex items-center justify-center gap-2 group-hover:gap-3">
              Enter Practical Lab <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
