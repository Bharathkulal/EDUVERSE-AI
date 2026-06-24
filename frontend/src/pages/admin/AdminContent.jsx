import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, RefreshCw, Plus, Edit, Trash2, CheckCircle, XCircle, FileText, 
  Video, FileUp, Sparkles, BookOpen, Layers, Check, Clock, Eye
} from 'lucide-react';
import api from '../../api/axios';
import './AdminApiSettings.css';

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'topics' | 'approvals'
  const [data, setData] = useState({ subjects: [], notes: [], topics: [] });
  const [loading, setLoading] = useState(true);

  // Forms
  const [subjectForm, setSubjectForm] = useState({ title: '', content: '', type: 'subject' });
  const [topicForm, setTopicForm] = useState({ 
    subject_id: '', unit_id: '', title: '', content: '', notes: '', pdf_url: '', video_url: '', type: 'topic' 
  });
  
  // AI generation helper
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // File Uploads
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get('/content');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to retrieve content list');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/content', subjectForm);
      toast.success('Subject created successfully');
      setSubjectForm({ title: '', content: '', type: 'subject' });
      fetchContent();
    } catch (err) {
      toast.error('Error creating subject');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await api.post('/content', topicForm);
      toast.success('Topic/lesson added successfully');
      setTopicForm({ 
        subject_id: '', unit_id: '', title: '', content: '', notes: '', pdf_url: '', video_url: '', type: 'topic' 
      });
      fetchContent();
    } catch (err) {
      toast.error('Error creating lesson topic');
    }
  };

  const handleFileUpload = async (e, fieldType) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    if (fieldType === 'pdf') setUploadingPdf(true);
    else setUploadingVideo(true);

    try {
      const res = await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('File uploaded successfully');
      
      setTopicForm(prev => ({
        ...prev,
        [fieldType === 'pdf' ? 'pdf_url' : 'video_url']: res.data.url
      }));
    } catch (err) {
      toast.error('File upload failed. Ensure format is accepted.');
    } finally {
      setUploadingPdf(false);
      setUploadingVideo(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return toast.error('Please enter a note topic');
    setAiGenerating(true);
    try {
      const res = await api.post('/content/ai-generate', { topic: aiPrompt });
      setTopicForm(prev => ({
        ...prev,
        content: res.data.content
      }));
      toast.success('AI Notes generated successfully');
    } catch (err) {
      toast.error('AI text generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleToggleApproval = async (item, type) => {
    try {
      const nextApproved = !item.approved;
      await api.put(`/content/${item.id}`, {
        type,
        approved: nextApproved
      });
      toast.success(`Approval status updated successfully`);
      fetchContent();
    } catch (err) {
      toast.error('Failed to update approval status');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this content item?`)) return;
    try {
      await api.delete(`/content/${id}?type=${type}`);
      toast.success('Deleted successfully');
      fetchContent();
    } catch (err) {
      toast.error('Delete action failed');
    }
  };

  const tabs = [
    { id: 'catalog', label: 'Subjects Catalog', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'topics', label: 'Lessons & Topics', icon: <Layers className="w-4 h-4" /> },
    { id: 'approvals', label: 'Approvals Queue', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="friday-admin-container relative space-y-6">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            📝 CONTENT CATALOG MANAGER
          </h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5 font-mono">Create subjects, compile lessons, and manage validation workflows</p>
        </div>
        <button onClick={fetchContent} className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-300 rounded-lg hover:border-cyan-500/30 transition flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Synchronize Catalog
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/5 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Tab 1: Catalog */}
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Subject */}
              <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Add Subject</h3>
                <form onSubmit={handleCreateSubject} className="space-y-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Subject Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Data Structures"
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                      value={subjectForm.title}
                      onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Enter subject catalog description..."
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                      value={subjectForm.content}
                      onChange={(e) => setSubjectForm({ ...subjectForm, content: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-bold text-slate-950 rounded-xl hover:brightness-110 transition">
                    Publish Subject
                  </button>
                </form>
              </div>

              {/* Subject List */}
              <div className="lg:col-span-2 space-y-3">
                {data.subjects.map((s) => (
                  <div key={s.id} className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase">{s.subject_name}</h4>
                      <p className="text-slate-400 text-xs mt-1">{s.description || 'No catalog description provided.'}</p>
                      <div className="flex gap-4 mt-3 text-[10px] text-slate-500 font-mono">
                        <span>Units/Chapters: {s.unit_count || 0}</span>
                        <span>Total Lessons: {s.topic_count || 0}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(s.id, 'subject')} className="p-1.5 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-500 rounded transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Topics */}
          {activeTab === 'topics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Topic Form */}
              <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assemble Lesson Topic</h3>
                
                {/* AI Helper tool */}
                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-cyan-400 flex items-center gap-1 font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> AI Notes Assistant
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. Big O Complexity"
                      className="flex-1 bg-slate-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white outline-none focus:border-cyan-500/30"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={aiGenerating}
                      onClick={handleAiGenerate}
                      className="px-2.5 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-[10px] font-bold hover:brightness-110 transition flex items-center justify-center"
                    >
                      {aiGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Generate'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleCreateTopic} className="space-y-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Select Subject</label>
                    <select
                      required
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                      value={topicForm.subject_id}
                      onChange={(e) => setTopicForm({ ...topicForm, subject_id: e.target.value })}
                    >
                      <option value="">Choose Catalog...</option>
                      {data.subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Topic Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arrays and Array Lists"
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30"
                      value={topicForm.title}
                      onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Study Content (Markdown)</label>
                    <textarea
                      rows={5}
                      placeholder="Enter chapter lecture explanations here..."
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/30 font-mono"
                      value={topicForm.content}
                      onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
                    />
                  </div>

                  {/* File upload widgets */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="relative">
                      <input type="file" id="pdfFile" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'pdf')} />
                      <label htmlFor="pdfFile" className="flex items-center justify-center gap-1.5 p-2 bg-slate-900 border border-white/5 rounded-xl text-[10px] text-slate-300 cursor-pointer hover:border-cyan-500/30 transition">
                        <FileUp className="w-3.5 h-3.5 text-cyan-400" />
                        {uploadingPdf ? 'Uploading...' : 'Link PDF'}
                      </label>
                    </div>
                    <div className="relative">
                      <input type="file" id="videoFile" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
                      <label htmlFor="videoFile" className="flex items-center justify-center gap-1.5 p-2 bg-slate-900 border border-white/5 rounded-xl text-[10px] text-slate-300 cursor-pointer hover:border-cyan-500/30 transition">
                        <Video className="w-3.5 h-3.5 text-purple-400" />
                        {uploadingVideo ? 'Uploading...' : 'Link Video'}
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 transition">
                    Publish Topic
                  </button>
                </form>
              </div>

              {/* Topics Catalog list */}
              <div className="lg:col-span-2 space-y-3">
                {data.topics.map((t) => (
                  <div key={t.id} className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono uppercase">{t.subject_name}</span>
                        <h4 className="text-sm font-bold text-white uppercase mt-1">{t.title}</h4>
                      </div>
                      <button onClick={() => handleDelete(t.id, 'topic')} className="p-1.5 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-500 rounded transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <p className="text-slate-400 text-xs line-clamp-2">{t.content || 'No study lesson text compiled.'}</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-white/5 pt-2">
                      <div className="flex gap-3">
                        {t.pdf_url && <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-cyan-400" /> PDF linked</span>}
                        {t.video_url && <span className="flex items-center gap-1"><Video className="w-3 h-3 text-purple-400" /> Video linked</span>}
                      </div>
                      <span className={`px-2 py-0.5 rounded border text-[8px] uppercase ${t.approved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                        {t.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Approvals Queue */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Content Approvals Workflow</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">Toggle verification checkmarks to instantly display notes or study units inside student dashboards.</p>
              </div>

              <div className="space-y-3">
                {/* Filtered items awaiting approval */}
                {data.notes.map((n) => (
                  <div key={n.id} className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{n.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Author: {n.author_name || 'Student'} • Created: {new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleApproval(n, 'note')}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition flex items-center gap-1.5 ${
                          n.approved 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:border-rose-500/40' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:border-emerald-400/40'
                        }`}
                      >
                        {n.approved ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        {n.approved ? 'Revoke Approval' : 'Approve Draft'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
