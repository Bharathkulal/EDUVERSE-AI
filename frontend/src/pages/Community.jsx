import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  Users, MessageSquare, Trophy, Zap, Target, BookOpen,
  Plus, Search, Send, X, Clock, Star, ChevronRight,
  Play, Trash, Code2, Palette, Server, CheckCircle2,
  AlertCircle, TrendingUp, Hash, Bell, ArrowRight, Edit3,
  GitBranch, Terminal, Cpu, Globe, UserPlus, Sparkles
} from 'lucide-react';
import './DashboardTheme.css';

/* ─────────────────────────────────────────────────────────────────────────
   HASH → TAB MAP
───────────────────────────────────────────────────────────────────────── */
const HASH_TO_TAB = {
  '#forum': 'forum',
  '#groups': 'groups',
  '#clubs': 'clubs',
  '#challenges': 'challenges',
  '#doubt': 'doubt',
};

const TABS = [
  { id: 'forum',      label: 'Discussion',  icon: MessageSquare,  color: 'purple' },
  { id: 'groups',     label: 'Study Groups',icon: Users,          color: 'blue'   },
  { id: 'clubs',      label: 'Dev Clubs',   icon: Code2,          color: 'cyan'   },
  { id: 'challenges', label: 'Challenges',  icon: Trophy,         color: 'amber'  },
  { id: 'doubt',      label: 'Doubts',      icon: AlertCircle,    color: 'rose'   },
];

