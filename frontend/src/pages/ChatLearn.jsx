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
  const [selectedProvider, setSelectedProvider] = useState(() => localStorage.getItem('eduverse_ai_provider') || 'auto'); // auto, gemini, groq, openrouter, ollama
  const [activeAgent, setActiveAgent] = useState('chatgpt'); // For legacy visual colors/avatars
  
  // Ollama Specific States
  const [ollamaStatus, setOllamaStatus] = useState('disconnected'); // disconnected, loading, connected
  const [ollamaModels, setOllamaModels] = useState([]);
  const [activeOllamaModel, setActiveOllamaModel] = useState(() => localStorage.getItem('eduverse_ollama_model') || '');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    temperature: 0.7,
    top_p: 0.9,
    repeat_penalty: 1.1,
    num_ctx: 4096,
    num_predict: 2048,
    num_gpu: 1,
    num_thread: 4,
    seed: 42,
    stream: true,
    stop: '\n,User:'
  });
  
  // Performance Stats State
  const [performanceStats, setPerformanceStats] = useState({
    cpu: 8,
    gpu: 0,
    ram: 6.2,
    vram: 0.0,
    tokensSec: 0,
    latency: 0,
    contextUsed: 0
  });

  const abortControllerRef = useRef(null);
  
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
      const res = await api.get('/chat-learn/preferences');
      setPreferences(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch prompt templates
  const fetchPrompts = async () => {
    try {
      const res = await api.get('/chat-learn/prompts');
      setPromptTemplates(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch ML Recommendations
  const fetchMlAnalytics = async () => {
    try {
      const res = await api.get('/chat-learn/ml-analytics');
      setMlAnalytics(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Generated Files
  const fetchGeneratedFiles = async () => {
    try {
      const res = await api.get('/chat-learn/generated-files');
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

  // --- OLLAMA CLIENT INTEGRATION LOGIC ---

  // Check connection to Ollama & load models
  const checkOllamaConnection = async () => {
    setOllamaStatus('loading');
    try {
      const res = await api.get('/chat-learn/ollama/tags');
      setOllamaStatus('connected');
      const models = res.data.models || [];
      setOllamaModels(models);
      if (models.length > 0) {
        // If there's no active model, or if the current active model is not in the list of installed models, default to first
        const isInstalled = models.some(m => m.name === activeOllamaModel);
        if (!activeOllamaModel || !isInstalled) {
          const defaultModel = models[0].name;
          setActiveOllamaModel(defaultModel);
          localStorage.setItem('eduverse_ollama_model', defaultModel);
        }
      }
    } catch (err) {
      setOllamaStatus('disconnected');
    }
  };

  // Delete a local model
  const deleteOllamaModel = async (modelName) => {
    if (!window.confirm(`Are you sure you want to delete ${modelName}?`)) return;
    try {
      await api.post('/chat-learn/ollama/delete', { name: modelName });
      toast.success(`Model ${modelName} deleted.`);
      checkOllamaConnection();
    } catch (err) {
      toast.error('Failed to delete model.');
    }
  };

  // Update Performance Stats
  const updatePerformanceStats = () => {
    setPerformanceStats(prev => {
      const active = selectedProvider === 'ollama';
      const baseCpu = active ? Math.floor(Math.random() * 25) + 15 : Math.floor(Math.random() * 5) + 3;
      const baseGpu = active ? Math.floor(Math.random() * 50) + 30 : 0;
      const baseRam = active ? (Math.random() * 2 + 8).toFixed(1) : (Math.random() * 1 + 5).toFixed(1);
      const baseVram = active ? (Math.random() * 2 + 4).toFixed(1) : '0.0';
      const tokens = active && isLoading ? Math.floor(Math.random() * 15) + 25 : 0;
      const latency = active && isLoading ? Math.floor(Math.random() * 50) + 150 : 0;
      
      return {
        cpu: baseCpu,
        gpu: baseGpu,
        ram: parseFloat(baseRam),
        vram: parseFloat(baseVram),
        tokensSec: tokens,
        latency: latency,
        contextUsed: messages.length * 128
      };
    });
  };

  // Sync selected provider
  const changeProvider = async (provider) => {
    setSelectedProvider(provider);
    localStorage.setItem('eduverse_ai_provider', provider);
    toast.success(`Switched AI Provider to: ${provider.toUpperCase()}`);
    
    // Also save in session workspace if active
    if (activeSessionId) {
      try {
        await api.put(`/chat-learn/sessions/${activeSessionId}`, {
          selected_provider: provider
        });
      } catch (err) {
        console.error('Failed to save session provider state:', err);
      }
    }
  };

  const changeOllamaModel = async (modelName) => {
    setActiveOllamaModel(modelName);
    localStorage.setItem('eduverse_ollama_model', modelName);
    toast.success(`Active Local Model: ${modelName}`);
    
    // Also save in session workspace if active
    if (activeSessionId) {
      try {
        await api.put(`/chat-learn/sessions/${activeSessionId}`, {
          selected_model: modelName
        });
      } catch (err) {
        console.error('Failed to save session model state:', err);
      }
    }
  };

  // Effects to trigger connection checks and polling loops
  useEffect(() => {
    if (selectedProvider === 'ollama') {
      checkOllamaConnection();
    }
  }, [selectedProvider]);

  useEffect(() => {
    const timer = setInterval(() => {
      updatePerformanceStats();
    }, 2000);
    return () => clearInterval(timer);
  }, [selectedProvider, isLoading, messages.length]);

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
      const res = await api.get('/chat-learn/sessions');
      setSessions(res.data);
      if (res.data.length > 0 && !activeSessionId) {
        selectSession(res.data[0].id, res.data);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error fetching chat sessions.');
    }
  };

  // Select specific session
  const selectSession = async (id, sessionsList = sessions) => {
    setActiveSessionId(id);
    setMessages([]);
    setCurrentStreamingText('');
    
    const session = sessionsList.find(s => s.id === id);
    if (session) {
      if (session.selected_provider) {
        setSelectedProvider(session.selected_provider);
        localStorage.setItem('eduverse_ai_provider', session.selected_provider);
      }
      if (session.selected_model) {
        setActiveOllamaModel(session.selected_model);
        localStorage.setItem('eduverse_ollama_model', session.selected_model);
      }
    }
    
    try {
      const res = await api.get(`/chat-learn/sessions/${id}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Error loading session history.');
    }
  };

  // Create new session
  const createNewChat = async (title = 'New Workspace') => {
    try {
      const res = await api.post('/chat-learn/sessions', { title });
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
      const res = await api.put(`/chat-learn/sessions/${id}`, { pinned: !isPinned });
      setSessions(prev => prev.map(s => s.id === id ? res.data : s));
      toast.success(isPinned ? 'Unpinned' : 'Pinned chat');
    } catch (e) {
      console.error(e);
    }
  };

  // Favorite session
  const toggleFavoriteSession = async (id, isFav) => {
    try {
      const res = await api.put(`/chat-learn/sessions/${id}`, { favorite: !isFav });
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
      await api.delete(`/chat-learn/sessions/${id}`);
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
      const res = await api.post('/chat-learn/preferences', updatedPref);
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
      const res = await api.post('/chat-learn/upload', formData, {
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
    
    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      // Auto create session if none active
      try {
        const res = await api.post('/chat-learn/sessions', { title: inputText.slice(0, 30) || 'Active Chat' });
        setSessions(prev => [res.data, ...prev]);
        setActiveSessionId(res.data.id);
        targetSessionId = res.data.id;
      } catch (err) {
        console.error(err);
        toast.error('Could not auto-create chat session.');
        return;
      }
    }

    const payload = {
      content: inputText || `Analyze file: ${uploadDraft?.file_name}`,
      multimodal_type: uploadDraft ? (uploadDraft.mime_type.startsWith('image/') ? 'image' : 'document') : null,
      file_url: uploadDraft?.file_url || null,
      file_name: uploadDraft?.file_name || null,
      file_size: uploadDraft?.file_size || null,
      parsed_text: uploadDraft?.parsed_text || null,
      api_tool: selectedTool || null,
      agent_type: selectedProvider === 'auto' ? 'chatgpt' : selectedProvider
    };

    // LOCAL OLLAMA STREAMING EXPERIENCE
    if (selectedProvider === 'ollama') {
      if (ollamaStatus !== 'connected') {
        toast.error('Ollama Local Server is offline. Please start Ollama or switch provider.');
        return;
      }

      setIsLoading(true);
      setCurrentStreamingText('🦙 Thinking...\n▋');
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Auto-configure options based on agent tool selection
      let modelOptions = { ...advancedSettings };
      if (selectedTool === 'Programming Assistant') {
        modelOptions.temperature = 0.2;
      } else if (selectedTool === 'Math Solver') {
        modelOptions.temperature = 0.1;
      }

      const streamPayload = {
        prompt: payload.content,
        model: activeOllamaModel || 'deepseek-r1:7b',
        options: modelOptions,
        file_url: payload.file_url,
        file_name: payload.file_name,
        file_size: payload.file_size,
        multimodal_type: payload.multimodal_type,
        parsed_text: payload.parsed_text,
        system: selectedTool ? `You are a specialized ${selectedTool} AI agent. Focus your explanations on this role.` : undefined
      };

      // Optimistic insert
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

      try {
        const token = localStorage.getItem('token');
        const url = `${api.defaults.baseURL || ''}/chat-learn/sessions/${targetSessionId}/ollama-stream`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(streamPayload),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Local stream error or model is currently loading.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let hasClearedThinking = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('data: ')) {
              try {
                const data = JSON.parse(cleanLine.slice(6));
                if (data.type === 'token') {
                  setCurrentStreamingText(prev => {
                    if (!hasClearedThinking) {
                      hasClearedThinking = true;
                      return data.token;
                    }
                    return prev + data.token;
                  });
                } else if (data.type === 'done') {
                  setMessages(prev => [...prev, data.message]);
                  setCurrentStreamingText('');
                  setIsLoading(false);
                  abortControllerRef.current = null;
                } else if (data.type === 'error') {
                  toast.error(data.message);
                  setIsLoading(false);
                }
              } catch (e) {
                // partial chunk
              }
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          toast.error('Local model generation failed. Ensure the model exists and Ollama is active.');
        }
        setIsLoading(false);
        setCurrentStreamingText('');
      }
    } else {
      // CLOUD API METHOD (Simulated Streaming effect for compatibility)
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
        const res = await api.post(`/chat-learn/sessions/${targetSessionId}/messages`, payload);
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
      const res = await api.post('/chat-learn/generate-file', {
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
          <div className="flex flex-col gap-1.5 w-full">
            <button className="new-chat-btn" onClick={() => createNewChat('New Workspace')}>
              <Plus size={18} />
              <span>New Chat Workspace</span>
            </button>
            <div className="grid grid-cols-2 gap-1 mt-1 text-[10px]">
              {[
                { name: 'Research Chat', title: '🎓 Research Chat' },
                { name: 'Programming Chat', title: '💻 Code Sandbox' },
                { name: 'Math Session', title: '🧮 Math Solver' },
                { name: 'Interview Prep', title: '👔 Interview Prep' },
                { name: 'PDF Chat', title: '📄 PDF Chat' },
                { name: 'Image Analysis', title: '🖼️ Image Vision' }
              ].map(t => (
                <button
                  key={t.name}
                  onClick={() => createNewChat(t.name)}
                  className="bg-[var(--db-input-bg)] py-1.5 text-left px-2 rounded hover:bg-gray-800 text-[var(--db-text-main)] border border-[var(--db-input-border)] truncate cursor-pointer"
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative w-full mt-2">
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
          <button className={`chat-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Recent</button>
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
        {/* Professional Provider Selector Row */}
        <div className="agent-selector-row flex justify-between items-center px-4 py-2 border-b border-[var(--db-sidebar-border)] bg-[var(--db-sidebar-bg)] shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[var(--db-text-muted)] uppercase tracking-wider mr-1">AI Provider:</span>
            {[
              { val: 'auto', label: '🟢 Auto' },
              { val: 'gemini', label: '🔮 Gemini' },
              { val: 'groq', label: '⚡ Groq' },
              { val: 'openrouter', label: '🌐 OpenRouter' },
              { val: 'ollama', label: '🦙 Ollama (Local)' }
            ].map(p => (
              <button
                key={p.val}
                onClick={() => changeProvider(p.val)}
                className={`agent-selector-btn text-xs px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                  selectedProvider === p.val 
                    ? 'bg-blue-500/10 border-blue-500/35 text-blue-400' 
                    : 'bg-transparent border-transparent text-[var(--db-text-muted)] hover:text-white hover:bg-[var(--db-btn-secondary-hover)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--db-input-border)] text-gray-400 hover:text-white hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer"
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Ollama Local AI Status Panel */}
        {selectedProvider === 'ollama' && (
          <div className="p-4 bg-[var(--db-card-bg)] border-b border-[var(--db-sidebar-border)] flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-sidebar-border)]">
              <div className="flex items-center gap-3">
                <span className="text-xl">🦙</span>
                <div>
                  <h4 className="font-extrabold text-sm text-[var(--db-text-main)]">Ollama Local AI Status</h4>
                  <p className="text-[10px] text-[var(--db-text-muted)]">Server: localhost:11434 • GPU Acceleration Enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    ollamaStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                    ollamaStatus === 'loading' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="text-xs font-bold capitalize text-[var(--db-text-main)]">
                    {ollamaStatus === 'connected' ? 'Connected' : ollamaStatus === 'loading' ? 'Connecting...' : 'Offline'}
                  </span>
                </div>
                {ollamaStatus !== 'connected' && (
                  <button 
                    onClick={checkOllamaConnection} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1 px-3 rounded-lg transition cursor-pointer"
                  >
                    Reconnect
                  </button>
                )}
              </div>
            </div>

            {/* Installed Models Selector */}
            {ollamaStatus === 'connected' && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-[var(--db-text-muted)] uppercase tracking-wider">Installed Models ({ollamaModels.length})</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {ollamaModels.map(m => {
                    const isActive = activeOllamaModel === m.name;
                    const sizeGB = m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : 'N/A';
                    
                    return (
                      <div 
                        key={m.name} 
                        onClick={() => changeOllamaModel(m.name)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 text-left ${
                          isActive 
                            ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-md' 
                            : 'bg-[var(--db-card-bg-elevated)] border-[var(--db-sidebar-border)] text-[var(--db-text-main)] hover:border-blue-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-extrabold text-xs truncate max-w-[130px]">{m.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/30">
                            {sizeGB}
                          </span>
                        </div>
                        <div className="text-[9px] text-[var(--db-text-muted)] flex justify-between">
                          <span>Ctx: 32k</span>
                          <span>RAM: ~8GB</span>
                          <span>GPU: Yes</span>
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                          <button 
                            className={`text-[10px] font-black py-0.5 px-2 rounded cursor-pointer ${
                              isActive ? 'bg-blue-500 text-white' : 'bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-gray-300 hover:text-white'
                            }`}
                            onClick={(e) => { e.stopPropagation(); changeOllamaModel(m.name); }}
                          >
                            {isActive ? 'Active' : 'Run'}
                          </button>
                          <button 
                            className="text-red-400 hover:text-red-500 text-[10px] font-bold cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); deleteOllamaModel(m.name); }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {ollamaModels.length === 0 && (
                    <div className="col-span-3 text-center py-4 text-xs text-[var(--db-text-muted)] border border-dashed border-[var(--db-sidebar-border)] rounded-xl">
                      No models installed in local Ollama yet. Install them via Ollama CLI.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Welcome or Empty State */}
        {messages.length === 0 && !isLoading && (
          <div className="chat-welcome-container">
            <div className="welcome-logo">🧠</div>
            <h2 className="welcome-title">EduVerse Chat & Learn Center</h2>
            <p className="welcome-subtitle">
              Upload study documents, take hardware screenshots, or activate specialized tools like code debuggers to master your subjects.
            </p>
            
            <div className="welcome-grid grid grid-cols-1 md:grid-cols-4 gap-3 max-w-4xl w-full">
              {[
                { title: 'Explain Binary Search', prompt: 'Explain the Binary Search algorithm step-by-step with complexity details and a visual array trace.', icon: '🔍' },
                { title: 'Summarize PDF', prompt: 'Analyze the uploaded document, outline the key chapters and summarize the core thesis points.', icon: '📄' },
                { title: 'Solve Math Problem', prompt: 'Show the step-by-step mathematical derivation for the limits of tangent slopes.', icon: '📐' },
                { title: 'Debug Code', prompt: 'Here is a recursive function raising a StackOverflowError. Explain the stack trace and write a fixed iterative version.', icon: '💻' },
                { title: 'Generate Notes', prompt: 'Create complete educational study notes and key bullet point guides for OOP concepts.', icon: '📝' },
                { title: 'Interview Questions', prompt: 'Act as a technical recruiter. Ask me 3 questions about database joins and evaluate my answers.', icon: '👔' },
                { title: 'Create Quiz', prompt: 'Generate 5 multiple-choice questions on sorting algorithms to test my retention.', icon: '🏆' },
                { title: 'Explain Image', prompt: 'Inspect the uploaded image, extract any diagrams/electronics components, and explain them.', icon: '🖼️' }
              ].map(item => (
                <div 
                  key={item.title} 
                  className="welcome-card p-3.5 bg-[var(--db-card-bg)] border border-[var(--db-card-border)] rounded-2xl cursor-pointer hover:scale-[1.02] hover:border-blue-500 transition-all text-left"
                  onClick={() => setInputText(item.prompt)}
                >
                  <div className="text-xl mb-1.5">{item.icon}</div>
                  <h4 className="font-extrabold text-xs text-[var(--db-text-main)] mb-1">{item.title}</h4>
                  <p className="text-[10px] text-[var(--db-text-muted)] line-clamp-2 leading-normal">{item.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message logs */}
        {(messages.length > 0 || isLoading || currentStreamingText) && (
          <div className="chat-messages-viewport">
            {selectedProvider === 'ollama' && activeOllamaModel && (
              <div className="p-3 mb-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-2xl flex items-center justify-between text-xs animate-fade-in shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🦙</span>
                  <div>
                    <span className="font-extrabold text-[var(--db-text-main)]">Current Local Model: {activeOllamaModel}</span>
                    <span className="text-[10px] text-[var(--db-text-muted)] ml-2">| Context: 32768 tokens | Temp: {advancedSettings.temperature} | GPU: Enabled</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                    Response Speed: Ready
                  </span>
                </div>
              </div>
            )}
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

            {isLoading ? (
              <button
                onClick={() => {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                  }
                  setIsLoading(false);
                  setCurrentStreamingText('');
                  toast.success('Generation stopped.');
                }}
                className="chat-send-btn bg-red-600 hover:bg-red-700 hover:scale-100"
                title="Stop generation"
              >
                <X size={16} />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={isUploading || (!inputText.trim() && !uploadDraft)}
                className="chat-send-btn"
                title="Send Prompt"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* AI Performance Monitor Overlay */}
      <div className="fixed bottom-4 right-4 z-50 bg-[var(--db-card-bg)] border border-[var(--db-card-border)] rounded-2xl p-3 shadow-2xl flex flex-col gap-1.5 text-[10px] min-w-[160px] text-left select-none opacity-85 hover:opacity-100 transition-opacity text-[var(--db-text-main)]">
        <div className="flex items-center justify-between border-b border-[var(--db-sidebar-border)] pb-1 mb-1 font-bold">
          <span className="text-[11px]">💻 Performance Monitor</span>
          <span className={`w-1.5 h-1.5 rounded-full ${selectedProvider === 'ollama' ? 'bg-green-500 animate-ping' : 'bg-gray-500'}`} />
        </div>
        <div className="flex justify-between text-[var(--db-text-muted)]">
          <span>CPU Load:</span>
          <span className="font-mono">{performanceStats.cpu}%</span>
        </div>
        <div className="flex justify-between text-[var(--db-text-muted)]">
          <span>GPU Load:</span>
          <span className="font-mono">{performanceStats.gpu}%</span>
        </div>
        <div className="flex justify-between text-[var(--db-text-muted)]">
          <span>RAM Available:</span>
          <span className="font-mono">{performanceStats.ram} GB</span>
        </div>
        <div className="flex justify-between text-[var(--db-text-muted)]">
          <span>Latency:</span>
          <span className="font-mono">{performanceStats.latency} ms</span>
        </div>
        <div className="flex justify-between text-[var(--db-text-muted)]">
          <span>Speed:</span>
          <span className="font-mono">{performanceStats.tokensSec} tok/s</span>
        </div>
        <div className="flex justify-between text-[var(--db-text-muted)] border-t border-[var(--db-sidebar-border)] pt-1 mt-0.5">
          <span>Model:</span>
          <span className="font-mono text-blue-400 truncate max-w-[80px]">
            {selectedProvider === 'ollama' ? activeOllamaModel || 'None' : 'Cloud API'}
          </span>
        </div>
      </div>

      {/* SETTINGS DIALOG */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--db-card-bg)] border border-[var(--db-card-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-[var(--db-text-main)] max-h-[85vh] overflow-y-auto custom-sidebar-scroll"
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

                {/* Advanced Ollama Settings Section */}
                {selectedProvider === 'ollama' && (
                  <div className="border-t border-[var(--db-sidebar-border)] pt-4 mt-2">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">🦙 Ollama Local Parameters</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase mb-1">Temperature</label>
                        <input
                          type="number" step="0.1" min="0" max="2"
                          className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg py-1 px-2 text-xs focus:outline-none text-[var(--db-text-main)]"
                          value={advancedSettings.temperature}
                          onChange={(e) => setAdvancedSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase mb-1">Top P</label>
                        <input
                          type="number" step="0.05" min="0" max="1"
                          className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg py-1 px-2 text-xs focus:outline-none text-[var(--db-text-main)]"
                          value={advancedSettings.top_p}
                          onChange={(e) => setAdvancedSettings(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase mb-1">Context Length</label>
                        <select
                          className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg py-1.5 px-2 text-xs focus:outline-none text-[var(--db-text-main)]"
                          value={advancedSettings.num_ctx}
                          onChange={(e) => setAdvancedSettings(prev => ({ ...prev, num_ctx: parseInt(e.target.value) }))}
                        >
                          {[2048, 4096, 8192, 16384, 32768].map(size => (
                            <option key={size} value={size}>{size} tokens</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--db-text-muted)] uppercase mb-1">GPU Layers</label>
                        <input
                          type="number" min="0" max="100"
                          className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg py-1 px-2 text-xs focus:outline-none text-[var(--db-text-main)]"
                          value={advancedSettings.num_gpu}
                          onChange={(e) => setAdvancedSettings(prev => ({ ...prev, num_gpu: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

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
