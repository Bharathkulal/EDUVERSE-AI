import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pin, Star, Share2, Send, Mic, MicOff,
  Paperclip, Image, Camera, BookOpen, Settings, Brain,
  Sparkles, Download, Volume2, VolumeX, Bookmark, FileText,
  Folder, Calendar, ChevronRight, Copy, RotateCw, Search,
  Menu, X, Check, HelpCircle, GraduationCap, BarChart2, Eye, EyeOff
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './ChatLearn.css';

export default function ChatLearn() {
  // Navigation & UI States
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [activeAgent, setActiveAgent] = useState('chatgpt'); // chatgpt, gemini, claude
  
  // Library Accordions
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, pinned, favorite, folders
  const [accordionOpen, setAccordionOpen] = useState({
    tools: true,
    prompts: false,
    analytics: false,
    files: false
  });

  // Dialog / Options States
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    preferred_language: 'English',
    preferred_model: 'gemini-2.0-flash',
    learning_mode_enabled: false,
    voice_enabled: false
  });
  
  // prompt templates & tools
  const [promptTemplates, setPromptTemplates] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);

  // File Upload states
  const [uploadDraft, setUploadDraft] = useState(null); // { file_url, file_name, file_size, parsed_text, mime_type }
  const [isUploading, setIsUploading] = useState(false);

  // Multimedia Capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [ttsState, setTtsState] = useState({ speaking: false, activeId: null });

  // ML / Recommendation states
  const [mlAnalytics, setMlAnalytics] = useState({
    recommendations: [],
    learningPattern: 'Analyzing learning speed...',
    examScorePrediction: 'N/A',
    studyTimePredictionMinutes: 0,
    adaptiveQuizDifficulty: 'Medium'
  });

  // Generated Files states
  const [generatedFiles, setGeneratedFiles] = useState([]);

  // DOM Refs
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Initial Data Fetching
  useEffect(() => {
    fetchSessions();
    fetchPreferences();
    fetchPrompts();
    fetchMlAnalytics();
    fetchGeneratedFiles();
    initSpeech();
    
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingText]);

  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      const res = await api.get('/api/chat-learn/preferences');
      setPreferences(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch prompt templates
  const fetchPrompts = async () => {
    try {
      const res = await api.get('/api/chat-learn/prompts');
      setPromptTemplates(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch ML Recommendations
  const fetchMlAnalytics = async () => {
    try {
      const res = await api.get('/api/chat-learn/ml-analytics');
      setMlAnalytics(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Generated Files
  const fetchGeneratedFiles = async () => {
    try {
      const res = await api.get('/api/chat-learn/generated-files');
      setGeneratedFiles(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Initialize browser speech recognition
  const initSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecordingVoice(true);
        toast.success('Listening for voice search/commands...');
      };

      rec.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        setInputText(prev => prev + ' ' + resultText);
        toast.success('Speech recognized!');
      };

      rec.onerror = (e) => {
        console.error(e);
        setIsRecordingVoice(false);
      };

      rec.onend = () => {
        setIsRecordingVoice(false);
      };

      setRecognition(rec);
    }
  };

  // Text-To-Speech function
  const speakResponse = (messageId, text) => {
    if (!('speechSynthesis' in window)) {
      toast.error('TTS is not supported in this browser.');
      return;
    }

    if (ttsState.speaking && ttsState.activeId === messageId) {
      window.speechSynthesis.cancel();
      setTtsState({ speaking: false, activeId: null });
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown characters out of speech
    const cleanText = text
      .replace(/[*#`_\-]/g, '')
      .replace(/\[.*\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = preferences.preferred_language === 'French' ? 'fr-FR' : 
                   preferences.preferred_language === 'Spanish' ? 'es-ES' : 
                   preferences.preferred_language === 'Hindi' ? 'hi-IN' : 'en-US';

    utterance.onstart = () => {
      setTtsState({ speaking: true, activeId: messageId });
    };

    utterance.onend = () => {
      setTtsState({ speaking: false, activeId: null });
    };

    utterance.onerror = () => {
      setTtsState({ speaking: false, activeId: null });
    };

    window.speechSynthesis.speak(utterance);
  };

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/chat-learn/sessions');
      setSessions(res.data);
      if (res.data.length > 0 && !activeSessionId) {
        selectSession(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error fetching chat sessions.');
    }
  };

  // Select specific session
  const selectSession = async (id) => {
    setActiveSessionId(id);
    setMessages([]);
    setCurrentStreamingText('');
    try {
      const res = await api.get(`/api/chat-learn/sessions/${id}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Error loading session history.');
    }
  };

  // Create new session
  const createNewChat = async (title = 'New Workspace') => {
    try {
      const res = await api.post('/api/chat-learn/sessions', { title });
      setSessions(prev => [res.data, ...prev]);
      setActiveSessionId(res.data.id);
      setMessages([]);
      setCurrentStreamingText('');
      toast.success('New chat session started!');
    } catch (e) {
      console.error(e);
      toast.error('Could not create new session.');
    }
  };

  // Pin session
  const togglePinSession = async (id, isPinned) => {
    try {
      const res = await api.put(`/api/chat-learn/sessions/${id}`, { pinned: !isPinned });
      setSessions(prev => prev.map(s => s.id === id ? res.data : s));
      toast.success(isPinned ? 'Unpinned' : 'Pinned chat');
    } catch (e) {
      console.error(e);
    }
  };

  // Favorite session
  const toggleFavoriteSession = async (id, isFav) => {
    try {
      const res = await api.put(`/api/chat-learn/sessions/${id}`, { favorite: !isFav });
      setSessions(prev => prev.map(s => s.id === id ? res.data : s));
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch (e) {
      console.error(e);
    }
  };

  // Delete session
  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await api.delete(`/api/chat-learn/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
      }
      toast.success('Chat deleted.');
    } catch (e) {
      console.error(e);
      toast.error('Could not delete session.');
    }
  };

  // Save changes to Preferences
  const savePreferences = async (updatedPref) => {
    try {
      const res = await api.post('/api/chat-learn/preferences', updatedPref);
      setPreferences(res.data);
      toast.success('AI Settings updated!');
    } catch (e) {
      console.error(e);
      toast.error('Error saving settings.');
    }
  };

  // Handle Drag & Drop uploads
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input select
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  // Upload file API call
  const uploadFile = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/chat-learn/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadDraft({
        file_url: res.data.file_url,
        file_name: res.data.file_name,
        file_size: res.data.file_size,
        mime_type: res.data.mime_type,
        parsed_text: res.data.parsed_text
      });
      toast.success(`${file.name} uploaded and analyzed!`);
    } catch (e) {
      console.error(e);
      toast.error('File process failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Send message API call
  const sendMessage = async () => {
    if (!inputText.trim() && !uploadDraft) return;
    if (!activeSessionId) {
      // Auto create session if none active
      await createNewChat(inputText.slice(0, 30) || 'Active Chat');
    }

    const payload = {
      content: inputText || `Analyze file: ${uploadDraft?.file_name}`,
      multimodal_type: uploadDraft ? (uploadDraft.mime_type.startsWith('image/') ? 'image' : 'document') : null,
      file_url: uploadDraft?.file_url || null,
      file_name: uploadDraft?.file_name || null,
      file_size: uploadDraft?.file_size || null,
      parsed_text: uploadDraft?.parsed_text || null,
      api_tool: selectedTool || null,
      agent_type: activeAgent
    };

    // Insert optimistic user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: payload.content,
      multimodal_type: payload.multimodal_type,
      file_url: payload.file_url,
      file_name: payload.file_name,
      file_size: payload.file_size
    }]);

    setInputText('');
    setUploadDraft(null);
    setIsLoading(true);
    setCurrentStreamingText('');

    try {
      const res = await api.post(`/api/chat-learn/sessions/${activeSessionId}/messages`, payload);
      
      // Simulate real-time streaming effect
      const textToStream = res.data.assistantMessage.content;
      let currentIndex = 0;
      const intervalTime = textToStream.length > 500 ? 5 : 12;

      const timer = setInterval(() => {
        if (currentIndex < textToStream.length) {
          setCurrentStreamingText(prev => prev + textToStream.charAt(currentIndex));
          currentIndex++;
        } else {
          clearInterval(timer);
          setMessages(prev => [...prev, res.data.assistantMessage]);
          setCurrentStreamingText('');
          setIsLoading(false);
        }
      }, intervalTime);

    } catch (e) {
      console.error(e);
      toast.error('AI model could not return response.');
      setIsLoading(false);
    }
  };

  // Trigger prompt template click
  const applyPromptTemplate = (promptText) => {
    const filledPrompt = promptText.replace('{topic}', inputText || 'object-oriented theory');
    setInputText(filledPrompt);
    toast.success('Prompt applied!');
  };

  // Generate study roadmap/notes file
  const generateMaterial = async (type, label) => {
    try {
      toast.loading(`Generating educational ${label}...`);
      const res = await api.post('/api/chat-learn/generate-file', {
        name: `${label}.txt`,
        type,
        topic: inputText || 'Computer Networks & Routing Protocols'
      });
      fetchGeneratedFiles();
      toast.dismiss();
      toast.success(`${label} generated and cataloged!`);
    } catch (e) {
      toast.dismiss();
      toast.error('Material generation failed.');
    }
  };

  // Toggle Camera
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      setTimeout(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 500);
    } catch (e) {
      console.error(e);
      toast.error('Camera connection blocked.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Stop camera stream
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
      uploadFile(file);
    }, 'image/jpeg');

    setIsCameraActive(false);
  };

  // Speech Recognition control
  const toggleVoiceListen = () => {
    if (!recognition) {
      toast.error('Voice guide requires active Chrome/Edge browser permissions.');
      return;
    }
    if (isRecordingVoice) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Copy response markdown
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Helper: Regex Markdown Parser to keep layout clean without external conflicts
  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Code Blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre class="md-pre"><code>$1</code></pre>');
    html = html.replace(/`(.*?)`/gim, '<code class="md-inline">$1</code>');

    // Tip Alerts
    html = html.replace(/> \[!TIP\]\s*\n*([\s\S]*?)(?=\n\n|\n$|$)/gim, '<div class="alert tip-alert">💡 <strong>Tip:</strong> $1</div>');
    html = html.replace(/> \[!IMPORTANT\]\s*\n*([\s\S]*?)(?=\n\n|\n$|$)/gim, '<div class="alert important-alert">🚨 <strong>Important:</strong> $1</div>');

    // Tables
    const lines = html.split('\n');
    let inTable = false;
    let tableRows = [];
    let processedLines = [];

    lines.forEach(line => {
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!inTable) {
          inTable = true;
        }
        // Skip separator rows
        if (!line.includes('---')) {
          const cols = line.split('|').map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
          tableRows.push(cols);
        }
      } else {
        if (inTable) {
          // Render collected table
          let tableHtml = '<table class="md-table"><thead><tr>';
          tableRows[0].forEach(header => {
            tableHtml += `<th>${header}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
          for (let r = 1; r < tableRows.length; r++) {
            tableHtml += '<tr>';
            tableRows[r].forEach(cell => {
              tableHtml += `<td>${cell}</td>`;
            });
            tableHtml += '</tr>';
          }
          tableHtml += '</tbody></table>';
          processedLines.push(tableHtml);
          inTable = false;
          tableRows = [];
        }
        processedLines.push(line);
      }
    });
    
    html = processedLines.join('\n');

    // Line Breaks & Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/\n\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Custom interactive card component for quizzes parsed dynamically
  const renderQuizCard = (text) => {
    // Basic regex query to check if there is a quiz in the text
    if (!text.toLowerCase().includes('quiz')) return null;

    return (
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/10 mt-3">
        <h4 className="font-bold text-sm text-[#3B82F6] flex items-center gap-2 mb-2">
          📝 Knowledge Check active!
        </h4>
        <p className="text-xs text-var(--db-text-muted) mb-3">
          Solve the quick multiple-choice questions parsed directly from this learning concept!
        </p>
        <button 
          onClick={() => toast.success('Quiz answers are unlocked at the bottom of the response!')}
          className="text-xs bg-[#3B82F6] text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-blue-600 transition"
        >
          Check Quiz Status
        </button>
      </div>
    );
  };

  const filteredSessions = sessions.filter(s => {
    if (activeTab === 'pinned') return s.pinned;
    if (activeTab === 'favorite') return s.favorite;
    if (searchQuery) return s.title.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  return (
    <div className="chat-learn-container" onDragOver={handleDragOver} onDrop={handleDrop}>
      {/* SIDEBAR */}
      <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="chat-sidebar-header">
          <button className="new-chat-btn" onClick={() => createNewChat()}>
            <Plus size={18} />
            <span>New Chat Workspace</span>
          </button>
          
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-var(--db-text-muted)">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search workspaces..."
              className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-sm rounded-xl py-2 pl-9 pr-3 text-[var(--db-text-main)] focus:outline-none focus:border-[var(--db-text-accent)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="chat-tabs">
          <button className={`chat-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
          <button className={`chat-tab ${activeTab === 'pinned' ? 'active' : ''}`} onClick={() => setActiveTab('pinned')}>📌 Pinned</button>
          <button className={`chat-tab ${activeTab === 'favorite' ? 'active' : ''}`} onClick={() => setActiveTab('favorite')}>⭐ Favorites</button>
        </div>

        {/* Workspace Sessions list */}
        <div className="chat-sessions-list custom-sidebar-scroll">
          {filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                className={`chat-session-item ${isActive ? 'active' : ''}`}
                onClick={() => selectSession(session.id)}
              >
                <div className="session-title-wrapper">
                  <span className="session-icon">{session.pinned ? '📌' : '💬'}</span>
                  <span className="session-title">{session.title}</span>
                </div>
                <div className="session-actions">
                  <button
                    className={`session-action-btn pin ${session.pinned ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); togglePinSession(session.id, session.pinned); }}
                    title="Pin workspace"
                  >
                    <Pin size={12} />
                  </button>
                  <button
                    className={`session-action-btn fav ${session.favorite ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleFavoriteSession(session.id, session.favorite); }}
                    title="Favorite workspace"
                  >
                    <Star size={12} />
                  </button>
                  <button
                    className="session-action-btn"
                    onClick={(e) => deleteSession(session.id, e)}
                    title="Delete workspace"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredSessions.length === 0 && (
            <div className="text-center py-6 text-xs text-[var(--db-text-muted)]">
              No active workspaces found.
            </div>
          )}
        </div>

        {/* Accordions */}
        <div className="sidebar-section">
          <div className="sidebar-section-title" onClick={() => setAccordionOpen(prev => ({ ...prev, tools: !prev.tools }))}>
            <span>🚀 AI Agent Tools</span>
            <span>{accordionOpen.tools ? '▼' : '►'}</span>
          </div>
          {accordionOpen.tools && (
            <div className="sidebar-section-content">
              {['AI Tutor', 'Programming Assistant', 'Math Solver', 'Science Tutor', 'Electronics Expert', 'Hardware Expert', 'Resume Analyzer', 'Interview Coach'].map(tool => (
                <div
                  key={tool}
                  className={`library-item ${selectedTool === tool ? 'bg-[#2563EB]/15 border border-[#2563EB]/25 text-[#3B82F6]' : ''}`}
                  onClick={() => setSelectedTool(prev => prev === tool ? null : tool)}
                >
                  <span>🧠</span>
                  <span>{tool}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title" onClick={() => setAccordionOpen(prev => ({ ...prev, prompts: !prev.prompts }))}>
            <span>📚 Prompt Library</span>
            <span>{accordionOpen.prompts ? '▼' : '►'}</span>
          </div>
          {accordionOpen.prompts && (
            <div className="sidebar-section-content">
              {promptTemplates.map(template => (
                <div
                  key={template.id}
                  className="library-item"
                  onClick={() => applyPromptTemplate(template.prompt)}
                  title={template.prompt}
                >
                  <span>📝</span>
                  <span className="truncate">{template.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title" onClick={() => setAccordionOpen(prev => ({ ...prev, analytics: !prev.analytics }))}>
            <span>📊 ML Analytics insights</span>
            <span>{accordionOpen.analytics ? '▼' : '►'}</span>
          </div>
          {accordionOpen.analytics && (
            <div className="sidebar-section-content p-2 bg-[var(--db-card-bg-elevated)] rounded-xl border border-[var(--db-sidebar-border)] text-xs gap-2">
              <div><strong>Learning Type:</strong> {mlAnalytics.learningPattern}</div>
              <div><strong>Estimated Study Time:</strong> {mlAnalytics.studyTimePredictionMinutes} mins</div>
              <div><strong>Predicted Score:</strong> {mlAnalytics.examScorePrediction}</div>
              <div><strong>Weak topics detected:</strong></div>
              {mlAnalytics.recommendations.map((r, i) => (
                <div key={i} className="pl-2 border-l-2 border-[#2563EB] text-[var(--db-text-muted)]">
                  • {r.weak_topic}: <span className="text-[10px] text-red-400">{r.detected_pattern}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title" onClick={() => setAccordionOpen(prev => ({ ...prev, files: !prev.files }))}>
            <span>📁 Generated Materials</span>
            <span>{accordionOpen.files ? '▼' : '►'}</span>
          </div>
          {accordionOpen.files && (
            <div className="sidebar-section-content">
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button onClick={() => generateMaterial('pdf', 'Summary Notes')} className="bg-[var(--db-input-bg)] py-1.5 rounded hover:bg-gray-800 text-[var(--db-text-main)] border border-[var(--db-input-border)]">📄 Notes PDF</button>
                <button onClick={() => generateMaterial('slides', 'Lesson Slides')} className="bg-[var(--db-input-bg)] py-1.5 rounded hover:bg-gray-800 text-[var(--db-text-main)] border border-[var(--db-input-border)]">🖼️ Slides Deck</button>
                <button onClick={() => generateMaterial('document', 'Quiz Questions')} className="bg-[var(--db-input-bg)] py-1.5 rounded hover:bg-gray-800 text-[var(--db-text-main)] border border-[var(--db-input-border)]">📝 Quiz Paper</button>
                <button onClick={() => generateMaterial('code', 'Blueprint Program')} className="bg-[var(--db-input-bg)] py-1.5 rounded hover:bg-gray-800 text-[var(--db-text-main)] border border-[var(--db-input-border)]">💻 Boilerplate Code</button>
              </div>
              <div className="mt-2 text-xs flex flex-col gap-1 max-h-40 overflow-y-auto">
                {generatedFiles.map(f => (
                  <a
                    key={f.id}
                    href={api.defaults.baseURL ? `${api.defaults.baseURL}${f.file_url}` : f.file_url}
                    download
                    className="flex items-center gap-2 p-1 text-[var(--db-text-secondary)] hover:text-white truncate"
                  >
                    <span>📁</span>
                    <span className="truncate">{f.file_name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* CENTER WORKSPACE */}
      <main className="chat-center-area">
        {/* Sleek Agent Selector Row */}
        <div className="agent-selector-row">
          <button 
            className={`agent-selector-btn chatgpt ${activeAgent === 'chatgpt' ? 'active' : ''}`}
            onClick={() => setActiveAgent('chatgpt')}
          >
            <span>🟢</span> ChatGPT
          </button>
          <button 
            className={`agent-selector-btn gemini ${activeAgent === 'gemini' ? 'active' : ''}`}
            onClick={() => setActiveAgent('gemini')}
          >
            <span>🔮</span> Gemini
          </button>
          <button 
            className={`agent-selector-btn claude ${activeAgent === 'claude' ? 'active' : ''}`}
            onClick={() => setActiveAgent('claude')}
          >
            <span>🟠</span> Claude
          </button>
        </div>

        {/* Welcome or Empty State */}
        {messages.length === 0 && !isLoading && (
          <div className="chat-welcome-container">
            <div className="welcome-logo">🧠</div>
            <h2 className="welcome-title">EduVerse Chat & Learn Center</h2>
            <p className="welcome-subtitle">
              Upload study documents, take hardware screenshots, or activate specialized tools like code debuggers to master your subjects.
            </p>
            
            <div className="welcome-grid">
              <div className="welcome-card" onClick={() => createNewChat('Study Plan session')}>
                <div className="welcome-card-icon">⚡</div>
                <div className="welcome-card-title">Personalized Study Plan</div>
                <div className="welcome-card-desc">Generate step-by-step timetables and learning schedules.</div>
              </div>
              <div className="welcome-card" onClick={() => createNewChat('Coding session')}>
                <div className="welcome-card-icon">💻</div>
                <div className="welcome-card-title">Debug & Write Code</div>
                <div className="welcome-card-desc">Practice recursive functions and software structures.</div>
              </div>
            </div>
          </div>
        )}

        {/* Message logs */}
        {(messages.length > 0 || isLoading || currentStreamingText) && (
          <div className="chat-messages-viewport">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message-row ${msg.role}`}>
                <div className={`chat-avatar ${msg.role === 'assistant' ? (activeAgent === 'chatgpt' ? 'chatgpt-avatar' : activeAgent === 'claude' ? 'claude-avatar' : 'gemini-avatar') : ''}`}>
                  {msg.role === 'user' ? '👤' : (activeAgent === 'chatgpt' ? '🟢' : activeAgent === 'claude' ? '🟠' : '🔮')}
                </div>
                <div className="message-bubble-wrapper">
                  <div className="message-bubble">
                    {msg.file_url && (
                      <div className="bubble-attachment-card">
                        <span className="attachment-icon">
                          {msg.multimodal_type === 'image' ? '🖼️' : '📄'}
                        </span>
                        <div className="attachment-details">
                          <span className="attachment-name">{msg.file_name || 'Attached File'}</span>
                          <span className="attachment-size">
                            {msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : ''}
                          </span>
                        </div>
                      </div>
                    )}
                    {renderMarkdown(msg.content)}
                    {msg.role === 'assistant' && renderQuizCard(msg.content)}
                  </div>
                  
                  <div className="message-meta-info">
                    <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.role === 'assistant' && (
                      <>
                        <span>•</span>
                        <button onClick={() => copyToClipboard(msg.content)} className="hover:text-white" title="Copy reply"><Copy size={12} /></button>
                        <span>•</span>
                        <button onClick={() => speakResponse(msg.id, msg.content)} className="hover:text-white" title={ttsState.speaking && ttsState.activeId === msg.id ? "Stop voice" : "Read aloud"}>
                          {ttsState.speaking && ttsState.activeId === msg.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Current Streaming Message */}
            {isLoading && (
              <div className="chat-message-row assistant">
                <div className={`chat-avatar ${activeAgent === 'chatgpt' ? 'chatgpt-avatar' : activeAgent === 'claude' ? 'claude-avatar' : 'gemini-avatar'}`}>
                  {activeAgent === 'chatgpt' ? '🟢' : activeAgent === 'claude' ? '🟠' : '🔮'}
                </div>
                <div className="message-bubble-wrapper">
                  <div className="message-bubble">
                    {currentStreamingText ? (
                      renderMarkdown(currentStreamingText)
                    ) : (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {/* Input & Toolbar */}
        <div className="chat-bottom-input-container">
          {/* Attachment Preview Tray */}
          {uploadDraft && (
            <div className="draft-attachment-tray">
              <div className="flex items-center gap-2">
                <span>{uploadDraft.mime_type.startsWith('image/') ? '🖼️' : '📄'}</span>
                <span className="text-xs font-semibold text-[var(--db-text-main)] truncate max-w-xs">{uploadDraft.file_name}</span>
                <span className="text-[10px] text-[var(--db-text-muted)]">({(uploadDraft.file_size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={() => setUploadDraft(null)} className="text-red-400 hover:text-red-500 p-1"><X size={14} /></button>
            </div>
          )}

          {/* Active Tool Badge */}
          {selectedTool && (
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/25 p-1.5 px-3 rounded-lg text-xs">
              <div className="flex items-center gap-2 text-[#3B82F6]">
                <span>🛠️ Active Tool:</span>
                <strong>{selectedTool}</strong>
              </div>
              <button onClick={() => setSelectedTool(null)} className="text-gray-400 hover:text-white"><X size={12} /></button>
            </div>
          )}

          {/* Camera Frame */}
          {isCameraActive && (
            <div className="relative w-full max-w-sm mx-auto aspect-video border border-[var(--db-card-border)] rounded-2xl overflow-hidden bg-black flex flex-col justify-end">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover absolute top-0 left-0" />
              <div className="relative z-10 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-3">
                <button onClick={capturePhoto} className="bg-[#2563EB] text-white px-4 py-1.5 rounded-xl font-bold text-xs">Snap Photo</button>
                <button onClick={() => setIsCameraActive(false)} className="bg-gray-700 text-white px-4 py-1.5 rounded-xl font-bold text-xs">Close</button>
              </div>
            </div>
          )}

          {/* Input Search Box */}
          <div className="chat-input-row">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,application/pdf,.xlsx,.xls,.csv,.txt,.docx,.pptx"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="chat-toolbar-btn"
              title="Attach document/image"
              disabled={isUploading}
            >
              <Paperclip size={18} />
            </button>

            <button
              onClick={startCamera}
              className="chat-toolbar-btn"
              title="Take camera snap"
            >
              <Camera size={18} />
            </button>

            <textarea
              className="chat-text-area"
              rows={1}
              placeholder="Ask anything, upload anything, learn anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            {/* Voice Command Button */}
            <button
              onClick={toggleVoiceListen}
              className={`chat-toolbar-btn ${isRecordingVoice ? 'text-red-400' : ''}`}
              title="Voice transcription"
            >
              {isRecordingVoice ? (
                <div className="voice-wave-container">
                  <span className="voice-wave-bar"></span>
                  <span className="voice-wave-bar"></span>
                  <span className="voice-wave-bar"></span>
                </div>
              ) : (
                <Mic size={18} />
              )}
            </button>

            {/* AI Settings Toggle */}
            <button
              onClick={() => setShowSettings(true)}
              className="chat-toolbar-btn"
              title="API Provider Settings"
            >
              <Settings size={18} />
            </button>

            <button
              onClick={sendMessage}
              disabled={isLoading || isUploading || (!inputText.trim() && !uploadDraft)}
              className="chat-send-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* SETTINGS DIALOG */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--db-card-bg)] border border-[var(--db-card-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-[var(--db-text-main)]"
            >
              <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18} /></button>
              
              <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
                ⚙️ Workspace Preferences
              </h3>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--db-text-muted)] uppercase mb-1.5">AI Language</label>
                  <select
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl py-2 px-3 text-sm focus:outline-none text-[var(--db-text-main)]"
                    value={preferences.preferred_language}
                    onChange={(e) => savePreferences({ ...preferences, preferred_language: e.target.value })}
                  >
                    {['English', 'Spanish', 'French', 'German', 'Hindi', 'Kannada'].map(l => (
                      <option key={l} value={l} className="bg-slate-900">{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--db-text-muted)] uppercase mb-1.5">Model Provider</label>
                  <select
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl py-2 px-3 text-sm focus:outline-none text-[var(--db-text-main)]"
                    value={preferences.preferred_model}
                    onChange={(e) => savePreferences({ ...preferences, preferred_model: e.target.value })}
                  >
                    {[
                      { val: 'gemini-2.0-flash', label: 'Google Gemini 2.0 Flash' },
                      { val: 'llama-3.1-8b-instant', label: 'Meta Llama 3.1 8B (Groq)' },
                      { val: 'google/gemini-2.5-flash', label: 'OpenRouter (Gemini 2.5)' },
                      { val: 'meta-llama/Llama-3-8b-chat-hf', label: 'Together AI (Llama 3)' }
                    ].map(m => (
                      <option key={m.val} value={m.val} className="bg-slate-900">{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Switch toggles */}
                <div className="flex items-center justify-between border-t border-[var(--db-sidebar-border)] pt-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Special Learning Mode</span>
                    <span className="text-[10px] text-[var(--db-text-muted)]">Includes quizzes, real-world examples, and visuals.</span>
                  </div>
                  <button
                    onClick={() => savePreferences({ ...preferences, learning_mode_enabled: !preferences.learning_mode_enabled })}
                    className={`w-11 h-6 rounded-full transition relative ${preferences.learning_mode_enabled ? 'bg-[#2563EB]' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${preferences.learning_mode_enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--db-sidebar-border)] pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Text to Speech Autoplay</span>
                    <span className="text-[10px] text-[var(--db-text-muted)]">Voice guides speak out answers automatically.</span>
                  </div>
                  <button
                    onClick={() => savePreferences({ ...preferences, voice_enabled: !preferences.voice_enabled })}
                    className={`w-11 h-6 rounded-full transition relative ${preferences.voice_enabled ? 'bg-[#2563EB]' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${preferences.voice_enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-xl text-sm transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
