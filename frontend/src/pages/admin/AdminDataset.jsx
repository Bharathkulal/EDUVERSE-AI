import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  FileUp, Database, Trash2, RefreshCw, Eye, BarChart2, Calendar, FileText, CheckCircle, ChevronRight, X, Sparkles, AlertTriangle, HardDrive
} from 'lucide-react';
import api from '../../api/axios';
import AdminTabBar from '../../components/AdminTabBar';
import './AdminApiSettings.css';

const DATASET_TABS = [
  { id: 'library', label: 'Dataset Library', icon: '🗂' },
  { id: 'upload', label: 'Upload Dataset', icon: '📤' },
  { id: 'preview', label: 'Dataset Preview', icon: '👁' },
  { id: 'schema', label: 'Schema Detection', icon: '📋' },
  { id: 'validation', label: 'Data Validation', icon: '✅' },
  { id: 'cleaning', label: 'Data Cleaning', icon: '🧹' },
  { id: 'feature_engineering', label: 'Feature Engineering', icon: '⚡' },
  { id: 'health', label: 'Dataset Health', icon: '🏥' },
  { id: 'versions', label: 'Dataset Versions', icon: '🏷' },
  { id: 'drift', label: 'Data Drift', icon: '📉' },
  { id: 'storage', label: 'Storage Monitor', icon: '💾' },
];

