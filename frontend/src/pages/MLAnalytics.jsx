import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function MLAnalytics() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrediction();
  }, []);

  const loadPrediction = () => {
    api.get('/predictions/student').then((res) => setPrediction(res.data));
  };

  const generatePrediction = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/predictions/generate');
      setPrediction(data);
      toast.success('Prediction generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const skillColors = {
    Beginner: 'bg-amber-100 text-amber-800',
    Intermediate: 'bg-blue-100 text-blue-800',
    Advanced: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ML Analytics</h1>
          <p className="text-slate-500">Machine learning powered performance insights</p>
        </div>
        <button onClick={generatePrediction} className="btn-primary" disabled={loading}>
          {loading ? 'Analyzing...' : 'Generate Prediction'}
        </button>
      </div>

      {!prediction?.predicted_score && !prediction?.message ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">🧠</p>
          <p className="text-slate-600">Complete quizzes and coding practice, then generate your ML prediction.</p>
          <button onClick={generatePrediction} className="btn-primary mt-4" disabled={loading}>Get Started</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <p className="text-primary-100 text-sm">Predicted Score</p>
            <p className="text-4xl font-bold mt-2">{prediction.predicted_score ?? '—'}%</p>
            <p className="text-primary-200 text-xs mt-1">Semester Performance</p>
          </div>
          <div className="card">
            <p className="text-slate-500 text-sm">Skill Level</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${skillColors[prediction.skill_level] || 'bg-slate-100'}`}>
              {prediction.skill_level || 'Not assessed'}
            </span>
            <p className="text-xs text-slate-400 mt-2">K-Means Clustering</p>
          </div>
          <div className="card">
            <p className="text-slate-500 text-sm">Weak Subject</p>
            <p className="text-lg font-semibold mt-2 text-amber-600">{prediction.weak_subject || '—'}</p>
          </div>
          <div className="card md:col-span-2 lg:col-span-1">
            <p className="text-slate-500 text-sm">Algorithm</p>
            <p className="text-sm mt-2">Linear Regression + K-Means</p>
          </div>
        </div>
      )}

      {prediction?.recommendations && (
        <div className="card">
          <h2 className="font-semibold mb-3">Personalized Recommendations</h2>
          <p className="text-slate-700">{prediction.recommendations}</p>
        </div>
      )}

      <div className="card bg-slate-50">
        <h2 className="font-semibold mb-2">How it works</h2>
        <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
          <li>Linear Regression predicts your final marks from quiz, coding, study hours, and attendance</li>
          <li>K-Means clustering classifies you as Beginner, Intermediate, or Advanced</li>
          <li>Weak subjects are identified by comparing quiz vs coding performance</li>
        </ul>
      </div>
    </div>
  );
}
