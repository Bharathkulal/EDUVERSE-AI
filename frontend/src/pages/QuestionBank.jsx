import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './QuestionBank.css';

const TABS = [
  { id: 'all', label: 'All Questions' },
  { id: '2 Marks', label: '2 Marks' },
  { id: '5 Marks', label: '5 Marks' },
  { id: '10 Marks', label: '10 Marks' },
  { id: 'Important Question', label: 'Important Questions' },
  { id: 'Previous Year Question', label: 'Previous Year Qs' },
];

export default function QuestionBank() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  // Filters
  const [selectedTab, setSelectedTab] = useState('all');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterUnit, setFilterUnit] = useState('');

  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [questions]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 250) {
        setVisibleCount((prev) => Math.min(prev + 10, questions.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [questions.length]);

  useEffect(() => {
    // Fetch subjects list for dropdown
    api.get('/subjects')
      .then((res) => {
        const uniqueSubjects = [];
        const seen = new Set();
        for (const item of res.data) {
          if (!seen.has(item.subject_name)) {
            seen.add(item.subject_name);
            uniqueSubjects.push(item);
          }
        }
        setSubjects(uniqueSubjects);
      })
      .catch((err) => console.error('Error fetching subjects:', err));
  }, []);

  const fetchQuestions = () => {
    setLoading(true);
    const params = {};
    if (selectedTab !== 'all') {
      params.question_type = selectedTab;
    }
    if (filterSubject) {
      params.subject_id = filterSubject;
    }
    if (filterDifficulty) {
      params.difficulty = filterDifficulty;
    }
    if (filterUnit) {
      params.unit_number = filterUnit;
    }

    api.get('/questions', { params })
      .then((res) => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load questions.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedTab, filterSubject, filterDifficulty, filterUnit]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResult(null);
    toast.loading('Searching model answers & database...', { id: 'search' });

    try {
      const res = await api.post('/questions/search', { query: searchQuery });
      setSearchResult(res.data);
      toast.success(`Answer fetched from ${res.data.source}!`, { id: 'search' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to answer query. Please try again.', { id: 'search' });
    } finally {
      setSearching(false);
    }
  };

  const handleToggleBookmark = async (id) => {
    try {
      const res = await api.post(`/questions/${id}/bookmark`);
      toast.success(res.data.bookmarked ? 'Question bookmarked!' : 'Bookmark removed.');
      fetchQuestions();
    } catch (err) {
      console.error(err);
      toast.error('Action failed.');
    }
  };

  const handleToggleCompleted = async (id) => {
    try {
      const res = await api.post(`/questions/${id}/complete`);
      toast.success(res.data.completed ? 'Marked as completed!' : 'Marked incomplete.');
      fetchQuestions();
    } catch (err) {
      console.error(err);
      toast.error('Action failed.');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Answer copied to clipboard!');
  };

  const handleDownloadPDF = (title, content) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 30px; }
            h1 { font-size: 24px; color: #111827; margin: 0; }
            .meta { font-size: 13px; color: #6b7280; margin-top: 5px; }
            .content { font-size: 15px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Question: ${title}</h1>
            <div class="meta">EduVerse AI Question Bank - Model Answer</div>
          </div>
          <div class="content">${content}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="qb-container">
      <div className="qb-header-section flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Smart Question Bank</h1>
          <p className="text-slate-500">Access verified model answers and AI-driven revision tools instantly.</p>
        </div>
        {isAdmin && (
          <button 
            type="button"
            onClick={() => navigate('/admin/questions')}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition duration-300 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            ⚙️ Switch to Admin Database Editor
          </button>
        )}
      </div>

      {/* Smart Search Bar */}
      <div className="qb-search-wrapper">
        <form onSubmit={handleSearchSubmit} className="qb-search-box">
          <input
            type="text"
            className="qb-search-input"
            placeholder="Type your question... (e.g. 'Explain Features of Java for 5 marks')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="qb-search-btn" disabled={searching}>
            {searching ? 'Analyzing...' : '🧠 Ask System'}
          </button>
        </form>

        <AnimatePresence>
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="qb-search-result"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="qb-source-badge">
                  ⚡ Source: {searchResult.source} {searchResult.provider ? `(${searchResult.provider})` : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    className="qb-footer-btn"
                    onClick={() => handleCopy(searchResult.answer)}
                  >
                    📋 Copy
                  </button>
                  <button
                    className="qb-footer-btn"
                    onClick={() => handleDownloadPDF(searchResult.question, searchResult.answer)}
                  >
                    📥 PDF
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#ffffff' }}>
                {searchResult.question}
              </h3>
              <div
                className="qb-answer-box text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: searchResult.answer.replace(/\n/g, '<br />') }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters Area */}
      <div className="qb-search-wrapper" style={{ padding: '1.25rem' }}>
        <div className="qb-filter-grid">
          <div className="qb-filter-field">
            <label className="qb-filter-label">Subject</label>
            <select
              className="qb-filter-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.subject_name}</option>
              ))}
            </select>
          </div>

          <div className="qb-filter-field">
            <label className="qb-filter-label">Difficulty</label>
            <select
              className="qb-filter-select"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="qb-filter-field">
            <label className="qb-filter-label">Unit Number</label>
            <select
              className="qb-filter-select"
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
            >
              <option value="">All Units</option>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>Unit {num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="qb-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`qb-tab-btn ${selectedTab === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-800" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No questions found matching the criteria. Add some questions from the Admin section.
        </div>
      ) : (
        <div className="qb-cards-grid">
          {questions.slice(0, visibleCount).map((q) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              key={q.id}
              className="qb-card"
            >
              <div className="qb-card-header">
                <div className="qb-card-meta">
                  <span className="qb-meta-tag type">{q.question_type}</span>
                  <span className={`qb-meta-tag diff-${q.difficulty}`}>{q.difficulty}</span>
                  <span className="text-xs text-slate-400 font-semibold">Unit {q.unit_number}</span>
                  <span className="text-xs text-slate-400 font-semibold">• {q.subject_name}</span>
                </div>
                <div className="qb-card-actions">
                  <button
                    className={`qb-action-icon ${q.bookmarked ? 'active' : ''}`}
                    onClick={() => handleToggleBookmark(q.id)}
                    title="Bookmark Question"
                  >
                    🔖
                  </button>
                  <button
                    className={`qb-action-icon completed ${q.completed ? 'active' : ''}`}
                    onClick={() => handleToggleCompleted(q.id)}
                    title="Mark as Completed"
                  >
                    ✓
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[var(--db-text-main)] mb-3">
                  {q.question}
                </h3>
                <div
                  className="qb-answer-box text-sm text-slate-300"
                  dangerouslySetInnerHTML={{ __html: q.answer.replace(/\n/g, '<br />') }}
                />
              </div>

              <div className="qb-answer-footer">
                <button
                  className="qb-footer-btn"
                  onClick={() => handleCopy(q.answer)}
                >
                  📋 Copy Answer
                </button>
                <button
                  className="qb-footer-btn"
                  onClick={() => handleDownloadPDF(q.question, q.answer)}
                >
                  📥 Download PDF
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