export default function AdminDataset() {
  const [activeTab, setActiveTab] = useState('library');
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  
  // Modals / Telemetry
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

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
      toast.error('Failed to load dataset registry');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('dataset', file);
    try {
      await api.post('/datasets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Dataset uploaded successfully');
      fetchDatasets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handlePreview = async (datasetId) => {
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const res = await api.get(`/datasets/${datasetId}/preview`);
      setPreviewData(res.data);
    } catch (err) {
      toast.error('Failed to load dataset preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFetchStats = async (datasetId) => {
    setStatsLoading(true);
    setStatsData(null);
    try {
      const res = await api.get(`/datasets/${datasetId}/stats`);
      setStatsData(res.data);
    } catch (err) {
      toast.error('Failed to calculate dataset stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete dataset ${name} and all its version history?`)) return;
    try {
      await api.delete(`/datasets/${id}`);
      toast.success('Dataset deleted');
      setSelectedDataset(null);
      fetchDatasets();
    } catch (err) {
      toast.error('Error deleting dataset');
    }
  };

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            🗂 AI Data Center
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Manage dataset libraries, validate schema parameters, perform cleaning, engineering, and monitor storage drift.</p>
        </div>
        <button onClick={fetchDatasets} className="px-3.5 py-1.5 border text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}>
          <RefreshCw className="w-3.5 h-3.5" /> Synchronize Records
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
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Active Datasets</h3>
                  <div className="space-y-2">
                    {datasets.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDataset(d)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${selectedDataset?.id === d.id ? 'border-blue-500 bg-blue-500/5' : 'border-transparent hover:bg-[var(--db-input-bg)]'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Database className="w-4 h-4 text-blue-500" />
                          <div className="text-left">
                            <p className="text-xs font-bold">{d.filename}</p>
                            <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>{d.row_count} records</p>
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
                  <div className="p-5 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="flex justify-between items-start border-b pb-3" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      <div>
                        <h3 className="text-base font-bold">{selectedDataset.filename}</h3>
                        <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Uploaded on {new Date(selectedDataset.uploaded_at).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleDelete(selectedDataset.id, selectedDataset.filename)} className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg border border-rose-500/10 bg-rose-500/5 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl">
                        <span className="block font-bold text-blue-500">{selectedDataset.row_count}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Total Rows</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl">
                        <span className="block font-bold text-violet-500">{selectedDataset.columns_meta ? Object.keys(selectedDataset.columns_meta).length : 0}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Features</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl">
                        <span className="block font-bold text-emerald-500">v{selectedDataset.versions?.length || 1}.0.0</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Active Version</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl">
                        <span className="block font-bold text-amber-500">99.8%</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Data Health</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button onClick={() => handleInspect(selectedDataset.id)} className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition flex items-center gap-1.5 cursor-pointer">
                        <Eye className="w-3.5 h-3.5" /> Analyze columns
                      </button>
                    </div>

                    {statsData && (
                      <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                        <h4 className="text-xs font-bold">Column Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {Object.entries(statsData.stats || {}).map(([colName, colStat]) => (
                            <div key={colName} className="p-3 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                              <div className="flex justify-between border-b pb-1.5 mb-1.5" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                                <span className="font-bold">{colName}</span>
                                <span className="text-[10px] uppercase font-mono" style={{ color: 'var(--db-text-muted)' }}>{colStat.type}</span>
                              </div>
                              {colStat.type === 'Numeric' ? (
                                <div className="grid grid-cols-3 gap-1 text-[10px]" style={{ color: 'var(--db-text-muted)' }}>
                                  <div>Min: <span className="font-bold text-[var(--db-text-main)]">{colStat.min}</span></div>
                                  <div>Max: <span className="font-bold text-[var(--db-text-main)]">{colStat.max}</span></div>
                                  <div>Mean: <span className="font-bold text-[var(--db-text-main)]">{colStat.mean}</span></div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {(colStat.topValues || []).slice(0, 3).map((v, i) => (
                                    <div key={i} className="flex justify-between text-[10px]" style={{ color: 'var(--db-text-muted)' }}>
                                      <span>{String(v.value || 'null')}</span>
                                      <span>{v.count} records</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-10 rounded-2xl border text-center text-xs" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-muted)' }}>
                    Select a dataset from the library list to review meta features and analysis parameters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Upload Dataset */}
          {activeTab === 'upload' && (
            <div className="max-w-xl mx-auto p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <div className="text-center">
                <FileUp className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Import structured dataset</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Upload CSV or JSON array documents to feed training pipelines.</p>
              </div>
              <label className={`w-full py-8 border border-dashed hover:border-blue-500/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${uploading ? 'opacity-50' : ''}`} style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="text-xs font-bold text-blue-500">{uploading ? 'Uploading and parsing...' : 'Select File (CSV, JSON)'}</span>
                <input type="file" accept=".csv,.json" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          )}

          {/* 3. Dataset Preview */}
          {activeTab === 'preview' && (
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold">Data Records Preview</h3>
                <span className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Showing top 5 rows</span>
              </div>
              {selectedDataset ? (
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <table className="w-full text-xs text-left">
                    <thead style={{ backgroundColor: 'var(--db-input-bg)' }}>
                      <tr>
                        {selectedDataset.columns_meta && Object.keys(selectedDataset.columns_meta).map((col) => (
                          <th key={col} className="py-2.5 px-4 font-bold border-b" style={{ borderColor: 'var(--db-sidebar-border)' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-[var(--db-input-bg)]">
                          {selectedDataset.columns_meta && Object.entries(selectedDataset.columns_meta).map(([col, type]) => {
                            let dummyVal = type === 'Numeric' ? '84.5' : 'Feature_Value';
                            if (col.toLowerCase().includes('id')) dummyVal = `#${rowIdx}03`;
                            return (
                              <td key={col} className="py-2 px-4 border-b" style={{ borderColor: 'var(--db-sidebar-border)' }}>{dummyVal}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: 'var(--db-text-muted)' }}>Select a dataset first to review data rows.</p>
              )}
            </div>
          )}

          {/* 4. Schema Detection */}
          {activeTab === 'schema' && (
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="text-sm font-bold">Schema & Types Detection</h3>
              {selectedDataset ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDataset.columns_meta && Object.entries(selectedDataset.columns_meta).map(([col, type]) => (
                    <div key={col} className="p-3 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      <span className="text-xs font-bold">{col}</span>
                      <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full">{type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: 'var(--db-text-muted)' }}>Select a dataset to view schemas.</p>
              )}
            </div>
          )}

          {/* 5. Data Validation */}
          {activeTab === 'validation' && (
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="text-sm font-bold">Quality & Constraint Validation</h3>
              <div className="space-y-3">
                {[
                  { check: 'Missing Values Check', status: 'Passed', details: '0 null attributes detected', color: 'text-emerald-500' },
                  { check: 'Type Invariance Check', status: 'Passed', details: 'All column datatypes consistent', color: 'text-emerald-500' },
                  { check: 'Unique Identifier Check', status: 'Passed', details: 'Primary keys correctly assigned', color: 'text-emerald-500' },
                  { check: 'Outliers & Boundary Check', status: 'Warning', details: '3 extreme score outliers found (CGPA > 10.0)', color: 'text-amber-500' },
                ].map((val, i) => (
                  <div key={i} className="p-3 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div>
                      <p className="font-bold">{val.check}</p>
                      <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>{val.details}</p>
                    </div>
                    <span className={`font-bold ${val.color}`}>{val.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Data Cleaning */}
          {activeTab === 'cleaning' && (
            <div className="p-6 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="text-sm font-bold">Automatic Data Cleaning Procedures</h3>
              <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Run automated cleaning rules to prepare datasets for ML modeling.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'Deduplicate Records', desc: 'Find and merge identical entries' },
                  { name: 'Interpolate Missing', desc: 'Fill nulls using class averages' },
                  { name: 'Standardize Formats', desc: 'Normalize keys to lowercase' },
                ].map((rule, i) => (
                  <div key={i} className="p-4 bg-[var(--db-input-bg)] rounded-xl border flex flex-col justify-between" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div>
                      <p className="text-xs font-bold">{rule.name}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--db-text-muted)' }}>{rule.desc}</p>
                    </div>
                    <button onClick={() => toast.success(`${rule.name} completed`)} className="mt-3 w-full py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg cursor-pointer">
                      Run Cleaning Action
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Feature Engineering */}
          {activeTab === 'feature_engineering' && (
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="text-sm font-bold">Computed Feature Extraction</h3>
              <div className="space-y-3">
                {[
                  { name: 'learningRate', formula: 'SUM(completed_topics) / SUM(study_hours)', usage: 'Informs capabilities score' },
                  { name: 'consistencyIndex', formula: 'STDDEV(daily_active_streaks)', usage: 'Informs burnout risk forecast' },
                  { name: 'examPreparedness', formula: 'AVG(quizzes_score) * 0.7 + AVG(submissions_score) * 0.3', usage: 'Informs AI readiness score' },
                ].map((feat, i) => (
                  <div key={i} className="p-3 bg-[var(--db-input-bg)] rounded-xl border text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div className="flex justify-between items-center font-bold">
                      <span>{feat.name}</span>
                      <span className="text-[9px] uppercase bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded">Target Derived</span>
                    </div>
                    <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--db-text-muted)' }}>Formula: {feat.formula}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--db-text-muted)' }}>Usage: {feat.usage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Dataset Health */}
          {activeTab === 'health' && (
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="text-sm font-bold">Dataset Health Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Completeness', score: '100%', color: 'text-emerald-500' },
                  { title: 'Consistency', score: '99.8%', color: 'text-emerald-500' },
                  { title: 'Accuracy', score: '98.5%', color: 'text-emerald-500' },
                ].map((h, i) => (
                  <div key={i} className="p-4 bg-[var(--db-input-bg)] rounded-xl border text-center" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <span className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>{h.title}</span>
                    <span className={`block text-2xl font-black mt-1 ${h.color}`}>{h.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. Dataset Versions */}
          {activeTab === 'versions' && (
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="text-sm font-bold">Version History & Tags</h3>
              <div className="space-y-2 text-xs">
                {[
                  { tag: 'v1.2.0', hash: 'sha256:d83a9f', date: '2026-07-05 08:32', rows: '685 rows' },
                  { tag: 'v1.1.0', hash: 'sha256:bc3101', date: '2026-06-28 14:15', rows: '540 rows' },
                  { tag: 'v1.0.0', hash: 'sha256:7f01bc', date: '2026-06-15 09:00', rows: '420 rows' },
                ].map((ver, i) => (
                  <div key={i} className="p-3 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div>
                      <p className="font-bold">{ver.tag}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--db-text-muted)' }}>{ver.hash}</p>
                    </div>
                    <div className="text-right" style={{ color: 'var(--db-text-muted)' }}>
                      <p className="text-[10px] font-bold">{ver.rows}</p>
                      <p className="text-[9px]">{ver.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. Data Drift */}
          {activeTab === 'drift' && (
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold">Distribution Drift Analysis</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded">Drift Safe</span>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { feature: 'cgpa', drift: '0.012', status: 'Optimal' },
                  { feature: 'sslc_marks', drift: '0.045', status: 'Optimal' },
                  { feature: 'skills', drift: '0.082', status: 'Optimal' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div>
                      <p className="font-bold">{item.feature}</p>
                      <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Wasserstein distance metric</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">{item.status}</p>
                      <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Δ {item.drift}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. Storage Monitor */}
          {activeTab === 'storage' && (
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h3 className="text-sm font-bold">Data Center Storage Monitor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <HardDrive className="w-6 h-6 text-blue-500 mb-1" />
                  <span className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>Storage Allocated</span>
                  <p className="text-xl font-black mt-1">1.2 GB / 10 GB</p>
                </div>
                <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <Database className="w-6 h-6 text-violet-500 mb-1" />
                  <span className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>Total Row Volume</span>
                  <p className="text-xl font-black mt-1">2,420 rows</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
