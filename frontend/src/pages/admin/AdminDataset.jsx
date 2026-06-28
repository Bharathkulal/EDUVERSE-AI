import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  FileUp, Database, Trash2, RefreshCw, Eye, BarChart2, Calendar, FileText, CheckCircle, ChevronRight, X
} from 'lucide-react';
import api from '../../api/axios';
import './AdminApiSettings.css';

export default function AdminDataset() {
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
    <div className="friday-admin-container relative space-y-6">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            📁 DATASET OPERATIONS HUB
          </h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5 font-mono font-bold">Import CSV/JSON records, validate attributes, check version histories and distributions</p>
        </div>
        <button onClick={fetchDatasets} className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-300 rounded-lg hover:border-cyan-500/30 transition flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Synchronize Records
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Uploader and Datasets list */}
          <div className="space-y-4 lg:col-span-1">
            
            {/* Upload form */}
            <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Import Training Data</h3>
              <p className="text-[10px] text-slate-400 font-mono">Accepts structured CSV or JSON array files containing metrics.</p>
              
              <label className={`w-full py-4 border border-dashed border-white/15 hover:border-cyan-400/30 rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${uploading ? 'opacity-50' : ''}`}>
                <FileUp className="w-6 h-6 text-cyan-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{uploading ? 'Uploading...' : 'Choose CSV / JSON'}</span>
                <input type="file" accept=".csv,.json" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            {/* List */}
            <div className="friday-cyber-card p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Datasets</h3>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {datasets.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDataset(d); setPreviewData(null); setStatsData(null); }}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition friday-selectable-item ${
                      selectedDataset?.id === d.id ? 'active' : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs truncate max-w-[150px]">{d.filename}</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">{d.row_count} Rows • Version: {d.versions?.length || 1}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
                {datasets.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs italic">Registry is empty.</div>
                )}
              </div>
            </div>

          </div>

          {/* Details and Telemetry Viewer */}
          <div className="lg:col-span-2 space-y-4">
            {selectedDataset ? (
              <div className="friday-cyber-card p-6 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl space-y-6">
                
                {/* Details header */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" /> {selectedDataset.filename}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Uploaded: {new Date(selectedDataset.uploaded_at).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => handlePreview(selectedDataset.id)} className="px-3 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-400 rounded-lg hover:border-cyan-400/30 transition flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Preview Rows
                    </button>
                    <button onClick={() => handleFetchStats(selectedDataset.id)} className="px-3 py-1.5 bg-slate-900 border border-white/5 text-xs text-purple-400 rounded-lg hover:border-purple-400/30 transition flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5" /> Column Stats
                    </button>
                    <button onClick={() => handleDelete(selectedDataset.id, selectedDataset.filename)} className="p-1.5 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-500 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Versions */}
                <div className="space-y-2">
                  <h4 className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">Version Changelog history</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDataset.versions && selectedDataset.versions.map((v) => (
                      <div key={v.id} className="px-3 py-1 bg-slate-950/40 border border-white/5 rounded-lg text-[9px] font-mono text-slate-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-cyan-400" />
                        <span>v{v.version_number}</span>
                        <span>({v.row_count} rows)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview telemetry table */}
                {previewLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : previewData ? (
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Telemetry Preview Rows</h4>
                    <div className="overflow-x-auto max-h-60 border border-white/5 rounded-xl bg-slate-950/60 p-2.5">
                      <table className="w-full text-[10px] text-left font-mono">
                        <thead>
                          <tr className="text-slate-500 border-b border-white/5 pb-1">
                            {previewData.rows.length > 0 && Object.keys(previewData.rows[0]).map((col, idx) => (
                              <th key={idx} className="pb-2 pr-3">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.rows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                              {Object.values(row).map((val, valIdx) => (
                                <td key={valIdx} className="py-2 pr-3 text-white">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {/* Statistics display */}
                {statsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : statsData ? (
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Column-wise Statistics analysis</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[10px]">
                      {Object.entries(statsData.stats).map(([colName, colStat]) => (
                        <div key={colName} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1.5">
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-white font-bold">{colName}</span>
                            <span className="text-slate-500 text-[8px] uppercase">{colStat.type}</span>
                          </div>
                          
                          {colStat.type === 'Numeric' ? (
                            <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-400">
                              <div>Min: <span className="text-white font-bold">{colStat.min}</span></div>
                              <div>Max: <span className="text-white font-bold">{colStat.max}</span></div>
                              <div>Mean: <span className="text-white font-bold">{colStat.mean}</span></div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {colStat.topValues && colStat.topValues.map((v, i) => (
                                <div key={i} className="flex justify-between text-slate-400 text-[8px]">
                                  <span>{String(v.value || 'null')}</span>
                                  <span>{v.count} occurrences</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

              </div>
            ) : (
              <div className="friday-cyber-card p-10 text-center text-slate-500 font-mono border border-white/5 bg-slate-950/40">
                Select a dataset or upload a new one to begin review procedures.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
