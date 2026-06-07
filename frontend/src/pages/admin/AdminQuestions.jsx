import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import './AdminQuestions.css';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    subject_id: '',
    question: '',
    answer: '',
    question_type: '2 Marks',
    difficulty: 'medium',
    unit_number: 1,
    tags: '',
  });

  // Filters
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, analyticsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/questions/admin/analytics'),
      ]);

      // Unique subjects
      const uniqueSubjects = [];
      const seen = new Set();
      for (const item of subjectsRes.data) {
        if (!seen.has(item.subject_name)) {
          seen.add(item.subject_name);
          uniqueSubjects.push(item);
        }
      }
      setSubjects(uniqueSubjects);
      setAnalytics(analyticsRes.data);

      // Fetch questions filtered
      const params = {};
      if (filterSubject) params.subject_id = filterSubject;
      if (filterType) params.question_type = filterType;
      if (searchQuery) params.search = searchQuery;

      const questionsRes = await api.get('/questions', { params });
      setQuestions(questionsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load management dashboard data.');
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

  const handleEditorToolbarClick = (symbol) => {
    let toAdd = '';
    if (symbol === 'bold') toAdd = '**Bold Text**';
    if (symbol === 'italic') toAdd = '*Italic Text*';
    if (symbol === 'code') toAdd = '`code block`';
    if (symbol === 'bullet') toAdd = '\n- Item 1\n- Item 2';
    if (symbol === 'number') toAdd = '\n1. First item\n2. Second item';

    setForm((prev) => ({
      ...prev,
      answer: prev.answer + toAdd,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject_id || !form.question || !form.answer || !form.question_type) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      const payload = {
        ...form,
        subject_id: parseInt(form.subject_id),
        unit_number: parseInt(form.unit_number),
      };

      if (editingId) {
        await api.put(`/questions/admin/${editingId}`, payload);
        toast.success('Question updated successfully!');
      } else {
        await api.post('/questions/admin', payload);
        toast.success('Question added successfully!');
      }

      // Reset form
      setForm({
        subject_id: '',
        question: '',
        answer: '',
        question_type: '2 Marks',
        difficulty: 'medium',
        unit_number: 1,
        tags: '',
      });
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save question.');
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
      tags: q.tags || '',
    });
    // Scroll to form smoothly
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await api.delete(`/questions/admin/${id}`);
      toast.success('Question deleted.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="admin-qb-container">
      <div>
        <h1 className="text-2xl font-bold">Question Bank Management</h1>
        <p className="text-slate-500">Add, edit, structure high-quality model answers and view usage analytics.</p>
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="admin-analytics-grid">
          <div className="admin-stats-card">
            <span className="admin-stats-num">{analytics.totalQuestions}</span>
            <span className="admin-stats-title">Total Questions</span>
          </div>
          <div className="admin-stats-card">
            <span className="admin-stats-num">{analytics.marks2Count}</span>
            <span className="admin-stats-title">2 Marks Count</span>
          </div>
          <div className="admin-stats-card">
            <span className="admin-stats-num">{analytics.marks5Count}</span>
            <span className="admin-stats-title">5 Marks Count</span>
          </div>
          <div className="admin-stats-card">
            <span className="admin-stats-num">{analytics.marks10Count}</span>
            <span className="admin-stats-title">10 Marks Count</span>
          </div>
          <div className="admin-stats-card">
            <span className="admin-stats-num">{analytics.importantQuestionsCount}</span>
            <span className="admin-stats-title">Important Qs</span>
          </div>
          <div className="admin-stats-card">
            <span className="admin-stats-num">{analytics.pyqCount}</span>
            <span className="admin-stats-title">PYQ Count</span>
          </div>
          <div className="admin-stats-card" style={{ background: 'rgba(52, 211, 153, 0.08)' }}>
            <span className="admin-stats-num" style={{ color: '#60a5fa' }}>{analytics.aiRequestsSaved}</span>
            <span className="admin-stats-title">AI API Requests Saved</span>
          </div>
        </div>
      )}

      {/* Main layout splitting forms and list */}
      <div className="admin-qb-layout">
        {/* Left column: Add/Edit Form */}
        <form onSubmit={handleSubmit} className="admin-form-panel">
          <h2 className="admin-form-title">
            {editingId ? 'Modify Model Answer' : 'Add Model Answer to Question Bank'}
          </h2>

          <div className="admin-input-group">
            <label className="admin-input-label">Subject *</label>
            <select
              name="subject_id"
              className="admin-text-input"
              value={form.subject_id}
              onChange={handleChange}
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.subject_name}</option>
              ))}
            </select>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Question Type *</label>
            <select
              name="question_type"
              className="admin-text-input"
              value={form.question_type}
              onChange={handleChange}
            >
              <option value="2 Marks">2 Marks</option>
              <option value="5 Marks">5 Marks</option>
              <option value="10 Marks">10 Marks</option>
              <option value="Important Question">Important Question</option>
              <option value="Previous Year Question">Previous Year Question</option>
            </select>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Question *</label>
            <textarea
              name="question"
              rows="3"
              className="admin-text-input admin-textarea"
              placeholder="e.g. Explain the Features of Java"
              value={form.question}
              onChange={handleChange}
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Model Answer *</label>
            <div className="rich-editor-mock">
              <div className="rich-editor-toolbar">
                <button type="button" className="editor-tool-btn" onClick={() => handleEditorToolbarClick('bold')}>Bold</button>
                <button type="button" className="editor-tool-btn" onClick={() => handleEditorToolbarClick('italic')}>Italic</button>
                <button type="button" className="editor-tool-btn" onClick={() => handleEditorToolbarClick('code')}>Code</button>
                <button type="button" className="editor-tool-btn" onClick={() => handleEditorToolbarClick('bullet')}>Bullet List</button>
                <button type="button" className="editor-tool-btn" onClick={() => handleEditorToolbarClick('number')}>Num List</button>
              </div>
              <textarea
                name="answer"
                rows="7"
                className="admin-text-input admin-textarea"
                style={{ border: 'none', background: 'transparent', width: '100%' }}
                placeholder="1. Platform Independent&#10;2. Object Oriented&#10;..."
                value={form.answer}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-input-group">
              <label className="admin-input-label">Difficulty</label>
              <select
                name="difficulty"
                className="admin-text-input"
                value={form.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="admin-input-group">
              <label className="admin-input-label">Unit Number</label>
              <input
                type="number"
                name="unit_number"
                min="1"
                max="10"
                className="admin-text-input"
                value={form.unit_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              className="admin-text-input"
              placeholder="java, oop, basics"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="admin-save-btn">
            {editingId ? 'Update Answer' : 'Save Answer'}
          </button>
          {editingId && (
            <button
              type="button"
              className="admin-q-btn"
              style={{ marginTop: '-0.5rem' }}
              onClick={() => {
                setEditingId(null);
                setForm({
                  subject_id: '',
                  question: '',
                  answer: '',
                  question_type: '2 Marks',
                  difficulty: 'medium',
                  unit_number: 1,
                  tags: '',
                });
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>

        {/* Right column: Questions List & Search */}
        <div className="space-y-4">
          <div className="flex gap-4 mb-2">
            <input
              type="text"
              className="admin-text-input"
              style={{ flex: 1 }}
              placeholder="Search existing questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="admin-text-input"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.subject_name}</option>
              ))}
            </select>
          </div>

          <div className="admin-questions-list">
            <h3 className="font-bold text-sm text-slate-400 mb-2 uppercase tracking-wide">
              Existing Questions ({questions.length})
            </h3>
            {questions.map((q) => (
              <div key={q.id} className="admin-q-card">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase mr-2">{q.question_type}</span>
                    <span className="text-xs text-slate-400 font-semibold">• Unit {q.unit_number}</span>
                    <h4 className="font-bold text-base text-[var(--db-text-main)] mt-1">{q.question}</h4>
                  </div>
                  <div className="text-xs text-slate-500 font-bold whitespace-nowrap">👁️ {q.views_count} views</div>
                </div>

                <div className="admin-q-actions">
                  <button className="admin-q-btn" onClick={() => handleEditClick(q)}>
                    ✏️ Edit
                  </button>
                  <button className="admin-q-btn delete" onClick={() => handleDeleteClick(q.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
