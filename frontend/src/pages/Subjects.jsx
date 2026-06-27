import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useHashNavigation } from '../utils/useHashNavigation';

const subjectIcons = {
  FOC: '🔢', Java: '☕', 'Advanced Java': '⚡', DSA: '🌳', 'C#': '🔷',
  DBMS: '🗄️', Python: '🐍', 'Web Development': '🌐', Mathematics: '🧮',
};

const subjectBlobColors = {
  FOC: 'blob-foc',
  Java: 'blob-java',
  'Advanced Java': 'blob-advjava',
  DSA: 'blob-dsa',
  'C#': 'blob-csharp',
  DBMS: 'blob-dbms',
  Python: 'blob-python',
  'Web Development': 'blob-webdev',
  Mathematics: 'blob-python',
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subjects');
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('eduverse_bookmarks') || '[]'));

  // Hash-based navigation from sidebar
  useHashNavigation({
    '#courses': 'subjects',
    '#roadmaps': 'roadmap',
    '#notes': 'notes',
    '#resources': 'resources',
    '#studio': 'subjects',
    '#bookmarks': 'bookmarks',
  }, setActiveTab);
  const [roadmapData, setRoadmapData] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    api.get('/subjects')
      .then(res => {
        const uniqueSubjects = [];
        const seen = new Set();
        for (const item of res.data) {
          if (!seen.has(item.subject_name)) {
            seen.add(item.subject_name);
            uniqueSubjects.push(item);
          }
        }
        // Inject Mathematics for prototype if not present
        if (!uniqueSubjects.find(s => s.subject_name === 'Mathematics')) {
          uniqueSubjects.push({
            id: 'math-proto',
            subject_name: 'Mathematics',
            description: 'Advanced numerical methods and calculus execution engines.',
            topic_count: 3,
            unit_count: 1
          });
        }
        setSubjects(uniqueSubjects);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // Load roadmap data when tab changes
  useEffect(() => {
    if (activeTab === 'roadmap' && !roadmapData) {
      setRoadmapLoading(true);
      Promise.all([
        api.get('/progress/analytics'),
        api.get('/progress/roadmap/progress')
      ])
        .then(([analyticsRes, progressRes]) => {
          setRoadmapData({
            roadmap: analyticsRes.data.roadmap || [],
            subjectProgress: analyticsRes.data.subjectProgress || [],
            completedTopicIds: progressRes.data.completedTopicIds || [],
            activeTopicId: progressRes.data.activeTopicId
          });
        })
        .catch(err => console.error(err))
        .finally(() => setRoadmapLoading(false));
    }
  }, [activeTab, roadmapData]);

  // Load notes when tab changes
  useEffect(() => {
    if (activeTab === 'notes') {
      loadNotes();
    }
  }, [activeTab]);

  const loadNotes = () => {
    setNotesLoading(true);
    api.get('/notes')
      .then(res => setNotes(res.data))
      .catch(err => console.error(err))
      .finally(() => setNotesLoading(false));
  };

  // Notes CRUD handlers
  const handleSaveNote = async () => {
    if (!noteTitle.trim()) return;
    setSavingNote(true);
    try {
      if (editingNote) {
        const res = await api.put(`/notes/${editingNote.id}`, { title: noteTitle, content: noteContent });
        setNotes(prev => prev.map(n => n.id === editingNote.id ? res.data : n));
      } else {
        const res = await api.post('/notes', { title: noteTitle, content: noteContent });
        setNotes(prev => [res.data, ...prev]);
      }
      resetNoteEditor();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const res = await api.put(`/notes/${note.id}`, { pinned: !note.pinned });
      setNotes(prev => prev.map(n => n.id === note.id ? res.data : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      const res = await api.put(`/notes/${note.id}`, { favorite: !note.favorite });
      setNotes(prev => prev.map(n => n.id === note.id ? res.data : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiSummary = async (note) => {
    setSummaryLoading(true);
    setAiSummary(null);
    try {
      const res = await api.post(`/notes/${note.id}/summary`);
      setAiSummary({ noteId: note.id, text: res.data.summary });
    } catch (err) {
      console.error(err);
      setAiSummary({ noteId: note.id, text: 'Failed to generate summary. Try again later.' });
    } finally {
      setSummaryLoading(false);
    }
  };

  const editNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content || '');
    setShowNoteEditor(true);
  };

  const resetNoteEditor = () => {
    setShowNoteEditor(false);
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  // Roadmap actions
  const handleStartTopic = async (topicId) => {
    try {
      await api.post('/progress/roadmap/start', { topicId });
      setRoadmapData(prev => ({ ...prev, activeTopicId: topicId }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteTopic = async (topicId) => {
    try {
      await api.post('/progress/complete-topic', { topic_id: topicId, study_minutes: 30 });
      setRoadmapData(prev => ({
        ...prev,
        completedTopicIds: [...prev.completedTopicIds, topicId],
        activeTopicId: null
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBookmark = (subject) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === subject.id);
      const updated = exists ? prev.filter(b => b.id !== subject.id) : [...prev, subject];
      localStorage.setItem('eduverse_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const tabs = [
    { id: 'subjects', label: 'Learning Modules', icon: '📚' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'resources', label: 'Resources', icon: '📂' },
    { id: 'bookmarks', label: 'Bookmarks', icon: '🔖' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-[260px] bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-fit" style={{ backgroundColor: 'var(--db-input-bg)', border: '1px solid var(--db-sidebar-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
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
        {/* ─── SUBJECTS TAB ─── */}
        {activeTab === 'subjects' && (
          <motion.div 
            key="subjects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--db-text-main)' }}>Learning Modules</h1>
              <p style={{ color: 'var(--db-text-muted)' }}>Explore subjects with theory, notes, PDFs, and videos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 premium-subjects-grid">
              {subjects.map((s) => (
                <Link key={s.id} to={`/subjects/${s.id}`} className="subject-card group">
                  <div className={`subject-card-blob ${subjectBlobColors[s.subject_name] || 'blob-default'}`} />
                  <div className="subject-card-bg" />
                  <div className="subject-card-content">
                    <div>
                      <div className="text-4xl mb-3">{subjectIcons[s.subject_name] || '📚'}</div>
                      <h3 className="font-semibold text-lg text-[var(--db-text-main)] group-hover:text-emerald-500 transition-colors duration-300">{s.subject_name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">{s.description}</p>
                    </div>
                    <div className="flex gap-4 mt-6 text-xs font-medium text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {s.topic_count || 0} topics
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {s.unit_count || 0} units
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── ROADMAP TAB ─── */}
        {activeTab === 'roadmap' && (
          <motion.div 
            key="roadmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--db-text-main)' }}>Learning Roadmap</h1>
              <p style={{ color: 'var(--db-text-muted)' }}>Track your progress and complete topics sequentially</p>
            </div>

            {roadmapLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-t-violet-600 border-slate-700 animate-spin"></div>
              </div>
            ) : roadmapData ? (
              <div className="space-y-6">
                {/* Subject Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roadmapData.subjectProgress.map((sp, i) => (
                    <div 
                      key={i} 
                      className="p-4 rounded-2xl border"
                      style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--db-text-main)' }}>{subjectIcons[sp.name] || '📚'} {sp.name}</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--db-text-accent)' }}>{sp.percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-sidebar-border)' }}>
                        <motion.div 
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${sp.percentage}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                      <span className="text-[11px] mt-1 block" style={{ color: 'var(--db-text-muted)' }}>{sp.completedTopics}/{sp.totalTopics} topics</span>
                    </div>
                  ))}
                </div>

                {/* Roadmap Nodes */}
                <div 
                  className="p-6 rounded-2xl border space-y-4"
                  style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                >
                  <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>Topic Nodes</h3>
                  <div className="space-y-3">
                    {roadmapData.roadmap.map((node, idx) => {
                      const isCompleted = roadmapData.completedTopicIds.includes(node.id);
                      const isActive = roadmapData.activeTopicId === node.id;
                      const prevAllCompleted = idx === 0 || roadmapData.roadmap.slice(0, idx).every(n => roadmapData.completedTopicIds.includes(n.id));
                      const canStart = !isCompleted && prevAllCompleted;

                      return (
                        <motion.div 
                          key={node.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-4 p-3 rounded-xl border transition-all"
                          style={{ 
                            backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.05)' : isActive ? 'rgba(139, 92, 246, 0.05)' : 'var(--db-input-bg)', 
                            borderColor: isCompleted ? 'rgba(16, 185, 129, 0.2)' : isActive ? 'rgba(139, 92, 246, 0.3)' : 'var(--db-sidebar-border)'
                          }}
                        >
                          {/* Status indicator */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCompleted ? 'bg-emerald-600 text-white' : isActive ? 'bg-violet-600 text-white animate-pulse' : 'bg-slate-600 text-slate-300'
                          }`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold block" style={{ color: 'var(--db-text-main)' }}>{node.title}</span>
                            <span className="text-[11px]" style={{ color: 'var(--db-text-muted)' }}>{node.subject}</span>
                          </div>

                          {/* Status badge */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            isCompleted ? 'bg-emerald-500/10 text-emerald-500' : isActive ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {isCompleted ? 'Done' : isActive ? 'Active' : node.status}
                          </span>

                          {/* Action buttons */}
                          <div className="flex gap-2 shrink-0">
                            {canStart && !isActive && (
                              <button 
                                onClick={() => handleStartTopic(node.id)}
                                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Start
                              </button>
                            )}
                            {isActive && (
                              <button 
                                onClick={() => handleCompleteTopic(node.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Complete ✓
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* ─── NOTES TAB ─── */}
        {activeTab === 'notes' && (
          <motion.div 
            key="notes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--db-text-main)' }}>My Notes</h1>
                <p style={{ color: 'var(--db-text-muted)' }}>Create, manage, and summarize your study notes with AI</p>
              </div>
              <button 
                onClick={() => { resetNoteEditor(); setShowNoteEditor(true); }}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-600/20"
              >
                <span className="text-lg">+</span> New Note
              </button>
            </div>

            {/* Note Editor Modal */}
            <AnimatePresence>
              {showNoteEditor && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 rounded-2xl border space-y-4"
                  style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>
                      {editingNote ? 'Edit Note' : 'Create New Note'}
                    </h3>
                    <button onClick={resetNoteEditor} className="text-xl cursor-pointer" style={{ color: 'var(--db-text-muted)' }}>✕</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm font-semibold outline-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--db-input-bg)', 
                      borderColor: 'var(--db-sidebar-border)', 
                      color: 'var(--db-text-main)' 
                    }}
                  />
                  <textarea
                    placeholder="Write your notes here..."
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--db-input-bg)', 
                      borderColor: 'var(--db-sidebar-border)', 
                      color: 'var(--db-text-main)' 
                    }}
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSaveNote}
                      disabled={savingNote || !noteTitle.trim()}
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {savingNote ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
                    </button>
                    <button 
                      onClick={resetNoteEditor}
                      className="px-5 py-2.5 border rounded-xl text-sm font-bold transition-all cursor-pointer"
                      style={{ borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-muted)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes Grid */}
            {notesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-t-violet-600 border-slate-700 animate-spin"></div>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <span className="text-5xl block">📝</span>
                <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>No notes yet</h3>
                <p className="text-sm" style={{ color: 'var(--db-text-muted)' }}>Create your first study note to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(note => (
                  <motion.div 
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl border flex flex-col justify-between hover:shadow-lg transition-all group"
                    style={{ backgroundColor: 'var(--db-card-bg)', borderColor: note.pinned ? 'rgba(139, 92, 246, 0.3)' : 'var(--db-sidebar-border)' }}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
                          {note.pinned && <span className="text-violet-400">📌</span>}
                          {note.title}
                        </h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleTogglePin(note)} className="p-1 rounded-md hover:bg-white/10 transition cursor-pointer text-xs" title="Pin">
                            {note.pinned ? '📌' : '📍'}
                          </button>
                          <button onClick={() => handleToggleFavorite(note)} className="p-1 rounded-md hover:bg-white/10 transition cursor-pointer text-xs" title="Favorite">
                            {note.favorite ? '⭐' : '☆'}
                          </button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-4" style={{ color: 'var(--db-text-secondary)' }}>
                        {note.content || 'Empty note...'}
                      </p>
                      <span className="text-[11px] block" style={{ color: 'var(--db-text-muted)' }}>
                        {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* AI Summary display */}
                    {aiSummary?.noteId === note.id && (
                      <div className="mt-3 p-3 rounded-xl border" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--db-text-accent)' }}>🤖 AI Summary</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--db-text-main)' }}>{aiSummary.text}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      <button onClick={() => editNote(note)} className="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer" style={{ backgroundColor: 'var(--db-input-bg)', color: 'var(--db-text-secondary)' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleAiSummary(note)} disabled={summaryLoading} className="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--db-text-accent)' }}>
                        {summaryLoading && aiSummary?.noteId !== note.id ? '...' : '🤖 AI Summary'}
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)} className="py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer hover:bg-red-500/10" style={{ color: '#ef4444' }}>
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── RESOURCES TAB ─── */}
        {activeTab === 'resources' && (
          <motion.div 
            key="resources"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--db-text-main)' }}>Resource Library</h1>
              <p style={{ color: 'var(--db-text-muted)' }}>Curated learning resources for each subject</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Java Documentation', type: 'PDF', subject: 'Java', icon: '☕', color: 'from-orange-500 to-red-500', url: 'https://docs.oracle.com/en/java/' },
                { title: 'DSA Cheat Sheet', type: 'PDF', subject: 'DSA', icon: '🌳', color: 'from-green-500 to-emerald-500', url: '#' },
                { title: 'Python Official Docs', type: 'Link', subject: 'Python', icon: '🐍', color: 'from-blue-500 to-cyan-500', url: 'https://docs.python.org/3/' },
                { title: 'C# Programming Guide', type: 'Link', subject: 'C#', icon: '🔷', color: 'from-purple-500 to-violet-500', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/' },
                { title: 'SQL Basics Tutorial', type: 'Video', subject: 'DBMS', icon: '🗄️', color: 'from-yellow-500 to-amber-500', url: '#' },
                { title: 'Web Dev Roadmap 2026', type: 'Article', subject: 'Web Dev', icon: '🌐', color: 'from-pink-500 to-rose-500', url: '#' },
                { title: 'FOC Study Notes', type: 'PDF', subject: 'FOC', icon: '🔢', color: 'from-indigo-500 to-blue-500', url: '#' },
                { title: 'Numerical Methods Guide', type: 'PDF', subject: 'Mathematics', icon: '🧮', color: 'from-teal-500 to-cyan-500', url: '#' },
              ].map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl border flex flex-col gap-3 hover:shadow-lg transition-all group cursor-pointer"
                  style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${res.color} flex items-center justify-center text-lg text-white shadow-md`}>
                      {res.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--db-badge-bg)', color: 'var(--db-badge-text)' }}>
                      {res.type}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-[var(--db-text-accent)] transition-colors" style={{ color: 'var(--db-text-main)' }}>{res.title}</h4>
                    <span className="text-[11px]" style={{ color: 'var(--db-text-muted)' }}>{res.subject}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--db-text-accent)' }}>
                    Open Resource →
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── BOOKMARKS TAB ─── */}
        {activeTab === 'bookmarks' && (
          <motion.div 
            key="bookmarks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--db-text-main)' }}>My Bookmarks</h1>
              <p style={{ color: 'var(--db-text-muted)' }}>Subjects you've saved for quick access</p>
            </div>
            {bookmarks.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <span className="text-5xl block">🔖</span>
                <h3 className="text-lg font-bold" style={{ color: 'var(--db-text-main)' }}>No bookmarks yet</h3>
                <p className="text-sm" style={{ color: 'var(--db-text-muted)' }}>Go to Learning Modules and click the bookmark icon on any subject to save it here!</p>
                <button onClick={() => setActiveTab('subjects')} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer">
                  Browse Subjects
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {bookmarks.map((s) => (
                  <div key={s.id} className="p-5 rounded-2xl border flex flex-col gap-3 hover:shadow-lg transition-all" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="flex justify-between items-start">
                      <div className="text-3xl">{subjectIcons[s.subject_name] || '📚'}</div>
                      <button onClick={() => toggleBookmark(s)} className="text-lg cursor-pointer hover:scale-110 transition-transform">🔖</button>
                    </div>
                    <h3 className="font-semibold text-base" style={{ color: 'var(--db-text-main)' }}>{s.subject_name}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--db-text-muted)' }}>{s.description}</p>
                    <Link to={`/subjects/${s.id}`} className="text-xs font-bold mt-auto pt-2" style={{ color: 'var(--db-text-accent)' }}>
                      Continue Learning →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
