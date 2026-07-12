import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSessionTracker } from '../utils/sessionTracker';
import ThemeToggleButton from './ThemeToggleButton';
import { Mic } from 'lucide-react';
import EduVerseLogo from './EduVerseLogo';
import ReviewPopup from './ReviewPopup';
import '../pages/DashboardTheme.css';

const studentNav = [
  { path: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { path: '/chat-learn', label: 'Chat & Learn', icon: '💬' },
  { path: '/it-suite', label: 'IT Suite', icon: '🏢' },
  { path: '/subjects', label: 'Learn', icon: '📚' },
  { path: '/practice-hub', label: 'Practice', icon: '🧪' },
  { path: '/coding', label: 'Code', icon: '💻' },
  { path: '/ai-tutor', label: 'AI Center', icon: '🧠' },
  { path: '/quizzes', label: 'Arena', icon: '🏆' },
  { path: '/career-hub', label: 'Career Hub', icon: '🔥' },
  { path: '/community', label: 'Community', icon: '🌐' },
  { path: '/progress', label: 'Progress', icon: '📊' },
  { path: '/certificates', label: 'Certificates', icon: '🎓' },
  { path: '/study-report', label: 'Study Report', icon: '📈' },
  { path: '/ai-profile', label: 'Profile', icon: '👤' },
];


const adminNav = [
  { path: '/admin', label: 'Dashboard', icon: '🏠' },
  { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
  { path: '/admin/content', label: 'Content Studio', icon: '📚' },
  { path: '/admin/quizzes', label: 'Quiz Intelligence', icon: '📝' },
  { path: '/admin/dataset', label: 'AI Data Center', icon: '🗂' },
  { path: '/admin/ml', label: 'ML Studio', icon: '🤖' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { path: '/admin/predictions', label: 'Prediction Center', icon: '📈' },
  { path: '/admin/logs', label: 'Logs & Audit', icon: '📋' },
  { path: '/admin/reviews', label: '⭐ Reviews', icon: '⭐' },
  { path: '/admin/alerts', label: 'Alerts', icon: '🚨' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙' },
];

// All top-level nav paths — back button hidden on these
const TOP_LEVEL_PATHS = [
  '/dashboard', '/dashboard/xp', '/dashboard/streaks',
  '/dashboard/activity', '/dashboard/continue',
  '/subjects', '/practice-hub', '/quizzes', '/coding', '/dbms-lab', '/ai-tutor',
  '/progress', '/certificates', '/study-report', '/ml-analytics', '/ai-profile', '/question-bank',
  '/voice-assistant', '/settings', '/community', '/career-hub', '/it-suite', '/techverse', '/chat-learn',
  '/admin', '/admin/students', '/admin/content', '/admin/quizzes',
  '/admin/dataset', '/admin/ml', '/admin/questions',
  '/admin/logs', '/admin/reviews', '/admin/analytics', '/admin/alerts',
  '/admin/predictions', '/admin/settings',
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  useSessionTracker(user);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Friday AI Tutor', message: 'Your custom Python script compiled successfully! +15 XP', time: '10m ago', unread: true },
    { id: 2, title: 'New Mock Viva', message: 'Prof. Sarah created a new Oral Exam in DBMS.', time: '1h ago', unread: true },
    { id: 4, title: 'Daily Streak', message: 'You have maintained a 3-day learning streak!', time: '1d ago', unread: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navRef = useRef(null);

  // Restore sidebar scroll position on navigation
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('sidebar-scroll');
    if (savedScroll && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname]);

  const handleSidebarScroll = (e) => {
    sessionStorage.setItem('sidebar-scroll', e.currentTarget.scrollTop);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

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



  const handleLogout = () => {
    logout();
    navigate('/?login=true');
  };

  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <ReviewPopup />
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen lg:h-full transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between p-6`}
        style={{ 
          background: 'var(--db-sidebar-bg)', 
          borderRight: '1px solid var(--db-sidebar-border)' 
        }}
      >
        <div className="flex flex-col h-full justify-between overflow-hidden">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Logo */}
            <div className="db-sidebar-logo pb-4 border-b border-[var(--db-sidebar-border)] mb-4 flex-shrink-0">
              <EduVerseLogo size={36} variant="full" />
            </div>

            {/* Navigation Links */}
            <nav 
              ref={navRef}
              onScroll={handleSidebarScroll}
              className="db-nav-list flex-1 overflow-y-auto pr-1 my-2 space-y-1 custom-sidebar-scroll"
            >
              {navItems.map((item) => {
                const isActive = item.path && (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/')));

                return (
                  <div key={item.label} className="db-nav-group">
                    <div
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`db-nav-item ${isActive ? 'active' : ''} ${item.path === '/ai-tutor' ? 'pulsating-purple-glow' : ''} flex items-center justify-between cursor-pointer py-2 px-3 rounded-xl`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="db-nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto">

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
            <div className="db-sidebar-footer" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div className="flex items-center gap-2 text-[var(--db-text-muted)] text-[11px] font-bold leading-normal pr-2">
                <Mic className="w-4 h-4 text-purple-500 animate-pulse flex-shrink-0" />
                <span>Double tap on screen for Voice Agent</span>
              </div>
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
                onClick={() => {
                  const backEvent = new CustomEvent('eduverse-back', { cancelable: true });
                  const handled = !window.dispatchEvent(backEvent);
                  if (!handled) {
                    navigate(-1);
                  }
                }}
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
                placeholder="Search command palette... (Ctrl+K)" 
                className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] placeholder-[var(--db-text-muted)] text-sm rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[var(--db-text-accent)] focus:ring-1 focus:ring-[var(--db-text-accent)] transition-all duration-200 cursor-pointer"
                onClick={() => setShowCommandPalette(true)}
                readOnly
              />
            </div>
          </div>

          {/* Right part: Actions + Profile */}
          <div className="flex items-center gap-4">
            {/* Command Center Pill Button Removed */}

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="p-2 text-[var(--db-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition flex items-center justify-center cursor-pointer" 
              title="Sign Out"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {/* Calendar Indicator Icon */}
            {!isAdmin && (
              <button 
                onClick={() => setShowCalendarModal(true)} 
                className="p-2 text-[var(--db-text-muted)] hover:text-[var(--db-text-accent)] hover:bg-[var(--db-btn-secondary-hover)] rounded-xl transition hidden sm:flex items-center justify-center cursor-pointer" 
                title="Study Calendar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
            )}

            {/* Notifications Dropdown Panel */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  // Clear unread indicator
                  setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                }} 
                className="p-2 text-[var(--db-text-muted)] hover:text-[var(--db-text-accent)] hover:bg-[var(--db-btn-secondary-hover)] rounded-xl transition flex items-center justify-center relative cursor-pointer" 
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#2563EB] rounded-full animate-ping"></span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl z-[120] p-4 text-left text-xs"
                  style={{
                    background: 'var(--db-card-bg)',
                    borderColor: 'var(--db-card-border)',
                    color: 'var(--db-text-main)'
                  }}
                >
                  <div className="flex justify-between items-center border-b border-[var(--db-header-border)] pb-2 mb-2">
                    <span className="font-extrabold text-xs">Notifications</span>
                    <button 
                      onClick={() => setNotifications([])} 
                      className="text-[10px] text-red-500 hover:underline cursor-pointer font-bold"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className="p-2 rounded-lg border relative bg-[var(--db-input-bg)] border-[var(--db-input-border)]"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-[10px] text-[var(--db-text-main)]">{n.title}</span>
                            <span className="text-[8px] text-[var(--db-text-muted)]">{n.time}</span>
                          </div>
                          <p className="text-[9px] mt-0.5 pr-3 leading-normal text-[var(--db-text-muted)]">{n.message}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifications(prev => prev.filter(item => item.id !== n.id));
                            }} 
                            className="absolute right-1.5 top-1.5 text-slate-500 hover:text-red-500 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-slate-500">
                        No notifications.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggleButton />

            {/* Divider */}
            <span className="h-6 w-[1px] bg-[var(--db-header-border)] hidden sm:block"></span>

            {/* User Profile Section */}
            <Link to={isAdmin ? "/admin/settings" : "/ai-profile"} className="flex items-center gap-3 hover:bg-[var(--db-btn-secondary-hover)] p-1.5 rounded-xl transition text-left" style={{ textDecoration: 'none' }}>
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

        <main className={`db-content-body overflow-y-auto custom-sidebar-scroll ${['/coding', '/chat-learn', '/exam-center', '/debate-arena'].includes(location.pathname) ? '!p-0 !max-w-none !m-0 !h-full' : ''}`}>
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

      {/* Dynamic Study Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-md p-6 rounded-3xl border shadow-2xl flex flex-col justify-between"
            style={{
              background: 'var(--db-card-bg)',
              borderColor: 'var(--db-card-border)',
              color: 'var(--db-text-main)'
            }}
          >
            <div className="flex justify-between items-center border-b border-[var(--db-header-border)] pb-3 mb-4">
              <h3 className="font-extrabold text-lg flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
                📅 Study Calendar
              </h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer"
                style={{ color: 'var(--db-text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Month Picker Header */}
            <div className="flex justify-between items-center mb-4 px-2">
              <button 
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                className="p-1.5 px-3 rounded-lg border border-[var(--db-input-border)] bg-[var(--db-input-bg)] text-xs font-bold hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer"
                style={{ color: 'var(--db-text-main)' }}
              >
                ◀
              </button>
              <span className="font-bold text-sm" style={{ color: 'var(--db-text-main)' }}>
                {calendarDate.toLocaleString('default', { month: 'long' })} {calendarDate.getFullYear()}
              </span>
              <button 
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                className="p-1.5 px-3 rounded-lg border border-[var(--db-input-border)] bg-[var(--db-input-bg)] text-xs font-bold hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer"
                style={{ color: 'var(--db-text-main)' }}
              >
                ▶
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--db-text-muted)' }}>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
              {getDaysInMonth(calendarDate).map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                
                const isToday = day.toDateString() === new Date().toDateString();
                const isStreakDay = [1, 2, 4].includes(day.getDay()) && day.getDate() < new Date().getDate();

                return (
                  <div 
                    key={idx}
                    className={`p-2 rounded-xl flex items-center justify-center font-semibold relative transition ${
                      isToday ? 'ring-2 ring-[#2563EB] text-[#2563EB] font-black bg-[#2563EB]/5' :
                      isStreakDay ? 'bg-[#2563EB]/10 text-[#2563EB]' :
                      'hover:bg-[var(--db-btn-secondary-hover)]'
                    }`}
                    style={{ color: isToday ? '#2563EB' : 'var(--db-text-main)' }}
                    title={isToday ? "Today: Learning session active!" : isStreakDay ? "Streak maintained!" : ""}
                  >
                    <span>{day.getDate()}</span>
                    {isStreakDay && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#2563EB]"></span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="p-3 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-2xl text-[11px] leading-relaxed text-left" style={{ color: 'var(--db-text-muted)' }}>
              <strong>💡 Tip:</strong> Keep up your daily streak! Completed topics and quiz attempts automatically sync to your Study Calendar timeline.
            </div>
          </div>
        </div>
      )}
      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-[15vh] p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-xl p-5 rounded-2xl border shadow-2xl flex flex-col justify-between"
            style={{
              background: 'var(--db-card-bg)',
              borderColor: 'var(--db-card-border)',
              color: 'var(--db-text-main)'
            }}
          >
            <div className="flex justify-between items-center border-b border-[var(--db-header-border)] pb-3 mb-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                ⌨️ Command Center
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--db-input-bg)]" style={{ color: 'var(--db-text-muted)' }}>Esc to close</span>
            </div>
            
            <input
              type="text"
              placeholder="Search actions, models, datasets or modules..."
              className="w-full px-3.5 py-2 border text-xs rounded-lg outline-none mb-4"
              style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              autoFocus
            />

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-left text-xs">
              {[
                { name: 'Go to AI Data Center', path: '/admin/dataset', icon: '🗂' },
                { name: 'Go to ML Studio', path: '/admin/ml', icon: '🤖' },
                { name: 'Go to Prediction Center', path: '/admin/predictions', icon: '📈' },
                { name: 'Go to Student Management', path: '/admin/students', icon: '👨‍🎓' },
                { name: 'Go to Quiz Intelligence', path: '/admin/quizzes', icon: '📝' },
                { name: 'Go to Content Studio', path: '/admin/content', icon: '📚' },
                { name: 'Go to Settings', path: '/admin/settings', icon: '⚙' },
                { name: 'Run Model Train Iteration', path: '/admin/ml', icon: '⚡' },
              ].filter(cmd => cmd.name.toLowerCase().includes(commandQuery.toLowerCase())).map((cmd, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (cmd.path) navigate(cmd.path);
                    else if (cmd.action) cmd.action();
                    setShowCommandPalette(false);
                  }}
                  className="p-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition cursor-pointer flex items-center gap-2.5"
                >
                  <span>{cmd.icon}</span>
                  <span className="font-bold">{cmd.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
