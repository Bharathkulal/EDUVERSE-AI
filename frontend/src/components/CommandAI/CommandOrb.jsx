import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useCommandAI } from '../../context/CommandAIContext';
import './CommandAI.css';

export default function CommandOrb({ size = 80, floating = true }) {
  const { activeState, startListening, isWakeEnabled } = useCommandAI();

  const handleOrbClick = (e) => {
    e.stopPropagation();
    startListening();
  };

  const ringClassMap = {
    idle: 'cai-ring-idle',
    listening: 'cai-ring-listening',
    thinking: 'cai-ring-thinking',
    speaking: 'cai-ring-speaking'
  };

  return (
    <div 
      onClick={handleOrbClick}
      className={`cai-orb-wrapper ${floating ? 'cai-orb-floating' : ''}`}
      style={{ width: size, height: size }}
    >
      {/* State Glow Halo */}
      <div className={`cai-orb-halo ${activeState}`} />
      
      {/* Nested Rotating Rings */}
      <div className={`cai-orb-ring cai-orb-ring-1 ${ringClassMap[activeState]}`} />
      <div className={`cai-orb-ring cai-orb-ring-2 ${ringClassMap[activeState]}`} />
      <div className={`cai-orb-ring cai-orb-ring-3 ${ringClassMap[activeState]}`} />

      {/* Interactive Core */}
      <motion.div 
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`cai-orb-core ${activeState}`}
      >
        {activeState === 'listening' ? (
          <MicOff className="w-5 h-5 text-white" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </motion.div>

      {/* Continuous indicator label if wake enabled */}
      {isWakeEnabled && activeState === 'idle' && (
        <span className="cai-orb-label">Listening for "EduVerse"</span>
      )}
    </div>
  );
}
