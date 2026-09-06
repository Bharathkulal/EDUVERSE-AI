import React, { useState, useEffect } from 'react';
import { AiImageProcessor } from '../../services/ExamAI/AiImageProcessor';
import { NotificationEngine } from '../../services/ExamAI/NotificationEngine';
import { examQrApi } from '../../services/ExamAI/examQrApi';
import toast from 'react-hot-toast';

export default function FacultyUploadPortal({ scannedStudentData, onUploadComplete }) {
  const [studentInfo, setStudentInfo] = useState(scannedStudentData?.student || {
    id: 'STU-1001',
    name: 'Alex Mercer',
    rollNumber: 'CS2026-042',
    department: 'Computer Science',
    semester: '7th Semester',
    email: 'alex.mercer@eduverse.edu',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    attendance: 'PRESENT'
  });

  const [examInfo, setExamInfo] = useState(scannedStudentData?.exam || {
    id: 'EXAM-2026-ML101',
    subject: 'Machine Learning',
    subjectCode: 'CS801',
    facultyName: 'Dr. Sarah Jenkins',
    examDate: '2026-09-08'
  });

  // Pages array holding image preview, rotation angle, blur status, and settings
  const [pages, setPages] = useState([
    {
      id: 'page-1',
      src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
      rotation: 0,
      brightness: 1.1,
      contrast: 1.2,
      isBlurry: false,
      ocrSnippet: 'Page 1: Backpropagation & Chain Rule formula derivation...'
    },
    {
      id: 'page-2',
      src: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80',
      rotation: 0,
      brightness: 1.1,
      contrast: 1.2,
      isBlurry: false,
      ocrSnippet: 'Page 2: L1 vs L2 Regularization graph comparison...'
    },
    {
      id: 'page-3',
      src: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      rotation: 0,
      brightness: 1.1,
      contrast: 1.2,
      isBlurry: false,
      ocrSnippet: 'Page 3: Support Vector Machines dual formulation...'
    },
    {
      id: 'page-4',
      src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      rotation: 0,
      brightness: 1.1,
      contrast: 1.2,
      isBlurry: false,
      ocrSnippet: 'Page 4: Convolutional Neural Networks Architecture & Pooling...'
    }
  ]);

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiValidationResult, setAiValidationResult] = useState(null);

  // Update scanned student data if parent prop changes
  useEffect(() => {
    if (scannedStudentData) {
      if (scannedStudentData.student) setStudentInfo(scannedStudentData.student);
      if (scannedStudentData.exam) setExamInfo(scannedStudentData.exam);
    }
  }, [scannedStudentData]);

  // Run AI Validation whenever pages change
  useEffect(() => {
    const res = AiImageProcessor.runPreSubmitValidation(pages, studentInfo, examInfo);
    setAiValidationResult(res);
  }, [pages, studentInfo, examInfo]);

  // Handle File Input or Drag-and-Drop upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    toast.loading('Processing & enhancing uploaded images...', { id: 'file-proc-toast' });

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPage = {
          id: `page-${Date.now()}-${index}`,
          src: event.target.result,
          rotation: 0,
          brightness: 1.1,
          contrast: 1.25,
          isBlurry: false,
          ocrSnippet: `Uploaded Page ${pages.length + index + 1}: Auto OCR extracted content.`
        };
        setPages((prev) => [...prev, newPage]);
      };
      reader.readAsDataURL(file);
    });

    setTimeout(() => {
      toast.success(`Added ${files.length} pages to booklet!`, { id: 'file-proc-toast' });
    }, 600);
  };

  // Page Editing Actions
  const handleRotatePage = (index, angle = 90) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rotation: (p.rotation + angle) % 360 } : p))
    );
    toast.success(`Rotated Page ${index + 1}`);
  };

  const handleDeletePage = (index) => {
    if (pages.length <= 1) {
      toast.error('Booklet must contain at least 1 page.');
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
    if (selectedPageIndex >= index && selectedPageIndex > 0) {
      setSelectedPageIndex(selectedPageIndex - 1);
    }
    toast.success(`Deleted Page ${index + 1}`);
  };

  const handleMovePage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const updated = [...pages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPages(updated);
    setSelectedPageIndex(toIndex);
  };

  // Run One-Click AI Auto Enhancement across all pages
  const handleRunAutoAiEnhancement = () => {
    setIsProcessingAi(true);
    toast.loading('AI Processing: Cropping, Whitening, Removing Shadows & Sharpening Handwriting...', { id: 'ai-enhance' });

    setTimeout(() => {
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          brightness: 1.15,
          contrast: 1.3,
          rotation: 0,
          isBlurry: false
        }))
      );
      setIsProcessingAi(false);
      toast.success('AI Image Enhancement Complete! All pages deskewed & shadow-free.', { id: 'ai-enhance' });
    }, 1200);
  };

  // Submit Answer Sheet to Backend & Notify Student
  const handleSubmitAnswerSheet = async (draftMode = false) => {
    if (!draftMode && aiValidationResult && !aiValidationResult.isValid) {
      toast.error('Fix validation errors before publishing.');
      return;
    }

    setIsSubmitting(true);
    toast.loading(draftMode ? 'Saving draft...' : 'Publishing Answer Sheet to Student Dashboard...', { id: 'pub-toast' });

    const payload = {
      studentId: studentInfo.id,
      examId: examInfo.id,
      pagesImages: pages.map((p) => p.src),
      ocrText: pages.map((p, idx) => `PAGE ${idx + 1}:\n${p.ocrSnippet}`).join('\n\n'),
      draftMode
    };

    const res = await examQrApi.uploadAnswerSheet(payload);
    setIsSubmitting(false);

    if (res.success) {
      if (!draftMode) {
        // Trigger multi-channel notification
        NotificationEngine.notifyStudentUploadSuccess({
          studentName: studentInfo.name,
          subject: examInfo.subject,
          facultyName: examInfo.facultyName || 'Dr. Sarah Jenkins',
          pagesCount: pages.length
        });
      } else {
        toast.success('Draft saved successfully!', { id: 'pub-toast' });
      }

      if (onUploadComplete) {
        onUploadComplete(res.answerSheet);
      }
    } else {
      toast.error('Failed to submit answer sheet.', { id: 'pub-toast' });
    }
  };

  const selectedPage = pages[selectedPageIndex] || pages[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Verified Student Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-3xl border border-cyan-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={studentInfo.photo}
                alt={studentInfo.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{studentInfo.name}</h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  QR Verified
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {studentInfo.attendance}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Roll No: <span className="font-mono font-bold text-cyan-300">{studentInfo.rollNumber}</span> | {studentInfo.department} ({studentInfo.semester})
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Subject: <span className="font-semibold text-white">{examInfo.subject}</span> ({examInfo.subjectCode}) | Date: {examInfo.examDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAutoAiEnhancement}
              disabled={isProcessingAi}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
            >
              <span>✨</span> {isProcessingAi ? 'Enhancing...' : 'AI Auto-Enhance Paper'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Upload & Canvas Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Thumbnails & Upload Drag-Drop Zone */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📚</span> Pages Booklet ({pages.length})
              </h3>
              <label className="cursor-pointer px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-all shadow-md">
                + Add Pages
                <input type="file" multiple accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Thumbnail Navigation List */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
              {pages.map((page, idx) => (
                <div
                  key={page.id}
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedPageIndex === idx
                      ? 'bg-slate-800 border-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-400 font-bold text-xs flex items-center justify-center border border-slate-700">
                      {idx + 1}
                    </span>
                    <img
                      src={page.src}
                      alt={`Page ${idx + 1}`}
                      className="w-12 h-14 object-cover rounded-md border border-slate-700"
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                    />
                    <div className="truncate text-xs">
                      <p className="font-semibold text-slate-200">Page {idx + 1}</p>
                      <p className="text-[10px] text-slate-400 truncate">{page.ocrSnippet.slice(0, 24)}...</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRotatePage(idx);
                      }}
                      title="Rotate 90°"
                      className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg text-xs"
                    >
                      🔄
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(idx);
                      }}
                      title="Delete Page"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Drag & Drop Zone */}
            <div className="mt-4 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 text-center transition-colors">
              <p className="text-xs text-slate-400">Drag & drop answer sheet images or PDF here</p>
              <label className="mt-2 inline-block text-xs text-cyan-400 hover:underline cursor-pointer font-bold">
                Browse Files
                <input type="file" multiple accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Page Viewer & Canvas Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center">
            
            {/* Action Bar */}
            <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Previewing Page {selectedPageIndex + 1} of {pages.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRotatePage(selectedPageIndex, 90)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  🔄 Rotate 90°
                </button>
                <button
                  onClick={() => handleMovePage(selectedPageIndex, selectedPageIndex - 1)}
                  disabled={selectedPageIndex === 0}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 disabled:opacity-40 transition-colors"
                >
                  ▲ Move Up
                </button>
                <button
                  onClick={() => handleMovePage(selectedPageIndex, selectedPageIndex + 1)}
                  disabled={selectedPageIndex === pages.length - 1}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 disabled:opacity-40 transition-colors"
                >
                  ▼ Move Down
                </button>
              </div>
            </div>

            {/* Interactive Image Viewport */}
            <div className="w-full h-[480px] bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-4 overflow-hidden relative shadow-inner">
              {selectedPage ? (
                <img
                  src={selectedPage.src}
                  alt={`Selected Page ${selectedPageIndex + 1}`}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
                  style={{
                    transform: `rotate(${selectedPage.rotation}deg)`,
                    filter: `brightness(${selectedPage.brightness || 1}) contrast(${selectedPage.contrast || 1})`
                  }}
                />
              ) : (
                <p className="text-slate-500 text-xs">No page selected</p>
              )}
            </div>

            {/* AI Validation Warnings Box */}
            {aiValidationResult && (
              <div className="w-full mt-4 p-4 rounded-xl border bg-slate-950/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    🛡️ AI Validation Check
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      aiValidationResult.isValid
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {aiValidationResult.isValid ? 'PASSED PRE-SUBMIT CHECK' : 'ACTION REQUIRED'}
                  </span>
                </div>

                {aiValidationResult.warnings.length > 0 && (
                  <div className="text-amber-400 space-y-1">
                    {aiValidationResult.warnings.map((warn, i) => (
                      <p key={i}>⚠️ {warn}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit / Publish Action Buttons */}
            <div className="w-full mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => handleSubmitAnswerSheet(true)}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSubmitAnswerSheet(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? 'Publishing...' : '🚀 Submit & Publish to Student'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
