import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, VolumeX, Mic, MicOff, Settings, X, 
  HelpCircle, ChevronUp, ChevronDown, Play, Square, 
  Languages, User, Activity, GraduationCap, FastForward
} from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceContext';

export default function VoiceAssistantWidget() {
  const {
    isEnabled,
    toggleEnabled,
    isMuted,
    setIsMuted,
    activeState,
    subtitle,
    isListening,
    settings,
    updateSettings,
    speak,
    stopSpeech,
    stats,
    transcriptHistory
  } = useVoiceAssistant();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState([]);
  const panelRef = useRef(null);

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Handle outside clicks to close panel
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <>
      {/* ── Floating Orb Button (Right Bottom - Drag to move) ── */}
      <motion.button
        drag
        dragMomentum={false}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-12 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center border-2 border-purple-500/80 bg-white/10 dark:bg-slate-900/20 backdrop-blur-md shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all cursor-pointer overflow-hidden active:cursor-grabbing"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="EduVerse Voice Teacher Guide"
      >
        {/* Voice Equalizer animation when speaking */}
        {isEnabled && activeState === 'speaking' && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
            {[1, 2, 3, 4, 5].map((bar) => (
              <motion.span
                key={bar}
                className="w-1 bg-purple-500 rounded-full"
                animate={{ height: ['4px', '28px', '4px'] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: bar * 0.1 }}
              />
            ))}
          </div>
        )}

        {/* Outer glowing pulsing rings when active */}
        {isEnabled && activeState !== 'idle' && (
          <motion.div
            className="absolute inset-[-4px] rounded-full border-2 border-purple-500/30 opacity-40"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        )}

        <div className="flex flex-col items-center justify-center relative text-purple-650 dark:text-purple-450 z-10">
          {activeState === 'listening' ? (
            <Mic className="w-6 h-6 animate-pulse text-red-500" />
          ) : isMuted ? (
            <VolumeX className="w-6 h-6 text-slate-400" />
          ) : (
            <Volume2 className="w-6 h-6 text-purple-500" />
          )}
          <span className="text-[7px] font-bold uppercase tracking-widest mt-0.5 font-mono text-purple-600 dark:text-purple-400">Teacher</span>
        </div>

        {/* Small badge dot */}
        <span className={`absolute top-1 right-1 w-3 h-3 rounded-full border border-white ${isEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      </motion.button>

      {/* ── Subtitle Narration Panel (Floating bottom-middle) ── */}
      {subtitle && (
        <div className="fixed bottom-24 right-6 z-40 max-w-sm md:max-w-md bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-slate-700/50 shadow-2xl text-xs font-semibold animate-fade-in flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-purple-400 text-[10px] uppercase tracking-wider font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping shrink-0" />
            AI Voice Teacher Subtitles
          </div>
          <p className="leading-relaxed text-slate-200">{subtitle}</p>
        </div>
      )}

      {/* ── Full Control Dashboard Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
          >
            {/* Header banner */}
            <div className="bg-gradient-to-r from-purple-650 via-indigo-650 to-blue-650 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 ${activeState === 'listening' ? 'animate-pulse bg-red-500/20' : ''}`}>
                  <Languages className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-wide flex items-center gap-1">🎤 EDUVERSE AI Teacher</h3>
                  <p className="text-[10px] text-purple-200 font-semibold flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                    {isEnabled ? `Active (${activeState})` : 'Disabled'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/15 rounded-lg transition">
                <X className="w-4.5 h-4.5 text-white" />
              </button>
            </div>

            {/* Content controls scroll wrapper */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[380px] scrollbar-none">
              
              {/* Primary power toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-xs">AI Teacher Guidance</h4>
                  <p className="text-[10px] text-slate-400">Verbal lesson and code line-by-line helper</p>
                </div>
                <button
                  onClick={toggleEnabled}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors relative focus:outline-none ${isEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <motion.div 
                    layout
                    className="w-4.5 h-4.5 bg-white rounded-full shadow" 
                    animate={{ x: isEnabled ? 20 : 0 }}
                  />
                </button>
              </div>

              {isEnabled && (
                <>
                  {/* Basic Playback Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${isMuted ? 'bg-red-500/10 border-red-500/25 text-red-500' : 'bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 text-purple-500'}`}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      <span>{isMuted ? 'Unmute Teacher' : 'Mute Teacher'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (activeState === 'speaking') stopSpeech();
                        else speak("Welcome to the EduVerse AI learning arena. Let us master this topic.");
                      }}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex flex-col items-center justify-center gap-1 text-xs font-bold"
                    >
                      {activeState === 'speaking' ? (
                        <>
                          <Square className="w-5 h-5 text-red-500" />
                          <span>Stop Narration</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 text-emerald-500" />
                          <span>Replay Topic</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Language Mode Selection */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5" /> Language System Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      {[
                        { id: 'english', label: 'English (IN)' },
                        { id: 'kannada', label: 'ಕನ್ನಡ (IN)' },
                        { id: 'mixed', label: 'English + ಕನ್ನಡ' },
                        { id: 'auto', label: 'Auto Detect' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => updateSettings({ languageMode: mode.id })}
                          className={`py-2 px-2.5 rounded-xl border transition ${settings.languageMode === mode.id ? 'bg-purple-650 text-white border-purple-650' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350'}`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gender Selector & Speed controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Voice Gender
                      </label>
                      <select
                        value={settings.gender}
                        onChange={(e) => updateSettings({ gender: e.target.value })}
                        className="w-full p-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none font-bold"
                      >
                        <option value="female">Female Voice</option>
                        <option value="male">Male Voice</option>
                      </select>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <FastForward className="w-3.5 h-3.5" /> Speed rate
                      </label>
                      <select
                        value={settings.rate}
                        onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
                        className="w-full p-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none font-bold"
                      >
                        <option value="0.75">0.75x (Slow)</option>
                        <option value="1">1.0x (Normal)</option>
                        <option value="1.25">1.25x (Fast)</option>
                        <option value="1.5">1.5x (Super)</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Live Statistics Tracker */}
                  <div className="p-3.5 bg-purple-500/5 rounded-2xl border border-purple-500/10 text-left space-y-2">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                      <Activity className="w-3.5 h-3.5 animate-pulse" /> Live teacher statistics
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Topics Explained</span>
                        <span className="font-black text-sm">{stats.topicsExplainedCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Listening Time</span>
                        <span className="font-black text-sm">{stats.listeningMinutes.toFixed(1)} mins</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Instructions Guide */}
              <div className="p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 text-left">
                <span className="font-extrabold flex items-center gap-1 mb-1 text-blue-500">
                  <HelpCircle className="w-3.5 h-3.5" /> Spoken Commands:
                </span>
                Speak out loud anytime while teacher guide is active:
                <ul className="list-disc pl-3.5 mt-1 space-y-0.5 font-mono text-[9px]">
                  <li>"Explain in Kannada" / "Explain in English"</li>
                  <li>"Slow down" / "Speak faster"</li>
                  <li>"Give example" / "Ask quiz" / "Interview Mode"</li>
                  <li>"Stop" / "Pause" / "Resume"</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
