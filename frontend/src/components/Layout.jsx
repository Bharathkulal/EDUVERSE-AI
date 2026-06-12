import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

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

      {/* Sleek Sidebar — always dark for premium SaaS feel */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between p-6`}
        style={{ 
          background: 'var(--db-sidebar-bg)', 
          borderRight: '1px solid var(--db-sidebar-border)' 
        }}
      >
        <div>
          {/* Logo */}
          <div className="db-sidebar-logo">
            <div className="db-sidebar-logo-icon">E</div>
            <span>EduVerse AI</span>
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
      </aside>

      {/* Main Panel */}
      <div className="db-main-content">
        <header className="db-header flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"
              style={{ color: 'var(--db-text-main)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="db-header-title text-base sm:text-lg">
              {location.pathname.startsWith('/admin') ? 'Admin Control Room' : 'Student Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="db-header-date hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button 
              onClick={toggleTheme} 
              className="db-theme-toggle" 
              aria-label="Toggle Bright/Dark Theme"
              title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                /* Sun Icon — shown in dark mode, click to switch to bright */
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                /* Moon Icon — shown in light mode, click to switch to dark */
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="db-content-body">
          {children}
        </main>
      </div>
    </div>
  );
}
