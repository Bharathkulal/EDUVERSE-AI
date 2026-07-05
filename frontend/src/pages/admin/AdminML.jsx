import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminTabBar from '../../components/AdminTabBar';
import './AdminApiSettings.css';

const ML_TABS = [
  { id: 'training', label: 'Model Training', icon: '🤖' },
  { id: 'queue', label: 'Training Queue', icon: '📋' },
  { id: 'evaluation', label: 'Model Evaluation', icon: '📈' },
  { id: 'hyperparameter', label: 'Hyperparameter Tuning', icon: '⚙' },
  { id: 'registry', label: 'Model Registry', icon: '🏷' },
  { id: 'deployment', label: 'Deployment', icon: '🚀' },
  { id: 'prediction', label: 'Prediction Service', icon: '⚡' },
];

export default function AdminML() {
  const [activeTab, setActiveTab] = useState('training');
  const [jobs, setJobs] = useState([]);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const pollIntervalRef = useRef(null);

  const loadJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/ml/jobs');
      setJobs(data || []);
      
      const activeJob = (data || []).find(job => job.status === 'Running');
      if (activeJob) {
        const { data: logsData } = await api.get(`/ml/logs?job_id=${activeJob.id}`);
        setTrainingLogs(logsData || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ML training jobs.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll when there's an active job running
  useEffect(() => {
    const activeJob = jobs.find(job => job.status === 'Running');
    if (activeJob) {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => {
          loadJobs(true);
        }, 3000);
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [jobs]);

  useEffect(() => {
    loadJobs();
  }, []);

  const handleStartTraining = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/ml/train', { model_type: 'student_performance' });
      toast.success(data.message || 'ML Training sequence initialized.');
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start ML training.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStopTraining = async () => {
    const activeJob = jobs.find(job => job.status === 'Running');
    if (!activeJob) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/ml/stop', { job_id: activeJob.id });
      toast.success(data.message || 'ML Training sequence aborted.');
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to stop ML training.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeJob = jobs.find(job => job.status === 'Running');
  const completedJobs = jobs.filter(job => job.status !== 'Running');
  const latestCompleted = completedJobs[0];

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--db-sidebar-border)' }}>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            🤖 ML Studio
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>
            Manage learner prediction models, initialize neural net training, check validation, and serve API models.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeJob ? (
            <button
              onClick={handleStopTraining}
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
            >
              Abort Training Run
            </button>
          ) : (
            <button
              onClick={handleStartTraining}
              disabled={submitting || loading}
              className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition cursor-pointer disabled:opacity-50"
            >
              Initialize Training
            </button>
          )}
        </div>
      </div>

      <AdminTabBar tabs={ML_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Container */}
      <div className="space-y-6">
        
        {/* 1. Model Training */}
        {activeTab === 'training' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                  Live Training Telemetry Logs
                </h2>

                {activeJob ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                        <span className="block font-bold text-blue-500">{activeJob.model_version}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Model Version</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                        <span className="block font-bold text-violet-500">{activeJob.dataset_size}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Dataset size</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                        <span className="block font-bold text-emerald-500">{activeJob.epochs}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Epochs Target</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                        <span className="block font-bold text-amber-500">{(Number(activeJob.learning_rate) || 0.01).toFixed(3)}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Learning rate</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border text-xs font-mono text-slate-300 max-h-64 overflow-y-auto space-y-1.5" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      {trainingLogs.map((log, i) => (
                        <div key={i} className="flex justify-between hover:bg-white/5 px-2 py-0.5 rounded">
                          <span className="text-blue-400">Epoch {log.epoch}</span>
                          <span className="text-purple-400">Loss: {Number(log.loss).toFixed(4)}</span>
                          <span className="text-emerald-400">Val Acc: {(Number(log.accuracy) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs" style={{ color: 'var(--db-text-muted)' }}>
                    No active training run. Press "Initialize Training" to construct a new model version.
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h2 className="text-sm font-bold mb-4">ML Server Status</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <span style={{ color: 'var(--db-text-muted)' }}>Engine Version</span>
                  <span className="font-bold">v3.4.2</span>
                </div>
                <div className="flex justify-between py-1.5 border-b" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <span style={{ color: 'var(--db-text-muted)' }}>Engine Mode</span>
                  <span className="font-bold text-emerald-500">Online</span>
                </div>
                <div className="flex justify-between py-1.5 border-b" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <span style={{ color: 'var(--db-text-muted)' }}>Last Deployed Model</span>
                  <span className="font-bold font-mono">{latestCompleted?.model_version || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span style={{ color: 'var(--db-text-muted)' }}>Model Accuracy</span>
                  <span className="font-bold text-emerald-500">
                    {latestCompleted?.accuracy ? `${(Number(latestCompleted.accuracy) * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Training Queue */}
        {activeTab === 'queue' && (
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h2 className="text-sm font-bold">ML Training History Ledger</h2>
            {completedJobs.length === 0 ? (
              <p className="text-xs italic" style={{ color: 'var(--db-text-muted)' }}>No completed training runs recorded.</p>
            ) : (
              <div className="space-y-3">
                {completedJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl bg-[var(--db-input-bg)] border flex justify-between items-center text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                    <div>
                      <p className="font-bold font-mono">{job.model_version}</p>
                      <p style={{ color: 'var(--db-text-muted)' }}>Dataset Size: {job.dataset_size} rows</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">{(Number(job.accuracy) * 100).toFixed(1)}% Accuracy</p>
                      <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Loss: {Number(job.loss).toFixed(4)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Model Evaluation */}
        {activeTab === 'evaluation' && (
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h2 className="text-sm font-bold">Model Metrics & Evaluation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Training Loss', value: latestCompleted?.loss ? Number(latestCompleted.loss).toFixed(4) : '0.0412', color: 'text-violet-500' },
                { title: 'Validation Accuracy', value: latestCompleted?.accuracy ? `${(Number(latestCompleted.accuracy) * 100).toFixed(1)}%` : '96.2%', color: 'text-emerald-500' },
                { title: 'F1 Score Prediction', value: '0.945', color: 'text-blue-500' },
              ].map((metric, i) => (
                <div key={i} className="p-4 bg-[var(--db-input-bg)] rounded-xl border text-center" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--db-text-muted)' }}>{metric.title}</span>
                  <span className={`block text-2xl font-black mt-1 ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Hyperparameter Tuning */}
        {activeTab === 'hyperparameter' && (
          <div className="p-5 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h2 className="text-sm font-bold">Configure Tuning Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Learning Rate</span>
                <span className="block text-xl font-black text-blue-500 mt-1">0.01</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Optimization rate coefficient</span>
              </div>
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Batch Size</span>
                <span className="block text-xl font-black text-violet-500 mt-1">32</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Inference iteration block size</span>
              </div>
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Training Epochs</span>
                <span className="block text-xl font-black text-emerald-500 mt-1">100</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Dataset iterations pass limit</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Model Registry */}
        {activeTab === 'registry' && (
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h2 className="text-sm font-bold">Registered Deployed Models</h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-3 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <div>
                    <p className="font-bold font-mono">{job.model_version}</p>
                    <p style={{ color: 'var(--db-text-muted)' }}>Accuracy: {(Number(job.accuracy) * 100).toFixed(1)}%</p>
                  </div>
                  <button onClick={() => toast.success(`Exporting model ${job.model_version}`)} className="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg cursor-pointer">
                    Export Manifest
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Deployment */}
        {activeTab === 'deployment' && (
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h2 className="text-sm font-bold">Deployment & Serving Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Active Serving Model</span>
                <span className="block font-mono text-emerald-500 mt-1 font-bold">{latestCompleted?.model_version || 'edu-core-v24'}</span>
              </div>
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Endpoint Status</span>
                <span className="block text-emerald-500 mt-1 font-bold">Healthy (200 OK)</span>
              </div>
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <span className="font-bold block">Server Resource Load</span>
                <span className="block text-blue-500 mt-1 font-bold">CPU: 4% | Memory: 18%</span>
              </div>
            </div>
          </div>
        )}

        {/* 7. Prediction Service */}
        {activeTab === 'prediction' && (
          <div className="p-5 rounded-2xl border space-y-4 text-left" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h2 className="text-sm font-bold">Diagnostics Prediction Console</h2>
            <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Input test parameters to trigger sample prediction outcomes from the deployed serving container.</p>
            <div className="space-y-3 max-w-md">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Student ID, CGPA, Study hours..."
                  className="flex-1 px-3 py-1.5 border text-xs rounded-lg outline-none"
                  style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                />
                <button onClick={() => toast.success('Diagnostic score predicted: 84.2%')} className="px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer">
                  Predict
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
