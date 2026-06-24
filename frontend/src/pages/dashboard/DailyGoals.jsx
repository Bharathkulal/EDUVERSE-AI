import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  Plus, Trash2, Award, Sparkles, CheckCircle, Circle, 
  BarChart2, Star, CheckSquare
} from 'lucide-react';

export default function DailyGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/progress/goals');
      setGoals(data);
    } catch (err) {
      toast.error('Failed to sync goals dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const xpRewards = { low: 15, medium: 25, high: 45 };
      const { data } = await api.post('/progress/goals', {
        title: newTitle,
        priority: newPriority,
        xp_reward: xpRewards[newPriority]
      });
      setGoals(prev => [data, ...prev]);
      setNewTitle('');
      toast.success('Goal scheduled successfully.');
    } catch (err) {
      toast.error('Failed to register goal');
    } finally {
      setSubmitting(false);
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
      } else {
        toast.success('Goal status reset.');
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

  const handleAIGenerate = async () => {
    setGeneratingAI(true);
    try {
      const { data } = await api.post('/progress/goals/ai-generate');
      setGoals(prev => [...data.goals, ...prev]);
      toast.success('AI Goal Matrix generated and synced!');
    } catch (err) {
      toast.error('Failed to invoke AI recommendations');
    } finally {
      setGeneratingAI(false);
    }
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalXPEarned = goals.filter(g => g.completed).reduce((sum, g) => sum + g.xp_reward, 0);

  return (
    <div className="space-y-6 pb-12 pr-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest font-mono">GAMIFICATION ENGINE</span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-0.5">
            🎯 DAILY MISSION CONTRACTS
          </h1>
          <p className="text-xs text-slate-400">Complete tasks daily to accumulate XP multipliers and trigger streak protection.</p>
        </div>
        <button 
          onClick={handleAIGenerate}
          disabled={generatingAI}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 animate-pulse" /> {generatingAI ? 'AI Generating...' : 'Generate AI Daily Goals'}
        </button>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="friday-cyber-card p-4 text-left flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Goal Analytics</span>
            <span className="text-lg font-bold text-white block mt-0.5">{completedCount} / {totalCount} completed</span>
          </div>
        </div>

        <div className="friday-cyber-card p-4 text-left flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">XP Harvested</span>
            <span className="text-lg font-bold text-emerald-400 block mt-0.5">+{totalXPEarned} XP today</span>
          </div>
        </div>

        <div className="friday-cyber-card p-4 text-left flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Efficiency Score</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
              </div>
              <span className="text-xs font-bold text-white shrink-0">{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Creation panel */}
        <div className="friday-cyber-card p-5 text-left space-y-4 h-fit">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Schedule New Goal</h3>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Solve Binary Search tree problem"
                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority Level</label>
              <select 
                value={newPriority}
                onChange={e => setNewPriority(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition"
              >
                <option value="low">Low Priority (+15 XP)</option>
                <option value="medium">Medium Priority (+25 XP)</option>
                <option value="high">High Priority (+45 XP)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={submitting || !newTitle.trim()}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Goal
            </button>
          </form>
        </div>

        {/* Goals List */}
        <div className="friday-cyber-card lg:col-span-2 p-5 text-left space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Goals</h3>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-6 h-6 border-2 border-t-violet-500 border-slate-700 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              <AnimatePresence>
                {goals.map(g => {
                  const getPriorityTag = (p) => {
                    switch (p) {
                      case 'high':
                        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                      case 'medium':
                        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                      default:
                        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                    }
                  };
                  return (
                    <motion.div 
                      key={g.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-center justify-between p-3.5 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-xl transition ${g.completed ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => handleToggleGoal(g.id, g.completed)} className="text-slate-400 hover:text-white transition">
                          {g.completed ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold text-white block ${g.completed ? 'line-through text-slate-500' : ''}`}>
                            {g.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${getPriorityTag(g.priority)}`}>
                              {g.priority}
                            </span>
                            <span className="text-[9px] text-slate-500">+{g.xp_reward} XP</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteGoal(g.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {goals.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  <Star className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  <p className="text-xs">No active daily goals set. Generate AI recommendations above!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
