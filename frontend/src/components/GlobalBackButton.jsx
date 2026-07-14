/**
 * GlobalBackButton — EduVerse AI
 *
 * The SINGLE reusable back button component used throughout EduVerse AI.
 * Uses the centralized NavigationHistoryContext — never hardcodes destinations.
 *
 * Props:
 *   className   — optional additional CSS classes
 *   variant     — 'header' (default, pill style) | 'floating' (for full-screen pages)
 *   label       — button text, default 'Back'
 *   onClick     — optional override: when provided, this handler is called instead of goBack.
 *                 Use for internal state transitions (sub-view navigation within a page).
 */

import { motion } from 'framer-motion';
import { useNavHistory } from '../context/NavigationContext';

export default function GlobalBackButton({
  className = '',
  variant = 'header',
  label = 'Back',
  onClick = null,
}) {
  const { goBack, canGoBack } = useNavHistory();

  // If no onClick override and no history — hide the button
  if (!onClick && !canGoBack) return null;

  const handleClick = onClick || goBack;

  if (variant === 'floating') {
    return (
      <motion.button
        onClick={handleClick}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -3, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        title="Go Back (Alt + ←)"
        aria-label="Go back to previous page"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm
          bg-white/10 hover:bg-white/20 text-white border border-white/20
          hover:border-white/40 backdrop-blur-sm shadow-lg transition-colors
          duration-200 cursor-pointer ${className}`}
      >
        <svg
          width="15" height="15"
          fill="none" stroke="currentColor"
          viewBox="0 0 24 24" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M19 12H5m7-7-7 7 7 7" />
        </svg>
        {label}
      </motion.button>
    );
  }

  // Default: 'header' variant — matches the Layout pill style
  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.96 }}
      title="Go Back (Alt + ←)"
      aria-label="Go back to previous page"
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] font-semibold
        text-[0.82rem] cursor-pointer transition-all duration-200 select-none
        border whitespace-nowrap flex-shrink-0 ${className}`}
      style={{
        border: '1.5px solid var(--db-input-border)',
        background: 'var(--db-input-bg)',
        color: 'var(--db-text-main)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--db-btn-secondary-hover)';
        e.currentTarget.style.borderColor = 'var(--db-text-accent)';
        e.currentTarget.style.color = 'var(--db-text-accent)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--db-input-bg)';
        e.currentTarget.style.borderColor = 'var(--db-input-border)';
        e.currentTarget.style.color = 'var(--db-text-main)';
      }}
    >
      <svg
        width="14" height="14"
        fill="none" stroke="currentColor"
        viewBox="0 0 24 24" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M19 12H5m7-7-7 7 7 7" />
      </svg>
      {label}
    </motion.button>
  );
}

