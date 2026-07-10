import React, { useState, useEffect } from 'react';
import './VideoStudio.css';

// Initial Mock AI Teacher Avatars
const AVATARS = [
  { id: 'prof_male', name: 'Prof. Arthur', icon: '👨‍🏫', type: 'Professor (Male)', avatarUrl: ' Arthur' },
  { id: 'doctor_female', name: 'Dr. Evelyn', icon: '👩‍⚕️', type: 'Doctor (Female)', avatarUrl: ' Evelyn' },
  { id: 'engineer_male', name: 'Devon K.', icon: '💻', type: 'Engineer (Male)', avatarUrl: ' Devon' },
  { id: 'cartoon_anime', name: 'Ami Chan', icon: '🤖', type: 'Anime / Cartoon', avatarUrl: ' Ami' },
];

// Initial Mock AI Voice Narrations
const VOICES = [
  { id: 'human_calm', name: 'Arthur (Calm)', type: 'Human-like Male', desc: 'Best for engineering & programming lessons.' },
  { id: 'human_excited', name: 'Evelyn (Professional)', type: 'Human-like Female', desc: 'Best for biology & medicine presentations.' },
  { id: 'motivational', name: 'Coach Julian (Motivational)', type: 'Exciting Male', desc: 'Best for pitch decks & startup advice.' },
];

