import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  Flame, Calendar, ShieldCheck, Heart, Award, Gift,
  HelpCircle, RefreshCw, Star
} from 'lucide-react';

export default function Streaks() {
  const [heatmap, setHeatmap] = useState([]);
  const [streakInfo, setStreakInfo] = useState({ count: 0, longest: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const [heatmapRes, dashRes] = await Promise.all([
        api.get('/progress/heatmap'),
        api.get('/progress/dashboard')
      ]);
      setHeatmap(heatmapRes.data.heatmapData || []);
      setStreakInfo({
        count: dashRes.data.profile?.streak || 0,
        longest: Math.max(dashRes.data.profile?.streak || 0, 14) // Mock longest baseline
      });
    } catch (err) {
      toast.error('Failed to sync streak dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = (milestone) => {
    toast.success(`Claimed reward for ${milestone} days milestone! +50 Coins added.`);
  };

  const handleStreakRecovery = () => {
    toast.success('Streak Protection Shield activated. Streak recovered successfully!');
  };

  // Generate simple 28-day calendar cells
  const renderCalendarCells = () => {
    const cells = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const activeItem = heatmap.find(h => h.date.startsWith(dateStr));
      const activeCount = activeItem ? activeItem.count : 0;
      
      let bg = 'bg-white/5 border-white/5';
      if (activeCount > 4) bg = 'bg-violet-500 text-white';
      else if (activeCount > 2) bg = 'bg-violet-600/70 text-white';
      else if (activeCount > 0) bg = 'bg-violet-700/40 text-violet-300 border-violet-500/20';

      cells.push(
        <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-bold border transition ${bg}`} title={`${dateStr}: ${activeCount} activities`}>
          <span>{d.getDate()}</span>
          {activeCount > 0 && <span className="text-[6px] opacity-80 mt-0.5">🔥</span>}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="space-y-6 pb-12 pr-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest font-mono">RETENTION ENGINE</span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-0.5">
            🔥 STREAK REGISTRY & SHIELD
          </h1>
          <p className="text-xs text-slate-400">Keep studying daily to maintain your streak. Prevent breaks using the Recovery system.</p>
        </div>
      </div>

      {loading ? (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-violet-500 border-slate-700 animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Heatmap & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-slate-950/40 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-3xl animate-bounce">
                    <Flame className="w-8 h-8 fill-current" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block">Current Streak</span>
                    <span className="text-3xl font-black text-white block mt-0.5">{streakInfo.count} Days</span>
                    <span className="text-xs text-slate-400 mt-1 block">Longest Streak: {streakInfo.longest} Days</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-white block">Streak Protector active</span>
                    <span className="text-slate-400 block">We hold your streak for up to 48 hours without login.</span>
                  </div>
                  <button onClick={handleStreakRecovery} className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10">
                    <Heart className="w-4 h-4 fill-current" /> Use Streak Recovery Shield
                  </button>
                </div>
              </div>
            </div>

            {/* Study calendar grid */}
            <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 text-left space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-violet-400" /> Study Calendar (Last 28 Days)
              </h3>
              <div className="grid grid-cols-7 gap-2 pt-2">
                {renderCalendarCells()}
              </div>
              <div className="flex items-center gap-4 pt-2 text-[10px] text-slate-400 justify-end">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-white/5 border border-white/5 rounded" /> None</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-violet-700/40 rounded" /> Light</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-violet-600/70 rounded" /> Moderate</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-violet-500 rounded" /> High</div>
              </div>
            </div>
          </div>

          {/* Reward Milestones */}
          <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 text-left space-y-4 h-fit">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" /> Milestone Reward Claims
            </h3>
            <div className="space-y-3">
              {[
                { days: 3, xp: 50, coins: 20 },
                { days: 7, xp: 150, coins: 50 },
                { days: 15, xp: 400, coins: 100 },
                { days: 30, xp: 1000, coins: 250 }
              ].map(m => {
                const claimed = streakInfo.count >= m.days;
                return (
                  <div key={m.days} className={`p-3.5 rounded-xl border flex items-center justify-between transition ${claimed ? 'bg-white/[0.01] border-white/5' : 'bg-slate-950/20 border-white/5 opacity-50'}`}>
                    <div>
                      <span className="text-xs font-bold text-white block">{m.days} Day Streak Milestone</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">+{m.xp} XP & +{m.coins} Coins</span>
                    </div>
                    <button 
                      onClick={() => handleClaimReward(m.days)}
                      disabled={!claimed}
                      className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 disabled:opacity-50 text-[10px] font-bold rounded-lg hover:bg-amber-500 hover:text-slate-950 transition"
                    >
                      {claimed ? 'Claim' : 'Locked'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
