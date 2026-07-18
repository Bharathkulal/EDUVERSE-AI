import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { 
  X, Trophy, Clock, Users, Zap, CheckCircle2, BookOpen, Code2, Palette, Server,
  Plus, Search, Filter, MessageSquare, Phone, Edit, Calendar, UserPlus, Share2, 
  Trash, Check, ChevronRight, Video, ArrowRight, UserCheck, Play, Settings, Database, 
  Code, Target, RefreshCw, Send, PlusCircle, Paperclip, Smile,
  FolderOpen, GitBranch, Terminal, Star, GitPullRequest
} from 'lucide-react';

const HASH_TO_TAB = {
  '#forum': 'forum',
  '#groups': 'groups',
  '#clubs': 'clubs',
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
          <StudyGroupsSubsystem />
        )}

        {/* CODING CLUBS (Developer Hub) */}
        {activeTab === 'clubs' && (
          <DeveloperHubSubsystem />
        )}



        {/* CHALLENGES */}
        {activeTab === 'challenges' && (
          <AIChallengeArena user={user} />
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

// ── STUDY GROUPS SUBSYSTEM ──────────────────────────────────────────────────
function StudyGroupsSubsystem() {
  const [activeWorkspace, setActiveWorkspace] = useState(null); // null = Dashboard, otherwise group object
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMatchmaker, setShowMatchmaker] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [workspaceTab, setWorkspaceTab] = useState('chat'); // chat, whiteboard, tasks, analytics, overview

  // Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('Data Structures');
  const [selectedAiMentor, setSelectedAiMentor] = useState('Coding AI');
  const [maxMembers, setMaxMembers] = useState(6);

  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'DSA Mastery & LeetCode Sprint',
      subject: 'Data Structures',
      owner: 'Rohan D. (You)',
      members: 5,
      max: 6,
      online: 3,
      aiMentor: 'Coding AI',
      weeklyGoal: 'Implement 5 tree & graph algorithms',
      upcomingMeeting: 'Today 5:00 PM (IST)',
      unreadCount: 3,
      coverColor: 'from-violet-600 to-indigo-800',
      tasks: [
        { id: 101, title: 'Write Balanced Tree validation script', status: 'todo', priority: 'High', assignee: 'Kavya P.' },
        { id: 102, title: 'Draw Graph traversals flowchart', status: 'progress', priority: 'Medium', assignee: 'Rahul K.' },
        { id: 103, title: 'Implement DFS/BFS in Java', status: 'completed', priority: 'High', assignee: 'Rohan D.' }
      ],
      chatMessages: [
        { role: 'user', name: 'Rahul K.', text: 'Hey team, did anyone finish the DFS code?', time: '12:30 PM' },
        { role: 'ai', name: 'Coding AI', text: 'DFS uses a stack or recursion. I can generate a quick template if you want!', time: '12:31 PM' }
      ]
    },
    {
      id: 2,
      name: 'DBMS Relational DB Builders',
      subject: 'Database Systems',
      owner: 'Kavya P.',
      members: 4,
      max: 8,
      online: 2,
      aiMentor: 'DBMS AI',
      weeklyGoal: 'Normalize E-Commerce Schema to 3NF',
      upcomingMeeting: 'Tomorrow 2:00 PM (IST)',
      unreadCount: 0,
      coverColor: 'from-blue-600 to-cyan-800',
      tasks: [],
      chatMessages: []
    }
  ]);

  const [chatInput, setChatInput] = useState('');
  const [whiteboardShapes, setWhiteboardShapes] = useState([]);

  // Matchmaking recommendations mock
  const matchmakingPool = [
    { name: 'Amit V.', matchRate: 98, reason: 'Strong in Java, looking for DSA partners in 6th Sem.', dept: 'CSE' },
    { name: 'Priya S.', matchRate: 92, reason: 'Expert in Python, shares similar evening study hours.', dept: 'ISE' }
  ];

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      subject: newGroupSubject,
      owner: 'Rohan D. (You)',
      members: 1,
      max: maxMembers,
      online: 1,
      aiMentor: selectedAiMentor,
      weeklyGoal: 'Solve textbook exercises',
      upcomingMeeting: 'Setup required',
      unreadCount: 0,
      coverColor: 'from-purple-600 to-pink-800',
      tasks: [],
      chatMessages: [
        { role: 'ai', name: selectedAiMentor, text: `Hello! I am your group's AI Mentor: ${selectedAiMentor}. Ask me anything!`, time: 'Just now' }
      ]
    };

    setGroups(prev => [newGroup, ...prev]);
    setNewGroupName('');
    setShowCreateModal(false);
    toast.success(`Group "${newGroupName}" created successfully!`);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      role: 'user',
      name: 'Rohan D. (You)',
      text: chatInput,
      time: 'Just now'
    };

    const updatedGroups = groups.map(g => {
      if (g.id === activeWorkspace.id) {
        const msgs = [...g.chatMessages, userMsg];
        return { ...g, chatMessages: msgs };
      }
      return g;
    });

    setGroups(updatedGroups);
    setActiveWorkspace(prev => ({ ...prev, chatMessages: [...prev.chatMessages, userMsg] }));
    const savedInput = chatInput;
    setChatInput('');

    // AI Response simulation
    setTimeout(() => {
      const aiResponse = {
        role: 'ai',
        name: activeWorkspace.aiMentor,
        text: `Understood! Regarding "${savedInput}", let's collaborate. I recommend building a quick flowchart or writing test cases in the workspace editor.`,
        time: 'Just now'
      };

      const withAiGroups = groups.map(g => {
        if (g.id === activeWorkspace.id) {
          return { ...g, chatMessages: [...g.chatMessages, userMsg, aiResponse] };
        }
        return g;
      });
      setGroups(withAiGroups);
      setActiveWorkspace(prev => ({ ...prev, chatMessages: [...prev.chatMessages, aiResponse] }));
    }, 1200);
  };

  const handleMoveTask = (taskId, nextStatus) => {
    const updated = groups.map(g => {
      if (g.id === activeWorkspace.id) {
        const tasks = g.tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t);
        return { ...g, tasks };
      }
      return g;
    });
    setGroups(updated);
    setActiveWorkspace(prev => {
      const tasks = prev.tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t);
      return { ...prev, tasks };
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            📚 Smart Study Groups
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Invite classmates, assign AI mentors, synchronize whiteboards, and solve assignments together.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition hover:shadow-lg hover:shadow-violet-600/20 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create Group
          </button>
          <button
            onClick={() => setShowMatchmaker(true)}
            className="px-4 py-2 bg-slate-900 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-violet-400" /> AI Match Me
          </button>
        </div>
      </div>

      {/* Outer Workspace Toggle */}
      {!activeWorkspace ? (
        // DASHBOARD VIEW
        <div className="space-y-6">
          {/* Active Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(g => (
              <div 
                key={g.id} 
                className="rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[320px] bg-slate-900/40 hover:border-violet-500/30 hover:shadow-xl transition group"
              >
                {/* Cover Banner */}
                <div className={`h-24 bg-gradient-to-br ${g.coverColor} p-4 flex flex-col justify-between relative`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-black/30 text-white border border-white/10">
                      {g.subject}
                    </span>
                    {g.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                        {g.unreadCount}
                      </span>
                    )}
                  </div>
                  <h3 className="relative z-10 font-bold text-white text-sm line-clamp-1">{g.name}</h3>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>👤 Mentor</span>
                      <span className="font-bold text-violet-400">{g.aiMentor}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>👥 Members</span>
                      <span className="font-bold text-white">{g.members} / {g.max} ({g.online} online)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>🎯 Goal</span>
                      <span className="font-semibold text-slate-300 truncate max-w-[140px]">{g.weeklyGoal}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>📅 Meeting</span>
                      <span className="font-bold text-cyan-400">{g.upcomingMeeting}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={() => { setActiveWorkspace(g); setWorkspaceTab('chat'); }}
                      className="flex-1 py-2 bg-violet-650 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Enter Room
                    </button>
                    <button
                      onClick={() => { if (window.confirm('Delete this group?')) setGroups(prev => prev.filter(pg => pg.id !== g.id)); }}
                      className="p-2 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ACTIVE WORKSPACE VIEW
        <div className="rounded-3xl border border-white/5 bg-[#0e0a24]/50 backdrop-blur-md p-6 space-y-6">
          {/* Workspace Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <button 
                onClick={() => setActiveWorkspace(null)}
                className="text-[10px] uppercase font-bold text-violet-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← Back to groups dashboard
              </button>
              <h3 className="text-lg font-black text-white">{activeWorkspace.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Subject: <strong>{activeWorkspace.subject}</strong></span> | 
                <span>AI Mentor: <strong className="text-violet-400">{activeWorkspace.aiMentor}</strong></span>
              </p>
            </div>

            {/* Workspace tabs */}
            <div className="flex p-1 bg-slate-950/60 rounded-xl border border-white/5 flex-wrap gap-1">
              {[
                { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-3 h-3" /> },
                { id: 'whiteboard', label: 'Whiteboard', icon: <Palette className="w-3 h-3" /> },
                { id: 'tasks', label: 'Tasks', icon: <Target className="w-3 h-3" /> },
                { id: 'analytics', label: 'Analytics', icon: <Trophy className="w-3 h-3" /> }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setWorkspaceTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    workspaceTab === t.id ? 'bg-violet-650 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Workspaces */}
          <div className="min-h-[350px]">
            {/* WORKSPACE TAB: CHAT */}
            {workspaceTab === 'chat' && (
              <div className="flex flex-col h-[400px] justify-between">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 va-scroll">
                  {activeWorkspace.chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[80%] text-xs leading-normal space-y-1.5 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white rounded-tr-none'
                          : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
                      }`}>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 gap-4 border-b border-white/5 pb-1">
                          <span className="font-bold">{msg.name}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2 border-t border-white/5 pt-4">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder={`Ask team or @${activeWorkspace.aiMentor}...`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-violet-500"
                  />
                  <button type="submit" className="p-2.5 bg-violet-650 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition">
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* WORKSPACE TAB: WHITEBOARD */}
            {workspaceTab === 'whiteboard' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 font-bold">Collaborative Smartboard Canvas</span>
                  <div className="flex gap-1.5">
                    {['Line', 'Flowchart', 'ER Diagram', 'Mind Map'].map(shape => (
                      <button
                        key={shape}
                        onClick={() => setWhiteboardShapes(prev => [...prev, { shape, id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 60 + 10 }])}
                        className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold rounded-lg hover:bg-violet-500/20 transition cursor-pointer"
                      >
                        + Add {shape}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Whiteboard Grid View */}
                <div className="h-[280px] bg-slate-950/60 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px]" />
                  {whiteboardShapes.length === 0 ? (
                    <span className="text-xs text-slate-500 font-bold z-10">Canvas is blank. Add shapes from toolbar.</span>
                  ) : (
                    whiteboardShapes.map(s => (
                      <div
                        key={s.id}
                        className="absolute p-3 bg-violet-650/20 border border-violet-500/50 text-white text-[10px] font-bold rounded-xl shadow-lg cursor-pointer"
                        style={{ left: `${s.x}%`, top: `${s.y}%` }}
                      >
                        📦 {s.shape} Node
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* WORKSPACE TAB: TASKS */}
            {workspaceTab === 'tasks' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['todo', 'progress', 'completed'].map(col => (
                  <div key={col} className="p-4 bg-slate-950/35 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{col}</span>
                      <span className="text-[10px] py-0.5 px-2 bg-white/5 rounded-full font-mono">
                        {activeWorkspace.tasks.filter(t => t.status === col).length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeWorkspace.tasks.filter(t => t.status === col).map(t => (
                        <div key={t.id} className="p-3 bg-slate-900 border border-white/5 rounded-xl space-y-2 hover:border-violet-500/20 transition">
                          <h4 className="text-xs font-bold text-white">{t.title}</h4>
                          <div className="flex justify-between items-center text-[9px] text-slate-500">
                            <span>Assignee: {t.assignee}</span>
                            <span className={`px-1.5 py-0.5 rounded ${t.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {t.priority}
                            </span>
                          </div>

                          <div className="flex gap-1 justify-end pt-1 border-t border-white/5">
                            {col !== 'todo' && (
                              <button onClick={() => handleMoveTask(t.id, 'todo')} className="text-[8px] font-bold text-slate-400 hover:text-white cursor-pointer px-1">To Do</button>
                            )}
                            {col !== 'progress' && (
                              <button onClick={() => handleMoveTask(t.id, 'progress')} className="text-[8px] font-bold text-violet-400 hover:text-white cursor-pointer px-1">Progress</button>
                            )}
                            {col !== 'completed' && (
                              <button onClick={() => handleMoveTask(t.id, 'completed')} className="text-[8px] font-bold text-emerald-400 hover:text-white cursor-pointer px-1">Done</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* WORKSPACE TAB: ANALYTICS */}
            {workspaceTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-950/30 border border-white/5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Group study hours</h4>
                  <div className="flex items-end justify-between h-32 pt-2 border-b border-white/5">
                    {[45, 80, 50, 95, 60].map((h, idx) => {
                      const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
                      return (
                        <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                          <div className="w-4 rounded-t bg-gradient-to-t from-violet-600 to-cyan-400" style={{ height: `${h}px` }} />
                          <span className="text-[9px] text-slate-500">{labels[idx]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5 bg-slate-950/30 border border-white/5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contribution leaderboard</h4>
                  <div className="space-y-3 text-xs">
                    {[
                      { name: 'Rohan D. (You)', score: 92, status: 'Best Contributor' },
                      { name: 'Kavya P.', score: 85, status: 'Discussion Leader' },
                      { name: 'Rahul K.', score: 74, status: 'Helper' }
                    ].map((user, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-white/2 rounded-xl border border-white/3">
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <span className="text-[8px] uppercase tracking-wider text-slate-400">{user.status}</span>
                        </div>
                        <span className="font-black text-violet-400">{user.score} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE STUDY GROUP MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b071e] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-white mb-4">➕ Create Study Group</h3>
              
              <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Group Name</label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="e.g. DSA & LeetCode Sprint"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">Subject</label>
                    <select
                      value={newGroupSubject}
                      onChange={e => setNewGroupSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white outline-none"
                    >
                      <option value="Data Structures">Data Structures</option>
                      <option value="Database Systems">Database Systems</option>
                      <option value="Java Programming">Java Programming</option>
                      <option value="Python Dev">Python Dev</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">Max Members</label>
                    <input
                      type="number"
                      min="2" max="20"
                      value={maxMembers}
                      onChange={e => setMaxMembers(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Select AI Mentor Partner</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Coding AI', 'DBMS AI', 'Java AI', 'Python AI'].map(mentor => (
                      <button
                        key={mentor}
                        type="button"
                        onClick={() => setSelectedAiMentor(mentor)}
                        className={`p-2 rounded-xl font-bold border transition ${
                          selectedAiMentor === mentor
                            ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                            : 'bg-slate-900 border-white/5 text-slate-400'
                        }`}
                      >
                        {mentor}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs mt-4 transition cursor-pointer"
                >
                  Create Group
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI MATCHMAKER DRAWER */}
      <AnimatePresence>
        {showMatchmaker && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[#0b071e] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setShowMatchmaker(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-white mb-2 flex items-center gap-1.5">
                🤖 AI Matchmaker Recommended Partners
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-wider">
                We've matched these students based on your subjects, study hours, and skill gaps.
              </p>

              <div className="space-y-3">
                {matchmakingPool.map((candidate, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex justify-between items-center gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{candidate.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-450">{candidate.dept} Dept</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{candidate.reason}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-400 block">{candidate.matchRate}% Match</span>
                      <button 
                        onClick={() => { toast.success(`Invitation sent to ${candidate.name}!`); setShowMatchmaker(false); }}
                        className="mt-1.5 px-2.5 py-1 bg-violet-600 hover:bg-violet-750 text-white font-bold text-[9px] rounded-lg transition cursor-pointer"
                      >
                        Invite to group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function AnimatedProgressRing({ percentage, size = 120, strokeWidth = 8, color = '#8B5CF6' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center animate-pulse" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-sm font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}

// ── DEVELOPER HUB SUBSYSTEM ────────────────────────────────────────────────
function DeveloperHubSubsystem() {
  const [activeWorkspace, setActiveWorkspace] = useState(null); // null = Dashboard, otherwise project object
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMatchmaker, setShowMatchmaker] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // code, chat, tasks, git, analytics
  const [codeContent, setCodeContent] = useState('// JavaScript Project Template\nconsole.log("Hello from EduVerse Developer Hub!");\n\nfunction calculateSum(a, b) {\n  return a + b;\n}\n\nconsole.log("Sum: " + calculateSum(5, 7));');
  const [terminalOutput, setTerminalOutput] = useState('Terminal ready. Click "Run Code" above.');
  const [isRunning, setIsRunning] = useState(false);

  // Form State
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('React + Node.js');
  const [selectedAiRole, setSelectedAiRole] = useState('Coding AI');

  const [workspaces, setWorkspaces] = useState([
    {
      id: 1,
      name: 'EduVerse AI Smart Planner',
      desc: 'An AI-powered calendar planner that optimizes study routines dynamically.',
      owner: 'Rohan D. (You)',
      tech: 'React + FastAPI + MongoDB',
      members: 4,
      max: 5,
      stars: 12,
      forks: 3,
      aiRole: 'Backend AI',
      progress: 68,
      lastCommit: 'Merge pull request #14 from main',
      tasks: [
        { id: 201, title: 'Setup FastAPI routers', status: 'todo', priority: 'High' },
        { id: 202, title: 'Design MongoDB User Schema', status: 'progress', priority: 'High' },
        { id: 203, title: 'Create calendar UI layout', status: 'completed', priority: 'Medium' }
      ],
      commits: [
        { hash: 'a8b7c6d', author: 'Rohan D.', msg: 'Setup FastAPI routers & db connection', date: '2 hours ago' },
        { hash: 'e9f0a1b', author: 'Priya S.', msg: 'Create calendar UI layout with mock data', date: '1 day ago' }
      ]
    },
    {
      id: 2,
      name: 'Collaborative Code Editor Node',
      desc: 'Real-time collaborative markdown and script editor with Jitsi audio integrations.',
      owner: 'Kavya P.',
      tech: 'React + WebSocket + PeerJS',
      members: 3,
      max: 4,
      stars: 8,
      forks: 1,
      aiRole: 'Coding AI',
      progress: 45,
      lastCommit: 'Fix websocket connection close handlers',
      tasks: [],
      commits: []
    }
  ]);

  const [matchmakingPool] = useState([
    { name: 'Rahul K.', role: 'Frontend Specialist', rate: 95, reason: 'Strong React 19 skill set matching your backend stack.', skills: ['React', 'Tailwind', 'Framer Motion'] },
    { name: 'Amit V.', role: 'DevOps / Database Partner', rate: 89, reason: 'Knows MongoDB sharding and Docker deployment structures.', skills: ['MongoDB', 'Docker', 'AWS'] }
  ]);

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newProjName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    const newProj = {
      id: Date.now(),
      name: newProjName,
      desc: newProjDesc || 'Collaborative software engineering workspace.',
      owner: 'Rohan D. (You)',
      tech: newProjTech,
      members: 1,
      max: 5,
      stars: 0,
      forks: 0,
      aiRole: selectedAiRole,
      progress: 5,
      lastCommit: 'Initial commit',
      tasks: [],
      commits: [
        { hash: 'c9d8e7f', author: 'Rohan D.', msg: 'Initial commit & project setup', date: 'Just now' }
      ]
    };

    setWorkspaces(prev => [newProj, ...prev]);
    setNewProjName('');
    setNewProjDesc('');
    setShowCreateModal(false);
    toast.success(`Workspace "${newProjName}" initialized successfully!`);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTerminalOutput('Compiling code matrix...\nRunning script in sandbox container...');
    setTimeout(() => {
      setIsRunning(false);
      setTerminalOutput('Vite Dev Server started on Port 5173...\n\nEduVerse Console Logger:\nHello from EduVerse Developer Hub!\nSum: 12\n\nProcess finished with exit code 0.');
      toast.success('Code executed successfully!');
    }, 1500);
  };

  const handleMoveTask = (taskId, nextStatus) => {
    const updated = workspaces.map(w => {
      if (w.id === activeWorkspace.id) {
        const tasks = w.tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t);
        return { ...w, tasks };
      }
      return w;
    });
    setWorkspaces(updated);
    setActiveWorkspace(prev => {
      const tasks = prev.tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t);
      return { ...prev, tasks };
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            💻 Developer Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Build projects together, collaborate with teammates, review code, and deploy projects with specialized AI assistants.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-650 text-white rounded-xl text-xs font-bold transition hover:shadow-lg hover:shadow-violet-600/20 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create Workspace
          </button>
          <button
            onClick={() => setShowMatchmaker(true)}
            className="px-4 py-2 bg-slate-900 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-violet-400" /> AI Match Team
          </button>
        </div>
      </div>

      {/* Main Workspace Toggle */}
      {!activeWorkspace ? (
        // DASHBOARD VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map(w => (
            <div 
              key={w.id} 
              className="rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[340px] bg-slate-900/40 hover:border-violet-500/30 hover:shadow-xl transition group"
            >
              {/* Cover Banner */}
              <div className="h-24 bg-gradient-to-br from-indigo-700 to-indigo-950 p-4 flex flex-col justify-between relative">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 flex justify-between items-center text-[9px]">
                  <span className="font-bold px-2 py-0.5 rounded bg-black/40 text-white border border-white/10">
                    {w.tech}
                  </span>
                  <div className="flex gap-2 text-slate-300">
                    <span>⭐ {w.stars}</span>
                    <span>🍴 {w.forks}</span>
                  </div>
                </div>
                <h3 className="relative z-10 font-bold text-white text-sm line-clamp-1">{w.name}</h3>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between text-xs">
                <p className="text-slate-450 leading-relaxed line-clamp-2 mb-2">{w.desc}</p>
                
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-slate-400">
                    <span>👥 Team Members</span>
                    <span className="font-bold text-white">{w.members} / {w.max} developers</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>🤖 AI Specialist</span>
                    <span className="font-bold text-violet-400">{w.aiRole}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>📈 Progress</span>
                    <span className="font-bold text-emerald-400">{w.progress}% completed</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setActiveWorkspace(w)}
                    className="flex-1 py-2.5 bg-violet-650 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <FolderOpen className="w-3.5 h-3.5" /> Open Workspace
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Delete this project workspace?')) setWorkspaces(prev => prev.filter(pw => pw.id !== w.id)); }}
                    className="p-2.5 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-450 hover:text-rose-400 rounded-xl transition cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ACTIVE WORKSPACE SUITE
        <div className="rounded-3xl border border-white/5 bg-[#0e0a24]/50 backdrop-blur-md p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
            <div>
              <button 
                onClick={() => setActiveWorkspace(null)}
                className="text-[10px] uppercase font-bold text-violet-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← Back to developer hub
              </button>
              <h3 className="text-lg font-black text-white">{activeWorkspace.name}</h3>
              <p className="text-xs text-slate-450">
                AI Partner: <strong className="text-violet-400">{activeWorkspace.aiRole}</strong>
              </p>
            </div>

            {/* Nav Workspace Tabs */}
            <div className="flex p-1 bg-slate-950/60 rounded-xl border border-white/5 flex-wrap gap-1">
              {[
                { id: 'code', label: 'AI Code & Pair Programmer', icon: <Code className="w-3.5 h-3.5" /> },
                { id: 'tasks', label: 'Tasks & Standup', icon: <Target className="w-3.5 h-3.5" /> },
                { id: 'testing', label: 'Testing & Security', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                { id: 'architecture', label: 'Architecture Advisor', icon: <Database className="w-3.5 h-3.5" /> },
                { id: 'deploy', label: 'Deploy & Analytics', icon: <FolderOpen className="w-3.5 h-3.5" /> }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === t.id ? 'bg-violet-650 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Workspace Views */}
          <div className="min-h-[400px]">
            {/* WORKSPACE TAB: CODE EDITOR & PAIR PROGRAMMER */}
            {activeTab === 'code' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Code editor side */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      📄 index.js (Multiplayer Live Editor)
                    </span>
                    <button 
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" /> {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                  </div>

                  {/* Monaco Simulated Canvas */}
                  <textarea
                    value={codeContent}
                    onChange={e => setCodeContent(e.target.value)}
                    className="h-[280px] bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-white/5 outline-none focus:border-violet-500/50 resize-none leading-relaxed"
                  />

                  {/* Visual terminal */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-b border-white/5 pb-1">
                      <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Sandbox output</span>
                      <span>bash</span>
                    </div>
                    <pre className="text-[10px] font-mono text-slate-300 leading-normal whitespace-pre-wrap">
                      {terminalOutput}
                    </pre>
                  </div>
                </div>

                {/* AI Pair Programmer Timeline Panel */}
                <div className="lg:col-span-4 p-5 bg-slate-950/40 border border-white/5 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Settings className="w-4 h-4 text-violet-400 animate-spin" style={{ animationDuration: '3s' }} />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Pair Programmer</h4>
                  </div>

                  {/* AI Activity Timeline */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Activity Logs</span>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto va-scroll pr-1">
                      {[
                        { state: 'Watching...', desc: 'Monitored 1 file modification in index.js.', time: 'Just now' },
                        { state: 'Reviewing...', desc: 'Verified calculateSum execution paths.', time: '1 min ago' },
                        { state: 'Optimizing...', desc: 'Proposed React Hooks convert options.', time: '5 mins ago' }
                      ].map((log, idx) => (
                        <div key={idx} className="p-2 bg-white/3 border border-white/5 rounded-xl text-[10px] space-y-1">
                          <div className="flex justify-between font-bold text-violet-300">
                            <span>{log.state}</span>
                            <span className="text-[9px] text-slate-500">{log.time}</span>
                          </div>
                          <p className="text-slate-400 leading-normal">{log.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Ask Prompts */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Ask Pair Programmer</span>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {[
                        { l: 'Explain this function', p: 'Provide time and space complexity analysis for calculateSum.' },
                        { l: 'Improve performance', p: 'Optimize script execution speed and memory footprints.' },
                        { l: 'Rewrite using Hooks', p: 'Convert to functional state component.' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            toast.loading(`Consulting AI...`);
                            setTimeout(() => {
                              toast.dismiss();
                              setTerminalOutput(`AI Pair Programmer reply:\n"Here is the optimized approach. We cache recursive calls using React useMemo or python lru_cache. Let's apply this code change."`);
                              toast.success('Advice generated!');
                            }, 1200);
                          }}
                          className="w-full text-left p-2.5 bg-slate-900 border border-white/10 rounded-xl hover:border-violet-500/40 text-[10px] text-slate-300 font-bold transition cursor-pointer"
                        >
                          💬 {item.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACE TAB: TASKS & STANDUP */}
            {workspaceTab === 'tasks' && (
              <div className="space-y-6">
                {/* Daily Stand-up summary banner */}
                <div className="p-4 bg-gradient-to-r from-violet-900/35 to-indigo-900/30 border border-purple-500/20 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    🤖 AI Daily Stand-up Meeting & Sprint Report
                  </h4>
                  <p className="text-[10px] text-slate-350 leading-relaxed">
                    AI Sprints report generated today: <strong>Sprint Health - Good (85%)</strong>. Developer contributions: Rohan D. (10 commits), Priya S. (4 commits). <strong>Blocked tasks:</strong> Setup FastAPI routers (FastAPI db connection issue).
                  </p>
                  <button 
                    onClick={() => toast.success('Sprint PDF report generated!')}
                    className="px-3 py-1 bg-violet-650 hover:bg-violet-750 text-white font-bold text-[9px] rounded-lg transition"
                  >
                    Export Stand-up Report
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['todo', 'progress', 'completed'].map(col => (
                    <div key={col} className="p-4 bg-slate-950/35 border border-white/5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{col}</span>
                        <span className="text-[10px] py-0.5 px-2 bg-white/5 rounded-full font-mono">
                          {activeWorkspace.tasks.filter(t => t.status === col).length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {activeWorkspace.tasks.length === 0 ? (
                          <p className="text-[10px] text-slate-500 text-center py-6">No tasks assigned.</p>
                        ) : (
                          activeWorkspace.tasks.filter(t => t.status === col).map(t => (
                            <div key={t.id} className="p-3 bg-slate-900 border border-white/5 rounded-xl space-y-2 hover:border-violet-500/20 transition">
                              <h4 className="text-xs font-bold text-white">{t.title}</h4>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold">{t.priority} Priority</span>

                              <div className="flex gap-1 justify-end pt-1 border-t border-white/5">
                                {col !== 'todo' && (
                                  <button onClick={() => handleMoveTask(t.id, 'todo')} className="text-[8px] font-bold text-slate-400 hover:text-white cursor-pointer px-1">To Do</button>
                                )}
                                {col !== 'progress' && (
                                  <button onClick={() => handleMoveTask(t.id, 'progress')} className="text-[8px] font-bold text-violet-400 hover:text-white cursor-pointer px-1">Progress</button>
                                )}
                                {col !== 'completed' && (
                                  <button onClick={() => handleMoveTask(t.id, 'completed')} className="text-[8px] font-bold text-emerald-400 hover:text-white cursor-pointer px-1">Done</button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WORKSPACE TAB: TESTING & SECURITY */}
            {workspaceTab === 'testing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* One Click Test Generator */}
                <div className="p-5 bg-slate-950/40 border border-white/5 rounded-3xl space-y-4 text-xs">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    🧪 One Click Test Generator
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Target Framework</span>
                      <span className="font-bold text-violet-400">Jest / Vitest</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {[
                        { label: 'Coverage', val: '92%', color: 'text-emerald-400' },
                        { label: 'Passed', val: '12 / 12', color: 'text-cyan-400' },
                        { label: 'Missing Tests', val: '3 detected', color: 'text-rose-400' }
                      ].map((stat, i) => (
                        <div key={i} className="p-2 bg-white/3 border border-white/5 rounded-xl">
                          <span className="text-slate-500 block">{stat.label}</span>
                          <span className={`font-bold ${stat.color}`}>{stat.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          toast.loading('Running unit tests...');
                          setTimeout(() => {
                            toast.dismiss();
                            toast.success('All 12 test specs passed!');
                          }, 1000);
                        }}
                        className="flex-1 py-2 bg-violet-650 hover:bg-violet-750 text-white font-bold rounded-xl text-[10px] transition"
                      >
                        Run Test Suite
                      </button>
                      <button 
                        onClick={() => toast.success('Generated 5 Jest specifications!')}
                        className="px-3 py-2 border border-white/10 hover:border-violet-500 text-slate-350 rounded-xl transition text-[10px]"
                      >
                        Generate Tests
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Security & Vulnerability Scanner */}
                <div className="p-5 bg-slate-950/40 border border-white/5 rounded-3xl space-y-4 text-xs">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    🛡️ AI Security & OWASP Analyzer
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Security Score</span>
                      <span className="font-black text-rose-400">88% (Low Risk)</span>
                    </div>

                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] space-y-1">
                      <span className="font-bold text-rose-400 uppercase tracking-widest block">Vulnerability warning</span>
                      <p className="text-slate-300 leading-normal">
                        "index.js line 18 uses hardcoded credentials. We recommend moving database passwords to process.env config."
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        toast.loading('Scanning workspace...');
                        setTimeout(() => {
                          toast.dismiss();
                          toast.success('Vulnerability scan completed. 1 warning found.');
                        }, 1200);
                      }}
                      className="w-full py-2 bg-slate-900 border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 font-bold rounded-xl transition"
                    >
                      Scan API Endpoints
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACE TAB: ARCHITECTURE & SCHEMAS */}
            {workspaceTab === 'architecture' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Visual directory structure advisor */}
                <div className="p-5 bg-slate-950/40 border border-white/5 rounded-3xl space-y-3">
                  <h4 className="text-xs font-bold text-white">📁 Folder Structure & Tech Recommendations</h4>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 space-y-1">
                    <div>├── src/</div>
                    <div>│   ├── controllers/ <span className="text-slate-500">// API endpoints</span></div>
                    <div>│   ├── models/ <span className="text-slate-500">// MongoDB schemas</span></div>
                    <div>│   └── index.js <span className="text-slate-500">// Application entrypoint</span></div>
                    <div>├── tests/ <span className="text-slate-500">// Vitest suites</span></div>
                    <div>└── package.json</div>
                  </div>
                </div>

                {/* AI Diagram builder */}
                <div className="p-5 bg-slate-950/40 border border-white/5 rounded-3xl space-y-4">
                  <h4 className="text-xs font-bold text-white">📊 AI Diagram Generator</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Generate microservice flowcharts, ER diagrams, or authentication pathways with one click:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {['ER Diagram', 'API Flow', 'Microservices', 'Auth Flow'].map((diag, i) => (
                      <button
                        key={i}
                        onClick={() => toast.success(`Generated ${diag} blueprint!`)}
                        className="p-2.5 bg-slate-900 border border-white/10 text-[10px] hover:border-violet-500/30 hover:text-white font-bold rounded-xl text-slate-400 transition"
                      >
                        📐 {diag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACE TAB: DEPLOYMENT & PORTFOLIO */}
            {workspaceTab === 'deploy' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* One Click Deployment Center */}
                <div className="p-5 bg-slate-950/40 border border-white/5 rounded-3xl space-y-4">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    🚀 One Click Deployment Wizard
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-450">Deploy Platform</span>
                      <span className="font-bold text-cyan-400">Vercel / Render</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1 font-mono text-[9px] text-slate-400 max-h-[80px] overflow-y-auto va-scroll">
                      <div>[12:00:15] Build command executed successfully.</div>
                      <div>[12:00:18] Uploading bundles to Render CDN...</div>
                      <div>[12:00:20] Deployment online: https://eduverse-planner.render.com</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          toast.loading('Initializing deploy pipeline...');
                          setTimeout(() => {
                            toast.dismiss();
                            toast.success('Production build online!');
                          }, 1500);
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-indigo-650 text-white font-bold rounded-xl text-[10px] transition"
                      >
                        Deploy to Prod
                      </button>
                      <button
                        onClick={() => toast.success('Deployment rolled back to previous hash commit!')}
                        className="px-3 py-2 border border-white/10 hover:border-rose-500 text-slate-450 hover:text-rose-400 rounded-xl transition text-[10px]"
                      >
                        Rollback
                      </button>
                    </div>
                  </div>
                </div>

                {/* Project Portfolio Generator */}
                <div className="p-5 bg-slate-950/40 border border-white/5 rounded-3xl space-y-4">
                  <h4 className="text-xs font-bold text-white">📄 Portfolio & README Generator</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Automatically assemble professional portfolio pages, Swagger specs, and developer README layouts.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <button 
                      onClick={() => toast.success('README.md generated successfully!')}
                      className="p-2.5 bg-slate-900 border border-white/5 hover:border-violet-500/20 text-slate-350 rounded-xl transition text-left"
                    >
                      📝 Generate README
                    </button>
                    <button 
                      onClick={() => toast.success('Swagger specs generated!')}
                      className="p-2.5 bg-slate-900 border border-white/5 hover:border-violet-500/20 text-slate-350 rounded-xl transition text-left"
                    >
                      Swagger Exporter
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CREATE WORKSPACE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b071e] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-white mb-4">➕ Create Developer Workspace</h3>
              
              <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProjName}
                    onChange={e => setNewProjName(e.target.value)}
                    placeholder="e.g. AI Study Assistant"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Project Description</label>
                  <textarea
                    value={newProjDesc}
                    onChange={e => setNewProjDesc(e.target.value)}
                    placeholder="Brief outline of target objectives..."
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">Tech Stack</label>
                    <select
                      value={newProjTech}
                      onChange={e => setNewProjTech(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white outline-none"
                    >
                      <option value="React + FastAPI + MongoDB">React + FastAPI + MongoDB</option>
                      <option value="React + WebSocket + PeerJS">React + WebSocket + PeerJS</option>
                      <option value="Python + PyTorch">Python + PyTorch</option>
                      <option value="Next.js + SQL">Next.js + SQL</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">AI Assistant Role</label>
                    <select
                      value={selectedAiRole}
                      onChange={e => setSelectedAiRole(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white outline-none"
                    >
                      <option value="Coding AI">Coding AI</option>
                      <option value="Backend AI">Backend AI</option>
                      <option value="DevOps AI">DevOps AI</option>
                      <option value="Security AI">Security AI</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs mt-4 transition cursor-pointer"
                >
                  Initialize Workspace
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEAM MATCHMAKER DRAWER */}
      <AnimatePresence>
        {showMatchmaker && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[#0b071e] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setShowMatchmaker(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-white mb-2 flex items-center gap-1.5">
                🤖 AI Team Recruiter Partner matches
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-wider">
                Developers matching your tech stack and missing skill roles:
              </p>

              <div className="space-y-3 text-xs">
                {matchmakingPool.map((candidate, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex justify-between items-center gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{candidate.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-violet-400">{candidate.role}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{candidate.reason}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-400 block">{candidate.rate}% Match</span>
                      <button 
                        onClick={() => { toast.success(`Invitation sent to ${candidate.name}!`); setShowMatchmaker(false); }}
                        className="mt-1.5 px-2.5 py-1 bg-violet-650 hover:bg-violet-750 text-white font-bold text-[9px] rounded-lg transition cursor-pointer"
                      >
                        Recruit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ── AI CHALLENGE ARENA SUBSYSTEM ──────────────────────────────────────────
function AIChallengeArena({ user }) {
  const [view, setView] = useState('dashboard'); // dashboard, matchmaking, arena, results, admin
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [battleType, setBattleType] = useState('solo'); // solo, 1v1, team, ai
  const [aiDifficulty, setAiDifficulty] = useState('Medium'); // Easy, Medium, Hard, Expert, Master, Grandmaster
  
  // Game states
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes count
  const [codeContent, setCodeContent] = useState('// Write your coding solution here...\nfunction solve(input) {\n  return input;\n}');
  const [consoleOutput, setConsoleOutput] = useState('Terminal ready. Run code to execute logic...');
  const [isCompiling, setIsCompiling] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [aiAnalyzerFeed, setAiAnalyzerFeed] = useState([
    '🤖 AI Judge: Ready to evaluate constraints...',
    '🤖 AI Assistant: Keep track of potential array index bounds!'
  ]);
  const [chatInput, setChatInput] = useState('');
  const [arenaChat, setArenaChat] = useState([
    { sender: 'AI Judge', text: 'Match initiated. Best of luck developers!' }
  ]);

  // Results Screen Data
  const [resultData, setResultData] = useState({
    winner: 'You',
    runnerUp: 'Simulated Peer',
    score: 92,
    accuracy: 95,
    quality: 90,
    complexity: 'O(N log N) time, O(1) space',
    strengths: ['Optimal search structure', 'Clean variable naming', 'Edge case checks covered'],
    weaknesses: ['Redundant condition checks in helper', 'Could add inline documentation'],
    feedback: 'Excellent work. Your binary search variant handles duplicates correctly. Optimize the loop conditions for maximum throughput.'
  });

  // Admin states
  const [customChallenges, setCustomChallenges] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('Medium');
  const [newCategory, setNewCategory] = useState('Algorithms');
  const [newXp, setNewXp] = useState(250);

  // Mock list of challenges
  const categories = [
    'All', 'Programming', 'Data Structures', 'Algorithms', 'AI', 'Machine Learning', 
    'Web Dev', 'Cyber Security', 'Cloud Computing', 'Database', 'SQL', 'Aptitude', 'Quiz Battle'
  ];

  const challengesList = [
    { id: 1, title: 'Weekly Algorithm Sprint', difficulty: 'Medium', category: 'Algorithms', xp: 200, coins: 50, estTime: '20 min', successRate: '82%', trending: true, activePlayers: 14, prize: '$100 Pool' },
    { id: 2, title: 'Database Optimization Battle', difficulty: 'Hard', category: 'Database', xp: 350, coins: 100, estTime: '30 min', successRate: '54%', trending: false, activePlayers: 8, prize: 'DBMS Master Badge' },
    { id: 3, title: 'React Performance Contest', difficulty: 'Medium', category: 'Web Dev', xp: 150, coins: 40, estTime: '15 min', successRate: '88%', trending: true, activePlayers: 29, prize: 'React Frame' },
    { id: 4, title: 'AI Neural Net Architecture', difficulty: 'Hard', category: 'Machine Learning', xp: 400, coins: 120, estTime: '45 min', successRate: '32%', trending: true, activePlayers: 5, prize: 'AI Badge' },
    { id: 5, title: 'SQL Query Speedrun', difficulty: 'Easy', category: 'SQL', xp: 100, coins: 20, estTime: '10 min', successRate: '94%', trending: false, activePlayers: 42, prize: '50 Coins' }
  ];

  // Matchmaking simulation
  useEffect(() => {
    let interval;
    if (view === 'matchmaking') {
      let progress = 0;
      interval = setInterval(() => {
        progress += 25;
        if (progress >= 100) {
          clearInterval(interval);
          setView('arena');
          setTimeRemaining(600);
          setOpponentProgress(0);
          simulateOpponent();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // Game timer countdown simulation
  useEffect(() => {
    let interval;
    if (view === 'arena' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, timeRemaining]);

  // Simulate opponent activity in 1v1 Battle
  const simulateOpponent = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setOpponentProgress(progress);
    }, 4000);

    // AI Analysis simulation streams
    setTimeout(() => {
      setAiAnalyzerFeed(prev => [...prev, '🤖 AI Judge: Opponent has successfully run public test cases.']);
    }, 8000);
    setTimeout(() => {
      setAiAnalyzerFeed(prev => [...prev, '🤖 AI Advisor: Your time complexity is lower than your opponent’s. Keep optimizing.']);
    }, 15000);
  };

  // Compile / Run Code simulation
  const handleRunCode = () => {
    setIsCompiling(true);
    setConsoleOutput('Compiling code...\nVerifying assertions in virtual container sandbox...');
    setTimeout(() => {
      setIsCompiling(false);
      setConsoleOutput('Output:\nTest Case 1 passed: Input: [2, 7, 11, 15] Target: 9 => Success!\nTest Case 2 passed: Input: [3, 2, 4] Target: 6 => Success!\nCompilation status: Clean.\nExecuted in 45ms.');
      toast.success('Test cases completed successfully!');
    }, 1200);
  };

  // Submit Solution / AI Judge evaluation simulation
  const handleSubmitSolution = () => {
    const loader = toast.loading('AI Judge is performing comprehensive evaluations...');
    setTimeout(() => {
      toast.dismiss(loader);
      toast.success('Evaluation complete! Transitioning to result board.');
      setView('results');
    }, 2000);
  };

  // Filtered challenges
  const filteredChallenges = challengesList.filter(ch => 
    activeCategory === 'All' || ch.category === activeCategory
  );

  return (
    <div className="space-y-6 pb-8">
      {/* ARENA HEADER STATUS WIDGETS */}
      <div className="flex justify-between items-center bg-slate-900/60 p-4 border border-[var(--db-sidebar-border)] rounded-2xl">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-violet-400" />
          <div>
            <h2 className="text-sm font-extrabold text-white font-sans">EDUVERSE AI Battle Arena</h2>
            <p className="text-[10px] uppercase font-black text-violet-400/80 tracking-wider">Level 12 • Season 4 Pass Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500 fill-current" /> Streak: 5 Days</span>
          <span className="bg-violet-650/20 border border-violet-500/20 px-3 py-1 rounded-xl text-violet-400 font-extrabold cursor-pointer hover:bg-violet-600 hover:text-white transition" onClick={() => setView('admin')}>Admin Panel</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: ARENA DASHBOARD */}
        {view === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* Category Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                    activeCategory === cat
                      ? 'bg-violet-650 border-violet-500 text-white shadow-lg shadow-violet-600/10'
                      : 'bg-[var(--db-card-bg)] border-[var(--db-sidebar-border)] text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dashboard Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Challenges Columns */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Daily Sprints & bot Battles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Daily instant challenge widget */}
                  <div className="p-5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent space-y-3 relative overflow-hidden">
                    <span className="absolute right-3 top-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded">Daily Blitz</span>
                    <Zap className="w-8 h-8 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Daily Coding Challenge</h4>
                      <p className="text-[11px] text-slate-450 mt-1">Implement an optimized LRU cache with O(1) lookup speed constraints.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => { setBattleType('solo'); setView('matchmaking'); }} className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-black text-[10px] font-black rounded-xl transition cursor-pointer">Play Solo</button>
                      <button onClick={() => { setBattleType('ai'); setView('matchmaking'); }} className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black rounded-xl transition cursor-pointer">Battle AI</button>
                    </div>
                  </div>

                  {/* 1v1 challenge matching */}
                  <div className="p-5 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent space-y-3 relative overflow-hidden">
                    <span className="absolute right-3 top-3 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded">Multiplayer</span>
                    <Users className="w-8 h-8 text-violet-400" />
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Ranked 1v1 Battle</h4>
                      <p className="text-[11px] text-slate-455 mt-1">Match instantly with peers globally in your skill class.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => { setBattleType('1v1'); setView('matchmaking'); }} className="px-4 py-1.5 bg-violet-650 hover:bg-violet-750 text-white text-[10px] font-black rounded-xl transition cursor-pointer">Find Match</button>
                      <button onClick={() => { setBattleType('team'); setView('matchmaking'); }} className="px-4 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black rounded-xl transition cursor-pointer">Team Sprint (3v3)</button>
                    </div>
                  </div>

                </div>

                {/* Challenges listing block */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-500 block tracking-widest">🔥 Live & Featured Competitions</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredChallenges.map(ch => (
                      <div key={ch.id} className="p-5 rounded-3xl bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] flex flex-col justify-between gap-3 relative overflow-hidden hover:border-violet-500/20 transition-all">
                        {ch.trending && <span className="absolute top-3 right-3 text-[9px] uppercase font-black px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">Trending</span>}
                        
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{ch.category}</span>
                          <h4 className="text-xs font-black text-white">{ch.title}</h4>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center bg-black/20 p-2 rounded-xl text-[10px]">
                          <div>
                            <span className="text-slate-500 block text-[8px]">XP</span>
                            <span className="font-bold text-violet-400">+{ch.xp}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[8px]">Est Time</span>
                            <span className="font-bold text-slate-300">{ch.estTime}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[8px]">Rate</span>
                            <span className="font-bold text-emerald-400">{ch.successRate}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">{ch.activePlayers} active now</span>
                          <button onClick={() => { setSelectedChallenge(ch); setView('matchmaking'); }} className="px-3.5 py-1.5 bg-violet-650 hover:bg-violet-750 text-white rounded-xl font-bold cursor-pointer transition">Launch Arena</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sidebar Widget rankings */}
              <div className="space-y-6">
                
                {/* Mini Leaderboard ranking */}
                <div className="p-5 rounded-3xl bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Trophy className="w-4 h-4 text-violet-400" />
                    <span className="text-[10px] font-black uppercase text-white tracking-wider">Arena Leaderboard</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { rank: 1, name: 'Ananya S.', rating: 2840, title: 'Grandmaster' },
                      { rank: 2, name: 'Rahul K.', rating: 2420, title: 'Master' },
                      { rank: 3, name: 'Kavya Sharma', rating: 2190, title: 'Expert' }
                    ].map(userRank => (
                      <div key={userRank.rank} className="flex justify-between items-center text-xs p-2 bg-white/2 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-500">#{userRank.rank}</span>
                          <div>
                            <p className="font-bold text-white">{userRank.name}</p>
                            <span className="text-[9px] text-violet-400 font-bold uppercase">{userRank.title}</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-355">{userRank.rating} ELO</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Skills constraints radar review */}
                <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
                  <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-widest">🤖 AI Career Recommendation</span>
                  <p className="text-[11px] text-slate-405 leading-normal">
                    AI predicts you have a <strong>91% match</strong> for Web Dev SRE roles. Improve your *Database Queries & Optimization* stats in the arena to unlock higher tiers.
                  </p>
                </div>

              </div>

            </div>

          </motion.div>
        )}

        {/* VIEW 2: ANIMATED MATCHMAKER RADAR */}
        {view === 'matchmaking' && (
          <motion.div key="matchmaking" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center p-12 border border-white/5 rounded-3xl bg-slate-955/40 min-h-[350px]">
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border border-violet-500/40 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-violet-500/20 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                AI
              </div>
            </div>
            
            <h3 className="text-base font-extrabold text-white">
              {battleType === 'ai' ? `Initiating Battle vs AI Bot (${aiDifficulty})` : 'Finding Competitive Match...'}
            </h3>
            <p className="text-xs text-[var(--db-text-muted)] mt-1.5 max-w-sm text-center">
              Evaluating ELO ratings, topic accuracy profiles, and setting up sandbox runtime environments.
            </p>

            {battleType === 'ai' && (
              <div className="mt-4 flex gap-1 bg-slate-900 p-1 rounded-xl border border-white/5">
                {['Easy', 'Medium', 'Hard', 'Grandmaster'].map(d => (
                  <button
                    key={d}
                    onClick={() => setAiDifficulty(d)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${aiDifficulty === d ? 'bg-violet-650 text-white' : 'text-slate-500 hover:text-white'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 3: LIVE BATTLE ARENA */}
        {view === 'arena' && (
          <motion.div key="arena" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side constraints column */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] space-y-4 h-[350px] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black uppercase text-violet-400 tracking-wider">Problem Description</span>
                  <span className="font-mono text-xs text-amber-500 font-extrabold">⏳ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-205">
                  <h3 className="text-sm font-extrabold text-white font-sans">Find First Duplicate Elements</h3>
                  <p>
                    Given an array of integers `nums`, find the first recurring duplicate index. If no duplicates exist, return `-1`.
                  </p>
                  <p className="font-mono bg-black/30 p-2.5 rounded-lg border border-white/5 text-[11px]">
                    Input: nums = [2, 1, 3, 5, 3, 2]<br />
                    Output: 3
                  </p>
                  <div>
                    <span className="font-bold text-slate-400">Constraints:</span>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px] text-slate-450">
                      <li>Time Complexity: O(N) constraint</li>
                      <li>Space Complexity: O(N) or lower</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Execution console output */}
              <div className="p-5 rounded-3xl bg-black/45 border border-white/5 space-y-2 h-[180px] flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block tracking-widest">Sandbox Terminal Output</span>
                  <pre className="font-mono text-[10px] text-slate-300 overflow-y-auto max-h-24 whitespace-pre-wrap">{consoleOutput}</pre>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleRunCode} disabled={isCompiling} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">{isCompiling ? 'Compiling...' : 'Run Code'}</button>
                  <button onClick={handleSubmitSolution} className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-indigo-650 text-white rounded-xl text-xs font-bold hover:opacity-90 transition cursor-pointer">Submit Solution</button>
                </div>
              </div>
            </div>

            {/* Monaco code workspace panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-3xl border border-[var(--db-sidebar-border)] bg-slate-950 overflow-hidden h-[350px]">
                <Editor
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  value={codeContent}
                  onChange={(val) => setCodeContent(val)}
                  options={{
                    fontSize: 12,
                    minimap: { enabled: false },
                    automaticLayout: true
                  }}
                />
              </div>

              {/* Multiplayer / bot activity panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Opponent Progress indicators */}
                <div className="p-4 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-400" /> Opponent Progress</span>
                    <span className="font-mono font-bold text-indigo-400">{opponentProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-1000" style={{ width: `${opponentProgress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    {opponentProgress === 100 ? 'Opponent submitted solution!' : 'Opponent is writing solution code...'}
                  </p>
                </div>

                {/* AI Live analysis helper */}
                <div className="p-4 bg-slate-900 border border-white/5 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-500 block tracking-widest flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 animate-pulse" /> AI Live Assessor</span>
                  <div className="space-y-1.5 max-h-16 overflow-y-auto pr-1 text-slate-350">
                    {aiAnalyzerFeed.map((feed, idx) => (
                      <p key={idx} className="text-[10px] leading-normal">{feed}</p>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        )}

        {/* VIEW 4: RESULTS DASHBOARD */}
        {view === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* Header victory banner */}
            <div className="p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/5 to-transparent text-center space-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.04)_1px,transparent_1px)] [background-size:20px_20px]" />
              <h2 className="text-2xl font-black text-white font-sans">🏆 Victory! You Won the Battle</h2>
              <p className="text-xs text-slate-400">Evaluated in real-time by the EDUVERSE AI Judge Sandbox</p>
            </div>

            {/* Comparison statistics grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-6">
                
                {/* Metric comparisons */}
                <div className="p-5 rounded-3xl bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-505 block tracking-widest">Performance comparison</span>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">AI Judge Score</span>
                      <span className="text-lg font-black text-white">{resultData.score}/100</span>
                    </div>
                    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Accuracy rate</span>
                      <span className="text-lg font-black text-emerald-400">{resultData.accuracy}%</span>
                    </div>
                    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Code Quality</span>
                      <span className="text-lg font-black text-violet-400">{resultData.quality}%</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-400">Complexity evaluated:</span>
                    <p className="font-mono text-slate-200">{resultData.complexity}</p>
                  </div>
                </div>

                {/* AI Review detail breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                    <span className="text-[10px] font-black uppercase text-emerald-400 block tracking-widest">💪 Strengths</span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-350">
                      {resultData.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                    </ul>
                  </div>

                  <div className="p-5 rounded-3xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                    <span className="text-[10px] font-black uppercase text-rose-400 block tracking-widest">⏳ Optimization Points</span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-355">
                      {resultData.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)}
                    </ul>
                  </div>
                </div>

              </div>

              {/* AI Recommendations sidebar panel */}
              <div className="p-5 rounded-3xl bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] space-y-6">
                <div className="space-y-2 border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase text-violet-400 tracking-widest block">AI Mentor Feedback</span>
                  <p className="text-[11px] leading-relaxed text-slate-300">{resultData.feedback}</p>
                </div>

                {/* Badges and certificates rewards buttons */}
                <div className="space-y-3">
                  <button onClick={() => toast.success('Certificate download initialized!')} className="w-full py-2.5 bg-violet-650 hover:bg-violet-750 text-white rounded-xl text-[10px] uppercase font-black tracking-wider transition cursor-pointer font-sans font-bold">Download Certificate</button>
                  <button onClick={() => setView('dashboard')} className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] uppercase font-black tracking-wider transition cursor-pointer font-sans font-bold">Return to Arena</button>
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* VIEW 5: ADMIN CREATOR LOG PANEL */}
        {view === 'admin' && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">⚙️ Arena Administrator Panel</h3>
                <p className="text-xs text-[var(--db-text-muted)]">Configure prompts, audit contest profiles, and schedule events</p>
              </div>
              <button onClick={() => setView('dashboard')} className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl cursor-pointer">Exit Panel</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form creation constraints column */}
              <div className="lg:col-span-2 p-5 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl space-y-4">
                <span className="text-[10px] font-black uppercase text-white tracking-widest block font-sans font-bold">Add New Challenge Template</span>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTitle) return;
                  setCustomChallenges(prev => [...prev, { title: newTitle, difficulty: newDifficulty, category: newCategory, xp: newXp }]);
                  setNewTitle('');
                  toast.success(`Template "${newTitle}" created!`);
                }} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold block">Challenge Title</label>
                      <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="e.g. Reverse Binary Trees" className="w-full bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl px-3 py-2 text-white outline-none focus:border-violet-500" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-450 font-bold block">Category</label>
                      <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl p-2 text-white outline-none">
                        <option value="Algorithms">Algorithms</option>
                        <option value="Data Structures">Data Structures</option>
                        <option value="Database">Database</option>
                        <option value="Web Dev">Web Dev</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-450 font-bold block">Difficulty ELO</label>
                      <select value={newDifficulty} onChange={e => setNewDifficulty(e.target.value)} className="w-full bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl p-2 text-white outline-none">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-455 font-bold block">XP Allocation</label>
                      <input type="number" value={newXp} onChange={e => setNewXp(parseInt(e.target.value))} className="w-full bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl px-3 py-2 text-white outline-none focus:border-violet-500" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-violet-650 hover:bg-violet-750 text-white rounded-xl font-bold cursor-pointer transition">Commit Template</button>
                </form>
              </div>

              {/* Audit trail list logs column */}
              <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/5 space-y-4">
                <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-widest font-sans font-bold">Audit Trail Log</span>
                
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-[10px]">
                  {[
                    '✓ Custom template "Optimized Array Search" approved by evaluator',
                    '✓ Tournament "College Sprint July" scheduled for 2026-07-28',
                    '✓ Audit completed: no sandbox anomalies detected',
                    '✓ User "Rahul K." ELO updated (+45 ELO)'
                  ].map((log, idx) => (
                    <div key={idx} className="p-2 bg-white/2 rounded-lg border border-white/5 font-mono text-slate-350">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

