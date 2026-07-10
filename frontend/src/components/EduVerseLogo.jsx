/**
 * EduVerseLogo — Official reusable brand logo component.
 * Use this everywhere instead of importing the PNG directly.
 *
 * Props:
 *  size     — icon size in px (default 36)
 *  variant  — "full" | "icon"  (full = icon + text, icon = icon only)
 *  className — extra classes on the wrapper
 */
import eduverseLogo from '../assets/logo.png';

export default function EduVerseLogo({ size = 36, variant = 'full', className = '' }) {
  if (variant === 'icon') {
    return (
      <img
        src={eduverseLogo}
        alt="EduVerse AI"
        style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
        className={className}
      />
    );
  }

  // Full brand lockup — logo image with text
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ lineHeight: 1 }}>
      <img
        src={eduverseLogo}
        alt="EduVerse AI"
        style={{ width: size * 3.2, height: 'auto', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

/**
 * EduVerseIcon — inline SVG icon for favicon-style usage (no external image needed)
 * Blue/cyan circuit E mark — matches the brand palette.
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
        <linearGradient id="ev-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="ev-e" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="ev-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#ev-bg)" />
      <ellipse cx="50" cy="50" rx="34" ry="17" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.55" transform="rotate(-30 50 50)" />
      <ellipse cx="50" cy="50" rx="34" ry="17" fill="none" stroke="#06B6D4" strokeWidth="1.8" strokeDasharray="4 4" opacity="0.4" transform="rotate(30 50 50)" />
      <text x="50" y="67" fontSize="52" textAnchor="middle" fill="url(#ev-e)" fontFamily="Arial Black, Arial" fontWeight="900" filter="url(#ev-glow)">E</text>
      <circle cx="27" cy="38" r="2.8" fill="#60A5FA" opacity="0.85" />
      <circle cx="73" cy="62" r="2.8" fill="#06B6D4" opacity="0.85" />
      <circle cx="74" cy="34" r="1.8" fill="#60A5FA" opacity="0.6" />
      <circle cx="26" cy="66" r="1.8" fill="#06B6D4" opacity="0.6" />
    </svg>
  );
}
