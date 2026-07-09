import React from 'react';
import { motion } from 'framer-motion';

export default function FridayFloatingOrb({ state = 'idle', size = 120 }) {
  // Select color schemes based on the agent state
  const colors = {
    idle: 'from-blue-500 via-indigo-600 to-purple-700',
    listening: 'from-cyan-400 via-teal-500 to-emerald-600',
    thinking: 'from-indigo-500 via-purple-600 to-pink-500',
    speaking: 'from-fuchsia-500 via-pink-600 to-rose-500',
  };

  const glows = {
    idle: 'rgba(99, 102, 241, 0.4)',
    listening: 'rgba(34, 211, 238, 0.6)',
    thinking: 'rgba(192, 132, 252, 0.5)',
    speaking: 'rgba(244, 63, 94, 0.6)',
  };

  // Soundwave bar settings for speaking animation
  const waves = [
    { delay: 0.1, duration: 0.8 },
    { delay: 0.3, duration: 0.6 },
    { delay: 0.0, duration: 0.9 },
    { delay: 0.4, duration: 0.7 },
    { delay: 0.2, duration: 0.8 },
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 1.5, height: size * 1.5 }}>
      {/* Outer Halo ring (Thinking Mode) */}
      {state === 'thinking' && (
        <motion.div
          className="absolute rounded-full border-2 border-dashed border-purple-400 opacity-60"
          style={{ width: size + 40, height: size + 40 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Surrounding Ambient Glow Aura */}
      <motion.div
        className="absolute rounded-full filter blur-xl opacity-40"
        style={{
          width: size + 20,
          height: size + 20,
          background: `radial-gradient(circle, ${glows[state]} 0%, transparent 70%)`
        }}
        animate={
          state === 'listening'
            ? { scale: [1, 1.3, 1] }
            : { scale: [1, 1.1, 1] }
        }
        transition={{
          duration: state === 'listening' ? 1.0 : 3.0,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core Glowing Orb */}
      <motion.div
        className={`rounded-full bg-gradient-to-tr ${colors[state]} shadow-2xl relative flex items-center justify-center overflow-hidden`}
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 35px 10px ${glows[state]}`
        }}
        animate={
          state === 'idle'
            ? { y: [0, -12, 0], scale: [1, 1.02, 1] }
            : state === 'listening'
            ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }
            : state === 'thinking'
            ? { scale: [1, 0.95, 1] }
            : { scale: [1, 1.08, 1] } // speaking
        }
        transition={{
          duration: state === 'idle' ? 4 : state === 'listening' ? 1.2 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glassmorphic Reflection Overlay */}
        <div className="absolute inset-0 bg-white opacity-10 rounded-full bg-gradient-to-b from-white to-transparent" style={{ height: '50%' }} />

        {/* Animated Speech Waveform bars (overlay inside orb when speaking) */}
        {state === 'speaking' && (
          <div className="flex gap-1.5 items-center justify-center w-full h-full z-10">
            {waves.map((w, idx) => (
              <motion.div
                key={idx}
                className="w-1.5 rounded-full bg-white opacity-90"
                style={{ height: size * 0.2 }}
                animate={{ height: [size * 0.15, size * 0.55, size * 0.15] }}
                transition={{
                  duration: w.duration,
                  delay: w.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}

        {/* Pulsing micro-core for visual complexity (in idle/listening mode) */}
        {state !== 'speaking' && (
          <motion.div
            className="w-1/3 h-1/3 rounded-full bg-white opacity-20 filter blur-xs"
            animate={
              state === 'listening'
                ? { scale: [1, 1.8, 1], opacity: [0.2, 0.5, 0.2] }
                : { scale: [1, 1.2, 1] }
            }
            transition={{
              duration: state === 'listening' ? 0.8 : 3.0,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
