import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function InteractivePaperViewer({ paper, onClose }) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [viewMode, setViewMode] = useState('scanned-photos'); // 'scanned-photos' | 'pdf-embed'
  const [showHighlights, setShowHighlights] = useState(true);
  const [showOcrText, setShowOcrText] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!paper) return null;

  const pages = paper.pages && paper.pages.length > 0 ? paper.pages : [
    {
      pageNumber: 1,
      imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&auto=format&fit=crop&q=80',
      ocrText: paper.ocrText || 'Scanned Answer Sheet Page 1'
    }
  ];

  const currentPage = pages[activePageIndex] || pages[0];
  const pageHighlights = (paper.highlights || []).filter(h => h.page === (activePageIndex + 1));

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => { setZoomLevel(100); setRotationDegree(0); };
  const handleRotateRight = () => setRotationDegree(prev => (prev + 90) % 360);

  const handleDownloadPdf = () => {
    toast.success(`Downloading official exam paper PDF for ${paper.subjectCode}...`);
    const link = document.createElement('a');
    link.href = paper.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    link.download = `${paper.rollNumber}_${paper.subjectCode}_AnswerSheet.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn text-white">
      <div className={`w-full ${isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-6xl max-h-[94vh] rounded-3xl'} bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}>
        
        {/* 1. TOP HEADER TOOLBAR */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                {paper.department} • {paper.year}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                Roll: {paper.rollNumber}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                paper.passStatus === 'PASSED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {paper.passStatus} ({paper.marks ? paper.marks.total : 0}/100)
              </span>
            </div>

            <h3 className="text-base md:text-lg font-extrabold text-white mt-1 flex items-center gap-2">
              <span>📄</span> {paper.subjectName} ({paper.subjectCode})
            </h3>
            <p className="text-xs text-slate-400">
              Student: <span className="text-slate-200 font-semibold">{paper.studentName}</span> | Evaluated by: {paper.uploadedBy}
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('scanned-photos')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'scanned-photos' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                📸 Scanned Photos ({pages.length})
              </button>
              <button
                onClick={() => setViewMode('pdf-embed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'pdf-embed' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                📕 PDF Document
              </button>
            </div>

            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <span>⬇️</span> Download PDF
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? '📉' : '📈'}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-600/80 rounded-xl transition-colors text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* 2. SUB-TOOLBAR CONTROLS */}
        {viewMode === 'scanned-photos' && (
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                disabled={activePageIndex === 0}
                onClick={() => setActivePageIndex(prev => Math.max(prev - 1, 0))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold rounded-lg"
              >
                ◀ Prev
              </button>
              <span className="font-mono text-cyan-300 font-bold px-2">
                Page {activePageIndex + 1} of {pages.length}
              </span>
              <button
                disabled={activePageIndex === pages.length - 1}
                onClick={() => setActivePageIndex(prev => Math.min(prev + 1, pages.length - 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold rounded-lg"
              >
                Next ▶
              </button>
            </div>

            {/* Zoom & Rotation Controls */}
            <div className="flex items-center gap-2">
              <button onClick={handleZoomOut} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg" title="Zoom Out">
                🔍 -
              </button>
              <span className="font-mono font-bold text-slate-300 text-[11px] w-12 text-center">
                {zoomLevel}%
              </span>
              <button onClick={handleZoomIn} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg" title="Zoom In">
                🔍 +
              </button>
              <button onClick={handleResetZoom} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold rounded-lg" title="Reset">
                100%
              </button>
              <div className="h-4 w-px bg-slate-800 mx-1" />
              <button onClick={handleRotateRight} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg" title="Rotate">
                ↺ Rotate
              </button>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-emerald-400 font-bold">
                <input
                  type="checkbox"
                  checked={showHighlights}
                  onChange={e => setShowHighlights(e.target.checked)}
                  className="rounded"
                />
                Teacher Highlights ({paper.highlights ? paper.highlights.length : 0})
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-cyan-400 font-bold">
                <input
                  type="checkbox"
                  checked={showOcrText}
                  onChange={e => setShowOcrText(e.target.checked)}
                  className="rounded"
                />
                OCR Text Stream
              </label>
            </div>
          </div>
        )}

        {/* 3. MAIN CONTENT BODY */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
          
          {/* Main Document Viewport */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80 custom-scrollbar relative">
            {viewMode === 'pdf-embed' ? (
              <iframe
                src={paper.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                title={paper.subjectName}
                className="w-full h-full min-h-[500px] rounded-2xl border border-slate-800"
              />
            ) : (
              <div
                className="relative transition-transform duration-200 ease-out shadow-2xl rounded-xl overflow-hidden border border-slate-800 bg-white/5"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotationDegree}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  src={currentPage.imageUrl}
                  alt={`Answer Sheet Page ${activePageIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl"
                />

                {/* Highlight Overlays Layer */}
                {showHighlights && pageHighlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="absolute border-2 border-emerald-400 rounded p-1 transition-all group"
                    style={{
                      left: `${hl.x}%`,
                      top: `${hl.y}%`,
                      width: `${hl.width}%`,
                      height: `${hl.height}%`,
                      backgroundColor: hl.color || 'rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    <div className="absolute -top-7 left-0 px-2 py-0.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded shadow-md whitespace-nowrap">
                      ⭐ {hl.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Marks Breakdown & OCR Text */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/90 p-4 overflow-y-auto custom-scrollbar space-y-4">
            
            {/* Marks Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">Score Summary</span>
              
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Internal</span>
                  <p className="text-base font-extrabold text-white mt-0.5">{paper.marks ? paper.marks.internal : 0} / 30</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">External</span>
                  <p className="text-base font-extrabold text-white mt-0.5">{paper.marks ? paper.marks.external : 0} / 70</p>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-cyan-950 to-slate-900 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
                  <p className="text-xl font-extrabold text-cyan-300">{paper.marks ? paper.marks.total : 0} / 100</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Grade</span>
                  <p className="text-xl font-extrabold text-emerald-400">{paper.grade || 'A+'}</p>
                </div>
              </div>
            </div>

            {/* Teacher Remarks Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <p className="font-extrabold text-slate-300 flex items-center gap-1.5">
                <span>💬</span> Teacher Remarks
              </p>
              <p className="text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                "{paper.teacherRemarks || 'Verified answer sheet.'}"
              </p>
            </div>

            {/* OCR Extracted Text Panel */}
            {showOcrText && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2 text-xs">
                <p className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                  <span>🧠</span> Extracted Page OCR Text
                </p>
                <div className="font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded-xl max-h-48 overflow-y-auto custom-scrollbar border border-slate-800 leading-relaxed">
                  {currentPage.ocrText || paper.ocrText}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. BOTTOM THUMBNAIL STRIP */}
        {viewMode === 'scanned-photos' && pages.length > 1 && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-3 overflow-x-auto custom-scrollbar">
            {pages.map((pg, idx) => (
              <div
                key={idx}
                onClick={() => setActivePageIndex(idx)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all w-16 h-16 shrink-0 ${
                  activePageIndex === idx ? 'border-cyan-400 scale-105 shadow-lg shadow-cyan-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={pg.thumbnail || pg.imageUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-black/80 text-[9px] font-extrabold text-white">
                  P{idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
