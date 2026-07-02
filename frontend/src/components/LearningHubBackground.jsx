import React from 'react';

export default function LearningHubBackground({ isDark }) {
  if (!isDark) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 z-0">
        {/* Light theme subtle background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-100/50 to-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#070313]">
      {/* Starry Night particles background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.8px,transparent_0.8px)] opacity-[0.06] [background-size:20px_20px]" />
      
      {/* Deep Nebula radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px]" />

      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Neon wave gradients */}
          <linearGradient id="neonWaveBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="neonWavePurple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D946EF" stopOpacity="0" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
          </linearGradient>

          {/* Skyline building gradients */}
          <linearGradient id="skylineGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#070313" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="skylineGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#312E81" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#070313" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* LEFT SIDE: 3D GLOBE NETWORK STRUCTURE */}
        <g transform="translate(0, 0)">
          {/* Main Globe base circles */}
          <circle cx="120" cy="480" r="180" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" fill="none" />
          <circle cx="120" cy="480" r="140" stroke="rgba(59, 130, 246, 0.05)" strokeWidth="1" fill="none" />
          
          {/* Longitude and Latitude ellipses */}
          <ellipse cx="120" cy="480" rx="180" ry="70" stroke="rgba(59, 130, 246, 0.06)" strokeWidth="1" fill="none" />
          <ellipse cx="120" cy="480" rx="180" ry="30" stroke="rgba(59, 130, 246, 0.04)" strokeWidth="1" fill="none" />
          <ellipse cx="120" cy="480" rx="70" ry="180" stroke="rgba(59, 130, 246, 0.06)" strokeWidth="1" fill="none" />
          <ellipse cx="120" cy="480" rx="30" ry="180" stroke="rgba(59, 130, 246, 0.04)" strokeWidth="1" fill="none" />
          
          {/* Network structure overlays: lines and glowing nodes */}
          <line x1="40" y1="360" x2="100" y2="330" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />
          <line x1="100" y1="330" x2="200" y2="350" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />
          <line x1="100" y1="330" x2="80" y2="440" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1" />
          <line x1="80" y1="440" x2="160" y2="480" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />
          <line x1="160" y1="480" x2="200" y2="350" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
          <line x1="200" y1="350" x2="250" y2="430" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1" />
          <line x1="160" y1="480" x2="250" y2="430" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />
          <line x1="80" y1="440" x2="30" y2="520" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1" />
          
          {/* Node points */}
          <circle cx="40" cy="360" r="3.5" fill="#3B82F6" className="animate-pulse" style={{ animationDuration: '3s' }} />
          <circle cx="100" cy="330" r="4.5" fill="#8B5CF6" />
          <circle cx="200" cy="350" r="4.5" fill="#3B82F6" />
          <circle cx="80" cy="440" r="3" fill="#A78BFA" />
          <circle cx="160" cy="480" r="5" fill="#8B5CF6" className="animate-pulse" style={{ animationDuration: '2s' }} />
          <circle cx="250" cy="430" r="4" fill="#EC4899" />
          <circle cx="30" cy="520" r="3.5" fill="#6366F1" />
        </g>

        {/* RIGHT SIDE: MATRIX / CIRCUIT BOARD DIGITAL LAYOUT */}
        <g opacity="0.85">
          {/* Horizontal and vertical trace paths */}
          <path d="M 850,50 L 920,50 L 960,90 L 1040,90 L 1060,110 L 1120,110" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1.5" fill="none" />
          <circle cx="1120" cy="110" r="3" fill="#8B5CF6" />

          <path d="M 900,130 L 980,130 L 1020,170 L 1090,170" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1.5" fill="none" />
          <circle cx="1090" cy="170" r="3" fill="#3B82F6" />

          <path d="M 950,220 L 1000,220 L 1040,260 L 1150,260" stroke="rgba(139, 92, 246, 0.12)" strokeWidth="1.5" fill="none" />
          <circle cx="1150" cy="260" r="2.5" fill="#8B5CF6" />
          
          <path d="M 1000,80 L 1030,80 L 1050,100 L 1050,150" stroke="rgba(99, 102, 241, 0.12)" strokeWidth="1" fill="none" />
          <circle cx="1050" cy="150" r="2" fill="#6366F1" />
        </g>

        {/* BOTTOM RIGHT: GLOWING PURPLE/BLUE CITY SKYLINE */}
        <g transform="translate(0, 100)" opacity="0.6">
          {/* Outer skyline buildings silhouettes */}
          <rect x="880" y="380" width="30" height="220" fill="url(#skylineGrad1)" rx="2" />
          <rect x="915" y="340" width="45" height="260" fill="url(#skylineGrad2)" rx="3" />
          <rect x="965" y="390" width="25" height="210" fill="url(#skylineGrad1)" rx="2" />
          <rect x="995" y="310" width="55" height="290" fill="url(#skylineGrad2)" rx="4" />
          <rect x="1055" y="360" width="40" height="240" fill="url(#skylineGrad1)" rx="3" />
          <rect x="1100" y="400" width="35" height="200" fill="url(#skylineGrad2)" rx="2" />

          {/* Building spire points */}
          <line x1="937" y1="340" x2="937" y2="290" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.6" />
          <circle cx="937" cy="290" r="2" fill="#fff" className="animate-pulse" />

          <line x1="1022" y1="310" x2="1022" y2="250" stroke="#3B82F6" strokeWidth="1.5" opacity="0.6" />
          <circle cx="1022" cy="250" r="2" fill="#fff" className="animate-pulse" />

          {/* Scattered glowing window dots inside skyscrapers */}
          <circle cx="925" cy="360" r="1" fill="#fff" opacity="0.6" />
          <circle cx="935" cy="360" r="1" fill="#fff" opacity="0.6" />
          <circle cx="945" cy="360" r="1" fill="#fff" opacity="0.6" />
          <circle cx="925" cy="380" r="1" fill="#fff" opacity="0.6" />
          <circle cx="945" cy="380" r="1" fill="#fff" opacity="0.6" />
          
          <circle cx="1010" cy="340" r="1" fill="#fff" opacity="0.8" />
          <circle cx="1020" cy="340" r="1" fill="#fff" opacity="0.8" />
          <circle cx="1030" cy="340" r="1" fill="#fff" opacity="0.8" />
          <circle cx="1010" cy="370" r="1" fill="#fff" opacity="0.8" />
          <circle cx="1020" cy="370" r="1" fill="#fff" opacity="0.8" />
          <circle cx="1030" cy="370" r="1" fill="#fff" opacity="0.8" />
          <circle cx="1010" cy="400" r="1" fill="#fff" opacity="0.6" />
          <circle cx="1020" cy="400" r="1" fill="#fff" opacity="0.6" />
          <circle cx="1030" cy="400" r="1" fill="#fff" opacity="0.6" />

          <circle cx="1070" cy="380" r="1" fill="#fff" opacity="0.5" />
          <circle cx="1080" cy="380" r="1" fill="#fff" opacity="0.5" />
          <circle cx="1070" cy="410" r="1" fill="#fff" opacity="0.5" />
          <circle cx="1080" cy="410" r="1" fill="#fff" opacity="0.5" />
        </g>

        {/* BOTTOM LEFT & RIGHT: SMOOTH NEON SINE WAVE LINES */}
        <g opacity="0.65">
          <path d="M -50,540 Q 150,470 350,530 T 750,490 T 1150,540 T 1550,500" stroke="url(#neonWaveBlue)" strokeWidth="2.5" fill="none" />
          <path d="M -50,560 Q 200,490 450,550 T 950,510 T 1450,560 T 1950,520" stroke="url(#neonWavePurple)" strokeWidth="2" fill="none" />
          <path d="M 0,580 Q 250,520 500,570 T 1000,530 T 1500,580" stroke="url(#neonWaveBlue)" strokeWidth="1" fill="none" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
