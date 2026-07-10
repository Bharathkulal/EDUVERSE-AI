import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MathTheory from './MathTheory';
import { useTheme } from '../context/ThemeContext';
import LearningHubBackground from '../components/LearningHubBackground';
import HubCards from '../components/HubCards';

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

      {/* Background Glows */}
      {isDark && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Background patterns */}
      <LearningHubBackground isDark={isDark} />

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
      <HubCards 
        isDark={isDark} 
        onSelectView={(view) => {
          if (view === 'theory') setActiveView('theory');
          else onSelectView('practical');
        }}
      />
    </div>
  );
}
