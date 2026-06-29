/**
 * AIAvatar — Animated AI teacher avatar
 * SVG-based professor character with idle, talking, pointing, wave animations.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAvatar({ isTalking = false, emotion = 'idle', accentColor = '#3B82F6' }) {
  const [blink, setBlink]     = useState(false);
  const [mouthOpen, setMouth] = useState(false);
  const blinkRef              = useRef(null);
  const mouthRef              = useRef(null);

  /* Random blink every 3–6 seconds */
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 3000;
      blinkRef.current = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 180);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(blinkRef.current);
  }, []);

  /* Mouth animation synced with isTalking */
  useEffect(() => {
    if (!isTalking) { setMouth(false); return; }
    const toggleMouth = () => {
      setMouth(prev => !prev);
      mouthRef.current = setTimeout(toggleMouth, 100 + Math.random() * 150);
    };
    mouthRef.current = setTimeout(toggleMouth, 80);
    return () => clearTimeout(mouthRef.current);
  }, [isTalking]);

  const armVariants = {
    idle:     { rotate: 0 },
    wave:     { rotate: [0, -25, 15, -20, 10, 0], transition: { duration: 1.2, repeat: Infinity, repeatDelay: 3 } },
    point:    { rotate: -35, x: 8 },
    congrats: { rotate: [-10, 10], transition: { duration: 0.5, repeat: Infinity, repeatType: 'reverse' } }
  };

  const bodyVariants = {
    idle: {
      y: [0, -3, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    },
    talking: {
      y: [0, -2, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      <motion.div
        animate={isTalking ? 'talking' : 'idle'}
        variants={bodyVariants}
        className="relative"
        style={{ width: 140, height: 200 }}
      >
        <svg width="140" height="200" viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* ── Glow ── */}
          <defs>
            <radialGradient id="bodyGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Background glow circle */}
          <ellipse cx="70" cy="110" rx="60" ry="85" fill="url(#bodyGrad)" />

          {/* ── Body (jacket) ── */}
          <rect x="35" y="115" width="70" height="75" rx="18" fill="#1E293B" />
          {/* Jacket lapels */}
          <path d="M 70 115 L 55 135 L 70 130 L 85 135 Z" fill="#334155" />
          {/* Shirt / tie area */}
          <rect x="64" y="125" width="12" height="40" rx="4" fill="#E2E8F0" opacity="0.9" />
          {/* Tie */}
          <path d="M 70 128 L 66 148 L 70 152 L 74 148 Z" fill={accentColor} />

          {/* ── Left arm ── */}
          <motion.g
            style={{ originX: '35px', originY: '125px' }}
            animate={emotion === 'point' ? 'point' : emotion === 'wave' ? 'wave' : emotion === 'congrats' ? 'congrats' : 'idle'}
            variants={armVariants}
          >
            <rect x="18" y="120" width="18" height="50" rx="9" fill="#1E293B" />
            {/* Left hand */}
            <circle cx="27" cy="174" r="9" fill="#FBBF24" />
          </motion.g>

          {/* ── Right arm ── */}
          <motion.g
            style={{ originX: '105px', originY: '125px' }}
            animate={emotion === 'wave' ? { rotate: [0, 25, -10, 20, -5, 0], transition: { duration: 1.2, repeat: Infinity, repeatDelay: 3 } } : { rotate: 0 }}
          >
            <rect x="104" y="120" width="18" height="50" rx="9" fill="#1E293B" />
            {/* Right hand */}
            <circle cx="113" cy="174" r="9" fill="#FBBF24" />
          </motion.g>

          {/* ── Neck ── */}
          <rect x="62" y="105" width="16" height="16" rx="4" fill="#FBBF24" />

          {/* ── Head ── */}
          <circle cx="70" cy="78" r="34" fill="#FBBF24" filter="url(#glow)" />

          {/* Hair */}
          <path d="M 40 68 Q 45 40 70 36 Q 95 40 100 68 Q 90 55 70 52 Q 50 55 40 68 Z" fill="#1E293B" />
          {/* Ear left */}
          <ellipse cx="36" cy="78" rx="5" ry="7" fill="#F59E0B" />
          {/* Ear right */}
          <ellipse cx="104" cy="78" rx="5" ry="7" fill="#F59E0B" />

          {/* ── Eyes ── */}
          {/* Left eye */}
          <g>
            <ellipse cx="57" cy="76" rx="7" ry={blink ? 1.5 : 7} fill="white" />
            {!blink && <circle cx="58" cy="76" r="4" fill="#1E293B" />}
            {!blink && <circle cx="60" cy="74" r="1.5" fill="white" />}
          </g>
          {/* Right eye */}
          <g>
            <ellipse cx="83" cy="76" rx="7" ry={blink ? 1.5 : 7} fill="white" />
            {!blink && <circle cx="84" cy="76" r="4" fill="#1E293B" />}
            {!blink && <circle cx="86" cy="74" r="1.5" fill="white" />}
          </g>

          {/* Eyebrows */}
          <path d="M 50 66 Q 57 63 64 66" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 76 66 Q 83 63 90 66" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* ── Mouth ── */}
          {mouthOpen ? (
            /* Open mouth (talking) */
            <ellipse cx="70" cy="95" rx="10" ry="7" fill="#1E293B" />
          ) : emotion === 'congrats' ? (
            /* Big smile */
            <path d="M 56 93 Q 70 107 84 93" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : (
            /* Normal smile */
            <path d="M 60 93 Q 70 102 80 93" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}

          {/* Glasses */}
          <circle cx="57" cy="76" r="10" stroke={accentColor} strokeWidth="2" fill="none" opacity="0.6" />
          <circle cx="83" cy="76" r="10" stroke={accentColor} strokeWidth="2" fill="none" opacity="0.6" />
          <line x1="67" y1="76" x2="73" y2="76" stroke={accentColor} strokeWidth="2" opacity="0.6" />
          <line x1="36" y1="76" x2="47" y2="76" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
          <line x1="93" y1="76" x2="104" y2="76" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
        </svg>

        {/* Speech bubble when talking */}
        <AnimatePresence>
          {isTalking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute -top-8 -right-2 text-lg"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                🎙️
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Name badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 px-3 py-1 rounded-full text-xs font-bold border"
        style={{
          background: accentColor + '20',
          borderColor: accentColor + '50',
          color: accentColor,
        }}
      >
        AI Teacher
      </motion.div>
    </div>
  );
}
