import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  Play, BookOpen, CheckCircle, Code, ShieldCheck, Sparkles,
  ArrowRight, AlertCircle, HelpCircle
} from 'lucide-react';

export default function QuickContinue() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [roadmapProgress, setRoadmapProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContinueDetails();
  }, []);

  const fetchContinueDetails = async () => {
    try {
      setLoading(true);
      const [analyticsRes, roadmapRes] = await Promise.all([
        api.get('/progress/analytics'),
        api.get('/progress/roadmap/progress')
      ]);
      setAnalytics(analyticsRes.data);
      setRoadmapProgress(roadmapRes.data);
    } catch (err) {
      toast.error('Failed to sync learning resume state');
    } finally {
      setLoading(false);
    }
  };

  const currentSubject = analytics?.currentSubject || 'Not Started';
  const currentTopicName = analytics?.currentTopicName || 'Not Started';
  const nextRecommendedTopic = analytics?.nextRecommendedTopicName || 'Start your first topic';
  const weaknesses = analytics?.weaknesses || 'N/A';

  return (
    <div className="space-y-6 pb-12 pr-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest font-mono">RESUME LEARNING PROTOCOLS</span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-0.5">
            ⚡ SMART RESUME HUB
          </h1>
          <p className="text-xs text-slate-400">Restore user progress state, access AI suggested next topics, and launch the Smart Resume Engine.</p>
        </div>
      </div>

      {loading ? (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-violet-500 border-slate-700 animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Continue Tiles */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary resume block */}
            <div className="p-6 rounded-2xl border border-white/5 bg-slate-950/40 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-[60px] pointer-events-none" />
              <span className="text-[9px] text-violet-400 font-bold font-mono uppercase tracking-widest block">Last Started Node</span>
              <h2 className="text-xl font-extrabold text-white mt-1">{currentTopicName}</h2>
              <span className="text-xs text-slate-400 block mt-0.5">{currentSubject}</span>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigate('/subjects')}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" /> Continue Last Lesson
                </button>
                <button 
                  onClick={() => navigate('/quizzes')}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" /> Continue Quiz
                </button>
              </div>
            </div>

            {/* Smart Resume Engine layout options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-white/5 bg-slate-950/40 text-left flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block">Practice Arena</span>
                  <h4 className="text-sm font-bold text-white mt-1">Coding Challenge</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Submit code solutions to earn streaks and XP multipliers.</p>
                </div>
                <button onClick={() => navigate('/coding')} className="w-full mt-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-bold transition">
                  Launch Compiler
                </button>
              </div>

              <div className="p-5 rounded-xl border border-white/5 bg-slate-950/40 text-left flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Assessment Matrix</span>
                  <h4 className="text-sm font-bold text-white mt-1">Practice Hub</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Review important questions, MCQs, and past papers.</p>
                </div>
                <button onClick={() => navigate('/practice-hub')} className="w-full mt-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-bold transition">
                  Launch Practice
                </button>
              </div>
            </div>

          </div>

          {/* AI Recommendations */}
          <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 text-left space-y-4 h-fit">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Suggested Next Topics</h3>
            </div>
            
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
              <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Recommended Next</span>
              <span className="text-xs font-bold text-white block mt-1">{nextRecommendedTopic}</span>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                Based on your performance in {weaknesses}, our AI coach generated this roadmap path for you.
              </p>
            </div>

            <button onClick={() => navigate('/subjects')} className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
              Start Next Lesson <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
