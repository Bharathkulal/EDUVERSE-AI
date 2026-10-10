import React, { useState, useEffect, useRef } from 'react';
import './DebateArena.css';

// safe SpeechRecognition support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
}

// Initial Mock AI Judges data
const INITIAL_JUDGES = [
  { id: 'professor', name: 'Prof. Evelyn', role: 'Academic Professor', icon: '👩‍🏫', score: 85, reasoning: "Strong theoretical grounds, but relies slightly too heavily on academic abstractions rather than immediate practical cases.", strengths: "Structural rigor, citation formats.", weaknesses: "Over-intellectualized analogies.", advice: "Inject concrete business feasibility models.", bias: "Slight academic pedigree bias detected.", confidence: 92, consensus: 88 },
  { id: 'ceo', name: 'Sarah Jenkins', role: 'Enterprise CEO', icon: '👩‍💼', score: 78, reasoning: "Your points address the macro market scalability, but lack deep empirical research validation details.", strengths: "Clear ROI-focused statements, persuasive pace.", weaknesses: "Fails to address regulatory compliance risks.", advice: "Quantify implementation milestones directly.", bias: "Market-share and revenue optimization bias.", confidence: 85, consensus: 80 },
  { id: 'lawyer', name: 'Marcus Vance', role: 'Constitutional Lawyer', icon: '👨‍⚖️', score: 92, reasoning: "Logically flawless sequencing. You effectively preempted the opponent's circular arguments.", strengths: "Precise definitions, zero logical fallacies found.", weaknesses: "Dry presentation, lower audience emotional hooks.", advice: "Integrate anecdotal evidence to engage general public.", bias: "Strict literalist legal bias.", confidence: 95, consensus: 91 },
  { id: 'engineer', name: 'Devon K.', role: 'Software Architect', icon: '💻', score: 84, reasoning: "Technically viable layout, but needs to consider human-computer interface factors.", strengths: "Scalable architecture arguments.", weaknesses: "Assumes technical literacy from users.", advice: "Simplify jargon when presenting to non-technical stakeholders.", bias: "System architecture scaling bias.", confidence: 88, consensus: 85 },
  { id: 'speaking_coach', name: 'Coach Julian', role: 'Public Speaking Expert', icon: '🗣️', score: 90, reasoning: "Excellent vocal modulation. Your pauses before key points increased persuasiveness.", strengths: "Pacing, breath control, emotional pitch.", weaknesses: "Slight use of filler phrases during transition sequences.", advice: "Eliminate transition gaps by pausing silently instead of saying 'uh'.", bias: "Format over literal content bias.", confidence: 94, consensus: 89 }
];

// Reusable mock fallacies database
const FALLACIES_DB = [
  { name: "False Dilemma", severity: "severe", text: "You presented only two extreme paths (NoSQL vs SQL) while ignoring intermediate hybrid configurations (NewSQL).", fix: "Acknowledge hybrid models or polyglot persistence.", resource: "Logical fallacies: Black-and-white reasoning frameworks." },
  { name: "Hasty Generalization", severity: "warning", text: "Stating that all SQL engines are slow based on one single unindexed benchmark query.", fix: "Provide wider database performance statistics under indexed keys.", resource: "Statistical relevance and sample sizes." },
  { name: "Straw Man", severity: "severe", text: "Misrepresenting the opponent's argument about database security to make it sound like they reject horizontal scaling entirely.", fix: "Restate opponent security concerns fairly before countering.", resource: "Debate principles: Principle of Charity." }
];

// Reusable mock evidence recommendations
const EVIDENCE_REC = [
  { claim: "Relational queries degrade under scale", reliability: "high", strength: 88, paper: "ACM SIGMOD: Performance benchmarks in distributed relational fabrics.", counter: "Studies showing InnoDB cluster configurations scaling past 100k QPS." },
  { claim: "NoSQL document store is more secure", reliability: "medium", strength: 65, paper: "IEEE Security: Analysis of document schema injections.", counter: "NoSQL databases lacking row-level audit compliance constraints natively." }
];

