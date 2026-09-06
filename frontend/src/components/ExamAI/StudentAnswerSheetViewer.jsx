import React, { useState, useEffect } from 'react';
import { examQrApi } from '../../services/ExamAI/examQrApi';
import toast from 'react-hot-toast';

export default function StudentAnswerSheetViewer() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState(null);

  // Viewer state
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOcrPanel, setShowOcrPanel] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueReason, setIssueReason] = useState('');

  useEffect(() => {
    fetchAnswerSheets();
  }, []);

  const fetchAnswerSheets = async () => {
    setLoading(true);
    const res = await examQrApi.getStudentAnswerSheets('STU-1001');
    setLoading(false);

    if (res.success && res.answerSheets.length > 0) {
      setSheets(res.answerSheets);
      setSelectedSheet(res.answerSheets[0]);
    }
  };

  const handleDownloadPdf = () => {
    toast.success(`Downloading PDF booklet for ${selectedSheet.subject}...`);
    const link = document.createElement('a');
    link.href = selectedSheet.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    link.download = `${selectedSheet.subjectCode}_AnswerSheet_${selectedSheet.rollNumber}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReportIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueReason.trim()) return;
    toast.success('Re-upload request submitted to Exam Cell!');
    setShowIssueModal(false);
    setIssueReason('');
  };

  // OCR Search Highlight Helper
  const getHighlightedText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-400 text-slate-950 font-bold px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase font-bold tracking-widest">Loading Answer Sheets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header & Subject Select Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>📄</span> My Answer Sheets Portal
          </h2>
          <p className="text-xs text-slate-400">View, Search, Print and Audit your scanned exam booklets</p>
        </div>

        {/* Subject Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400">Select Exam:</label>
          <select
            value={selectedSheet?.id || ''}
            onChange={(e) => {
              const sheet = sheets.find((s) => s.id === e.target.value);
              if (sheet) {
                setSelectedSheet(sheet);
                setActivePageIndex(0);
              }
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400"
          >
            {sheets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject} ({s.subjectCode}) - {s.examDate}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSheet && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Metadata & Thumbnails */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Sheet Info Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {selectedSheet.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedSheet.pagesCount} Pages
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{selectedSheet.subject}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Faculty: {selectedSheet.facultyName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Uploaded: {new Date(selectedSheet.uploadTime).toLocaleString()}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Predicted Score:</span>
                <span className="font-extrabold text-emerald-400">{selectedSheet.predictedScore} / 100</span>
              </div>

              <button
                onClick={() => setShowIssueModal(true)}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
              >
                ⚠️ Report Issue / Request Re-upload
              </button>
            </div>

            {/* Thumbnail Navigator */}
            <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Page Thumbnails ({selectedSheet.thumbnails.length})
              </h4>
              <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {selectedSheet.thumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivePageIndex(idx)}
                    className={`relative p-1.5 rounded-xl border transition-all cursor-pointer ${
                      activePageIndex === idx
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-slate-900/90 text-cyan-300 font-bold text-[10px] rounded">
                      P{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: PDF / Image Viewer Canvas */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Viewer Control Toolbar */}
            <div className="bg-slate-900/90 backdrop-blur-xl p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              
              {/* Left Controls: Page Jump & Search */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-cyan-400">
                  Page {activePageIndex + 1} of {selectedSheet.thumbnails.length}
                </span>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search OCR Text in booklet..."
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-48 lg:w-64"
                  />
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">🔍</span>
                </div>
              </div>

              {/* Center Controls: Zoom & Rotate */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg border border-slate-700"
                  title="Zoom Out"
                >
                  🔍 -
                </button>
                <span className="text-xs font-mono text-cyan-300 w-12 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg border border-slate-700"
                  title="Zoom In"
                >
                  🔍 +
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg border border-slate-700"
                  title="Rotate"
                >
                  🔄
                </button>
              </div>

              {/* Right Controls: OCR Panel, Download, Print */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOcrPanel(!showOcrPanel)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    showOcrPanel
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  📝 OCR Text
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md transition-all"
                >
                  ⬇️ PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
                >
                  🖨️ Print
                </button>
              </div>
            </div>

            {/* Canvas Display Viewport */}
            <div className="relative w-full h-[580px] bg-slate-950 rounded-2xl border border-slate-800 p-4 flex items-center justify-center overflow-auto custom-scrollbar shadow-inner">
              <img
                src={selectedSheet.thumbnails[activePageIndex]}
                alt={`Page ${activePageIndex + 1}`}
                className="transition-all duration-300 object-contain rounded-lg shadow-2xl"
                style={{
                  width: `${zoomLevel}%`,
                  transform: `rotate(${rotation}deg)`
                }}
              />
            </div>

            {/* OCR Text Drawer Panel */}
            {showOcrPanel && (
              <div className="p-4 bg-slate-900/95 border border-purple-500/30 rounded-2xl text-xs space-y-2 animate-slideDown">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-purple-300 uppercase tracking-wider">
                    📝 AI OCR Text Extraction Output
                  </h4>
                  <button
                    onClick={() => setShowOcrPanel(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                  {getHighlightedText(selectedSheet.ocrText, searchQuery)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Issue Reporter Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Report Answer Sheet Issue</h3>
            <p className="text-xs text-slate-400">
              Submit a formal inquiry to the Examination Controller regarding missing pages or revaluation request.
            </p>
            <textarea
              rows={4}
              value={issueReason}
              onChange={(e) => setIssueReason(e.target.value)}
              placeholder="Describe your issue (e.g. Page 3 missing diagram, or request score revaluation)..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-400"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssueSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Submit Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
