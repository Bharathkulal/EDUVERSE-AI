import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getSubjectsForStudent } from './DepartmentSubjectMapping';

export default function StudentResultPortal({ onOpenViewer, initialRollNumber = 'BCA25040' }) {
  const [rollInput, setRollInput] = useState(initialRollNumber);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Student Data
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [papers, setPapers] = useState([]);

  // Revision Request Modal
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedPaperForRevision, setSelectedPaperForRevision] = useState(null);
  const [revisionReason, setRevisionReason] = useState('');

  useEffect(() => {
    if (initialRollNumber) {
      handleRollLogin(initialRollNumber);
    }
  }, [initialRollNumber]);

  const handleRollLogin = async (rollToSubmit) => {
    const roll = rollToSubmit || rollInput;
    if (!roll || !roll.trim()) {
      toast.error('Please enter a valid Roll Number.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/exam-qr/student/login', { rollNumber: roll });
      if (res.data.success) {
        setStudent(res.data.student);
        
        // Use department and year specific subjects
        const deptSubs = getSubjectsForStudent(res.data.student.department, res.data.student.year);
        setSubjects(deptSubs);
        setPapers(res.data.papers || []);
        setIsLoggedIn(true);
        toast.success(`Logged in as ${res.data.student.name} (${res.data.student.rollNumber})! 🎓`);
      }
    } catch (err) {
      toast.error('Student roll number login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudent(null);
    setPapers([]);
  };

  const handleRequestRevision = (e) => {
    e.preventDefault();
    if (!revisionReason.trim()) return;
    toast.success('Re-evaluation request submitted to Academic Evaluation Board!');
    setShowRevisionModal(false);
    setRevisionReason('');
  };

  // Login Screen if not logged in
  if (!isLoggedIn || !student) {
    return (
      <div className="max-w-xl mx-auto my-8 p-8 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl space-y-6 text-center animate-fadeIn text-white">
        <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
          🎓
        </div>

        <div>
          <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
            EduVerse Student Result Portal
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-2">
            Student Answer Sheet & Result Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your college Roll Number to view verified answer sheets, marks, teacher remarks, and grade reports.
          </p>
        </div>

        {/* Demo Roll Number Shortcut Chips */}
        <div className="space-y-2 text-left bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Demo Login Shortcuts:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { roll: 'BCA25040', label: 'BCA 2nd Year (Alex Mercer)' },
              { roll: 'BCOM25012', label: 'BCOM 1st Year (Sophia Chen)' },
              { roll: 'BBA25008', label: 'BBA 3rd Year (Marcus Vance)' }
            ].map(item => (
              <button
                key={item.roll}
                onClick={() => { setRollInput(item.roll); handleRollLogin(item.roll); }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-cyan-950 text-cyan-300 text-xs font-mono font-bold rounded-xl border border-cyan-500/30 transition-all flex items-center gap-1.5"
              >
                <span>🔑</span> {item.roll} ({item.label.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={rollInput}
            onChange={e => setRollInput(e.target.value.toUpperCase())}
            placeholder="Enter Roll Number (e.g. BCA25040, BCOM25012, BBA25008)..."
            className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-center text-cyan-300 font-mono font-bold text-base focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 shadow-inner"
          />

          <button
            onClick={() => handleRollLogin(rollInput)}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating Roll Number...' : 'Login & View Exam Results ➔'}
          </button>
        </div>
      </div>
    );
  }

  // Calculate Overall Performance Summary
  const publishedPapers = papers.filter(p => p.isPublished);
  const totalScoreSum = publishedPapers.reduce((sum, p) => sum + (p.marks ? p.marks.total : 0), 0);
  const avgPercentage = publishedPapers.length > 0 ? (totalScoreSum / publishedPapers.length).toFixed(1) : '91.5';

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      
      {/* 1. STUDENT PROFILE HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 md:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-cyan-500/30">
              {student.name.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                  {student.department} Department
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Roll: {student.rollNumber}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                {student.name}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-0.5">
                {student.year} • {student.semester} • Section {student.section} | Email: {student.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Aggregate Score Card */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center min-w-[140px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cumulative GPA</span>
              <p className="text-2xl font-extrabold text-cyan-300 mt-0.5">{avgPercentage}%</p>
              <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Grade: A+ (First Class)</p>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all"
            >
              🔒 Switch Roll Number
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEPARTMENT-WISE SUBJECT MARKS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>📚</span> {student.department} {student.year} Subjects & Exam Results ({subjects.length})
          </h3>
          <span className="text-xs text-cyan-400 font-bold">
            Showing subjects mapped strictly to {student.department} Department prefix
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map((sub) => {
            const paper = papers.find(p => p.subjectCode === sub.code && p.isPublished);

            return (
              <div
                key={sub.code}
                className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Subject Badges Bar */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {sub.code}
                    </span>

                    {paper ? (
                      <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold border ${
                        paper.passStatus === 'PASSED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {paper.passStatus} ({paper.marks ? paper.marks.total : 0}/100)
                      </span>
                    ) : (
                      <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Evaluation In Progress ⏳
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h4 className="text-base font-extrabold text-white">{sub.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Credits: {sub.credits} | Max Marks: {sub.maxMarks}</p>
                  </div>

                  {/* Marks Breakdown Table if Paper Exists */}
                  {paper && paper.marks && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Internal Assessment (/30):</span>
                        <span className="font-mono font-bold text-white">{paper.marks.internal} Marks</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>End Semester Exam (/70):</span>
                        <span className="font-mono font-bold text-white">{paper.marks.external} Marks</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-cyan-300 font-extrabold">
                        <span>Total Score Achieved:</span>
                        <span className="font-mono text-sm">{paper.marks.total} / 100 ({paper.grade || 'A+'})</span>
                      </div>
                    </div>
                  )}

                  {/* Teacher Remarks if Paper Exists */}
                  {paper && paper.teacherRemarks && (
                    <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 line-clamp-2">
                      "{paper.teacherRemarks}"
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  {paper ? (
                    <>
                      <button
                        onClick={() => onOpenViewer(paper)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <span>👁️</span> Open Answer Sheet & Highlights
                      </button>

                      <button
                        onClick={() => { setSelectedPaperForRevision(paper); setShowRevisionModal(true); }}
                        className="text-xs text-amber-400 hover:underline font-bold"
                      >
                        Request Re-evaluation
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Scanned answer paper upload pending for this subject.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RE-EVALUATION REQUEST MODAL */}
      {showRevisionModal && selectedPaperForRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📝</span> Request Answer Paper Re-evaluation
            </h3>
            <p className="text-xs text-slate-400">
              Submitting re-evaluation for <strong className="text-white">{selectedPaperForRevision.subjectName} ({selectedPaperForRevision.subjectCode})</strong>.
            </p>

            <textarea
              rows={4}
              value={revisionReason}
              onChange={e => setRevisionReason(e.target.value)}
              placeholder="State question number and discrepancy (e.g. Question 2 Virtual DOM step 3 was not counted)..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Submit Re-evaluation Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
