import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './InnovationHub.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Education', 'Finance', 'E-commerce', 'SaaS',
  'Real Estate', 'Food & Beverage', 'Logistics', 'Entertainment', 'Gaming',
  'Clean Energy', 'Agriculture', 'Manufacturing', 'Retail', 'Travel', 'Other'
];

const STEPS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'idea', label: 'Idea', icon: '💡' },
  { id: 'evaluate', label: 'AI Evaluation', icon: '🤖' },
  { id: 'market', label: 'Market Research', icon: '📊' },
  { id: 'business', label: 'Business Model', icon: '🏗️' },
  { id: 'financial', label: 'Financial Plan', icon: '💰' },
  { id: 'mvp', label: 'MVP Plan', icon: '🚀' },
  { id: 'pitch', label: 'Pitch Deck', icon: '🎯' },
];

function ScoreRing({ score, label, color }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = circ * (score / 100);
  return (
    <div className="score-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="36" y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">{score}</text>
      </svg>
      <span className="score-ring-label">{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    draft: { color: '#6b7280', label: 'Draft' },
    in_progress: { color: '#f59e0b', label: 'In Progress' },
    evaluated: { color: '#8b5cf6', label: 'Evaluated' },
    launch_ready: { color: '#10b981', label: 'Launch Ready' },
  };
  const s = map[status] || map.draft;
  return <span className="status-badge" style={{ background: s.color + '22', color: s.color, border: `1px solid ${s.color}44` }}>{s.label}</span>;
}

function ProgressPipeline({ idea }) {
  const stages = [
    { key: 'ai_evaluation', label: 'Evaluated', icon: '🤖' },
    { key: 'market_research', label: 'Market', icon: '📊' },
    { key: 'business_model', label: 'BizModel', icon: '🏗️' },
    { key: 'financial_plan', label: 'Financials', icon: '💰' },
    { key: 'mvp_plan', label: 'MVP', icon: '🚀' },
    { key: 'pitch_deck', label: 'Pitch', icon: '🎯' },
  ];
  const completed = stages.filter(s => idea[s.key]).length;
  const pct = (completed / stages.length) * 100;
  return (
    <div className="pipeline-wrap">
      <div className="pipeline-bar">
        <div className="pipeline-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="pipeline-stages">
        {stages.map((s, i) => (
          <div key={s.key} className={`pipeline-stage ${idea[s.key] ? 'done' : ''}`} title={s.label}>
            <span>{idea[s.key] ? '✓' : s.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InnovationHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState('');
  const [error, setError] = useState('');
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [showMentor, setShowMentor] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [mentorMessages, setMentorMessages] = useState([
    { role: 'ai', text: "👋 I'm Friday AI, your startup mentor! I can help you validate ideas, build strategies, and navigate the startup journey. Ask me anything!" }
  ]);
  const [mentorInput, setMentorInput] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [genIdeas, setGenIdeas] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genForm, setGenForm] = useState({ industry: 'Technology', interests: '', skills: '' });
  const [ideaForm, setIdeaForm] = useState({
    title: '', problem_statement: '', solution: '', target_audience: '',
    industry: 'Technology', country: '', tech_stack: ''
  });
  const mentorEndRef = useRef(null);

  const authHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => { fetchIdeas(); }, []);
  useEffect(() => { mentorEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mentorMessages]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/innovation/ideas`, { headers: authHeader() });
      if (r.ok) setIdeas(await r.json());
    } catch (e) { } finally { setLoading(false); }
  };

  const fetchIdea = async (id) => {
    try {
      const r = await fetch(`${API}/api/innovation/ideas/${id}`, { headers: authHeader() });
      if (r.ok) { const d = await r.json(); setSelectedIdea(d); return d; }
    } catch (e) { }
  };

  const createIdea = async () => {
    if (!ideaForm.title.trim()) { setError('Title is required'); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/api/innovation/ideas`, { method: 'POST', headers: authHeader(), body: JSON.stringify(ideaForm) });
      if (r.ok) {
        const idea = await r.json();
        setIdeas(prev => [idea, ...prev]);
        setSelectedIdea(idea);
        setShowNewIdea(false);
        setIdeaForm({ title: '', problem_statement: '', solution: '', target_audience: '', industry: 'Technology', country: '', tech_stack: '' });
        setActiveView('evaluate');
      } else { const d = await r.json(); setError(d.message || 'Error creating idea'); }
    } catch (e) { setError('Network error'); } finally { setLoading(false); }
  };

  const runAI = async (endpoint, key) => {
    if (!selectedIdea) return;
    setAiLoading(key);
    try {
      const r = await fetch(`${API}/api/innovation/ideas/${selectedIdea.id}/${endpoint}`, { method: 'POST', headers: authHeader() });
      if (r.ok) {
        const fresh = await fetchIdea(selectedIdea.id);
        setIdeas(prev => prev.map(i => i.id === fresh.id ? fresh : i));
      }
    } catch (e) { } finally { setAiLoading(''); }
  };

  const sendMentor = async () => {
    if (!mentorInput.trim() || mentorLoading) return;
    const msg = mentorInput.trim(); setMentorInput('');
    setMentorMessages(prev => [...prev, { role: 'user', text: msg }]);
    setMentorLoading(true);
    try {
      const context = selectedIdea ? `Idea: ${selectedIdea.title}. ${selectedIdea.problem_statement}` : '';
      const r = await fetch(`${API}/api/innovation/mentor`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ message: msg, context }) });
      if (r.ok) { const d = await r.json(); setMentorMessages(prev => [...prev, { role: 'ai', text: d.response }]); }
    } catch (e) { } finally { setMentorLoading(false); }
  };

  const generateIdeas = async () => {
    setGenLoading(true);
    try {
      const r = await fetch(`${API}/api/innovation/generate-idea`, { method: 'POST', headers: authHeader(), body: JSON.stringify(genForm) });
      if (r.ok) { const d = await r.json(); setGenIdeas(d.ideas || []); }
    } catch (e) { } finally { setGenLoading(false); }
  };

  const useGeneratedIdea = (idea) => {
    setIdeaForm({ title: idea.title, problem_statement: idea.problem, solution: idea.solution, target_audience: idea.targetAudience, industry: genForm.industry, country: '', tech_stack: '' });
    setShowGenerator(false); setShowNewIdea(true);
  };

  const openIdea = (idea) => { setSelectedIdea(idea); setActiveView('evaluate'); };

  // ─── RENDER SECTIONS ───────────────────────────────────────

  const renderDashboard = () => (
    <div className="hub-dashboard">
      <div className="hub-hero">
        <div className="hub-hero-content">
          <div className="hub-hero-badge">🚀 AI Innovation Hub</div>
          <h1>Imagine • Build • Validate • Launch</h1>
          <p>Transform your startup idea into a market-ready business with AI-powered evaluation, market research, financial modeling, and investor-ready pitch decks.</p>
          <div className="hub-hero-actions">
            <button className="btn-primary-hero" onClick={() => setShowNewIdea(true)}>
              <span>💡</span> New Startup Idea
            </button>
            <button className="btn-secondary-hero" onClick={() => setShowGenerator(true)}>
              <span>✨</span> Generate AI Ideas
            </button>
            <button className="btn-ghost-hero" onClick={() => setShowMentor(true)}>
              <span>🤖</span> AI Mentor
            </button>
          </div>
        </div>
        <div className="hub-hero-stats">
          <div className="hero-stat"><span className="hero-stat-num">{ideas.length}</span><span>Ideas Created</span></div>
          <div className="hero-stat"><span className="hero-stat-num">{ideas.filter(i => i.ai_evaluation).length}</span><span>AI Evaluated</span></div>
          <div className="hero-stat"><span className="hero-stat-num">{ideas.filter(i => i.pitch_deck).length}</span><span>Pitch Ready</span></div>
          <div className="hero-stat"><span className="hero-stat-num">{ideas.length > 0 ? Math.round(ideas.reduce((a, i) => a + (i.innovation_score || 0), 0) / ideas.length) : 0}</span><span>Avg Score</span></div>
        </div>
      </div>

      <div className="hub-pipeline-overview">
        <h2>🗺️ Startup Journey Pipeline</h2>
        <div className="pipeline-steps">
          {['Idea Submission', 'AI Evaluation', 'Market Research', 'Business Model', 'Financial Plan', 'MVP Plan', 'Pitch Deck', '🚀 Launch'].map((step, i) => (
            <div key={i} className="pipeline-step-item">
              <div className="pipeline-step-num">{i + 1}</div>
              <div className="pipeline-step-name">{step}</div>
              {i < 7 && <div className="pipeline-step-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="hub-ideas-section">
        <div className="hub-section-header">
          <h2>💼 My Startup Ideas</h2>
          <button className="btn-create" onClick={() => setShowNewIdea(true)}>+ New Idea</button>
        </div>
        {loading ? (
          <div className="hub-loading"><div className="spinner" /><p>Loading ideas...</p></div>
        ) : ideas.length === 0 ? (
          <div className="hub-empty">
            <div className="hub-empty-icon">💡</div>
            <h3>No startup ideas yet</h3>
            <p>Click "New Startup Idea" to begin your entrepreneurial journey</p>
            <button className="btn-primary-hero" onClick={() => setShowNewIdea(true)}>Create First Idea</button>
          </div>
        ) : (
          <div className="ideas-grid">
            {ideas.map(idea => (
              <div key={idea.id} className="idea-card" onClick={() => openIdea(idea)}>
                <div className="idea-card-header">
                  <div className="idea-card-industry">{idea.industry}</div>
                  <StatusBadge status={idea.status} />
                </div>
                <h3 className="idea-card-title">{idea.title}</h3>
                <p className="idea-card-problem">{idea.problem_statement || 'No problem statement yet'}</p>
                {idea.ai_evaluation && (
                  <div className="idea-card-scores">
                    <div className="mini-score"><span className="score-dot" style={{ background: '#8b5cf6' }} /><span>Innovation {idea.innovation_score}/100</span></div>
                    <div className="mini-score"><span className="score-dot" style={{ background: '#06b6d4' }} /><span>Market {idea.market_score}/100</span></div>
                  </div>
                )}
                <ProgressPipeline idea={idea} />
                <div className="idea-card-footer">
                  <span>📅 {new Date(idea.created_at).toLocaleDateString()}</span>
                  <button className="btn-open-idea">Open →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hub-features">
        <h2>🛠️ What You Can Do</h2>
        <div className="features-grid">
          {[
            { icon: '🤖', title: 'AI Idea Evaluation', desc: 'Get scored across 10 dimensions: innovation, market potential, technical complexity, and investor attractiveness.' },
            { icon: '📊', title: 'Market Research', desc: 'Discover TAM/SAM/SOM, customer segments, pain points, trends, and growth opportunities.' },
            { icon: '🏗️', title: 'Business Model Canvas', desc: 'AI-generated value propositions, revenue streams, channels, partnerships and go-to-market strategy.' },
            { icon: '💰', title: 'Financial Planning', desc: 'Startup cost analysis, monthly burn rate, revenue projections, and unit economics (CAC/LTV).' },
            { icon: '🚀', title: 'MVP Planner', desc: 'Feature prioritization, tech stack recommendations, team requirements, and 3-phase development roadmap.' },
            { icon: '🎯', title: 'Pitch Deck Generator', desc: '12-slide investor-ready pitch deck with elevator pitch and cold email template.' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvaluate = () => {
    const ev = selectedIdea?.ai_evaluation;
    return (
      <div className="hub-section">
        <div className="section-header-row">
          <div>
            <h2>🤖 AI Evaluation</h2>
            <p className="section-subtitle">Comprehensive startup scoring across 10 dimensions</p>
          </div>
          <button className="btn-ai-run" onClick={() => runAI('evaluate', 'evaluate')} disabled={!!aiLoading}>
            {aiLoading === 'evaluate' ? <><div className="spinner-sm" /> Evaluating...</> : '🤖 Run AI Evaluation'}
          </button>
        </div>

        {!ev ? (
          <div className="ai-empty">
            <div className="ai-empty-icon">🤖</div>
            <h3>Ready to evaluate your idea</h3>
            <p>Our AI will score your startup across innovation, market potential, technical complexity, scalability, and investor attractiveness.</p>
            <button className="btn-ai-run-lg" onClick={() => runAI('evaluate', 'evaluate')} disabled={!!aiLoading}>
              {aiLoading === 'evaluate' ? <><div className="spinner-sm" /> Evaluating...</> : '🚀 Start Evaluation'}
            </button>
          </div>
        ) : (
          <div className="eval-container">
            <div className="eval-overall">
              <div className="eval-score-big">
                <div className="eval-score-circle" style={{ background: `conic-gradient(#8b5cf6 ${ev.overallScore * 3.6}deg, rgba(255,255,255,0.06) 0)` }}>
                  <div className="eval-score-inner">
                    <span className="eval-score-num">{ev.overallScore}</span>
                    <span className="eval-score-label">/ 100</span>
                  </div>
                </div>
                <div className="eval-score-info">
                  <h3>Overall Score</h3>
                  <p className="eval-verdict">{ev.verdict}</p>
                  <div className="eval-tags">
                    {ev.fundingStage && <span className="eval-tag">{ev.fundingStage}</span>}
                    {ev.timeToMarket && <span className="eval-tag">⏱ {ev.timeToMarket}</span>}
                    {ev.potentialValuation && <span className="eval-tag">💰 {ev.potentialValuation}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="eval-scores-grid">
              {ev.scores && Object.entries(ev.scores).map(([key, val]) => {
                const labels = { innovation: 'Innovation', originality: 'Originality', technicalComplexity: 'Tech Complexity', businessPotential: 'Business Potential', scalability: 'Scalability', marketDemand: 'Market Demand', competitiveAdvantage: 'Competitive Adv.', monetizationPotential: 'Monetization', socialImpact: 'Social Impact', investmentAttractiveness: 'Investment Attract.' };
                const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#3b82f6', '#14b8a6', '#f97316', '#a78bfa'];
                const idx = Object.keys(ev.scores).indexOf(key);
                return <ScoreRing key={key} score={val} label={labels[key] || key} color={colors[idx % colors.length]} />;
              })}
            </div>

            <div className="eval-swot">
              {[
                { title: '💪 Strengths', items: ev.strengths, color: '#10b981' },
                { title: '⚠️ Weaknesses', items: ev.weaknesses, color: '#ef4444' },
                { title: '🌟 Opportunities', items: ev.opportunities, color: '#f59e0b' },
                { title: '🛡️ Threats', items: ev.threats, color: '#6b7280' },
              ].map(s => (
                <div key={s.title} className="swot-card" style={{ borderTop: `3px solid ${s.color}` }}>
                  <h4>{s.title}</h4>
                  <ul>{(s.items || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              ))}
            </div>

            {ev.recommendations && (
              <div className="eval-recs">
                <h3>🎯 AI Recommendations</h3>
                <div className="recs-list">
                  {ev.recommendations.map((r, i) => (
                    <div key={i} className="rec-item"><span className="rec-num">{i + 1}</span><span>{r}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMarket = () => {
    const mkt = selectedIdea?.market_research;
    return (
      <div className="hub-section">
        <div className="section-header-row">
          <div><h2>📊 Market Research</h2><p className="section-subtitle">TAM, SAM, SOM, trends & customer insights</p></div>
          <button className="btn-ai-run" onClick={() => runAI('market-research', 'market')} disabled={!!aiLoading}>
            {aiLoading === 'market' ? <><div className="spinner-sm" /> Researching...</> : '📊 Run Market Research'}
          </button>
        </div>
        {!mkt ? (
          <div className="ai-empty">
            <div className="ai-empty-icon">📊</div>
            <h3>Ready for market analysis</h3>
            <p>Get comprehensive market sizing, customer segments, industry trends, and growth opportunities.</p>
            <button className="btn-ai-run-lg" onClick={() => runAI('market-research', 'market')} disabled={!!aiLoading}>
              {aiLoading === 'market' ? <><div className="spinner-sm" /> Researching...</> : '📊 Start Market Research'}
            </button>
          </div>
        ) : (
          <div className="market-container">
            <div className="market-tam">
              {[
                { label: 'TAM', sublabel: 'Total Addressable Market', value: mkt.tam, color: '#8b5cf6', icon: '🌍' },
                { label: 'SAM', sublabel: 'Serviceable Addressable Market', value: mkt.sam, color: '#06b6d4', icon: '🎯' },
                { label: 'SOM', sublabel: 'Obtainable Market (Year 1)', value: mkt.som, color: '#10b981', icon: '💎' },
              ].map(m => (
                <div key={m.label} className="tam-card" style={{ borderBottom: `3px solid ${m.color}` }}>
                  <span className="tam-icon">{m.icon}</span>
                  <div className="tam-label">{m.label}</div>
                  <div className="tam-value" style={{ color: m.color }}>{m.value}</div>
                  <div className="tam-sublabel">{m.sublabel}</div>
                </div>
              ))}
              <div className="tam-card" style={{ borderBottom: '3px solid #f59e0b' }}>
                <span className="tam-icon">📈</span>
                <div className="tam-label">Growth Rate</div>
                <div className="tam-value" style={{ color: '#f59e0b' }}>{mkt.growthRate}</div>
                <div className="tam-sublabel">Annual CAGR</div>
              </div>
            </div>

            <div className="market-two-col">
              <div className="market-box">
                <h3>🔥 Market Trends</h3>
                <ul className="market-list">{(mkt.marketTrends || []).map((t, i) => <li key={i}><span className="list-bullet" />  {t}</li>)}</ul>
              </div>
              <div className="market-box">
                <h3>😤 Customer Pain Points</h3>
                <ul className="market-list">{(mkt.painPoints || []).map((p, i) => <li key={i}><span className="list-bullet red" />  {p}</li>)}</ul>
              </div>
            </div>

            {mkt.customerSegments && (
              <div className="market-box">
                <h3>👥 Customer Segments</h3>
                <div className="segments-grid">
                  {mkt.customerSegments.map((s, i) => (
                    <div key={i} className="segment-card">
                      <div className="segment-header">
                        <span className="segment-name">{s.name}</span>
                        <span className={`segment-willingness ${s.willingness?.toLowerCase()}`}>{s.willingness}</span>
                      </div>
                      <p>{s.description}</p>
                      <span className="segment-size">Size: {s.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mkt.customerPersonas && (
              <div className="market-box">
                <h3>🧑 Customer Personas</h3>
                <div className="personas-grid">
                  {mkt.customerPersonas.map((p, i) => (
                    <div key={i} className="persona-card">
                      <div className="persona-avatar">{p.name?.charAt(0)}</div>
                      <div className="persona-info">
                        <h4>{p.name}</h4>
                        <p className="persona-meta">{p.age} • {p.occupation}</p>
                        <p className="persona-goal">🎯 {p.goals}</p>
                        <p className="persona-frustration">😤 {p.frustrations}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="market-two-col">
              <div className="market-box">
                <h3>🌍 Geographic Opportunities</h3>
                <div className="geo-tags">{(mkt.geographicOpportunities || []).map((g, i) => <span key={i} className="geo-tag">{g}</span>)}</div>
              </div>
              <div className="market-box">
                <h3>⚡ Emerging Technologies</h3>
                <div className="geo-tags">{(mkt.emergingTechnologies || []).map((t, i) => <span key={i} className="geo-tag tech">{t}</span>)}</div>
              </div>
            </div>

            {mkt.industryOutlook && (
              <div className="market-outlook">
                <h3>🔭 Industry Outlook</h3>
                <p>{mkt.industryOutlook}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBusiness = () => {
    const bm = selectedIdea?.business_model;
    return (
      <div className="hub-section">
        <div className="section-header-row">
          <div><h2>🏗️ Business Model Canvas</h2><p className="section-subtitle">AI-generated strategic framework</p></div>
          <button className="btn-ai-run" onClick={() => runAI('business-model', 'business')} disabled={!!aiLoading}>
            {aiLoading === 'business' ? <><div className="spinner-sm" /> Generating...</> : '🏗️ Generate Business Model'}
          </button>
        </div>
        {!bm ? (
          <div className="ai-empty">
            <div className="ai-empty-icon">🏗️</div>
            <h3>Generate your Business Model Canvas</h3>
            <p>AI will create your value propositions, revenue streams, channels, partnerships, and go-to-market strategy.</p>
            <button className="btn-ai-run-lg" onClick={() => runAI('business-model', 'business')} disabled={!!aiLoading}>
              {aiLoading === 'business' ? <><div className="spinner-sm" /> Generating...</> : '🏗️ Generate Business Model'}
            </button>
          </div>
        ) : (
          <div className="bm-container">
            <div className="bm-canvas">
              {bm.canvas && Object.entries({
                '💎 Value Propositions': bm.canvas.valuePropositions,
                '👥 Customer Segments': bm.canvas.customerSegments,
                '📣 Channels': bm.canvas.channels,
                '❤️ Customer Relationships': bm.canvas.customerRelationships,
                '💰 Revenue Streams': bm.canvas.revenueStreams,
                '🔑 Key Resources': bm.canvas.keyResources,
                '⚡ Key Activities': bm.canvas.keyActivities,
                '🤝 Key Partners': bm.canvas.keyPartners,
                '💸 Cost Structure': bm.canvas.costStructure,
              }).map(([key, items]) => (
                <div key={key} className="canvas-block">
                  <h4>{key}</h4>
                  <ul>{(items || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              ))}
            </div>

            {bm.revenueModel && (
              <div className="bm-box">
                <h3>💰 Revenue Model</h3>
                <p>{bm.revenueModel}</p>
              </div>
            )}
            {bm.pricingStrategy && (
              <div className="bm-box">
                <h3>🏷️ Pricing Strategy</h3>
                <p>{bm.pricingStrategy}</p>
              </div>
            )}
            {bm.goToMarket && (
              <div className="bm-box">
                <h3>🚀 Go-To-Market Strategy</h3>
                <div className="gtm-steps">
                  {bm.goToMarket.map((step, i) => (
                    <div key={i} className="gtm-step">
                      <span className="gtm-num">{i + 1}</span><span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {bm.growthPlan && (
              <div className="bm-box">
                <h3>📈 Growth Plan</h3>
                <div className="growth-steps">
                  {bm.growthPlan.map((m, i) => (
                    <div key={i} className="growth-milestone">
                      <div className="growth-dot" /><span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFinancial = () => {
    const fp = selectedIdea?.financial_plan;
    return (
      <div className="hub-section">
        <div className="section-header-row">
          <div><h2>💰 Financial Plan</h2><p className="section-subtitle">Cost analysis, projections & unit economics</p></div>
          <button className="btn-ai-run" onClick={() => runAI('financial-plan', 'financial')} disabled={!!aiLoading}>
            {aiLoading === 'financial' ? <><div className="spinner-sm" /> Planning...</> : '💰 Generate Financial Plan'}
          </button>
        </div>
        {!fp ? (
          <div className="ai-empty">
            <div className="ai-empty-icon">💰</div>
            <h3>Generate your Financial Plan</h3>
            <p>Get startup cost analysis, monthly burn rate, revenue projections, unit economics, and funding requirements.</p>
            <button className="btn-ai-run-lg" onClick={() => runAI('financial-plan', 'financial')} disabled={!!aiLoading}>
              {aiLoading === 'financial' ? <><div className="spinner-sm" /> Planning...</> : '💰 Generate Financial Plan'}
            </button>
          </div>
        ) : (
          <div className="fin-container">
            <div className="fin-kpis">
              {[
                { label: 'Monthly Burn', value: `$${fp.monthlyBurnRate?.toLocaleString()}`, icon: '🔥', color: '#ef4444' },
                { label: 'Funding Required', value: `$${fp.fundingRequired?.toLocaleString()}`, icon: '💵', color: '#f59e0b' },
                { label: 'Break-Even', value: `Month ${fp.breakEvenMonths}`, icon: '⚖️', color: '#10b981' },
                { label: 'Valuation', value: fp.valuation, icon: '📈', color: '#8b5cf6' },
              ].map(k => (
                <div key={k.label} className="fin-kpi" style={{ borderLeft: `4px solid ${k.color}` }}>
                  <span className="fin-kpi-icon">{k.icon}</span>
                  <div>
                    <div className="fin-kpi-val" style={{ color: k.color }}>{k.value}</div>
                    <div className="fin-kpi-label">{k.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="fin-two-col">
              {fp.startupCosts && (
                <div className="fin-box">
                  <h3>🏗️ Startup Costs</h3>
                  <div className="cost-table">
                    {fp.startupCosts.map((c, i) => (
                      <div key={i} className="cost-row">
                        <span>{c.item}</span>
                        <span className="cost-amount">${c.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="cost-row total">
                      <span>Total</span>
                      <span className="cost-amount">${fp.startupCosts.reduce((s, c) => s + (c.amount || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {fp.unitEconomics && (
                <div className="fin-box">
                  <h3>📐 Unit Economics</h3>
                  <div className="unit-grid">
                    <div className="unit-item"><span>CAC</span><strong>${fp.unitEconomics.cac}</strong></div>
                    <div className="unit-item"><span>LTV</span><strong>${fp.unitEconomics.ltv}</strong></div>
                    <div className="unit-item"><span>LTV:CAC</span><strong>{fp.unitEconomics.ltvCacRatio}:1</strong></div>
                    <div className="unit-item"><span>Payback</span><strong>{fp.unitEconomics.paybackPeriod}</strong></div>
                  </div>
                  {fp.fundingUse && (
                    <>
                      <h4 style={{ marginTop: '1rem' }}>Fund Allocation</h4>
                      {Object.entries(fp.fundingUse).map(([k, v]) => (
                        <div key={k} className="fund-bar-row">
                          <span className="fund-bar-label">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <div className="fund-bar"><div className="fund-bar-fill" style={{ width: `${v}%` }} /></div>
                          <span className="fund-bar-pct">{v}%</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {fp.revenueProjection && (
              <div className="fin-box">
                <h3>📈 Revenue Projections</h3>
                <div className="rev-grid">
                  {fp.revenueProjection.map((r, i) => (
                    <div key={i} className="rev-card">
                      <div className="rev-month">{r.month}</div>
                      <div className="rev-revenue">${r.revenue?.toLocaleString()}</div>
                      <div className="rev-users">{r.users?.toLocaleString()} users</div>
                      <div className="rev-bar"><div className="rev-bar-fill" style={{ width: `${Math.min(100, (r.revenue / Math.max(...fp.revenueProjection.map(x => x.revenue))) * 100)}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMVP = () => {
    const mvp = selectedIdea?.mvp_plan;
    return (
      <div className="hub-section">
        <div className="section-header-row">
          <div><h2>🚀 MVP Plan</h2><p className="section-subtitle">Features, tech stack & development roadmap</p></div>
          <button className="btn-ai-run" onClick={() => runAI('mvp-plan', 'mvp')} disabled={!!aiLoading}>
            {aiLoading === 'mvp' ? <><div className="spinner-sm" /> Planning...</> : '🚀 Generate MVP Plan'}
          </button>
        </div>
        {!mvp ? (
          <div className="ai-empty">
            <div className="ai-empty-icon">🚀</div>
            <h3>Plan your MVP</h3>
            <p>Get feature prioritization, recommended tech stack, team requirements, and a 3-phase development roadmap.</p>
            <button className="btn-ai-run-lg" onClick={() => runAI('mvp-plan', 'mvp')} disabled={!!aiLoading}>
              {aiLoading === 'mvp' ? <><div className="spinner-sm" /> Planning...</> : '🚀 Generate MVP Plan'}
            </button>
          </div>
        ) : (
          <div className="mvp-container">
            <div className="mvp-meta-kpis">
              <div className="mvp-kpi"><span>⏱️</span><strong>{mvp.estimatedTimeline}</strong><span>Timeline</span></div>
              <div className="mvp-kpi"><span>💰</span><strong>{mvp.estimatedCost}</strong><span>Estimated Cost</span></div>
              <div className="mvp-kpi"><span>👥</span><strong>{mvp.teamRequired?.length}</strong><span>Team Members</span></div>
            </div>

            {mvp.coreFeatures && (
              <div className="mvp-box">
                <h3>⚡ Core Features</h3>
                <div className="features-table">
                  {mvp.coreFeatures.map((f, i) => (
                    <div key={i} className="feat-row">
                      <span className={`feat-priority ${f.priority?.toLowerCase().replace('-', '')}`}>{f.priority}</span>
                      <div className="feat-info">
                        <strong>{f.name}</strong>
                        <span>{f.description}</span>
                      </div>
                      <span className="feat-effort">{f.effort}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mvp.roadmap && (
              <div className="mvp-box">
                <h3>🗺️ Development Roadmap</h3>
                <div className="roadmap-phases">
                  {mvp.roadmap.map((phase, i) => (
                    <div key={i} className="roadmap-phase">
                      <div className="phase-header">
                        <span className="phase-num">{i + 1}</span>
                        <div>
                          <strong>{phase.phase}</strong>
                          <span className="phase-duration">{phase.duration}</span>
                        </div>
                      </div>
                      <ul className="phase-deliverables">
                        {(phase.deliverables || []).map((d, j) => <li key={j}>{d}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mvp-two-col">
              {mvp.techStack && (
                <div className="mvp-box">
                  <h3>💻 Tech Stack</h3>
                  {Object.entries(mvp.techStack).map(([cat, techs]) => (
                    <div key={cat} className="tech-cat">
                      <span className="tech-cat-label">{cat}</span>
                      <div className="tech-tags">{(techs || []).map((t, i) => <span key={i} className="tech-tag">{t}</span>)}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mvp-box">
                {mvp.teamRequired && (
                  <>
                    <h3>👥 Team Required</h3>
                    <div className="team-list">
                      {mvp.teamRequired.map((m, i) => <div key={i} className="team-member"><span>👤</span>{m}</div>)}
                    </div>
                  </>
                )}
                {mvp.securityChecklist && (
                  <>
                    <h3 style={{ marginTop: '1rem' }}>🔒 Security Checklist</h3>
                    {mvp.securityChecklist.map((s, i) => <div key={i} className="security-item"><span>✅</span>{s}</div>)}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPitch = () => {
    const pd = selectedIdea?.pitch_deck;
    return (
      <div className="hub-section">
        <div className="section-header-row">
          <div><h2>🎯 Pitch Deck</h2><p className="section-subtitle">12-slide investor-ready presentation</p></div>
          <button className="btn-ai-run" onClick={() => runAI('pitch-deck', 'pitch')} disabled={!!aiLoading}>
            {aiLoading === 'pitch' ? <><div className="spinner-sm" /> Generating...</> : '🎯 Generate Pitch Deck'}
          </button>
        </div>
        {!pd ? (
          <div className="ai-empty">
            <div className="ai-empty-icon">🎯</div>
            <h3>Generate your Investor Pitch Deck</h3>
            <p>Get a professional 12-slide pitch deck with elevator pitch and cold outreach email template for investors.</p>
            <button className="btn-ai-run-lg" onClick={() => runAI('pitch-deck', 'pitch')} disabled={!!aiLoading}>
              {aiLoading === 'pitch' ? <><div className="spinner-sm" /> Generating...</> : '🎯 Generate Pitch Deck'}
            </button>
          </div>
        ) : (
          <div className="pitch-container">
            {pd.elevatorPitch && (
              <div className="pitch-elevator">
                <h3>🎤 Elevator Pitch (30 seconds)</h3>
                <p>{pd.elevatorPitch}</p>
              </div>
            )}

            {pd.slides && (
              <div className="slides-grid">
                {pd.slides.map((slide) => (
                  <div key={slide.slide} className="slide-card">
                    <div className="slide-num">Slide {slide.slide}</div>
                    <h4 className="slide-title">{slide.title}</h4>
                    <p className="slide-heading">{slide.heading}</p>
                    <ul className="slide-bullets">
                      {(slide.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                    <div className="slide-visual">📐 {slide.visualSuggestion}</div>
                  </div>
                ))}
              </div>
            )}

            {pd.investorEmail && (
              <div className="pitch-email">
                <h3>📧 Investor Cold Email Template</h3>
                <pre className="email-content">{pd.investorEmail}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="innovation-hub">
      {/* Header */}
      <div className="hub-topbar">
        <div className="hub-topbar-left">
          <div className="hub-brand">
            <span className="hub-brand-icon">🚀</span>
            <span className="hub-brand-name">AI Innovation Hub</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)', background: 'rgba(139,92,246,0.1)', padding: '0.2rem 0.65rem', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.2)' }}>
            Imagine • Build • Validate • Launch
          </span>
        </div>
        <div className="hub-topbar-right">
          <button className="hub-mentor-btn" onClick={() => setShowMentor(true)}>🤖 AI Mentor</button>
          <button className="hub-gen-btn" onClick={() => setShowGenerator(true)}>✨ Generate Ideas</button>
        </div>
      </div>

      {/* Main layout */}
      <div className="hub-layout">
        {/* Sidebar */}
        <div className="hub-sidebar">
          {STEPS.map(step => (
            <button
              key={step.id}
              className={`hub-nav-item ${activeView === step.id ? 'active' : ''} ${step.id !== 'dashboard' && !selectedIdea ? 'disabled' : ''}`}
              onClick={() => {
                if (step.id === 'dashboard' || selectedIdea) setActiveView(step.id);
              }}
            >
              <span className="hub-nav-icon">{step.icon}</span>
              <span className="hub-nav-label">{step.label}</span>
              {step.id !== 'dashboard' && selectedIdea && selectedIdea[step.id === 'evaluate' ? 'ai_evaluation' : step.id === 'market' ? 'market_research' : step.id === 'business' ? 'business_model' : step.id === 'financial' ? 'financial_plan' : step.id === 'mvp' ? 'mvp_plan' : step.id === 'pitch' ? 'pitch_deck' : null] && (
                <span className="hub-nav-check">✓</span>
              )}
            </button>
          ))}

          {selectedIdea && (
            <div className="hub-sidebar-idea">
              <div className="sidebar-idea-label">Current Idea</div>
              <div className="sidebar-idea-title">{selectedIdea.title}</div>
              <ProgressPipeline idea={selectedIdea} />
              <button className="sidebar-change-btn" onClick={() => { setSelectedIdea(null); setActiveView('dashboard'); }}>Change Idea</button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="hub-content">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'evaluate' && selectedIdea && renderEvaluate()}
          {activeView === 'market' && selectedIdea && renderMarket()}
          {activeView === 'business' && selectedIdea && renderBusiness()}
          {activeView === 'financial' && selectedIdea && renderFinancial()}
          {activeView === 'mvp' && selectedIdea && renderMVP()}
          {activeView === 'pitch' && selectedIdea && renderPitch()}
          {activeView !== 'dashboard' && !selectedIdea && (
            <div className="no-idea-selected">
              <div className="no-idea-icon">💡</div>
              <h3>No idea selected</h3>
              <p>Go to Dashboard and select or create a startup idea first.</p>
              <button className="btn-primary-hero" onClick={() => setActiveView('dashboard')}>← Back to Dashboard</button>
            </div>
          )}
        </div>
      </div>

      {/* New Idea Modal */}
      {showNewIdea && (
        <div className="modal-overlay" onClick={() => setShowNewIdea(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💡 New Startup Idea</h2>
              <button className="modal-close" onClick={() => setShowNewIdea(false)}>✕</button>
            </div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-form">
              <div className="form-group">
                <label>Startup Name / Title *</label>
                <input placeholder="e.g. AI Study Planner" value={ideaForm.title} onChange={e => setIdeaForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Problem Statement</label>
                <textarea rows={3} placeholder="What problem does your startup solve?" value={ideaForm.problem_statement} onChange={e => setIdeaForm(p => ({ ...p, problem_statement: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Your Solution</label>
                <textarea rows={3} placeholder="How does your product/service solve this problem?" value={ideaForm.solution} onChange={e => setIdeaForm(p => ({ ...p, solution: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Audience</label>
                  <input placeholder="e.g. College students aged 18-25" value={ideaForm.target_audience} onChange={e => setIdeaForm(p => ({ ...p, target_audience: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <select value={ideaForm.industry} onChange={e => setIdeaForm(p => ({ ...p, industry: e.target.value }))}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Country / Region</label>
                  <input placeholder="e.g. United States, Global" value={ideaForm.country} onChange={e => setIdeaForm(p => ({ ...p, country: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Tech Stack (optional)</label>
                  <input placeholder="e.g. React, Node.js, Python, AI" value={ideaForm.tech_stack} onChange={e => setIdeaForm(p => ({ ...p, tech_stack: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowNewIdea(false)}>Cancel</button>
              <button className="btn-create-idea" onClick={createIdea} disabled={loading}>
                {loading ? <><div className="spinner-sm" /> Creating...</> : '💡 Create & Evaluate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Idea Generator Modal */}
      {showGenerator && (
        <div className="modal-overlay" onClick={() => setShowGenerator(false)}>
          <div className="modal-box modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✨ AI Idea Generator</h2>
              <button className="modal-close" onClick={() => setShowGenerator(false)}>✕</button>
            </div>
            <div className="gen-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Industry</label>
                  <select value={genForm.industry} onChange={e => setGenForm(p => ({ ...p, industry: e.target.value }))}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Your Interests</label>
                  <input placeholder="e.g. AI, education, productivity" value={genForm.interests} onChange={e => setGenForm(p => ({ ...p, interests: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Your Skills</label>
                  <input placeholder="e.g. coding, design, marketing" value={genForm.skills} onChange={e => setGenForm(p => ({ ...p, skills: e.target.value }))} />
                </div>
              </div>
              <button className="btn-gen-ideas" onClick={generateIdeas} disabled={genLoading}>
                {genLoading ? <><div className="spinner-sm" /> Generating 3 Ideas...</> : '✨ Generate 3 AI Ideas'}
              </button>
            </div>
            {genIdeas.length > 0 && (
              <div className="gen-ideas-list">
                {genIdeas.map((idea, i) => (
                  <div key={i} className="gen-idea-card">
                    <div className="gen-idea-header">
                      <h3>{idea.title}</h3>
                      <span className={`gen-difficulty ${idea.difficulty?.toLowerCase()}`}>{idea.difficulty}</span>
                    </div>
                    <p className="gen-idea-problem"><strong>Problem:</strong> {idea.problem}</p>
                    <p className="gen-idea-solution"><strong>Solution:</strong> {idea.solution}</p>
                    <p className="gen-idea-meta">🎯 {idea.targetAudience} • 💰 {idea.potentialRevenue}</p>
                    <p className="gen-idea-angle">⚡ {idea.uniqueAngle}</p>
                    <button className="btn-use-idea" onClick={() => useGeneratedIdea(idea)}>Use This Idea →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Mentor Modal */}
      {showMentor && (
        <div className="modal-overlay" onClick={() => setShowMentor(false)}>
          <div className="modal-box modal-chat" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="mentor-header-info">
                <div className="mentor-avatar">🤖</div>
                <div>
                  <h2>Friday AI Mentor</h2>
                  <span className="mentor-online">● Online</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowMentor(false)}>✕</button>
            </div>
            <div className="mentor-messages">
              {mentorMessages.map((msg, i) => (
                <div key={i} className={`mentor-msg ${msg.role}`}>
                  {msg.role === 'ai' && <div className="msg-avatar">🤖</div>}
                  <div className="msg-bubble">{msg.text}</div>
                  {msg.role === 'user' && <div className="msg-avatar user-av">👤</div>}
                </div>
              ))}
              {mentorLoading && (
                <div className="mentor-msg ai">
                  <div className="msg-avatar">🤖</div>
                  <div className="msg-bubble typing"><span /><span /><span /></div>
                </div>
              )}
              <div ref={mentorEndRef} />
            </div>
            <div className="mentor-input-row">
              <input
                value={mentorInput}
                onChange={e => setMentorInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMentor()}
                placeholder="Ask your mentor anything about startups..."
              />
              <button onClick={sendMentor} disabled={mentorLoading || !mentorInput.trim()}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
