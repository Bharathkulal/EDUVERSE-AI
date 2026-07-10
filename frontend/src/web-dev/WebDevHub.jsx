import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import WebDevCoursePage from './WebDevCoursePage';
import WebDevLab from '../components/WebDevLab';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import HubCards from '../components/HubCards';

export default function WebDevHub() {
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
          ← Back to Web Dev Hub
        </button>
        <WebDevCoursePage />
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
          ← Back to Web Dev Hub
        </button>
        <div className="pt-16">
          <WebDevLab />
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Back Button to Subjects */}
      <button 
        onClick={() => navigate('/subjects')}
        className={`absolute top-6 left-6 z-50 px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
          isDark 
            ? 'bg-[#120e2a] hover:bg-[#1a143b] text-white border-blue-500/20' 
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20 text-white font-black">
            🌐
          </div>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black ${
          isDark 
            ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent' 
            : 'text-slate-900'
        }`}>
          Web Development
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Study HTML, CSS, JavaScript DOM operations, network protocols, API architectures, and React development.
        </p>

        {/* Progress bar */}
        <div className={`max-w-md mx-auto pt-4 flex items-center justify-between gap-4 p-4 rounded-2xl border ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-500" size={18} />
            <div className="text-left">
              <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Level</span>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Level 5 — Fullstack Eng</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600">1,600 XP</span>
            <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>60% Complete</span>
          </div>
        </div>
      </motion.div>

      {/* CENTER: TWO CARDS */}
      <HubCards isDark={isDark} onSelectView={setActiveView} />
    </div>
  );
}
