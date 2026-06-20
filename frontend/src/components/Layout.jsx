import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../pages/DashboardTheme.css';

const studentNav = [
  { path: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { path: '/subjects', label: 'Subjects', icon: '📚' },
  { path: '/quizzes', label: 'Quizzes', icon: '📝' },
  { path: '/coding', label: 'Coding Labs', icon: '💻' },
  { path: '/progress', label: 'Progress Reports', icon: '📊' },
  { path: '/ml-analytics', label: 'ML Insights', icon: '🧠' },
  { path: '/ai-profile', label: 'AI Profile', icon: '👤' },
  { path: '/question-bank', label: 'Question Bank', icon: '❓' },
  { path: '/voice-assistant', label: 'Voice Assistant', icon: '🎙️' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const adminNav = [
  { path: '/admin', label: 'Dashboard', icon: '⚡' },
  { path: '/admin/students', label: 'Students', icon: '👥' },
  { path: '/admin/content', label: 'Content', icon: '📝' },
  { path: '/admin/quizzes', label: 'Quizzes', icon: '✅' },
  { path: '/admin/dataset', label: 'Dataset', icon: '📁' },
  { path: '/admin/ml', label: 'ML Training', icon: '⚙️' },
  { path: '/admin/questions', label: 'Question Bank', icon: '❓' },
  { path: '/admin/api-settings', label: 'API Settings', icon: '🔑' },
  { path: '/admin/logs', label: 'Logs', icon: '📋' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { path: '/admin/alerts', label: 'Alerts', icon: '🚨' },
];

// All top-level nav paths — back button hidden on these
const TOP_LEVEL_PATHS = [
  '/dashboard', '/subjects', '/quizzes', '/coding', '/dbms-lab', '/ai-tutor',
  '/progress', '/ml-analytics', '/ai-profile', '/question-bank',
  '/voice-assistant', '/settings',
  '/admin', '/admin/students', '/admin/content', '/admin/quizzes',
  '/admin/dataset', '/admin/ml', '/admin/questions', '/admin/api-settings',
  '/admin/logs', '/admin/analytics', '/admin/alerts',
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Show back button only on sub-pages (not top-level nav pages)
  const isSubPage = !TOP_LEVEL_PATHS.includes(location.pathname);

  // Derive a readable page title from the path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/subjects/'))   return 'Subject Detail';
    if (path.startsWith('/quizzes/'))    return 'Quiz';
    if (path.startsWith('/admin/'))      return 'Admin';
    if (path.startsWith('/dbms-lab'))    return 'DBMS Lab';
    return '';
  };

  const navItems = isAdmin ? adminNav : studentNav;

  // Apply theme class to html element for global access
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
      return nextTheme;
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sleek Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between p-6`}
        style={{ 
          background: 'var(--db-sidebar-bg)', 
          borderRight: '1px solid var(--db-sidebar-border)' 
        }}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="db-sidebar-logo flex flex-col items-start gap-1 pb-4 border-b border-[var(--db-sidebar-border)] mb-6">
              <div className="flex items-center gap-3">
                <div className="db-sidebar-logo-icon bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white font-bold text-lg rounded-xl w-9 h-9 flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.2)]">E</div>
                <span className="font-extrabold text-xl text-[var(--db-text-main)] tracking-tight">EduVerse AI</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[var(--db-text-muted)] tracking-widest pl-1 mt-1">Learn. Practice. Excel.</span>
            </div>

            {/* Navigation Links */}
            <nav className="db-nav-list">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`db-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="db-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto">
            {/* Upgrade to Pro Card */}
            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-[#2563EB]/5 to-[#60A5FA]/5 border border-[#2563EB]/10 hidden lg:block mb-4">
              <h4 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">⚡ Upgrade to Pro</h4>
              <p className="text-[11px] text-[var(--db-text-muted)] leading-relaxed mb-3">Unlock advanced AI insights, unlimited quizzes, mock tests & more.</p>
              <button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5">
                <span>Upgrade Now</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* XP Progress Card */}
            <div className="p-4 rounded-2xl bg-[var(--db-card-bg-elevated)] border border-[var(--db-sidebar-border)] hidden lg:block mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-sm">🏆</div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--db-text-main)]">Level 12</span>
                  <span className="text-[10px] text-[var(--db-text-muted)]">Learner</span>
                </div>
              </div>
              <div className="w-full bg-[var(--db-input-bg)] rounded-full h-1.5 mb-1.5">
                <div className="bg-[#2563EB] h-1.5 rounded-full" style={{ width: '74%' }}></div>
              </div>
              <div className="flex justify-between text-[9px] text-[var(--db-text-muted)] font-medium">
                <span>1850 XP</span>
                <span>2500 XP</span>
              </div>
            </div>

            {/* Footer Profile Detail */}
            <div className="db-sidebar-footer">
              <div className="db-profile-info">
                <div className="db-profile-avatar">
                  {getInitials(user?.name)}
                </div>
                <div className="db-profile-details">
                  <span className="db-profile-name">{user?.name || 'User Profile'}</span>
                  <span className="db-profile-email">{user?.email || 'user@eduverse.ai'}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="db-settings-btn" title="Sign Out">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="db-main-content">
        <header className="db-header sticky top-0 z-30 flex items-center justify-between px-6 bg-[var(--db-card-bg)] border-b border-[var(--db-header-border)] backdrop-blur-md bg-opacity-80">
          {/* Left part: Back Button + Sidebar toggle + Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile sidebar toggle */}
            <button className="lg:hidden p-2 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"
              style={{ color: 'var(--db-text-main)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Smart Back Button — shown only on sub-pages */}
            {isSubPage && (
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--db-input-border)',
                  background: 'var(--db-input-bg)',
                  color: 'var(--db-text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--db-btn-secondary-hover)';
                  e.currentTarget.style.borderColor = 'var(--db-text-accent)';
                  e.currentTarget.style.color = 'var(--db-text-accent)';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--db-input-bg)';
                  e.currentTarget.style.borderColor = 'var(--db-input-border)';
                  e.currentTarget.style.color = 'var(--db-text-main)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Left arrow icon */}
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
                </svg>
                Back
              </button>
            )}

            {/* Redesigned Search Bar */}
            <div className="relative w-full max-w-md hidden md:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--db-text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Search subjects, quizzes, notes..." 
                className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] placeholder-[var(--db-text-muted)] text-sm rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[var(--db-text-accent)] focus:ring-1 focus:ring-[var(--db-text-accent)] transition-all duration-200"
              />
            </div>
          </div>

          {/* Right part: Actions + Profile */}
          <div className="flex items-center gap-4">
            {/* Calendar Indicator Icon */}
            <Link to="/settings" className="p-2 text-[var(--db-text-muted)] hover:text-[var(--db-text-accent)] hover:bg-[var(--db-btn-secondary-hover)] rounded-xl transition hidden sm:flex items-center justify-center" title="View Calendar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>

            {/* Mock Notifications Icon with badge */}
            <div className="relative">
              <button className="p-2 text-[var(--db-text-muted)] hover:text-[var(--db-text-accent)] hover:bg-[var(--db-btn-secondary-hover)] rounded-xl transition flex items-center justify-center" title="Notifications">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#2563EB] rounded-full"></span>
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="db-theme-toggle" 
              aria-label="Toggle Bright/Dark Theme"
              title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Divider */}
            <span className="h-6 w-[1px] bg-[var(--db-header-border)] hidden sm:block"></span>

            {/* User Profile Section */}
            <Link to="/settings" className="flex items-center gap-3 hover:bg-[var(--db-btn-secondary-hover)] p-1.5 rounded-xl transition text-left" style={{ textDecoration: 'none' }}>
              <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm flex-shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-semibold text-[var(--db-text-main)] leading-tight">{user?.name || 'User Profile'}</span>
                <span className="text-[11px] text-[var(--db-text-muted)] leading-none">{isAdmin ? 'Administrator' : (user?.course || 'Student') + ' ' + (user?.semester ? `Sem ${user.semester}` : '')}</span>
              </div>
            </Link>
          </div>
        </header>

        <main className="db-content-body overflow-hidden">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
