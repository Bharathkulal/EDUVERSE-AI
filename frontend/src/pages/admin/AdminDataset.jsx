import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AdminDataset() {
  const [datasets, setDatasets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = () => api.get('/ml/datasets').then((res) => setDatasets(res.data));
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('dataset', file);
    try {
      await api.post('/ml/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Dataset uploaded');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dataset Management</h1>
        <p className="text-slate-500">Upload CSV or Excel datasets for ML training</p>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Upload Dataset</h2>
        <p className="text-sm text-slate-500 mb-4">
          Required columns: quiz_score, coding_score, study_hours, attendance, final_marks
        </p>
        <label className={`btn-primary cursor-pointer inline-block ${uploading ? 'opacity-50' : ''}`}>
          {uploading ? 'Uploading...' : 'Choose CSV / Excel File'}
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-4">Uploaded Datasets</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Filename</th>
              <th className="pb-2">Rows</th>
              <th className="pb-2">Columns</th>
              <th className="pb-2">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="py-2">{d.filename}</td>
                <td>{d.row_count}</td>
                <td className="text-xs max-w-xs truncate">
                  {Array.isArray(d.columns) ? d.columns.join(', ') : typeof d.columns === 'string' ? d.columns : JSON.stringify(d.columns)}
                </td>
                <td className="text-slate-500">{new Date(d.uploaded_at).toLocaleString()}</td>
              </tr>
            ))}
            {datasets.length === 0 && (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">No datasets uploaded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-800">Sample Dataset Format</h3>
        <pre className="text-xs mt-2 text-blue-900 overflow-x-auto">
{`quiz_score,coding_score,study_hours,attendance,final_marks
75,80,40,90,82
60,55,25,75,65`}
        </pre>
      </div>
    </div>
  );
}
