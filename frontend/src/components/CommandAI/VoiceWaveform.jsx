import { useState, useEffect } from 'react';
import './CommandAI.css';

export default function VoiceWaveform({ active = false, count = 24 }) {
  const [heights, setHeights] = useState(() => 
    Array.from({ length: count }, () => Math.floor(Math.random() * 20) + 4)
  );

  useEffect(() => {
    if (!active) {
      setHeights(Array.from({ length: count }, () => 4));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: count }, () => Math.floor(Math.random() * 26) + 6)
      );
    }, 80);

    return () => clearInterval(interval);
  }, [active, count]);

  return (
    <div className="cai-waveform">
      {heights.map((h, i) => (
        <div 
          key={i} 
          className="cai-waveform-bar" 
          style={{ height: `${h}px` }} 
        />
      ))}
    </div>
  );
}
