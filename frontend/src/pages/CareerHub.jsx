import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const HASH_TO_TAB = {
  '#resume': 'resume',
  '#placement': 'placement',
  '#company': 'company',
  '#interview': 'interview',
  '#aptitude': 'aptitude',
  '#portfolio': 'portfolio',
  '#certifications': 'certifications',
};

export default function CareerHub() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('resume');

  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_TAB[hash]) {
      setActiveTab(HASH_TO_TAB[hash]);
    }
  }, [location.hash]);

  const tabs = [
    { id: 'resume', label: 'Resume Builder', icon: '📄' },
    { id: 'placement', label: 'Placement Prep', icon: '🎓' },
    { id: 'company', label: 'Company Qs', icon: '🏢' },
    { id: 'interview', label: 'Interview Prep', icon: '🎤' },
    { id: 'aptitude', label: 'Aptitude', icon: '🧮' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'certifications', label: 'Certifications', icon: '🏆' },
  ];

  const companyQuestions = [
    { company: 'Google', role: 'SDE Intern', difficulty: 'Hard', questions: 45, icon: '🔍' },
    { company: 'Microsoft', role: 'SDE 1', difficulty: 'Medium', questions: 62, icon: '🪟' },
    { company: 'Amazon', role: 'SDE Intern', difficulty: 'Medium', questions: 78, icon: '📦' },
    { company: 'TCS', role: 'Developer', difficulty: 'Easy', questions: 120, icon: '💻' },
    { company: 'Infosys', role: 'SE', difficulty: 'Easy', questions: 95, icon: '🔷' },
    { company: 'Wipro', role: 'Developer', difficulty: 'Easy', questions: 88, icon: '🌐' },
  ];

  const certifications = [
    { name: 'Java Fundamentals', provider: 'EduVerse AI', progress: 85, icon: '☕', color: 'from-orange-500 to-red-500' },
    { name: 'DSA Mastery', provider: 'EduVerse AI', progress: 60, icon: '🌳', color: 'from-green-500 to-emerald-500' },
    { name: 'Python Developer', provider: 'EduVerse AI', progress: 40, icon: '🐍', color: 'from-blue-500 to-cyan-500' },
    { name: 'Database Expert', provider: 'EduVerse AI', progress: 20, icon: '🗄️', color: 'from-yellow-500 to-amber-500' },
    { name: 'Web Development', provider: 'EduVerse AI', progress: 10, icon: '🌐', color: 'from-pink-500 to-rose-500' },
  ];

  const aptitudeTopics = [
    { topic: 'Quantitative Aptitude', questions: 250, completed: 45, icon: '🔢' },
    { topic: 'Logical Reasoning', questions: 200, completed: 30, icon: '🧩' },
    { topic: 'Verbal Ability', questions: 180, completed: 20, icon: '📝' },
    { topic: 'Data Interpretation', questions: 120, completed: 10, icon: '📊' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-[rgba(245,158,11,0.2)] bg-gradient-to-br from-[#1a1005] via-[#2a1a0b] to-[#0f0b05]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-3xl font-extrabold text-white">🔥 Career Hub</h1>
        <p className="text-amber-200/70 text-sm mt-1">Prepare for placements, build your portfolio, earn certifications</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-fit flex-wrap" style={{ backgroundColor: 'var(--db-input-bg)', border: '1px solid var(--db-sidebar-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id ? 'shadow-md' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--db-card-bg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--db-text-accent)' : 'var(--db-text-muted)',
              border: activeTab === tab.id ? '1px solid var(--db-sidebar-border)' : '1px solid transparent'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* RESUME BUILDER */}
        {activeTab === 'resume' && (
          <motion.div key="resume" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--db-text-main)' }}>📄 AI Resume Builder</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--db-text-muted)' }}>Build a professional resume powered by AI insights from your learning progress.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Professional', 'Creative', 'Minimal'].map((template, i) => (
                  <div key={i} className="p-4 rounded-xl border text-center hover:shadow-lg transition-all cursor-pointer group" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="w-full h-32 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                      {['📋', '🎨', '✨'][i]}
                    </div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--db-text-main)' }}>{template} Template</h4>
                    <button className="mt-3 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* PLACEMENT PREP */}
        {activeTab === 'placement' && (
          <motion.div key="placement" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Technical Round Prep', desc: 'DSA, OOP, DBMS questions', count: '500+ Questions', icon: '💻', color: 'from-violet-500 to-purple-600' },
                { title: 'HR Round Prep', desc: 'Behavioral & situational questions', count: '200+ Questions', icon: '🎤', color: 'from-blue-500 to-cyan-600' },
                { title: 'Group Discussion', desc: 'Practice GD topics and tips', count: '50+ Topics', icon: '👥', color: 'from-emerald-500 to-green-600' },
                { title: 'Aptitude Tests', desc: 'Quantitative, logical & verbal', count: '1000+ Questions', icon: '🧮', color: 'from-amber-500 to-orange-600' },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group flex gap-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl text-white shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--db-text-main)' }}>{item.title}</h3>
                    <p className="text-xs mb-1" style={{ color: 'var(--db-text-muted)' }}>{item.desc}</p>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--db-text-accent)' }}>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* COMPANY QUESTIONS */}
        {activeTab === 'company' && (
          <motion.div key="company" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyQuestions.map((cq, i) => (
              <div key={i} className="p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{cq.icon}</div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    cq.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    cq.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{cq.difficulty}</span>
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--db-text-main)' }}>{cq.company}</h3>
                <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>{cq.role}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs font-bold" style={{ color: 'var(--db-text-accent)' }}>{cq.questions} Questions</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--db-text-muted)' }}>Start →</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* INTERVIEW PREP */}
        {activeTab === 'interview' && (
          <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--db-text-main)' }}>🎤 AI Mock Interview</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--db-text-muted)' }}>Practice with our AI interviewer that adapts to your skill level.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Technical Interview', 'Behavioral Interview', 'System Design'].map((type, i) => (
                  <div key={i} className="p-4 rounded-xl border text-center hover:shadow-lg transition-all" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="text-3xl mb-3">{['💻', '🎙️', '🏗️'][i]}</div>
                    <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--db-text-main)' }}>{type}</h4>
                    <p className="text-[11px] mb-3" style={{ color: 'var(--db-text-muted)' }}>{['Data structures, algorithms, OOP', 'Teamwork, leadership, situational', 'Architecture & scalability'][i]}</p>
                    <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer w-full">
                      Start Interview
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* APTITUDE */}
        {activeTab === 'aptitude' && (
          <motion.div key="aptitude" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aptitudeTopics.map((topic, i) => (
              <div key={i} className="p-5 rounded-2xl border hover:shadow-lg transition-all" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{topic.icon}</span>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--db-text-main)' }}>{topic.topic}</h3>
                    <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>{topic.completed}/{topic.questions} completed</p>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--db-sidebar-border)' }}>
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${(topic.completed / topic.questions) * 100}%` }} />
                </div>
                <button className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                  Continue Practice
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--db-text-main)' }}>💼 Portfolio Builder</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--db-text-muted)' }}>Create a stunning developer portfolio from your EduVerse learning data.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Topics Mastered', value: '24', icon: '📚' },
                  { label: 'Projects Built', value: '3', icon: '🚀' },
                  { label: 'Certifications', value: '2', icon: '🏆' },
                  { label: 'Coding Problems', value: '89', icon: '💻' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl border text-center" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--db-text-main)' }}>{stat.value}</div>
                    <div className="text-[10px] font-semibold" style={{ color: 'var(--db-text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg">
                Generate Portfolio →
              </button>
            </div>
          </motion.div>
        )}

        {/* CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <motion.div key="certifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, i) => (
              <div key={i} className="p-5 rounded-2xl border hover:shadow-lg transition-all flex flex-col gap-3" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center text-xl text-white shadow-md`}>
                    {cert.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--db-text-main)' }}>{cert.name}</h3>
                    <p className="text-[11px]" style={{ color: 'var(--db-text-muted)' }}>{cert.provider}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold" style={{ color: 'var(--db-text-muted)' }}>
                    <span>Progress</span>
                    <span>{cert.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-sidebar-border)' }}>
                    <div className={`h-full bg-gradient-to-r ${cert.color} rounded-full transition-all`} style={{ width: `${cert.progress}%` }} />
                  </div>
                </div>
                <button className={`w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${cert.progress >= 100 ? 'bg-emerald-600 text-white' : 'border'}`}
                  style={cert.progress < 100 ? { borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-secondary)', backgroundColor: 'var(--db-input-bg)' } : {}}
                >
                  {cert.progress >= 100 ? '🎉 Download Certificate' : 'Continue Learning'}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
