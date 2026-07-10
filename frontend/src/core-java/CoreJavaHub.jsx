import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CoreJavaCoursePage from './CoreJavaCoursePage';
import CoreJavaLab from './CoreJavaLab';
import { useTheme } from '../context/ThemeContext';
import LearningHubBackground from '../components/LearningHubBackground';
import HubCards from '../components/HubCards';

export default function CoreJavaHub() {
  const [activeView, setActiveView] = useState('hub'); // 'hub', 'theory', 'practical'
  const { isDarkMode: isDark } = useTheme();
  const navigate = useNavigate();

  if (activeView === 'theory') {
    return (
      <div className="relative pt-12 w-full">
        <button 
          onClick={() => setActiveView('hub')}
          className={`absolute top-4 left-4 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
            isDark 
              ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-orange-500/20' 
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
          }`}
        >
          ← Back to Hub
        </button>
        <CoreJavaCoursePage />
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
              ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-orange-500/20' 
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
          }`}
        >
          ← Back to Hub
        </button>
        <div className="pt-16">
          <CoreJavaLab />
        </div>
      </div>
    );
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
            ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-orange-500/20' 
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/20 text-white font-bold">
            ☕
          </div>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black ${
          isDark 
            ? 'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent' 
            : 'text-slate-900'
        }`}>
          Core Java Programming
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Study object-oriented classes, collections APIs, file handling, threading paradigms, and runtime execution patterns.
        </p>

        {/* Progress bar */}
        <div className={`max-w-md mx-auto pt-4 flex items-center justify-between gap-4 p-4 rounded-2xl border ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-500" size={18} />
            <div className="text-left">
              <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Level</span>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Level 1 — Learner</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-500">250 XP</span>
            <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>20% Complete</span>
          </div>
        </div>
      </motion.div>

      {/* CENTER: TWO CARDS */}
      <HubCards isDark={isDark} onSelectView={setActiveView} />
    </div>
  );
}
