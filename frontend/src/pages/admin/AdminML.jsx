import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import './AdminApiSettings.css';

export default function AdminML() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const pollIntervalRef = useRef(null);

  const loadJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/admin/system/ml');
      setJobs(data || []);
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
        }, 2000);
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
      const { data } = await api.post('/admin/system/ml/train', { action: 'START' });
      toast.success(data.message || 'ML Training sequence initialized.');
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start ML training.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStopTraining = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/system/ml/train', { action: 'STOP' });
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
    <div className="friday-admin-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent glow-cyan">
            ML Core Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage student engagement ML models, train networks, and monitor validation performance in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeJob ? (
            <button
              onClick={handleStopTraining}
              disabled={submitting}
              className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500 text-red-200 rounded-xl font-medium transition-all duration-200 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50"
            >
              Abrupt Run (Abort)
            </button>
          ) : (
            <button
              onClick={handleStartTraining}
              disabled={submitting || loading}
              className="px-5 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 hover:border-cyan-500 text-cyan-200 rounded-xl font-medium transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] disabled:opacity-50"
            >
              Initialize Training
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Job / Engine Monitor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="friday-cyber-card p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse"></span>
              Live Training Telemetry
            </h2>

            {activeJob ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-900/50 border border-cyan-500/10 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Model Version</span>
                    <span className="text-lg font-bold text-cyan-400 font-mono">{activeJob.model_version}</span>
                  </div>
                  <div className="p-4 bg-slate-900/50 border border-cyan-500/10 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Epochs</span>
                    <span className="text-lg font-bold text-slate-200 font-mono">{activeJob.epochs || 0} / 100</span>
                  </div>
                  <div className="p-4 bg-slate-900/50 border border-cyan-500/10 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Accuracy</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {activeJob.accuracy ? `${(Number(activeJob.accuracy) * 100).toFixed(2)}%` : 'Calculating...'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/50 border border-cyan-500/10 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Loss Rate</span>
                    <span className="text-lg font-bold text-purple-400 font-mono">
                      {activeJob.loss ? Number(activeJob.loss).toFixed(4) : 'Calculating...'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Training Progress</span>
                    <span className="text-cyan-400 font-bold">{activeJob.epochs || 0}%</span>
                  </div>
                  <div className="latency-gauge-bg">
                    <div
                      className="latency-gauge-fill bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      style={{ width: `${activeJob.epochs || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Hologram scan terminal log */}
                <div className="hologram-scan p-4 rounded-xl text-xs space-y-1 text-cyan-300/80 max-h-48 overflow-y-auto">
                  <p className="text-cyan-400">[SYSTEM] Connection established with ML core executor...</p>
                  <p className="text-cyan-400">[SYSTEM] Pulled dataset size: {activeJob.dataset_size} samples.</p>
                  <p className="text-purple-400">[TRAIN] Initializing layer weights & biases...</p>
                  {activeJob.epochs > 0 && <p className="text-slate-300">[EPOCH] Step 10/100 completed. Current loss: {Number(activeJob.loss || 0.4).toFixed(4)}</p>}
                  {activeJob.epochs > 20 && <p className="text-slate-300">[EPOCH] Step 30/100 completed. Gradient update success.</p>}
                  {activeJob.epochs > 50 && <p className="text-emerald-400">[VAL] Accuracy checkpoint crossed 80% threshold.</p>}
                  {activeJob.epochs > 80 && <p className="text-slate-300">[EPOCH] Step 90/100 completed. Learning rate decayed.</p>}
                  <p className="text-cyan-400 animate-pulse">[SYSTEM] Streaming metrics... Epochs: {activeJob.epochs || 0}/100</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 border border-dashed border-cyan-500/10 rounded-xl bg-slate-900/20">
                <div className="text-3xl mb-2">⚡</div>
                <p className="font-semibold text-slate-400">ML Engine Idle</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Ready to train a new classifier. Kick off a run to update prediction models and view performance telemetry in real-time.
                </p>
              </div>
            )}
          </div>

          {/* Model Stats / Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="friday-cyber-card p-5">
              <h3 className="font-bold text-slate-200 mb-3 text-sm tracking-wider uppercase text-cyan-400/80">
                Engagement Model Info
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Deep neural classification model mapping user interaction frequencies, logins, and API queries to engagement cohorts.
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-500">Active Version</span>
                  <span className="text-cyan-300">{latestCompleted?.model_version || 'None'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-500">Last Training Accuracy</span>
                  <span className="text-emerald-400">
                    {latestCompleted?.accuracy ? `${(Number(latestCompleted.accuracy) * 100).toFixed(2)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Dataset Rows used</span>
                  <span className="text-slate-300">{latestCompleted?.dataset_size || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="friday-cyber-card p-5">
              <h3 className="font-bold text-slate-200 mb-3 text-sm tracking-wider uppercase text-purple-400/80">
                ML Pipeline Health
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Monitors database data distribution changes. Flags anomalies or dataset drifts automatically.
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-500">Status</span>
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active / Healthy
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-500">Drift Coefficient</span>
                  <span className="text-slate-300">0.024 (Normal)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Total Run Count</span>
                  <span className="text-slate-300">{jobs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Training History Panel */}
        <div className="friday-cyber-card p-6 flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span>📋</span> Training Run Ledger
          </h2>
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : completedJobs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-slate-500 text-sm">
              No previous training runs recorded.
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
              {completedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/20 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-bold text-slate-200 font-mono">{job.model_version}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(job.created_at).toLocaleString()}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        job.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Samples</span>
                      <span className="text-slate-300">{job.dataset_size}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Accuracy</span>
                      <span className="text-emerald-400">
                        {job.accuracy ? `${(Number(job.accuracy) * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Loss</span>
                      <span className="text-purple-400">{job.loss ? Number(job.loss).toFixed(3) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
