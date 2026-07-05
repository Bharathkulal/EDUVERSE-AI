import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, Trash2, HelpCircle, RefreshCw, Layers, Award, Sparkles, X, Clock, ShieldAlert, Award as Trophy
} from 'lucide-react';
import api from '../../api/axios';
import AdminTabBar from '../../components/AdminTabBar';
import './AdminApiSettings.css';

const QUIZ_TABS = [
  { id: 'list', label: 'Question Bank', icon: '🗄' },
  { id: 'create', label: 'Quiz Builder', icon: '📝' },
  { id: 'ai-generate', label: 'AI Question Generator', icon: '🧠' },
  { id: 'results', label: 'Quiz Analytics', icon: '📊' },
];

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'ai-generate' | 'results'
  const [loading, setLoading] = useState(true);

  // Manual Form
  const [form, setForm] = useState({
    subject_id: '', title: '', time_limit_minutes: 15, difficulty: 'medium', category: 'Exam Prep',
    questions: [{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' }],
  });

  // AI Generator Form
  const [aiForm, setAiForm] = useState({
    subject_id: '', topic_name: '', difficulty: 'medium', question_count: 5
  });
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  useEffect(() => {
    fetchInitData();
  }, []);

  const fetchInitData = async () => {
    try {
      setLoading(true);
      const [subjRes, quizRes, resultsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/quizzes'),
        api.get('/quizzes/results/all')
      ]);
      setSubjects(subjRes.data);
      setQuizzes(quizRes.data);
      setResults(resultsRes.data);
    } catch (err) {
      toast.error('Failed to sync quiz registry parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setForm({ 
      ...form, 
      questions: [...form.questions, { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' }] 
    });
  };

  const handleRemoveQuestion = (idx) => {
    if (form.questions.length === 1) return;
    setForm({
      ...form,
      questions: form.questions.filter((_, i) => i !== idx)
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quizzes', form);
      toast.success('Quiz published successfully');
      setForm({ 
        subject_id: '', title: '', time_limit_minutes: 15, difficulty: 'medium', category: 'Exam Prep',
        questions: [{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' }] 
      });
      setActiveTab('list');
      fetchInitData();
    } catch (err) {
      toast.error('Failed to publish quiz');
    }
  };

  const handleAiGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!aiForm.subject_id || !aiForm.topic_name) {
      return toast.error('Subject and Topic are required');
    }
    setGeneratingQuiz(true);
    try {
      await api.post('/quizzes/ai-generate', aiForm);
      toast.success('AI Quiz generated and published!');
      setAiForm({ subject_id: '', topic_name: '', difficulty: 'medium', question_count: 5 });
      setActiveTab('list');
      fetchInitData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz and its questions?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      toast.success('Quiz deleted');
      fetchInitData();
    } catch (err) {
      toast.error('Delete action failed');
    }
  };

  // Group results for leaderboard analytics
  const sortedLeaderboard = [...results]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            📝 Quiz Intelligence
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Configure question banks, build quizzes, generate questions with AI, and view analytics.</p>
        </div>
        <button onClick={fetchInitData} className="px-3.5 py-1.5 border text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}>
          <RefreshCw className="w-3.5 h-3.5" /> Reload
        </button>
      </div>

      <AdminTabBar tabs={QUIZ_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Active Quizzes List */}
          {activeTab === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.length > 0 ? (
                quizzes.map((q) => (
                  <div key={q.id} className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-slate-900 border border-white/5 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">{q.subject_name || 'General subject'}</span>
                      <h4 className="text-sm font-bold text-white uppercase mt-1.5">{q.title}</h4>
                      
                      <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-cyan-400" /> {q.question_count || 0} Questions</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-purple-400" /> {q.time_limit_minutes || 15} Mins</span>
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-amber-500" /> {q.difficulty || 'medium'}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteQuiz(q.id)} className="p-1.5 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-500 rounded transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 font-mono col-span-2">No quizzes available. Catalog is empty.</div>
              )}
            </div>
          )}

          {/* Submissions & Leaderboard */}
          {activeTab === 'results' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Submission results table */}
              <div className="lg:col-span-2 friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl overflow-x-auto">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Submission Evaluation Records</h3>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/5 pb-2 uppercase tracking-widest text-[9px] font-mono">
                      <th className="pb-3 pr-4">Student</th>
                      <th className="pb-3 pr-4">Quiz Title</th>
                      <th className="pb-3 pr-4">Evaluation Score</th>
                      <th className="pb-3 pr-4">Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-3 pr-4 font-bold text-white">{r.student_name}</td>
                        <td className="py-3 pr-4 text-slate-300">{r.quiz_title}</td>
                        <td className={`py-3 pr-4 font-bold ${r.score >= 80 ? 'text-emerald-400' : r.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{r.score}%</td>
                        <td className="py-3 pr-4 text-slate-500 font-mono">{new Date(r.submitted_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leaderboard panel */}
              <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-500" /> GLOBAL LEADERS
                </h3>
                
                <div className="space-y-2">
                  {sortedLeaderboard.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950/30 p-2.5 rounded-xl border border-white/5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">#{idx+1}</span>
                        <span className="text-white font-bold">{item.student_name}</span>
                      </div>
                      <span className="text-amber-400 font-black">{item.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Manual Quiz Builder */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateQuiz} className="friday-cyber-card p-6 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-4 max-w-3xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Configure Timed Challenge</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Select Subject</label>
                  <select required className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}>
                    <option value="">Choose Catalog...</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Quiz Title</label>
                  <input type="text" required placeholder="e.g. Final Assessment" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Time Limit (Minutes)</label>
                  <input type="number" required min="5" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.time_limit_minutes} onChange={(e) => setForm({ ...form, time_limit_minutes: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Difficulty level</label>
                  <select className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Category</label>
                  <input type="text" required className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Questions Assembly</h4>
                {form.questions.map((q, i) => (
                  <div key={i} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-3 relative quiz-question-card">
                    <button type="button" onClick={() => handleRemoveQuestion(i)} className="absolute right-3 top-3 text-slate-500 hover:text-rose-500 transition">
                      <X className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="text-[8px] uppercase tracking-wider text-slate-500 block mb-1">Question {i + 1}</label>
                      <input className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" placeholder="Enter question..." value={q.question} onChange={(e) => { const qs = [...form.questions]; qs[i].question = e.target.value; setForm({ ...form, questions: qs }); }} required />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['a', 'b', 'c', 'd'].map((opt) => (
                        <div key={opt}>
                          <label className="text-[8px] uppercase tracking-wider text-slate-500 block mb-1">Option {opt.toUpperCase()}</label>
                          <input className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500/30" placeholder={`Option ${opt.toUpperCase()}`} value={q[`option_${opt}`]} onChange={(e) => { const qs = [...form.questions]; qs[i][`option_${opt}`] = e.target.value; setForm({ ...form, questions: qs }); }} required />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-wider text-slate-500 block mb-1 font-bold">Select Correct Answer</label>
                      <select className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={q.correct_answer} onChange={(e) => { const qs = [...form.questions]; qs[i].correct_answer = e.target.value; setForm({ ...form, questions: qs }); }}>
                        <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={handleAddQuestion} className="px-4 py-2 border border-white/5 text-xs text-slate-300 rounded-xl hover:border-cyan-500/30 transition">+ Add Question</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-xs font-bold text-slate-950 hover:brightness-110 transition">Publish Timed Quiz</button>
              </div>
            </form>
          )}

          {/* AI Quiz Generator */}
          {activeTab === 'ai-generate' && (
            <form onSubmit={handleAiGenerateQuiz} className="friday-cyber-card p-6 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-4 max-w-md">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Synthesize AI Evaluation
              </h3>
              
              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Select Subject</label>
                <select required className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={aiForm.subject_id} onChange={(e) => setAiForm({ ...aiForm, subject_id: e.target.value })}>
                  <option value="">Choose Catalog...</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Target Topic</label>
                <input type="text" required placeholder="e.g. Recursion & Dynamic Programming" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={aiForm.topic_name} onChange={(e) => setAiForm({ ...aiForm, topic_name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Difficulty</label>
                  <select className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={aiForm.difficulty} onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Question Count</label>
                  <input type="number" required min="3" max="20" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={aiForm.question_count} onChange={(e) => setAiForm({ ...aiForm, question_count: parseInt(e.target.value) })} />
                </div>
              </div>

              <button type="submit" disabled={generatingQuiz} className="w-full py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                {generatingQuiz ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Synthesize Challenge</>}
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
