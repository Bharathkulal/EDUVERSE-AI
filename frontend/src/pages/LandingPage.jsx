import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginDrawer from '../components/LoginDrawer';
import './LandingPage.css';

/* ──── Marquee Data ──── */
const marqueeItems = [
  { name: 'Java', icon: '☕' },
  { name: 'Python', icon: '🐍' },
  { name: 'DBMS', icon: '🗄️' },
  { name: 'DSA', icon: '🧩' },
  { name: 'Web Dev', icon: '🌐' },
  { name: 'AI/ML', icon: '🤖' },
  { name: 'C#', icon: '⚙️' },
  { name: 'Advanced Java', icon: '🔥' },
];

/* ──── Feature Highlights ──── */
const featureHighlights = [
  { label: 'AI Tutor Assistance', icon: '🤖' },
  { label: 'Coding Practice Arena', icon: '💻' },
  { label: 'Smart Quiz Generator', icon: '🧠' },
  { label: 'ML Performance Prediction', icon: '📊' },
  { label: 'Interview Preparation', icon: '🎯' },
  { label: 'Study Notes & Resources', icon: '📚' },
];

/* ──── Nav Items ──── */
const navItems = ['Features', 'Subjects', 'AI Tutor', 'Resources', 'Pricing'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  /* Scroll listener for navbar backdrop blur */
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openLoginDrawer = (e) => {
    if (e) e.preventDefault();
    setMobileNavOpen(false);
    setDrawerOpen(true);
  };

  const handleOpenRegister = () => {
    navigate('/register');
  };

  const scrollToSection = () => {
    setMobileNavOpen(false);
    navigate('/register');
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  return (
    <div className="lp-page-wrapper">

      {/* ═══════════════════════════════════════════
          BACKGROUND VIDEO
          ═══════════════════════════════════════════ */}
      <div className="lp-bg-video-container">
        <video
          ref={videoRef}
          className={`lp-bg-video ${videoLoaded ? 'loaded' : ''}`}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={handleVideoLoaded}
          poster=""
        >
          {/* Users place their AI-themed video in public folder */}
          <source src="/ai-background.mp4" type="video/mp4" />
          <source src="/ai-background.webm" type="video/webm" />
        </video>
      </div>

      {/* ═══════════════════════════════════════════
          LEFT SOCIAL SIDEBAR
          ═══════════════════════════════════════════ */}
      <div className="lp-social-sidebar">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="lp-sidebar-icon" aria-label="GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.42-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.382 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.838 1.234 1.91 1.234 3.22 0 4.61-2.807 5.625-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.293 0 .322.216.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <a href="#" className="lp-sidebar-icon" aria-label="Community">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          </svg>
        </a>
        <a href="#" className="lp-sidebar-icon" aria-label="Info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </a>
      </div>

      {/* ═══════════════════════════════════════════
          GLASSMORPHISM NAVBAR
          ═══════════════════════════════════════════ */}
      <header className={`lp-navbar ${navScrolled ? 'scrolled' : ''}`}>
        <div className="lp-navbar-inner">
          <div className="lp-logo">EduVerse <span>AI</span></div>

          <nav className="lp-nav-links">
            {navItems.map((item) => (
              <span
                key={item}
                className="lp-nav-link"
                onClick={scrollToSection}
              >
                {item}
              </span>
            ))}
          </nav>

          <button onClick={openLoginDrawer} className="lp-nav-cta" id="navbar-get-started">
            Get Started
          </button>

          <button
            className="lp-menu-toggle"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <div className={`lp-mobile-nav-overlay ${mobileNavOpen ? 'open' : ''}`}>
        <button className="lp-mobile-close-btn" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
          ✕
        </button>
        {navItems.map((item) => (
          <span key={item} className="lp-nav-link" onClick={scrollToSection}>
            {item}
          </span>
        ))}
        <button onClick={openLoginDrawer} className="lp-nav-login-btn" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
          Sign In
        </button>
        <button onClick={scrollToSection} className="lp-btn lp-btn-primary" style={{ fontSize: '0.95rem' }}>
          Start Learning Free
        </button>
      </div>

      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="lp-hero-section" id="hero">
        {/* Floating blurred glow behind headline */}
        <div className="lp-hero-glow" />

        <div className="lp-hero-content">
          {/* AI-Powered Badge */}
          <div className="lp-hero-badge">
            <span className="lp-hero-badge-dot" />
            AI-Powered Learning Platform
          </div>

          {/* Main Headline */}
          <h1 className="lp-hero-headline">
            <span className="text-foreground">Power Your Learning with </span>
            <span className="text-gradient">AI</span>
          </h1>

          {/* Subtitle */}
          <p className="lp-hero-subtitle">
            Master Java, Python, DBMS, DSA, Web Development and more with AI tutors,
            smart quizzes, coding practice, and personalized learning insights.
          </p>

          {/* CTA Buttons */}
          <div className="lp-hero-cta-group">
            <button
              onClick={scrollToSection}
              className="lp-btn lp-btn-primary"
              id="hero-start-learning"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Learning Free
            </button>
            <button
              onClick={scrollToSection}
              className="lp-btn lp-btn-secondary"
              id="hero-explore-features"
            >
              Explore Features
              <span className="lp-btn-icon">→</span>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="lp-feature-highlights">
            {featureHighlights.map((feat) => (
              <div key={feat.label} className="lp-feature-highlight-item">
                <span className="lp-feature-check">✓</span>
                {feat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INFINITE MARQUEE – Technology Logos
          ═══════════════════════════════════════════ */}
      <section className="lp-marquee-section">
        <p className="lp-marquee-label">Trusted by students across colleges</p>
        <div className="lp-marquee-wrapper">
          <div className="lp-marquee-track">
            {/* Duplicate the items for seamless infinite scroll */}
            {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
              <div key={`${item.name}-${i}`} className="lp-marquee-item">
                <span className="lp-marquee-icon">{item.icon}</span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LOGIN DRAWER (Side Slide-out)
          ═══════════════════════════════════════════ */}
      <LoginDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenRegister={handleOpenRegister}
      />
    </div>
  );
}
