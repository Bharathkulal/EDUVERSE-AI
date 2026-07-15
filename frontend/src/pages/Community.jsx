import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { X, Trophy, Clock, Users, Zap, CheckCircle2, BookOpen, Code2, Palette, Server } from 'lucide-react';

const HASH_TO_TAB = {
  '#forum': 'forum',
  '#groups': 'groups',
  '#clubs': 'clubs',
  '#teams': 'teams',
  '#challenges': 'challenges',
  '#doubt': 'doubt',
};

const CHALLENGE_ICONS = {
  Coding: Code2,
  DBMS: BookOpen,
  Design: Palette,
  Architecture: Server,
};

const CHALLENGE_DETAILS = {
  1: {
    description: 'Solve 5 algorithmic problems using arrays, linked lists, and binary search within the time limit. Compete with 89+ participants across all skill levels.',
    tasks: ['Solve Two Sum problem', 'Implement Binary Search', 'Reverse a Linked List', 'Find Max Subarray Sum', 'Validate Balanced Parentheses'],
    prize: '200 XP + Algorithm Warrior Badge',
    level: 'Beginner–Intermediate',
  },
  2: {
    description: 'Design a normalized database schema for a real-world e-commerce system. Submit ER diagram + SQL DDL scripts that demonstrate 3NF compliance.',
    tasks: ['Design ER Diagram', 'Write DDL scripts (3NF)', 'Implement Indexing Strategy', 'Write 3 complex JOIN queries'],
    prize: '350 XP + DBMS Expert Badge',
    level: 'Intermediate–Advanced',
  },
  3: {
    description: 'Create a complete UI/UX design for a mobile learning app. Submit Figma prototypes with user flow, color palette, and component library.',
    tasks: ['User Research & Personas', 'Wireframes (Lo-Fi)', 'High-Fidelity Mockups', 'Interactive Prototype', 'Design System Documentation'],
    prize: '150 XP + Design Star Badge',
    level: 'All Levels',
  },
  4: {
    description: 'Design a scalable system architecture for a video streaming platform handling 1M concurrent users. Present your design with diagrams and trade-off analysis.',
    tasks: ['High-Level Architecture Diagram', 'Database Sharding Strategy', 'CDN & Caching Layer Design', 'Load Balancing Approach', 'Failure Mode Analysis'],
    prize: '400 XP + System Architect Badge',
    level: 'Advanced',
  },
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

  // Challenge state
  const [joinedChallenges, setJoinedChallenges] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eduverse_joined_challenges') || '{}'); } catch { return {}; }
  });
  const [challenges, setChallenges] = useState([
    { id: 1, title: 'Weekly Algorithm Sprint', difficulty: 'Medium', participants: 89, deadline: '3 days left', xp: 200, type: 'Coding' },
    { id: 2, title: 'Database Design Challenge', difficulty: 'Hard', participants: 45, deadline: '5 days left', xp: 350, type: 'DBMS' },
    { id: 3, title: 'UI/UX Design Contest', difficulty: 'Easy', participants: 123, deadline: '7 days left', xp: 150, type: 'Design' },
    { id: 4, title: 'System Design Sprint', difficulty: 'Hard', participants: 34, deadline: '2 days left', xp: 400, type: 'Architecture' },
  ]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

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

  const handleJoinChallenge = (ch, e) => {
    e.stopPropagation();
    const alreadyJoined = joinedChallenges[ch.id];
    const updated = { ...joinedChallenges };

    if (alreadyJoined) {
      delete updated[ch.id];
      setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, participants: c.participants - 1 } : c));
      toast('Left the challenge', { icon: '👋' });
    } else {
      updated[ch.id] = true;
      setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, participants: c.participants + 1 } : c));
      toast.success(`🎯 Joined "${ch.title}"! +${ch.xp} XP on completion`, { duration: 3500 });
    }

    setJoinedChallenges(updated);
    localStorage.setItem('eduverse_joined_challenges', JSON.stringify(updated));
  };

  const difficultyStyle = (d) => {
    if (d === 'Easy') return 'bg-emerald-500/10 text-emerald-400';
    if (d === 'Medium') return 'bg-amber-500/10 text-amber-400';
    return 'bg-red-500/10 text-red-400';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-[rgba(139,92,246,0.2)] bg-gradient-to-br from-[#120e2a] via-[#1a143b] to-[#0f0b24]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-3xl font-extrabold text-white">🌐 Community Hub</h1>
        <p className="text-indigo-200/70 text-sm mt-1">Connect, collaborate, and grow with fellow learners</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-full max-w-full overflow-x-auto scrollbar-none" style={{ backgroundColor: 'var(--db-input-bg)', border: '1px solid var(--db-sidebar-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
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
          <motion.div key="challenges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {/* Joined Banner */}
            {Object.keys(joinedChallenges).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs font-semibold text-emerald-400">
                  You are participating in <strong>{Object.keys(joinedChallenges).length}</strong> challenge{Object.keys(joinedChallenges).length > 1 ? 's' : ''}. Complete them to earn XP!
                </p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map(ch => {
                const joined = !!joinedChallenges[ch.id];
                const Icon = CHALLENGE_ICONS[ch.type] || Zap;
                return (
                  <motion.div
                    key={ch.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedChallenge(ch)}
                    className="p-5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 relative overflow-hidden"
                    style={{
                      backgroundColor: 'var(--db-card-bg)',
                      borderColor: joined ? 'rgba(139,92,246,0.5)' : 'var(--db-sidebar-border)',
                      boxShadow: joined ? '0 0 0 1px rgba(139,92,246,0.3)' : 'none',
                    }}
                  >
                    {joined && <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />}

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}>
                          <Icon className="w-4 h-4 text-violet-400" />
                        </div>
                        <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--db-text-main)' }}>{ch.title}</h3>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ml-2 ${difficultyStyle(ch.difficulty)}`}>
                        {ch.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--db-text-muted)' }}>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ch.participants} participants</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ch.deadline}</span>
                      <span className="flex items-center gap-1 font-bold" style={{ color: 'var(--db-text-accent)' }}>
                        <Zap className="w-3 h-3" />+{ch.xp} XP
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md w-fit" style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)' }}>{ch.type}</span>

                    <button
                      onClick={(e) => handleJoinChallenge(ch, e)}
                      className={`w-full py-2.5 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                        joined
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-red-600 hover:to-rose-600'
                          : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
                      }`}
                    >
                      {joined ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Joined — Click to Leave</>
                      ) : (
                        <><Trophy className="w-3.5 h-3.5" /> Join Challenge</>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
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

      {/* ── Challenge Detail Modal ── */}
      <AnimatePresence>
        {selectedChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedChallenge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border overflow-hidden"
              style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
            >
              {/* Modal Header */}
              <div className="relative p-6 pb-4 bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border-b" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${difficultyStyle(selectedChallenge.difficulty)}`}>
                      {selectedChallenge.difficulty}
                    </span>
                    <h2 className="text-xl font-black mt-1" style={{ color: 'var(--db-text-main)' }}>{selectedChallenge.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition cursor-pointer shrink-0"
                    style={{ color: 'var(--db-text-muted)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--db-text-muted)' }}>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {selectedChallenge.participants} participants</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {selectedChallenge.deadline}</span>
                  <span className="flex items-center gap-1.5 font-bold text-violet-400"><Zap className="w-3.5 h-3.5" /> +{selectedChallenge.xp} XP</span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--db-text-muted)' }}>About this Challenge</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--db-text-main)' }}>
                    {CHALLENGE_DETAILS[selectedChallenge.id]?.description}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--db-text-muted)' }}>Tasks to Complete</p>
                  <ul className="space-y-2">
                    {CHALLENGE_DETAILS[selectedChallenge.id]?.tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--db-text-main)' }}>
                        <span className="w-5 h-5 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--db-input-bg)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--db-text-muted)' }}>🏆 Prize</p>
                    <p className="text-xs font-bold text-amber-400">{CHALLENGE_DETAILS[selectedChallenge.id]?.prize}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--db-input-bg)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--db-text-muted)' }}>🎯 Level</p>
                    <p className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>{CHALLENGE_DETAILS[selectedChallenge.id]?.level}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => { handleJoinChallenge(selectedChallenge, e); setSelectedChallenge(null); }}
                  className={`w-full py-3 text-white text-sm font-black rounded-2xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                    joinedChallenges[selectedChallenge.id]
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
                  }`}
                >
                  {joinedChallenges[selectedChallenge.id] ? (
                    <><X className="w-4 h-4" /> Leave Challenge</>
                  ) : (
                    <><Trophy className="w-4 h-4" /> Join Challenge — Earn +{selectedChallenge.xp} XP</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