export default function VideoStudio() {
  const [activeTab, setActiveTab] = useState('project'); // 'project', 'script', 'avatar', 'timeline', 'export', 'queue'
  
  // Project creation state
  const [projectName, setProjectName] = useState("Introduction to Neural Networks");
  const [selectedDocument, setSelectedDocument] = useState("notes.pdf");
  const [selectedAvatar, setSelectedAvatar] = useState('prof_male');
  const [selectedVoice, setSelectedVoice] = useState('human_calm');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [teachingStyle, setTeachingStyle] = useState('Professor Mode');

  // Script state
  const [scriptIntro, setScriptIntro] = useState("Welcome to this course on Neural Networks. Today, we will unpack how neurons communicate.");
  const [scriptExplain, setScriptExplain] = useState("A neural network consists of layers of interconnected nodes. Each node performs a weight sum of input parameters.");
  const [scriptExample, setScriptExample] = useState("For instance, in image classification, first layer detects edges, second layer shapes, and final layer classifies the object.");
  
  // Timeline tracks blocks data
  const [timelineBlocks, setTimelineBlocks] = useState({
    video: [
      { id: 'v1', label: 'Intro Animation', width: '25%', left: '0%' },
      { id: 'v2', label: 'Whiteboard Diagram', width: '50%', left: '25%' },
      { id: 'v3', label: 'Interactive Slide', width: '25%', left: '75%' }
    ],
    audio: [
      { id: 'a1', label: 'Narration Track', width: '70%', left: '0%' },
      { id: 'a2', label: 'Background Music', width: '90%', left: '10%' }
    ],
    subtitles: [
      { id: 's1', label: 'Subtitles Track (VTT)', width: '100%', left: '0%' }
    ],
    interactive: [
      { id: 'i1', label: 'Pop Quiz Flag', width: '5%', left: '60%' }
    ]
  });

  // Editing Subtitles lines
  const [subtitlesLines, setSubtitlesLines] = useState([
    { id: 1, time: "00:00 - 00:05", text: "Welcome to this course on Neural Networks." },
    { id: 2, time: "00:05 - 00:15", text: "Today, we will unpack how neurons communicate." },
    { id: 3, time: "00:15 - 00:25", text: "A neural network consists of layers of nodes." }
  ]);

  // Screen Recorder preview
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLog, setRecordingLog] = useState([
    "Record session initialized.",
    "Dual display detection: Single Active Display."
  ]);

  // Export settings
  const [exportFormat, setExportFormat] = useState('mp4');
  
  // Rendering queue tasks list
  const [renderingQueue, setRenderingQueue] = useState([
    { id: 1, name: "Neural Networks Intro Video", format: "MP4", progress: 100, status: "completed" },
    { id: 2, name: "Database Normalization Lesson", format: "SCORM", progress: 45, status: "rendering" },
    { id: 3, name: "Quantum Physics Animation", format: "HTML", progress: 0, status: "queued" }
  ]);

  // Voice Narrator Pitch settings
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);

  // Playback control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(25); // percentage

  // Run simulated rendering loop
  useEffect(() => {
    let interval = null;
    if (renderingQueue.some(item => item.status === 'rendering')) {
      interval = setInterval(() => {
        setRenderingQueue(prev => prev.map(item => {
          if (item.status === 'rendering') {
            const nextProgress = item.progress + 5;
            return {
              ...item,
              progress: nextProgress >= 100 ? 100 : nextProgress,
              status: nextProgress >= 100 ? 'completed' : 'rendering'
            };
          }
          return item;
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [renderingQueue]);

  // Simulated Voice Narration Speech Synthesis
  const playVoiceNarration = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${scriptIntro} ${scriptExplain}`);
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;
    window.speechSynthesis.speak(utterance);
  };

  const stopVoiceNarration = () => {
    window.speechSynthesis?.cancel();
  };

  const startScreenRecord = () => {
    setIsRecording(true);
    setRecordingLog(prev => ["Screen capture stream: ACTIVE (30FPS)", ...prev]);
  };

  const stopScreenRecord = () => {
    setIsRecording(false);
    setRecordingLog(prev => ["Screen capture complete. Video asset added.", ...prev]);
  };

  const triggerExportTask = () => {
    const nextId = renderingQueue.length + 1;
    const newTask = {
      id: nextId,
      name: projectName,
      format: exportFormat.toUpperCase(),
      progress: 0,
      status: "rendering"
    };
    setRenderingQueue(prev => [...prev, newTask]);
    setActiveTab('queue');
  };

  const editSubtitle = (id, text) => {
    setSubtitlesLines(prev => prev.map(line => {
      if (line.id === id) return { ...line, text };
      return line;
    }));
  };

  const activeAvatarObj = AVATARS.find(a => a.id === selectedAvatar) || AVATARS[0];

  return (
    <div className="vs-container">
      {/* Sidebar navigation */}
      <div className="vs-sidebar">
        <div className="vs-sidebar-title">AI Video Studio</div>
        
        <button className={`vs-nav-item ${activeTab === 'project' ? 'active' : ''}`} onClick={() => setActiveTab('project')}>
          <span className="ecc-nav-icon">🎬</span>
          <span>Create Project</span>
        </button>

        <button className={`vs-nav-item ${activeTab === 'script' ? 'active' : ''}`} onClick={() => setActiveTab('script')}>
          <span className="ecc-nav-icon">📄</span>
          <span>AI Script Room</span>
        </button>

        <button className={`vs-nav-item ${activeTab === 'avatar' ? 'active' : ''}`} onClick={() => setActiveTab('avatar')}>
          <span className="ecc-nav-icon">👤</span>
          <span>Teacher & Voice</span>
        </button>

        <button className={`vs-nav-item ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
          <span className="ecc-nav-icon">🎞️</span>
          <span>Timeline Editor</span>
        </button>

        <button className={`vs-nav-item ${activeTab === 'export' ? 'active' : ''}`} onClick={() => setActiveTab('export')}>
          <span className="ecc-nav-icon">📦</span>
          <span>Export Options</span>
        </button>

        <button className={`vs-nav-item ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
          <span className="ecc-nav-icon">⚙️</span>
          <span>Rendering Queue ({renderingQueue.filter(i => i.status === 'rendering').length})</span>
        </button>
      </div>

      {/* Main Workspace content */}
      <div className="vs-content">
        
        {/* ==========================================
            VIEW 1: CREATE PROJECT
            ========================================== */}
        {activeTab === 'project' && (
          <div className="da-heatmap-container">
            <div className="vs-view-header">
              <div className="vs-view-title">
                <h2>🎬 AI Video Learning Studio</h2>
                <p>Convert notes, PDFs, PPTX or research materials into high-quality educational videos automatically.</p>
              </div>
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">🛠️ Project Configuration</h3>
                
                <div className="copilot-form-group">
                  <label>Project Title / Name</label>
                  <input
                    type="text"
                    className="copilot-input"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div className="copilot-form-group">
                  <label>Upload Source Document (PDF, notes, PPTX)</label>
                  <select className="copilot-select" value={selectedDocument} onChange={(e) => setSelectedDocument(e.target.value)}>
                    <option value="notes.pdf">notes.pdf (Neural Networks Summary)</option>
                    <option value="presentation.pptx">presentation.pptx (Math Matrix scaling)</option>
                    <option value="handwritten.jpg">handwritten.jpg (Calculus notes)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="copilot-form-group">
                    <label>Language</label>
                    <select className="copilot-select" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div className="copilot-form-group">
                    <label>AI Teaching Style</label>
                    <select className="copilot-select" value={teachingStyle} onChange={(e) => setTeachingStyle(e.target.value)}>
                      <option>Professor Mode</option>
                      <option>Storytelling mode</option>
                      <option>Interview prep</option>
                      <option>Revision Mode</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button className="ecc-btn ecc-btn-primary" onClick={() => setActiveTab('script')}>
                    ✨ Analyze & Write Script
                  </button>
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">📖 Automated Analysis Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
                  <div>
                    <strong>Difficulty Level Detected:</strong> <span style={{ color: 'var(--hub-cyan)' }}>Advanced</span>
                  </div>
                  <div>
                    <strong>Subject Area:</strong> <span>Computer Science & Deep Learning</span>
                  </div>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '0.2rem 0' }} />
                  <div>
                    <strong>Definitions Found:</strong>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--hub-text-dim)' }}>
                      "Activation Function: mathematical formula bounding outputs to standard limits."
                    </p>
                  </div>
                  <div>
                    <strong>Core Formulas Identified:</strong>
                    <code style={{ display: 'block', margin: '0.2rem 0 0 0', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '4px' }}>
                      f(x) = 1 / (1 + e^-x)  [Sigmoid Function]
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 2: AI SCRIPT ROOM
            ========================================== */}
        {activeTab === 'script' && (
          <div className="da-heatmap-container">
            <div className="vs-view-header">
              <div className="vs-view-title">
                <h2>📄 AI Teaching Script Room</h2>
                <p>Refine the auto-generated teacher scripts, choose speed settings, or play preview chimes.</p>
              </div>
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">✏️ Script Editor</h3>
                
                <div className="copilot-form-group">
                  <label>Section 1: Lesson Introduction</label>
                  <textarea
                    className="copilot-textarea"
                    rows={3}
                    value={scriptIntro}
                    onChange={(e) => setScriptIntro(e.target.value)}
                  />
                </div>

                <div className="copilot-form-group">
                  <label>Section 2: Concept Explanation</label>
                  <textarea
                    className="copilot-textarea"
                    rows={4}
                    value={scriptExplain}
                    onChange={(e) => setScriptExplain(e.target.value)}
                  />
                </div>

                <div className="copilot-form-group">
                  <label>Section 3: Real-World Example</label>
                  <textarea
                    className="copilot-textarea"
                    rows={3}
                    value={scriptExample}
                    onChange={(e) => setScriptExample(e.target.value)}
                  />
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">🔊 Narration Settings & Preview</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="copilot-form-group">
                    <label>Voice Speed ({voiceSpeed}x)</label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="copilot-form-group">
                    <label>Voice Pitch ({voicePitch})</label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="ecc-btn ecc-btn-secondary" onClick={playVoiceNarration}>
                    🔊 Speak Script Preview
                  </button>
                  <button className="ecc-btn ecc-btn-danger" onClick={stopVoiceNarration}>
                    🔇 Stop Audio
                  </button>
                </div>

                <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', padding: '0.85rem', borderRadius: '8px', marginTop: '1.5rem' }}>
                  <strong style={{ fontSize: '0.75rem', color: 'var(--hub-cyan)' }}>FRIDAY SCRIPT COACH SUGGESTION:</strong>
                  <p style={{ fontSize: '0.7rem', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                    "The transition into weight sum could benefit from an infographic diagram. Suggest creating a flowchart."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 3: TEACHER & VOICE
            ========================================== */}
        {activeTab === 'avatar' && (
          <div className="da-heatmap-container">
            <div className="vs-view-header">
              <div className="vs-view-title">
                <h2>👤 Teacher Avatar & Voice Selection</h2>
                <p>Choose photorealistic, anime or 3D teacher characters and natural speech engine profiles.</p>
              </div>
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">Avatar Character Model</h3>
                <div className="avatars-selection-row">
                  {AVATARS.map(avatar => (
                    <div
                      key={avatar.id}
                      className={`avatar-select-card ${selectedAvatar === avatar.id ? 'active' : ''}`}
                      onClick={() => setSelectedAvatar(avatar.id)}
                    >
                      <div className="avatar-select-card-icon">{avatar.icon}</div>
                      <span className="avatar-select-card-label">{avatar.name}</span>
                      <span style={{ fontSize: '0.55rem', color: 'var(--hub-text-muted)' }}>{avatar.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">AI Voice Model</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {VOICES.map(voice => (
                    <div
                      key={voice.id}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid',
                        borderColor: selectedVoice === voice.id ? 'var(--hub-primary)' : 'rgba(255,255,255,0.05)',
                        background: selectedVoice === voice.id ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.01)',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      <strong style={{ fontSize: '0.8rem' }}>{voice.name}</strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--hub-text-muted)' }}>{voice.type} • {voice.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 4: TIMELINE EDITOR
            ========================================== */}
        {activeTab === 'timeline' && (
          <div className="da-heatmap-container">
            <div className="video-canvas-panel">
              <div className="vs-workspace-player">
                
                {/* Immersive Video Screen preview */}
                <div className="video-screen-viewport">
                  {/* Slide presentation mockup */}
                  <div className="active-slide-preview">
                    <span style={{ fontSize: '0.7rem', color: 'var(--hub-cyan)', textTransform: 'uppercase' }}>Chapter 1: Neurons</span>
                    <h3 style={{ margin: '0.25rem 0 0.5rem 0' }}>Linear Combination</h3>
                    <code style={{ background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                      Z = W1*X1 + W2*X2 + b
                    </code>
                    <p style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)', marginTop: '0.5rem' }}>
                      Calculating the sum of weights.
                    </p>
                  </div>

                  {/* Pip Talking Avatar */}
                  <div className="avatar-talking-overlay">
                    {activeAvatarObj.icon}
                  </div>
                </div>

                <div className="player-controls-strip">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="ecc-btn ecc-btn-secondary" style={{ padding: '0.3rem 0.75rem' }} onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? "⏸️ Pause" : "▶️ Play Video"}
                    </button>
                    <button className="ecc-btn ecc-btn-secondary" style={{ padding: '0.3rem 0.75rem' }} onClick={() => setCurrentPlaybackTime(0)}>
                      🔄 Rewind
                    </button>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--hub-text-muted)' }}>Time: 0:12 / 0:45</span>
                </div>
              </div>

              {/* Subtitles & Recording panel */}
              <div className="ecc-card">
                <h3 className="ecc-card-title">🗣️ Subtitles Caption Sync</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {subtitlesLines.map(line => (
                    <div key={line.id} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hub-cyan)' }}>{line.time}</span>
                      <input
                        type="text"
                        className="copilot-input"
                        style={{ fontSize: '0.75rem', border: 'none', background: 'transparent', padding: 0 }}
                        value={line.text}
                        onChange={(e) => editSubtitle(line.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '1rem 0' }} />

                <h3 className="ecc-card-title">📹 Screen Recording</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="ecc-btn ecc-btn-secondary" style={{ fontSize: '0.75rem' }} onClick={isRecording ? stopScreenRecord : startScreenRecord}>
                    {isRecording ? "⏹️ Stop Capture" : "🔴 Record Screen"}
                  </button>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--hub-text-muted)' }}>
                  {recordingLog[0]}
                </div>
              </div>
            </div>

            {/* Video Tracks timeline editor */}
            <div className="timeline-tracks-box">
              <h3 className="ecc-card-title" style={{ margin: 0 }}>🎞️ Tracks Editor Grid</h3>
              
              <div className="timeline-track-row">
                <span className="track-label">🎬 Video Layer</span>
                <div className="track-blocks-container">
                  {timelineBlocks.video.map(b => (
                    <div key={b.id} className="track-block video" style={{ width: b.width, left: b.left }}>
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="timeline-track-row">
                <span className="track-label">🔊 Audio Layer</span>
                <div className="track-blocks-container">
                  {timelineBlocks.audio.map(b => (
                    <div key={b.id} className="track-block audio" style={{ width: b.width, left: b.left }}>
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="timeline-track-row">
                <span className="track-label">📝 Subtitles</span>
                <div className="track-blocks-container">
                  {timelineBlocks.subtitles.map(b => (
                    <div key={b.id} className="track-block text" style={{ width: b.width, left: b.left }}>
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="timeline-track-row">
                <span className="track-label">🧪 Interactive</span>
                <div className="track-blocks-container">
                  {timelineBlocks.interactive.map(b => (
                    <div key={b.id} className="track-block interactive" style={{ width: b.width, left: b.left }}>
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 5: EXPORT OPTIONS
            ========================================== */}
        {activeTab === 'export' && (
          <div className="da-heatmap-container">
            <div className="vs-view-header">
              <div className="vs-view-title">
                <h2>📦 Export Options & Integrations</h2>
                <p>Generate production packages optimized for LMS architectures or cloud storages.</p>
              </div>
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">Select Format Package</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="radio" name="format" checked={exportFormat === 'mp4'} onChange={() => setExportFormat('mp4')} />
                    <div>
                      <strong>MP4 Standard Video</strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--hub-text-muted)' }}>Highly compatible, H.264 compression codec.</div>
                    </div>
                  </label>
                  
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="radio" name="format" checked={exportFormat === 'scorm'} onChange={() => setExportFormat('scorm')} />
                    <div>
                      <strong>SCORM e-Learning Package</strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--hub-text-muted)' }}>SCORM 1.2 or 2004 standard package for LMS.</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="radio" name="format" checked={exportFormat === 'html'} onChange={() => setExportFormat('html')} />
                    <div>
                      <strong>HTML Immersive Web Page</strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--hub-text-muted)' }}>Exports the video with clickable question hotspots natively.</div>
                    </div>
                  </label>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <button className="ecc-btn ecc-btn-primary" onClick={triggerExportTask}>
                    📦 Generate Package & Render
                  </button>
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">API Integration References</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <div><strong>AI Voice Generation:</strong> ElevenLabs Voice Engine API</div>
                  <div><strong>Avatar Lip-Sync:</strong> HeyGen Video Synthesis API</div>
                  <div><strong>Video Animation:</strong> Runway Gen-2 API</div>
                  <div><strong>Hosting:</strong> Cloud Storage S3 / Google Cloud CDN</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 6: RENDERING QUEUE
            ========================================== */}
        {activeTab === 'queue' && (
          <div className="da-heatmap-container">
            <div className="vs-view-header">
              <div className="vs-view-title">
                <h2>⚙️ Video Rendering Queue</h2>
                <p>Monitor high-performance asynchronous compilation pipelines and completed files.</p>
              </div>
            </div>

            <div className="ecc-card">
              <h3 className="ecc-card-title">Active Render Tasks</h3>
              <div className="rendering-queue-list">
                {renderingQueue.map(item => (
                  <div key={item.id} className="queue-item">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxWidth: '35%' }}>
                      <strong style={{ fontSize: '0.8rem' }}>{item.name}</strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hub-text-muted)' }}>Format: {item.format}</span>
                    </div>

                    <div className="queue-progress-bar">
                      <div className="queue-progress-fill" style={{ width: `${item.progress}%` }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{item.progress}%</span>
                      <span className={`queue-status-text ${item.status}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
