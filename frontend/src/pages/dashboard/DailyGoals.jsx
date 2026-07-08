import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import MlPredictionCard from '../../components/MlPredictionCard';
import { 
  Plus, Trash2, Award, Sparkles, CheckCircle, Circle, 
  BarChart2, Star, CheckSquare, Edit3, Save, BookOpen, 
  Clock, Flame, ChevronRight, Zap, Target, Bookmark, 
  Calendar, Play, Pause, RotateCcw, AlertTriangle, HelpCircle, FileText
} from 'lucide-react';

// --- Lightweight Self-Contained Canvas Confetti Helper ---
class ConfettiEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.colors = ['#3B82F6', '#60A5FA', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
    this.active = false;
  }

  resize() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  start() {
    this.resize();
    this.particles = [];
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * this.canvas.height,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
        vy: Math.random() * 3 + 2,
        vx: Math.random() * 2 - 1
      });
    }
    if (!this.active) {
      this.active = true;
      this.animate();
    }
  }

  animate() {
    if (!this.active) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let remaining = false;

    this.particles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.tiltAngle) * 0.5;
      p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

      if (p.y <= this.canvas.height) {
        remaining = true;
      }

      this.ctx.beginPath();
      this.ctx.lineWidth = p.r / 2;
      this.ctx.strokeStyle = p.color;
      this.ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      this.ctx.stroke();
    });

    if (remaining) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.active = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

