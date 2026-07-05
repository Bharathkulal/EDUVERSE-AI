import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  FileUp, Database, Trash2, RefreshCw, Eye, BarChart2, Calendar, FileText, CheckCircle, ChevronRight, X, Sparkles, AlertTriangle, HardDrive, Undo, ArrowLeftRight, Settings, Play, ArrowDown, Search, ArrowUpDown, Edit3, Download, Info
} from 'lucide-react';
import api from '../../api/axios';
import AdminTabBar from '../../components/AdminTabBar';
import './AdminApiSettings.css';

const DATASET_TABS = [
  { id: 'library', label: 'Dataset Library', icon: '🗂' },
  { id: 'sources', label: 'Dataset Sources', icon: '📥' },
  { id: 'preview', label: 'Dataset Preview', icon: '👁' },
  { id: 'schema', label: 'Schema Detection', icon: '📋' },
  { id: 'validation', label: 'Data Validation', icon: '✅' },
  { id: 'cleaning', label: 'Data Cleaning', icon: '🧹' },
  { id: 'feature_engineering', label: 'Feature Engineering', icon: '⚡' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'versions', label: 'Version Control', icon: '🏷' },
  { id: 'drift', label: 'Data Drift', icon: '📉' },
];

export default function AdminDataset() {
  const [activeTab, setActiveTab] = useState('library');
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState(null);

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([
    { name: 'student_engagement_2026.csv', size: '2.4 MB', date: '2026-07-05 09:30', status: 'Completed' },
    { name: 'coding_puzzles_metadata.json', size: '420 KB', date: '2026-07-04 14:15', status: 'Completed' }
  ]);

  // Data cleaning state
  const [cleaningSteps, setCleaningSteps] = useState([]);
  const [cleanedRowsCount, setCleanRowsCount] = useState(0);

  // Grid preview state
  const [gridData, setGridData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingCell, setEditingCell] = useState(null);

  // Automatic datasets list
  const [autoDatasets, setAutoDatasets] = useState([
    { id: 'auto_student', name: 'Student Activity Dataset', category: 'Engagement', source: 'Automatic', records: 1250, columns: 12, size: '450 KB', health: 98, ready: true, status: 'Active' },
    { id: 'auto_learning', name: 'Learning Progress Dataset', category: 'Curriculum', source: 'Automatic', records: 3240, columns: 8, size: '820 KB', health: 99, ready: true, status: 'Active' },
    { id: 'auto_quiz', name: 'Quiz Results Dataset', category: 'Evaluation', source: 'Automatic', records: 840, columns: 6, size: '210 KB', health: 97, ready: true, status: 'Active' },
    { id: 'auto_coding', name: 'Coding Metrics Dataset', category: 'Practice', source: 'Automatic', records: 1950, columns: 10, size: '610 KB', health: 96, ready: true, status: 'Active' },
    { id: 'auto_performance', name: 'Performance Matrix', category: 'Grades', source: 'Automatic', records: 450, columns: 15, size: '180 KB', health: 98, ready: true, status: 'Active' },
    { id: 'auto_interview', name: 'Interview Readiness Data', category: 'Mocking', source: 'Automatic', records: 320, columns: 14, size: '150 KB', health: 95, ready: true, status: 'Active' },
  ]);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/datasets');
      setDatasets(res.data);
      if (res.data.length > 0 && !selectedDataset) {
        setSelectedDataset(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDataset) {
      // Initialize preview grid data
      const mockRows = [];
      const cols = selectedDataset.columns_meta ? Object.keys(selectedDataset.columns_meta) : ['id', 'feature_a', 'feature_b'];
      for (let i = 1; i <= 10; i++) {
        const row = {};
        cols.forEach((col) => {
          if (col.toLowerCase().includes('id')) row[col] = `#${i}024`;
          else if (col.toLowerCase().includes('cgpa') || col.toLowerCase().includes('score')) row[col] = (Math.random() * 4 + 6).toFixed(2);
          else row[col] = Math.floor(Math.random() * 100);
        });
        mockRows.push(row);
      }
      setGridData(mockRows);
    }
  }, [selectedDataset]);

  // Drag and drop uploader handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0]);
    }
  };

  const simulateUpload = (file) => {
    setUploadingFile(file);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingFile(null);
          toast.success(`Dataset "${file.name}" uploaded successfully!`);
          
          // Add to upload history
          const newUpload = {
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            date: new Date().toLocaleString(),
            status: 'Completed'
          };
          setUploadHistory(prevHistory => [newUpload, ...prevHistory]);
          
          // Mock append to databases
          const newDataset = {
            id: Date.now().toString(),
            filename: file.name,
            row_count: Math.floor(Math.random() * 500) + 150,
            uploaded_at: new Date().toISOString(),
            columns_meta: {
              student_id: 'Text',
              cgpa: 'Float',
              study_hours: 'Integer',
              passed_quizzes: 'Integer',
              competency_index: 'Float'
            },
            versions: [{ version_number: 1, row_count: 500 }]
          };
          setDatasets(prev => [newDataset, ...prev]);
          setSelectedDataset(newDataset);
          return 0;
        }
        return prev + 20;
      });
    }, 200);
  };

  const cancelUpload = () => {
    setUploadingFile(null);
    setUploadProgress(0);
    toast.error('Upload cancelled');
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete dataset ${name}?`)) return;
    try {
      await api.delete(`/datasets/${id}`);
      toast.success('Dataset deleted successfully');
      fetchDatasets();
    } catch (err) {
      toast.error('Error deleting dataset');
    }
  };

  // Cleaning operations
  const runCleaning = (type) => {
    toast.success(`Cleaning operation "${type}" applied`);
    setCleaningSteps(prev => [...prev, type]);
    setCleanRowsCount(prev => prev + Math.floor(Math.random() * 5) + 1);
  };

  const undoCleaning = () => {
    if (cleaningSteps.length === 0) return;
    const lastStep = cleaningSteps[cleaningSteps.length - 1];
    setCleaningSteps(prev => prev.slice(0, -1));
    toast.success(`Reverted cleaning operation: "${lastStep}"`);
  };

  // Preview spreadsheet handlers
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
    const sorted = [...gridData].sort((a, b) => {
      const valA = isNaN(a[field]) ? a[field] : Number(a[field]);
      const valB = isNaN(b[field]) ? b[field] : Number(b[field]);
      if (valA < valB) return isAsc ? 1 : -1;
      if (valA > valB) return isAsc ? -1 : 1;
      return 0;
    });
    setGridData(sorted);
  };

  const updateCell = (rowIndex, field, value) => {
    const updated = [...gridData];
    updated[rowIndex][field] = value;
    setGridData(updated);
    setEditingCell(null);
    toast.success('Data record cell updated');
  };

  const triggerExport = () => {
    toast.success('Dataset CSV exported successfully');
  };

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            🗂 AI Data Center
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Enterprise repository for automatic student logs and external ML training sets.</p>
        </div>
        <button onClick={fetchDatasets} className="px-3.5 py-1.5 border text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}>
          <RefreshCw className="w-3.5 h-3.5" /> Synchronize
        </button>
      </div>

      <AdminTabBar tabs={DATASET_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Dataset Library */}
          {activeTab === 'library' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Enterprise Registry</h3>
                  <div className="space-y-2">
                    {/* Combine automatic and manual datasets for display */}
                    {[...autoDatasets, ...datasets.map(d => ({
                      id: d.id,
                      name: d.filename,
                      category: 'Model Feed',
                      source: 'Manual Upload',
                      records: d.row_count,
                      columns: d.columns_meta ? Object.keys(d.columns_meta).length : 5,
                      size: '2.4 MB',
                      health: 98,
                      ready: true,
                      status: 'Active'
                    }))].map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDataset(datasets.find(ds => ds.id === d.id) || d)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${selectedDataset?.id === d.id ? 'border-blue-500 bg-blue-500/5' : 'border-transparent hover:bg-[var(--db-input-bg)]'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Database className="w-4 h-4 text-blue-500" />
                          <div className="text-left">
                            <p className="text-xs font-bold">{d.name}</p>
                            <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>{d.records} records • {d.source}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--db-text-muted)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedDataset ? (
                  <div className="p-5 rounded-2xl border space-y-4 text-left font-sans" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="flex justify-between items-start border-b pb-3" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      <div>
                        <h3 className="text-base font-bold">{selectedDataset.filename || selectedDataset.name}</h3>
                        <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Source: {selectedDataset.source || 'Manual Upload'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={triggerExport} className="px-3 py-1.5 border text-xs font-bold rounded-lg cursor-pointer transition" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                          Export CSV
                        </button>
                        <button onClick={() => handleDelete(selectedDataset.id, selectedDataset.filename || selectedDataset.name)} className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg border border-rose-500/10 bg-rose-500/5 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl">
                        <span className="block font-bold text-blue-500">{selectedDataset.row_count || selectedDataset.records}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Total Records</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl">
                        <span className="block font-bold text-violet-500">{selectedDataset.columns_meta ? Object.keys(selectedDataset.columns_meta).length : (selectedDataset.columns || 5)}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Total Columns</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl">
                        <span className="block font-bold text-emerald-500">{selectedDataset.health || 98}%</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Health Score</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl">
                        <span className="block font-bold text-amber-500">v1.0</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Current Version</span>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-3 text-xs">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-bold text-emerald-500">Training Ready: 100%</p>
                        <p style={{ color: 'var(--db-text-muted)' }}>Validation completed. No high drift values detected since last train epoch.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 rounded-2xl border text-center text-xs" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-muted)' }}>
                    Select a dataset card from the library list to review.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Dataset Sources & Upload */}
          {activeTab === 'sources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Left Column - Automatic Data Engine */}
              <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold">Automatic Background Collector</h3>
                </div>
                <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>
                  EduVerse AI automatically captures and structure Student activities datasets continuously.
                </p>
                <div className="space-y-2">
                  {[
                    { source: 'Student Registration & Logins', items: 'Student log records, weekly attendance logs.' },
                    { source: 'Quiz Intelligence telemetry', items: 'Attempts metrics, quiz scores, category weights.' },
                    { source: 'Coding Studio logs', items: 'Submissions compile accuracy, average execution speeds.' }
                  ].map((engine, idx) => (
                    <div key={idx} className="p-3 bg-[var(--db-input-bg)] border rounded-xl" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      <p className="text-xs font-bold text-blue-500">{engine.source}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--db-text-muted)' }}>{engine.items}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Manual Upload */}
              <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-violet-500" />
                  <h3 className="font-bold">Manual Drag & Drop Upload</h3>
                </div>
                <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>
                  Support external CSV, XLSX, JSON, Parquet, and zipped folders.
                </p>

                <div 
                  onDragEnter={handleDrag} 
                  onDragOver={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--db-sidebar-border)]'}`}
                >
                  <FileUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs font-bold">Drag and drop file here, or click to browse</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--db-text-muted)' }}>Max file size: 50MB</p>
                  <input type="file" onChange={handleFileChange} className="hidden" id="manual-upload-input" />
                  <label htmlFor="manual-upload-input" className="mt-3 inline-block px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-blue-600 transition">
                    Browse Files
                  </label>
                </div>

                {uploadingFile && (
                  <div className="p-3 bg-[var(--db-input-bg)] border rounded-xl space-y-2" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold truncate">{uploadingFile.name}</span>
                      <button onClick={cancelUpload} className="text-rose-500 text-[10px] font-bold">Cancel</button>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Dataset Preview Spreadsheet */}
          {activeTab === 'preview' && (
            <div className="p-5 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider">Spreadsheet Data Preview</h3>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5" style={{ color: 'var(--db-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search columns..."
                    className="w-full pl-8 pr-3 py-1.5 border text-xs rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {selectedDataset ? (
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <table className="w-full text-xs text-left">
                    <thead style={{ backgroundColor: 'var(--db-input-bg)', color: 'var(--db-text-muted)' }}>
                      <tr>
                        {selectedDataset.columns_meta && Object.keys(selectedDataset.columns_meta).map((col) => (
                          <th key={col} onClick={() => handleSort(col)} className="py-2.5 px-4 font-bold border-b cursor-pointer hover:bg-slate-800/10" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                            <div className="flex items-center gap-1.5">
                              {col} <ArrowUpDown className="w-3 h-3" />
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gridData.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[var(--db-input-bg)]">
                          {selectedDataset.columns_meta && Object.keys(selectedDataset.columns_meta).map((col) => (
                            <td key={col} className="py-2 px-4 border-b relative group" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                              {editingCell?.row === rIdx && editingCell?.col === col ? (
                                <input
                                  type="text"
                                  className="w-full border px-1.5 py-0.5 rounded text-[11px]"
                                  defaultValue={row[col]}
                                  onBlur={(e) => updateCell(rIdx, col, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') updateCell(rIdx, col, e.target.value);
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <div className="flex justify-between items-center">
                                  <span>{row[col]}</span>
                                  <button onClick={() => setEditingCell({ row: rIdx, col })} className="opacity-0 group-hover:opacity-100 transition cursor-pointer text-slate-500 hover:text-blue-500">
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: 'var(--db-text-muted)' }}>Select a dataset to view cells.</p>
              )}
            </div>
          )}

          {/* 4. Schema Detection */}
          {activeTab === 'schema' && (
            <div className="p-6 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <div>
                  <h3 className="font-bold">Detected Schema Attributes</h3>
                  <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Target class suggested automatically based on feature distributions.</p>
                </div>
                <div className="px-3 py-1 bg-violet-500/10 text-violet-500 border border-violet-500/25 rounded-full text-xs font-bold">
                  Target: passed_quizzes
                </div>
              </div>

              {selectedDataset ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDataset.columns_meta && Object.entries(selectedDataset.columns_meta).map(([col, type]) => (
                    <div key={col} className="p-3 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      <div>
                        <span className="font-bold">{col}</span>
                        {col === 'student_id' && <span className="ml-2 text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.25 rounded">Primary Key</span>}
                      </div>
                      <span className="font-mono bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-center" style={{ color: 'var(--db-text-muted)' }}>Select a dataset to view schemas.</p>
              )}
            </div>
          )}

          {/* 5. Data Validation */}
          {activeTab === 'validation' && (
            <div className="p-6 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="font-bold">Automatic Constraint Validation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { check: 'Missing Values', status: 'Optimal', details: '0 null columns found', color: 'text-emerald-500' },
                  { check: 'Duplicate IDs', status: 'Optimal', details: 'No index collisions', color: 'text-emerald-500' },
                  { check: 'Outliers Detected', status: 'Warning', details: '3 values outside range', color: 'text-amber-500' },
                ].map((val, idx) => (
                  <div key={idx} className="p-4 bg-[var(--db-input-bg)] border rounded-xl text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="flex justify-between items-center font-bold">
                      <span>{val.check}</span>
                      <span className={val.color}>{val.status}</span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--db-text-muted)' }}>{val.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Data Cleaning */}
          {activeTab === 'cleaning' && (
            <div className="p-6 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <div>
                  <h3 className="font-bold">One-Click Cleaning Operations</h3>
                  <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Cleaned rows count: {cleanedRowsCount}</p>
                </div>
                {cleaningSteps.length > 0 && (
                  <button onClick={undoCleaning} className="px-3 py-1.5 border text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                    <Undo className="w-3.5 h-3.5 text-blue-500" /> Undo last
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {[
                  { name: 'Remove Duplicates', type: 'deduplicate' },
                  { name: 'Fill Missing Values', type: 'impute' },
                  { name: 'Normalize Columns', type: 'normalize' },
                  { name: 'Standardize Formats', type: 'format' }
                ].map((op) => (
                  <button
                    key={op.type}
                    onClick={() => runCleaning(op.name)}
                    className="p-4 bg-[var(--db-input-bg)] border rounded-xl text-left hover:border-blue-500/40 transition cursor-pointer"
                    style={{ borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                  >
                    <p className="font-bold">{op.name}</p>
                    <span className="block text-[10px] mt-1" style={{ color: 'var(--db-text-muted)' }}>Apply auto rules</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 7. Feature Engineering */}
          {activeTab === 'feature_engineering' && (
            <div className="p-6 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="font-bold">Derived Feature Importance Scores</h3>
              <div className="space-y-3">
                {[
                  { name: 'learningSpeed', imp: '0.84', formula: 'completed_topics / study_hours' },
                  { name: 'practiceFrequency', imp: '0.62', formula: 'submissions_per_week' },
                  { name: 'engagementScore', imp: '0.94', formula: '0.7 * active_days + 0.3 * chat_prompts' },
                ].map((feat, idx) => (
                  <div key={idx} className="p-3 bg-[var(--db-input-bg)] rounded-xl border text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="flex justify-between font-bold">
                      <span>{feat.name}</span>
                      <span className="text-blue-500 font-mono">Importance: {feat.imp}</span>
                    </div>
                    <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--db-text-muted)' }}>Formula: {feat.formula}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Analytics */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left text-xs">
              <div className="p-5 border rounded-2xl" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <p className="font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>Storage Allocation</p>
                <p className="text-3xl font-black mt-1">2.4 GB</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-violet-500 h-full" style={{ width: '24%' }} />
                </div>
              </div>
              <div className="p-5 border rounded-2xl" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <p className="font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>Daily Import Volume</p>
                <p className="text-3xl font-black mt-1">45,210 rows</p>
                <p className="text-[10px] text-emerald-500 mt-1 font-bold">↗ +12% from yesterday</p>
              </div>
              <div className="p-5 border rounded-2xl" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <p className="font-bold uppercase" style={{ color: 'var(--db-text-muted)' }}>Model Readiness Index</p>
                <p className="text-3xl font-black mt-1">98.4%</p>
                <p className="text-[10px] text-blue-500 mt-1 font-bold">Optimal dataset health</p>
              </div>
            </div>
          )}

          {/* 9. Version Control */}
          {activeTab === 'versions' && (
            <div className="p-6 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="font-bold">Dataset Version Log</h3>
              <div className="space-y-2">
                {[
                  { version: 'v1.2', desc: 'Added coding puzzles attempts metrics', date: '2026-07-05 09:30' },
                  { version: 'v1.1', desc: 'Initial logs for quiz scores', date: '2026-07-04 14:15' },
                  { version: 'v1.0', desc: 'Base schema registration', date: '2026-07-03 09:00' },
                ].map((ver) => (
                  <div key={ver.version} className="p-3 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div>
                      <p className="font-bold text-blue-500">{ver.version}</p>
                      <p style={{ color: 'var(--db-text-muted)' }}>{ver.desc}</p>
                    </div>
                    <button onClick={() => toast.success(`Restored to version ${ver.version}`)} className="px-3 py-1 bg-blue-500 text-white rounded text-[10px] font-bold cursor-pointer">
                      Rollback
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. Data Drift */}
          {activeTab === 'drift' && (
            <div className="p-6 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="font-bold">Feature drift indexes since last release</h3>
              <div className="space-y-3">
                {[
                  { name: 'cgpa', value: '0.012', status: 'Optimal', color: 'text-emerald-500' },
                  { name: 'study_hours', value: '0.045', status: 'Optimal', color: 'text-emerald-500' },
                  { name: 'competency_index', value: '0.184', status: 'Tuning Triggered', color: 'text-amber-500' },
                ].map((drift, idx) => (
                  <div key={idx} className="p-3 bg-[var(--db-input-bg)] border rounded-xl flex justify-between items-center text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div>
                      <span className="font-bold font-mono">{drift.name}</span>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--db-text-muted)' }}>Drift coefficient value: {drift.value}</p>
                    </div>
                    <span className={`font-bold ${drift.color}`}>{drift.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
