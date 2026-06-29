import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, VolumeX, Mic, MicOff, Settings, X, 
  HelpCircle, ChevronUp, ChevronDown, Sliders, CheckSquare, Play, Square 
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
    stopSpeech
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

  // Assist keyboard users with Esc key closure
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate color palette based on active state
  const getOrbGradients = () => {
    if (!isEnabled) return 'from-slate-700 to-slate-800 border-slate-600 shadow-slate-900/50';
    switch (activeState) {
      case 'listening':
        return 'from-red-500 via-pink-500 to-purple-600 border-pink-400 shadow-pink-500/30 animate-pulse';
      case 'speaking':
        return 'from-emerald-400 via-teal-500 to-cyan-600 border-emerald-300 shadow-emerald-500/30';
      case 'thinking':
        return 'from-fuchsia-500 to-indigo-600 border-fuchsia-400 shadow-indigo-500/30';
      default:
        return 'from-blue-600 via-indigo-600 to-purple-700 border-blue-400 shadow-blue-500/25';
    }
  };

  return (
    <>
      {/* Floating Action Orb Button (Bottom Left) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center border-2 border-blue-500/80 bg-white/10 dark:bg-slate-900/20 backdrop-blur-md shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="EduVerse Voice Guide"
        aria-expanded={isOpen}
      >
        {/* Animated concentric rings */}
        {isEnabled && activeState !== 'idle' && (
          <motion.div
            className="absolute inset-[-4px] rounded-full border-2 border-blue-500/30 opacity-40"
            animate={{ scale: [1, 1.25, 1], rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
        )}

        <div className="flex flex-col items-center justify-center relative text-blue-500 dark:text-blue-400">
          {activeState === 'listening' ? (
            <Mic className="w-5.5 h-5.5 animate-bounce" />
          ) : isMuted ? (
            <VolumeX className="w-5.5 h-5.5 text-slate-400" />
          ) : (
            <Volume2 className="w-5.5 h-5.5" />
          )}
        </div>

        {/* Small enable indicator dot */}
        <span className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-extrabold ${isEnabled ? 'bg-emerald-500 text-slate-900' : 'bg-slate-400 text-white'}`}>
          {isEnabled ? 'ON' : 'OFF'}
        </span>
      </motion.button>

      {/* Floating Subtitles Strip */}
      {subtitle && (
        <div className="fixed bottom-24 right-6 z-40 max-w-sm md:max-w-md bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-slate-700/50 shadow-2xl text-xs font-medium animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
          <p className="line-clamp-3 leading-relaxed">{subtitle}</p>
        </div>
      )}

      {/* Overlay Control Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/10 ${activeState === 'listening' ? 'animate-pulse bg-red-500/20' : ''}`}>
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">F.R.I.D.A.Y. Guide</h3>
                  <p className="text-[10px] text-blue-200 font-semibold flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                    {isEnabled ? `Active (${activeState})` : 'Disabled'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/15 rounded-lg transition"
                aria-label="Close voice dashboard"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[350px]">
              {/* Primary Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-xs">Voice Assistant Enable</h4>
                  <p className="text-[10px] text-slate-400">Allows F.R.I.D.A.Y. to guide you visually and verbally</p>
                </div>
                <button
                  onClick={toggleEnabled}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors relative focus:outline-none ${isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <motion.div 
                    layout
                    className="w-4.5 h-4.5 bg-white rounded-full shadow" 
                    animate={{ x: isEnabled ? 20 : 0 }}
                  />
                </button>
              </div>

              {/* Mute and Voice Wave Controls */}
              {isEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${isMuted ? 'bg-red-500/10 border-red-500/25 text-red-500' : 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 text-blue-500'}`}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    <span>{isMuted ? 'Muted' : 'Sound Active'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (activeState === 'speaking') stopSpeech();
                      else speak("F.R.I.D.A.Y. voice guide test! I am listening for your commands.");
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex flex-col items-center justify-center gap-1 text-xs font-bold"
                  >
                    {activeState === 'speaking' ? (
                      <>
                        <Square className="w-5 h-5 text-red-500 animate-pulse" />
                        <span>Stop Speech</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 text-emerald-500" />
                        <span>Voice Test</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Settings Dropdown Accordion */}
              {isEnabled && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Settings className="w-4 h-4" /> Customize Assistant
                    </span>
                    {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showSettings && (
                    <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs">
                      {/* Voice Selection */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice Selector</label>
                        <select
                          value={settings.voiceURI || ''}
                          onChange={(e) => updateSettings({ voiceURI: e.target.value || null })}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Browser Default Friendly</option>
                          {voices
                            .filter(v => v.lang.startsWith('en'))
                            .map((v, idx) => (
                              <option key={idx} value={v.voiceURI}>{v.name} ({v.lang})</option>
                            ))}
                        </select>
                      </div>

                      {/* Provider Abstraction */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice Provider</label>
                        <select
                          value={settings.provider}
                          onChange={(e) => updateSettings({ provider: e.target.value })}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                          <option value="native">Browser Web Speech</option>
                          <option value="elevenlabs">ElevenLabs API</option>
                          <option value="azure">Microsoft Azure Speech</option>
                          <option value="google">Google Cloud Text-to-Speech</option>
                          <option value="polly">Amazon Polly</option>
                        </select>
                      </div>

                      {/* Speed (Rate) Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-[10px] text-slate-400">
                          <span>Speaking Speed</span>
                          <span>{settings.rate}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={settings.rate}
                          onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      {/* Pitch Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-[10px] text-slate-400">
                          <span>Pitch</span>
                          <span>{settings.pitch}</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.1"
                          value={settings.pitch}
                          onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      {/* Option checkboxes */}
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoGuidance}
                            onChange={(e) => updateSettings({ autoGuidance: e.target.checked })}
                            className="rounded text-blue-500 focus:ring-0 w-4 h-4"
                          />
                          <span>Guide automatically on page load</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.encouragement}
                            onChange={(e) => updateSettings({ encouragement: e.target.checked })}
                            className="rounded text-blue-500 focus:ring-0 w-4 h-4"
                          />
                          <span>Motivational encouragement nudges</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions Guide */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                <span className="font-extrabold flex items-center gap-1 mb-1 text-blue-500">
                  <HelpCircle className="w-3.5 h-3.5" /> Spoken Commands:
                </span>
                You can speak out loud anytime F.R.I.D.A.Y. is active:
                <ul className="list-disc pl-3.5 mt-1 space-y-0.5 font-mono">
                  <li>"Explain this page" / "Help me"</li>
                  <li>"Open Dashboard" / "Open courses"</li>
                  <li>"Go back" / "Repeat"</li>
                  <li>"Stop" / "Pause" / "Continue"</li>
                </ul>
                <div className="mt-2 text-slate-400 font-sans italic text-[9px]">
                  * Double tap anywhere on the screen to toggle assistant ON/OFF.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
