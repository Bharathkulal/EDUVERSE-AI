import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const HASH_TO_TAB = {
  '#forum': 'forum',
  '#groups': 'groups',
  '#clubs': 'clubs',
  '#teams': 'teams',
  '#challenges': 'challenges',
  '#doubt': 'doubt',
};

export default function Community() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('forum');
  const [posts, setPosts] = useState([
    { id: 1, author: 'Rahul K.', avatar: 'R', title: 'How to implement Binary Search Tree in Java?', category: 'DSA', replies: 12, likes: 24, time: '2 hours ago', tags: ['Java', 'DSA', 'Trees'] },
    { id: 2, author: 'Priya S.', avatar: 'P', title: 'Best resources for learning C# design patterns', category: 'C#', replies: 8, likes: 15, time: '5 hours ago', tags: ['C#', 'Design Patterns'] },
    { id: 3, author: 'Amit V.', avatar: 'A', title: 'Struggling with SQL JOIN queries - need help!', category: 'DBMS', replies: 20, likes: 31, time: '1 day ago', tags: ['SQL', 'DBMS', 'Joins'] },
    { id: 4, author: 'Sneha M.', avatar: 'S', title: 'Python vs Java for competitive programming?', category: 'General', replies: 45, likes: 67, time: '2 days ago', tags: ['Python', 'Java', 'CP'] },
  ]);
  const [newPost, setNewPost] = useState('');
  const [doubtQuestion, setDoubtQuestion] = useState('');

  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_TAB[hash]) {
      setActiveTab(HASH_TO_TAB[hash]);
    }
  }, [location.hash]);

  const tabs = [
    { id: 'forum', label: 'Discussion Forum', icon: '💬' },
    { id: 'groups', label: 'Study Groups', icon: '👥' },
    { id: 'clubs', label: 'Coding Clubs', icon: '🏫' },
    { id: 'teams', label: 'Project Teams', icon: '🚀' },
    { id: 'challenges', label: 'Challenges', icon: '⚡' },
    { id: 'doubt', label: 'Doubt Solving', icon: '❓' },
  ];

  const studyGroups = [
    { id: 1, name: 'DSA Mastery Group', members: 45, active: true, subject: 'DSA', icon: '🌳', nextSession: 'Today 4 PM' },
    { id: 2, name: 'Java Advanced Learners', members: 32, active: true, subject: 'Java', icon: '☕', nextSession: 'Tomorrow 10 AM' },
    { id: 3, name: 'DBMS Study Circle', members: 28, active: false, subject: 'DBMS', icon: '🗄️', nextSession: 'Friday 2 PM' },
    { id: 4, name: 'Python Enthusiasts', members: 56, active: true, subject: 'Python', icon: '🐍', nextSession: 'Today 6 PM' },
    { id: 5, name: 'Web Dev Bootcamp', members: 39, active: false, subject: 'Web Dev', icon: '🌐', nextSession: 'Saturday 11 AM' },
  ];

  const codingClubs = [
    { id: 1, name: 'Algorithm Warriors', members: 120, rating: '⭐⭐⭐⭐⭐', focus: 'Competitive Programming', meetDay: 'Every Saturday' },
    { id: 2, name: 'Open Source Contributors', members: 85, rating: '⭐⭐⭐⭐', focus: 'Open Source Projects', meetDay: 'Every Sunday' },
    { id: 3, name: 'Hackathon Squad', members: 67, rating: '⭐⭐⭐⭐', focus: 'Hackathons & Innovations', meetDay: 'Bi-weekly' },
    { id: 4, name: 'Full Stack Devs', members: 94, rating: '⭐⭐⭐⭐⭐', focus: 'Full Stack Development', meetDay: 'Every Friday' },
  ];

  const projectTeams = [
    { id: 1, name: 'E-Commerce Platform', tech: 'React + Node.js', members: 4, maxMembers: 5, status: 'Active', lead: 'Vikram S.' },
    { id: 2, name: 'AI Chatbot System', tech: 'Python + TensorFlow', members: 3, maxMembers: 4, status: 'Recruiting', lead: 'Ananya R.' },
    { id: 3, name: 'Mobile Fitness App', tech: 'Flutter + Firebase', members: 5, maxMembers: 5, status: 'Completed', lead: 'Rohan D.' },
    { id: 4, name: 'Student Portal', tech: 'Next.js + PostgreSQL', members: 2, maxMembers: 6, status: 'Recruiting', lead: 'Kavya P.' },
  ];

  const communityChalleng = [
    { id: 1, title: 'Weekly Algorithm Sprint', difficulty: 'Medium', participants: 89, deadline: '3 days left', xp: 200, type: 'Coding' },
    { id: 2, title: 'Database Design Challenge', difficulty: 'Hard', participants: 45, deadline: '5 days left', xp: 350, type: 'DBMS' },
    { id: 3, title: 'UI/UX Design Contest', difficulty: 'Easy', participants: 123, deadline: '7 days left', xp: 150, type: 'Design' },
    { id: 4, title: 'System Design Sprint', difficulty: 'Hard', participants: 34, deadline: '2 days left', xp: 400, type: 'Architecture' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-[rgba(139,92,246,0.2)] bg-gradient-to-br from-[#120e2a] via-[#1a143b] to-[#0f0b24]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-3xl font-extrabold text-white">🌐 Community Hub</h1>
        <p className="text-indigo-200/70 text-sm mt-1">Connect, collaborate, and grow with fellow learners</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-fit flex-wrap" style={{ backgroundColor: 'var(--db-input-bg)', border: '1px solid var(--db-sidebar-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
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
        {/* DISCUSSION FORUM */}
        {activeTab === 'forum' && (
          <motion.div key="forum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {/* New Post */}
            <div className="p-4 rounded-2xl border flex gap-3" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="Start a discussion..."
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                />
                <button
                  onClick={() => { if (newPost.trim()) { setPosts(prev => [{ id: Date.now(), author: user?.name || 'You', avatar: user?.name?.charAt(0) || 'U', title: newPost, category: 'General', replies: 0, likes: 0, time: 'Just now', tags: [] }, ...prev]); setNewPost(''); } }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.map(post => (
              <div key={post.id} className="p-5 rounded-2xl border hover:shadow-lg transition-all" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{post.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold" style={{ color: 'var(--db-text-main)' }}>{post.author}</span>
                      <span className="text-[11px]" style={{ color: 'var(--db-text-muted)' }}>• {post.time}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)' }}>{post.category}</span>
                    </div>
                    <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--db-text-main)' }}>{post.title}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-xs flex items-center gap-1 cursor-pointer hover:text-violet-400 transition" style={{ color: 'var(--db-text-muted)' }}>💬 {post.replies} replies</span>
                      <span className="text-xs flex items-center gap-1 cursor-pointer hover:text-red-400 transition" style={{ color: 'var(--db-text-muted)' }}>❤️ {post.likes} likes</span>
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--db-text-accent)' }}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* STUDY GROUPS */}
        {activeTab === 'groups' && (
          <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyGroups.map(group => (
              <div key={group.id} className="p-5 rounded-2xl border hover:shadow-lg transition-all flex flex-col gap-3" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{group.icon}</div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${group.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {group.active ? '🟢 Active' : '🔴 Offline'}
                  </span>
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--db-text-main)' }}>{group.name}</h3>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--db-text-muted)' }}>
                  <span>👥 {group.members} members</span>
                  <span>📅 {group.nextSession}</span>
                </div>
                <button className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer mt-auto">
                  Join Group
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* CODING CLUBS */}
        {activeTab === 'clubs' && (
          <motion.div key="clubs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {codingClubs.map(club => (
              <div key={club.id} className="p-5 rounded-2xl border hover:shadow-lg transition-all flex flex-col gap-3" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>{club.name}</h3>
                  <span className="text-xs">{club.rating}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--db-text-muted)' }}>{club.focus}</p>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--db-text-muted)' }}>
                  <span>👥 {club.members} members</span>
                  <span>📅 {club.meetDay}</span>
                </div>
                <button className="w-full py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-violet-600 hover:text-white hover:border-violet-600" style={{ borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-secondary)' }}>
                  Join Club
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* PROJECT TEAMS */}
        {activeTab === 'teams' && (
          <motion.div key="teams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectTeams.map(team => (
              <div key={team.id} className="p-5 rounded-2xl border hover:shadow-lg transition-all flex flex-col gap-3" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold" style={{ color: 'var(--db-text-main)' }}>{team.name}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    team.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                    team.status === 'Recruiting' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>{team.status}</span>
                </div>
                <div className="text-xs font-mono px-2 py-1 rounded-md w-fit" style={{ backgroundColor: 'var(--db-input-bg)', color: 'var(--db-text-accent)' }}>{team.tech}</div>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--db-text-muted)' }}>
                  <span>👤 Lead: {team.lead}</span>
                  <span>👥 {team.members}/{team.maxMembers} members</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-sidebar-border)' }}>
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(team.members / team.maxMembers) * 100}%` }} />
                </div>
                {team.status === 'Recruiting' && (
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                    Request to Join
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* CHALLENGES */}
        {activeTab === 'challenges' && (
          <motion.div key="challenges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityChalleng.map(ch => (
              <div key={ch.id} className="p-5 rounded-2xl border hover:shadow-lg transition-all flex flex-col gap-3" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold" style={{ color: 'var(--db-text-main)' }}>{ch.title}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    ch.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    ch.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{ch.difficulty}</span>
                </div>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--db-text-muted)' }}>
                  <span>👥 {ch.participants} participants</span>
                  <span>⏰ {ch.deadline}</span>
                  <span className="font-bold" style={{ color: 'var(--db-text-accent)' }}>+{ch.xp} XP</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md w-fit" style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)' }}>{ch.type}</span>
                <button className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md">
                  Join Challenge
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* DOUBT SOLVING */}
        {activeTab === 'doubt' && (
          <motion.div key="doubt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--db-text-main)' }}>❓ Ask Your Doubt</h2>
              <div className="space-y-3">
                <textarea
                  value={doubtQuestion}
                  onChange={e => setDoubtQuestion(e.target.value)}
                  placeholder="Describe your doubt in detail... (e.g., How does recursion work in tree traversal?)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded-md cursor-pointer" style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)' }}>📷 Add Image</span>
                    <span className="text-xs px-2 py-1 rounded-md cursor-pointer" style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)' }}>📎 Attach Code</span>
                  </div>
                  <button className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer">
                    Submit Doubt
                  </button>
                </div>
              </div>
            </div>

            {/* Previous doubts */}
            <div className="space-y-3">
              {[
                { q: 'What is the difference between HashMap and TreeMap?', subject: 'Java', answers: 5, solved: true },
                { q: 'How to normalize a database to 3NF?', subject: 'DBMS', answers: 3, solved: true },
                { q: 'Explain time complexity of merge sort', subject: 'DSA', answers: 8, solved: false },
              ].map((doubt, i) => (
                <div key={i} className="p-4 rounded-2xl border flex justify-between items-center" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold" style={{ color: 'var(--db-text-main)' }}>{doubt.q}</h4>
                    <div className="flex gap-2 text-xs" style={{ color: 'var(--db-text-muted)' }}>
                      <span>{doubt.subject}</span>
                      <span>• {doubt.answers} answers</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${doubt.solved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {doubt.solved ? '✅ Solved' : '⏳ Open'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
