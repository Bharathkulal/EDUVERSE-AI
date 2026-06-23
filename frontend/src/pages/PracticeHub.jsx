import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingQuest from './TypingQuest';
import CodingBattleSystem from './CodingBattleSystem';

export default function PracticeHub() {
  const [activeModule, setActiveModule] = useState(null);

  const modules = [
    { id: 'typing', title: 'Typing Quest', icon: '⌨️', desc: 'Improve your coding speed and accuracy.', color: 'from-blue-500 to-cyan-400' },
    { id: 'coding', title: 'Coding Challenges', icon: '💻', desc: 'Solve algorithm problems to level up.', color: 'from-purple-500 to-pink-500' },
    { id: 'debugging', title: 'Debugging Arena', icon: '🐛', desc: 'Find and fix bugs under time pressure.', color: 'from-red-500 to-orange-500' },
    { id: 'quiz', title: 'Quiz Arena', icon: '🧠', desc: 'Test your theoretical knowledge.', color: 'from-green-500 to-emerald-400' },
    { id: 'interview', title: 'Interview Practice', icon: '🎙️', desc: 'Mock interviews with an AI avatar.', color: 'from-indigo-500 to-purple-600' },
    { id: 'leaderboard', title: 'Leaderboards', icon: '🏆', desc: 'See where you rank among peers.', color: 'from-yellow-400 to-orange-500' },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--db-bg-main)] text-[var(--db-text-main)] p-6 relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {!activeModule ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex flex-col gap-6"
          >
            {/* Hero Section */}
            <div className="flex-none bg-[var(--db-card-bg-elevated)] backdrop-blur-xl border border-[var(--db-border)] p-6 rounded-3xl shadow-2xl flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Practice Hub</h1>
                <p className="text-[var(--db-text-muted)] mt-2">Level up your skills through gamified challenges.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-400 mb-1">Level 12 Learner</div>
                  <div className="w-48 h-3 bg-[var(--db-input-bg)] rounded-full overflow-hidden border border-[var(--db-border)]">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[74%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  </div>
                  <div className="text-xs text-[var(--db-text-muted)] mt-1">1850 / 2500 XP</div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg border border-white/20">
                  U
                </div>
              </div>
            </div>

            {/* 6-Card Grid */}
            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-6 min-h-0">
              {modules.map((mod, i) => (
                <motion.div
                  key={mod.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveModule(mod.id)}
                  className="bg-[var(--db-card-bg)] backdrop-blur-md border border-[var(--db-border)] rounded-3xl p-6 cursor-pointer hover:border-[var(--db-text-accent)] transition-all shadow-lg flex flex-col justify-center relative overflow-hidden group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{mod.icon}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--db-text-accent)] transition-colors">{mod.title}</h3>
                  <p className="text-sm text-[var(--db-text-muted)] leading-relaxed">{mod.desc}</p>
                  
                  <div className="mt-auto pt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-[var(--db-text-accent)] uppercase tracking-wider">Start Challenge</span>
                    <svg className="w-5 h-5 text-[var(--db-text-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : activeModule === 'typing' ? (
          <TypingQuest key="typing-quest" onExit={() => setActiveModule(null)} />
        ) : activeModule === 'coding' ? (
          <CodingBattleSystem key="coding-battle" onExit={() => setActiveModule(null)} />
        ) : (
          <motion.div 
            key="module"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full flex flex-col bg-[var(--db-card-bg-elevated)] backdrop-blur-xl border border-[var(--db-border)] rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--db-border)] bg-[var(--db-card-bg)]">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveModule(null)}
                  className="p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-xl transition text-[var(--db-text-muted)] hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h2 className="text-xl font-bold">{modules.find(m => m.id === activeModule)?.title}</h2>
              </div>
              <div className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg">
                Pro Mode Active
              </div>
            </div>
            
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">{modules.find(m => m.id === activeModule)?.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{modules.find(m => m.id === activeModule)?.title} Module</h3>
                <p className="text-[var(--db-text-muted)] max-w-md mx-auto mb-8">This module is currently under active development. The simulation environment will be initialized soon.</p>
                <button 
                  onClick={() => setActiveModule(null)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
