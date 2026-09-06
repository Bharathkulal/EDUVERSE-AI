import React, { useState, useEffect } from 'react';
import { examQrApi } from '../../services/ExamAI/examQrApi';

export default function QrSystemAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    const res = await examQrApi.getAnalytics();
    setLoading(false);
    if (res.success) {
      setData(res);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        Loading System Analytics...
      </div>
    );
  }

  const { stats, departmentStats, recentLogs } = data;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Exams</span>
          <p className="text-3xl font-extrabold text-white">{stats.totalExams}</p>
          <p className="text-[10px] text-cyan-400">Across 4 Departments</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">QR Codes Generated</span>
          <p className="text-3xl font-extrabold text-cyan-400">{stats.totalQrGenerated}</p>
          <p className="text-[10px] text-slate-400">100% HMAC Signed</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Answer Sheets Uploaded</span>
          <p className="text-3xl font-extrabold text-emerald-400">{stats.uploadedSheets}</p>
          <p className="text-[10px] text-emerald-400">{stats.todayUploads} Uploads Today</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Uploads</span>
          <p className="text-3xl font-extrabold text-amber-400">{stats.pendingUploads}</p>
          <p className="text-[10px] text-amber-400">Awaiting Faculty Scanning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Metrics */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Department Performance Matrix
          </h3>
          <div className="space-y-3">
            {departmentStats.map((dept, idx) => {
              const total = dept.uploaded + dept.pending;
              const percent = Math.round((dept.uploaded / total) * 100);
              return (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{dept.name}</span>
                    <span className="font-mono text-cyan-300 font-bold">{percent}% Uploaded ({dept.uploaded}/{total})</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Operations & Storage */}
        <div className="lg:col-span-1 bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Operational Metrics
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Storage Used</span>
              <span className="font-mono font-bold text-cyan-300">{stats.storageUsedMb} MB</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Avg Scan-to-Upload Time</span>
              <span className="font-mono font-bold text-emerald-300">{stats.avgUploadTimeSec}s / booklet</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">QR Decrypt Accuracy</span>
              <span className="font-mono font-bold text-emerald-300">{stats.accuracyRate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Trail */}
      {recentLogs && recentLogs.length > 0 && (
        <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🛡️</span> Security & Scan Audit Log Trail
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-3 truncate">
                  <span className="text-cyan-400 font-bold">[{log.action}]</span>
                  <span className="text-slate-200 truncate">{log.details}</span>
                </div>
                <span className="text-slate-500 text-[10px] whitespace-nowrap pl-2">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
