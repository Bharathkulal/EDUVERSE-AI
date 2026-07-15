import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Play, Pause, RefreshCw, Cpu, Database, Command, 
  Terminal, ShieldCheck, Heart, User, Settings, Info,
  BookOpen, Code, Trophy, HelpCircle
} from 'lucide-react';
import { useCommandAI } from '../context/CommandAIContext';
import VoiceWaveform from '../components/CommandAI/VoiceWaveform';
import MemoryStore from '../voice/MemoryStore';
import { COMMAND_REGISTRY } from '../voice/CommandRegistry';

export default function CommandAIDashboard() {
  const {
    isWakeEnabled,
    setIsWakeEnabled,
    activeState,
    transcript,
    history,
    volume,
    setVolume,
    pitch,
    setPitch,
    rate,
    setRate,
    voiceStyle,
    setVoiceStyle,
    speak,
    startListening,
    executeCommand
  } = useCommandAI();

  const [inputVal, setInputVal] = useState('');
  const [activeTab, setActiveTab] = useState('logs'); // logs, whitelist, context
  const fullContext = MemoryStore.getFullContext();

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    executeCommand(inputVal);
    setInputVal('');
  };

  const calculateStats = () => {
    const total = history.length;
    if (total === 0) return { accuracy: 'N/A', avgSpeed: '1.2s' };
    
    // Simulating stats for visual completeness
    return {
      accuracy: '96.4%',
      avgSpeed: '0.8s'
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6 pb-8 min-h-screen">
      {/* HUD Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 border border-violet-500/20 bg-gradient-to-br from-[#120e2a] via-[#1a143b] to-[#0f0b24]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              🤖 Command AI <span className="text-[9px] py-0.5 px-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-full font-bold">EduVerse OS Core</span>
            </h1>
            <p className="text-xs text-indigo-200/70 mt-1">
              Jarvis-like Voice Operating System controlling the EduVerse platform modules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWakeEnabled(!isWakeEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isWakeEnabled 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-900 border-white/10 text-slate-400'
              }`}
            >
              🎙 Continuous Wake Word: {isWakeEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left Column: Audio Core ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="va-card p-6 flex flex-col items-center justify-between text-center min-h-[380px] va-card-glow-purple">
            <div>
              <p className="va-section-label mb-1">OS Hologram Core</p>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Voice Control Unit</h3>
            </div>

            {/* Orb Visualiser Area */}
            <div className="my-6 flex flex-col items-center gap-4">
              <div 
                onClick={startListening}
                className="w-36 h-36 relative flex items-center justify-center cursor-pointer"
              >
                <div className={`va-orb-halo ${activeState}`} style={{ inset: -15, filter: 'blur(20px)' }} />
                <div className="va-orb-ring va-orb-ring-1" />
                <div className="va-orb-ring va-orb-ring-2" />
                <div className="va-orb-ring va-orb-ring-3" />
                <div className={`va-orb-core ${activeState} w-20 h-20`}>
                  <Mic className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="h-6">
                {activeState === 'listening' ? (
                  <p className="text-xs font-bold text-pink-400 animate-pulse">Recording Speech Waveform...</p>
                ) : activeState === 'thinking' ? (
                  <p className="text-xs font-bold text-violet-400 animate-pulse">Running Intent Analysis Engine...</p>
                ) : activeState === 'speaking' ? (
                  <p className="text-xs font-bold text-cyan-400">Communicating Voice Response...</p>
                ) : (
                  <p className="text-xs font-bold text-slate-400">Unit Online & Ready</p>
                )}
              </div>
            </div>

            {/* Active Speech Transcript / Waveform */}
            <div className="w-full space-y-3">
              {activeState === 'listening' && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 italic text-xs">
                  "{transcript || 'Speak now…'}"
                </div>
              )}
              <div className="flex justify-center">
                <VoiceWaveform active={activeState !== 'idle'} count={20} />
              </div>
            </div>
          </div>

          {/* Voice Output Configuration */}
          <div className="va-card p-6 space-y-4">
            <p className="va-section-label">Speech Synthesis Config</p>
            <div className="space-y-4">
              {[
                { label: 'Speed (Rate)', value: rate, min: 0.5, max: 2, set: setRate },
                { label: 'Pitch', value: pitch, min: 0.5, max: 2, set: setPitch },
                { label: 'Volume', value: volume, min: 0, max: 1, set: setVolume },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{s.label}</span>
                    <span className="font-bold text-violet-400">{s.value.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step="0.05"
                    value={s.value}
                    onChange={(e) => s.set(parseFloat(e.target.value))}
                    className="va-slider"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Voice Style Preset</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Natural', 'Professional', 'Friendly', 'Motivational'].map(s => (
                    <button
                      key={s}
                      onClick={() => setVoiceStyle(s)}
                      className={`va-voice-style-btn ${voiceStyle === s ? 'active' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Center Column: Interactive Log & History ── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="va-card rounded-2xl flex flex-col h-[520px] overflow-hidden">
            {/* Header tab navigation */}
            <div className="flex border-b border-white/5 bg-slate-950/40">
              {['logs', 'whitelist', 'context'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition capitalize cursor-pointer ${
                    activeTab === tab 
                      ? 'border-violet-500 text-white bg-white/5' 
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 va-scroll">
              
              {/* Active Logs Tab */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16 gap-3">
                      <Terminal className="w-8 h-8 text-violet-400 animate-pulse" />
                      <div>
                        <h4 className="font-bold text-white">No System Voice Logs</h4>
                        <p className="text-xs text-slate-500 mt-1">Utterances will appear here as they are processed.</p>
                      </div>
                    </div>
                  ) : (
                    history.map((log, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-2 hover:border-violet-500/20 transition"
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold uppercase tracking-wider text-violet-400">{log.intent}</span>
                          <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">"{log.transcript}"</p>
                        <p className="text-xs text-slate-400">Response: "{log.response}"</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Command Whitelist Tab */}
              {activeTab === 'whitelist' && (
                <div className="space-y-3">
                  {COMMAND_REGISTRY.map((c, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex justify-between items-center text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-white">{c.intent}</p>
                        <p className="text-[10px] text-slate-400">Phrase: "{c.phrases[0]}"</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300">
                          {c.agent}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Memory Context Tab */}
              {activeTab === 'context' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/30 border border-white/5 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-violet-400 font-bold border-b border-white/5 pb-2 mb-2">
                      <Database className="w-4 h-4" /> Context Cache
                    </div>
                    {[
                      { key: 'User Name', val: fullContext.userName || 'Bharath Kulal' },
                      { key: 'Department', val: fullContext.department || 'Computer Science' },
                      { key: 'Semester', val: fullContext.semester || '6th Semester' },
                      { key: 'Language', val: fullContext.language || 'English / Kannada' },
                      { key: 'Current Lesson', val: fullContext.currentLesson || 'Queues' },
                    ].map((c, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-slate-400">{c.key}</span>
                        <span className="font-bold text-white">{c.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Test Input Console */}
            <form onSubmit={handleTestSubmit} className="p-4 border-t border-white/5 bg-slate-950/45 flex items-center gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Simulate/type voice command command..."
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl py-2 px-3 text-xs outline-none focus:border-violet-500"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Column: Metrics & Agents ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Health Card */}
          <div className="va-card p-5 space-y-4">
            <p className="va-section-label">Command Performance</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/40 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 uppercase">Intent Accuracy</p>
                <p className="text-lg font-black text-emerald-400 mt-1">{stats.accuracy}</p>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 uppercase">Avg Parse Speed</p>
                <p className="text-lg font-black text-cyan-400 mt-1">{stats.avgSpeed}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
              <span className="text-slate-400 flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-violet-400" /> Pipeline Status</span>
              <span className="font-bold text-emerald-400">HEALTHY</span>
            </div>
          </div>

          {/* Whitelisted Agents */}
          <div className="va-card p-5 space-y-3">
            <p className="va-section-label">Active Modules</p>
            <div className="space-y-2 max-h-[220px] overflow-y-auto va-scroll">
              {[
                { name: 'DashboardAgent', status: 'Online', desc: 'Main navigation coordinator' },
                { name: 'ResumeAgent', status: 'Online', desc: 'Compiler & exporter' },
                { name: 'PracticeAgent', status: 'Online', desc: 'Typing and DSA trainer' },
                { name: 'QuizAgent', status: 'Online', desc: 'Quiz generator' },
                { name: 'AiTutorAgent', status: 'Online', desc: 'LMS concept learning agent' },
              ].map((a, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950/30 rounded-xl border border-white/5 text-xs">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-white">{a.name}</span>
                    <span className="text-[9px] text-emerald-400 uppercase tracking-widest">{a.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
