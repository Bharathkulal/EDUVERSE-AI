import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './InnovationHub.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '') + '/api/innovation';

export default function InnovationHub() {
  const navigate = useNavigate();

  // Active view state
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, evaluation, market, bizmodel, finance, mvp, pitch
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  // Form State for New Idea
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    solution: '',
    target_audience: '',
    industry: 'Technology',
    country: 'Global'
  });

  // Pitch Deck Slide Index
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Mentor Chat State
  const [mentorInput, setMentorInput] = useState('');
  const [mentorChatHistory, setMentorChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Startup Incubator Director. Ask me anything about validating your idea, market sizing, pitch decks, or raising capital!' }
  ]);

  // Brainstorming Generator State
  const [genDomain, setGenDomain] = useState('Education & AI');
  const [genAudience, setGenAudience] = useState('Students & Teachers');
  const [genTrend, setGenTrend] = useState('Generative AI & Micro-learning');
  const [generatedIdeas, setGeneratedIdeas] = useState([]);

  // Fetch User's Startup Ideas on Load
  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/innovation/ideas');
      if (res.data && res.data.ideas) {
        setIdeas(res.data.ideas);
        if (res.data.ideas.length > 0 && !selectedIdea) {
          setSelectedIdea(res.data.ideas[0]);
        }
      }
    } catch (err) {
      console.error('Error loading startup ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create New Idea
  const handleCreateIdea = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.problem || !formData.solution) {
      toast.error('Please fill in the title, problem, and solution.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/innovation/ideas', formData);
      toast.success('Startup idea created successfully!');
      setShowNewModal(false);
      setFormData({ title: '', problem: '', solution: '', target_audience: '', industry: 'Technology', country: 'Global' });
      await fetchIdeas();
      if (res.data.idea) {
        setSelectedIdea(res.data.idea);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating startup idea');
    } finally {
      setLoading(false);
    }
  };

  // Trigger AI Idea Evaluation
  const handleRunEvaluation = async () => {
    if (!selectedIdea) return;
    try {
      setAiLoading(true);
      toast.loading('AI Incubator evaluating startup feasibility...', { id: 'eval' });
      const res = await api.post('/innovation/evaluate', {
        idea_id: selectedIdea.id,
        title: selectedIdea.title,
        problem: selectedIdea.problem,
        solution: selectedIdea.solution,
        target_audience: selectedIdea.target_audience,
        industry: selectedIdea.industry,
        country: selectedIdea.country
      });

      toast.success('AI Evaluation complete!', { id: 'eval' });
      const updatedData = { ...selectedIdea, evaluation_data: res.data.evaluation, status: 'evaluated', overall_score: res.data.evaluation.overallScore };
      setSelectedIdea(updatedData);
      setIdeas(ideas.map(i => i.id === updatedData.id ? updatedData : i));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed', { id: 'eval' });
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Market Research
  const handleGenerateMarket = async () => {
    if (!selectedIdea) return;
    try {
      setAiLoading(true);
      toast.loading('Analyzing market TAM/SAM/SOM & competitors...', { id: 'mkt' });
      const res = await api.post('/innovation/generate-market', {
        idea_id: selectedIdea.id,
        title: selectedIdea.title,
        problem: selectedIdea.problem,
        solution: selectedIdea.solution,
        industry: selectedIdea.industry,
        country: selectedIdea.country
      });
      toast.success('Market research generated!', { id: 'mkt' });
      const updated = { ...selectedIdea, market_data: res.data.marketData };
      setSelectedIdea(updated);
      setIdeas(ideas.map(i => i.id === updated.id ? updated : i));
    } catch (err) {
      toast.error('Failed to generate market research', { id: 'mkt' });
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Business Model Canvas
  const handleGenerateBizModel = async () => {
    if (!selectedIdea) return;
    try {
      setAiLoading(true);
      toast.loading('Structuring Business Model Canvas...', { id: 'bm' });
      const res = await api.post('/innovation/generate-bizmodel', {
        idea_id: selectedIdea.id,
        title: selectedIdea.title,
        problem: selectedIdea.problem,
        solution: selectedIdea.solution,
        industry: selectedIdea.industry
      });
      toast.success('Business Model Canvas complete!', { id: 'bm' });
      const updated = { ...selectedIdea, bizmodel_data: res.data.bizModel };
      setSelectedIdea(updated);
      setIdeas(ideas.map(i => i.id === updated.id ? updated : i));
    } catch (err) {
      toast.error('Failed to generate business model', { id: 'bm' });
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Financial Plan
  const handleGenerateFinance = async () => {
    if (!selectedIdea) return;
    try {
      setAiLoading(true);
      toast.loading('Calculating 3-Year Financial Model...', { id: 'fin' });
      const res = await api.post('/innovation/generate-finance', {
        idea_id: selectedIdea.id,
        title: selectedIdea.title,
        solution: selectedIdea.solution,
        industry: selectedIdea.industry
      });
      toast.success('Financial model generated!', { id: 'fin' });
      const updated = { ...selectedIdea, finance_data: res.data.financeData };
      setSelectedIdea(updated);
      setIdeas(ideas.map(i => i.id === updated.id ? updated : i));
    } catch (err) {
      toast.error('Failed to generate financial plan', { id: 'fin' });
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger MVP Roadmap
  const handleGenerateMVP = async () => {
    if (!selectedIdea) return;
    try {
      setAiLoading(true);
      toast.loading('Planning MVP scope & Tech Stack...', { id: 'mvp' });
      const res = await api.post('/innovation/generate-mvp', {
        idea_id: selectedIdea.id,
        title: selectedIdea.title,
        problem: selectedIdea.problem,
        solution: selectedIdea.solution
      });
      toast.success('MVP roadmap generated!', { id: 'mvp' });
      const updated = { ...selectedIdea, mvp_data: res.data.mvpData };
      setSelectedIdea(updated);
      setIdeas(ideas.map(i => i.id === updated.id ? updated : i));
    } catch (err) {
      toast.error('Failed to generate MVP roadmap', { id: 'mvp' });
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Pitch Deck
  const handleGeneratePitch = async () => {
    if (!selectedIdea) return;
    try {
      setAiLoading(true);
      toast.loading('Building 10-Slide Pitch Deck...', { id: 'pitch' });
      const res = await api.post('/innovation/generate-pitch', {
        idea_id: selectedIdea.id,
        title: selectedIdea.title,
        problem: selectedIdea.problem,
        solution: selectedIdea.solution,
        industry: selectedIdea.industry,
        country: selectedIdea.country
      });
      toast.success('Pitch deck generated!', { id: 'pitch' });
      const updated = { ...selectedIdea, pitch_data: res.data.pitchData };
      setSelectedIdea(updated);
      setIdeas(ideas.map(i => i.id === updated.id ? updated : i));
      setActiveSlideIdx(0);
    } catch (err) {
      toast.error('Failed to generate pitch deck', { id: 'pitch' });
    } finally {
      setAiLoading(false);
    }
  };

  // Brainstorming Ideas Generator
  const handleGenerateBrainstormIdeas = async () => {
    try {
      setAiLoading(true);
      toast.loading('Generating innovative startup ideas...', { id: 'brain' });
      const res = await api.post('/innovation/generate-ideas', {
        domain: genDomain,
        targetAudience: genAudience,
        trend: genTrend
      });
      toast.success('Ideas generated!', { id: 'brain' });
      setGeneratedIdeas(res.data.ideas || []);
    } catch (err) {
      toast.error('Failed to generate ideas', { id: 'brain' });
    } finally {
      setAiLoading(false);
    }
  };

  // Mentor Chat Submit
  const handleSendMentorMsg = async (e) => {
    e.preventDefault();
    if (!mentorInput.trim()) return;

    const userMsg = { role: 'user', content: mentorInput };
    setMentorChatHistory(prev => [...prev, userMsg]);
    setMentorInput('');

    try {
      const res = await api.post('/innovation/mentor-chat', {
        message: userMsg.content,
        context: selectedIdea ? { title: selectedIdea.title, problem: selectedIdea.problem, solution: selectedIdea.solution } : null,
        history: mentorChatHistory
      });

      setMentorChatHistory(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMentorChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to Incubator AI.' }]);
    }
  };

  // Parse JSON data safely
  const evalData = selectedIdea?.evaluation_data ? (typeof selectedIdea.evaluation_data === 'string' ? JSON.parse(selectedIdea.evaluation_data) : selectedIdea.evaluation_data) : null;
  const marketData = selectedIdea?.market_data ? (typeof selectedIdea.market_data === 'string' ? JSON.parse(selectedIdea.market_data) : selectedIdea.market_data) : null;
  const bizData = selectedIdea?.bizmodel_data ? (typeof selectedIdea.bizmodel_data === 'string' ? JSON.parse(selectedIdea.bizmodel_data) : selectedIdea.bizmodel_data) : null;
  const financeData = selectedIdea?.finance_data ? (typeof selectedIdea.finance_data === 'string' ? JSON.parse(selectedIdea.finance_data) : selectedIdea.finance_data) : null;
  const mvpData = selectedIdea?.mvp_data ? (typeof selectedIdea.mvp_data === 'string' ? JSON.parse(selectedIdea.mvp_data) : selectedIdea.mvp_data) : null;
  const pitchData = selectedIdea?.pitch_data ? (typeof selectedIdea.pitch_data === 'string' ? JSON.parse(selectedIdea.pitch_data) : selectedIdea.pitch_data) : null;

  return (
    <div className="innovation-hub">
      {/* COMPACT TOPBAR */}
      <div className="hub-topbar">
        <div className="hub-topbar-left">
          <div className="hub-brand">
            <span className="hub-brand-icon">🚀</span>
            <span className="hub-brand-name">AI Innovation Hub</span>
          </div>
        </div>
        <div className="hub-topbar-right">
          <button className="hub-mentor-btn" onClick={() => setShowMentorModal(true)}>🤖 AI Mentor</button>
          <button className="hub-gen-btn" onClick={() => setShowGeneratorModal(true)}>✨ Generate Ideas</button>
        </div>
      </div>

      <div className="hub-layout">
        {/* TAB NAVIGATION */}
        <div className="hub-nav-tabs">
          <button className={`hub-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </button>
          <button className={`hub-tab-item ${activeTab === 'evaluation' ? 'active' : ''}`} onClick={() => setActiveTab('evaluation')}>
            ⚡ Evaluation & SWOT
          </button>
          <button className={`hub-tab-item ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>
            📈 Market & Competitors
          </button>
          <button className={`hub-tab-item ${activeTab === 'bizmodel' ? 'active' : ''}`} onClick={() => setActiveTab('bizmodel')}>
            📋 Business Model
          </button>
          <button className={`hub-tab-item ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
            💰 Financial Projections
          </button>
          <button className={`hub-tab-item ${activeTab === 'mvp' ? 'active' : ''}`} onClick={() => setActiveTab('mvp')}>
            🛠 MVP & Tech Stack
          </button>
          <button className={`hub-tab-item ${activeTab === 'pitch' ? 'active' : ''}`} onClick={() => setActiveTab('pitch')}>
            🚀 Pitch Deck
          </button>
        </div>

        {/* MAIN TAB CONTENT */}
        <div className="hub-content">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="hub-hero-banner">
                <div>
                  <h1 className="hub-hero-title">Incubate Your Next Big Idea</h1>
                  <p className="hub-hero-sub">Transform raw concepts into investor-ready startups with AI feasibility scores, market sizing, financial projections, and 10-slide pitch decks.</p>
                </div>
                <button className="hub-primary-btn" onClick={() => setShowNewModal(true)}>
                  ✨ + New Startup Idea
                </button>
              </div>

              {/* Stats Overview */}
              <div className="hub-stats-grid">
                <div className="hub-stat-card">
                  <div className="hub-stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>💡</div>
                  <div>
                    <div className="hub-stat-val">{ideas.length}</div>
                    <div className="hub-stat-lbl">Startup Ideas</div>
                  </div>
                </div>
                <div className="hub-stat-card">
                  <div className="hub-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>🏆</div>
                  <div>
                    <div className="hub-stat-val">
                      {ideas.reduce((max, i) => i.overall_score > max ? i.overall_score : max, 0)}%
                    </div>
                    <div className="hub-stat-lbl">Highest VC Readiness</div>
                  </div>
                </div>
                <div className="hub-stat-card">
                  <div className="hub-stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>📊</div>
                  <div>
                    <div className="hub-stat-val">{ideas.filter(i => i.status === 'evaluated').length}</div>
                    <div className="hub-stat-lbl">Evaluated Ideas</div>
                  </div>
                </div>
                <div className="hub-stat-card">
                  <div className="hub-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>🤖</div>
                  <div>
                    <div className="hub-stat-val">Active</div>
                    <div className="hub-stat-lbl">Incubator AI</div>
                  </div>
                </div>
              </div>

              {/* Ideas List */}
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Your Innovation Pipeline</h2>
              {ideas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--hub-card-bg)', borderRadius: '16px', border: '1px solid var(--hub-border)' }}>
                  <p style={{ color: 'var(--hub-text-dim)', marginBottom: '1rem' }}>No startup ideas created yet. Start by creating an idea or using AI Brainstorming!</p>
                  <button className="hub-primary-btn" style={{ margin: '0 auto' }} onClick={() => setShowNewModal(true)}>+ Create First Idea</button>
                </div>
              ) : (
                <div className="hub-ideas-list">
                  {ideas.map(idea => (
                    <div
                      key={idea.id}
                      className={`hub-idea-card ${selectedIdea?.id === idea.id ? 'selected' : ''}`}
                      onClick={() => setSelectedIdea(idea)}
                    >
                      <div className="hub-idea-header">
                        <span className="hub-idea-title">{idea.title}</span>
                        <span className={`hub-badge ${idea.status === 'evaluated' ? 'hub-badge-evaluated' : 'hub-badge-draft'}`}>
                          {idea.status}
                        </span>
                      </div>
                      <p className="hub-idea-prob">{idea.problem}</p>
                      <div className="hub-idea-footer">
                        <span>{idea.industry} • {idea.country}</span>
                        {idea.overall_score > 0 && <span style={{ fontWeight: 700, color: 'var(--hub-purple-light)' }}>Score: {idea.overall_score}/100</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI EVALUATION */}
          {activeTab === 'evaluation' && (
            <div>
              {!selectedIdea ? (
                <p style={{ color: 'var(--hub-text-dim)' }}>Select or create an idea first.</p>
              ) : (
                <div>
                  <div className="hub-eval-header">
                    <div className="hub-score-ring" style={{ '--score': evalData?.overallScore || 0 }}>
                      <div className="hub-score-inner">
                        <span className="hub-score-num">{evalData?.overallScore || '--'}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--hub-text-muted)' }}>SCORE</span>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.3rem' }}>{selectedIdea.title}</h2>
                      <p style={{ color: 'var(--hub-purple-light)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Verdict: {evalData?.verdict || 'Awaiting AI Evaluation'}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--hub-text-dim)', lineHeight: 1.4 }}>
                        {evalData?.summary || selectedIdea.solution}
                      </p>
                    </div>
                    <button className="hub-primary-btn" onClick={handleRunEvaluation} disabled={aiLoading}>
                      {aiLoading ? 'Evaluating...' : '⚡ Run AI Evaluation'}
                    </button>
                  </div>

                  {evalData && (
                    <>
                      {/* SWOT Matrix */}
                      <div className="hub-swot-grid">
                        <div className="hub-swot-card hub-swot-s">
                          <div className="hub-swot-title" style={{ color: 'var(--hub-emerald)' }}>💪 Key Strengths</div>
                          <ul style={{ fontSize: '0.82rem', color: 'var(--hub-text-dim)', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                            {evalData.swot?.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                          </ul>
                        </div>
                        <div className="hub-swot-card hub-swot-w">
                          <div className="hub-swot-title" style={{ color: 'var(--hub-rose)' }}>⚠️ Weaknesses & Risks</div>
                          <ul style={{ fontSize: '0.82rem', color: 'var(--hub-text-dim)', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                            {evalData.swot?.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                          </ul>
                        </div>
                        <div className="hub-swot-card hub-swot-o">
                          <div className="hub-swot-title" style={{ color: 'var(--hub-cyan)' }}>🚀 Market Opportunities</div>
                          <ul style={{ fontSize: '0.82rem', color: 'var(--hub-text-dim)', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                            {evalData.swot?.opportunities?.map((o, idx) => <li key={idx}>{o}</li>)}
                          </ul>
                        </div>
                        <div className="hub-swot-card hub-swot-t">
                          <div className="hub-swot-title" style={{ color: 'var(--hub-amber)' }}>🛡️ Threats & Vulnerabilities</div>
                          <ul style={{ fontSize: '0.82rem', color: 'var(--hub-text-dim)', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                            {evalData.swot?.threats?.map((t, idx) => <li key={idx}>{t}</li>)}
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MARKET & COMPETITORS */}
          {activeTab === 'market' && (
            <div>
              {!selectedIdea ? <p>Select an idea first.</p> : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Market Intelligence & Sizing</h2>
                    <button className="hub-primary-btn" onClick={handleGenerateMarket} disabled={aiLoading}>
                      {aiLoading ? 'Generating...' : '📈 Generate Market Analysis'}
                    </button>
                  </div>

                  {marketData ? (
                    <div>
                      {/* TAM / SAM / SOM */}
                      <div className="hub-stats-grid" style={{ marginBottom: '1.5rem' }}>
                        <div className="hub-stat-card">
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--hub-purple-light)', fontWeight: 700 }}>TAM (Total Market)</div>
                            <div className="hub-stat-val" style={{ color: '#fff' }}>{marketData.tamSamSom?.tam}</div>
                          </div>
                        </div>
                        <div className="hub-stat-card">
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--hub-cyan)', fontWeight: 700 }}>SAM (Serviceable Market)</div>
                            <div className="hub-stat-val" style={{ color: '#fff' }}>{marketData.tamSamSom?.sam}</div>
                          </div>
                        </div>
                        <div className="hub-stat-card">
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--hub-emerald)', fontWeight: 700 }}>SOM (Obtainable Market)</div>
                            <div className="hub-stat-val" style={{ color: '#fff' }}>{marketData.tamSamSom?.som}</div>
                          </div>
                        </div>
                      </div>

                      {/* Competitors List */}
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Competitor Analysis</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {marketData.competitors?.map((comp, idx) => (
                          <div key={idx} style={{ background: 'var(--hub-card-bg)', border: '1px solid var(--hub-border)', borderRadius: '14px', padding: '1rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--hub-purple-light)' }}>{comp.name} ({comp.type})</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--hub-text-dim)', margin: '0.4rem 0' }}><strong>Strengths:</strong> {comp.strengths}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--hub-text-dim)', margin: '0.4rem 0' }}><strong>Weaknesses:</strong> {comp.weaknesses}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--hub-emerald)', margin: '0.4rem 0' }}><strong>Our Advantage:</strong> {comp.ourAdvantage}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--hub-text-dim)' }}>Click 'Generate Market Analysis' to get AI-powered market sizing and competitor mapping.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BUSINESS MODEL CANVAS */}
          {activeTab === 'bizmodel' && (
            <div>
              {!selectedIdea ? <p>Select an idea first.</p> : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>9-Box Business Model Canvas</h2>
                    <button className="hub-primary-btn" onClick={handleGenerateBizModel} disabled={aiLoading}>
                      {aiLoading ? 'Generating...' : '📋 Generate Business Model'}
                    </button>
                  </div>

                  {bizData ? (
                    <div className="hub-canvas-grid">
                      <div className="hub-canvas-box">
                        <div className="hub-canvas-title">Key Partners</div>
                        <div className="hub-canvas-list">{bizData.keyPartners?.map((kp, i) => <div key={i}>• {kp}</div>)}</div>
                      </div>
                      <div className="hub-canvas-box">
                        <div className="hub-canvas-title">Key Activities</div>
                        <div className="hub-canvas-list">{bizData.keyActivities?.map((ka, i) => <div key={i}>• {ka}</div>)}</div>
                      </div>
                      <div className="hub-canvas-box">
                        <div className="hub-canvas-title">Value Propositions</div>
                        <div className="hub-canvas-list">{bizData.valuePropositions?.map((vp, i) => <div key={i}>• {vp}</div>)}</div>
                      </div>
                      <div className="hub-canvas-box">
                        <div className="hub-canvas-title">Customer Relations</div>
                        <div className="hub-canvas-list">{bizData.customerRelationships?.map((cr, i) => <div key={i}>• {cr}</div>)}</div>
                      </div>
                      <div className="hub-canvas-box">
                        <div className="hub-canvas-title">Customer Segments</div>
                        <div className="hub-canvas-list">{bizData.customerSegments?.map((cs, i) => <div key={i}>• {cs}</div>)}</div>
                      </div>
                      <div className="hub-canvas-box" style={{ gridColumn: 'span 2' }}>
                        <div className="hub-canvas-title">Cost Structure</div>
                        <div className="hub-canvas-list">{bizData.costStructure?.map((cs, i) => <div key={i}>• {cs}</div>)}</div>
                      </div>
                      <div className="hub-canvas-box" style={{ gridColumn: 'span 3' }}>
                        <div className="hub-canvas-title">Revenue Streams</div>
                        <div className="hub-canvas-list">{bizData.revenueStreams?.map((rs, i) => <div key={i}>• {rs}</div>)}</div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--hub-text-dim)' }}>Click 'Generate Business Model' to create a complete 9-box Canvas.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FINANCIAL PROJECTIONS */}
          {activeTab === 'finance' && (
            <div>
              {!selectedIdea ? <p>Select an idea first.</p> : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Financial Planning & Pro-Forma Model</h2>
                    <button className="hub-primary-btn" onClick={handleGenerateFinance} disabled={aiLoading}>
                      {aiLoading ? 'Generating...' : '💰 Generate Financial Model'}
                    </button>
                  </div>

                  {financeData ? (
                    <div>
                      {/* Unit Economics */}
                      <div className="hub-stats-grid" style={{ marginBottom: '1.5rem' }}>
                        <div className="hub-stat-card">
                          <div>
                            <div className="hub-stat-lbl">CAC</div>
                            <div className="hub-stat-val" style={{ color: 'var(--hub-rose)' }}>{financeData.unitEconomics?.cac}</div>
                          </div>
                        </div>
                        <div className="hub-stat-card">
                          <div>
                            <div className="hub-stat-lbl">LTV</div>
                            <div className="hub-stat-val" style={{ color: 'var(--hub-emerald)' }}>{financeData.unitEconomics?.ltv}</div>
                          </div>
                        </div>
                        <div className="hub-stat-card">
                          <div>
                            <div className="hub-stat-lbl">Payback Period</div>
                            <div className="hub-stat-val" style={{ color: 'var(--hub-cyan)' }}>{financeData.unitEconomics?.paybackPeriod}</div>
                          </div>
                        </div>
                        <div className="hub-stat-card">
                          <div>
                            <div className="hub-stat-lbl">Gross Margin</div>
                            <div className="hub-stat-val" style={{ color: 'var(--hub-purple-light)' }}>{financeData.unitEconomics?.grossMargin}</div>
                          </div>
                        </div>
                      </div>

                      {/* 3-Year Projections Table */}
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>3-Year Revenue & Profit Forecast</h3>
                      <div style={{ overflowX: 'auto', background: 'var(--hub-card-bg)', border: '1px solid var(--hub-border)', borderRadius: '14px', padding: '1rem' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--hub-border)', color: 'var(--hub-purple-light)' }}>
                              <th style={{ padding: '0.5rem' }}>Year</th>
                              <th style={{ padding: '0.5rem' }}>Revenue</th>
                              <th style={{ padding: '0.5rem' }}>Expenses</th>
                              <th style={{ padding: '0.5rem' }}>Net Profit</th>
                              <th style={{ padding: '0.5rem' }}>Active Users</th>
                            </tr>
                          </thead>
                          <tbody>
                            {financeData.projections?.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.6rem', fontWeight: 700 }}>{row.year}</td>
                                <td style={{ padding: '0.6rem', color: 'var(--hub-emerald)' }}>{row.revenue}</td>
                                <td style={{ padding: '0.6rem', color: 'var(--hub-rose)' }}>{row.expenses}</td>
                                <td style={{ padding: '0.6rem', fontWeight: 700 }}>{row.netProfit}</td>
                                <td style={{ padding: '0.6rem' }}>{row.activeUsers}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--hub-text-dim)' }}>Click 'Generate Financial Model' to estimate CAC, LTV, and 3-Year P&L.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MVP ROADMAP & TECH STACK */}
          {activeTab === 'mvp' && (
            <div>
              {!selectedIdea ? <p>Select an idea first.</p> : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>MVP Architecture & Sprint Roadmap</h2>
                    <button className="hub-primary-btn" onClick={handleGenerateMVP} disabled={aiLoading}>
                      {aiLoading ? 'Generating...' : '🛠 Generate MVP Roadmap'}
                    </button>
                  </div>

                  {mvpData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'var(--hub-card-bg)', border: '1px solid var(--hub-border)', borderRadius: '16px', padding: '1.25rem' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--hub-purple-light)', marginBottom: '0.75rem' }}>Core MVP Scope</h3>
                        <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--hub-text-dim)', lineHeight: 1.6 }}>
                          {mvpData.mvpScope?.coreFeatures?.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                      <div style={{ background: 'var(--hub-card-bg)', border: '1px solid var(--hub-border)', borderRadius: '16px', padding: '1.25rem' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--hub-cyan)', marginBottom: '0.75rem' }}>Recommended Tech Stack</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--hub-text-dim)' }}><strong>Frontend:</strong> {mvpData.techStack?.frontend?.join(', ')}</p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--hub-text-dim)' }}><strong>Backend:</strong> {mvpData.techStack?.backend?.join(', ')}</p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--hub-text-dim)' }}><strong>AI Stack:</strong> {mvpData.techStack?.aiInfrastructure?.join(', ')}</p>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--hub-text-dim)' }}>Click 'Generate MVP Roadmap' for tech stack suggestions and sprint timelines.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PITCH DECK GENERATOR */}
          {activeTab === 'pitch' && (
            <div>
              {!selectedIdea ? <p>Select an idea first.</p> : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>10-Slide Investor Pitch Deck</h2>
                    <button className="hub-primary-btn" onClick={handleGeneratePitch} disabled={aiLoading}>
                      {aiLoading ? 'Generating...' : '🚀 Generate Pitch Deck'}
                    </button>
                  </div>

                  {pitchData ? (
                    <div className="hub-pitch-container">
                      <div className="hub-slide-card">
                        <div>
                          <div className="hub-slide-num">SLIDE {pitchData.slides[activeSlideIdx]?.slideNumber} OF 10</div>
                          <div className="hub-slide-title">{pitchData.slides[activeSlideIdx]?.title}</div>
                          <div className="hub-slide-headline">{pitchData.slides[activeSlideIdx]?.headline}</div>
                        </div>

                        <div className="hub-slide-bullets">
                          {pitchData.slides[activeSlideIdx]?.bullets?.map((b, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                              <span style={{ color: 'var(--hub-purple-light)' }}>•</span>
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--hub-text-muted)' }}>{selectedIdea.title} • Investor Deck</span>
                          <div className="hub-slide-controls">
                            <button
                              className="hub-slide-btn"
                              disabled={activeSlideIdx === 0}
                              onClick={() => setActiveSlideIdx(prev => Math.max(0, prev - 1))}
                            >
                              ◀ Prev
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{activeSlideIdx + 1} / {pitchData.slides.length}</span>
                            <button
                              className="hub-slide-btn"
                              disabled={activeSlideIdx === pitchData.slides.length - 1}
                              onClick={() => setActiveSlideIdx(prev => Math.min(pitchData.slides.length - 1, prev + 1))}
                            >
                              Next ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--hub-text-dim)' }}>Click 'Generate Pitch Deck' to generate a 10-slide VC pitch structure.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW IDEA MODAL */}
      {showNewModal && (
        <div className="hub-modal-overlay">
          <div className="hub-modal">
            <div className="hub-modal-header">
              <span className="hub-modal-title">✨ Create New Startup Idea</span>
              <button className="hub-modal-close" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateIdea} className="hub-modal-body">
              <div className="hub-form-group">
                <label className="hub-form-label">Startup Title *</label>
                <input className="hub-input" placeholder="e.g. EduVerse AI" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="hub-form-group">
                <label className="hub-form-label">Industry Sector</label>
                <select className="hub-select" value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })}>
                  <option value="Technology">Technology & AI</option>
                  <option value="Education">EdTech / Education</option>
                  <option value="Healthcare">HealthTech / Biotech</option>
                  <option value="Finance">FinTech / Web3</option>
                  <option value="E-commerce">E-commerce / Retail</option>
                  <option value="SaaS">B2B SaaS</option>
                </select>
              </div>
              <div className="hub-form-group">
                <label className="hub-form-label">Target Audience</label>
                <input className="hub-input" placeholder="e.g. College students, Software Engineers" value={formData.target_audience} onChange={e => setFormData({ ...formData, target_audience: e.target.value })} />
              </div>
              <div className="hub-form-group">
                <label className="hub-form-label">Problem Statement *</label>
                <textarea className="hub-textarea" placeholder="What core problem are you solving?" value={formData.problem} onChange={e => setFormData({ ...formData, problem: e.target.value })} required />
              </div>
              <div className="hub-form-group">
                <label className="hub-form-label">Proposed Solution *</label>
                <textarea className="hub-textarea" placeholder="How does your product solve this uniquely?" value={formData.solution} onChange={e => setFormData({ ...formData, solution: e.target.value })} required />
              </div>
              <button type="submit" className="hub-primary-btn" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                💡 Create & Evaluate Idea
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI MENTOR CHAT DRAWER */}
      {showMentorModal && (
        <div className="hub-mentor-drawer">
          <div className="hub-modal-header">
            <span className="hub-modal-title">🤖 AI Startup Incubator Director</span>
            <button className="hub-modal-close" onClick={() => setShowMentorModal(false)}>✕</button>
          </div>
          <div className="hub-mentor-messages">
            {mentorChatHistory.map((msg, i) => (
              <div key={i} className={`hub-mentor-msg ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMentorMsg} style={{ padding: '1rem', borderTop: '1px solid var(--hub-border)', display: 'flex', gap: '0.5rem' }}>
            <input className="hub-input" style={{ flex: 1 }} placeholder="Ask mentor advice..." value={mentorInput} onChange={e => setMentorInput(e.target.value)} />
            <button type="submit" className="hub-primary-btn">Send</button>
          </form>
        </div>
      )}

      {/* AI BRAINSTORMING GENERATOR MODAL */}
      {showGeneratorModal && (
        <div className="hub-modal-overlay">
          <div className="hub-modal" style={{ maxWidth: '680px' }}>
            <div className="hub-modal-header">
              <span className="hub-modal-title">✨ AI Brainstorming Idea Generator</span>
              <button className="hub-modal-close" onClick={() => setShowGeneratorModal(false)}>✕</button>
            </div>
            <div className="hub-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div className="hub-form-group">
                  <label className="hub-form-label">Domain</label>
                  <input className="hub-input" value={genDomain} onChange={e => setGenDomain(e.target.value)} />
                </div>
                <div className="hub-form-group">
                  <label className="hub-form-label">Target Audience</label>
                  <input className="hub-input" value={genAudience} onChange={e => setGenAudience(e.target.value)} />
                </div>
                <div className="hub-form-group">
                  <label className="hub-form-label">Tech Trend</label>
                  <input className="hub-input" value={genTrend} onChange={e => setGenTrend(e.target.value)} />
                </div>
              </div>
              <button className="hub-primary-btn" onClick={handleGenerateBrainstormIdeas} disabled={aiLoading} style={{ justifyContent: 'center' }}>
                {aiLoading ? 'Brainstorming...' : '⚡ Generate 4 Innovative Ideas'}
              </button>

              {generatedIdeas.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {generatedIdeas.map((idea, idx) => (
                    <div key={idx} style={{ background: 'var(--hub-card-bg)', border: '1px solid var(--hub-border)', borderRadius: '12px', padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--hub-purple-light)' }}>{idea.title}</span>
                        <button
                          className="hub-primary-btn"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setFormData({
                              title: idea.title,
                              problem: idea.problem,
                              solution: idea.solution,
                              target_audience: idea.targetAudience || genAudience,
                              industry: idea.industry || 'Technology',
                              country: 'Global'
                            });
                            setShowGeneratorModal(false);
                            setShowNewModal(true);
                          }}
                        >
                          Use Idea
                        </button>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--hub-text-dim)', marginTop: '0.35rem' }}>{idea.problem}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
