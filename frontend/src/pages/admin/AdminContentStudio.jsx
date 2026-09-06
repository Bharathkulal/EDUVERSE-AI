import React, { useState, useEffect } from 'react';
import { academicContentApi } from '../../services/academicContentApi';
import toast from 'react-hot-toast';

export default function AdminContentStudio() {
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subjectId: 'SUB-101',
    subjectName: 'Machine Learning',
    subjectCode: 'CS801',
    department: 'Computer Science',
    semester: '7th Semester',
    topic: 'Neural Networks & Deep Learning',
    subtopic: 'Gradient Optimization',
    category: 'Notes', // Notes, Important, Question Bank, Question Paper
    contentType: 'PDF', // PDF, Image, Rich Text, Doc, Link
    description: '',
    fileUrl: '',
    fileName: '',
    fileSize: '2.4 MB',
    tags: 'Machine Learning, Deep Learning, Unit 3',
    unitNumber: 3,
    examYear: '2026',
    difficulty: 'Medium',
    isImportant: false,
    isPinned: false,
    visibility: 'Public',
    status: 'Published',
    uploadedBy: 'Dr. Sarah Jenkins (Lecturer)'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const subRes = await academicContentApi.getSubjects();
    const matRes = await academicContentApi.getMaterials();
    const anaRes = await academicContentApi.getAnalytics();
    setLoading(false);

    if (subRes.success) setSubjects(subRes.subjects || []);
    if (matRes.success) setMaterials(matRes.materials || []);
    if (anaRes.success) setAnalytics(anaRes.stats || null);
  };

  const handleSubjectChange = (e) => {
    const subId = e.target.value;
    const sub = subjects.find((s) => s.id === subId);
    if (sub) {
      setFormData({
        ...formData,
        subjectId: sub.id,
        subjectName: sub.subjectName,
        subjectCode: sub.subjectCode,
        department: sub.department,
        semester: sub.semester
      });
    }
  };

  const handleFileUploadMock = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({
      ...formData,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileUrl: URL.createObjectURL(file)
    });
    toast.success(`Attached file: ${file.name}`);
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    toast.loading('Publishing study material to Academic Hub...', { id: 'upload-toast' });

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim())
    };

    const res = await academicContentApi.uploadMaterial(payload);
    if (res.success) {
      toast.success(res.message || 'Material published successfully!', { id: 'upload-toast' });
      setShowUploadModal(false);
      await loadData();
    } else {
      toast.error('Failed to publish material', { id: 'upload-toast' });
    }
  };

  const handleTogglePin = async (mat) => {
    const res = await academicContentApi.updateMaterial(mat.id, { isPinned: !mat.isPinned });
    if (res.success) {
      toast.success(mat.isPinned ? 'Unpinned material' : 'Pinned material to top! 📌');
      await loadData();
    }
  };

  const handleToggleImportant = async (mat) => {
    const res = await academicContentApi.updateMaterial(mat.id, { isImportant: !mat.isImportant });
    if (res.success) {
      toast.success(mat.isImportant ? 'Removed V.Imp badge' : 'Marked as Very Important! ⭐');
      await loadData();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    const res = await academicContentApi.deleteMaterial(id);
    if (res.success) {
      toast.success('Material deleted');
      await loadData();
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fadeIn text-white max-w-7xl mx-auto">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
            Lecturer & Admin Studio
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <span>📖</span> Study Materials Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage course notes, important exam questions, question banks, previous papers, and subject announcements
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
        >
          <span>+</span> Upload New Study Material
        </button>
      </div>

      {/* 2. Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Materials</span>
            <p className="text-2xl font-extrabold text-white mt-1">{analytics.totalMaterials}</p>
            <p className="text-[10px] text-cyan-400 mt-0.5">Across {analytics.totalSubjects} Subjects</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Notes & V.Imp Items</span>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{analytics.totalNotes + analytics.totalImportant}</p>
            <p className="text-[10px] text-amber-400 mt-0.5">{analytics.totalImportant} Flagged V.Imp</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Question Banks & Papers</span>
            <p className="text-2xl font-extrabold text-purple-400 mt-1">{analytics.totalQuestionBanks + analytics.totalQuestionPapers}</p>
            <p className="text-[10px] text-purple-400 mt-0.5">{analytics.totalQuestionPapers} Question Papers</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Student Downloads</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{analytics.totalDownloads}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">Storage: {analytics.storageUsedMb} MB</p>
          </div>
        </div>
      )}

      {/* 3. Management Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Published Study Materials ({materials.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="p-3">Title & Subject</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Unit / Year</th>
                  <th className="p-3">Uploaded By</th>
                  <th className="p-3">Views / Downloads</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-950/60 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        {mat.title}
                        {mat.isImportant && <span className="text-amber-400">⭐</span>}
                        {mat.isPinned && <span className="text-purple-400">📌</span>}
                      </p>
                      <p className="text-[11px] text-slate-400">{mat.subjectName} ({mat.subjectCode})</p>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                        {mat.category}
                      </span>
                    </td>

                    <td className="p-3 text-slate-300">
                      Unit {mat.unitNumber} ({mat.examYear})
                    </td>

                    <td className="p-3 text-slate-300 font-medium">
                      {mat.uploadedBy}
                    </td>

                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      👁️ {mat.views} | ⬇️ {mat.downloads}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTogglePin(mat)}
                          className={`p-1.5 rounded-lg border text-xs ${
                            mat.isPinned ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                          title="Toggle Pin"
                        >
                          📌
                        </button>

                        <button
                          onClick={() => handleToggleImportant(mat)}
                          className={`p-1.5 rounded-lg border text-xs ${
                            mat.isImportant ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                          title="Toggle Important"
                        >
                          ⭐
                        </button>

                        <button
                          onClick={() => handleDelete(mat.id)}
                          className="p-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs hover:bg-rose-500/30"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Upload Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto custom-scrollbar space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Upload Study Material</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Unit 3 Backpropagation Notes & Derivatives"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <select
                    value={formData.subjectId}
                    onChange={handleSubjectChange}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-cyan-300 font-bold focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subjectName} ({s.subjectCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Notes">Notes 📖</option>
                    <option value="Important">Important ⭐</option>
                    <option value="Question Bank">Question Bank ❓</option>
                    <option value="Question Paper">Question Paper 📄</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit Number</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Exam Year</label>
                  <input
                    type="text"
                    value={formData.examYear}
                    onChange={(e) => setFormData({ ...formData, examYear: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Content Type</label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Rich Text">Rich Text</option>
                    <option value="Image">Image</option>
                    <option value="Doc">Doc</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Topic Name</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Deep Neural Networks"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Attach PDF or Document File</label>
                <input
                  type="file"
                  onChange={handleFileUploadMock}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description & Summary</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of notes or exam instructions..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-amber-300 font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="rounded"
                  />
                  Mark as Very Important (⭐ V.Imp)
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-purple-300 font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded"
                  />
                  Pin to Top (📌 Sticky)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md"
                >
                  Publish Material 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
