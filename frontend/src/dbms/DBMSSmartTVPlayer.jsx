/**
 * DBMSSmartTVPlayer — Premium Netflix-style lesson player for DBMS
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Maximize, Minimize, Bookmark, StickyNote, Settings,
  ChevronLeft, ChevronRight, Monitor, Type, Clock,
  Mic, MicOff, PictureInPicture2, Globe
} from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceContext';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function DBMSSmartTVPlayer({
  lesson,
  currentStep = 0,
  totalSteps = 1,
  onStepChange,
  accentColor = '#06B6D4',
  onTalkingChange,
}) {
  const { speak, stopSpeech, activeState, subtitle, settings, getNarrativeText, updateSettings, isEnabled, toggleEnabled } = useVoiceAssistant();
  const [isPlaying, setIsPlaying]       = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [speed, setSpeed]               = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showLangMenu, setShowLangMenu]   = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes]       = useState(false);
  const [noteText, setNoteText]         = useState('');
  const [isMuted, setIsMuted]           = useState(false);
  const [voiceIdx, setVoiceIdx]         = useState(0);
  const [voices, setVoices]             = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const containerRef = useRef(null);
  const timerRef     = useRef(null);

  const script = lesson?.script || [];
  const step   = script[currentStep] || {};
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const speakStep = useCallback((idx) => {
    const text = script[idx]?.text;
    if (!text) return;

    speak(text, {
      paragraphIdx: idx,
      onEnd: () => {
        if (isPlaying && idx < totalSteps - 1) {
          timerRef.current = setTimeout(() => onStepChange?.(idx + 1), 1200);
        } else {
          setIsPlaying(false);
        }
      }
    });
  }, [isPlaying, totalSteps, onStepChange, speak, script]);

  // Auto-advance timer
  useEffect(() => {
    if (isPlaying) {
      if (!isEnabled) {
        toggleEnabled();
      }
      speakStep(currentStep);
    }
    return () => {
      clearTimeout(timerRef.current);
      stopSpeech();
    };
  }, [currentStep, isPlaying, speakStep, isEnabled, toggleEnabled]);

  // Sync isTalking state with global state
  useEffect(() => {
    onTalkingChange?.(activeState === 'speaking');
  }, [activeState, onTalkingChange]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopSpeech();
      clearTimeout(timerRef.current);
      onTalkingChange?.(false);
    } else {
      if (!isEnabled) {
        toggleEnabled();
      }
      setIsPlaying(true);
    }
  };

  const selectLanguage = (langMode) => {
    updateSettings({ languageMode: langMode });
    setShowLangMenu(false);
    if (isPlaying) {
      speakStep(currentStep);
    }
  };

  const goNext = () => {
    stopSpeech();
    clearTimeout(timerRef.current);
    if (currentStep < totalSteps - 1) onStepChange?.(currentStep + 1);
  };

  const goPrev = () => {
    stopSpeech();
    clearTimeout(timerRef.current);
    if (currentStep > 0) onStepChange?.(currentStep - 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Sync full screen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const targetIdx = Math.min(totalSteps - 1, Math.max(0, Math.floor((clickX / width) * totalSteps)));
    onStepChange?.(targetIdx);
  };

  const TYPE_ICONS = {
    intro: '🎬',
    concept: '💡',
    code: '💻',
    quiz: '🧠',
    warn: '⚠️',
    congrats: '🏆',
    summary: '📖'
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-slate-950 text-white flex flex-col justify-between relative group select-none transition-all duration-300"
    >
      {/* ── Screen Frame Overlay ── */}
      <div className="absolute inset-0 border border-white/5 pointer-events-none z-10" />

      {/* Screen Gloss */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${accentColor}08, transparent 70%)`,
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Step type badge */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 flex items-center gap-2"
        >
          <span className="text-lg">{TYPE_ICONS[step.type] || '📖'}</span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
            style={{ color: accentColor, borderColor: accentColor + '40', background: accentColor + '15' }}
          >
            {step.type || 'lesson'}
          </span>
        </motion.div>

        {/* Step counter */}
        <div className="absolute top-4 right-4 text-xs font-mono text-slate-500">
          {currentStep + 1} / {totalSteps}
        </div>

        {/* Main content text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-xl z-10"
          >
            <p className="text-white text-base md:text-lg leading-relaxed font-medium">
              {getNarrativeText ? getNarrativeText(step.text || 'Loading lesson content...') : (step.text || 'Loading lesson content...')}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Captions bar */}
        {showCaptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-14 left-4 right-4 text-center"
          >
            <span
              className="inline-block text-xs bg-black/70 text-slate-300 px-3 py-1.5 rounded-lg max-w-lg backdrop-blur-sm"
            >
              {getNarrativeText ? (() => {
                const translated = getNarrativeText(step.text || '');
                return translated.slice(0, 80) + (translated.length > 80 ? '...' : '');
              })() : (step.text?.slice(0, 80) + (step.text?.length > 80 ? '...' : ''))}
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Progress bar ── */}
      <div
        className="h-1.5 bg-slate-900/80 cursor-pointer relative mx-4 rounded-full overflow-hidden"
        onClick={handleProgressClick}
      >
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${accentColor}, #22D3EE)` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-200"
            style={{ backgroundColor: accentColor }}
          />
        </motion.div>
      </div>

      {/* ── Controller Bar ── */}
      <div className="p-3 md:p-4 flex items-center justify-between gap-4 z-20">
        
        {/* Left controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white disabled:opacity-30"
            title="Previous Step"
          >
            <SkipBack size={14} />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full transition-transform active:scale-95"
            style={{ backgroundColor: accentColor, color: '#090D1A' }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="translate-x-[0.5px]" />}
          </button>

          <button
            onClick={goNext}
            disabled={currentStep === totalSteps - 1}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white disabled:opacity-30"
            title="Next Step"
          >
            <SkipForward size={14} />
          </button>

          <span className="text-xs text-slate-500 font-mono ml-1">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
           {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowLangMenu(!showLangMenu); setShowSpeedMenu(false); }}
              className={`p-2 rounded-lg transition-colors ${settings?.languageMode !== 'english' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-455 hover:bg-slate-800'}`}
              title="Select Teaching Language"
            >
              <Globe size={14} />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-xl z-50 min-w-[120px]"
                >
                  <button
                    onClick={() => selectLanguage('english')}
                    className={`block w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${settings?.languageMode === 'english' ? 'bg-blue-606 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => selectLanguage('kannada')}
                    className={`block w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${settings?.languageMode === 'kannada' ? 'bg-blue-606 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    🦚 Kannada
                  </button>
                  <button
                    onClick={() => selectLanguage('mixed')}
                    className={`block w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${settings?.languageMode === 'mixed' ? 'bg-blue-606 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    🔄 Mixed
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Captions toggle */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-2 rounded-lg transition-colors ${showCaptions ? 'text-white bg-slate-700' : 'text-slate-500 hover:bg-slate-800'}`}
            title="Toggle Captions"
          >
            <Type size={14} />
          </button>

          {/* Playback Speed */}
          <div className="relative">
            <button
              onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowLangMenu(false); }}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-450 hover:text-white text-xs font-bold font-mono"
              title="Playback Speed"
            >
              {speed}x
            </button>
            <AnimatePresence>
              {showSpeedMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-xl z-50 min-w-[70px]"
                >
                  {PLAYBACK_SPEEDS.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                      className={`block w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${speed === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      {s}x
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notes indicator */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg transition-colors ${showNotes ? 'text-amber-400 bg-amber-500/10' : 'text-slate-450 hover:bg-slate-800'}`}
            title="Syllabus Notes"
          >
            <StickyNote size={14} />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-450 hover:text-white"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>

      {/* ── Notes Panel Drawer ── */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 130, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute bottom-16 left-4 right-4 bg-slate-900/95 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-30 flex flex-col"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Syllabus Outline Notes</span>
            <textarea
              className="flex-1 bg-transparent border-none outline-none resize-none text-xs text-slate-200 placeholder-slate-500"
              placeholder="Record key concepts, formulas or questions..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
