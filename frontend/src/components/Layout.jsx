import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSessionTracker } from '../utils/sessionTracker';
import '../pages/DashboardTheme.css';

const studentNav = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '⚡',
    children: [
      { path: '/dashboard', label: 'Overview' },
      { path: '/dashboard/goals', label: 'Daily Goals' },
      { path: '/dashboard/xp', label: 'XP & Level' },
      { path: '/dashboard/streaks', label: 'Streaks' },
      { path: '/dashboard/activity', label: 'Recent Activity' },
      { path: '/dashboard/continue', label: 'Quick Continue' }
    ]
  },
  {
    path: '/subjects',
    label: 'Learn',
    icon: '📚',
    children: [
      { path: '/subjects', label: 'Subjects' },
      { path: '/subjects#courses', label: 'Courses' },
      { path: '/subjects#roadmaps', label: 'Learning Roadmaps' },
      { path: '/subjects#notes', label: 'Notes' },
      { path: '/subjects#resources', label: 'Resource Library' },
      { path: '/subjects#studio', label: 'Learning Studio' },
      { path: '/subjects#bookmarks', label: 'Bookmarks' }
    ]
  },
  {
    path: '/practice-hub',
    label: 'Practice',
    icon: '🧪',
    children: [
      { path: '/practice-hub', label: 'Practice Hub' },
      { path: '/question-bank', label: 'Question Bank' },
      { path: '/practice-hub#challenges', label: 'Daily Challenges' },
      { path: '/practice-hub#flashcards', label: 'Flash Cards' },
      { path: '/practice-hub#mcq', label: 'MCQ Practice' },
      { path: '/practice-hub#topic', label: 'Topic-wise Practice' },
      { path: '/practice-hub#mock', label: 'Mock Tests' }
    ]
  },
  {
    path: '/coding',
    label: 'Code',
    icon: '💻',
    children: [
      { path: '/coding', label: 'Coding Labs' },
      { path: '/coding#challenges', label: 'Coding Challenges' },
      { path: '/coding#projects', label: 'Projects' },
      { path: '/coding#playground', label: 'Code Playground' },
      { path: '/coding#compiler', label: 'Compiler' },
      { path: '/coding#cp', label: 'Competitive Programming' },
      { path: '/coding#builder', label: 'Project Builder' }
    ]
  },
  {
    path: '/dsa',
    label: 'Visualizers',
    icon: '🧩',
    children: [
      { path: '/dsa/linked-list', label: 'Linked List' },
      { path: '/dsa/stack', label: 'Stack' },
      { path: '/dsa/queue', label: 'Queue' },
      { path: '/dsa/tree', label: 'Tree' },
      { path: '/dsa/graph', label: 'Graph' },
      { path: '/dsa/sorting', label: 'Sorting' },
      { path: '/dsa/pathfinding', label: 'Pathfinding' }
    ]
  },
  {
    path: '/ai-tutor',
    label: 'AI Center',
    icon: '🧠',
    children: [
      { path: '/ai-tutor#mentor', label: 'AI Mentor' },
      { path: '/ai-tutor', label: 'AI Tutor' },
      { path: '/ai-tutor#career', label: 'AI Career Guide' },
      { path: '/ai-tutor#interviewer', label: 'AI Interviewer' },
      { path: '/ai-tutor#resume', label: 'AI Resume Reviewer' },
      { path: '/ai-tutor#planner', label: 'AI Study Planner' },
      { path: '/voice-assistant', label: 'Voice Assistant' }
    ]
  },
  {
    path: '/quizzes',
    label: 'Arena',
    icon: '🏆',
    children: [
      { path: '/quizzes#battles', label: 'Quiz Battles' },
      { path: '/coding#battles', label: 'Coding Battles' },
      { path: '/dsa#battles', label: 'DSA Battles' },
      { path: '/ai-tutor#battles', label: 'AI Battles' },
      { path: '/quizzes#tournaments', label: 'Tournaments' },
      { path: '/quizzes#leaderboards', label: 'Leaderboards' },
      { path: '/progress#achievements', label: 'Achievements' }
    ]
  },
  {
    path: '/career-hub',
    label: 'Career Hub',
    icon: '🔥',
    children: [
      { path: '/career-hub#resume', label: 'Resume Builder' },
      { path: '/career-hub#placement', label: 'Placement Prep' },
      { path: '/career-hub#company', label: 'Company Questions' },
      { path: '/career-hub#interview', label: 'Interview Prep' },
      { path: '/career-hub#aptitude', label: 'Aptitude Practice' },
      { path: '/career-hub#portfolio', label: 'Portfolio Builder' },
      { path: '/career-hub#certifications', label: 'Certifications' }
    ]
  },
  {
    path: '/community',
    label: 'Community',
    icon: '🌐',
    children: [
      { path: '/community#forum', label: 'Discussion Forum' },
      { path: '/community#groups', label: 'Study Groups' },
      { path: '/community#clubs', label: 'Coding Clubs' },
      { path: '/community#teams', label: 'Project Teams' },
      { path: '/community#challenges', label: 'Challenges' },
      { path: '/community#doubt', label: 'Doubt Solving' }
    ]
  },
  {
    path: '/progress',
    label: 'Progress',
    icon: '📊',
    children: [
      { path: '/progress', label: 'Analytics' },
      { path: '/progress#skill-graph', label: 'Skill Graph' },
      { path: '/progress#heatmap', label: 'Learning Heatmap' },
      { path: '/progress#reports', label: 'Reports' },
      { path: '/progress#achievements', label: 'Achievements' },
      { path: '/progress#certificates', label: 'Certificates' },
      { path: '/progress#ranking', label: 'Ranking History' }
    ]
  },
  {
    path: '/ai-profile',
    label: 'Profile',
    icon: '👤',
    children: [
      { path: '/ai-profile', label: 'AI Profile' },
      { path: '/settings', label: 'Settings' },
      { path: '/settings#subscription', label: 'Subscription' },
      { path: '/settings#theme', label: 'Theme Customizer' },
      { path: '/settings#notifications', label: 'Notifications' },
      { path: '/settings#account', label: 'Account' }
    ]
  }
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
  '/dashboard', '/dashboard/goals', '/dashboard/xp', '/dashboard/streaks',
  '/dashboard/activity', '/dashboard/continue',
  '/subjects', '/practice-hub', '/quizzes', '/coding', '/dbms-lab', '/ai-tutor',
  '/progress', '/ml-analytics', '/ai-profile', '/question-bank',
  '/voice-assistant', '/settings', '/community', '/career-hub',
  '/admin', '/admin/students', '/admin/content', '/admin/quizzes',
  '/admin/dataset', '/admin/ml', '/admin/questions', '/admin/api-settings',
  '/admin/logs', '/admin/analytics', '/admin/alerts',
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  useSessionTracker(user);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  const isSubPage = !TOP_LEVEL_PATHS.includes(location.pathname);

  // Toggle dropdown menu
  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

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

  // Auto-expand menu on load based on active path
  useEffect(() => {
    if (!navItems) return;
    const activeParent = navItems.find(item => {
      if (!item) return false;
      const childMatch = item.children?.some(child => {
        if (!child || !child.path) return false;
        return location.pathname === child.path || 
               (child.path.includes('#') && location.pathname + location.hash === child.path);
      });
      if (childMatch) return true;
      if (!item.path) return false;
      return location.pathname === item.path || 
             (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
    });
    if (activeParent) {
      setOpenMenus(prev => ({ ...prev, [activeParent.label]: true }));
    }
  }, [location.pathname, location.hash, isAdmin]);

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

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between p-6`}
        style={{ 
          background: 'var(--db-sidebar-bg)', 
          borderRight: '1px solid var(--db-sidebar-border)' 
        }}
      >
        <div className="flex flex-col h-full justify-between overflow-y-auto pr-1 custom-sidebar-scroll">
          <div className="flex flex-col flex-1">
            {/* Logo */}
            <div className="db-sidebar-logo flex flex-col items-start gap-1 pb-4 border-b border-[var(--db-sidebar-border)] mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="db-sidebar-logo-icon bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white font-bold text-lg rounded-xl w-9 h-9 flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.2)]">E</div>
                <span className="font-extrabold text-xl text-[var(--db-text-main)] tracking-tight">EduVerse AI</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[var(--db-text-muted)] tracking-widest pl-1 mt-1">Learn. Practice. Excel.</span>
            </div>

            {/* Navigation Links */}
            <nav className="db-nav-list flex-1 overflow-y-auto pr-1 my-2 space-y-1 custom-sidebar-scroll">
              {navItems.map((item) => {
                const isMenuOpen = !!openMenus[item.label];
                const isParentActive = (item.path && (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/')))) || 
                                       item.children?.some(child => {
                                         if (!child || !child.path) return false;
                                         return location.pathname === child.path || 
                                                (child.path.includes('#') && location.pathname + location.hash === child.path);
                                       });

                return (
                  <div key={item.label} className="db-nav-group">
                    <div
                      onClick={() => {
                        if (item.children) {
                          toggleMenu(item.label);
                        } else {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }
                      }}
                      className={`db-nav-item ${isParentActive ? 'active' : ''} flex items-center justify-between cursor-pointer py-2 px-3 rounded-xl`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="db-nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.children && (
                        <motion.span
                          animate={{ rotate: isMenuOpen ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-[9px] opacity-60 mr-1"
                        >
                          ▶
                        </motion.span>
                      )}
                    </div>

                    {item.children && (
                      <AnimatePresence initial={false}>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="db-sub-nav-list pl-4 ml-4 border-l border-[var(--db-sidebar-border)] flex flex-col gap-1 mt-1 overflow-hidden"
                          >
                            {item.children.map((child) => {
                              const isChildActive = location.pathname === child.path || (child.path.includes('#') && location.pathname + location.hash === child.path);
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`db-sub-nav-item py-1.5 px-3 rounded-lg text-xs transition flex items-center justify-between ${isChildActive ? 'active-child font-semibold text-[var(--db-text-accent)] bg-[var(--db-badge-bg)]' : 'text-[var(--db-text-muted)] hover:text-[var(--db-text-accent)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
                                >
                                  <span>{child.label}</span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
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
              className="db-theme-toggle-switch" 
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
                boxShadow: 'var(--db-shadow-sm)'
              }}
              aria-label="Toggle Bright/Dark Theme"
              title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
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
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), background-color 300ms ease-in-out'
                }}
              >
                {isDarkMode ? (
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                )}
              </span>
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

        <main className="db-content-body overflow-y-auto custom-sidebar-scroll">
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
