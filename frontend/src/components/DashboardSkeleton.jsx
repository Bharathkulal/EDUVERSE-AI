/**
 * DashboardSkeleton.jsx
 * Premium animated loading skeleton for the Student Dashboard.
 * Uses pure CSS shimmer/pulse — zero extra dependencies.
 */

import { useState, useEffect } from 'react';

// ── Shimmer bar primitive ──────────────────────────────────────────────────
function Shimmer({ className = '' }) {
  return (
    <div
      className={`rounded-lg bg-white/[0.04] relative overflow-hidden ${className}`}
      style={{ isolation: 'isolate' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          animation: 'shimmer 1.8s infinite',
        }}
      />
    </div>
  );
}

// ── Loading tips that cycle ────────────────────────────────────────────────
const TIPS = [
  'Preparing your dashboard...',
  'Analyzing your learning patterns...',
  'Loading AI insights...',
  'Syncing your progress data...',
  'Fetching your leaderboard rank...',
  'Almost ready...',
];

export default function DashboardSkeleton({ isOffline = false }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress]  = useState(12);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 1800);

    const progInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        return next >= 95 ? 95 : next;
      });
    }, 800);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <>
      {/* Global shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%);  }
        }
        @keyframes eduPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.96); }
        }
      `}</style>

      <div className="space-y-6 pb-12 pr-2">

        {/* ── Offline banner ────────────────────────────────────────────── */}
        {isOffline && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-400 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            You're offline — loading cached dashboard...
          </div>
        )}

        {/* ── Loading indicator bar ─────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-violet-500/20 bg-violet-500/5">
          {/* Logo pulse */}
          <div
            className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center font-black text-violet-400 text-sm flex-shrink-0"
            style={{ animation: 'eduPulse 1.4s ease-in-out infinite' }}
          >
            EV
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-violet-300 transition-all duration-700">
                {TIPS[tipIndex]}
              </span>
              <span className="text-xs font-bold text-violet-400 font-mono ml-2 flex-shrink-0">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Hero skeleton ─────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-slate-800 bg-[#161720] p-6 md:p-8">
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-2">
                <Shimmer className="h-8 w-64" />
                <Shimmer className="h-4 w-48" />
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <Shimmer className="h-3 w-32" />
                <Shimmer className="h-5 w-56" />
                <Shimmer className="h-3 w-40" />
                <Shimmer className="h-2 w-full" />
              </div>
              <Shimmer className="h-9 w-36 rounded-xl" />
            </div>
            <div className="lg:col-span-3 flex justify-center">
              <Shimmer className="h-52 w-40 rounded-2xl" />
            </div>
            <div className="lg:col-span-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1.5">
                  <Shimmer className="h-3 w-20" />
                  <Shimmer className="h-2 w-16" />
                </div>
                <Shimmer className="w-16 h-16 rounded-full" />
              </div>
              <div className="h-10 flex items-end gap-1 justify-between">
                {[60, 90, 40, 100, 70, 85, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-violet-500/20 rounded-full relative overflow-hidden" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 w-full bg-violet-500/30 rounded-full" style={{ height: `${h}%` }} />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                        animation: `shimmer ${1.5 + i * 0.1}s infinite`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <Shimmer className="h-8 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* ── Stats cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { color: 'violet', label: 'Total XP' },
            { color: 'amber',  label: 'Day Streak' },
            { color: 'emerald',label: 'Coins' },
            { color: 'blue',   label: 'Study Hours' },
          ].map(({ color, label }) => (
            <div key={label} className="p-4 rounded-2xl border border-slate-800 bg-[#161720] flex items-center gap-4">
              <Shimmer className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Shimmer className="h-2.5 w-16" />
                <Shimmer className="h-6 w-12" />
                <Shimmer className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* ── IT Suite cards ────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Shimmer className="h-6 w-52" />
            <Shimmer className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-[#161720] space-y-4 min-h-[280px]">
                <div className="flex justify-between items-start">
                  <Shimmer className="w-12 h-12 rounded-xl" />
                  <Shimmer className="h-7 w-16 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Shimmer className="h-5 w-36" />
                  <Shimmer className="h-3 w-full" />
                  <Shimmer className="h-3 w-5/6" />
                </div>
                <div className="space-y-2 pt-2">
                  <Shimmer className="h-2 w-24" />
                  <Shimmer className="h-4 w-full" />
                  <Shimmer className="h-4 w-4/5" />
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-800/80 mt-auto">
                  <Shimmer className="flex-1 h-8 rounded-xl" />
                  <Shimmer className="w-8 h-8 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Goals + AI panel ──────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl p-5 border border-slate-800 bg-[#161720] space-y-4">
            <div className="flex justify-between items-center">
              <Shimmer className="h-5 w-44" />
              <Shimmer className="h-7 w-36 rounded-lg" />
            </div>
            <div className="flex gap-2">
              <Shimmer className="flex-1 h-9 rounded-xl" />
              <Shimmer className="w-20 h-9 rounded-xl" />
              <Shimmer className="w-16 h-9 rounded-xl" />
            </div>
            <div className="space-y-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-800/80">
                  <Shimmer className="w-4 h-4 rounded flex-shrink-0" />
                  <Shimmer className="flex-1 h-4" />
                  <Shimmer className="w-12 h-4 rounded" />
                  <Shimmer className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-5 border border-slate-800 bg-[#161720] space-y-4">
            <div className="flex justify-between items-center">
              <Shimmer className="h-5 w-36" />
              <Shimmer className="h-5 w-20 rounded-md" />
            </div>
            <div className="p-4 rounded-xl border border-slate-800 space-y-2">
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-5/6" />
              <Shimmer className="h-4 w-4/6" />
            </div>
            <div className="space-y-2 pt-2">
              <Shimmer className="h-2.5 w-24" />
              <Shimmer className="h-3.5 w-full" />
              <Shimmer className="h-3.5 w-5/6" />
            </div>
            <Shimmer className="h-9 w-full rounded-xl mt-4" />
          </div>
        </div>

        {/* ── Heatmap + Leaderboard ─────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl p-5 border border-slate-800 bg-[#161720] space-y-4">
            <div className="space-y-1">
              <Shimmer className="h-5 w-48" />
              <Shimmer className="h-3 w-64" />
            </div>
            <div className="grid grid-cols-10 gap-2.5 py-2">
              {Array.from({ length: 60 }).map((_, i) => (
                <Shimmer key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
            <div className="flex gap-4 pt-2">
              {['No Activity','Light','Medium','High'].map(l => (
                <div key={l} className="flex items-center gap-1">
                  <Shimmer className="w-2.5 h-2.5 rounded flex-shrink-0" />
                  <Shimmer className="h-2 w-12" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-5 border border-slate-800 bg-[#161720] space-y-4">
            <div className="flex justify-between">
              <Shimmer className="h-5 w-40" />
              <Shimmer className="h-4 w-16" />
            </div>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center p-2 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 flex-1">
                    <Shimmer className="w-5 h-5 rounded-full flex-shrink-0" />
                    <Shimmer className="h-3.5 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Shimmer className="h-3 w-10" />
                    <Shimmer className="h-3 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Subject progress + Activity ───────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl p-5 border border-slate-800 bg-[#161720] space-y-4">
            <Shimmer className="h-5 w-52" />
            <div className="space-y-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Shimmer className="h-3 w-36" />
                    <Shimmer className="h-3 w-28" />
                  </div>
                  <Shimmer className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-5 border border-slate-800 bg-[#161720] space-y-4">
            <div className="flex justify-between">
              <Shimmer className="h-5 w-40" />
              <Shimmer className="h-4 w-16" />
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex justify-between items-center p-2 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5 flex-1">
                    <Shimmer className="w-5 h-5 rounded flex-shrink-0" />
                    <div className="space-y-1 flex-1">
                      <Shimmer className="h-3 w-32" />
                      <Shimmer className="h-2.5 w-16" />
                    </div>
                  </div>
                  <Shimmer className="h-3 w-12 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
