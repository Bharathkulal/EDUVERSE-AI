import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DEPARTMENT_SUBJECT_MAPPINGS } from './DepartmentSubjectMapping';

export default function AdminPaperUploadStudio({ onOpenViewer }) {
  const [students, setStudents] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showUploadPaperModal, setShowUploadPaperModal] = useState(false);

  // Add Student Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNumber: 'BCA25045',
    department: 'BCA',
    year: '2nd Year',
    semester: '3rd Semester',
    section: 'A',
    email: ''
  });

  // Paper Upload Form State
  const [paperForm, setPaperForm] = useState({
    rollNumber: 'BCA25040',
    studentName: 'Alex Mercer',
    department: 'BCA',
    year: '2nd Year',
    semester: '3rd Semester',
    subjectCode: 'BCA201',
    subjectName: 'Web Development with React',
    pageImages: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80'
    ],
    internal: 24,
    external: 68,
    maxMarks: 100,
    teacherRemarks: 'Excellent React hooks implementation. Well drawn component structure.',
    isPublished: true
  });

  // OCR Processing State for Paper Upload
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResultText, setOcrResultText] = useState('');

  // Highlight Drawing Editor State for Paper Upload
  const [highlightsList, setHighlightsList] = useState([
    { page: 1, x: 15, y: 35, width: 70, height: 18, text: 'Clean Virtual DOM explanation (+10 Marks)', color: 'rgba(34, 197, 94, 0.35)' }
  ]);
  const [newHighlightText, setNewHighlightText] = useState('Step Verified ✓');

  useEffect(() => {
    loadStudioData();
  }, []);

  const loadStudioData = async () => {
    setLoading(true);
    try {
      const [stuRes, papRes] = await Promise.all([
        axios.get('/api/exam-qr/students'),
        axios.get('/api/exam-qr/papers')
      ]);

      if (stuRes.data.success) setStudents(stuRes.data.students || []);
      if (papRes.data.success) setPapers(papRes.data.papers || []);
    } catch (err) {
      console.warn('Backend API error, loaded studio offline fallback state.', err);
    } finally {
      setLoading(false);
    }
  };

  // Student Roll Number Selection Handler for Paper Form
  const handlePaperRollSelect = (e) => {
    const roll = e.target.value;
    const stu = students.find(s => s.rollNumber.toUpperCase() === roll.toUpperCase());
    if (stu) {
      const deptSubjects = (DEPARTMENT_SUBJECT_MAPPINGS[stu.department] || DEPARTMENT_SUBJECT_MAPPINGS.BCA)[stu.year] || [];
      const defaultSub = deptSubjects[0] || { code: 'BCA201', name: 'Web Development with React' };

      setPaperForm({
        ...paperForm,
        rollNumber: stu.rollNumber,
        studentName: stu.name,
        department: stu.department,
        year: stu.year,
        semester: stu.semester,
        subjectCode: defaultSub.code,
        subjectName: defaultSub.name
      });
    }
  };

  // Handle Drag & Drop / File Page Attachment
  const handlePageFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImageUrls = files.map(f => URL.createObjectURL(f));
    setPaperForm(prev => ({
      ...prev,
      pageImages: [...prev.pageImages, ...newImageUrls]
    }));
    toast.success(`Attached ${files.length} scanned page photos!`);
  };

  const handleRemovePage = (index) => {
    setPaperForm(prev => ({
      ...prev,
      pageImages: prev.pageImages.filter((_, idx) => idx !== index)
    }));
  };

  const handleMovePage = (index, direction) => {
    const newPages = [...paperForm.pageImages];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newPages.length) return;
    const temp = newPages[index];
    newPages[index] = newPages[targetIdx];
    newPages[targetIdx] = temp;
    setPaperForm({ ...paperForm, pageImages: newPages });
  };

  // Handle OCR Text Scan Simulation
  const handleRunOcrScan = async () => {
    setIsOcrProcessing(true);
    toast.loading('Running AI OCR Scan & Shadow Removal on Answer Pages...', { id: 'ocr-toast' });
    
    setTimeout(() => {
      setIsOcrProcessing(false);
      const generatedOcr = `[OCR SCAN COMPLETED]\nStudent: ${paperForm.studentName} (${paperForm.rollNumber})\nSubject: ${paperForm.subjectName} (${paperForm.subjectCode})\nTotal Pages Scanned: ${paperForm.pageImages.length}\nAuto-Contrast: 100% Balanced | Shadow Removal: Applied\nExtracted Text: Verified clear handwritten answers.`;
      setOcrResultText(generatedOcr);
      toast.success('OCR Scan & Contrast Enhancement Complete! ✨', { id: 'ocr-toast' });
    }, 1200);
  };

  // Add Highlight Marker
  const handleAddHighlight = () => {
    if (!newHighlightText.trim()) return;
    const newHl = {
      page: 1,
      x: Math.floor(Math.random() * 30) + 15,
      y: Math.floor(Math.random() * 40) + 20,
      width: 60,
      height: 15,
      text: newHighlightText,
      color: 'rgba(34, 197, 94, 0.35)'
    };
    setHighlightsList([...highlightsList, newHl]);
    setNewHighlightText('');
    toast.success('Added highlight remark on Page 1!');
  };

  // Submit Add Student Form
  const handleSubmitAddStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.rollNumber.trim()) return;

    try {
      const res = await axios.post('/api/exam-qr/students', studentForm);
      if (res.data.success) {
        toast.success(`Student ${studentForm.name} (${studentForm.rollNumber}) added!`);
        setShowAddStudentModal(false);
        await loadStudioData();
      }
    } catch (err) {
      toast.error('Failed to add student');
    }
  };

  // Submit Upload Exam Paper Form
  const handleSubmitUploadPaper = async (e) => {
    e.preventDefault();
    if (!paperForm.rollNumber || !paperForm.subjectCode) return;

    toast.loading('Saving Exam Paper & Publishing Result...', { id: 'paper-toast' });

    try {
      const payload = {
        ...paperForm,
        marks: {
          internal: Number(paperForm.internal),
          external: Number(paperForm.external),
          total: Number(paperForm.internal) + Number(paperForm.external),
          maxMarks: Number(paperForm.maxMarks)
        },
        highlights: highlightsList
      };

      const res = await axios.post('/api/exam-qr/papers/upload', payload);
      if (res.data.success) {
        toast.success('Exam Paper uploaded & linked to student record!', { id: 'paper-toast' });
        setShowUploadPaperModal(false);
        await loadStudioData();
      }
    } catch (err) {
      toast.error('Failed to upload exam paper', { id: 'paper-toast' });
    }
  };

  // Toggle Paper Publish Status
  const handleTogglePublish = async (paperId) => {
    try {
      const res = await axios.put(`/api/exam-qr/papers/${paperId}/publish`);
      if (res.data.success) {
        toast.success(res.data.message);
        await loadStudioData();
      }
    } catch (err) {
      toast.error('Failed to toggle publish status');
    }
  };

  // Filtered Papers
  const filteredPapers = papers.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.studentName.toLowerCase().includes(q) || p.rollNumber.toLowerCase().includes(q) || p.subjectCode.toLowerCase().includes(q) || p.subjectName.toLowerCase().includes(q);
    const matchesDept = filterDepartment === 'All' || p.department === filterDepartment;
    const matchesYear = filterYear === 'All' || p.year === filterYear;
    const matchesStatus = filterStatus === 'All' || (filterStatus === 'Published' ? p.isPublished : !p.isPublished);
    return matchesSearch && matchesDept && matchesYear && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER CONTROL BAR */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
              Admin & Lecturer Studio
            </span>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {students.length} Students Registered
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <span>📥</span> Exam Paper Upload & Evaluation Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Add students by roll number, upload scanned answer sheets, perform AI OCR, mark teacher highlights, and publish results.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <span>👤+</span> Add Student Profile
          </button>
          
          <button
            onClick={() => setShowUploadPaperModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <span>📤</span> Upload Scanned Answer Paper
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Roll Number (e.g. BCA25040), Student Name, Subject Code..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <span className="absolute left-3.5 top-3 text-xs text-slate-400">🔍</span>
        </div>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="w-full md:w-44 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-cyan-300 font-bold focus:outline-none"
        >
          <option value="All">All Departments</option>
          <option value="BCA">BCA Department</option>
          <option value="BCOM">BCOM Department</option>
          <option value="BBA">BBA Department</option>
          <option value="Computer Science">Computer Science</option>
          <option value="AI & Data Science">AI & Data Science</option>
        </select>

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="w-full md:w-36 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none"
        >
          <option value="All">All Years</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-36 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none"
        >
          <option value="All">All Status</option>
          <option value="Published">Published 🚀</option>
          <option value="Draft">Draft 📝</option>
        </select>
      </div>

      {/* 3. UPLOADED EXAM PAPERS MANAGEMENT TABLE */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Uploaded Exam Papers & Marks ({filteredPapers.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            Loading Exam Paper Records...
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="p-10 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 space-y-2">
            <p className="text-sm font-bold text-white">No Exam Papers Found 📭</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click <strong>"+ Upload Scanned Answer Paper"</strong> above to upload and evaluate exam papers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="p-3">Student & Roll No</th>
                  <th className="p-3">Department / Year</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Pages / Scans</th>
                  <th className="p-3">Total Marks</th>
                  <th className="p-3">Result Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-slate-950/60 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        {paper.studentName}
                      </p>
                      <span className="font-mono text-[11px] text-cyan-300 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {paper.rollNumber}
                      </span>
                    </td>

                    <td className="p-3">
                      <p className="font-bold text-slate-200">{paper.department}</p>
                      <p className="text-[10px] text-slate-400">{paper.year} • {paper.semester}</p>
                    </td>

                    <td className="p-3">
                      <p className="font-bold text-white">{paper.subjectName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{paper.subjectCode}</p>
                    </td>

                    <td className="p-3 text-slate-300 font-medium">
                      📸 {paper.pages ? paper.pages.length : 1} Scanned Pages
                    </td>

                    <td className="p-3 font-mono">
                      <span className="text-sm font-extrabold text-cyan-300">
                        {paper.marks ? paper.marks.total : 0} / 100
                      </span>
                      <span className="ml-1.5 text-[10px] font-bold text-emerald-400">({paper.grade || 'A'})</span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleTogglePublish(paper.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border ${
                          paper.isPublished
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                      >
                        {paper.isPublished ? 'Published 🚀' : 'Draft Mode 📝'}
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => onOpenViewer(paper)}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        👁️ View Paper & Highlights
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL: ADD STUDENT PROFILE */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add Student Profile</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Alex Mercer"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roll Number (e.g. BCA25040)</label>
                  <input
                    type="text"
                    required
                    value={studentForm.rollNumber}
                    onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-cyan-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={studentForm.department}
                    onChange={e => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="BCA">BCA</option>
                    <option value="BCOM">BCOM</option>
                    <option value="BBA">BBA</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Year</label>
                  <select
                    value={studentForm.year}
                    onChange={e => setStudentForm({ ...studentForm, year: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Semester</label>
                  <input
                    type="text"
                    value={studentForm.semester}
                    onChange={e => setStudentForm({ ...studentForm, semester: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Section</label>
                  <input
                    type="text"
                    value={studentForm.section}
                    onChange={e => setStudentForm({ ...studentForm, section: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: UPLOAD SCANNED EXAM PAPER */}
      {showUploadPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto custom-scrollbar space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Upload & Evaluate Scanned Exam Paper</h3>
              <button onClick={() => setShowUploadPaperModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitUploadPaper} className="space-y-4 text-xs">
              
              {/* Select Student by Roll Number */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Student by Roll Number</label>
                  <select
                    value={paperForm.rollNumber}
                    onChange={handlePaperRollSelect}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 font-mono font-bold"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.rollNumber}>
                        {s.rollNumber} - {s.name} ({s.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject Code & Name</label>
                  <select
                    value={paperForm.subjectCode}
                    onChange={e => {
                      const deptSubs = (DEPARTMENT_SUBJECT_MAPPINGS[paperForm.department] || DEPARTMENT_SUBJECT_MAPPINGS.BCA)[paperForm.year] || [];
                      const sub = deptSubs.find(s => s.code === e.target.value) || { code: e.target.value, name: 'Subject Paper' };
                      setPaperForm({ ...paperForm, subjectCode: sub.code, subjectName: sub.name });
                    }}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold"
                  >
                    {((DEPARTMENT_SUBJECT_MAPPINGS[paperForm.department] || DEPARTMENT_SUBJECT_MAPPINGS.BCA)[paperForm.year] || []).map(s => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scanned Pages Manager */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-cyan-300 uppercase tracking-wider">
                    Scanned Answer Sheet Pages ({paperForm.pageImages.length})
                  </span>
                  
                  <label className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl cursor-pointer shadow-md">
                    + Attach Scanned Photos
                    <input type="file" multiple accept="image/*" onChange={handlePageFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Page Reorder & Preview Bar */}
                <div className="flex items-center gap-3 overflow-x-auto p-2 custom-scrollbar">
                  {paperForm.pageImages.map((img, idx) => (
                    <div key={idx} className="relative group w-24 h-28 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shrink-0">
                      <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono font-bold text-white rounded">
                        P{idx + 1}
                      </div>

                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                        <button
                          type="button"
                          onClick={() => handleMovePage(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 bg-slate-800 text-white rounded text-[10px] disabled:opacity-30"
                          title="Move Left"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePage(idx)}
                          className="p-1 bg-rose-600 text-white rounded text-[10px]"
                          title="Delete Page"
                        >
                          🗑️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePage(idx, 1)}
                          disabled={idx === paperForm.pageImages.length - 1}
                          className="p-1 bg-slate-800 text-white rounded text-[10px] disabled:opacity-30"
                          title="Move Right"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI OCR Trigger */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleRunOcrScan}
                    disabled={isOcrProcessing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                  >
                    <span>🧠</span> {isOcrProcessing ? 'Scanning OCR...' : 'Trigger AI OCR & Shadow Removal'}
                  </button>

                  {ocrResultText && (
                    <span className="text-[11px] text-emerald-400 font-bold">✓ OCR Extracted & Enhanced</span>
                  )}
                </div>
              </div>

              {/* Marks & Teacher Highlight Tools */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Internal Marks (/30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={paperForm.internal}
                    onChange={e => setPaperForm({ ...paperForm, internal: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">External Marks (/70)</label>
                  <input
                    type="number"
                    min="0"
                    max="70"
                    value={paperForm.external}
                    onChange={e => setPaperForm({ ...paperForm, external: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Score</label>
                  <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 font-mono font-extrabold text-sm">
                    {Number(paperForm.internal) + Number(paperForm.external)} / 100
                  </div>
                </div>
              </div>

              {/* Add Highlight Remark Tool */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-extrabold text-amber-300">Highlight Marker Tool</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newHighlightText}
                    onChange={e => setNewHighlightText(e.target.value)}
                    placeholder="e.g. Best Answer +10 or Step 2 Error"
                    className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                  >
                    + Add Highlight
                  </button>
                </div>
              </div>

              {/* Teacher Remarks */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Teacher Remarks & Feedback</label>
                <textarea
                  rows={2}
                  value={paperForm.teacherRemarks}
                  onChange={e => setPaperForm({ ...paperForm, teacherRemarks: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              {/* Publish Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-emerald-300 font-bold">
                  <input
                    type="checkbox"
                    checked={paperForm.isPublished}
                    onChange={e => setPaperForm({ ...paperForm, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  Publish Immediately to Student Portal (🚀 Accessible by Roll Number)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadPaperModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md"
                >
                  Publish Answer Sheet & Marks 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
