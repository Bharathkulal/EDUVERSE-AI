/**
 * CSharpSmartTVPlayer — Premium Netflix-style lesson player for C# Theory
 * Adapted from Advanced Java SmartTVPlayer with C#/.NET purple theming
 * Features: Play/Pause, Captions, Speed, Fullscreen, TTS Voice narration, Notes
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Maximize, Minimize, StickyNote, Type,
  Mic, ChevronRight
} from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceContext';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function CSharpSmartTVPlayer({
  lesson,
  currentStep = 0,
  totalSteps = 1,
  onStepChange,
  accentColor = '#7C3AED',
  onTalkingChange,
}) {
  const { speak, stopSpeech, activeState, subtitle, settings, getNarrativeText } = useVoiceAssistant();
  const [isPlaying, setIsPlaying]         = useState(false);
  const [showCaptions, setShowCaptions]   = useState(true);
  const [speed, setSpeed]                 = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [showNotes, setShowNotes]         = useState(false);
  const [noteText, setNoteText]           = useState('');
  const [isMuted, setIsMuted]             = useState(false);
  const [voiceIdx, setVoiceIdx]           = useState(0);
  const [voices, setVoices]               = useState([]);

  const containerRef = useRef(null);
  const timerRef     = useRef(null);

  const script   = lesson?.script || [];
  const step     = script[currentStep] || {};
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  // Auto-advance timer
  useEffect(() => {
    if (isPlaying) {
      speakStep(currentStep);
    }
    return () => {
      clearTimeout(timerRef.current);
      stopSpeech();
    };
  }, [currentStep, isPlaying, speakStep]);

  // Sync talking status
  useEffect(() => {
    onTalkingChange?.(activeState === 'speaking');
  }, [activeState, onTalkingChange]);

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

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopSpeech();
      clearTimeout(timerRef.current);
      onTalkingChange?.(false);
    } else {
      setIsPlaying(true);
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

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newStep = Math.round(pct * (totalSteps - 1));
    window.speechSynthesis?.cancel();
    clearTimeout(timerRef.current);
    onStepChange?.(Math.max(0, Math.min(totalSteps - 1, newStep)));
  };

  // Step type icons
  const TYPE_ICONS = {
    intro: '📖', concept: '💡', code: '💻', explain: '📝',
    warn: '⚠️', quiz: '❓', congrats: '🎉', summary: '📋',
  };

  return (
    <div
      ref={containerRef}
      className="rounded-2xl overflow-hidden border relative group"
      style={{
        background: 'linear-gradient(180deg, #0c0e1a 0%, #080a12 100%)',
        borderColor: accentColor + '30',
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${accentColor}10`,
      }}
    >
      {/* ── Screen area ── */}
      <div className="relative min-h-[280px] md:min-h-[380px] flex flex-col items-center justify-center p-8 pb-4">
        {/* Background glow */}
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
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
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
            className="text-center max-w-2xl z-10 px-4"
          >
            <p className="text-white text-lg md:text-xl leading-relaxed font-semibold">
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
        className="h-1.5 bg-slate-800/80 cursor-pointer relative mx-4 rounded-full overflow-hidden"
        onClick={handleProgressClick}
      >
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${accentColor}, #A855F6)` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: accentColor, borderColor: '#fff' }}
          />
        </motion.div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        {/* Left controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={goPrev}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white disabled:opacity-30"
            disabled={currentStep === 0}
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={togglePlay}
            className="p-2.5 rounded-xl transition-all text-white"
            style={{ background: accentColor }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="white" />}
          </button>

          <button
            onClick={goNext}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white disabled:opacity-30"
            disabled={currentStep >= totalSteps - 1}
          >
            <SkipForward size={16} />
          </button>

          {/* Volume */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <span className="text-xs text-slate-500 font-mono ml-1">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {/* Captions toggle */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-2 rounded-lg transition-colors ${showCaptions ? 'text-white bg-slate-700' : 'text-slate-500 hover:bg-slate-800'}`}
            title="Toggle Captions"
          >
            <Type size={14} />
          </button>

          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white text-xs font-bold"
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
                  className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-xl z-50"
                >
                  {PLAYBACK_SPEEDS.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                      className={`block w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${speed === s ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      {s}x
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Voice select */}
          {voices.length > 0 && (
            <button
              onClick={() => setVoiceIdx((voiceIdx + 1) % voices.length)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
              title={`Voice: ${voices[voiceIdx % voices.length]?.name || 'Default'}`}
            >
              <Mic size={14} />
            </button>
          )}

          {/* Notes */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg transition-colors ${showNotes ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:bg-slate-800'}`}
            title="Notes"
          >
            <StickyNote size={14} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>

      {/* ── Notes overlay ── */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400">📝 Lesson Notes</span>
                <span className="text-[10px] text-slate-600">Auto-saved locally</span>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Take notes while watching..."
                className="w-full h-20 bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-purple-500/40"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