export default function DebateArena() {
  const [activeTab, setActiveTab] = useState('round'); // 'round', 'jury', 'fallacies', 'evidence', 'heatmap', 'coach', 'analytics'
  const [selectedJudgeId, setSelectedJudgeId] = useState('professor');
  
  // Debate statements state
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeechDraft, setUserSpeechDraft] = useState("");
  const [debateTopic, setDebateTopic] = useState("AI Automation: Will it solve global economic gaps, or widen them?");
  
  const [debateRounds, setDebateRounds] = useState([
    {
      role: 'Opponent AI',
      text: "AI automation primarily serves high-capital technology centers. Without decentralized access, it directly increases wealth inequality, leaving developing regions without industrial leverage.",
      fallacies: []
    }
  ]);

  // Live simulation parameters
  const [audienceAgreement, setAudienceAgreement] = useState(55); // start at 55%
  const [audienceInterest, setAudienceInterest] = useState(70);
  const [fallaciesLogged, setFallaciesLogged] = useState([
    { name: "Appeal to Emotion", severity: "warning", text: "Using words like 'doomed' and 'catastrophic' to describe inequality projections without statistical backing.", fix: "Provide Gini coefficient trend models instead.", resource: "Macroeconomics Gini indices." }
  ]);
  const [recommendedEvidence, setRecommendedEvidence] = useState([
    { claim: "AI benefits only wealthy corporations", reliability: "high", strength: 75, paper: "World Bank report: Digital dividends and technological convergence.", counter: "Reports showing micro-lending AI models helping farming communities in Kenya." }
  ]);

  // Communication Heatmap timeline slices (high, mid, low)
  const heatmapTimeline = [
    { label: "0:15", rating: "high", desc: "Strong introduction, clear voice stability." },
    { label: "0:30", rating: "high", desc: "Used stats: Gini index. Evidence strength high." },
    { label: "0:45", rating: "low", desc: "Speech speed accelerated to 160 WPM. Tone instability." },
    { label: "1:00", rating: "mid", desc: "Recovered pacing. Straw Man fallacy alert triggered." },
    { label: "1:15", rating: "high", desc: "Excellent summary conclusion, strong eye-contact." }
  ];
  const [selectedHeatmapIdx, setSelectedHeatmapIdx] = useState(0);

  // Post-Debate Learning Materials
  const [learningMaterials, setLearningMaterials] = useState(null);

  // Web Speech STT
  const startRecordingSpeech = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser. Please type your speech response.");
      return;
    }
    setUserSpeechDraft("");
    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setUserSpeechDraft(text);
    };

    recognition.onerror = (err) => {
      console.error(err);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const stopRecordingSpeech = () => {
    if (recognition) recognition.stop();
    setIsRecording(false);
  };

  const submitUserSpeech = () => {
    if (!userSpeechDraft.trim()) return;
    
    const newUserRound = {
      role: 'User (You)',
      text: userSpeechDraft,
      fallacies: Math.random() > 0.5 ? [FALLACIES_DB[Math.floor(Math.random() * FALLACIES_DB.length)]] : []
    };

    // Update debate history
    setDebateRounds(prev => [...prev, newUserRound]);

    // Update fallacies log if any found
    if (newUserRound.fallacies.length > 0) {
      setFallaciesLogged(prev => [...newUserRound.fallacies, ...prev]);
      // Play mock alert chime
      playFallacyChime();
    }

    // Adapt audience meter: based on statement length and randomness
    const impactVal = Math.floor(Math.random() * 20) - 8; // -8 to +12
    setAudienceAgreement(prev => Math.min(95, Math.max(10, prev + impactVal)));
    setAudienceInterest(prev => Math.min(100, Math.max(20, prev + Math.floor(Math.random() * 10))));

    // Recommend new evidence
    if (Math.random() > 0.4) {
      setRecommendedEvidence(prev => [
        EVIDENCE_REC[Math.floor(Math.random() * EVIDENCE_REC.length)],
        ...prev
      ]);
    }

    // Auto-generate opponent counter speech after brief delay
    setUserSpeechDraft("");
    setTimeout(() => {
      const counters = [
        "While digital convergence claims are sound, historical precedence shows structural displacement of workers precedes redistribution benefits. The net immediate effect remains highly polarized.",
        "Your statistics assume absolute accessibility. However, high computational models (LLMs) depend on cloud centers that remain geographically centralized in the Western Hemisphere.",
        "Let's look at labor indicators. In developing markets, AI automation directly displaces the offshoring service industries (BPOs) that sustained urban growth for the last two decades."
      ];
      setDebateRounds(prev => [...prev, {
        role: 'Opponent AI',
        text: counters[Math.floor(Math.random() * counters.length)],
        fallacies: []
      }]);
    }, 1500);
  };

  // Synthesize fallacy alert audio sound
  const playFallacyChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(330, ctx.currentTime); // E4
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1); // A3
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  };

  // Generate Learning Materials from debate session
  const triggerLearningEngine = () => {
    const materials = {
      summary: "This debate examined the structural wealth inequalities driven by centralized AI cloud infrastructures. Opponent argued technological displacement of BPOs; User countered with micro-lending agricultural optimization cases.",
      arguments: [
        "AI benefits localize inside high-capital centers.",
        "Offshore service industries face immediate displacement before redistribution convergence completes."
      ],
      vocab: [
        { term: "Epigenetic convergence", def: "Unification of biological systems across digital mapping pipelines." },
        { term: "Gini Coefficient", def: "A statistical measure of distribution representing income inequality." }
      ],
      mcqs: [
        { q: "What was the primary argument raised against centralized cloud models?", options: ["Lack of APIs", "Geographical wealth concentration", "Higher latency", "SQL performance degradation"], ans: 1 }
      ]
    };
    setLearningMaterials(materials);
    setActiveTab('learning');
  };

  const currentJudge = INITIAL_JUDGES.find(j => j.id === selectedJudgeId) || INITIAL_JUDGES[0];

  return (
    <div className="da-container">
      {/* Sidebar navigation */}
      <div className="da-sidebar">
        <div className="da-sidebar-title">Debate Arena Laboratory</div>
        
        <button className={`da-nav-item ${activeTab === 'round' ? 'active' : ''}`} onClick={() => setActiveTab('round')}>
          <span className="ecc-nav-icon">🗣️</span>
          <span>Debate Stage</span>
        </button>

        <button className={`da-nav-item ${activeTab === 'jury' ? 'active' : ''}`} onClick={() => setActiveTab('jury')}>
          <span className="ecc-nav-icon">⚖️</span>
          <span>AI Jury Panel</span>
        </button>

        <button className={`da-nav-item ${activeTab === 'fallacies' ? 'active' : ''}`} onClick={() => setActiveTab('fallacies')}>
          <span className="ecc-nav-icon">🚨</span>
          <span>Fallacy Detector ({fallaciesLogged.length})</span>
        </button>

        <button className={`da-nav-item ${activeTab === 'evidence' ? 'active' : ''}`} onClick={() => setActiveTab('evidence')}>
          <span className="ecc-nav-icon">📚</span>
          <span>Evidence Assistant</span>
        </button>

        <button className={`da-nav-item ${activeTab === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveTab('heatmap')}>
          <span className="ecc-nav-icon">🗺️</span>
          <span>Speaking Heatmap</span>
        </button>

        <button className={`da-nav-item ${activeTab === 'coach' ? 'active' : ''}`} onClick={() => setActiveTab('coach')}>
          <span className="ecc-nav-icon">🧠</span>
          <span>Debate AI Coach</span>
        </button>

        <button className={`da-nav-item ${activeTab === 'learning' ? 'active' : ''}`} onClick={triggerLearningEngine}>
          <span className="ecc-nav-icon">🩹</span>
          <span>Debate to Study Pack</span>
        </button>

        <button className={`da-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <span className="ecc-nav-icon">📊</span>
          <span>Enterprise Analytics</span>
        </button>
      </div>

      {/* Main workspace */}
      <div className="da-content">
        
        {/* ==========================================
            VIEW 1: DEBATE ROUND / STAGE
            ========================================== */}
        {activeTab === 'round' && (
          <div className="da-stage-layout">
            <div className="da-podium-area">
              <div className="da-view-header" style={{ border: 'none', padding: 0 }}>
                <div className="da-view-title">
                  <h2>🗣️ AI Debate Arena</h2>
                  <p>Engage in real-time argumentations with AI agents, reviewed by multiple specialists.</p>
                </div>
              </div>

              <div className="ecc-card" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)', textTransform: 'uppercase' }}>Active Motion Topic:</span>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'white', marginTop: '0.2rem' }}>
                  "{debateTopic}"
                </div>
              </div>

              {/* User and AI Podiums */}
              <div className="da-podiums-grid">
                <div className="da-podium-card active">
                  <div className="da-avatar-glow">👤</div>
                  <strong>Speaker (You)</strong>
                  <div className="audio-waveform-debate">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="wave-bar-db" style={{ animationDelay: `${i * 0.08}s` }} />
                    ))}
                  </div>
                </div>

                <div className="da-podium-card">
                  <div className="da-avatar-glow">🤖</div>
                  <strong>Opponent (Friday Agent)</strong>
                  <div className="audio-waveform-debate">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="wave-bar-db" style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* User Draft input */}
              <div className="ecc-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="ecc-card-title" style={{ margin: 0 }}>📝 Draft Your Speech / Rebuttal</h3>
                  <button className="ecc-btn ecc-btn-secondary" style={{ fontSize: '0.75rem' }} 
                    onClick={isRecording ? stopRecordingSpeech : startRecordingSpeech}>
                    {isRecording ? "🔴 Stop Mic Capture" : "🎤 Record Voice"}
                  </button>
                </div>

                <textarea
                  className="copilot-textarea"
                  style={{ width: '100%', minHeight: '100px', margin: '0.75rem 0' }}
                  placeholder="Record via microphone or type your argument here..."
                  value={userSpeechDraft}
                  onChange={(e) => setUserSpeechDraft(e.target.value)}
                />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="ecc-btn ecc-btn-primary" onClick={submitUserSpeech}>
                    Deliver Speech →
                  </button>
                </div>
              </div>

              {/* Debate History feed */}
              <div className="ecc-card">
                <h3 className="ecc-card-title">📖 Debate Rounds Feed</h3>
                <div className="viva-history-list" style={{ maxHeight: '250px' }}>
                  {debateRounds.map((round, idx) => (
                    <div key={idx} className="viva-history-item q" style={{ borderLeft: round.role.includes('User') ? '3px solid var(--hub-cyan)' : '3px solid var(--hub-primary)' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: round.role.includes('User') ? 'var(--hub-cyan)' : 'var(--hub-primary-light)' }}>
                        {round.role}
                      </div>
                      <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>{round.text}</p>
                      
                      {round.fallacies && round.fallacies.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {round.fallacies.map((f, fIdx) => (
                            <span key={fIdx} style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem' }}>
                              ⚠️ Detected Fallacy: {f.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar showing live audience reactions */}
            <div className="da-audience-panel">
              <div className="ecc-card" style={{ height: '100%' }}>
                <h3 className="ecc-card-title">📈 Immersive Audience Simulator</h3>
                
                <div className="audience-meter-box" style={{ marginTop: '1rem' }}>
                  <strong>Live Agreement Meter:</strong>
                  <div className="meter-scale-bar">
                    <div className="meter-needle" style={{ left: `${audienceAgreement}%` }} />
                  </div>
                  <div className="meter-labels">
                    <span>Disagreement: {100 - audienceAgreement}%</span>
                    <span>Agreement: {audienceAgreement}%</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Interest Level</span>
                    <div style={{ fontWeight: 'bold', color: 'var(--hub-cyan)' }}>{audienceInterest}%</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Reaction State</span>
                    <div style={{ fontWeight: 'bold', color: 'var(--hub-green)' }}>Applause Moment</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--hub-primary-light)' }}>MOST CONVINCING ARGUMENT:</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--hub-text-dim)', margin: '0.2rem 0 0 0', lineHeight: 1.3 }}>
                    "Leveraging localized AI models for micro-financing agricultural sectors."
                  </p>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fca5a5' }}>WEAKEST ARGUMENT MOMENT:</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--hub-text-dim)', margin: '0.2rem 0 0 0', lineHeight: 1.3 }}>
                    "Using highly generalized predictions of job losses without local Gini correlation metrics."
                  </p>
                </div>

                <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Audience Category Target:</span>
                  <br /><strong style={{ fontSize: '0.8rem' }}>Students & Technical Experts</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 2: AI JURY PANEL
            ========================================== */}
        {activeTab === 'jury' && (
          <div className="da-heatmap-container">
            <div className="da-view-header" style={{ border: 'none', padding: 0 }}>
              <div className="da-view-title">
                <h2>⚖️ AI Jury Panel Dashboard</h2>
                <p>Select any AI Judge to read their independent evaluation, consensus score and advice.</p>
              </div>
            </div>

            <div className="jury-grid">
              {INITIAL_JUDGES.map(judge => (
                <div key={judge.id} className="jury-card" 
                  onClick={() => setSelectedJudgeId(judge.id)}
                  style={{ borderColor: selectedJudgeId === judge.id ? 'var(--hub-cyan)' : '' }}>
                  <div className="jury-avatar-row">
                    <span className="jury-avatar">{judge.icon}</span>
                    <div>
                      <strong style={{ fontSize: '0.85rem' }}>{judge.name}</strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--hub-text-muted)' }}>{judge.role}</div>
                    </div>
                    <span className="jury-score-badge">{judge.score}/100</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">📖 Verdict & Suggestions: {currentJudge.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div>
                    <strong>Independent Score:</strong> <span style={{ color: 'var(--hub-cyan)' }}>{currentJudge.score}/100</span>
                  </div>
                  <div>
                    <strong>Reasoning:</strong>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--hub-text-dim)', lineHeight: 1.4 }}>{currentJudge.reasoning}</p>
                  </div>
                  <div>
                    <strong>Strengths:</strong> <span style={{ color: 'var(--hub-green)' }}>{currentJudge.strengths}</span>
                  </div>
                  <div>
                    <strong>Weaknesses:</strong> <span style={{ color: '#fca5a5' }}>{currentJudge.weaknesses}</span>
                  </div>
                  <div>
                    <strong>Advice:</strong> <span style={{ color: 'white' }}>{currentJudge.advice}</span>
                  </div>
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">🔍 Professional Jury Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bias Detection Rating:</span>
                    <strong style={{ color: 'var(--hub-amber)' }}>{currentJudge.bias}</strong>
                  </div>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '0.2rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Judge Confidence Score:</span>
                    <strong>{currentJudge.confidence}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Consensus Score:</span>
                    <strong>{currentJudge.consensus}%</strong>
                  </div>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '0.2rem 0' }} />
                  <div>
                    <strong>Overall Verdict (Jury Consensus):</strong>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--hub-green)', fontWeight: 'bold' }}>
                      Majority Verdict (4-1 Decision): Statement is approved with notes on Gini modeling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 3: LOGICAL FALLACY DETECTOR
            ========================================== */}
        {activeTab === 'fallacies' && (
          <div className="da-heatmap-container">
            <div className="da-view-header" style={{ border: 'none', padding: 0 }}>
              <div className="da-view-title">
                <h2>🚨 Fallacy Warning Center</h2>
                <p>Continuous AI analysis of your statements, providing corrective suggestions and resources.</p>
              </div>
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">⚠️ Detected Fallacies Log</h3>
                <div className="fallacy-detector-list">
                  {fallaciesLogged.map((item, idx) => (
                    <div key={idx} className={`fallacy-card ${item.severity}`}>
                      <span className="fallacy-icon">⚠️</span>
                      <div className="fallacy-content">
                        <h4>{item.name}</h4>
                        <p>{item.text}</p>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', opacity: 0.8 }}>
                          <strong>Fix suggestion:</strong> {item.fix}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">📖 Logical Fallacy Resources</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                    <strong>Straw Man:</strong> Distorting an opponent's argument to make it easier to attack.
                    <br /><span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Resource: Logic 101 frameworks.</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                    <strong>Appeal to Emotion:</strong> Manipulating emotional responses in place of a valid or compelling argument.
                    <br /><span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Resource: Rhetorical appeals.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 4: EVIDENCE ASSISTANT
            ========================================== */}
        {activeTab === 'evidence' && (
          <div className="da-heatmap-container">
            <div className="da-view-header" style={{ border: 'none', padding: 0 }}>
              <div className="da-view-title">
                <h2>📚 Evidence validation Assistant</h2>
                <p>Compare claims with academic references and check source reliability scores.</p>
              </div>
            </div>

            <div className="ecc-grid-2">
              {recommendedEvidence.map((item, idx) => (
                <div key={idx} className="ecc-card">
                  <h3 className="ecc-card-title">🎯 Claim validation: "{item.claim}"</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Source Reliability:</span>
                      <strong style={{ color: 'var(--hub-green)' }}>{item.reliability.toUpperCase()} ({item.strength}% Strength)</strong>
                    </div>
                    <div>
                      <strong>Recommended Reference:</strong>
                      <p style={{ margin: '0.1rem 0 0 0', fontStyle: 'italic', color: 'var(--hub-text-dim)' }}>
                        "{item.paper}"
                      </p>
                    </div>
                    <div>
                      <strong>Opponent Counter-Evidence:</strong>
                      <p style={{ margin: '0.1rem 0 0 0', color: '#fca5a5' }}>
                        "{item.counter}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 5: SPEAKING HEATMAP
            ========================================== */}
        {activeTab === 'heatmap' && (
          <div className="da-heatmap-container">
            <div className="da-view-header" style={{ border: 'none', padding: 0 }}>
              <div className="da-view-title">
                <h2>🗺️ Communication timeline Heatmap</h2>
                <p>Interactive timeline tracking confidence, tone speed and vocabulary stability.</p>
              </div>
            </div>

            <div className="ecc-card">
              <h3 className="ecc-card-title">🎙️ Speech articulation slices</h3>
              <div className="heatmap-timeline-bar">
                {heatmapTimeline.map((slice, idx) => (
                  <div
                    key={idx}
                    className={`heatmap-slice ${slice.rating}`}
                    onClick={() => setSelectedHeatmapIdx(idx)}
                    style={{ opacity: selectedHeatmapIdx === idx ? 1 : 0.4 }}
                  />
                ))}
              </div>
              <div className="heatmap-indicators-labels" style={{ marginTop: '0.5rem' }}>
                <span>0:00 (Start)</span>
                <span>Time (1:30)</span>
              </div>
            </div>

            <div className="ecc-card">
              <h3 className="ecc-card-title">📊 Articulation log: Slice {heatmapTimeline[selectedHeatmapIdx].label}</h3>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Quality rating:</strong> {heatmapTimeline[selectedHeatmapIdx].rating.toUpperCase()}
                <p style={{ marginTop: '0.4rem', color: 'var(--hub-text-dim)' }}>
                  {heatmapTimeline[selectedHeatmapIdx].desc}
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem', textAnchor: 'middle', textAlign: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Speaking Speed</span>
                  <div style={{ fontWeight: 'bold' }}>140 WPM</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Filler Words</span>
                  <div style={{ fontWeight: 'bold' }}>2%</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Voice Stability</span>
                  <div style={{ fontWeight: 'bold' }}>94%</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Clarity Index</span>
                  <div style={{ fontWeight: 'bold' }}>88%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 6: AI DEBATE COACH
            ========================================== */}
        {activeTab === 'coach' && (
          <div className="da-heatmap-container">
            <div className="da-view-header" style={{ border: 'none', padding: 0 }}>
              <div className="da-view-title">
                <h2>🧠 AI Debate Coach</h2>
                <p>Personalized analysis of reasoning depth, persuasion metrics and vocabs building.</p>
              </div>
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">🏆 Cognitive Ratings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span>Critical Thinking</span>
                      <span>88%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-primary)', width: '88%', borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span>Logical Reasoning</span>
                      <span>92%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-cyan)', width: '92%', borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span>Evidence Strength</span>
                      <span>78%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-amber)', width: '78%', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">⚡ Practice Recommendations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--hub-cyan)', fontWeight: 'bold' }}>Speaking:</span>
                    <span>Complete 2-minute prompt intervals targeting transition silences.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--hub-cyan)', fontWeight: 'bold' }}>Logic:</span>
                    <span>Read up on Straw Man fallacies structures.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--hub-cyan)', fontWeight: 'bold' }}>Vocab:</span>
                    <span>Adopt 'Epigenetic Convergence' concepts in future rounds.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 7: DEBATE TO LEARNING ENGINE
            ========================================== */}
        {activeTab === 'learning' && learningMaterials && (
          <div className="da-heatmap-container">
            <div className="da-view-header" style={{ border: 'none', padding: 0 }}>
              <div className="da-view-title">
                <h2>🩹 Debate study Pack Generator</h2>
                <p>AI converted learning summaries, reflection queries and flashcards from your debate.</p>
              </div>
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">📝 Debate Executive Summary</h3>
                <p style={{ fontSize: '0.825rem', lineHeight: 1.5, color: 'var(--hub-text-dim)' }}>
                  {learningMaterials.summary}
                </p>
                
                <h4 style={{ fontSize: '0.8rem', marginTop: '1rem' }}>Core Arguments:</h4>
                <ul style={{ fontSize: '0.75rem', paddingLeft: '1.25rem', color: 'var(--hub-text-muted)', lineHeight: 1.5 }}>
                  {learningMaterials.arguments.map((arg, idx) => <li key={idx}>{arg}</li>)}
                </ul>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">📖 Vocabulary list</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  {learningMaterials.vocab.map((v, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '4px' }}>
                      <strong style={{ color: 'var(--hub-cyan)' }}>{v.term}:</strong> {v.def}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 8: ENTERPRISE ANALYTICS
            ========================================== */}
        {activeTab === 'analytics' && (
          <div className="da-heatmap-container">
            <div className="da-view-header" style={{ border: 'none', padding: 0 }}>
              <div className="da-view-title">
                <h2>📊 Enterprise Debate Analytics</h2>
                <p>Longitudinal growth indicators for student groups, faculty classes and universities.</p>
              </div>
            </div>

            <div className="analytics-metric-grid">
              <div className="analytics-stat-card">
                <div>
                  <span className="analytics-stat-label">Logic Growth Trend</span>
                  <div className="analytics-stat-num">+12%</div>
                </div>
                <span>🧠</span>
              </div>
              <div className="analytics-stat-card">
                <div>
                  <span className="analytics-stat-label">Evidence Citations Usage</span>
                  <div className="analytics-stat-num">84.2%</div>
                </div>
                <span>📚</span>
              </div>
              <div className="analytics-stat-card">
                <div>
                  <span className="analytics-stat-label">Debate Participation Rate</span>
                  <div className="analytics-stat-num">96.8%</div>
                </div>
                <span>🗣️</span>
              </div>
              <div className="analytics-stat-card">
                <div>
                  <span className="analytics-stat-label">Leadership Index</span>
                  <div className="analytics-stat-num">89%</div>
                </div>
                <span>👑</span>
              </div>
            </div>

            <div className="ecc-card">
              <h3 className="ecc-card-title">📉 Logic & Reasoning Score Over Time</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span>Month 1: General logic frameworks</span>
                    <span>65% score</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                    <div style={{ height: '100%', background: 'var(--hub-primary)', width: '65%', borderRadius: '3px' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span>Month 2: Preempting circular reasoning</span>
                    <span>78% score</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                    <div style={{ height: '100%', background: 'var(--hub-cyan)', width: '78%', borderRadius: '3px' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span>Month 3: Complex structural argumentations</span>
                    <span>91% score</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                    <div style={{ height: '100%', background: 'var(--hub-green)', width: '91%', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
