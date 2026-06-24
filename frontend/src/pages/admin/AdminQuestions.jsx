import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Sparkles, RefreshCw, Download, FileJson, CheckCircle, XCircle, Search, HelpCircle, Eye, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import './AdminApiSettings.css';

export default function AdminQuestions() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'ai-architect' | 'bulk'
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    subject_id: '', question: '', answer: '', question_type: '2 Marks', difficulty: 'medium', unit_number: 1, tags: ''
  });

  // AI Architect Form
  const [aiForm, setAiForm] = useState({ subject_id: '', topic: '', count: 3, difficulty: 'medium' });
  const [generating, setGenerating] = useState(false);

  // Bulk Import
  const [bulkText, setBulkText] = useState('');
  const [importing, setImporting] = useState(false);

  // Filters
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, analyticsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/questions/admin/analytics')
      ]);
      setSubjects(subjectsRes.data);
      setAnalytics(analyticsRes.data);

      const params = {};
      if (filterSubject) params.subject_id = filterSubject;
      if (filterType) params.question_type = filterType;
      if (searchQuery) params.search = searchQuery;

      const questionsRes = await api.get('/questions', { params });
      setQuestions(questionsRes.data);
    } catch (err) {
      toast.error('Failed to sync Question Bank parameters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterSubject, filterType, searchQuery]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject_id || !form.question || !form.answer) {
      return toast.error('Please complete all required fields.');
    }

    try {
      const payload = {
        ...form,
        subject_id: parseInt(form.subject_id),
        unit_number: parseInt(form.unit_number)
      };

      if (editingId) {
        await api.put(`/questions/admin/${editingId}`, payload);
        toast.success('Question updated successfully!');
      } else {
        await api.post('/questions/admin', payload);
        toast.success('Question added successfully!');
      }

      setForm({
        subject_id: '', question: '', answer: '', question_type: '2 Marks', difficulty: 'medium', unit_number: 1, tags: ''
      });
      setEditingId(null);
      loadData();
    } catch (err) {
      toast.error('Failed to save question.');
    }
  };

  const handleEditClick = (q) => {
    setEditingId(q.id);
    setForm({
      subject_id: q.subject_id,
      question: q.question,
      answer: q.answer,
      question_type: q.question_type,
      difficulty: q.difficulty,
      unit_number: q.unit_number,
      tags: q.tags || ''
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/admin/${id}`);
      toast.success('Question deleted.');
      loadData();
    } catch (err) {
      toast.error('Delete action failed.');
    }
  };

  const handleToggleApproval = async (id, approved) => {
    try {
      await api.put(`/questions/admin/${id}/approve`, { approved });
      toast.success('Approval status updated');
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, approved } : q));
    } catch (err) {
      toast.error('Failed to change approval status');
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiForm.subject_id || !aiForm.topic) {
      return toast.error('Subject and Topic are required');
    }
    setGenerating(true);
    try {
      await api.post('/questions/admin/ai-generate', aiForm);
      toast.success('AI Questions generated and published!');
      setAiForm({ subject_id: '', topic: '', count: 3, difficulty: 'medium' });
      setActiveTab('list');
      loadData();
    } catch (err) {
      toast.error('AI Question architect run failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkText) return toast.error('Please input import data');
    setImporting(true);
    try {
      const parsed = JSON.parse(bulkText);
      await api.post('/questions/admin/bulk-import', { questions: parsed });
      toast.success('Bulk questions imported successfully');
      setBulkText('');
      setActiveTab('list');
      loadData();
    } catch (err) {
      toast.error('Invalid JSON structure or schema mismatch');
    } finally {
      setImporting(false);
    }
  };

  const handleBulkExport = async () => {
    try {
      const res = await api.get('/questions/admin/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'question_bank_export.json';
      a.click();
      toast.success('Export JSON downloaded');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="friday-admin-container relative space-y-6">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            ❓ QUESTION BANK SYSTEM
          </h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5 font-mono font-bold">Manage university-level model answers, run AI generation, and check search logs</p>
        </div>
        <button onClick={loadData} className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-300 rounded-lg hover:border-cyan-500/30 transition flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Reload Bank
        </button>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {[
            { label: 'Total', value: analytics.totalQuestions },
            { label: '2 Marks', value: analytics.marks2Count },
            { label: '5 Marks', value: analytics.marks5Count },
            { label: '10 Marks', value: analytics.marks10Count },
            { label: 'Important', value: analytics.importantQuestionsCount },
            { label: 'PYQ', value: analytics.pyqCount },
            { label: 'Saved API', value: analytics.aiRequestsSaved, color: 'text-cyan-400 font-bold' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-950/40 border border-white/5 p-3 rounded-xl flex flex-col justify-center">
              <span className={`text-base font-black ${stat.color || 'text-white'}`}>{stat.value}</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider font-mono mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-2">
        <button onClick={() => setActiveTab('list')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'list' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Ledger & Form</button>
        <button onClick={() => setActiveTab('ai-architect')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${activeTab === 'ai-architect' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Question Architect
        </button>
        <button onClick={() => setActiveTab('bulk')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${activeTab === 'bulk' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
          <FileJson className="w-3.5 h-3.5 text-purple-400" /> Bulk Import/Export
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Tab 1: Ledger & Form */}
          {activeTab === 'list' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-3.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  {editingId ? 'Modify Model Answer' : 'Compile Model Answer'}
                </h3>
                
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Select Subject</label>
                  <select name="subject_id" required className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.subject_id} onChange={handleChange}>
                    <option value="">Choose Catalog...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Question Type</label>
                  <select name="question_type" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.question_type} onChange={handleChange}>
                    <option value="2 Marks">2 Marks</option>
                    <option value="5 Marks">5 Marks</option>
                    <option value="10 Marks">10 Marks</option>
                    <option value="Important Question">Important Question</option>
                    <option value="Previous Year Question">Previous Year Question</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Question Text</label>
                  <textarea name="question" required rows={3} placeholder="Enter exam question..." className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.question} onChange={handleChange} />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Model Answer Explanation</label>
                  <textarea name="answer" required rows={6} placeholder="Type comprehensive answer details..." className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30 font-mono" value={form.answer} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Difficulty</label>
                    <select name="difficulty" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.difficulty} onChange={handleChange}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Unit Number</label>
                    <input type="number" name="unit_number" min="1" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.unit_number} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Tags (Comma-separated)</label>
                  <input type="text" name="tags" placeholder="oop, java, exam" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30" value={form.tags} onChange={handleChange} />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ subject_id: '', question: '', answer: '', question_type: '2 Marks', difficulty: 'medium', unit_number: 1, tags: '' }); }} className="px-3.5 py-2 border border-white/5 text-xs text-slate-400 hover:text-white rounded-xl">Cancel</button>}
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-xs font-bold text-slate-950 hover:brightness-110 transition">
                    {editingId ? 'Save Revisions' : 'Publish Question'}
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="lg:col-span-2 space-y-4">
                {/* Filters */}
                <div className="flex gap-2 flex-wrap items-center">
                  <div className="relative flex-1 max-w-xs">
                    <input type="text" placeholder="Search questions..." className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  </div>
                  <select className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                  </select>
                </div>

                {/* Grid list */}
                <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                  {questions.map((q) => (
                    <div key={q.id} className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[8px] bg-slate-900 border border-white/5 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">{q.subject_name}</span>
                            <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono uppercase">{q.question_type}</span>
                            <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded font-mono uppercase">Unit {q.unit_number}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white uppercase mt-2">{q.question}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap"><Eye className="w-3 h-3 inline mr-1" /> {q.views_count} views</span>
                      </div>

                      <p className="text-slate-400 text-xs line-clamp-3 font-mono">{q.answer}</p>

                      <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                        <button
                          onClick={() => handleToggleApproval(q.id, !q.approved)}
                          className={`flex items-center gap-1 text-[9px] font-mono font-bold uppercase transition ${q.approved ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
                        >
                          {q.approved ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {q.approved ? 'Approved' : 'Pending Verification'}
                        </button>

                        <div className="flex gap-2">
                          <button onClick={() => handleEditClick(q)} className="p-1 bg-slate-900 border border-white/5 hover:border-amber-500/30 text-amber-400 rounded transition">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteClick(q.id)} className="p-1 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-500 rounded transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div className="text-center py-10 text-slate-500 font-mono">No matching questions in registry.</div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Tab 2: AI Question Architect */}
          {activeTab === 'ai-architect' && (
            <form onSubmit={handleAiGenerate} className="friday-cyber-card p-6 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-4 max-w-md">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Synthesize Model Answers
              </h3>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Select Subject</label>
                <select required className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none" value={aiForm.subject_id} onChange={(e) => setAiForm({ ...aiForm, subject_id: e.target.value })}>
                  <option value="">Choose Catalog...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Target Syllabus Topic</label>
                <input type="text" required placeholder="e.g. Dijkstra's Algorithm Complexity" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none" value={aiForm.topic} onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Difficulty</label>
                  <select className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none" value={aiForm.difficulty} onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Question Count</label>
                  <input type="number" required min="1" max="10" className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none" value={aiForm.count} onChange={(e) => setAiForm({ ...aiForm, count: parseInt(e.target.value) })} />
                </div>
              </div>

              <button type="submit" disabled={generating} className="w-full py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Synthesize Model Answers</>}
              </button>
            </form>
          )}

          {/* Tab 3: Bulk operations */}
          {activeTab === 'bulk' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Import */}
              <form onSubmit={handleBulkImport} className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-3.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">JSON Bulk Import</h3>
                <p className="text-[10px] text-slate-400 font-mono">Insert a raw JSON array matching the Question Bank schema to bulk compile records.</p>
                <textarea
                  rows={8}
                  placeholder={`[\n  {\n    "subject_id": 1,\n    "question": "What is oop?",\n    "answer": "Object Oriented Programming...",\n    "question_type": "2 Marks"\n  }\n]`}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  required
                />
                <button type="submit" disabled={importing} className="w-full py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-xs font-bold text-white rounded-xl hover:brightness-110 transition flex items-center justify-center gap-1.5">
                  {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Import JSON Array</>}
                </button>
              </form>

              {/* Export */}
              <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bulk Backup Export</h3>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">Save the compiled Question Bank to a local JSON backup file containing answers, categories, and views logs.</p>
                </div>
                <button onClick={handleBulkExport} className="w-full py-3 bg-slate-900 border border-white/5 hover:border-cyan-500/30 text-xs font-bold text-cyan-400 rounded-xl flex items-center justify-center gap-1.5 transition">
                  <Download className="w-4 h-4" /> Download export.json Backup
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
