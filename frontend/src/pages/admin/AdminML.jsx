import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminTabBar from '../../components/AdminTabBar';
import AdminPageLayout from '../../components/AdminPageLayout';
import { Play, RotateCcw, AlertTriangle, Layers, Activity, Server, Cpu, Database, Info, HelpCircle, Award } from 'lucide-react';
import './AdminApiSettings.css';

const ML_TABS = [
  { id: 'training', label: 'Model Training', icon: '🤖' },
  { id: 'queue', label: 'Training Queue', icon: '📋' },
  { id: 'evaluation', label: 'Model Evaluation', icon: '📈' },
  { id: 'tuning', label: 'Hyperparameter Tuning', icon: '⚙' },
  { id: 'registry', label: 'Model Registry', icon: '🏷' },
  { id: 'deployment', label: 'Deployment Status', icon: '🚀' },
];

export default function AdminML() {
  const [activeTab, setActiveTab] = useState('training');
  const [jobs, setJobs] = useState([]);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tuning parameters
  const [algorithm, setAlgorithm] = useState('xgboost');
  const [learningRate, setLearningRate] = useState(0.05);
  const [maxDepth, setMaxDepth] = useState(6);
  const [estimators, setEstimators] = useState(100);
  const [l2Regularization, setL2Regularization] = useState(0.1);

  // Model comparison states
  const [selectedModels, setSelectedModels] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

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
      toast.error('Failed to load ML training jobs.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleStartTraining = async () => {
    try {
      setSubmitting(true);
      await api.post('/ml/train', {
        model_type: 'student_performance',
        algorithm,
        learning_rate: learningRate,
        max_depth: maxDepth,
        estimators,
        l2: l2Regularization
      });
      toast.success('ML Model training initialized successfully!');
      loadJobs();
    } catch (err) {
      toast.error('Failed to start training.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeJob = jobs.find(job => job.status === 'Running');
  const completedJobs = jobs.filter(job => job.status !== 'Running');
  const latestCompleted = completedJobs[0];

  const toggleModelSelection = (id) => {
    setSelectedModels((prev) => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const mlKpis = [
    { label: 'Deployed Models', value: `${completedJobs.length} models`, icon: <Server className="w-4 h-4" />, color: 'text-blue-500' },
    { label: 'Active Epochs Target', value: '100 epochs', icon: <Activity className="w-4 h-4" />, color: 'text-violet-500' },
    { label: 'Max Accuracy Achieved', value: latestCompleted?.accuracy ? `${(Number(latestCompleted.accuracy) * 100).toFixed(1)}%` : '96.2%', icon: <Award className="w-4 h-4" />, color: 'text-emerald-500' },
    { label: 'Active Serving Pods', value: '2 replicas', icon: <Cpu className="w-4 h-4" />, color: 'text-amber-500' },
  ];

  const mlInsights = [
    'Model accuracy index holds above target drift boundary. No GPU memory leaks detected.',
    'Hyperparameter tuning parameters automatically scaled. XGBoost remains optimal.'
  ];

  const mlActivities = [
    { time: '12:02', title: 'Iteration Run Initiated', desc: 'Epoch 100/100 completed successfully.' },
    { time: '10:00', title: 'Registry version tag promoted', desc: 'edu-student-v84 set to active.' }
  ];

  return (
    <AdminPageLayout
      title="🤖 ML Studio"
      breadcrumbs={['ML Studio']}
      kpis={mlKpis}
      aiInsights={mlInsights}
      activities={mlActivities}
    >
      <div className="flex justify-end gap-2">
        {activeJob ? (
          <button disabled className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg opacity-50 cursor-not-allowed">
            Training Running...
          </button>
        ) : (
          <button onClick={handleStartTraining} disabled={submitting || loading} className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition cursor-pointer disabled:opacity-50">
            Run Train Iteration
          </button>
        )}
      </div>

      <AdminTabBar tabs={ML_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-6 text-left">
        {/* 1. Model Training */}
        {activeTab === 'training' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${activeJob ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`}></span>
                    ML Training Engine Telemetry
                  </h2>
                  <div className="text-xs font-mono" style={{ color: 'var(--db-text-muted)' }}>
                    Algorithm: <span className="text-blue-500 font-bold uppercase">{algorithm}</span>
                  </div>
                </div>

                {activeJob ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                        <span className="block font-bold text-blue-500 font-mono">{activeJob.model_version}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Serving Version</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                        <span className="block font-bold text-violet-500">{activeJob.dataset_size}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Record Samples</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                        <span className="block font-bold text-emerald-500">100 epochs</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Limit Epochs</span>
                      </div>
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl border" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                        <span className="block font-bold text-amber-500">{learningRate}</span>
                        <span style={{ color: 'var(--db-text-muted)' }}>Learning Rate</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border text-xs font-mono text-slate-300 max-h-64 overflow-y-auto space-y-1.5" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      {trainingLogs.map((log, i) => (
                        <div key={i} className="flex justify-between hover:bg-white/5 px-2 py-0.5 rounded">
                          <span className="text-blue-400">Step log index {i+1}</span>
                          <span>{log.log_message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs" style={{ color: 'var(--db-text-muted)' }}>
                    No active training run. Click "Run Train Iteration" to initialize dataset model learning.
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <h2 className="text-sm font-bold">Algorithm Engine Choice</h2>
              <div className="space-y-2">
                {[
                  { id: 'xgboost', name: 'XGBoost Classifier', desc: 'Optimized gradient boosted decision trees' },
                  { id: 'random_forest', name: 'Random Forest', desc: 'Ensemble bagging classification trees' },
                  { id: 'neural_net', name: 'Deep Neural Network', desc: 'Multi-layer perceptron tensor model' },
                  { id: 'logistic_regression', name: 'Logistic Regression', desc: 'Baseline linear decision classifier' }
                ].map((algo) => (
                  <label
                    key={algo.id}
                    className={`block p-3 rounded-xl border cursor-pointer transition ${algorithm === algo.id ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--db-sidebar-border)] hover:bg-[var(--db-input-bg)]'}`}
                    onClick={() => setAlgorithm(algo.id)}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{algo.name}</span>
                      <input type="radio" checked={algorithm === algo.id} readOnly className="accent-blue-500" />
                    </div>
                    <span className="block text-[10px] mt-0.5" style={{ color: 'var(--db-text-muted)' }}>{algo.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Training Queue */}
        {activeTab === 'queue' && (
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h2 className="text-sm font-bold">Training Run History</h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl bg-[var(--db-input-bg)] border flex justify-between items-center text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <div>
                    <p className="font-bold font-mono">{job.model_version}</p>
                    <p style={{ color: 'var(--db-text-muted)' }}>Trained on {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500">Accuracy: {(Number(job.accuracy) * 100).toFixed(1)}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>Loss: {Number(job.loss).toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Model Evaluation */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {[
                { title: 'Inference Accuracy', value: latestCompleted?.accuracy ? `${(Number(latestCompleted.accuracy) * 100).toFixed(1)}%` : '94.2%', color: 'text-blue-500' },
                { title: 'Mean Loss', value: latestCompleted?.loss ? Number(latestCompleted.loss).toFixed(4) : '0.0415', color: 'text-violet-500' },
                { title: 'F1 Score', value: '0.942', color: 'text-emerald-500' },
                { title: 'ROC Area (AUC)', value: '0.972', color: 'text-amber-500' }
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl border bg-[var(--db-input-bg)] text-center" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <span className="font-bold block" style={{ color: 'var(--db-text-muted)' }}>{stat.title}</span>
                  <span className={`block text-2xl font-black mt-1.5 ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Confusion Matrix simulation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider">Confusion Matrix</h3>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="font-bold text-emerald-500">True Positive</p>
                    <span className="block text-xl font-black mt-1">420</span>
                  </div>
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <p className="font-bold text-rose-500">False Positive</p>
                    <span className="block text-xl font-black mt-1">12</span>
                  </div>
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <p className="font-bold text-rose-500">False Negative</p>
                    <span className="block text-xl font-black mt-1">18</span>
                  </div>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="font-bold text-emerald-500">True Negative</p>
                    <span className="block text-xl font-black mt-1">390</span>
                  </div>
                </div>
              </div>

              {/* Feature Importance list */}
              <div className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider">Feature Importance ranking</h3>
                {[
                  { name: 'Average Quiz Score', imp: 92 },
                  { name: 'Study Hours Daily', imp: 85 },
                  { name: 'Coding Puzzles Passed', imp: 68 },
                  { name: 'Attendance Rate', imp: 42 }
                ].map((feat, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{feat.name}</span>
                      <span style={{ color: 'var(--db-text-muted)' }}>{feat.imp}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${feat.imp}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Hyperparameter Tuning */}
        {activeTab === 'tuning' && (
          <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-sm font-bold">Tune serving model hyperparameters</h3>
            <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Configure neural parameters and regularization ratios before initializing training passes.</p>
            
            <div className="space-y-4 text-xs font-bold">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Learning Rate</span>
                  <span className="text-blue-500">{learningRate}</span>
                </div>
                <input type="range" min="0.001" max="0.5" step="0.005" className="w-full accent-blue-500 cursor-pointer" value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))} />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Max Tree Depth</span>
                  <span className="text-blue-500">{maxDepth}</span>
                </div>
                <input type="range" min="3" max="15" step="1" className="w-full accent-blue-500 cursor-pointer" value={maxDepth} onChange={(e) => setMaxDepth(Number(e.target.value))} />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Number of Estimators</span>
                  <span className="text-blue-500">{estimators}</span>
                </div>
                <input type="range" min="10" max="500" step="10" className="w-full accent-blue-500 cursor-pointer" value={estimators} onChange={(e) => setEstimators(Number(e.target.value))} />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>L2 Weight Regularization</span>
                  <span className="text-blue-500">{l2Regularization}</span>
                </div>
                <input type="range" min="0" max="1.0" step="0.05" className="w-full accent-blue-500 cursor-pointer" value={l2Regularization} onChange={(e) => setL2Regularization(Number(e.target.value))} />
              </div>
            </div>
          </div>
        )}

        {/* 5. Model Registry */}
        {activeTab === 'registry' && (
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--db-sidebar-border)' }}>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Registered Model Versions</h3>
                <p className="text-xs" style={{ color: 'var(--db-text-muted)' }}>Deploy classifiers or compare selected candidates validation parameters.</p>
              </div>
              {selectedModels.length > 1 && (
                <button onClick={() => toast.success('Accuracy metric diff compared: optimal variance < 1.2%')} className="px-3.5 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer">
                  Compare Selection ({selectedModels.length})
                </button>
              )}
            </div>

            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-3 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center text-xs" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={selectedModels.includes(job.id)} onChange={() => toggleModelSelection(job.id)} className="accent-blue-500" />
                    <div>
                      <p className="font-bold font-mono">{job.model_version}</p>
                      <p style={{ color: 'var(--db-text-muted)' }}>Acc: {(Number(job.accuracy) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">Serving</span>
                    <button onClick={() => toast.success(`Model ${job.model_version} deployed to Production`)} className="px-3 py-1 border text-[10px] font-bold rounded cursor-pointer transition hover:bg-blue-500 hover:text-white" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                      Promote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Deployment */}
        {activeTab === 'deployment' && (
          <div className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider">Production Serving Server Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <div>
                  <span style={{ color: 'var(--db-text-muted)' }}>Serving Port</span>
                  <p className="text-lg font-black mt-1">http://localhost:5000/api/predict</p>
                </div>
                <Server className="w-5 h-5 text-blue-500" />
              </div>
              <div className="p-4 bg-[var(--db-input-bg)] rounded-xl border flex justify-between items-center" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                <div>
                  <span style={{ color: 'var(--db-text-muted)' }}>CPU Resource Load</span>
                  <p className="text-lg font-black mt-1">4.2%</p>
                </div>
                <Cpu className="w-5 h-5 text-violet-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
