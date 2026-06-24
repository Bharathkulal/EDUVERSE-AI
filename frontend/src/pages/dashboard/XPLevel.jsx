import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  Award, Zap, Shield, Star, Crown, ChevronRight, 
  History, Calendar, Gift, Lock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function XPLevel() {
  const [timeline, setTimeline] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const [timelineRes, leaderboardRes, dashRes] = await Promise.all([
        api.get('/progress/xp-timeline'),
        api.get('/progress/leaderboard'),
        api.get('/progress/dashboard')
      ]);
      setTimeline(timelineRes.data.timeline || []);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
      setUserRank(leaderboardRes.data.currentUserRank);
      setProfile(dashRes.data.profile || null);
    } catch (err) {
      toast.error('Failed to sync gamification metrics');
    } finally {
      setLoading(false);
    }
  };

  const totalXP = profile?.xp || 0;
  const computedLevel = Math.max(1, Math.floor((profile?.study_hours || 0) * 2.5 + (profile?.completed_topics || 0) * 1.5));
  const xpNeeded = computedLevel * 1000;
  const levelMinXp = (computedLevel - 1) * 1000;
  const relativeXp = totalXP - levelMinXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((relativeXp / 1000) * 100)));

  // Mock rewards system
  const badges = [
    { title: 'Algo Pioneer', desc: 'Solved 10 DSA arrays questions', points: '100 XP', unlocked: totalXP > 200, icon: '🛡️' },
    { title: 'Streak Champion', desc: 'Maintained a 7-day study streak', points: '250 XP', unlocked: (profile?.streak || 0) >= 7, icon: '🔥' },
    { title: 'Quiz Master', desc: 'Scored 100% on any quiz', points: '150 XP', unlocked: totalXP > 500, icon: '🏆' },
    { title: 'Platform Veteran', desc: 'Accumulated over 2000 XP', points: '500 XP', unlocked: totalXP >= 2000, icon: '👑' }
  ];

  return (
    <div className="space-y-6 pb-12 pr-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest font-mono">GAMIFICATION PROTOCOLS</span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-0.5">
            🏆 LEVEL & XP ARENA
          </h1>
          <p className="text-xs text-slate-400">Track level metrics, view leaderboard standing, and claim performance badges.</p>
        </div>
      </div>

      {loading ? (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-violet-500 border-slate-700 animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* XP & Level progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level status card */}
            <div className="p-6 rounded-2xl border border-white/5 bg-slate-950/40 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-[60px] pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Current Standing</span>
                  <h3 className="text-3xl font-black text-white">Level {computedLevel}</h3>
                  <p className="text-xs text-slate-400">Accumulate XP through quizzes and challenges to advance.</p>
                </div>
                <div className="p-3.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-2xl flex items-center gap-1.5 font-bold">
                  <Crown className="w-5 h-5 text-violet-400" /> #{userRank || 'N/A'} Rank
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>{totalXP} / {xpNeeded} XP</span>
                  <span>{progressPercent}% completed</span>
                </div>
                <div className="w-full h-3 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-750" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* XP Chart */}
            <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 text-left space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-violet-400" /> XP Growth History (30 Days)
              </h3>
              <div className="h-48 w-full pt-4">
                {timeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline}>
                      <defs>
                        <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#4b5563" fontSize={9} tickLine={false} />
                      <YAxis stroke="#4b5563" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#09090b', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 11 }} />
                      <Area type="monotone" dataKey="cumulativeXp" stroke="#a78bfa" fillOpacity={1} fill="url(#xpGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                    Earn XP to build your activity graph.
                  </div>
                )}
              </div>
            </div>

            {/* Badges system */}
            <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 text-left space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Achievement Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((b, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border flex items-center gap-3.5 ${b.unlocked ? 'bg-white/[0.01] border-white/5' : 'bg-slate-950/20 border-white/5 opacity-50'}`}>
                    <span className="text-2xl">{b.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white block">{b.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{b.desc}</span>
                    </div>
                    <span className="text-[10px] font-bold text-violet-400">{b.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboards */}
          <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 text-left space-y-4 h-fit">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-violet-400" /> Leaderboard Standing
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {leaderboard.map(r => (
                <div key={r.rank} className={`flex items-center justify-between p-2.5 rounded-xl border ${r.isCurrentUser ? 'bg-violet-500/10 border-violet-500/20' : 'bg-white/[0.01] border-white/5'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-mono font-bold w-4 text-center ${r.rank <= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                    </span>
                    <div className="min-w-0 text-left">
                      <span className="text-xs font-semibold text-white block truncate">{r.name}</span>
                      <span className="text-[9px] text-slate-500 block">🔥 {r.streak} days</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-violet-400 shrink-0">{r.totalXp} XP</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-slate-500 text-xs italic text-center py-6">No candidates in ranking arena.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
