import React, { useState, useEffect } from 'react';
import { QrCryptoEngine } from '../../services/ExamAI/QrCryptoEngine';
import { examQrApi } from '../../services/ExamAI/examQrApi';
import toast from 'react-hot-toast';

export default function AdminQrFactory() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Exam Form state
  const [newExam, setNewExam] = useState({
    subject: 'Machine Learning & AI',
    subjectCode: 'CS801',
    department: 'Computer Science',
    semester: '7th Semester',
    section: 'A',
    facultyName: 'Dr. Sarah Jenkins',
    examDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadQrCodes(selectedExamId);
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    setLoading(true);
    const res = await examQrApi.getExams();
    setLoading(false);
    if (res.success && res.exams.length > 0) {
      setExams(res.exams);
      setSelectedExamId(res.exams[0].id);
    }
  };

  const loadQrCodes = async (examId) => {
    setLoading(true);
    const res = await examQrApi.getQrCodes(examId);
    setLoading(false);
    if (res.success) {
      setQrCodes(res.qrCodes || []);
    }
  };

  const handleCreateExamSubmit = async (e) => {
    e.preventDefault();
    toast.loading('Creating exam & allocating student roster...', { id: 'create-exam' });
    const res = await examQrApi.createExam(newExam);
    if (res.success) {
      toast.success(`Exam created: ${res.exam.subject}`, { id: 'create-exam' });
      setShowCreateModal(false);
      await loadExams();
      setSelectedExamId(res.exam.id);
    } else {
      toast.error('Failed to create exam', { id: 'create-exam' });
    }
  };

  const handleGenerateQrs = async () => {
    if (!selectedExamId) return;
    toast.loading('Generating HMAC-SHA256 Encrypted QR Tokens...', { id: 'gen-qr' });
    const res = await examQrApi.generateQrCodes(selectedExamId);
    if (res.success) {
      toast.success(`Generated ${res.count || 4} unique encrypted QR codes!`, { id: 'gen-qr' });
      await loadQrCodes(selectedExamId);
    }
  };

  const handleBulkDispatch = async (channel) => {
    toast.loading(`Dispatching QR sheets via ${channel}...`, { id: 'bulk-dispatch' });
    const res = await examQrApi.bulkNotify(selectedExamId, channel);
    if (res.success) {
      toast.success(res.message, { id: 'bulk-dispatch' });
    }
  };

  const handlePrintQrSheetGrid = () => {
    window.print();
  };

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>🛡️</span> Admin Exam & QR Factory
          </h2>
          <p className="text-xs text-slate-400">
            Create Exam Schedules, Generate HMAC Encrypted QR Sheets, and Dispatch via Email/WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <span>+</span> Create New Exam
          </button>
        </div>
      </div>

      {/* 2. Exam Selector & Action Toolbar */}
      {selectedExam && (
        <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Active Exam:</span>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.subject} ({ex.subjectCode}) - {ex.examDate}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dept: <span className="font-semibold text-slate-200">{selectedExam.department}</span> | Sem: <span className="font-semibold text-slate-200">{selectedExam.semester}</span> | Faculty: <span className="font-semibold text-slate-200">{selectedExam.facultyName}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerateQrs}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>⚡</span> Generate All QR Codes
              </button>
              <button
                onClick={() => handleBulkDispatch('Email')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              >
                📧 Bulk Email QR
              </button>
              <button
                onClick={() => handleBulkDispatch('WhatsApp')}
                className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 transition-colors"
              >
                💬 Bulk WhatsApp
              </button>
              <button
                onClick={handlePrintQrSheetGrid}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
              >
                🖨️ Print Sheets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Printable QR Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Student QR Code Sheets ({qrCodes.length})
          </h3>
          <span className="text-xs text-slate-500">Every QR code contains encrypted digital signatures</span>
        </div>

        {qrCodes.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
            <p className="text-xs">No QR codes generated yet for this exam.</p>
            <button
              onClick={handleGenerateQrs}
              className="mt-3 px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl"
            >
              Generate QR Codes Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {qrCodes.map((qr) => {
              const svgDataUrl = QrCryptoEngine.generateQrSvgUri(qr.qrToken, 180);
              return (
                <div
                  key={qr.id}
                  className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/50 shadow-xl flex flex-col items-center text-center space-y-3 transition-all group"
                >
                  {/* Student Info */}
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {qr.status}
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1.5">{qr.studentName}</h4>
                    <p className="text-xs font-mono font-bold text-cyan-400">{qr.rollNumber}</p>
                    <p className="text-[10px] text-slate-400">{qr.subject}</p>
                  </div>

                  {/* Scannable SVG QR Code */}
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 shadow-inner group-hover:border-cyan-400/60 transition-colors">
                    <img src={svgDataUrl} alt="Student QR" className="w-36 h-36" />
                  </div>

                  <p className="text-[9px] font-mono text-slate-500 truncate w-full">
                    Token: {qr.id}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Exam Schedule</h3>
            <form onSubmit={handleCreateExamSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newExam.subject}
                  onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newExam.subjectCode}
                    onChange={(e) => setNewExam({ ...newExam, subjectCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={newExam.department}
                    onChange={(e) => setNewExam({ ...newExam, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Semester</label>
                  <input
                    type="text"
                    required
                    value={newExam.semester}
                    onChange={(e) => setNewExam({ ...newExam, semester: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={newExam.examDate}
                    onChange={(e) => setNewExam({ ...newExam, examDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Faculty Name</label>
                <input
                  type="text"
                  required
                  value={newExam.facultyName}
                  onChange={(e) => setNewExam({ ...newExam, facultyName: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md"
                >
                  Save & Generate QRs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
