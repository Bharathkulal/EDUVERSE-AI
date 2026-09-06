import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ExamCommandCenter.css';

import AdminPaperUploadStudio from '../components/ExamAI/AdminPaperUploadStudio';
import StudentResultPortal from '../components/ExamAI/StudentResultPortal';
import InteractivePaperViewer from '../components/ExamAI/InteractivePaperViewer';
import toast from 'react-hot-toast';

export default function ExamCommandCenter() {
  const [activeRole, setActiveRole] = useState('student-portal'); // 'student-portal' | 'admin-studio'
  const [currentRollNumber, setCurrentRollNumber] = useState('BCA25040');
  const [selectedPaperForViewer, setSelectedPaperForViewer] = useState(null);

  const handleOpenViewer = (paper) => {
    setSelectedPaperForViewer(paper);
  };

  const handleQuickRollSwitch = (roll) => {
    setCurrentRollNumber(roll);
    setActiveRole('student-portal');
    toast.success(`Switched portal view to Roll Number: ${roll}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      
      {/* 1. FUTURISTIC HEADER CONTROL CENTER */}
      <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                EduVerse Academic Core
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Department Verified Answers
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
              <span>📝</span> Exam Paper Management System
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Digital answer sheet portal for uploading scanned exam papers, AI OCR text extraction, teacher highlight annotations, and student roll number result verification.
            </p>
          </div>

          {/* Role Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveRole('student-portal')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-md ${
                activeRole === 'student-portal'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>🎓</span> Student Result Portal
            </button>

            <Link
              to="/admin/exam-papers"
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 shadow-md"
            >
              <span>👨‍🏫</span> Open Admin Section ➔
            </Link>
          </div>
        </div>

        {/* 2. DEMO QUICK ROLL NUMBER SWITCHBAR */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Quick Roll Number Switcher:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { roll: 'BCA25040', label: 'BCA 2nd Yr' },
                { roll: 'BCOM25012', label: 'BCOM 1st Yr' },
                { roll: 'BBA25008', label: 'BBA 3rd Yr' }
              ].map((item) => (
                <button
                  key={item.roll}
                  onClick={() => handleQuickRollSwitch(item.roll)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all text-[11px] border ${
                    currentRollNumber === item.roll && activeRole === 'student-portal'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {item.roll} ({item.label})
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Roll Number & Department Subject Mapping Active</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKFLOW SECTION */}
      {activeRole === 'admin-studio' ? (
        <AdminPaperUploadStudio onOpenViewer={handleOpenViewer} />
      ) : (
        <StudentResultPortal
          onOpenViewer={handleOpenViewer}
          initialRollNumber={currentRollNumber}
        />
      )}

      {/* 4. INTERACTIVE DOCUMENT & SCANNED PAPER VIEWER OVERLAY */}
      {selectedPaperForViewer && (
        <InteractivePaperViewer
          paper={selectedPaperForViewer}
          onClose={() => setSelectedPaperForViewer(null)}
        />
      )}
    </div>
  );
}
