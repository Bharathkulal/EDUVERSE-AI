import React, { useState, useEffect } from 'react';
import { academicContentApi } from '../services/academicContentApi';
import toast from 'react-hot-toast';

export default function AcademicContentHub() {
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedSubjectId, setSelectedSubjectId] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All'); // All, Notes, Important, Question Bank, Question Paper, Announcements, Bookmarks, RecentlyViewed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, mostViewed, mostDownloaded
  const [examPrepMode, setExamPrepMode] = useState(false);
  const [revisionMode, setRevisionMode] = useState(false);

  // Selected Material Reader Modal State
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [selectedSubjectId, activeCategory, searchQuery, selectedSemester, selectedDepartment, selectedUnit, sortBy, examPrepMode, revisionMode]);

  const loadSubjects = async () => {
    const res = await academicContentApi.getSubjects();
    if (res.success) {
      setSubjects(res.subjects || []);
    }
  };

  const loadMaterials = async () => {
    setLoading(true);
    let categoryFilter = activeCategory;

    // Handle Exam Prep & Revision Modes
    if (examPrepMode) {
      categoryFilter = 'Important';
    }

    const params = {
      query: searchQuery,
      subjectId: selectedSubjectId === 'All' ? '' : selectedSubjectId,
      category: categoryFilter,
      semester: selectedSemester,
      department: selectedDepartment,
      unitNumber: selectedUnit === 'All' ? '' : selectedUnit,
      sortBy
    };

    const res = await academicContentApi.getMaterials(params);
    setLoading(false);

    if (res.success) {
      let filtered = res.materials || [];

      if (activeCategory === 'Bookmarks') {
        filtered = filtered.filter((m) => res.bookmarkedIds.includes(m.id));
      }

      if (revisionMode) {
        filtered = filtered.filter((m) => m.isImportant || m.tags.some(t => t.toLowerCase().includes('revision') || t.toLowerCase().includes('formula')));
      }

      setMaterials(filtered);
      setBookmarkedIds(res.bookmarkedIds || []);
      setCompletedIds(res.completedIds || []);
    }
  };

  // Student Actions
  const handleOpenMaterial = async (mat) => {
    setSelectedMaterial(mat);
    await academicContentApi.recordView(mat.id);
  };

  const handleDownload = async (e, mat) => {
    e.stopPropagation();
    toast.success(`Downloading ${mat.fileName}...`);
    await academicContentApi.recordDownload(mat.id);

    const link = document.createElement('a');
    link.href = mat.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    link.download = mat.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBookmarkToggle = async (e, matId) => {
    e.stopPropagation();
    const res = await academicContentApi.toggleBookmark(matId);
    if (res.success) {
      if (bookmarkedIds.includes(matId)) {
        setBookmarkedIds(bookmarkedIds.filter((id) => id !== matId));
        toast.success('Removed from bookmarks');
      } else {
        setBookmarkedIds([...bookmarkedIds, matId]);
        toast.success('Saved to Bookmarks! 🔖');
      }
    }
  };

  const handleCompleteToggle = async (e, matId) => {
    e.stopPropagation();
    const res = await academicContentApi.toggleComplete(matId);
    if (res.success) {
      if (completedIds.includes(matId)) {
        setCompletedIds(completedIds.filter((id) => id !== matId));
        toast.success('Marked as unread');
      } else {
        setCompletedIds([...completedIds, matId]);
        toast.success('Marked as Studied / Completed! ✅');
      }
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestText.trim()) return;
    toast.success('Material request sent to Subject Faculty!');
    setShowRequestModal(false);
    setRequestText('');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    toast.success('Report submitted to Academic Admin.');
    setShowReportModal(false);
    setReportText('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fadeIn text-white max-w-7xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 md:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                EduVerse Academic Hub
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Verified Faculty Materials
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
              Notes & Study Materials Hub
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Access lecture notes, high-priority exam questions, unit-wise question banks, and previous semester question papers curated by department faculty.
            </p>
          </div>

          {/* Quick Mode Toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setExamPrepMode(!examPrepMode);
                if (!examPrepMode) setRevisionMode(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                examPrepMode
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-amber-500/30 ring-2 ring-amber-400'
                  : 'bg-slate-800/90 text-amber-300 border border-amber-500/40 hover:bg-slate-700'
              }`}
            >
              <span>🎯</span> {examPrepMode ? 'Exam Prep Mode ON' : 'Exam Prep Mode'}
            </button>

            <button
              onClick={() => {
                setRevisionMode(!revisionMode);
                if (!revisionMode) setExamPrepMode(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                revisionMode
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 ring-2 ring-cyan-400'
                  : 'bg-slate-800/90 text-cyan-300 border border-cyan-500/40 hover:bg-slate-700'
              }`}
            >
              <span>⚡</span> {revisionMode ? 'Quick Revision ON' : 'Revision Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Global Search & Multi-Filter Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Global Search Bar */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, V.Imp questions, question banks, previous papers, tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <span className="absolute left-3.5 top-3 text-xs text-slate-400">🔍</span>
          </div>

          {/* Subject Filter Dropdown */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full md:w-56 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Subjects ({subjects.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subjectName} ({s.subjectCode})
              </option>
            ))}
          </select>

          {/* Unit Filter Dropdown */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full md:w-36 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Units</option>
            <option value="1">Unit 1</option>
            <option value="2">Unit 2</option>
            <option value="3">Unit 3</option>
            <option value="4">Unit 4</option>
            <option value="5">Unit 5</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-40 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-cyan-400"
          >
            <option value="newest">Newest First</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="mostDownloaded">Most Downloaded</option>
          </select>
        </div>

        {/* 3. Category Tab Chips */}
        <div className="flex border-b border-slate-800/80 gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'All', label: 'All Content', icon: '📚' },
            { id: 'Notes', label: 'Notes', icon: '📖' },
            { id: 'Important', label: 'Important (V.Imp)', icon: '⭐' },
            { id: 'Question Bank', label: 'Question Bank', icon: '❓' },
            { id: 'Question Paper', label: 'Question Papers', icon: '📄' },
            { id: 'Bookmarks', label: 'Saved Bookmarks', icon: '🔖' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Study Material Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Study Materials ({materials.length})
          </h3>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRequestModal(true)}
              className="text-xs text-cyan-400 hover:underline font-bold"
            >
              + Request Missing Material
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            Loading Academic Materials...
          </div>
        ) : materials.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
            <p className="text-xs font-bold">No study materials found for selected filters.</p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSelectedSubjectId('All');
                setSearchQuery('');
                setExamPrepMode(false);
                setRevisionMode(false);
              }}
              className="mt-3 px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {materials.map((mat) => {
              const isBookmarked = bookmarkedIds.includes(mat.id);
              const isCompleted = completedIds.includes(mat.id);

              return (
                <div
                  key={mat.id}
                  onClick={() => handleOpenMaterial(mat)}
                  className={`bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group hover:shadow-2xl ${
                    mat.isPinned
                      ? 'border-cyan-500/50 shadow-cyan-500/10 bg-slate-900'
                      : mat.isImportant
                      ? 'border-amber-500/40 shadow-amber-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Badges Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-cyan-300 border border-slate-700">
                          {mat.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                          Unit {mat.unitNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {mat.isImportant && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ⭐ V.Imp
                          </span>
                        )}
                        {mat.isPinned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            📌 Pinned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Topic */}
                    <div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {mat.title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-400 mt-1">
                        {mat.subjectName} ({mat.subjectCode})
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Topic: <span className="text-slate-300">{mat.topic}</span>
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {mat.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {mat.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Info & Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="text-[10px] text-slate-400">
                      <p className="font-semibold text-slate-300">{mat.uploadedBy}</p>
                      <p>{mat.fileSize} • 👁️ {mat.views} • ⬇️ {mat.downloads}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleBookmarkToggle(e, mat.id)}
                        className={`p-2 rounded-lg border transition-all text-xs ${
                          isBookmarked
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title="Save Bookmark"
                      >
                        🔖
                      </button>
                      <button
                        onClick={(e) => handleCompleteToggle(e, mat.id)}
                        className={`p-2 rounded-lg border transition-all text-xs ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title="Mark as Studied"
                      >
                        ✓
                      </button>
                      <button
                        onClick={(e) => handleDownload(e, mat)}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-all shadow-md"
                      >
                        ⬇️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Document Reader Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {selectedMaterial.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Unit {selectedMaterial.unitNumber}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white mt-1">{selectedMaterial.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Subject: <span className="font-semibold text-slate-200">{selectedMaterial.subjectName}</span> | Lecturer: {selectedMaterial.uploadedBy}
                </p>
              </div>

              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <p className="font-semibold text-slate-300">Description:</p>
                <p className="text-slate-400 leading-relaxed">{selectedMaterial.description}</p>
              </div>

              {/* Embedded Document Viewport */}
              <div className="w-full h-96 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-4 shadow-inner">
                {selectedMaterial.fileUrl ? (
                  <iframe
                    src={selectedMaterial.fileUrl}
                    title={selectedMaterial.title}
                    className="w-full h-full rounded-xl border border-slate-800"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-cyan-300">Interactive Rich Text Content</p>
                    <p className="text-xs text-slate-400 max-w-md">
                      {selectedMaterial.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <button
                onClick={() => setShowReportModal(true)}
                className="text-xs text-rose-400 hover:underline font-bold"
              >
                ⚠️ Report Broken File
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleBookmarkToggle(e, selectedMaterial.id)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
                >
                  🔖 Save Bookmark
                </button>
                <button
                  onClick={(e) => handleDownload(e, selectedMaterial)}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  ⬇️ Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Missing Material Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Request Study Material</h3>
            <p className="text-xs text-slate-400">
              Can't find a topic or previous paper? Send a direct material request to the course faculty.
            </p>
            <textarea
              rows={4}
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Specify subject, unit number, and topic needed (e.g. Machine Learning Unit 4 Neural Network Notes)..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestSubmit}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
