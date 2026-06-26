import { useTheme } from '../context/ThemeContext';

/**
 * Standalone theme toggle button — the single source of truth for dark/light switching.
 * Used in Layout's header AND in standalone visualizer page headers.
 */
export default function ThemeToggleButton({ className = '' }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`db-theme-toggle-switch ${className}`}
      style={{
        background: 'var(--db-input-bg)',
        border: '1.5px solid var(--db-input-border)',
        cursor: 'pointer',
        padding: '2px',
        height: '32px',
        width: '58px',
        borderRadius: '9999px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 300ms ease-in-out',
        boxShadow: 'var(--db-shadow-sm)',
        flexShrink: 0,
      }}
      aria-label="Toggle Dark/Light Theme"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span
        style={{
          transform: isDarkMode ? 'translateX(26px)' : 'translateX(2px)',
          width: '24px',
          height: '24px',
          background: 'var(--db-text-accent)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1), background-color 300ms ease-in-out',
        }}
      >
        {isDarkMode ? (
          /* Moon icon */
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          /* Sun icon */
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        )}
      </span>
    </button>
  );
}
