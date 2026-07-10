/**
 * EduVerseLogo — Official reusable brand logo component.
 * Uses transparent cropped PNG assets extracted from the high-tech brand design.
 *
 * Props:
 *  size      — standard logo height/icon size in px (default 36)
 *  variant   — "full" | "icon"  (full = icon + text, icon = icon only)
 *  className — extra classes on the wrapper
 */
import eduverseLogo from '../assets/logo.png';
import eduverseIcon from '../assets/logo_icon.png';

export default function EduVerseLogo({ size = 36, variant = 'full', className = '' }) {
  if (variant === 'icon') {
    return <EduVerseIcon size={size} className={className} />;
  }

  // Full brand lockup — logo image with text (aspect ratio 2.31)
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ lineHeight: 1 }}>
      <img
        src={eduverseLogo}
        alt="EduVerse AI"
        style={{ height: size, width: 'auto', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

/**
 * EduVerseIcon — Square branded icon (no text)
 */
export function EduVerseIcon({ size = 32, className = '' }) {
  return (
    <img
      src={eduverseIcon}
      alt="EduVerse AI"
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      className={className}
    />
  );
}


