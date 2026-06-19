import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginDrawer from '../components/LoginDrawer';
import './LandingPage.css';

/* ──── Data ──── */
const marqueeItems = [
  { name: 'Java', icon: '☕' }, { name: 'Python', icon: '🐍' },
  { name: 'DBMS', icon: '🗄️' }, { name: 'DSA', icon: '🧩' },
  { name: 'Web Dev', icon: '🌐' }, { name: 'AI/ML', icon: '🤖' },
  { name: 'C#', icon: '⚙️' }, { name: 'Advanced Java', icon: '🔥' },
  { name: 'Data Structures', icon: '📦' }, { name: 'Algorithms', icon: '📐' },
];

const navItems = ['Features', 'Subjects', 'AI Tutor', 'Demo', 'Pricing'];

const problems = [
  { icon: '😩', text: 'Textbooks are boring, passive, and hard to retain' },
  { icon: '🤯', text: 'Concepts stay abstract with no visual or hands-on practice' },
  { icon: '🕳️', text: 'No real-time feedback when you get stuck on a problem' },
];

const solutions = [
  { icon: '🎨', text: 'Interactive visual animations make every concept click instantly' },
  { icon: '🤖', text: 'Friday AI Tutor answers doubts in real time, 24/7' },
  { icon: '⚡', text: 'Live code simulation + quizzes reinforce learning actively' },
];

const features = [
  { emoji: '🤖', title: 'Friday AI Tutor', desc: 'Chat or speak with your personal AI tutor. Get instant, context-aware explanations on any concept, any time.' },
  { emoji: '🎨', title: 'Visual Learning Studio', desc: 'Watch algorithms and data structures come alive through step-by-step SVG animations with timeline control.' },
  { emoji: '💻', title: 'C# Interactive Lab', desc: 'A fully interactive multi-level learning module with visualization canvas, code editor and simulation mode.' },
  { emoji: '📊', title: 'ML Analytics Dashboard', desc: 'AI predicts your performance and recommends the best study path based on your learning patterns.' },
  { emoji: '🧠', title: 'Smart Quiz Generator', desc: 'AI-generated quizzes adapt to your weak areas. Timed challenges and question banks for exam prep.' },
  { emoji: '🏆', title: 'Gamified Progress', desc: 'Earn XP, unlock streaks, and track your journey. Learning is more fun when it feels like a game.' },
];

const steps = [
  { title: 'Create Your Account', desc: 'Sign up in seconds. Complete a quick onboarding to personalize your AI-powered study plan.' },
  { title: 'Choose a Subject', desc: 'Browse Java, Python, DSA, DBMS, C#, Web Dev, AI/ML, and more — all in one platform.' },
  { title: 'Visual Learning Mode', desc: 'Dive into interactive animations, SVG visualizations, and step-by-step concept breakdowns.' },
  { title: 'Ask Your AI Tutor', desc: 'Stuck? Ask Friday AI instantly via text or voice. Get clear, personalized explanations.' },
  { title: 'Practice & Build', desc: 'Solve quizzes, run code simulations, track your score, and prove your mastery.' },
];

const stats = [
  { count: 10000, suffix: '+', label: 'Active Students' },
  { count: 500,   suffix: '+', label: 'Concepts Covered' },
  { count: 50,    suffix: '+', label: 'Learning Modules' },
  { count: 95,    suffix: '%', label: 'Engagement Rate' },
];

const chatReplies = [
  'Great question! A Stack follows LIFO — Last In, First Out. The last element pushed is the first to be popped.',
  'Think of it like a stack of plates 🍽️ — you can only pick up the one on top!',
  'Common operations: push() adds to top, pop() removes from top, peek() just looks. Want to try the demo?',
  'In C#, use Stack<T> from System.Collections.Generic. It\'s thread-safe with ConcurrentStack too!',
];

