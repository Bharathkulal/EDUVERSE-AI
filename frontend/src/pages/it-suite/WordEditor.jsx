import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  AlignJustify, Sparkles, History, MessageSquare, Printer, Download, 
  Mic, MicOff, Volume2, Plus, CornerDownRight, CheckCircle, ChevronDown, 
  Columns, HelpCircle, Save 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ITSuite.css';


export default function WordEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  // Document State
  const [docName, setDocName] = useState('Untitled Document');
  const [docContent, setDocContent] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState('16px');
  const [marginSize, setMarginSize] = useState('25mm');
  const [orientation, setOrientation] = useState('portrait');
  
  // Sidebar & Modal states
  const [activeSidebar, setActiveSidebar] = useState(null); // 'ai', 'history', 'comments'
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedTextRange, setSelectedTextRange] = useState('');
  
  // AI assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTargetLang, setAiTargetLang] = useState('Spanish');
  const [aiResultText, setAiResultText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [citationSource, setCitationSource] = useState({ title: '', authors: '', year: '', type: 'Book' });

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false);
  const recognitionRef = useRef(null);

  // Collaboration State
  const socketRef = useRef(null);
  const [collaborators, setCollaborators] = useState([]);
  const [saveStatus, setSaveStatus] = useState('Saved to Cloud');

  // Load document details
  const loadDocument = async () => {
    try {
      const res = await api.get(`/it-suite/documents/${id}`);
      setDocName(res.data.name);
      setDocContent(res.data.content || '');
      if (editorRef.current) {
        editorRef.current.innerHTML = res.data.content || '';
      }
    } catch (err) {
      toast.error('Failed to load document');
      navigate('/it-suite');
    }
  };

  // Socket setup for collaboration
  useEffect(() => {
    loadDocument();
    
    // Connect to WebSocket server (uses same origin base URL)
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('join-document', { documentId: id, username: user?.name });

    socket.on('user-joined', ({ username, socketId }) => {
      setCollaborators(prev => [...prev, { username, socketId }]);
      toast.success(`${username} joined editing session`);
    });

    socket.on('document-remote-update', ({ content }) => {
      setSaveStatus('Receiving edits...');
      setDocContent(content);
      if (editorRef.current && editorRef.current.innerHTML !== content) {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const offset = range ? range.startOffset : 0;
        
        editorRef.current.innerHTML = content;
        
        // Try restoring cursor
        if (range && editorRef.current.firstChild) {
          try {
            const newRange = document.createRange();
            newRange.setStart(editorRef.current.firstChild, Math.min(offset, editorRef.current.innerHTML.length));
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch(e) {}
        }
      }
      setTimeout(() => setSaveStatus('Saved to Cloud'), 800);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  // Handle autosave every 2 seconds when typing
  const autosaveTimeout = useRef(null);
  const handleContentChange = (e) => {
    const content = e.target.innerHTML;
    setDocContent(content);
    setSaveStatus('Saving changes...');

    // Emit socket event to notify other users
    if (socketRef.current) {
      socketRef.current.emit('document-update', { documentId: id, content });
    }

    if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    autosaveTimeout.current = setTimeout(async () => {
      try {
        await api.put(`/it-suite/documents/${id}`, { content });
        setSaveStatus('Saved to Cloud');
      } catch (err) {
        setSaveStatus('Offline Sync Error');
      }
    }, 2000);
  };

  // Format selection command
  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      handleContentChange({ target: editorRef.current });
    }
  };

  // Web Speech API - Voice Typing (Speech to Text)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript && editorRef.current) {
          editorRef.current.focus();
          document.execCommand('insertHTML', false, ` ${finalTranscript}`);
          handleContentChange({ target: editorRef.current });
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceTyping = () => {
    if (!recognitionRef.current) {
      toast.error('Voice typing is not supported by your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.success('Voice dictation stopped');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Speak now: dictating text...');
    }
  };

  // Text To Speech (Read Out Aloud)
  const handleReadAloud = () => {
    if (!window.speechSynthesis) {
      toast.error('Text-to-speech is not supported by your browser.');
      return;
    }

    if (speechSynthesisActive) {
      window.speechSynthesis.cancel();
      setSpeechSynthesisActive(false);
    } else {
      const text = editorRef.current ? editorRef.current.innerText : '';
      if (!text.trim()) {
        toast.error('Document is empty');
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeechSynthesisActive(false);
      utterance.onerror = () => setSpeechSynthesisActive(false);
      setSpeechSynthesisActive(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Document version control
  const loadVersions = async () => {
    try {
      const res = await api.get(`/it-suite/documents/${id}/versions`);
      setVersions(res.data || []);
    } catch (err) {
      toast.error('Failed to load version history');
    }
  };

  const handleRestoreVersion = async (v) => {
    if (!window.confirm(`Restore document to version ${v.version_number}?`)) return;
    setDocContent(v.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = v.content;
    }
    try {
      await api.put(`/it-suite/documents/${id}`, { content: v.content });
      toast.success(`Restored version ${v.version_number}`);
      setActiveSidebar(null);
    } catch (e) {
      toast.error('Error saving restored content');
    }
  };

  // Comments section
  const loadComments = async () => {
    try {
      const res = await api.get(`/it-suite/documents/${id}/comments`);
      setComments(res.data || []);
    } catch (err) {
      toast.error('Failed to load comments');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const res = await api.post(`/it-suite/documents/${id}/comments`, {
        comment_text: newCommentText,
        selection_range: selectedTextRange
      });
      setComments([...comments, res.data]);
      setNewCommentText('');
      setSelectedTextRange('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error('Error posting comment');
    }
  };

  const handleResolveComment = async (commentId) => {
    try {
      await api.put(`/it-suite/comments/${commentId}/resolve`);
      toast.success('Comment resolved');
      loadComments();
    } catch (err) {
      toast.error('Error resolving comment');
    }
  };

  // Capture selected text to comment on
  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      setSelectedTextRange(sel.toString().trim());
    }
  };

  // AI assistant integration
  const handleAiAction = async (action) => {
    setAiLoading(true);
    setAiResultText('');
    try {
      const text = window.getSelection()?.toString() || editorRef.current?.innerText || '';
      const body = { action, contextText: text, prompt: aiPrompt };
      
      if (action === 'translate') {
        body.targetLang = aiTargetLang;
      }
      
      const res = await api.post('/it-suite/ai', body);
      setAiResultText(res.data.text);
    } catch (err) {
      toast.error('AI assistant request failed');
    } finally {
      setAiLoading(false);
    }
  };

  // Citation Generator Helper
  const handleGenerateCitation = () => {
    const { title, authors, year, type } = citationSource;
    if (!title || !authors || !year) {
      toast.error('Please fill in title, authors, and year.');
      return;
    }
    let citation = '';
    if (type === 'Book') {
      citation = `${authors}. <em>${title}</em>. Publisher, ${year}.`;
    } else {
      citation = `"${title}." <em>Journal of EduVerse</em>, vol. 1, no. 1, ${year}, pp. 10-15.`;
    }
    
    // Insert citation at cursor
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, ` (${citation})`);
    if (editorRef.current) {
      handleContentChange({ target: editorRef.current });
    }
    toast.success('Citation inserted!');
  };

  // Export formats
  const handleExport = (format) => {
    let data = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'markdown') {
      data = editorRef.current?.innerText || '';
      mimeType = 'text/markdown';
      ext = 'md';
    } else if (format === 'html') {
      data = editorRef.current?.innerHTML || '';
      mimeType = 'text/html';
      ext = 'html';
    } else if (format === 'docx') {
      // Create a mock rich text document download
      data = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0\\fnil\\fcharset0 Arial;}}\n\\viewkind4\\uc1\\pard\\lang1033\\f0\\fs24 ${editorRef.current?.innerText || ''}\\par\n}`;
      mimeType = 'application/rtf';
      ext = 'rtf';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docName.replace(/\s+/g, '_')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  // Document Word Count
  const getWordCount = () => {
    const text = editorRef.current?.innerText || '';
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  return (
    <div className="word-editor-container bg-[var(--db-page-bg)] flex flex-col h-full w-full">
      {/* Header controls bar */}
      <div className="bg-[var(--db-card-bg)] border-b border-[var(--db-sidebar-border)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <input 
              type="text" 
              value={docName} 
              onChange={async (e) => {
                setDocName(e.target.value);
                await api.put(`/it-suite/documents/${id}`, { name: e.target.value });
              }}
              className="text-lg font-bold bg-transparent border-b border-transparent hover:border-blue-500 focus:border-blue-500 focus:outline-none text-[var(--db-text-main)] max-w-xs md:max-w-md"
            />
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--db-text-muted)]">
              <span className="font-semibold text-emerald-500 flex items-center gap-1">
                <CheckCircle size={12} /> {saveStatus}
              </span>
              {collaborators.length > 0 && (
                <span>• {collaborators.length} user(s) collaborating</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Print/Preview */}
          <button 
            onClick={() => window.print()}
            className="p-2 bg-[var(--db-input-bg)] hover:bg-[var(--db-btn-secondary-hover)] rounded-xl border border-[var(--db-input-border)] text-sm font-bold flex items-center gap-1.5 cursor-pointer"
            title="Print Preview"
          >
            <Printer size={16} /> Print
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="p-2 bg-[var(--db-input-bg)] hover:bg-[var(--db-btn-secondary-hover)] rounded-xl border border-[var(--db-input-border)] text-sm font-bold flex items-center gap-1.5 cursor-pointer">
              <Download size={16} /> Export <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 mt-2 w-36 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-xl shadow-2xl overflow-hidden hidden group-hover:block z-50">
              <button onClick={() => handleExport('markdown')} className="w-full text-left px-4 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs font-semibold">Markdown (.md)</button>
              <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs font-semibold">HTML (.html)</button>
              <button onClick={() => handleExport('docx')} className="w-full text-left px-4 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs font-semibold">Word RTF (.rtf)</button>
            </div>
          </div>

          <button 
            onClick={() => navigate('/it-suite')}
            className="px-4 py-2 border border-[var(--db-sidebar-border)] text-xs font-bold hover:bg-[var(--db-btn-secondary-hover)] rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Editing Toolbar */}
      <div className="bg-[var(--db-card-bg)] border-b border-[var(--db-sidebar-border)] p-2 px-4 flex flex-wrap items-center gap-2">
        {/* Font Family selector */}
        <select 
          value={fontFamily} 
          onChange={(e) => setFontFamily(e.target.value)}
          className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-xs rounded-lg p-1.5 focus:outline-none text-[var(--db-text-main)] font-semibold"
        >
          <option value="Inter">Inter (Sans-Serif)</option>
          <option value="Georgia">Georgia (Serif)</option>
          <option value="Courier Prime">Courier (Monospace)</option>
        </select>

        {/* Font Size selector */}
        <select 
          value={fontSize} 
          onChange={(e) => setFontSize(e.target.value)}
          className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-xs rounded-lg p-1.5 focus:outline-none text-[var(--db-text-main)] font-semibold"
        >
          <option value="12px">12 px</option>
          <option value="14px">14 px</option>
          <option value="16px">16 px</option>
          <option value="18px">18 px</option>
          <option value="24px">24 px</option>
          <option value="32px">32 px</option>
        </select>

        <span className="h-4 w-[1px] bg-[var(--db-sidebar-border)]"></span>

        {/* Text Styles */}
        <button onClick={() => executeCommand('bold')} className="p-1.5 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition" title="Bold"><Bold size={16} /></button>
        <button onClick={() => executeCommand('italic')} className="p-1.5 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition" title="Italic"><Italic size={16} /></button>
        <button onClick={() => executeCommand('underline')} className="p-1.5 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition" title="Underline"><Underline size={16} /></button>

        <span className="h-4 w-[1px] bg-[var(--db-sidebar-border)]"></span>

        {/* Alignments */}
        <button onClick={() => executeCommand('justifyLeft')} className="p-1.5 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition" title="Align Left"><AlignLeft size={16} /></button>
        <button onClick={() => executeCommand('justifyCenter')} className="p-1.5 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition" title="Align Center"><AlignCenter size={16} /></button>
        <button onClick={() => executeCommand('justifyRight')} className="p-1.5 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition" title="Align Right"><AlignRight size={16} /></button>
        <button onClick={() => executeCommand('justifyFull')} className="p-1.5 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition" title="Justify"><AlignJustify size={16} /></button>

        <span className="h-4 w-[1px] bg-[var(--db-sidebar-border)]"></span>

        {/* Layout Margins / Page setups */}
        <select 
          value={marginSize} 
          onChange={(e) => setMarginSize(e.target.value)}
          className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-xs rounded-lg p-1.5 focus:outline-none text-[var(--db-text-main)] font-semibold"
          title="Page Margins"
        >
          <option value="15mm">Narrow Margins (15mm)</option>
          <option value="25mm">Normal Margins (25mm)</option>
          <option value="35mm">Wide Margins (35mm)</option>
        </select>

        <select 
          value={orientation} 
          onChange={(e) => setOrientation(e.target.value)}
          className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-xs rounded-lg p-1.5 focus:outline-none text-[var(--db-text-main)] font-semibold"
          title="Orientation"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>

        <span className="h-4 w-[1px] bg-[var(--db-sidebar-border)]"></span>

        {/* Voice dictation */}
        <button 
          onClick={toggleVoiceTyping} 
          className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-bold ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`} 
          title="Voice Dictation"
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />} Voice Typing
        </button>

        {/* Speech Synth */}
        <button 
          onClick={handleReadAloud} 
          className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-bold ${speechSynthesisActive ? 'bg-blue-500 text-white' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`} 
          title="Read Document Aloud"
        >
          <Volume2 size={16} /> Read Aloud
        </button>

        {/* Right side drawer controllers */}
        <div className="ml-auto flex items-center gap-1">
          <button 
            onClick={() => { setActiveSidebar(activeSidebar === 'ai' ? null : 'ai'); }} 
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${activeSidebar === 'ai' ? 'bg-blue-600 text-white' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}
          >
            <Sparkles size={15} /> AI Assistant
          </button>
          <button 
            onClick={() => { setActiveSidebar(activeSidebar === 'history' ? null : 'history'); loadVersions(); }} 
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${activeSidebar === 'history' ? 'bg-blue-600 text-white' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}
          >
            <History size={15} /> Revisions
          </button>
          <button 
            onClick={() => { setActiveSidebar(activeSidebar === 'comments' ? null : 'comments'); loadComments(); }} 
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${activeSidebar === 'comments' ? 'bg-blue-600 text-white' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}
          >
            <MessageSquare size={15} /> Comments
          </button>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-sidebar-scroll bg-gray-100 dark:bg-zinc-900">
          <div 
            ref={editorRef}
            contentEditable 
            onInput={handleContentChange}
            onMouseUp={handleSelection}
            onKeyUp={handleSelection}
            className="word-page-sheet"
            style={{ 
              fontFamily: fontFamily === 'Courier Prime' ? 'Courier New, monospace' : fontFamily,
              fontSize: fontSize,
              padding: marginSize,
              width: orientation === 'landscape' ? '297mm' : '210mm',
              minHeight: orientation === 'landscape' ? '210mm' : '297mm',
            }}
          />
        </div>

        {/* Side Drawer Panels */}
        <AnimatePresence>
          {activeSidebar && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[var(--db-card-bg)] border-l border-[var(--db-sidebar-border)] h-full overflow-y-auto p-5 flex flex-col justify-between custom-sidebar-scroll"
            >
              {/* AI SIDEBAR */}
              {activeSidebar === 'ai' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--db-sidebar-border)] pb-2 text-blue-500">
                      <Sparkles size={16} /> AI Writing Assistant
                    </h3>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[var(--db-text-muted)]">Target prompt instruction</label>
                      <textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Expand this section, write a paragraph about databases..."
                        className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-xs text-[var(--db-text-main)]"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleAiAction('rewrite')}
                        disabled={aiLoading}
                        className="py-2 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)] text-xs rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Rewrite
                      </button>
                      <button 
                        onClick={() => handleAiAction('summarize')}
                        disabled={aiLoading}
                        className="py-2 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)] text-xs rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Summarize
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <select 
                        value={aiTargetLang} 
                        onChange={(e) => setAiTargetLang(e.target.value)}
                        className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-xs rounded-xl p-2 focus:outline-none text-[var(--db-text-main)] font-semibold flex-1"
                      >
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                      <button 
                        onClick={() => handleAiAction('translate')}
                        disabled={aiLoading}
                        className="py-2 px-4 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)] text-xs rounded-xl font-bold transition cursor-pointer"
                      >
                        Translate
                      </button>
                    </div>

                    {aiLoading && (
                      <div className="text-xs text-[var(--db-text-muted)] animate-pulse flex items-center gap-1">
                        <Sparkles size={12} className="animate-spin text-blue-500" /> Thinking...
                      </div>
                    )}

                    {aiResultText && (
                      <div className="p-3 bg-[var(--db-input-bg)] rounded-xl border border-[var(--db-input-border)] text-xs text-[var(--db-text-main)] max-h-48 overflow-y-auto">
                        <h4 className="font-extrabold text-[10px] text-blue-500 uppercase mb-1">AI Output</h4>
                        <p className="whitespace-pre-wrap">{aiResultText}</p>
                        <button 
                          onClick={() => {
                            editorRef.current?.focus();
                            document.execCommand('insertHTML', false, aiResultText);
                            handleContentChange({ target: editorRef.current });
                          }}
                          className="mt-2 text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          Insert at cursor
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CITATION GENERATOR */}
                  <div className="border-t border-[var(--db-sidebar-border)] pt-4 space-y-3">
                    <h3 className="font-extrabold text-sm border-b border-[var(--db-sidebar-border)] pb-2">
                      📚 Citation Generator
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <select 
                        value={citationSource.type} 
                        onChange={(e) => setCitationSource({...citationSource, type: e.target.value})}
                        className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] p-1.5 rounded-lg"
                      >
                        <option value="Book">Book</option>
                        <option value="Journal">Journal Article</option>
                      </select>
                      <input 
                        type="text" placeholder="Authors" value={citationSource.authors}
                        onChange={(e) => setCitationSource({...citationSource, authors: e.target.value})}
                        className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] p-1.5 rounded-lg text-xs"
                      />
                    </div>
                    <input 
                      type="text" placeholder="Title" value={citationSource.title}
                      onChange={(e) => setCitationSource({...citationSource, title: e.target.value})}
                      className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] p-1.5 rounded-lg text-xs"
                    />
                    <div className="flex gap-2">
                      <input 
                        type="number" placeholder="Year" value={citationSource.year}
                        onChange={(e) => setCitationSource({...citationSource, year: e.target.value})}
                        className="w-24 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] p-1.5 rounded-lg text-xs"
                      />
                      <button 
                        onClick={handleGenerateCitation}
                        className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                      >
                        Insert Citation
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* REVISIONS HISTORY */}
              {activeSidebar === 'history' && (
                <div className="space-y-4 flex-1">
                  <h3 className="font-extrabold text-sm border-b border-[var(--db-sidebar-border)] pb-2 flex items-center gap-1.5">
                    <History size={16} /> Version History
                  </h3>
                  {versions.length === 0 ? (
                    <span className="text-xs text-[var(--db-text-muted)]">No older versions saved.</span>
                  ) : (
                    <div className="space-y-2">
                      {versions.map((v) => (
                        <div 
                          key={v.id}
                          className="p-3 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-2xl flex flex-col justify-between hover:border-blue-500 cursor-pointer"
                          onClick={() => handleRestoreVersion(v)}
                        >
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>Version {v.version_number}</span>
                            <span className="text-[10px] text-[var(--db-text-muted)]">{new Date(v.created_at).toLocaleTimeString()}</span>
                          </div>
                          <span className="text-[10px] text-[var(--db-text-muted)] mt-1">Author: {v.author_name || 'Autosave'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COMMENTS THREADS */}
              {activeSidebar === 'comments' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 overflow-y-auto max-h-[60vh] custom-sidebar-scroll">
                    <h3 className="font-extrabold text-sm border-b border-[var(--db-sidebar-border)] pb-2 flex items-center gap-1.5">
                      <MessageSquare size={16} /> Document Comments
                    </h3>
                    
                    {comments.filter(c => !c.resolved).length === 0 ? (
                      <span className="text-xs text-[var(--db-text-muted)] block text-center py-4">No active comments. Highlight text to write one!</span>
                    ) : (
                      <div className="space-y-3">
                        {comments.filter(c => !c.resolved).map((c) => (
                          <div key={c.id} className="p-3 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-2xl text-xs space-y-1.5">
                            <div className="flex justify-between items-center font-bold">
                              <span>{c.author_name}</span>
                              <button onClick={() => handleResolveComment(c.id)} className="p-1 hover:bg-[var(--db-btn-secondary-hover)] rounded-md text-emerald-500" title="Resolve">
                                <CheckCircle size={14} />
                              </button>
                            </div>
                            {c.selection_range && (
                              <p className="p-1 bg-yellow-100 text-gray-800 text-[10px] rounded italic border-l-2 border-yellow-500">
                                "{c.selection_range}"
                              </p>
                            )}
                            <p className="text-[var(--db-text-main)] font-medium">{c.comment_text}</p>
                            <span className="text-[9px] text-[var(--db-text-muted)]">{new Date(c.created_at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="border-t border-[var(--db-sidebar-border)] pt-4 space-y-2">
                    {selectedTextRange && (
                      <div className="text-[10px] text-[var(--db-text-muted)] italic truncate">
                        Linking to: "{selectedTextRange}"
                      </div>
                    )}
                    <input 
                      type="text" 
                      placeholder="Type a comment..." 
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 text-[var(--db-text-main)]"
                    />
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Post Comment
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Word Count & Indicators */}
      <div className="bg-[var(--db-card-bg)] border-t border-[var(--db-sidebar-border)] p-2 px-6 flex justify-between text-xs text-[var(--db-text-muted)]">
        <span>Word Count: <strong>{getWordCount()}</strong> words</span>
        <span>A4 Format • Margins: {marginSize}</span>
      </div>
    </div>
  );
}
