import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function AiExamIntelligenceSuite() {
  const [activeTab, setActiveTab] = useState('grading'); // grading, similarity, handwriting, summary
  const [analyzing, setAnalyzing] = useState(false);

  const mockGradingResult = {
    totalMarks: 92,
    maxMarks: 100,
    rubricBreakdown: [
      { question: 'Q1: Backpropagation & Chain Rule', max: 20, awarded: 19, feedback: 'Accurate derivation. Minor notation omission in layer 2 weight updates.' },
      { question: 'Q2: L1 vs L2 Regularization', max: 20, awarded: 18, feedback: 'Clear distinction between sparsity vs weight shrinkage.' },
      { question: 'Q3: SVM Dual Optimization', max: 20, awarded: 19, feedback: 'Flawless mathematical formulation of Lagrange multipliers.' },
      { question: 'Q4: CNN Architecture & Max Pooling', max: 20, awarded: 18, feedback: 'Good conceptual diagram. Spatial dimension reduction explained well.' },
      { question: 'Q5: Evaluation Metrics (Precision/Recall/F1)', max: 20, awarded: 18, feedback: 'Correct definitions and harmonic mean explanation.' }
    ],
    missingQuestions: [],
    pageSequenceCheck: 'Verified Correct Order (Pages 1 to 6)',
    handwritingLegibility: '94% (High clarity)',
    cheatingAnomalyIndex: '0.2% (Normal behavior)'
  };

  const handleRunRevaluation = () => {
    setAnalyzing(true);
    toast.loading('AI Revaluation Engine auditing question marks...', { id: 'ai-reval' });
    setTimeout(() => {
      setAnalyzing(false);
      toast.success('AI Revaluation Complete: Final verified score is 92/100.', { id: 'ai-reval' });
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 p-6 rounded-3xl border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              AI Powered Intelligence
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Exam AI Evaluation & Fraud Detection Suite
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Automated Marks Prediction, Handwriting OCR, Similarity Plagiarism Check, and Cheating Anomaly Analysis
            </p>
          </div>

          <button
            onClick={handleRunRevaluation}
            disabled={analyzing}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/30 transition-all"
          >
            {analyzing ? 'Analyzing...' : '🧠 Run AI Audit & Revaluation'}
          </button>
        </div>
      </div>

      {/* 2. Sub Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('grading')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'grading'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          💯 AI Marks & Rubric Evaluation
        </button>
        <button
          onClick={() => setActiveTab('similarity')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'similarity'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🔍 Peer Similarity & Anti-Plagiarism
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'summary'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 Student Feedback & Executive Summary
        </button>
      </div>

      {/* 3. Content Views */}
      {activeTab === 'grading' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Predicted Score</span>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                {mockGradingResult.totalMarks} <span className="text-xs text-slate-500">/ 100</span>
              </p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Legibility Score</span>
              <p className="text-3xl font-extrabold text-cyan-400 mt-1">{mockGradingResult.handwritingLegibility}</p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Page Sequence</span>
              <p className="text-sm font-bold text-emerald-300 mt-2">{mockGradingResult.pageSequenceCheck}</p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Anomaly Flag</span>
              <p className="text-sm font-bold text-slate-200 mt-2">{mockGradingResult.cheatingAnomalyIndex}</p>
            </div>
          </div>

          {/* Rubric Breakdown Table */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Question-wise AI Rubric Breakdown
            </h3>
            <div className="space-y-2">
              {mockGradingResult.rubricBreakdown.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{item.question}</p>
                    <p className="text-slate-400 mt-0.5">{item.feedback}</p>
                  </div>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm pl-4">
                    {item.awarded} / {item.max}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'similarity' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            AI Plagiarism & Collusion Heatmap Analysis
          </h3>
          <p className="text-xs text-slate-400">
            Compares handwriting patterns and phrase similarity across all 45 submissions for Machine Learning.
          </p>

          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
                ✓
              </span>
              <div>
                <p className="font-bold text-white">Alex Mercer (CS2026-042)</p>
                <p className="text-emerald-300 mt-0.5">Similarity Index: 2.4% (Passed Anti-Plagiarism Threshold)</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold rounded-full">
              CLEARED
            </span>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Personalized AI Student Feedback
          </h3>
          <div className="p-4 bg-slate-950 rounded-xl text-slate-300 space-y-2 border border-slate-800">
            <p className="font-bold text-cyan-300">Strengths Identified:</p>
            <p>• Exceptional mathematical modeling in Deep Learning and Backpropagation derivations.</p>
            <p>• Excellent diagram clarity for Convolutional Neural Network layers.</p>
            <p className="font-bold text-purple-300 mt-2">Recommended Focus Areas:</p>
            <p>• Review parameter tuning for L1 Regularization sparsity vs L2 Ridge regression constraints.</p>
          </div>
        </div>
      )}
    </div>
  );
}