const stackTopics = ['Graphs', 'Hash Maps', 'Queues', 'Heaps', 'Tries', 'Sorting'];

export default function LandingPage() {
  const navigate   = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [navScrolled,   setNavScrolled]   = useState(false);

  // Demo state
  const [stackItems,  setStackItems]  = useState(['Arrays', 'Linked List', 'Trees']);
  const [stackIdx,    setStackIdx]    = useState(0);
  const [chatMsgs,    setChatMsgs]    = useState([{ role: 'bot', text: 'Hi! What topic would you like to learn today?' }]);
  const [chatInput,   setChatInput]   = useState('');
  const [replyIdx,    setReplyIdx]    = useState(0);
  const chatEndRef = useRef(null);

  // Scroll animations
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.lp-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    const counters = document.querySelectorAll('[data-lp-count]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = '1';
        const target = +entry.target.dataset.lpCount;
        const suffix = entry.target.dataset.lpSuffix || '';
        let current = 0;
        const step = Math.ceil(target / 70);
        const iv = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(iv); }
          entry.target.textContent = current.toLocaleString() + suffix;
        }, 18);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Chat scroll
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  const openLogin  = useCallback((e) => { e?.preventDefault(); setMobileNavOpen(false); setDrawerOpen(true); }, []);
  const goRegister = useCallback(() => { setMobileNavOpen(false); navigate('/register'); }, [navigate]);

  const popStack  = () => setStackItems(prev => prev.slice(0, -1));
  const pushStack = () => {
    if (stackItems.length >= 6) return;
    setStackItems(prev => [...prev, stackTopics[stackIdx % stackTopics.length]]);
    setStackIdx(i => i + 1);
  };

  const sendChat = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMsgs(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setTimeout(() => {
      setChatMsgs(prev => [...prev, { role: 'bot', text: chatReplies[replyIdx % chatReplies.length] }]);
      setReplyIdx(i => i + 1);
    }, 700);
  };

  return (
    <div className="lp-root">

      {/* ═══ NAVBAR ═══ */}
      <header className={`lp-nav ${navScrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav__inner">
          <div className="lp-logo" onClick={goRegister}>EduVerse <span>AI</span></div>

          <nav className="lp-nav__links">
            {navItems.map(item => (
              <span key={item} className="lp-nav__link" onClick={goRegister}>{item}</span>
            ))}
          </nav>

          <div className="lp-nav__actions">
            <button className="lp-nav__login" onClick={openLogin}>Sign In</button>
            <button className="lp-nav__cta" onClick={goRegister} id="navbar-get-started">Get Started</button>
          </div>

          <button className="lp-nav__burger" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileNavOpen && (
        <div className="lp-mobile-overlay">
          <button className="lp-mobile-overlay__close" onClick={() => setMobileNavOpen(false)}>✕</button>
          <div className="lp-logo" style={{ fontSize: '1.6rem', marginBottom: '2rem' }}>EduVerse <span>AI</span></div>
          {navItems.map(item => (
            <span key={item} className="lp-mobile-overlay__link" onClick={goRegister}>{item}</span>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 260, marginTop: '1rem' }}>
            <button className="lp-nav__login" onClick={openLogin} style={{ fontSize: '1rem', padding: '0.75rem' }}>Sign In</button>
            <button className="lp-btn lp-btn--primary" onClick={goRegister} style={{ justifyContent: 'center' }}>Start Learning Free</button>
          </div>
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <section className="lp-hero" id="hero">
        {/* Background blobs */}
        <div className="lp-blob lp-blob--1" />
        <div className="lp-blob lp-blob--2" />

        <div className="lp-hero__grid">
          {/* Left */}
          <div className="lp-hero__left">
            <div className="lp-badge">
              <span className="lp-badge__dot" />
              AI-Powered Learning Platform
            </div>
            <h1 className="lp-hero__h1">
              Turn Complex Subjects into{' '}
              <span className="lp-gradient-text">Visual, Interactive</span>{' '}
              Learning with AI
            </h1>
            <p className="lp-hero__sub">
              Master Java, Python, C#, DSA, Web Dev and more through AI tutors,
              animated visualizations, smart quizzes, and hands-on coding simulations.
            </p>
            <div className="lp-hero__ctas">
              <button className="lp-btn lp-btn--primary" onClick={goRegister} id="hero-start-learning">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Get Started Free
              </button>
              <button className="lp-btn lp-btn--outline" onClick={openLogin} id="hero-watch-demo">
                Watch Demo →
              </button>
            </div>
            <div className="lp-hero__pills">
              {['AI Tutor 24/7', 'Visual Animations', 'Code Simulation', 'Smart Quizzes', 'ML Analytics'].map(p => (
                <span key={p} className="lp-pill">✓ {p}</span>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Preview */}
          <div className="lp-hero__right">
            <div className="lp-preview">
              {/* Main card */}
              <div className="lp-preview__card lp-float">
                {/* Header */}
                <div className="lp-preview__card-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="lp-preview__avatar">E</div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>EduVerse AI</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>C# Interactive Lab</div>
                    </div>
                  </div>
                  <span className="lp-preview__live">● Live</span>
                </div>
                {/* Mini category cards */}
                <div className="lp-preview__modules">
                  {[
                    { icon: '⚡', name: 'Basics of C#', color: '#2563EB' },
                    { icon: '🔷', name: 'OOP',           color: '#7C3AED' },
                    { icon: '📦', name: 'Data Struct',   color: '#059669' },
                    { icon: '🔍', name: 'LINQ',          color: '#D97706' },
                  ].map(m => (
                    <div key={m.name} className="lp-preview__module" style={{ '--mc': m.color }}>
                      <span>{m.icon}</span>
                      <span>{m.name}</span>
                    </div>
                  ))}
                </div>
                {/* Progress bars */}
                <div className="lp-preview__progress">
                  {[
                    { label: 'Inheritance', pct: 82, color: '#2563EB' },
                    { label: 'Stack', pct: 67, color: '#7C3AED' },
                    { label: 'LINQ', pct: 45, color: '#059669' },
                  ].map(p => (
                    <div key={p.label} className="lp-preview__bar-row">
                      <span>{p.label}</span>
                      <div className="lp-preview__bar-track">
                        <div className="lp-preview__bar-fill" style={{ width: `${p.pct}%`, background: p.color }} />
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>{p.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              <div className="lp-preview__badge lp-preview__badge--tl">
                🧠 AI Tutor Active
              </div>
              <div className="lp-preview__badge lp-preview__badge--br lp-preview__badge--green">
                ✓ 95% Engagement
              </div>
              <div className="lp-preview__badge lp-preview__badge--bl">
                🎯 Step 3 / 5
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST / MARQUEE ═══ */}
      <section className="lp-marquee-section">
        <p className="lp-marquee-label">Subjects covered across all engineering streams</p>
        <div className="lp-marquee-wrap">
          <div className="lp-marquee-track">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
              <div key={`${item.name}-${i}`} className="lp-marquee-item">
                <span className="lp-marquee-icon">{item.icon}</span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM / SOLUTION ═══ */}
      <section className="lp-section lp-ps" id="features">
        <div className="lp-container">
          <div className="lp-section__head lp-reveal">
            <h2 className="lp-section__h2">The Old Way vs. <span className="lp-gradient-text">EduVerse Way</span></h2>
            <p className="lp-section__sub">Traditional learning leaves students lost. We fix that.</p>
          </div>
          <div className="lp-ps__grid">
            <div className="lp-reveal lp-reveal--left">
              <div className="lp-ps__col-label lp-ps__col-label--bad">❌ The Problem</div>
              {problems.map((p, i) => (
                <div key={i} className="lp-ps__card lp-ps__card--bad">
                  <span className="lp-ps__card-icon">{p.icon}</span>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
            <div className="lp-reveal lp-reveal--right">
              <div className="lp-ps__col-label lp-ps__col-label--good">✅ The Solution</div>
              {solutions.map((s, i) => (
                <div key={i} className="lp-ps__card lp-ps__card--good">
                  <span className="lp-ps__card-icon">{s.icon}</span>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="lp-section lp-features-section">
        <div className="lp-container">
          <div className="lp-section__head lp-reveal">
            <h2 className="lp-section__h2">Everything You Need to <span className="lp-gradient-text">Learn Smarter</span></h2>
            <p className="lp-section__sub">Six powerful tools — one unified AI learning platform.</p>
          </div>
          <div className="lp-feat-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className="lp-feat-card lp-reveal"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="lp-feat-card__emoji">{f.emoji}</div>
                <h3 className="lp-feat-card__title">{f.title}</h3>
                <p className="lp-feat-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="lp-section lp-how">
        <div className="lp-container lp-how__inner">
          <div className="lp-section__head lp-reveal">
            <h2 className="lp-section__h2">How It <span className="lp-gradient-text">Works</span></h2>
            <p className="lp-section__sub">From sign-up to mastery in 5 clear steps.</p>
          </div>
          <div className="lp-timeline">
            {steps.map((s, i) => (
              <div key={i} className="lp-timeline__item lp-reveal">
                <div className="lp-timeline__dot">{i + 1}</div>
                <div className="lp-timeline__body">
                  <h3 className="lp-timeline__title">{s.title}</h3>
                  <p className="lp-timeline__desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INTERACTIVE DEMO ═══ */}
      <section className="lp-section lp-demo" id="demo">
        <div className="lp-container">
          <div className="lp-section__head lp-reveal">
            <h2 className="lp-section__h2">See It in <span className="lp-gradient-text">Action</span></h2>
            <p className="lp-section__sub">Try the Stack visualizer and chat with the AI — right here.</p>
          </div>
          <div className="lp-demo__grid">
            {/* Stack Viz */}
            <div className="lp-demo__panel lp-reveal lp-reveal--left">
              <div className="lp-demo__panel-head">
                <div className="lp-demo__dots"><span/><span/><span/></div>
                <span className="lp-demo__filename">stack_demo.cs</span>
                <span className="lp-demo__lang">C#</span>
              </div>
              <div className="lp-demo__code-area">
                <p className="lp-demo__comment">// Stack&lt;T&gt; — LIFO Data Structure</p>
                <div className="lp-stack-visual">
                  {stackItems.length === 0 && (
                    <div className="lp-stack-empty">Stack is empty</div>
                  )}
                  {[...stackItems].reverse().map((item, i) => (
                    <div
                      key={`${item}-${i}`}
                      className="lp-stack-block"
                      style={{
                        background: i === 0
                          ? 'linear-gradient(135deg, #2563EB, #60A5FA)'
                          : i === 1
                            ? 'linear-gradient(135deg, #3B82F6, #818CF8)'
                            : 'linear-gradient(135deg, #6366F1, #A78BFA)',
                      }}
                    >
                      {i === 0 && <span className="lp-stack-top-label">TOP →</span>}
                      push("{item}")
                    </div>
                  ))}
                </div>
                <div className="lp-demo__stack-btns">
                  <button className="lp-demo__stack-btn lp-demo__stack-btn--pop" onClick={popStack}>
                    pop()
                  </button>
                  <button className="lp-demo__stack-btn lp-demo__stack-btn--push" onClick={pushStack}>
                    push()
                  </button>
                </div>
              </div>
            </div>

            {/* AI Chat */}
            <div className="lp-demo__chat lp-reveal lp-reveal--right">
              <div className="lp-demo__chat-head">
                <div className="lp-demo__chat-avatar">F</div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>Friday AI Tutor</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#10B981' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}/>
                    Online — ready to help
                  </div>
                </div>
              </div>
              <div className="lp-demo__messages">
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`lp-demo__msg lp-demo__msg--${m.role}`}>
                    {m.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="lp-demo__chat-input-row">
                <input
                  className="lp-demo__input"
                  type="text"
                  placeholder="Ask about data structures..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  id="chat-input"
                />
                <button className="lp-demo__send" onClick={sendChat}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="lp-section lp-stats">
        <div className="lp-container">
          <div className="lp-stats__grid">
            {stats.map((s, i) => (
              <div key={i} className="lp-stats__item lp-reveal">
                <span
                  className="lp-stats__num"
                  data-lp-count={s.count}
                  data-lp-suffix={s.suffix}
                >
                  0{s.suffix}
                </span>
                <span className="lp-stats__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="lp-section lp-cta" id="cta-section">
        <div className="lp-cta__blob lp-cta__blob--1" />
        <div className="lp-cta__blob lp-cta__blob--2" />
        <div className="lp-cta__inner lp-reveal">
          <div className="lp-badge" style={{ marginBottom: '1.5rem' }}>
            <span className="lp-badge__dot" />
            Join 10,000+ Students Today
          </div>
          <h2 className="lp-cta__h2">
            Start Learning Smarter with{' '}
            <span className="lp-gradient-text">EduVerse AI</span>
          </h2>
          <p className="lp-cta__sub">
            No credit card required. Get instant access to AI tutor, visual learning,
            interactive labs, and your personalized learning path.
          </p>
          <div className="lp-cta__btns">
            <button className="lp-btn lp-btn--primary lp-btn--lg" onClick={goRegister} id="cta-btn1">
              Get Started Free — It's Free
            </button>
            <button className="lp-btn lp-btn--outline lp-btn--lg" onClick={openLogin} id="cta-btn2">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer__grid">
            <div className="lp-footer__brand">
              <div className="lp-logo" style={{ fontSize: '1.4rem' }}>EduVerse <span>AI</span></div>
              <p>Learn by Seeing, Doing, and Building.</p>
              <div className="lp-footer__socials">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="lp-footer__social" aria-label="GitHub">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013.01-.4c1.02.005 2.05.14 3.01.4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <a href="#" className="lp-footer__social" aria-label="Twitter">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="lp-footer__social" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div className="lp-footer__col">
              <h4>Platform</h4>
              <span onClick={goRegister}>Features</span>
              <span onClick={goRegister}>AI Tutor</span>
              <span onClick={goRegister}>Visual Learning</span>
              <span onClick={goRegister}>C# Interactive Lab</span>
              <span onClick={goRegister}>Quiz Generator</span>
            </div>
            <div className="lp-footer__col">
              <h4>Subjects</h4>
              <span onClick={goRegister}>Java & Advanced Java</span>
              <span onClick={goRegister}>Python & AI/ML</span>
              <span onClick={goRegister}>C# Programming</span>
              <span onClick={goRegister}>Data Structures</span>
              <span onClick={goRegister}>Web Development</span>
            </div>
            <div className="lp-footer__col">
              <h4>Company</h4>
              <span onClick={goRegister}>About</span>
              <span onClick={goRegister}>Blog</span>
              <span onClick={goRegister}>Careers</span>
              <span onClick={goRegister}>Privacy Policy</span>
              <span onClick={goRegister}>Contact</span>
            </div>
          </div>
          <div className="lp-footer__bottom">
            <span>© 2025 EduVerse AI. All rights reserved.</span>
            <span>Built with ❤️ for students everywhere</span>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="lp-sticky-cta">
        <button className="lp-btn lp-btn--primary" onClick={goRegister} style={{ width: '100%', justifyContent: 'center', borderRadius: 14 }}>
          Start Free — No Card Needed
        </button>
      </div>

      <LoginDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onOpenRegister={() => navigate('/register')} />
    </div>
  );
}