const CHALLENGE_DETAILS = {
  1: {
    description: 'Solve 5 algorithmic problems using arrays, linked lists, and binary search within the time limit.',
    tasks: ['Solve Two Sum problem', 'Implement Binary Search', 'Reverse a Linked List', 'Find Max Subarray Sum', 'Validate Balanced Parentheses'],
    prize: '200 XP + Algorithm Warrior Badge',
    level: 'Beginner–Intermediate',
  },
  2: {
    description: 'Design a normalized database schema for a real-world e-commerce system. Submit ER diagram + SQL DDL scripts.',
    tasks: ['Design ER Diagram', 'Write DDL scripts (3NF)', 'Implement Indexing Strategy', 'Write 3 complex JOIN queries'],
    prize: '350 XP + DBMS Expert Badge',
    level: 'Intermediate–Advanced',
  },
  3: {
    description: 'Create a complete UI/UX design for a mobile learning app. Submit Figma prototypes with user flow and component library.',
    tasks: ['User Research & Personas', 'Wireframes (Lo-Fi)', 'High-Fidelity Mockups', 'Interactive Prototype', 'Design System Documentation'],
    prize: '150 XP + Design Star Badge',
    level: 'All Levels',
  },
  4: {
    description: 'Design a scalable system architecture for a video streaming platform handling 1M concurrent users.',
    tasks: ['High-Level Architecture Diagram', 'Database Sharding Strategy', 'CDN & Caching Layer Design', 'Load Balancing Approach', 'Failure Mode Analysis'],
    prize: '400 XP + System Architect Badge',
    level: 'Advanced',
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    blue:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    cyan:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    amber:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose:   'text-rose-400 bg-rose-500/10 border-rose-500/20',
    emerald:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
  return (
    <div className="rounded-2xl border bg-white/3 border-white/8 p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-black text-white leading-none">{value}</p>
        <p className="text-[10px] text-white/35 uppercase tracking-widest mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function Community() {
  const { user } = useAuth();
  const { isDarkMode: isDark } = useTheme();
  const location = useLocation();

  // Tab state
  const [activeTab, setActiveTab] = useState('forum');

  // Forum state
  const [posts, setPosts] = useState([
    { id: 1, author: 'Rahul K.',  avatar: 'R', title: 'How to implement Binary Search Tree in Java?',     category: 'DSA',     replies: 12, likes: 24, time: '2h ago',   tags: ['Java','DSA','Trees'] },
    { id: 2, author: 'Priya S.',  avatar: 'P', title: 'Best resources for learning C# design patterns',   category: 'C#',      replies: 8,  likes: 15, time: '5h ago',   tags: ['C#','Design Patterns'] },
    { id: 3, author: 'Amit V.',   avatar: 'A', title: 'Struggling with SQL JOIN queries — need help!',     category: 'DBMS',    replies: 20, likes: 31, time: '1d ago',   tags: ['SQL','DBMS','Joins'] },
    { id: 4, author: 'Sneha M.',  avatar: 'S', title: 'Python vs Java for competitive programming?',       category: 'General', replies: 45, likes: 67, time: '2d ago',   tags: ['Python','Java','CP'] },
    { id: 5, author: 'Kavya P.',  avatar: 'K', title: 'Best approach to dynamic programming problems?',    category: 'DSA',     replies: 33, likes: 52, time: '3d ago',   tags: ['DP','Algorithms'] },
  ]);
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Doubt state
  const [doubts, setDoubts] = useState([
    { id: 1, q: 'What is the difference between HashMap and TreeMap?', subject: 'Java',  answers: 2, solved: true,  answersList: [
      { author: 'AI Tutor', avatar: '🤖', text: 'HashMap is based on a hash table (O(1) avg). TreeMap is Red-Black tree based (O(log n)), keeps keys sorted.', time: '2h ago' },
      { author: 'Rohan D.', avatar: 'R',  text: 'Use HashMap unless you explicitly need key ordering!', time: '1h ago' }
    ]},
    { id: 2, q: 'How to normalize a database to 3NF?',                 subject: 'DBMS',  answers: 1, solved: true,  answersList: [
      { author: 'AI Tutor', avatar: '🤖', text: 'A table is in 3NF if in 2NF with no transitive dependencies. Every non-key column must depend only on the primary key.', time: '3h ago' }
    ]},
    { id: 3, q: 'Explain time complexity of merge sort',                subject: 'DSA',   answers: 1, solved: false, answersList: [
      { author: 'AI Tutor', avatar: '🤖', text: 'Merge Sort recursively splits (log N) and merges (O(N) per step). Total: O(N log N) in all cases.', time: '4h ago' }
    ]},
  ]);
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [newReplyText, setNewReplyText] = useState('');

  // Challenge state
  const [challenges, setChallenges] = useState([
    { id: 1, title: 'Weekly Algorithm Sprint',  difficulty: 'Medium', participants: 89,  deadline: '3 days left', xp: 200, type: 'Coding' },
    { id: 2, title: 'Database Design Challenge', difficulty: 'Hard',   participants: 45,  deadline: '5 days left', xp: 350, type: 'DBMS' },
    { id: 3, title: 'UI/UX Design Contest',      difficulty: 'Easy',   participants: 123, deadline: '7 days left', xp: 150, type: 'Design' },
    { id: 4, title: 'System Design Sprint',      difficulty: 'Hard',   participants: 34,  deadline: '2 days left', xp: 400, type: 'Architecture' },
  ]);
  const [joinedChallenges, setJoinedChallenges] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ev_joined_challenges') || '{}'); } catch { return {}; }
  });
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // Study Groups state
  const [groups, setGroups] = useState([
    { id: 1, name: 'DSA Mastery & LeetCode Sprint', subject: 'Data Structures', members: 5, max: 6, online: 3, aiMentor: 'Coding AI', meeting: 'Today 5:00 PM', coverColor: 'from-purple-600 to-indigo-800' },
    { id: 2, name: 'DBMS Relational DB Builders',   subject: 'Database Systems', members: 4, max: 8, online: 2, aiMentor: 'DBMS AI',   meeting: 'Tomorrow 2 PM', coverColor: 'from-blue-600 to-cyan-800' },
    { id: 3, name: 'Python Enthusiasts',             subject: 'Python',           members: 9, max:12, online: 5, aiMentor: 'Python AI', meeting: 'Today 6 PM',    coverColor: 'from-emerald-600 to-teal-800' },
  ]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('Data Structures');

  // Clubs state
  const codingClubs = [
    { id: 1, name: 'Algorithm Warriors',      members: 120, focus: 'Competitive Programming', meetDay: 'Every Saturday', rating: 5 },
    { id: 2, name: 'Open Source Contributors',members: 85,  focus: 'Open Source Projects',     meetDay: 'Every Sunday',   rating: 4 },
    { id: 3, name: 'Hackathon Squad',         members: 67,  focus: 'Hackathons & Innovations', meetDay: 'Bi-weekly',      rating: 4 },
    { id: 4, name: 'Full Stack Devs',         members: 94,  focus: 'Full Stack Development',   meetDay: 'Every Friday',   rating: 5 },
  ];

  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_TAB[hash]) setActiveTab(HASH_TO_TAB[hash]);
  }, [location.hash]);

  const handleJoinChallenge = (ch) => {
    const already = joinedChallenges[ch.id];
    const updated = { ...joinedChallenges };
    if (already) {
      delete updated[ch.id];
      setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, participants: c.participants - 1 } : c));
      toast('Left the challenge', { icon: '👋' });
    } else {
      updated[ch.id] = true;
      setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, participants: c.participants + 1 } : c));
      toast.success(`🎯 Joined "${ch.title}"! +${ch.xp} XP on completion`, { duration: 3500 });
    }
    setJoinedChallenges(updated);
    localStorage.setItem('ev_joined_challenges', JSON.stringify(updated));
  };

  const diffBadge = (d) => {
    if (d === 'Easy')   return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (d === 'Medium') return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeTabMeta = TABS.find(t => t.id === activeTab);

  return (
    <div className={'min-h-screen transition-colors duration-300 ' + (isDark ? 'bg-[#070313] text-slate-100' : 'bg-slate-50 text-slate-900')}>

      {/* AMBIENT BACKGROUND GLOWS */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-purple-600/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-blue-600/6 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[100px]" />
        </div>
      )}

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <Globe size={22} className="text-white" />
            </div>
            <div>
              <h1 className={'text-2xl font-black tracking-tight leading-tight ' + (isDark ? 'bg-gradient-to-r from-purple-300 via-indigo-300 to-cyan-300 bg-clip-text text-transparent' : 'text-slate-900')}>
                Community Hub
              </h1>
              <p className="text-xs text-white/40 mt-0.5">Connect · Collaborate · Grow — Powered by AI</p>
            </div>
          </div>

          {/* Live count badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">247 online now</span>
          </div>
        </div>

        {/* ── STAT STRIP ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={MessageSquare} label="Discussions" value="1.2K" color="purple" />
          <StatCard icon={Users}         label="Study Groups" value="38"   color="blue"   />
          <StatCard icon={Trophy}        label="Challenges"   value="12"   color="amber"  />
          <StatCard icon={CheckCircle2}  label="Doubts Solved"value="847"  color="emerald"/>
        </div>

        {/* ── TAB NAVIGATION ─────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white/4 border border-white/8 w-full overflow-x-auto scrollbar-none mb-6">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/6'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── MAIN CONTENT GRID ──────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

          {/* ── LEFT COLUMN ───────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >

              {/* ══ FORUM TAB ══════════════════════════════════ */}
              {activeTab === 'forum' && (
                <>
                  {/* Post composer */}
                  <div className={'rounded-3xl border p-5 ' + (isDark ? 'bg-white/4 border-white/10 backdrop-blur-sm' : 'bg-white border-slate-200 shadow')}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Start a Discussion</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newPost}
                          onChange={e => setNewPost(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newPost.trim()) {
                              setPosts(prev => [{ id: Date.now(), author: user?.name || 'You', avatar: user?.name?.charAt(0) || 'U', title: newPost, category: 'General', replies: 0, likes: 0, time: 'Just now', tags: [] }, ...prev]);
                              setNewPost('');
                              toast.success('Discussion posted!');
                            }
                          }}
                          placeholder="Share something with the community..."
                          className={'flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all ' + (isDark ? 'bg-[#0d0920] border border-purple-500/20 text-purple-100 placeholder:text-white/20 focus:border-purple-400/50' : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-300')}
                        />
                        <button
                          onClick={() => {
                            if (!newPost.trim()) return;
                            setPosts(prev => [{ id: Date.now(), author: user?.name || 'You', avatar: user?.name?.charAt(0) || 'U', title: newPost, category: 'General', replies: 0, likes: 0, time: 'Just now', tags: [] }, ...prev]);
                            setNewPost('');
                            toast.success('Discussion posted!');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-700/30 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send size={13} /> Post
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search discussions, tags, topics..."
                      className={'w-full pl-10 pr-4 py-3 rounded-2xl text-sm focus:outline-none transition-all ' + (isDark ? 'bg-white/4 border border-white/8 text-white placeholder:text-white/25 focus:border-purple-500/40' : 'bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-300')}
                    />
                  </div>

                  {/* Posts */}
                  <div className="space-y-3">
                    {filteredPosts.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={'rounded-2xl border p-5 hover:border-purple-500/30 transition-all cursor-pointer group ' + (isDark ? 'bg-white/3 border-white/8 hover:bg-white/5' : 'bg-white border-slate-200 hover:shadow-md')}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                            {post.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className="text-sm font-bold text-white/80">{post.author}</span>
                              <span className="text-[10px] text-white/30">• {post.time}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">{post.category}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-white/85 mb-2 group-hover:text-white transition">{post.title}</h3>
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-xs text-white/35 flex items-center gap-1 hover:text-purple-400 transition cursor-pointer">
                                <MessageSquare size={11} /> {post.replies} replies
                              </span>
                              <span className="text-xs text-white/35 flex items-center gap-1 hover:text-rose-400 transition cursor-pointer">
                                ❤️ {post.likes}
                              </span>
                              {post.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-white/35 flex items-center gap-0.5">
                                  <Hash size={8} />{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight size={15} className="text-white/20 group-hover:text-purple-400 transition flex-shrink-0 mt-1" />
                        </div>
                      </motion.div>
                    ))}
                    {filteredPosts.length === 0 && (
                      <div className="text-center py-12 text-white/30">
                        <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No discussions match your search.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ══ STUDY GROUPS TAB ═══════════════════════════ */}
              {activeTab === 'groups' && (
                <>
                  <div className={'rounded-3xl border p-5 ' + (isDark ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200 shadow')}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Smart Study Groups</span>
                      </div>
                      <button
                        onClick={() => setShowCreateGroup(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/20 cursor-pointer"
                      >
                        <Plus size={12} /> Create Group
                      </button>
                    </div>
                    <p className="text-xs text-white/35">Invite classmates, assign AI mentors, synchronize whiteboards, and solve assignments together.</p>
                  </div>

                  {/* Create Group Form */}
                  <AnimatePresence>
                    {showCreateGroup && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className={'rounded-2xl border p-5 space-y-3 ' + (isDark ? 'bg-white/4 border-blue-500/20' : 'bg-white border-blue-200 shadow')}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-white/70">New Study Group</span>
                          <button onClick={() => setShowCreateGroup(false)} className="text-white/30 hover:text-white"><X size={14} /></button>
                        </div>
                        <input
                          value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                          placeholder="Group name..."
                          className={'w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none ' + (isDark ? 'bg-[#0d0920] border border-blue-500/20 text-blue-100 placeholder:text-white/20' : 'bg-slate-50 border border-slate-200 text-slate-800')}
                        />
                        <select
                          value={newGroupSubject} onChange={e => setNewGroupSubject(e.target.value)}
                          className={'w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none ' + (isDark ? 'bg-[#0d0920] border border-blue-500/20 text-blue-100' : 'bg-slate-50 border border-slate-200 text-slate-800')}
                        >
                          {['Data Structures', 'Database Systems', 'Python', 'Java', 'Web Development', 'Machine Learning'].map(s => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (!newGroupName.trim()) { toast.error('Enter a group name'); return; }
                            setGroups(prev => [{ id: Date.now(), name: newGroupName, subject: newGroupSubject, members: 1, max: 6, online: 1, aiMentor: 'Coding AI', meeting: 'Setup required', coverColor: 'from-purple-600 to-pink-800' }, ...prev]);
                            setNewGroupName(''); setShowCreateGroup(false);
                            toast.success(`Group "${newGroupName}" created!`);
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl transition hover:shadow-lg cursor-pointer"
                        >
                          Create Group
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Group Cards */}
                  <div className="space-y-4">
                    {groups.map((g, i) => (
                      <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className={'rounded-3xl border overflow-hidden ' + (isDark ? 'border-white/8 bg-white/3' : 'border-slate-200 bg-white shadow')}>
                        {/* Cover */}
                        <div className={`h-20 bg-gradient-to-br ${g.coverColor} p-4 flex justify-between items-start relative`}>
                          <div className="absolute inset-0 bg-black/15" />
                          <span className="relative z-10 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-lg bg-black/30 text-white border border-white/10">{g.subject}</span>
                          <span className="relative z-10 flex items-center gap-1 text-[10px] text-emerald-300 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{g.online} online
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-white/85 text-sm mb-3">{g.name}</h3>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                            <div className="flex justify-between text-white/40">
                              <span>AI Mentor</span><span className="text-purple-400 font-bold">{g.aiMentor}</span>
                            </div>
                            <div className="flex justify-between text-white/40">
                              <span>Members</span><span className="text-white font-bold">{g.members}/{g.max}</span>
                            </div>
                            <div className="flex justify-between text-white/40 col-span-2">
                              <span>Next Meeting</span><span className="text-cyan-400 font-bold">{g.meeting}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5">
                              <Play size={11} /> Enter Room
                            </button>
                            <button
                              onClick={() => { if (window.confirm('Delete this group?')) setGroups(prev => prev.filter(pg => pg.id !== g.id)); }}
                              className="p-2 border border-white/8 hover:border-rose-500/30 hover:bg-rose-500/10 text-white/30 hover:text-rose-400 rounded-xl transition cursor-pointer"
                            >
                              <Trash size={13} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* ══ CODING CLUBS TAB ════════════════════════════ */}
              {activeTab === 'clubs' && (
                <>
                  <div className={'rounded-3xl border p-5 ' + (isDark ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200 shadow')}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Developer Clubs</span>
                    </div>
                    <p className="text-xs text-white/35">Join coding clubs, collaborate on open source, and participate in hackathons.</p>
                  </div>

                  <div className="space-y-4">
                    {codingClubs.map((club, i) => (
                      <motion.div key={club.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className={'rounded-2xl border p-5 hover:border-cyan-500/30 transition-all group cursor-pointer ' + (isDark ? 'bg-white/3 border-white/8 hover:bg-white/5' : 'bg-white border-slate-200 hover:shadow-md')}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <Terminal size={14} className="text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-white/85 group-hover:text-white transition">{club.name}</h3>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, j) => (
                                    <Star key={j} size={9} className={j < club.rating ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-white/40 mb-2">{club.focus}</p>
                            <div className="flex items-center gap-3 text-[10px] text-white/30">
                              <span className="flex items-center gap-1"><Users size={9} />{club.members} members</span>
                              <span className="flex items-center gap-1"><Clock size={9} />{club.meetDay}</span>
                            </div>
                          </div>
                          <button className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs font-bold transition cursor-pointer flex-shrink-0">
                            <UserPlus size={11} /> Join
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* ══ CHALLENGES TAB ══════════════════════════════ */}
              {activeTab === 'challenges' && (
                <>
                  <div className={'rounded-3xl border p-5 ' + (isDark ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200 shadow')}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Active Challenges</span>
                    </div>
                    <p className="text-xs text-white/35">Compete with peers, earn XP, and collect achievement badges by solving real-world problems.</p>
                  </div>

                  <div className="space-y-4">
                    {challenges.map((ch, i) => {
                      const isJoined = joinedChallenges[ch.id];
                      const ChalIcon = { Coding: Code2, DBMS: BookOpen, Design: Palette, Architecture: Server }[ch.type] || Trophy;
                      return (
                        <motion.div key={ch.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                          onClick={() => setSelectedChallenge(ch)}
                          className={'rounded-2xl border p-5 hover:border-amber-500/30 transition-all cursor-pointer group ' + (isDark ? 'bg-white/3 border-white/8 hover:bg-white/5' : 'bg-white border-slate-200 hover:shadow-md')}>
                          <div className="flex items-start gap-4">
                            <div className={'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ' + (isJoined ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/6 border border-white/10')}>
                              <ChalIcon size={18} className={isJoined ? 'text-amber-400' : 'text-white/40'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <h3 className="text-sm font-bold text-white/85 group-hover:text-white transition">{ch.title}</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${diffBadge(ch.difficulty)}`}>{ch.difficulty}</span>
                                {isJoined && <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">✓ Joined</span>}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-white/35">
                                <span className="flex items-center gap-1"><Users size={10} />{ch.participants} participants</span>
                                <span className="flex items-center gap-1"><Clock size={10} />{ch.deadline}</span>
                                <span className="flex items-center gap-1 text-amber-400 font-bold"><Zap size={10} />+{ch.xp} XP</span>
                              </div>
                            </div>
                            <ChevronRight size={15} className="text-white/20 group-hover:text-amber-400 transition flex-shrink-0" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ══ DOUBT TAB ════════════════════════════════════ */}
              {activeTab === 'doubt' && (
                <>
                  {/* Ask a doubt */}
                  <div className={'rounded-3xl border p-5 ' + (isDark ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200 shadow')}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Ask Your Doubt</span>
                    </div>
                    <textarea
                      value={doubtQuestion}
                      onChange={e => setDoubtQuestion(e.target.value)}
                      placeholder="Describe your doubt in detail... (e.g., How does recursion work in tree traversal?)"
                      rows={3}
                      className={'w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none transition-all mb-3 ' + (isDark ? 'bg-[#0d0920] border border-rose-500/20 text-rose-100 placeholder:text-white/20 focus:border-rose-400/50' : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-rose-300')}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-[10px] px-2 py-1 rounded-lg bg-white/6 border border-white/8 text-white/35 cursor-pointer hover:bg-white/10 transition">📷 Image</span>
                        <span className="text-[10px] px-2 py-1 rounded-lg bg-white/6 border border-white/8 text-white/35 cursor-pointer hover:bg-white/10 transition">📎 Code</span>
                      </div>
                      <button
                        onClick={() => {
                          if (!doubtQuestion.trim()) { toast.error('Please describe your doubt before submitting.'); return; }
                          setDoubts(prev => [{ id: Date.now(), q: doubtQuestion, subject: 'General', answers: 0, solved: false, answersList: [] }, ...prev]);
                          setDoubtQuestion('');
                          toast.success('Doubt submitted!');
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-rose-700/20 cursor-pointer flex items-center gap-1.5"
                      >
                        <Send size={12} /> Submit Doubt
                      </button>
                    </div>
                  </div>

                  {/* Doubts list */}
                  <div className="space-y-3">
                    {doubts.map((doubt, i) => (
                      <motion.div
                        key={doubt.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => setSelectedDoubt(doubt)}
                        className={'rounded-2xl border p-5 flex justify-between items-start gap-3 hover:border-rose-500/25 transition cursor-pointer group ' + (isDark ? 'bg-white/3 border-white/8 hover:bg-white/5' : 'bg-white border-slate-200 hover:shadow-md')}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition truncate">{doubt.q}</h4>
                          <div className="flex items-center gap-3 text-xs text-white/30 mt-1.5">
                            <span>{doubt.subject}</span>
                            <span className="flex items-center gap-1"><MessageSquare size={10} />{doubt.answers} answers</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border flex-shrink-0 ${doubt.solved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                          {doubt.solved ? '✅ Solved' : '⏳ Open'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── RIGHT COLUMN ──────────────────────────────────── */}
          <div className="space-y-5">

            {/* Context panel */}
            <div className={'rounded-3xl border p-6 ' + (isDark ? 'bg-white/3 border-white/8' : 'bg-white border-slate-200 shadow')}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                {activeTabMeta && <activeTabMeta.icon size={24} className="text-purple-400" />}
              </div>
              <h3 className="font-bold text-white/70 text-center text-sm mb-2">
                {activeTab === 'forum'       && 'Discussion Forum'}
                {activeTab === 'groups'      && 'Study Groups'}
                {activeTab === 'clubs'       && 'Developer Clubs'}
                {activeTab === 'challenges'  && 'Community Challenges'}
                {activeTab === 'doubt'       && 'Doubt Clearing'}
              </h3>
              <p className="text-xs text-white/30 text-center leading-relaxed mb-5">
                {activeTab === 'forum'       && 'Post questions, share knowledge, and discuss topics with the community.'}
                {activeTab === 'groups'      && 'Form study groups with AI mentors, shared whiteboards, and task boards.'}
                {activeTab === 'clubs'       && 'Join specialized developer clubs and collaborate on real projects.'}
                {activeTab === 'challenges'  && 'Compete in weekly challenges, earn XP, and collect achievement badges.'}
                {activeTab === 'doubt'       && 'Get your doubts solved by peers and AI tutors within minutes.'}
              </p>

              {/* Quick links */}
              <div className="space-y-2">
                {activeTab === 'forum' && [
                  { label: 'Trending in DSA', icon: TrendingUp },
                  { label: 'New in Python', icon: Sparkles },
                  { label: 'Help needed: DBMS', icon: AlertCircle },
                ].map(link => (
                  <button key={link.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 hover:bg-purple-500/10 border border-white/6 hover:border-purple-500/20 transition group cursor-pointer text-left">
                    <link.icon size={12} className="text-purple-400 flex-shrink-0" />
                    <span className="text-xs text-white/50 group-hover:text-white/80 transition">{link.label}</span>
                    <ArrowRight size={10} className="text-white/20 group-hover:text-purple-400 transition ml-auto" />
                  </button>
                ))}

                {activeTab === 'groups' && [
                  { label: 'AI Matchmaking', sub: 'Find study partners', icon: Cpu },
                  { label: 'Import Schedule', sub: 'Sync your timetable', icon: Clock },
                  { label: 'Group Analytics', sub: 'Track progress', icon: TrendingUp },
                ].map(item => (
                  <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 hover:bg-blue-500/10 border border-white/6 hover:border-blue-500/20 transition group cursor-pointer text-left">
                    <item.icon size={12} className="text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/60 group-hover:text-white/80 transition font-medium">{item.label}</p>
                      <p className="text-[10px] text-white/25">{item.sub}</p>
                    </div>
                    <ArrowRight size={10} className="text-white/20 group-hover:text-blue-400 transition" />
                  </button>
                ))}

                {activeTab === 'clubs' && [
                  { label: 'Start a New Club', icon: Plus },
                  { label: 'GitHub Integration', icon: GitBranch },
                  { label: 'Club Leaderboard', icon: Trophy },
                ].map(item => (
                  <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 hover:bg-cyan-500/10 border border-white/6 hover:border-cyan-500/20 transition group cursor-pointer text-left">
                    <item.icon size={12} className="text-cyan-400 flex-shrink-0" />
                    <span className="text-xs text-white/50 group-hover:text-white/80 transition">{item.label}</span>
                    <ArrowRight size={10} className="text-white/20 group-hover:text-cyan-400 transition ml-auto" />
                  </button>
                ))}

                {activeTab === 'challenges' && [
                  { label: 'Leaderboard', icon: TrendingUp },
                  { label: 'My Achievements', icon: Star },
                  { label: 'Suggest Challenge', icon: Target },
                ].map(item => (
                  <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 hover:bg-amber-500/10 border border-white/6 hover:border-amber-500/20 transition group cursor-pointer text-left">
                    <item.icon size={12} className="text-amber-400 flex-shrink-0" />
                    <span className="text-xs text-white/50 group-hover:text-white/80 transition">{item.label}</span>
                    <ArrowRight size={10} className="text-white/20 group-hover:text-amber-400 transition ml-auto" />
                  </button>
                ))}

                {activeTab === 'doubt' && [
                  { label: 'Browse by Subject', icon: BookOpen },
                  { label: 'AI Tutor Session', icon: Sparkles },
                  { label: 'Top Solvers', icon: Trophy },
                ].map(item => (
                  <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 hover:bg-rose-500/10 border border-white/6 hover:border-rose-500/20 transition group cursor-pointer text-left">
                    <item.icon size={12} className="text-rose-400 flex-shrink-0" />
                    <span className="text-xs text-white/50 group-hover:text-white/80 transition">{item.label}</span>
                    <ArrowRight size={10} className="text-white/20 group-hover:text-rose-400 transition ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active Members */}
            <div className={'rounded-3xl border p-5 ' + (isDark ? 'bg-white/3 border-white/8' : 'bg-white border-slate-200 shadow')}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Now</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'Rahul K.',  subject: 'Solving DSA problems',    color: 'from-violet-500 to-indigo-600' },
                  { name: 'Priya S.',  subject: 'In Study Group: Python',  color: 'from-blue-500 to-cyan-600' },
                  { name: 'Amit V.',   subject: 'Answering SQL doubts',     color: 'from-emerald-500 to-teal-600' },
                  { name: 'Kavya P.', subject: 'Weekly Algorithm Sprint',  color: 'from-amber-500 to-orange-600' },
                ].map(member => (
                  <div key={member.name} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-[10px] font-black flex-shrink-0`}>
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white/65">{member.name}</p>
                      <p className="text-[10px] text-white/30 truncate">{member.subject}</p>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly XP Leaderboard */}
            <div className={'rounded-3xl border p-5 ' + (isDark ? 'bg-white/3 border-white/8' : 'bg-white border-slate-200 shadow')}>
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={12} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Weekly Leaderboard</span>
              </div>
              <div className="space-y-2">
                {[
                  { rank: 1, name: 'Rohan D.',  xp: 1840, medal: '🥇' },
                  { rank: 2, name: 'Kavya P.',  xp: 1620, medal: '🥈' },
                  { rank: 3, name: 'Priya S.',  xp: 1450, medal: '🥉' },
                  { rank: 4, name: 'Rahul K.',  xp: 1230, medal: '4'  },
                  { rank: 5, name: 'Sneha M.',  xp: 980,  medal: '5'  },
                ].map(entry => (
                  <div key={entry.rank} className="flex items-center gap-3 py-1">
                    <span className="text-sm w-6 text-center">{entry.medal}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white/65">{entry.name}</p>
                      <div className="h-1 rounded-full bg-white/8 mt-1 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${(entry.xp / 1840) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-amber-400">{entry.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHALLENGE DETAIL MODAL ──────────────────────────── */}
      <AnimatePresence>
        {selectedChallenge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedChallenge(null)}>
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden bg-[#0d0920] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="relative p-6 pb-4 bg-gradient-to-r from-amber-500/15 to-orange-500/8 border-b border-white/8">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${diffBadge(selectedChallenge.difficulty)}`}>{selectedChallenge.difficulty}</span>
                    <h2 className="text-xl font-black text-white mt-1">{selectedChallenge.title}</h2>
                  </div>
                  <button onClick={() => setSelectedChallenge(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition cursor-pointer text-white/40 hover:text-white"><X size={16} /></button>
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
                  <span className="flex items-center gap-1.5"><Users size={12} />{selectedChallenge.participants} participants</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} />{selectedChallenge.deadline}</span>
                  <span className="flex items-center gap-1.5 font-bold text-amber-400"><Zap size={12} />+{selectedChallenge.xp} XP</span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">About this Challenge</p>
                  <p className="text-sm text-white/65 leading-relaxed">{CHALLENGE_DETAILS[selectedChallenge.id]?.description}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Tasks to Complete</p>
                  <ul className="space-y-2">
                    {CHALLENGE_DETAILS[selectedChallenge.id]?.tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">🏆 Prize</p>
                    <p className="text-xs font-bold text-amber-400">{CHALLENGE_DETAILS[selectedChallenge.id]?.prize}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">🎯 Level</p>
                    <p className="text-xs font-bold text-white/70">{CHALLENGE_DETAILS[selectedChallenge.id]?.level}</p>
                  </div>
                </div>
                <button
                  onClick={() => { handleJoinChallenge(selectedChallenge); setSelectedChallenge(null); }}
                  className={`w-full py-3 text-white text-sm font-black rounded-2xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                    joinedChallenges[selectedChallenge.id]
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500'
                  }`}
                >
                  {joinedChallenges[selectedChallenge.id]
                    ? <><X size={15} /> Leave Challenge</>
                    : <><Trophy size={15} /> Join Challenge — Earn +{selectedChallenge.xp} XP</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DOUBT DETAIL MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {selectedDoubt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedDoubt(null)}>
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-3xl border border-white/10 overflow-hidden bg-[#0d0920] shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/8 bg-gradient-to-r from-rose-500/10 to-pink-500/5">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-lg">{selectedDoubt.subject}</span>
                    <h3 className="text-base font-extrabold text-white mt-2 leading-snug">{selectedDoubt.q}</h3>
                  </div>
                  <button onClick={() => setSelectedDoubt(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition cursor-pointer flex-shrink-0">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Answers */}
              <div className="p-5 overflow-y-auto space-y-3 flex-1">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-wider block">💬 Answers ({selectedDoubt.answersList?.length || 0})</span>
                {selectedDoubt.answersList?.map((ans, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/3 border border-white/6 space-y-2">
                    <div className="flex items-center gap-2 text-[10px]">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-white font-bold">{ans.avatar}</div>
                      <strong className="text-white/70">{ans.author}</strong>
                      <span className="text-white/30">• {ans.time}</span>
                    </div>
                    <p className="text-xs text-white/55 leading-relaxed whitespace-pre-wrap">{ans.text}</p>
                  </div>
                ))}
                {(!selectedDoubt.answersList || selectedDoubt.answersList.length === 0) && (
                  <p className="text-xs text-white/25 italic text-center py-6">No answers yet. Be the first to help!</p>
                )}
              </div>

              {/* Reply input */}
              <div className="p-4 border-t border-white/8 bg-black/20">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newReplyText}
                    onChange={e => setNewReplyText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newReplyText.trim()) {
                        const newAns = { author: user?.name || 'You', avatar: user?.name?.charAt(0)?.toUpperCase() || 'U', text: newReplyText, time: 'Just now' };
                        const updatedAnswers = [...(selectedDoubt.answersList || []), newAns];
                        setDoubts(prev => prev.map(d => d.id === selectedDoubt.id ? { ...d, answers: updatedAnswers.length, answersList: updatedAnswers } : d));
                        setSelectedDoubt(prev => ({ ...prev, answers: updatedAnswers.length, answersList: updatedAnswers }));
                        setNewReplyText('');
                        toast.success('Solution posted!');
                      }
                    }}
                    placeholder="Provide your solution or answer..."
                    className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/25 outline-none focus:border-rose-500/40"
                  />
                  <button
                    onClick={() => {
                      if (!newReplyText.trim()) return;
                      const newAns = { author: user?.name || 'You', avatar: user?.name?.charAt(0)?.toUpperCase() || 'U', text: newReplyText, time: 'Just now' };
                      const updatedAnswers = [...(selectedDoubt.answersList || []), newAns];
                      setDoubts(prev => prev.map(d => d.id === selectedDoubt.id ? { ...d, answers: updatedAnswers.length, answersList: updatedAnswers } : d));
                      setSelectedDoubt(prev => ({ ...prev, answers: updatedAnswers.length, answersList: updatedAnswers }));
                      setNewReplyText('');
                      toast.success('Solution posted!');
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Send size={11} /> Reply
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/25">Peer discussions monitored by AI Judge.</span>
                  <button
                    onClick={() => {
                      const loader = toast.loading('AI Tutor generating explanation...');
                      setTimeout(() => {
                        toast.dismiss(loader);
                        const aiAns = { author: 'AI Tutor', avatar: '🤖', text: `Here's the optimized analysis for "${selectedDoubt.q}":\n\nThis can be resolved using standard design patterns. Verify space complexity parameters to maintain latency constraints.`, time: 'Just now' };
                        const updatedAnswers = [...(selectedDoubt.answersList || []), aiAns];
                        setDoubts(prev => prev.map(d => d.id === selectedDoubt.id ? { ...d, answers: updatedAnswers.length, answersList: updatedAnswers } : d));
                        setSelectedDoubt(prev => ({ ...prev, answers: updatedAnswers.length, answersList: updatedAnswers }));
                        toast.success('AI Tutor explanation generated!');
                      }, 1500);
                    }}
                    className="text-[10px] font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={10} /> Ask AI Tutor
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
