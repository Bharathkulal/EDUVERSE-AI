import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mic, AlertTriangle, Terminal, RefreshCw, Activity } from 'lucide-react';
import { useCommandAI } from '../../context/CommandAIContext';
import VoiceWaveform from './VoiceWaveform';
import QuickCommands from './QuickCommands';
import './CommandAI.css';

export default function CommandPanel() {
  const { 
    isPanelOpen, 
    setIsPanelOpen, 
    activeState, 
    transcript, 
    history,
    microphoneStatus,
    requestMicrophonePermission,
    diagnosticLogs,
    restartCount,
    lastExecutionTime,
    lastConfidence,
    lastParsedIntent
  } = useCommandAI();

  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const activeCommandLog = history[0];

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="cai-panel-overlay"
          />

          {/* Slide-Up Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="cai-panel relative"
          >
            <div className="flex flex-col gap-5 h-full justify-between">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/10 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">EduVerse Command AI</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${activeState === 'listening' ? 'bg-emerald-400 animate-ping' : activeState === 'thinking' ? 'bg-amber-400 animate-pulse' : 'bg-violet-400'}`}></span>
                      {activeState === 'listening' ? '🎙 Listening' : activeState === 'thinking' ? '⚙ Thinking' : '● Ready'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowDebugPanel(!showDebugPanel)}
                    title="Toggle Voice Developer Debug Panel"
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${showDebugPanel ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200'}`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium hidden sm:inline">Debug</span>
                  </button>

                  <button 
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Permission Banner */}
              {microphoneStatus === 'denied' && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Microphone access is blocked in browser settings.</span>
                  </div>
                  <button 
                    onClick={requestMicrophonePermission}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[11px] shrink-0 transition"
                  >
                    Allow Mic
                  </button>
                </div>
              )}

              {/* Developer Debug Modal Overlay */}
              {showDebugPanel && (
                <div className="p-4 bg-black/80 border border-violet-500/30 rounded-xl space-y-3 text-xs text-slate-300 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-violet-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> Developer Voice Diagnostics
                    </span>
                    <span className="text-[10px] text-slate-500">Restarts: {restartCount}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Mic Status: </span>
                      <span className={`font-semibold ${microphoneStatus === 'granted' ? 'text-emerald-400' : 'text-rose-400'}`}>{microphoneStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">State: </span>
                      <span className="font-semibold text-violet-300">{activeState}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Intent: </span>
                      <span className="font-semibold text-white">{lastParsedIntent}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Confidence: </span>
                      <span className="font-semibold text-emerald-400">{(lastConfidence * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Exec Duration: </span>
                      <span className="font-semibold text-amber-300">{lastExecutionTime}ms</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Live Event Stream</span>
                    <div className="max-h-24 overflow-y-auto space-y-1 bg-black/50 p-2 rounded border border-slate-800 text-[10px] font-mono">
                      {diagnosticLogs.map((log, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-slate-600">{log.time}</span>
                          <span className={log.type === 'error' ? 'text-rose-400' : log.type === 'action' ? 'text-emerald-400' : 'text-slate-300'}>[{log.type}] {log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Live Transcript / Speech Area */}
              <div className="py-2 flex-1 flex flex-col justify-center min-h-[110px]">
                {activeState === 'listening' ? (
                  <div className="space-y-4">
                    <p className="text-lg font-bold text-white leading-relaxed italic">
                      "{transcript || 'Listening for speech…'}"
                    </p>
                    <VoiceWaveform active={true} />
                  </div>
                ) : activeState === 'thinking' ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-widest animate-pulse flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing intent matrix…
                    </p>
                    <p className="text-sm text-slate-400">Processing your natural language command.</p>
                  </div>
                ) : activeCommandLog ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Last Command</p>
                    <p className="text-sm font-semibold text-white">"{activeCommandLog.transcript}"</p>
                    <div className="p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl text-xs text-violet-300">
                      🔊 {activeCommandLog.response}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">EduVerse Voice OS Active</p>
                    <p className="text-xs text-slate-400">Say a command like "Open Dashboard" or click mic to talk.</p>
                  </div>
                )}
              </div>

              {/* Bottom Quick Commands */}
              <QuickCommands />

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

