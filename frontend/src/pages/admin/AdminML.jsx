import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AdminML() {
  const [status, setStatus] = useState(null);
  const [training, setTraining] = useState(false);

  const loadStatus = () => api.get('/ml/status').then((res) => setStatus(res.data)).catch(() => setStatus({ ml_service: { status: 'offline' } }));

  useEffect(() => { loadStatus(); }, []);

  const train = async (retrain = false) => {
    setTraining(true);
    try {
      const { data } = await api.post('/ml/train', { retrain });
      toast.success(data.message || 'Training complete!');
      loadStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Training failed. Ensure ML service is running.');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ML Training Module</h1>
          <p className="text-slate-500">Train Linear Regression and K-Means models</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => train(false)} className="btn-primary" disabled={training}>
            {training ? 'Training...' : 'Train Model'}
          </button>
          <button onClick={() => train(true)} className="btn-secondary" disabled={training}>Retrain Model</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-slate-500 text-sm">ML Service</p>
          <p className={`text-lg font-bold ${status?.ml_service?.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
            {status?.ml_service?.status || 'checking...'}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-slate-500 text-sm">Datasets</p>
          <p className="text-2xl font-bold">{status?.datasets?.count || 0}</p>
          <p className="text-xs text-slate-400">{status?.datasets?.total_rows || 0} total rows</p>
        </div>
        <div className="stat-card">
          <p className="text-slate-500 text-sm">Saved Models</p>
          <p className="text-2xl font-bold">{status?.saved_models?.length || 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-3">Linear Regression</h2>
          <p className="text-sm text-slate-600 mb-4">Predicts final student marks from quiz, coding, study hours, and attendance.</p>
          {status?.saved_models?.filter((m) => m.model_type === 'linear_regression').map((m) => (
            <div key={m.id} className="p-3 bg-slate-50 rounded-lg text-sm mb-2">
              <p>Accuracy (R²): <strong>{(Number(m.accuracy) * 100).toFixed(1)}%</strong></p>
              <p>Dataset Size: {m.dataset_size}</p>
              <p className="text-slate-400 text-xs">Trained: {new Date(m.trained_at).toLocaleString()}</p>
            </div>
          ))}
          {(!status?.saved_models?.some((m) => m.model_type === 'linear_regression')) && (
            <p className="text-slate-400 text-sm">Not trained yet</p>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">K-Means Clustering</h2>
          <p className="text-sm text-slate-600 mb-4">Classifies students into Beginner, Intermediate, and Advanced.</p>
          {status?.saved_models?.filter((m) => m.model_type === 'kmeans').map((m) => (
            <div key={m.id} className="p-3 bg-slate-50 rounded-lg text-sm mb-2">
              <p>Silhouette Score: <strong>{Number(m.accuracy || 0).toFixed(4)}</strong></p>
              <p>Dataset Size: {m.dataset_size}</p>
              <p className="text-slate-400 text-xs">Trained: {new Date(m.trained_at).toLocaleString()}</p>
            </div>
          ))}
          {(!status?.saved_models?.some((m) => m.model_type === 'kmeans')) && (
            <p className="text-slate-400 text-sm">Not trained yet</p>
          )}
        </div>
      </div>

      <div className="card bg-slate-50">
        <h2 className="font-semibold mb-2">Training Instructions</h2>
        <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
          <li>Upload a dataset from the Dataset page (or use the auto-generated sample)</li>
          <li>Start the Python ML service on port 8000</li>
          <li>Click Train Model to train both algorithms</li>
          <li>Students can then generate predictions from ML Analytics</li>
        </ol>
      </div>
    </div>
  );
}
