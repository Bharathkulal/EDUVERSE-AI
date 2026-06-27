import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TypingQuest from './TypingQuest';
import CodingBattleSystem from './CodingBattleSystem';
import QuizArena from './QuizArena';
import InterviewPractice from './InterviewPractice';
import api from '../api/axios';

const HASH_TO_MODULE = {
  '#challenges': 'daily',
  '#flashcards': 'quiz',
  '#mcq': 'quiz',
  '#topic': 'daily',
  '#mock': 'interview',
};

export default function PracticeHub() {
  const [activeModule, setActiveModule] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [mcqAnswer, setMcqAnswer] = useState(null);
  const [dsaAnswer, setDsaAnswer] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const location = useLocation();

  // Hash-based navigation from sidebar
  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_MODULE[hash]) {
      const mod = HASH_TO_MODULE[hash];
      setActiveModule(mod);
      if (mod === 'daily') loadDailyChallenge();
    }
  }, [location.hash]);

  // Load user stats and daily challenge
  useEffect(() => {
    api.get('/progress/dashboard')
      .then(res => {
        setUserStats({
          xp: res.data.profile?.xp || 0,
          streak: res.data.profile?.streak || 0,
          level: Math.max(1, Math.floor(
            (res.data.studyHours || 0) * 2.5 + 
            (res.data.completedLessons || 0) * 1.5 + 
            ((res.data.quizScores?.average || 0) + (res.data.codingScores?.average || 0)) / 20
          ))
        });
      })
      .catch(err => console.error(err));
  }, []);

  const loadDailyChallenge = () => {
    setChallengeLoading(true);
    setSubmitResult(null);
    setMcqAnswer(null);
    setDsaAnswer('');
    api.get('/progress/daily-challenge')
      .then(res => setDailyChallenge(res.data))
      .catch(err => console.error(err))
      .finally(() => setChallengeLoading(false));
  };

  const handleSubmitChallenge = async (challengeType, answer) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const challengeId = challengeType === 'MCQ' ? dailyChallenge.mcqChallenge.id :
                          challengeType === 'DSA' ? dailyChallenge.dsaChallenge.id :
                          dailyChallenge.codingChallenge.id;
      const res = await api.post('/progress/daily-challenge/submit', {
        challengeId,
        challengeType,
        answer
      });
      setSubmitResult({ type: challengeType, ...res.data });
      
      // Refresh stats after successful submission
      if (res.data.success) {
        const statsRes = await api.get('/progress/dashboard');
        setUserStats({
          xp: statsRes.data.profile?.xp || 0,
          streak: statsRes.data.profile?.streak || 0,
          level: Math.max(1, Math.floor(
            (statsRes.data.studyHours || 0) * 2.5 + 
            (statsRes.data.completedLessons || 0) * 1.5 + 
            ((statsRes.data.quizScores?.average || 0) + (statsRes.data.codingScores?.average || 0)) / 20
          ))
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const modules = [
    { id: 'typing', title: 'Typing Quest', icon: '⌨️', desc: 'Improve your coding speed and accuracy.', color: 'from-blue-500 to-cyan-400' },
    { id: 'coding', title: 'Coding Challenges', icon: '💻', desc: 'Solve algorithm problems to level up.', color: 'from-purple-500 to-pink-500' },
    { id: 'daily', title: 'Daily Challenges', icon: '🎯', desc: 'DSA, MCQ & Coding challenges for daily XP.', color: 'from-amber-500 to-orange-500' },
    { id: 'quiz', title: 'Quiz Arena', icon: '🧠', desc: 'Test your theoretical knowledge.', color: 'from-green-500 to-emerald-400' },
    { id: 'interview', title: 'Interview Practice', icon: '🎙️', desc: 'Mock interviews with an AI avatar.', color: 'from-indigo-500 to-purple-600' },
    { id: 'leaderboard', title: 'Leaderboards', icon: '🏆', desc: 'See where you rank among peers.', color: 'from-yellow-400 to-orange-500' },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--db-bg-main)] text-[var(--db-text-main)] p-6 relative premium-practice-hub">
      {/* Background Fluid Blobs */}
      <div className="premium-hub-blob blob-1"></div>
      <div className="premium-hub-blob blob-2"></div>
      <div className="premium-hub-blob blob-3"></div>

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
                  <div className="text-sm font-bold text-blue-400 mb-1">Level {userStats?.level || 1} Learner</div>
                  <div className="w-48 h-3 bg-[var(--db-input-bg)] rounded-full overflow-hidden border border-[var(--db-border)]">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min(100, ((userStats?.xp || 0) % 2500) / 25)}%` }}></div>
                  </div>
                  <div className="text-xs text-[var(--db-text-muted)] mt-1">{userStats?.xp || 0} XP • 🔥 {userStats?.streak || 0} day streak</div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg border border-white/20">
                  {userStats?.level || 1}
                </div>
              </div>
            </div>

            {/* 6-Card Grid */}
            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-8 min-h-0 premium-hub-grid">
              {modules.map((mod, i) => (
                <motion.div
                  key={mod.id}
                  whileHover={{ scale: 1.04, y: -12 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (mod.id === 'daily') {
                      setActiveModule('daily');
                      loadDailyChallenge();
                    } else if (mod.id === 'leaderboard') {
                      setActiveModule('leaderboard');
                      setLeaderboardLoading(true);
                      api.get('/progress/leaderboard')
                        .then(res => setLeaderboard(res.data))
                        .catch(err => console.error(err))
                        .finally(() => setLeaderboardLoading(false));
                    } else {
                      setActiveModule(mod.id);
                    }
                  }}
                  className="premium-hub-card group"
                >
                  <div className="premium-hub-card-bg" />
                  <div className="premium-hub-card-glow" />
                  <div className="premium-hub-card-content">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{mod.icon}</div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 transition-colors duration-300">{mod.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{mod.desc}</p>
                    
                    <div className="mt-auto pt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Start Challenge</span>
                      <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : activeModule === 'typing' ? (
          <TypingQuest key="typing-quest" onExit={() => setActiveModule(null)} />

        ) : activeModule === 'coding' ? (
          <CodingBattleSystem key="coding-battle" onExit={() => setActiveModule(null)} />

        ) : activeModule === 'quiz' ? (
          <QuizArena key="quiz-arena" onExit={() => setActiveModule(null)} />

        ) : activeModule === 'interview' ? (
          <InterviewPractice key="interview-practice" onExit={() => setActiveModule(null)} />

        ) : activeModule === 'daily' ? (
          /* ─── DAILY CHALLENGES MODULE ─── */
          <motion.div 
            key="daily-challenges"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full flex flex-col bg-[var(--db-card-bg-elevated)] backdrop-blur-xl border border-[var(--db-border)] rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--db-border)] bg-[var(--db-card-bg)]">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveModule(null)}
                  className="p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-xl transition text-[var(--db-text-muted)] hover:text-white cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h2 className="text-xl font-bold">🎯 Daily Challenges</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--db-amber-accent)' }}>
                  🔥 {userStats?.streak || 0} Day Streak
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {challengeLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 rounded-full border-4 border-t-violet-600 border-slate-700 animate-spin"></div>
                </div>
              ) : dailyChallenge ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* MCQ Challenge */}
                  <div 
                    className="p-5 rounded-2xl border space-y-4"
                    style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        {dailyChallenge.mcqChallenge.difficulty}
                      </span>
                      <span className="text-xs font-bold" style={{ color: 'var(--db-text-accent)' }}>+{dailyChallenge.mcqChallenge.xpReward} XP</span>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>🧠 {dailyChallenge.mcqChallenge.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--db-text-secondary)' }}>{dailyChallenge.mcqChallenge.question}</p>
                    
                    <div className="space-y-2">
                      {dailyChallenge.mcqChallenge.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const isSelected = mcqAnswer === letter;
                        return (
                          <button
                            key={i}
                            onClick={() => setMcqAnswer(letter)}
                            className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                              isSelected ? 'ring-2 ring-violet-500' : ''
                            }`}
                            style={{ 
                              backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'var(--db-input-bg)',
                              borderColor: isSelected ? 'rgba(139, 92, 246, 0.3)' : 'var(--db-sidebar-border)',
                              color: 'var(--db-text-main)'
                            }}
                          >
                            <span className="font-bold mr-2" style={{ color: 'var(--db-text-accent)' }}>{letter}.</span> {opt}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => handleSubmitChallenge('MCQ', mcqAnswer)}
                      disabled={!mcqAnswer || submitting}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Answer'}
                    </button>

                    {submitResult?.type === 'MCQ' && (
                      <div className={`p-3 rounded-xl text-sm font-semibold ${submitResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {submitResult.feedback}
                        {submitResult.success && <span className="block mt-1 text-xs">+{submitResult.xpReward} XP earned!</span>}
                      </div>
                    )}
                  </div>

                  {/* DSA Challenge */}
                  <div 
                    className="p-5 rounded-2xl border space-y-4"
                    style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--db-amber-accent)' }}>
                        {dailyChallenge.dsaChallenge.difficulty}
                      </span>
                      <span className="text-xs font-bold" style={{ color: 'var(--db-text-accent)' }}>+{dailyChallenge.dsaChallenge.xpReward} XP</span>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>🔧 {dailyChallenge.dsaChallenge.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--db-text-secondary)' }}>{dailyChallenge.dsaChallenge.description}</p>
                    
                    <textarea
                      value={dsaAnswer}
                      onChange={e => setDsaAnswer(e.target.value)}
                      placeholder="Write your solution here..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none resize-none"
                      style={{ 
                        backgroundColor: 'var(--db-input-bg)', 
                        borderColor: 'var(--db-sidebar-border)',
                        color: 'var(--db-text-main)'
                      }}
                    />
                    
                    <button 
                      onClick={() => handleSubmitChallenge('DSA', dsaAnswer)}
                      disabled={!dsaAnswer.trim() || submitting}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Solution'}
                    </button>

                    {submitResult?.type === 'DSA' && (
                      <div className={`p-3 rounded-xl text-sm font-semibold ${submitResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {submitResult.feedback}
                        {submitResult.success && <span className="block mt-1 text-xs">+{submitResult.xpReward} XP earned!</span>}
                      </div>
                    )}
                  </div>

                  {/* Coding Challenge */}
                  <div 
                    className="p-5 rounded-2xl border space-y-4"
                    style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        {dailyChallenge.codingChallenge.difficulty}
                      </span>
                      <span className="text-xs font-bold" style={{ color: 'var(--db-text-accent)' }}>+{dailyChallenge.codingChallenge.xpReward} XP</span>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>💻 {dailyChallenge.codingChallenge.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--db-text-secondary)' }}>{dailyChallenge.codingChallenge.description}</p>

                    <button 
                      onClick={() => setActiveModule('coding')}
                      className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg"
                    >
                      Open Coding IDE →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 space-y-4">
                  <span className="text-5xl block">🎯</span>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--db-text-main)' }}>Daily challenges loading failed</h3>
                  <button 
                    onClick={loadDailyChallenge}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </motion.div>

        ) : activeModule === 'leaderboard' ? (
          /* ─── LEADERBOARD MODULE ─── */
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full flex flex-col bg-[var(--db-card-bg-elevated)] backdrop-blur-xl border border-[var(--db-border)] rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--db-border)] bg-[var(--db-card-bg)]">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveModule(null)}
                  className="p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-xl transition text-[var(--db-text-muted)] hover:text-white cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h2 className="text-xl font-bold">🏆 Leaderboard</h2>
              </div>
              {leaderboard && (
                <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--db-text-accent)' }}>
                  {leaderboard.currentUserRank ? `Your Rank: #${leaderboard.currentUserRank}` : 'Unranked'}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 rounded-full border-4 border-t-violet-600 border-slate-700 animate-spin"></div>
                </div>
              ) : leaderboard ? (
                <div className="space-y-3">
                  {/* Top 3 podium */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {leaderboard.leaderboard.slice(0, 3).map((entry, i) => {
                      const medals = ['🥇', '🥈', '🥉'];
                      const gradients = [
                        'from-amber-500/20 to-yellow-500/5',
                        'from-slate-400/20 to-gray-500/5',
                        'from-amber-700/20 to-orange-500/5'
                      ];
                      return (
                        <div 
                          key={entry.id}
                          className={`p-4 rounded-2xl border text-center ${entry.isCurrentUser ? 'ring-2 ring-violet-500' : ''}`}
                          style={{ 
                            backgroundColor: 'var(--db-card-bg)',
                            borderColor: entry.isCurrentUser ? 'rgba(139, 92, 246, 0.4)' : 'var(--db-sidebar-border)'
                          }}
                        >
                          <div className="text-3xl mb-2">{medals[i]}</div>
                          <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br ${gradients[i]}`} style={{ border: '2px solid var(--db-sidebar-border)' }}>
                            {entry.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="text-sm font-bold truncate" style={{ color: 'var(--db-text-main)' }}>{entry.name}</div>
                          <div className="text-lg font-extrabold mt-1" style={{ color: 'var(--db-text-accent)' }}>{entry.totalXp.toLocaleString()} XP</div>
                          <div className="text-[11px] mt-1" style={{ color: 'var(--db-text-muted)' }}>
                            🔥 {entry.streak} streak • {entry.topicsCompleted} topics
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Full ranking list */}
                  <div className="space-y-2">
                    {leaderboard.leaderboard.slice(3).map((entry) => (
                      <div 
                        key={entry.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${entry.isCurrentUser ? 'ring-2 ring-violet-500' : ''}`}
                        style={{ 
                          backgroundColor: entry.isCurrentUser ? 'rgba(139, 92, 246, 0.05)' : 'var(--db-card-bg)',
                          borderColor: entry.isCurrentUser ? 'rgba(139, 92, 246, 0.3)' : 'var(--db-sidebar-border)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold w-8 text-center" style={{ color: 'var(--db-text-muted)' }}>#{entry.rank}</span>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-violet-600 to-indigo-600">
                            {entry.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <span className="text-sm font-bold block" style={{ color: 'var(--db-text-main)' }}>{entry.name}</span>
                            <span className="text-[11px]" style={{ color: 'var(--db-text-muted)' }}>🔥 {entry.streak} • {entry.topicsCompleted} topics</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold" style={{ color: 'var(--db-text-accent)' }}>{entry.totalXp.toLocaleString()} XP</span>
                      </div>
                    ))}
                  </div>

                  {leaderboard.leaderboard.length === 0 && (
                    <div className="text-center py-16 space-y-3">
                      <span className="text-5xl block">🏆</span>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>No rankings yet</h3>
                      <p className="text-sm" style={{ color: 'var(--db-text-muted)' }}>Complete topics and challenges to appear on the leaderboard!</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>

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
                  className="p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-xl transition text-[var(--db-text-muted)] hover:text-white cursor-pointer"
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
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] cursor-pointer"
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
