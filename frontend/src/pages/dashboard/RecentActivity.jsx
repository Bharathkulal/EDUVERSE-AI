import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  History, Filter, FileText, CheckCircle, Code, Award,
  BookOpen, Clock, AlertCircle
} from 'lucide-react';

export default function RecentActivity() {
  const [data, setData] = useState({ quizResults: [], codingResults: [], progress: {} });
  const [filterType, setFilterType] = useState('all'); // 'all' | 'quiz' | 'coding'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/progress');
      setData(data);
    } catch (err) {
      toast.error('Failed to sync student activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getCombinedTimeline = () => {
    const list = [];
    
    // Add quiz attempts
    if (data.quizResults) {
      data.quizResults.forEach(q => {
        list.push({
          id: `quiz-${q.id}`,
          type: 'quiz',
          title: `Quiz Attempt: ${q.title || 'General Quiz'}`,
          desc: `Subject: ${q.subject_name || 'N/A'} - Scored ${q.score}% (${q.total_questions} questions)`,
          timestamp: new Date(q.submitted_at),
          points: `+${Math.round(q.score / 5)} XP`,
          icon: <Award className="w-4 h-4 text-amber-400" />,
          color: 'border-amber-500/20 text-amber-400 bg-amber-500/5'
        });
      });
    }

    // Add coding submissions
    if (data.codingResults) {
      data.codingResults.forEach(c => {
        list.push({
          id: `coding-${c.id}`,
          type: 'coding',
          title: `Code Submission (${c.language})`,
          desc: `Evaluated score: ${c.score}%`,
          timestamp: new Date(c.submitted_at),
          points: `+${Math.round(c.score * 0.5)} XP`,
          icon: <Code className="w-4 h-4 text-violet-400" />,
          color: 'border-violet-500/20 text-violet-400 bg-violet-500/5'
        });
      });
    }

    // Sort by timestamp descending
    list.sort((a, b) => b.timestamp - a.timestamp);

    if (filterType !== 'all') {
      return list.filter(item => item.type === filterType);
    }
    return list;
  };

  const timelineItems = getCombinedTimeline();

  return (
    <div className="space-y-6 pb-12 pr-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest font-mono">AUDIT TELEMETRY</span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-0.5">
            📋 STUDENT ACTIVITY LOGS
          </h1>
          <p className="text-xs text-slate-400">View detailed reports, filters, performance metrics, and history of your actions.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilterType('all')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${filterType === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'}`}
          >
            All logs
          </button>
          <button 
            onClick={() => setFilterType('quiz')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${filterType === 'quiz' ? 'bg-violet-600 text-white' : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'}`}
          >
            Quizzes
          </button>
          <button 
            onClick={() => setFilterType('coding')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${filterType === 'coding' ? 'bg-violet-600 text-white' : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'}`}
          >
            Coding
          </button>
        </div>
      </div>

      {loading ? (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-violet-500 border-slate-700 animate-spin" />
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-white/5 bg-slate-950/40 text-left space-y-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-violet-400" /> Complete Performance Timeline
          </h3>

          <div className="relative border-l-2 border-white/5 ml-4 pl-6 space-y-6">
            {timelineItems.map(item => (
              <div key={item.id} className="relative">
                {/* Node icon */}
                <div className={`absolute -left-10 top-0.5 p-2 rounded-full border ${item.color}`}>
                  {item.icon}
                </div>
                
                {/* Content */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0">{item.points}</span>
                  </div>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                  <span className="text-[9px] text-slate-500 block font-mono">
                    {item.timestamp.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}

            {timelineItems.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto opacity-30 mb-2" />
                <p className="text-xs">No activity logged matching the filter configuration.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
