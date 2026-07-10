/**
 * EduVerseLogo — Official reusable brand logo component.
 * Custom vector SVG with 3D orbit wrap-around and glowing metallic styles.
 *
 * Props:
 *  size     — icon size in px (default 36)
 *  variant  — "full" | "icon"  (full = icon + text, icon = icon only)
 *  className — extra classes on the wrapper
 */

export default function EduVerseLogo({ size = 36, variant = 'full', className = '' }) {
  if (variant === 'icon') {
    return <EduVerseIcon size={size} className={className} />;
  }

  // Full brand lockup — logo icon with text below, exactly matching the photo
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Icon size is scaled slightly larger (2.2x size) to feel prominent and match the photo */}
      <EduVerseIcon size={size * 2.2} />
      <span 
        className="font-display font-black tracking-tight text-white flex items-start select-none mt-3.5" 
        style={{ 
          fontSize: size * 0.58,
          fontFamily: "'Space Grotesk', 'Outfit', 'Inter', sans-serif",
          lineHeight: 1
        }}
      >
        <span className="bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent filter drop-shadow-[0_0_8px_rgba(96,165,250,0.35)]">
          EduVerse
        </span>
        <span 
          className="font-black text-cyan-400 select-none relative animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.4)]"
          style={{
            fontSize: size * 0.28,
            top: -size * 0.12,
            marginLeft: size * 0.1,
            backgroundColor: 'rgba(8, 47, 73, 0.4)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            padding: '2px 4px',
            borderRadius: '4px',
            lineHeight: 1
          }}
        >
          AI
        </span>
      </span>
    </div>
  );
}

/**
 * EduVerseIcon — inline SVG icon for favicon-style usage (no external image needed)
 * Blue/cyan circuit E mark with 3D wrap-around orbital ring and glowing lens flare.
 */
export function EduVerseIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EduVerse AI"
    >
      <defs>
        <radialGradient id="ev-bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="70%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#090D16" />
        </radialGradient>
        <linearGradient id="ev-e-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#E2E8F0" />
          <stop offset="70%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="ev-orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="ev-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ev-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
        </filter>
        <style>{`
          @keyframes orbit-breathing {
            0%, 100% { opacity: 0.75; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.02); }
          }
          @keyframes star-sparkle {
            0%, 100% { opacity: 0.8; transform: scale(0.85); }
            50% { opacity: 1; transform: scale(1.15); }
          }
          .animate-orbit {
            transform-origin: 50px 50px;
            animation: orbit-breathing 4s ease-in-out infinite;
          }
          .animate-star-child {
            transform-origin: 0px 0px;
            animation: star-sparkle 2.5s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Main Base Sphere */}
      <circle cx="50" cy="50" r="41" fill="url(#ev-bg-glow)" stroke="url(#ev-orbit-grad)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#22D3EE" strokeWidth="1" opacity="0.4" filter="url(#ev-glow)" />

      {/* Tilted Orbit (Back Half) */}
      <g transform="rotate(-30 50 50)" className="animate-orbit">
        <path d="M 50,36 A 41,14 0 0,0 50,64" fill="none" stroke="url(#ev-orbit-grad)" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
      </g>

      {/* Stylized 'E' Glyphs (Layered for depth & glow) */}
      <g filter="url(#ev-shadow)">
        {/* Glow backing */}
        <path
          d="M 36,28 H 64 C 66,28 67,29.5 67,31.5 V 34 C 67,36 66,37.5 64,37.5 H 48 V 45.5 H 61 C 63,45.5 64,47 64,49 V 51 C 64,53 63,54.5 61,54.5 H 48 V 62.5 H 64 C 66,62.5 67,64 67,66 V 68.5 C 67,70.5 66,72 64,72 H 36 C 33.5,72 32,70 32,67.5 V 32.5 C 32,30 33.5,28 36,28 Z"
          fill="#3B82F6"
          opacity="0.35"
          filter="url(#ev-glow)"
        />
        {/* Front metal glyph */}
        <path
          d="M 36,28 H 64 C 66,28 67,29.5 67,31.5 V 34 C 67,36 66,37.5 64,37.5 H 48 V 45.5 H 61 C 63,45.5 64,47 64,49 V 51 C 64,53 63,54.5 61,54.5 H 48 V 62.5 H 64 C 66,62.5 67,64 67,66 V 68.5 C 67,70.5 66,72 64,72 H 36 C 33.5,72 32,70 32,67.5 V 32.5 C 32,30 33.5,28 36,28 Z"
          fill="url(#ev-e-grad)"
        />
      </g>

      {/* Tilted Orbit (Front Half) + Star Flare */}
      <g transform="rotate(-30 50 50)" className="animate-orbit">
        <path d="M 50,64 A 41,14 0 0,0 50,36" fill="none" stroke="url(#ev-orbit-grad)" strokeWidth="2.2" strokeLinecap="round" />
        
        {/* Star Flare group positioned on the orbit ellipse path at coordinates (85, 42.7) */}
        <g transform="translate(85, 42.7)">
          <g className="animate-star-child">
            {/* Soft back glow */}
            <circle cx="0" cy="0" r="7" fill="#22D3EE" opacity="0.6" filter="url(#ev-glow)" />
            {/* White core */}
            <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
            {/* Vertical/Horizontal Flare lines */}
            <path d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 -8,0 Q 0,0 0,-8 Z" fill="#FFFFFF" />
            {/* Diagonal Flare lines */}
            <path d="M -4,-4 Q 0,0 4,-4 Q 0,0 4,4 Q 0,0 -4,4 Q 0,0 -4,-4 Z" fill="#22D3EE" opacity="0.65" />
          </g>
        </g>
      </g>
    </svg>
  );
}

