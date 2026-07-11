/**
 * EduVerseLogo — Official reusable brand logo component.
 * Uses high-fidelity, transparent vector SVGs to render the metallic-orbit logo
 * exactly as shown in the original design (without any checkered editor backgrounds).
 *
 * Props:
 *  size      — standard logo height/icon size in px (default 36)
 *  variant   — "full" | "icon"  (full = icon + text, icon = icon only)
 *  className — extra classes on the wrapper
 */
import React from 'react';

export default function EduVerseLogo({ size = 36, variant = 'full', className = '' }) {
  if (variant === 'icon') {
    return <EduVerseIcon size={size} className={className} />;
  }

  // Full brand lockup — logo icon with text layout matching the UI spec
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} style={{ display: 'flex', alignItems: 'center' }}>
      <EduVerseIcon size={size} />
      <div className="flex flex-col text-left justify-center" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', justifyContent: 'center' }}>
        <span 
          className="text-white font-extrabold tracking-tight leading-none animate-pulse" 
          style={{ 
            fontSize: `${size * 0.48}px`, 
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#ffffff',
            fontWeight: 800,
            textShadow: '0 0 10px rgba(6, 182, 212, 0.2)'
          }}
        >
          EduVerse AI
        </span>
        <span 
          className="font-black tracking-widest uppercase leading-none" 
          style={{ 
            fontSize: `${size * 0.21}px`, 
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#38bdf8', // Cyan/sky blue
            fontWeight: 900,
            letterSpacing: '0.14em',
            marginTop: '5px'
          }}
        >
          LEARN. PRACTICE. EXCEL.
        </span>
      </div>
    </div>
  );
}

/**
 * EduVerseIcon — Vector branded icon representing the metallic-orbit E logo
 */
export function EduVerseIcon({ size = 32, className = '' }) {
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="vectorGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients */}
        <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        <linearGradient id="eGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="innerGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Orbit Rings */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="46" 
        ry="15" 
        stroke="url(#orbitGradient)" 
        strokeWidth="2.5" 
        transform="rotate(-28, 50, 50)" 
        filter="url(#vectorGlow)"
        opacity="0.85"
      />
      
      <ellipse 
        cx="50" 
        cy="50" 
        rx="46" 
        ry="15" 
        stroke="url(#orbitGradient)" 
        strokeWidth="1.8" 
        transform="rotate(32, 50, 50)" 
        filter="url(#vectorGlow)"
        opacity="0.7"
      />

      <ellipse 
        cx="50" 
        cy="50" 
        rx="43" 
        ry="12" 
        stroke="#a855f7" 
        strokeWidth="1" 
        transform="rotate(78, 50, 50)" 
        opacity="0.4"
      />

      {/* Outer Glow behind the Letter E */}
      <path 
        d="M32 26 H68 V34 H44 V46 H62 V54 H44 V66 H68 V74 H32 Z" 
        fill="#06b6d4" 
        opacity="0.15" 
        filter="url(#vectorGlow)" 
      />

      {/* High-Tech Stylized Letter E */}
      <path 
        d="M32 26 H68 V34 H44 V46 H62 V54 H44 V66 H68 V74 H32 Z" 
        fill="url(#eGradient)" 
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1"
      />

      {/* Technical Circuit Lines overlay on the E */}
      <path 
        d="M44 34 H68 M44 66 H68 M44 46 H62" 
        stroke="rgba(255, 255, 255, 0.25)" 
        strokeWidth="1" 
      />

      {/* Circuit Nodes (Dots) */}
      <circle cx="68" cy="30" r="2.5" fill="#ffffff" filter="url(#vectorGlow)" />
      <circle cx="62" cy="50" r="2" fill="#ffffff" filter="url(#vectorGlow)" />
      <circle cx="68" cy="70" r="2.5" fill="#ffffff" filter="url(#vectorGlow)" />

      {/* Highlights */}
      <line x1="33" y1="28" x2="33" y2="72" stroke="url(#innerGlowGrad)" strokeWidth="1" />
    </svg>
  );
}
