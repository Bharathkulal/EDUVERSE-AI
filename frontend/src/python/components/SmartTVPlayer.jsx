/**
 * SmartTVPlayer — Beautiful Smart TV-style lesson player
 * Handles AI narration, step progression, captions, PiP, fullscreen, keyboard shortcuts.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Minimize, Captions, Gauge, BookmarkPlus, BookmarkCheck,
  PictureInPicture2, RotateCcw
} from 'lucide-react';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function SmartTVPlayer({
  lesson,
  currentStep,
  totalSteps,
  onStepChange,
  accentColor = '#3B82F6',
  onTalkingChange,
}) {
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [isMuted,     setIsMuted]     = useState(false);
  const [volume,      setVolume]      = useState(0.9);
  const [speedIdx,    setSpeedIdx]    = useState(2);        // index into SPEEDS
  const [captions,    setCaptions]    = useState(true);
  const [fullscreen,  setFullscreen]  = useState(false);
  const [bookmarked,  setBookmarked]  = useState(false);
  const [showControls,setShowControls] = useState(true);
  const [caption,     setCaption]     = useState('');
  const [isPiP,       setIsPiP]       = useState(false);

  const utterRef    = useRef(null);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);

  const script      = lesson?.script || [];
  const step        = script[currentStep] || { text: '', type: 'intro' };
  const progress    = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  /* ── Text-to-Speech ── */
  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    utterRef.current = null;
    onTalkingChange?.(false);
  }, [onTalkingChange]);

  const speakLine = useCallback((text) => {
    if (!window.speechSynthesis || isMuted) { onTalkingChange?.(false); return; }
    stopSpeech();

    const utter          = new SpeechSynthesisUtterance(text);
    utter.rate           = SPEEDS[speedIdx];
    utter.volume         = isMuted ? 0 : volume;
    utter.pitch          = 1.05;

    utter.onboundary = (e) => {
      if (captions && e.name === 'word') {
        const spoken = text.substring(0, e.charIndex + e.charLength);
        setCaption(spoken);
      }
    };

    utter.onstart  = () => { onTalkingChange?.(true);  setIsPlaying(true); };
    utter.onend    = () => {
      onTalkingChange?.(false);
      setIsPlaying(false);
      setCaption('');
      // Auto-advance after short pause
      setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          onStepChange?.(currentStep + 1);
        }
      }, 600);
    };
    utter.onerror  = () => { onTalkingChange?.(false); setIsPlaying(false); };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [speedIdx, volume, isMuted, captions, currentStep, totalSteps, onStepChange, onTalkingChange, stopSpeech]);

  /* ── Auto-play when step changes ── */
  useEffect(() => {
    if (lesson && script.length) {
      setTimeout(() => speakLine(step.text), 400);
    }
    return () => stopSpeech();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, lesson?.slug]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':  e.preventDefault(); isPlaying ? stopSpeech() : speakLine(step.text); break;
        case 'ArrowRight': onStepChange?.(Math.min(currentStep + 1, totalSteps - 1)); break;
        case 'ArrowLeft':  onStepChange?.(Math.max(currentStep - 1, 0));              break;
        case 'm': case 'M': setIsMuted(v => !v);   break;
        case 'f': case 'F': toggleFullscreen();     break;
        case 'c': case 'C': setCaptions(v => !v);  break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentStep, totalSteps, step]);

  /* ── Auto-hide controls ── */
  useEffect(() => {
    clearTimeout(controlsRef.current);
    if (isPlaying) {
      controlsRef.current = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
  }, [isPlaying]);

  /* ── Fullscreen ── */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.().then(() => setFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setFullscreen(false));
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /* ── PiP stub ── */
  const togglePiP = () => setIsPiP(v => !v);

  /* ── Step type → screen colours ── */
  const TYPE_ACCENT = {
    intro:   '#3B82F6',
    concept: '#8B5CF6',
    code:    '#10B981',
    explain: '#06B6D4',
    warn:    '#F59E0B',
    quiz:    '#EC4899',
    congrats:'#22C55E',
    summary: '#A855F7',
  };
  const screenAccent = TYPE_ACCENT[step.type] || accentColor;

  /* ── Seek bar click ── */
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const target = Math.round(ratio * (totalSteps - 1));
    stopSpeech();
    onStepChange?.(target);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      onMouseMove={() => { setShowControls(true); }}
    >
      {/* ─── TV Outer Shell ─── */}
      <motion.div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: `0 0 60px ${screenAccent}30, 0 0 120px ${screenAccent}15, inset 0 1px 0 rgba(255,255,255,0.1)`,
          border: `2px solid ${screenAccent}50`,
        }}
        animate={{
          boxShadow: [
            `0 0 60px ${screenAccent}30, 0 0 120px ${screenAccent}15`,
            `0 0 80px ${screenAccent}50, 0 0 150px ${screenAccent}25`,
            `0 0 60px ${screenAccent}30, 0 0 120px ${screenAccent}15`,
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Animated border gradient */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${screenAccent}20, transparent 40%, ${screenAccent}10)`,
          }}
        />

        {/* ─── Screen Area ─── */}
        <div
          className="relative overflow-hidden"
          style={{ minHeight: 300, background: 'linear-gradient(135deg, #0a0a1a, #0d1117)' }}
        >
          {/* Scanlines effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)' }}
          />

          {/* Screen glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${screenAccent}08 0%, transparent 70%)` }}
          />

          {/* Step type badge */}
          <motion.div
            key={step.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
            style={{ background: screenAccent + '25', borderColor: screenAccent + '60', color: screenAccent }}
          >
            {step.type === 'intro' ? '🚀 Introduction'
              : step.type === 'concept' ? '💡 Concept'
              : step.type === 'code' ? '💻 Live Code'
              : step.type === 'warn' ? '⚠️ Watch Out'
              : step.type === 'quiz' ? '🧠 Quick Quiz'
              : step.type === 'congrats' ? '🎉 Well Done'
              : step.type === 'summary' ? '📋 Summary'
              : '📖 Explanation'}
          </motion.div>

          {/* Step counter */}
          <div className="absolute top-4 right-4 text-xs text-slate-500 font-mono">
            {currentStep + 1} / {totalSteps}
          </div>

          {/* Main content */}
          <div className="flex items-center justify-center px-10 py-16 min-h-[260px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                className="text-center max-w-2xl"
              >
                <motion.p
                  className="text-white font-medium leading-relaxed text-lg"
                  style={{ textShadow: `0 0 20px ${screenAccent}60` }}
                >
                  {step.text}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Caption bar */}
          <AnimatePresence>
            {captions && caption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-12 left-4 right-4 text-center"
              >
                <span
                  className="inline-block px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(0,0,0,0.75)', color: screenAccent }}
                >
                  {caption}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Speaking indicator */}
          {isPlaying && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 items-end h-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ background: screenAccent }}
                  animate={{ height: [4, 14 + i * 2, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Seek bar ─── */}
        <div
          className="relative h-1.5 bg-slate-800 cursor-pointer group/seek mx-0"
          onClick={handleSeek}
        >
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ background: screenAccent, width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
          <div
            className="absolute top-0 h-full opacity-0 group-hover/seek:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-3 h-3 rounded-full -mt-0.75" style={{ background: screenAccent }} />
          </div>
        </div>

        {/* ─── Controls bar ─── */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 px-5 py-4"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
            >
              {/* Play/Pause */}
              <button
                onClick={() => isPlaying ? stopSpeech() : speakLine(step.text)}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:scale-110"
                style={{ background: screenAccent + '30', border: `1px solid ${screenAccent}60` }}
                title="Play/Pause (Space)"
              >
                {isPlaying
                  ? <Pause size={15} style={{ color: screenAccent }} fill={screenAccent} />
                  : <Play  size={15} style={{ color: screenAccent }} fill={screenAccent} />}
              </button>

              {/* Prev / Next */}
              <button
                onClick={() => { stopSpeech(); onStepChange?.(Math.max(0, currentStep - 1)); }}
                className="text-slate-400 hover:text-white transition-colors"
                title="Previous step (←)"
              >
                <SkipBack size={16} />
              </button>
              <button
                onClick={() => { stopSpeech(); onStepChange?.(Math.min(totalSteps - 1, currentStep + 1)); }}
                className="text-slate-400 hover:text-white transition-colors"
                title="Next step (→)"
              >
                <SkipForward size={16} />
              </button>

              {/* Replay */}
              <button
                onClick={() => { stopSpeech(); setTimeout(() => speakLine(step.text), 100); }}
                className="text-slate-400 hover:text-white transition-colors"
                title="Replay narration"
              >
                <RotateCcw size={14} />
              </button>

              {/* Volume */}
              <button
                onClick={() => setIsMuted(v => !v)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Mute (M)"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => { setVolume(+e.target.value); setIsMuted(false); }}
                className="w-16 h-1 accent-blue-500 cursor-pointer"
              />

              <div className="flex-1" />

              {/* Speed */}
              <button
                onClick={() => { stopSpeech(); setSpeedIdx(i => (i + 1) % SPEEDS.length); }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                title="Playback speed"
              >
                <Gauge size={14} /> {SPEEDS[speedIdx]}x
              </button>

              {/* Captions */}
              <button
                onClick={() => setCaptions(v => !v)}
                className={`transition-colors ${captions ? 'text-blue-400' : 'text-slate-500'}`}
                title="Captions (C)"
              >
                <Captions size={16} />
              </button>

              {/* Bookmark */}
              <button
                onClick={() => setBookmarked(v => !v)}
                className={`transition-colors ${bookmarked ? 'text-amber-400' : 'text-slate-500'}`}
                title="Bookmark position"
              >
                {bookmarked ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
              </button>

              {/* PiP */}
              <button
                onClick={togglePiP}
                className={`transition-colors ${isPiP ? 'text-purple-400' : 'text-slate-500'} hover:text-white`}
                title="Picture-in-Picture"
              >
                <PictureInPicture2 size={16} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-slate-400 hover:text-white transition-colors"
                title="Fullscreen (F)"
              >
                {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TV stand decoration */}
        <div className="flex justify-center py-3">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full" style={{ background: isPlaying ? screenAccent : '#374151', boxShadow: isPlaying ? `0 0 8px ${screenAccent}` : 'none' }} />
            <div className="text-xs text-slate-600 font-mono tracking-widest">EDUVERSE AI</div>
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>
        </div>
      </motion.div>

      {/* Keyboard shortcuts tooltip */}
      <div className="mt-2 flex flex-wrap gap-2 justify-center">
        {[['Space','Play/Pause'],['←→','Step'],['M','Mute'],['F','Fullscreen'],['C','Captions']].map(([k, v]) => (
          <span key={k} className="text-[10px] text-slate-600 bg-slate-900 rounded px-1.5 py-0.5 border border-slate-800">
            <span className="text-slate-400 font-mono">{k}</span> {v}
          </span>
        ))}
      </div>
    </div>
  );
}