export default function DailyGoals() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const confettiRef = useRef(null);

  // --- Real Data States ---
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [goals, setGoals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mlPlanner, setMlPlanner] = useState(null);

  // --- UI & Animation States ---
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState('medium');

  // --- Focus Mode (Pomodoro) States ---
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [focusStats, setFocusStats] = useState({
    todayTime: 75, // in minutes
    completedSessions: 3,
    longestSession: 25,
    weeklyTime: 240
  });

  // --- Roadmap Complete Unlock States ---
  const [unlockedTopics, setUnlockedTopics] = useState({
    Python: ['Variables', 'Data Types', 'Operators', 'Loops'],
    Java: ['Syntax', 'OOP Basics', 'Exceptions'],
    DSA: ['Arrays', 'Linked Lists', 'Stacks']
  });

  // --- Load all real database data ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, analyticsRes, goalsRes, notesRes, mlPlannerRes] = await Promise.all([
        api.get('/progress/dashboard'),
        api.get('/progress/analytics'),
        api.get('/progress/goals'),
        api.get('/notes'),
        api.get('/predictions/modules/planner')
      ]);

      setProfile(dashRes.data.profile || {});
      setAnalytics(analyticsRes.data || {});
      setGoals(goalsRes.data || []);
      setNotes(notesRes.data || []);
      setMlPlanner(mlPlannerRes.data);
    } catch (err) {
      toast.error('Failed to sync learning dashboard metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (canvasRef.current && !confettiRef.current) {
      confettiRef.current = new ConfettiEffect(canvasRef.current);
    }
  }, [loading]);

  // --- Trigger Confetti ---
  const triggerConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }
  };

  // --- Goal Actions ---
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    try {
      const xpRewards = { low: 15, medium: 25, high: 45 };
      const { data } = await api.post('/progress/goals', {
        title: newGoalTitle,
        priority: newGoalPriority,
        xp_reward: xpRewards[newGoalPriority]
      });
      setGoals(prev => [data, ...prev]);
      setNewGoalTitle('');
      toast.success('Goal scheduled successfully.');
    } catch (err) {
      toast.error('Failed to register goal');
    }
  };

  const handleToggleGoal = async (id, currentCompleted) => {
    try {
      const { data } = await api.put(`/progress/goals/${id}`, {
        completed: !currentCompleted
      });
      setGoals(prev => prev.map(g => g.id === id ? data : g));
      if (data.completed) {
        toast.success(`Goal completed! +${data.xp_reward} XP awarded.`);
        triggerConfetti();
        // Update local XP
        if (profile) {
          setProfile(p => ({ ...p, xp: (p.xp || 0) + data.xp_reward }));
        }
      }
    } catch (err) {
      toast.error('Failed to toggle goal status');
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.delete(`/progress/goals/${id}`);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal removed.');
    } catch (err) {
      toast.error('Failed to clear goal');
    }
  };

  // --- Sticky Notes Actions ---
  const handleCreateNote = async () => {
    if (!noteTitle.trim()) {
      toast.error('Note title is required');
      return;
    }
    try {
      const { data } = await api.post('/notes', {
        title: noteTitle,
        content: noteContent
      });
      setNotes(prev => [data, ...prev]);
      setNoteTitle('');
      setNoteContent('');
      toast.success('Sticky Note saved!');
      if (profile) {
        setProfile(p => ({ ...p, xp: (p.xp || 0) + 10 }));
      }
    } catch (err) {
      toast.error('Failed to save note');
    }
  };

  const handleUpdateNote = async (id) => {
    try {
      const { data } = await api.put(`/notes/${id}`, {
        title: editTitle,
        content: editContent
      });
      setNotes(prev => prev.map(n => n.id === id ? data : n));
      setEditingNoteId(null);
      toast.success('Note updated!');
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  // --- Pomodoro Focus Timer Tick ---
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            // Completed focus session!
            setTimerActive(false);
            clearInterval(interval);
            toast.success('🍅 Focus session completed! Outstanding focus.');
            setFocusStats(prev => ({
              ...prev,
              todayTime: prev.todayTime + 25,
              weeklyTime: prev.weeklyTime + 25,
              completedSessions: prev.completedSessions + 1
            }));
            if (profile) {
              setProfile(p => ({ ...p, xp: (p.xp || 0) + 50 }));
            }
            triggerConfetti();
            setTimerMinutes(25);
          } else {
            setTimerMinutes(timerMinutes - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(timerSeconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerMinutes, timerSeconds]);

  // --- Auto-calculated metrics from real profile / db ---
  const studentName = profile?.name || 'Bharath';
  const currentStreak = profile?.streak || 18;
  const totalXP = profile?.xp || 1250;
  const overallProgressVal = analytics?.totalTopicsCount > 0 
    ? Math.round((analytics?.completedTopicsCount / analytics?.totalTopicsCount) * 100) 
    : 72;

  // --- Mission Completion calculation ---
  const completedMissions = goals.filter(g => g.completed).length;
  const totalMissions = goals.length || 4;
  const missionPercentage = Math.round((completedMissions / (totalMissions || 1)) * 100);

  // --- Navigation mapper to exact unfinished lesson ---
  const handleContinueLearning = () => {
    const defaultSlug = 'variables';
    if (analytics?.currentSubject === 'Advanced Java') {
      navigate('/advanced-java/course/' + (analytics?.currentTopicSlug || defaultSlug));
    } else if (analytics?.currentSubject === 'DSA') {
      navigate('/dsa/course/' + (analytics?.currentTopicSlug || defaultSlug));
    } else if (analytics?.currentSubject === 'Web Development') {
      navigate('/web-dev/course/' + (analytics?.currentTopicSlug || defaultSlug));
    } else {
      navigate('/python/course/' + (analytics?.currentTopicSlug || defaultSlug));
    }
  };

  // --- Unlock Next Topic Logic for Roadmaps ---
  const handleUnlockNext = (subject, nextTopic) => {
    if (unlockedTopics[subject].includes(nextTopic)) return;
    setUnlockedTopics(prev => ({
      ...prev,
      [subject]: [...prev[subject], nextTopic]
    }));
    toast.success(`🎉 Unlocked Topic: ${nextTopic} in ${subject}!`);
    if (profile) {
      setProfile(p => ({ ...p, xp: (p.xp || 0) + 30 }));
    }
    triggerConfetti();
  };

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-slate-700 animate-spin" />
        <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 animate-pulse">Initializing Learning Command Center...</span>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 pb-16 pr-2 text-left">
      {/* Canvas Layer for Confetti */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-50" />

      {/* ================= SECTION 1: WELCOME HERO ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border p-6 md:p-8 shadow-sm"
        style={{ backgroundColor: 'var(--db-continue-bg)', borderColor: 'var(--db-continue-border)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest font-mono px-2.5 py-1 rounded-full border" style={{ backgroundColor: 'var(--db-badge-bg)', borderColor: 'var(--db-badge-border)', color: 'var(--db-badge-text)' }}>SYSTEM ACCESS ACTIVE</span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3" style={{ color: 'var(--db-text-main)' }}>
                Good Morning, {studentName} 👋
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--db-text-muted)' }}>Ready to step into your study center? Excellent productivity signals detected.</p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3.5 border rounded-2xl" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
                <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--db-text-muted)' }}>Today's Goal</span>
                <span className="text-sm font-bold mt-0.5 block" style={{ color: 'var(--db-text-main)' }}>Study 4 Hours</span>
              </div>
              <div className="p-3.5 border rounded-2xl" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
                <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--db-text-muted)' }}>Current Streak</span>
                <span className="text-sm font-bold mt-0.5 block flex items-center gap-1" style={{ color: 'var(--db-amber-accent)' }}>
                  {currentStreak} Days 🔥
                </span>
              </div>
              <div className="p-3.5 border rounded-2xl" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
                <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--db-text-muted)' }}>Overall Progress</span>
                <span className="text-sm font-bold mt-0.5 block" style={{ color: 'var(--db-text-main)' }}>{overallProgressVal}%</span>
              </div>
              <div className="p-3.5 border rounded-2xl" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
                <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--db-text-muted)' }}>System Level</span>
                <span className="text-sm font-bold mt-0.5 block" style={{ color: 'var(--db-text-accent)' }}>Level 12 (1,850 XP)</span>
              </div>
            </div>

            <button
              onClick={handleContinueLearning}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold tracking-wide transition duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> Continue Learning
            </button>
          </div>

          {/* Reward Alert */}
          <div className="p-5 rounded-2xl border space-y-3 w-full lg:w-80" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-xl">🏆</div>
              <div>
                <span className="text-[10px] block uppercase tracking-wider" style={{ color: 'var(--db-text-muted)' }}>Next Reward Target</span>
                <span className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>Python Explorer Badge</span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '82%' }} />
            </div>
            <div className="flex justify-between text-[9px] font-bold" style={{ color: 'var(--db-text-muted)' }}>
              <span>82% COMPLETE</span>
              <span>120 XP TO UNLOCK</span>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Main Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8-wide) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ================= SECTION 2: CONTINUE LEARNING ================= */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
              <BookOpen className="w-5 h-5 text-blue-500" /> Continue Learning
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Python */}
              <div className="p-5 rounded-2xl border transition-all duration-300 group text-left flex flex-col justify-between h-52" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🐍</span>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: 'var(--db-text-main)' }}>Python Development</h3>
                      <span className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Current Topic: Functions</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Easy</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs" style={{ color: 'var(--db-text-secondary)' }}>
                    <span>Progress</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '65%' }} />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--db-text-muted)' }}><Clock className="w-3.5 h-3.5" /> 30 Mins remaining</span>
                  <button 
                    onClick={() => navigate('/python/course/variables')}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    Continue <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 2: Advanced Java */}
              <div className="p-5 rounded-2xl border transition-all duration-300 group text-left flex flex-col justify-between h-52" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">☕</span>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: 'var(--db-text-main)' }}>Advanced Java</h3>
                      <span className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Current Topic: Collections</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs" style={{ color: 'var(--db-text-secondary)' }}>
                    <span>Progress</span>
                    <span>40%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--db-text-muted)' }}><Clock className="w-3.5 h-3.5" /> 45 Mins remaining</span>
                  <button 
                    onClick={() => navigate('/advanced-java/course/generics')}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    Continue <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </section>


          {/* ================= SECTION 3: TODAY'S MISSION ================= */}
          <section className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
                  <Target className="w-5 h-5 text-blue-500" /> Today's Learning Mission
                </h2>
                <p className="text-[11px]" style={{ color: 'var(--db-text-muted)' }}>Complete tasks daily to accumulate XP multipliers and trigger streak protection.</p>
              </div>
              <span className="text-sm font-extrabold" style={{ color: 'var(--db-text-accent)' }}>{missionPercentage}% Complete</span>
            </div>

            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
              <div className="bg-blue-500 h-full rounded-full transition-all duration-700" style={{ width: `${missionPercentage}%` }} />
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {goals.map(item => (
                <div 
                  key={item.id} 
                  className={`p-3 border rounded-xl flex items-center justify-between transition ${item.completed ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleGoal(item.id, item.completed)} 
                      className="transition cursor-pointer"
                      style={{ color: 'var(--db-text-muted)' }}
                    >
                      {item.completed ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div>
                      <span className={`text-xs font-semibold block ${item.completed ? 'line-through' : ''}`} style={{ color: item.completed ? 'var(--db-text-muted)' : 'var(--db-text-main)' }}>
                        {item.title}
                      </span>
                      <span className="text-[9px] capitalize" style={{ color: 'var(--db-text-muted)' }}>{item.priority} Priority • +{item.xp_reward} XP</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteGoal(item.id)} className="hover:text-rose-400 transition cursor-pointer" style={{ color: 'var(--db-text-muted)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Manual creation form */}
            <form onSubmit={handleCreateGoal} className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--db-card-border)' }}>
              <input 
                type="text" 
                value={newGoalTitle} 
                onChange={e => setNewGoalTitle(e.target.value)} 
                placeholder="Create new daily mission..."
                className="flex-1 border rounded-xl px-4 py-2 text-xs transition"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-input-border)', color: 'var(--db-text-main)' }}
              />
              <select
                value={newGoalPriority}
                onChange={e => setNewGoalPriority(e.target.value)}
                className="border rounded-xl px-3 text-xs focus:outline-none focus:border-blue-500"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-input-border)', color: 'var(--db-text-main)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </section>


          {/* ================= SECTION 4: AI MENTOR ================= */}
          <section className="p-6 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h2 className="text-base font-extrabold" style={{ color: 'var(--db-text-main)' }}>AI Mentor Guidance</h2>
                  <span className="text-[10px] text-blue-400 font-mono">ADAPTIVE LEARNING NETWORK</span>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>

            <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
              <p className="text-xs leading-relaxed text-left" style={{ color: 'var(--db-text-secondary)' }}>
                Yesterday you completed <strong style={{ color: 'var(--db-text-main)' }}>Python Variables</strong>. Today I recommend proceeding to <strong style={{ color: 'var(--db-text-main)' }}>Python Data Types</strong>. This topic naturally builds on the variable instantiation knowledge you demonstrated.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold animate-pulse" style={{ color: 'var(--db-text-muted)' }}>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Est. Time: 35 Minutes</span>
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-yellow-500" /> Difficulty: ⭐⭐☆☆☆</span>
              </div>
            </div>

            {/* Smart Notification Blocks based on state */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-amber-400 block uppercase">Exam Approaches</span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--db-text-muted)' }}>DSA Quiz starts in 3 days. Revise Binary Search Trees before proceeding.</p>
                </div>
              </div>
              <div className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl flex gap-2.5 items-start">
                <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-violet-400 block uppercase">Streak Protection</span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--db-text-muted)' }}>Complete a 25-minute Pomodoro session now to shield streak multipliers.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 justify-start pt-2">
              <button 
                onClick={() => navigate('/python/course/variables')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Start Learning
              </button>
              <button className="px-4 py-2 border rounded-xl text-xs font-bold transition" style={{ backgroundColor: 'var(--db-btn-secondary-bg)', borderColor: 'var(--db-card-border)', color: 'var(--db-text-secondary)' }}>
                Later
              </button>
            </div>
          </section>


          {/* ================= SECTION 5: TODAY'S TIMELINE ================= */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
              <Calendar className="w-5 h-5 text-blue-500" /> Today's Learning Timeline
            </h2>
            <div className="relative pl-6 border-l space-y-6" style={{ borderColor: 'var(--db-card-border)' }}>
              <div className="relative">
                <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white">✓</span>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>09:00 - Python Variables</span>
                    <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Core declarations, scoping, and constant models.</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Completed</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white">⏱</span>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>11:00 - Java Collections</span>
                    <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>ArrayList, LinkedList, and Set hierarchy comparison.</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase">Upcoming</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-400">•</span>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>14:00 - DSA Binary Search</span>
                    <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Divide-and-conquer strategy, time complexity analysis.</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>Pending</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-400">•</span>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>17:00 - Weekly Revision Block</span>
                    <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Review notes and unlock practice challenges.</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>Upcoming</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (4-wide) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* ================= SECTION 6: UPCOMING DELIVERABLES ================= */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
              <Clock className="w-5 h-5 text-blue-500" /> Upcoming
            </h2>
            <div className="space-y-3">
              {/* Urgent Item 1 */}
              <div className="p-4 rounded-2xl border text-left space-y-2" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>Java Threading Assignment</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">1 Day Left</span>
                </div>
                <div className="flex justify-between text-[10px]" style={{ color: 'var(--db-text-muted)' }}>
                  <span>Priority: High</span>
                  <span>Progress: 80%</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '80%' }} />
                </div>
                <button 
                  onClick={() => navigate('/practice-hub')}
                  className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  Complete Lab
                </button>
              </div>

              {/* Item 2 */}
              <div className="p-4 rounded-2xl border text-left space-y-2" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>Linear Algebra Project</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-500/10 border" style={{ color: 'var(--db-text-muted)', borderColor: 'var(--db-card-border)' }}>5 Days Left</span>
                </div>
                <div className="flex justify-between text-[10px]" style={{ color: 'var(--db-text-muted)' }}>
                  <span>Priority: Medium</span>
                  <span>Progress: 30%</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '30%' }} />
                </div>
                <button 
                  onClick={() => navigate('/subjects')}
                  className="w-full py-1.5 border rounded-lg text-[10px] font-bold transition cursor-pointer"
                  style={{ backgroundColor: 'var(--db-btn-secondary-bg)', borderColor: 'var(--db-card-border)', color: 'var(--db-text-secondary)' }}
                >
                  Open Project
                </button>
              </div>
            </div>
          </section>

          {/* ================= ML PLANNER PREDICTIONS ================= */}
          <MlPredictionCard
            title="ML Study Schedule Forecast"
            loading={!mlPlanner}
            confidence={mlPlanner?.confidence}
            modelVersion={mlPlanner?.modelVersion}
            lastUpdated={mlPlanner?.lastUpdated}
            icon="📅"
          >
            <div className="space-y-3.5 text-xs text-left">
              <div className="flex justify-between items-center border-b pb-1.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#94a3b8' }}>Best Study Time</span>
                <span className="font-bold text-white">{mlPlanner?.prediction?.bestStudyTime || '09:00 - 11:00 AM'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-1.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#94a3b8' }}>Daily Hours Goal</span>
                <span className="font-bold text-blue-400">{mlPlanner?.prediction?.dailyStudyHoursGoal || '4'} Hours</span>
              </div>
              <div className="flex justify-between items-center border-b pb-1.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#94a3b8' }}>Break Interval</span>
                <span className="font-bold text-amber-500">{mlPlanner?.prediction?.breakTiming || '5m every 25m'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-1.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#94a3b8' }}>Exam Readiness</span>
                <span className="font-extrabold text-emerald-400">{mlPlanner?.prediction?.examReadiness || '82'}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#94a3b8' }}>Goal Target Date</span>
                <span className="font-bold text-white">{mlPlanner?.prediction?.goalCompletionDate || '7/20/2026'}</span>
              </div>
            </div>
          </MlPredictionCard>

          {/* ================= SECTION 7: FOCUS MODE ================= */}
          <section className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
              ⏱ Focus Mode (Pomodoro)
            </h2>
            <div className="text-center py-6 space-y-4">
              <span className="text-4xl font-extrabold tracking-widest font-mono block" style={{ color: 'var(--db-text-main)' }}>
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </span>
              <div className="flex justify-center gap-2.5">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  {timerActive ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerMinutes(25);
                    setTimerSeconds(0);
                  }}
                  className="px-4 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  style={{ backgroundColor: 'var(--db-btn-secondary-bg)', borderColor: 'var(--db-card-border)', color: 'var(--db-text-secondary)' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Focus Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: 'var(--db-card-border)' }}>
              <div className="p-2 rounded-xl text-center" style={{ backgroundColor: 'var(--db-inner-card)' }}>
                <span className="text-[10px] uppercase block" style={{ color: 'var(--db-text-muted)' }}>Today's Focus</span>
                <span className="text-xs font-bold mt-0.5 block" style={{ color: 'var(--db-text-main)' }}>{focusStats.todayTime}m</span>
              </div>
              <div className="p-2 rounded-xl text-center" style={{ backgroundColor: 'var(--db-inner-card)' }}>
                <span className="text-[10px] uppercase block" style={{ color: 'var(--db-text-muted)' }}>Sessions Completed</span>
                <span className="text-xs font-bold mt-0.5 block" style={{ color: 'var(--db-text-main)' }}>{focusStats.completedSessions}</span>
              </div>
            </div>
          </section>


          {/* ================= SECTION 8: LEARNING PROGRESS ================= */}
          <section className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
              <BarChart2 className="w-5 h-5 text-blue-500" /> Learning Progress
            </h2>
            <div className="space-y-3.5 text-left">
              {/* Python */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--db-text-main)' }}>Python</span>
                  <span className="text-blue-400">80% Completion</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
              {/* Java */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--db-text-main)' }}>Java</span>
                  <span className="text-amber-500">60% Completion</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
              {/* C# */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--db-text-main)' }}>C# Development</span>
                  <span className="text-purple-400">90% Completion</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
              {/* DSA */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--db-text-main)' }}>Data Structures</span>
                  <span className="text-emerald-400">45% Completion</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-border)' }}>
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>


      {/* ================= SECTION 9: LEARNING ROADMAPS ================= */}
      <section className="p-6 rounded-3xl border space-y-6" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            🛣 Personalized Learning Roadmaps
          </h2>
          <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Complete topics sequentially. Click upcoming nodes to request immediate unlock validation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Subject 1: Python */}
          <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-xs font-bold block" style={{ color: 'var(--db-text-main)' }}>🐍 Python Roadmap</span>
            <div className="space-y-2">
              {[
                { name: 'Variables', type: 'Variables' },
                { name: 'Data Types', type: 'Data Types' },
                { name: 'Operators', type: 'Operators' },
                { name: 'Loops', type: 'Loops' },
                { name: 'Functions', type: 'Functions' },
                { name: 'OOP', type: 'OOP' }
              ].map((topic, i) => {
                const isUnlocked = unlockedTopics.Python.includes(topic.type);
                const isNext = !isUnlocked && (i === unlockedTopics.Python.length);

                return (
                  <div 
                    key={topic.name}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all duration-300 ${isUnlocked ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : isNext ? 'bg-white/5 border-white/10 cursor-pointer hover:border-blue-500' : 'bg-transparent text-slate-600'}`}
                    style={{ borderColor: isUnlocked ? 'rgba(59, 130, 246, 0.2)' : 'var(--db-card-border)' }}
                    onClick={() => isNext && handleUnlockNext('Python', topic.type)}
                  >
                    <span style={{ color: isUnlocked ? '' : isNext ? 'var(--db-text-main)' : 'var(--db-text-muted)' }}>{topic.name}</span>
                    <span className="text-[10px] font-bold" style={{ color: isUnlocked ? '' : isNext ? 'var(--db-text-main)' : 'var(--db-text-muted)' }}>
                      {isUnlocked ? '✓ Active' : isNext ? '🔓 Unlock' : '🔒 Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject 2: Java */}
          <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-xs font-bold block" style={{ color: 'var(--db-text-main)' }}>☕ Java Roadmap</span>
            <div className="space-y-2">
              {[
                { name: 'Syntax', type: 'Syntax' },
                { name: 'OOP Basics', type: 'OOP Basics' },
                { name: 'Exceptions', type: 'Exceptions' },
                { name: 'Collections', type: 'Collections' },
                { name: 'Multithreading', type: 'Multithreading' }
              ].map((topic, i) => {
                const isUnlocked = unlockedTopics.Java.includes(topic.type);
                const isNext = !isUnlocked && (i === unlockedTopics.Java.length);

                return (
                  <div 
                    key={topic.name}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all duration-300 ${isUnlocked ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : isNext ? 'bg-white/5 border-white/10 cursor-pointer hover:border-amber-500' : 'bg-transparent text-slate-600'}`}
                    style={{ borderColor: isUnlocked ? 'rgba(245, 158, 11, 0.2)' : 'var(--db-card-border)' }}
                    onClick={() => isNext && handleUnlockNext('Java', topic.type)}
                  >
                    <span style={{ color: isUnlocked ? '' : isNext ? 'var(--db-text-main)' : 'var(--db-text-muted)' }}>{topic.name}</span>
                    <span className="text-[10px] font-bold" style={{ color: isUnlocked ? '' : isNext ? 'var(--db-text-main)' : 'var(--db-text-muted)' }}>
                      {isUnlocked ? '✓ Active' : isNext ? '🔓 Unlock' : '🔒 Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject 3: DSA */}
          <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-xs font-bold block" style={{ color: 'var(--db-text-main)' }}>📊 Data Structures Roadmap</span>
            <div className="space-y-2">
              {[
                { name: 'Arrays', type: 'Arrays' },
                { name: 'Linked Lists', type: 'Linked Lists' },
                { name: 'Stacks', type: 'Stacks' },
                { name: 'Queues', type: 'Queues' },
                { name: 'Sorting', type: 'Sorting' },
                { name: 'Trees', type: 'Trees' }
              ].map((topic, i) => {
                const isUnlocked = unlockedTopics.DSA.includes(topic.type);
                const isNext = !isUnlocked && (i === unlockedTopics.DSA.length);

                return (
                  <div 
                    key={topic.name}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all duration-300 ${isUnlocked ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : isNext ? 'bg-white/5 border-white/10 cursor-pointer hover:border-emerald-500' : 'bg-transparent text-slate-600'}`}
                    style={{ borderColor: isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'var(--db-card-border)' }}
                    onClick={() => isNext && handleUnlockNext('DSA', topic.type)}
                  >
                    <span style={{ color: isUnlocked ? '' : isNext ? 'var(--db-text-main)' : 'var(--db-text-muted)' }}>{topic.name}</span>
                    <span className="text-[10px] font-bold" style={{ color: isUnlocked ? '' : isNext ? 'var(--db-text-main)' : 'var(--db-text-muted)' }}>
                      {isUnlocked ? '✓ Active' : isNext ? '🔓 Unlock' : '🔒 Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* ================= SECTION 10: XP, LEVELS & BADGES ================= */}
      <section className="p-6 rounded-3xl border space-y-6" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            🏆 Gamification Center
          </h2>
          <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Monitor XP progression multipliers and active status achievements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-4 rounded-2xl border text-left space-y-2" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-[10px] uppercase tracking-widest font-mono" style={{ color: 'var(--db-text-muted)' }}>GAMIFICATION STATS</span>
            <div className="space-y-1">
              <span className="text-2xl font-bold block mt-1" style={{ color: 'var(--db-text-main)' }}>{totalXP} XP</span>
              <span className="text-xs font-semibold text-blue-400 block">Level 12 Learner</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden mt-3" style={{ backgroundColor: 'var(--db-input-border)' }}>
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '74%' }} />
            </div>
            <span className="text-[9px]" style={{ color: 'var(--db-text-muted)' }}>650 XP required to hit Level 13</span>
          </div>

          <div className="p-4 rounded-2xl border text-left space-y-2" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-[10px] uppercase tracking-widest font-mono" style={{ color: 'var(--db-text-muted)' }}>WEEKLY CHALLENGE</span>
            <div className="space-y-1.5">
              <span className="text-xs font-bold block mt-1" style={{ color: 'var(--db-text-main)' }}>Complete 10 Focus Blocks</span>
              <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Complete focus timers to secure the special Focus Pioneer Badge.</p>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden mt-3" style={{ backgroundColor: 'var(--db-input-border)' }}>
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '30%' }} />
            </div>
            <span className="text-[9px]" style={{ color: 'var(--db-text-muted)' }}>3 / 10 focus sessions complete</span>
          </div>

          <div className="p-4 rounded-2xl border text-left space-y-3" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-[10px] uppercase tracking-widest font-mono block" style={{ color: 'var(--db-text-muted)' }}>ACHIEVEMENTS</span>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400">🔥 18d Streak</span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400">🐍 Python Pioneer</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">⚡ Code Speedster</span>
            </div>
          </div>
        </div>
      </section>


      {/* ================= SECTION 11: QUICK STICKY NOTES ================= */}
      <section className="p-6 rounded-3xl border space-y-6" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
              📝 Sticky Notes
            </h2>
            <p className="text-xs font-mono" style={{ color: 'var(--db-text-muted)' }}>SYNCED MEMORY LAYER</p>
          </div>
        </div>

        {/* Creation card */}
        <div className="p-4 rounded-2xl border space-y-3 text-left" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note Title..."
            className="w-full border rounded-xl px-4 py-2.5 text-xs font-bold transition"
            style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-input-border)', color: 'var(--db-text-main)' }}
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Revision notes, ideas, questions..."
            rows="3"
            className="w-full border rounded-xl px-4 py-2.5 text-xs transition resize-none"
            style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-input-border)', color: 'var(--db-text-main)' }}
          />
          <div className="flex justify-end">
            <button
              onClick={handleCreateNote}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Sticky Note
            </button>
          </div>
        </div>

        {/* Notes list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {notes.map(note => {
            const isEditing = editingNoteId === note.id;

            return (
              <div 
                key={note.id} 
                className="p-4 rounded-2xl border flex flex-col justify-between space-y-3 relative group"
                style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}
              >
                {isEditing ? (
                  <div className="space-y-2 text-left">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1 text-xs"
                      style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-input-border)', color: 'var(--db-text-main)' }}
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1 text-xs resize-none"
                      style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-input-border)', color: 'var(--db-text-main)' }}
                      rows="2"
                    />
                    <div className="flex gap-1.5 justify-end">
                      <button 
                        onClick={() => handleUpdateNote(note.id)}
                        className="p-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingNoteId(null)}
                        className="p-1 border rounded-lg text-[10px] font-bold"
                        style={{ backgroundColor: 'var(--db-btn-secondary-bg)', borderColor: 'var(--db-card-border)', color: 'var(--db-text-secondary)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-left space-y-1.5">
                    <h3 className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>{note.title}</h3>
                    <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--db-text-secondary)' }}>{note.content}</p>
                    <span className="text-[8px] block pt-1" style={{ color: 'var(--db-text-muted)' }}>
                      {new Date(note.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t pt-2" style={{ borderColor: 'var(--db-card-border)' }}>
                  <button 
                    onClick={() => {
                      setEditingNoteId(note.id);
                      setEditTitle(note.title);
                      setEditContent(note.content);
                    }} 
                    className="hover:text-white transition cursor-pointer"
                    style={{ color: 'var(--db-text-muted)' }}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteNote(note.id)} 
                    className="hover:text-rose-400 transition cursor-pointer"
                    style={{ color: 'var(--db-text-muted)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* ================= SECTION 12: DAILY SUMMARY ================= */}
      <section className="p-6 rounded-3xl border space-y-6" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            🌙 Daily Summary Report
          </h2>
          <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>System intelligence overview of performance, XP harvest, and next focus recommendation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 border rounded-2xl" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-[10px] uppercase block font-mono" style={{ color: 'var(--db-text-muted)' }}>Hours Studied</span>
            <span className="text-xl font-bold block mt-1" style={{ color: 'var(--db-text-main)' }}>4.2 Hours</span>
          </div>

          <div className="p-4 border rounded-2xl" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-[10px] uppercase block font-mono" style={{ color: 'var(--db-text-muted)' }}>Productivity Score</span>
            <span className="text-xl font-bold text-emerald-400 block mt-1">Excellent (94%)</span>
          </div>

          <div className="p-4 border rounded-2xl" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-[10px] uppercase block font-mono" style={{ color: 'var(--db-text-muted)' }}>XP Earned Today</span>
            <span className="text-xl font-bold text-blue-400 block mt-1">+{completedMissions * 25 + 50} XP</span>
          </div>

          <div className="p-4 border rounded-2xl" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
            <span className="text-[10px] uppercase block font-mono" style={{ color: 'var(--db-text-muted)' }}>Focus Blocks</span>
            <span className="text-xl font-bold block mt-1" style={{ color: 'var(--db-text-main)' }}>{focusStats.completedSessions} Blocks</span>
          </div>
        </div>

        {/* AI feedback recommendation */}
        <div className="p-4 rounded-2xl border text-left space-y-2" style={{ backgroundColor: 'var(--db-inner-card)', borderColor: 'var(--db-card-border)' }}>
          <span className="text-[9px] text-blue-400 font-extrabold uppercase font-mono tracking-wider">AI feedback</span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--db-text-secondary)' }}>
            Excellent consistency today! You completed Python Variables and active focus blocks. Tomorrow, prioritize completing <strong style={{ color: 'var(--db-text-main)' }}>Python Data Types</strong> and finishing your <strong style={{ color: 'var(--db-text-main)' }}>Java Threading Assignment</strong>.
          </p>
        </div>
      </section>

    </div>
  );
}
