import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WebDevCoursePage from './WebDevCoursePage';
import WebDevPracticalLab from './WebDevPracticalLab';
import { useTheme } from '../context/ThemeContext';
import LearningHubBackground from '../components/LearningHubBackground';

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
          ← Back to Hub
        </button>
        <WebDevCoursePage />
      </div>
    );
  }

  if (activeView === 'practical') {
    return <WebDevPracticalLab onBack={() => setActiveView('hub')} />;
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">
            🌐
          </div>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black ${
          isDark 
            ? 'bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent' 
            : 'text-slate-900'
        }`}>
          Web Development Space
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Design, style, and structure websites. Master HTML structures, CSS box styles, layout grids, JavaScript core execution, and React models.
        </p>

        {/* Progress bar */}
        <div className={`max-w-md mx-auto pt-4 flex items-center justify-between gap-4 p-4 rounded-2xl border ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-500" size={18} />
            <div className="text-left">
              <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Level</span>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Level 3 — Frontend Architect</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-500">950 XP</span>
            <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>35% Complete</span>
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
          <div className={`absolute inset-0 bg-gradient-to-b from-blue-500/40 to-transparent opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none`} />
          <div className={`relative p-8 rounded-3.5xl flex flex-col justify-between h-full border min-h-[360px] overflow-hidden ${
            isDark ? 'bg-[#120e2a]/90 border-white/5' : 'bg-white border-slate-200 shadow-md group-hover:shadow-lg transition-shadow'
          }`}>
            <div 
              className="absolute inset-0 bg-no-repeat bg-right-bottom pointer-events-none rounded-3.5xl transition-opacity duration-300 opacity-[0.22] dark:opacity-[0.38] mix-blend-screen"
              style={{ backgroundImage: "url('/theory_bg.png')", backgroundSize: '65% auto' }}
            />
            <div className="space-y-6 text-left relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-100 text-blue-600'
              }`}>
                📚
              </div>
              <div>
                <h2 className={`text-2xl font-black group-hover:text-blue-500 transition ${isDark ? 'text-white' : 'text-slate-800'}`}>Theory Learning</h2>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Study DOM hierarchies, semantic structures, styling mechanisms, event loops, and React state management workflows.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Voice Guide', 'Visual DOM', 'Analogies', 'MCQs', 'Revision Cards'].map((feat, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300' : 'bg-blue-50 border border-blue-100 text-blue-655'
                  }`}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-xl transition duration-300 mt-8 flex items-center justify-center gap-2 group-hover:gap-3 relative z-10">
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
          <div className={`absolute inset-0 bg-gradient-to-b from-cyan-500/40 to-transparent opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none`} />
          <div className={`relative p-8 rounded-3.5xl flex flex-col justify-between h-full border min-h-[360px] overflow-hidden ${
            isDark ? 'bg-[#120e2a]/90 border-white/5' : 'bg-white border-slate-200 shadow-md group-hover:shadow-lg transition-shadow'
          }`}>
            <div 
              className="absolute inset-0 bg-no-repeat bg-right-bottom pointer-events-none rounded-3.5xl transition-opacity duration-300 opacity-[0.22] dark:opacity-[0.38] mix-blend-screen"
              style={{ backgroundImage: "url('/practical_bg.png')", backgroundSize: '65% auto' }}
            />
            <div className="space-y-6 text-left relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                isDark ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border border-cyan-100 text-cyan-655'
              }`}>
                💻
              </div>
              <div>
                <h2 className={`text-2xl font-black group-hover:text-cyan-500 transition ${isDark ? 'text-white' : 'text-slate-800'}`}>Practical Lab</h2>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Code using an interactive sandbox. Animate layout flexboxes, manipulate DOM trees, and compile frontend systems.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Live Workspace', 'Flexbox Lab', 'DOM Inspector', 'Debug Challenges', 'AI Reviewer'].map((feat, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300' : 'bg-cyan-50 border border-cyan-100 text-cyan-655'
                  }`}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition duration-300 mt-8 flex items-center justify-center gap-2 group-hover:gap-3 relative z-10">
              Enter Practical Lab <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
