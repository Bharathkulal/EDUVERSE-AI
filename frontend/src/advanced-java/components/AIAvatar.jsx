/**
 * AIAvatar — Animated Java Mentor Avatar
 * States: idle, wave, talk, point, congrats, think
 * Uses CSS keyframes and framer-motion for lip sync, eye movement, hand gestures
 */
import { motion, AnimatePresence } from 'framer-motion';

const EMOTIONS = {
  idle:    { body: '🧑‍💻', label: 'Ready',          color: '#3B82F6' },
  wave:    { body: '👋',   label: 'Welcome!',       color: '#10B981' },
  talk:    { body: '🗣️',  label: 'Explaining...',   color: '#8B5CF6' },
  point:   { body: '👉',   label: 'Look here!',     color: '#F59E0B' },
  congrats:{ body: '🎉',   label: 'Great job!',     color: '#22C55E' },
  think:   { body: '🤔',   label: 'Analyzing...',   color: '#06B6D4' },
};

function MouthAnimation({ isTalking, color }) {
  return (
    <div className="flex justify-center gap-[3px] mt-1">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: 3, background: color }}
          animate={isTalking ? {
            height: [3, 8 + Math.random() * 8, 3],
          } : { height: 3 }}
          transition={isTalking ? {
            duration: 0.15 + Math.random() * 0.15,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.05,
          } : {}}
        />
      ))}
    </div>
  );
}

function EyeAnimation({ isTalking }) {
  return (
    <div className="flex justify-center gap-3 mb-1">
      {[0, 1].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2.5 bg-white rounded-full relative overflow-hidden"
          animate={isTalking ? {} : {}}
        >
          <motion.div
            className="w-1 h-1 bg-slate-900 rounded-full absolute"
            animate={{
              x: [0, 1, -1, 0],
              y: [0, -0.5, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={{ top: '30%', left: '25%' }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function AIAvatar({ isTalking = false, emotion = 'idle', accentColor = '#3B82F6' }) {
  const emo = EMOTIONS[emotion] || EMOTIONS.idle;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      {/* Avatar container */}
      <motion.div
        className="relative w-[140px] h-[160px] rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden"
        style={{
          borderColor: emo.color + '60',
          background: `linear-gradient(180deg, ${emo.color}15, ${emo.color}05)`,
          boxShadow: `0 0 30px ${emo.color}20, inset 0 0 30px ${emo.color}08`,
        }}
        animate={isTalking ? {
          borderColor: [emo.color + '40', emo.color + '80', emo.color + '40'],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {/* Pulse ring when talking */}
        <AnimatePresence>
          {isTalking && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2"
              style={{ borderColor: emo.color + '30' }}
            />
          )}
        </AnimatePresence>

        {/* Face area */}
        <div className="relative z-10 flex flex-col items-center">
          <EyeAnimation isTalking={isTalking} />

          {/* Emoji body */}
          <motion.div
            className="text-4xl my-1"
            animate={
              emotion === 'wave'
                ? { rotate: [0, 14, -8, 14, 0] }
                : emotion === 'point'
                ? { x: [0, 6, 0] }
                : emotion === 'congrats'
                ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                : emotion === 'think'
                ? { y: [0, -3, 0] }
                : { scale: [1, 1.02, 1] }
            }
            transition={{
              duration: emotion === 'idle' ? 3 : 1.2,
              repeat: Infinity,
              repeatDelay: emotion === 'idle' ? 2 : 0.5,
            }}
          >
            {emo.body}
          </motion.div>

          {/* Mouth / Audio visualizer */}
          <MouthAnimation isTalking={isTalking} color={emo.color} />
        </div>

        {/* Hand gesture indicator */}
        {emotion === 'point' && (
          <motion.div
            className="absolute bottom-2 right-2 text-lg"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ☝️
          </motion.div>
        )}

        {/* Highlight shimmer */}
        {emotion === 'congrats' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
              backgroundSize: '200% 200%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Status label */}
      <motion.div
        className="mt-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={emotion}
      >
        <div
          className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
          style={{
            color: emo.color,
            borderColor: emo.color + '40',
            background: emo.color + '15',
          }}
        >
          {emo.label}
        </div>
      </motion.div>

      {/* AI Mentor title */}
      <div className="mt-1.5 text-[9px] text-slate-600 font-mono tracking-wider uppercase">
        Java Architect AI
      </div>
    </motion.div>
  );
}
