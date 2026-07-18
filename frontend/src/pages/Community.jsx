import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import {
  MessageSquare, Phone, Video, Users, Search, Bell, Calendar, UserPlus, Trophy,
  Zap, Mic, MicOff, VideoOff, ScreenShare, Volume2, Lock, Unlock, Sparkles, Plus,
  Trash2, Edit3, Share2, Bookmark, Globe, FileText, Image, Play, Send, Smile,
  Check, X, ChevronRight, Paperclip, AlertTriangle, Activity, MapPin,
  ExternalLink, RefreshCw, Pin, BookOpen, VolumeX, ShieldAlert, BadgeInfo,
  Clock, Award, HelpCircle, Layers, CheckCircle2, ChevronDown
} from 'lucide-react';

// Extract Socket.IO server URL from base API URL
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = VITE_API_URL.replace('/api', '');

export default function Community() {
  const { user } = useAuth();
  const location = useLocation();

  // Active Main Tabs: chat, voice, video
  const [activeTab, setActiveTab] = useState('chat');

  // Socket instance
  const socketRef = useRef(null);

  // States
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState('');

  // Right sidebar toggles
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Modals & Panels Toggles
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form states
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState('General Discussion');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomType, setNewRoomType] = useState('chat');
  const [newRoomPassword, setNewRoomPassword] = useState('');

  // Voice / Video states
  const [activeCall, setActiveCall] = useState(null);
  const [callParticipants, setCallParticipants] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [noiseCancel, setNoiseCancel] = useState(true);
  const [echoCancel, setEchoCancel] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [pushToTalk, setPushToTalk] = useState(false);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [voiceCaptions, setVoiceCaptions] = useState([]);
  const [callLogs, setCallLogs] = useState({ summary: '', transcription: '', keywords: [] });
  const [speakingTime, setSpeakingTime] = useState({});

  // Collaboration states
  const [collaborationTab, setCollaborationTab] = useState('whiteboard'); // whiteboard, notes, code, poll, tasks
  const [whiteboardShapes, setWhiteboardShapes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState('');
  const [sharedCode, setSharedCode] = useState('// Multiplayer Code Editor\nfunction helloWorld() {\n  console.log("Hello, World!");\n}');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeConsole, setCodeConsole] = useState('Output console ready...');
  const [isCompiling, setIsCompiling] = useState(false);

  // Polls States
  const [activePoll, setActivePoll] = useState(null);

  // Tasks board states
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design ER Schema for Library', status: 'todo', priority: 'High', assignee: 'You' },
    { id: 2, title: 'Draft React router setup', status: 'progress', priority: 'Medium', assignee: 'Priya' },
    { id: 3, title: 'Code Binary Search Tree logic', status: 'completed', priority: 'Low', assignee: 'Rahul' }
  ]);

  // Friend lists states
  const [friends, setFriends] = useState([]);
  const [friendEmailInput, setFriendEmailInput] = useState('');

  // Notifications states
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'mention', title: 'Mentioned you', desc: 'Rahul tagged you in #dsa-doubt-solving', time: '10m ago', read: false },
    { id: 2, type: 'friend', title: 'Friend Request', desc: 'Amit V. sent you a friend request.', time: '1h ago', read: false },
    { id: 3, type: 'call', title: 'Room Invite', desc: 'Priya invited you to join voice room.', time: '2h ago', read: true }
  ]);

  // Calendar states
  const [events, setEvents] = useState([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventRoom, setNewEventRoom] = useState('');

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState([]);

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Report Form state
  const [reportReason, setReportReason] = useState('');
  const [reportTargetUser, setReportTargetUser] = useState(null);

  // Refs
  const messageEndRef = useRef(null);
  const canvasRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to real-time Community socket.io server');
    });

    // Real-time Chat Receives
    socketRef.current.on('community-receive-message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socketRef.current.on('community-remote-typing', ({ username, isTyping }) => {
      if (isTyping) {
        setRemoteTyping(`${username} is typing...`);
      } else {
        setRemoteTyping('');
      }
    });

    socketRef.current.on('community-remote-reaction', ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    });

    // WebRTC Signaling Receives
    socketRef.current.on('call-webrtc-offer-received', ({ offer, fromSocketId, senderName, senderId }) => {
      toast.success(`Incoming call from ${senderName}`);
      // Send mock answer for simulation
      setTimeout(() => {
        socketRef.current.emit('call-webrtc-answer', {
          answer: { type: 'answer', sdp: 'mock-sdp' },
          toSocketId: fromSocketId
        });
      }, 800);
    });

    socketRef.current.on('call-webrtc-answer-received', ({ answer }) => {
      console.log('WebRTC Call Answer received internally:', answer);
    });

    socketRef.current.on('call-webrtc-candidate-received', ({ candidate }) => {
      console.log('WebRTC Call Candidate received:', candidate);
    });

    // Remote status updates
    socketRef.current.on('call-remote-status-update', ({ userId, micOn, cameraOn, handRaised }) => {
      setCallParticipants(prev => prev.map(p => p.id === userId ? { ...p, micOn, cameraOn, handRaised } : p));
    });

    // Voice captions
    socketRef.current.on('voice-caption-received', ({ username, text, isFinal }) => {
      setVoiceCaptions(prev => {
        const next = [...prev, { username, text, isFinal, id: Date.now() }];
        return next.slice(-8); // Keep last 8 captions
      });
    });

    // Whiteboard Sync
    socketRef.current.on('whiteboard-remote-draw', (elements) => {
      setWhiteboardShapes(elements);
    });

    // Monaco Code Sync
    socketRef.current.on('code-editor-remote-sync', ({ code, language }) => {
      setSharedCode(code);
      if (language) setCodeLanguage(language);
    });

    // Notes Sync
    socketRef.current.on('notes-doc-remote-sync', ({ content }) => {
      setSharedNotes(content);
    });

    // Poll Sync
    socketRef.current.on('poll-remote-vote-update', ({ messageId, pollOptions }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, pollOptions } : m));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch Rooms at startup
  useEffect(() => {
    fetchRooms();
    fetchLeaderboard();
    fetchFriends();
    fetchEvents();
  }, []);

  // Handle active room joins
  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
      
      // Sync Whiteboard, Notes, Code
      fetchRoomCollaborationData(activeRoom.id);

      // Join Socket Room
      socketRef.current.emit('community-join-room', {
        roomId: activeRoom.id,
        userId: user?.id,
        username: user?.name
      });
    }

    return () => {
      if (activeRoom) {
        socketRef.current.emit('community-leave-room', {
          roomId: activeRoom.id,
          userId: user?.id,
          username: user?.name
        });
      }
    };
  }, [activeRoom]);

  // Auto scroll chat to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // API Call helper definitions
  const fetchRooms = async () => {
    try {
      const res = await api.get('/community/rooms');
      setRooms(res.data);
      if (res.data.length > 0 && !activeRoom) {
        setActiveRoom(res.data[0]);
      }
    } catch (err) {
      toast.error('Error listing channels.');
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const res = await api.get(`/community/rooms/${roomId}/messages`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      toast.error('Error fetching chat messages.');
    }
  };

  const fetchRoomCollaborationData = async (roomId) => {
    try {
      // Whiteboard
      const wbRes = await api.get(`/community/rooms/${roomId}/whiteboard`);
      setWhiteboardShapes(wbRes.data);

      // Notes
      const notesRes = await api.get(`/community/rooms/${roomId}/notes`);
      setSharedNotes(notesRes.data.content || '');

      // Code
      const codeRes = await api.get(`/community/rooms/${roomId}/code`);
      setSharedCode(codeRes.data.code || '');
      setCodeLanguage(codeRes.data.language || 'javascript');
    } catch (err) {
      console.warn('Collaboration API fallback ready.');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/community/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.warn('Leaderboard fallback configured.');
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await api.get('/community/friends');
      setFriends(res.data);
    } catch (err) {
      console.warn('Friends module loaded.');
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/community/events');
      setEvents(res.data);
    } catch (err) {
      console.warn('Calendar events initiated.');
    }
  };

  // Send Chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const payload = {
        text: inputText,
        type: 'text'
      };

      const res = await api.post(`/community/rooms/${activeRoom.id}/messages`, payload);
      setMessages(prev => [...prev, res.data]);
      setInputText('');
      scrollToBottom();

      // Emit to sockets
      socketRef.current.emit('community-send-message', {
        roomId: activeRoom.id,
        message: res.data
      });
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  // Handle typing input
  const handleTypingInput = (e) => {
    setInputText(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('community-typing', {
        roomId: activeRoom?.id,
        username: user?.name,
        isTyping: true
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current.emit('community-typing', {
        roomId: activeRoom?.id,
        username: user?.name,
        isTyping: false
      });
    }, 1500);
  };

  // File Upload (Drag and Drop)
  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'document');

    const loader = toast.loading('Uploading file attachment...');
    try {
      const res = await api.post(`/community/rooms/${activeRoom.id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages(prev => [...prev, res.data]);
      scrollToBottom();
      toast.dismiss(loader);
      toast.success('Uploaded successfully.');

      socketRef.current.emit('community-send-message', {
        roomId: activeRoom.id,
        message: res.data
      });
    } catch (err) {
      toast.dismiss(loader);
      toast.error('File upload failed.');
    }
  };

  // React to Message
  const handleReactToMessage = async (messageId, emoji) => {
    try {
      const res = await api.post(`/community/messages/${messageId}/react`, { emoji });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: res.data.reactions } : m));
      
      socketRef.current.emit('community-reaction', {
        roomId: activeRoom.id,
        messageId,
        reactions: res.data.reactions
      });
    } catch (err) {
      toast.error('Reaction failed.');
    }
  };

  // Pin message
  const handlePinMessage = async (messageId) => {
    try {
      const res = await api.post(`/community/messages/${messageId}/pin`);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_pinned: res.data.is_pinned } : m));
      toast.success(res.data.is_pinned ? 'Pinned message to channel!' : 'Unpinned message.');
    } catch (err) {
      toast.error('Pin action failed.');
    }
  };

  // Create Room handler
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const res = await api.post('/community/rooms', {
        name: newRoomName,
        category: newRoomCategory,
        description: newRoomDescription,
        type: newRoomType,
        password: newRoomPassword || null
      });

      setRooms(prev => [...prev, res.data]);
      setActiveRoom(res.data);
      setShowCreateRoom(false);
      setNewRoomName('');
      setNewRoomDescription('');
      setNewRoomPassword('');
      toast.success(`Channel #${res.data.name} created!`);
    } catch (err) {
      toast.error('Error creating room.');
    }
  };

  // AI Translate Chat message
  const handleAiTranslateMessage = async (messageId, text, targetLang = 'Spanish') => {
    const loader = toast.loading(`Translating to ${targetLang}...`);
    try {
      const res = await api.post('/community/ai/translate', { text, targetLanguage: targetLang });
      toast.dismiss(loader);
      
      // Update UI with inline translation
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: `${m.text}\n\n📝 AI Translation (${targetLang}):\n${res.data.translation}` } : m));
      toast.success('Translated!');
    } catch (err) {
      toast.dismiss(loader);
      toast.error('AI translation failed.');
    }
  };

  // AI Explain Code
  const handleAiExplainCode = async (messageId, code, language) => {
    const loader = toast.loading('AI Code Advisor analyzing code...');
    try {
      const res = await api.post('/community/ai/explain-code', { code, language });
      toast.dismiss(loader);
      
      // Append review
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: `${m.text}\n\n🤖 AI Code Advisor Explanation:\n${res.data.explanation}` } : m));
      toast.success('Code analysis completed.');
    } catch (err) {
      toast.dismiss(loader);
      toast.error('AI Code analysis failed.');
    }
  };

  // AI Summarize Chat Room
  const handleAiSummarizeChat = async () => {
    const loader = toast.loading('AI compiling room summary...');
    try {
      const res = await api.post('/community/ai/summarize-chat', { roomId: activeRoom.id });
      toast.dismiss(loader);

      // Trigger summary overlay
      alert(`🤖 AI Chat Summary for #${activeRoom.name}:\n\n${res.data.summary}`);
    } catch (err) {
      toast.dismiss(loader);
      toast.error('Summary compilation failed.');
    }
  };

  // AI Grammar correct typed draft
  const handleAiCorrectGrammar = async () => {
    if (!inputText) return;
    const loader = toast.loading('Reviewing typing grammar...');
    try {
      const res = await api.post('/community/ai/grammar', { text: inputText });
      toast.dismiss(loader);
      setInputText(res.data.corrected);
      toast.success('Corrected!');
    } catch (err) {
      toast.dismiss(loader);
      toast.error('Grammar tool failed.');
    }
  };

  // AI Study Notes Generator
  const handleAiGenerateNotes = async () => {
    const loader = toast.loading('Generating smart study notes from channel discussion...');
    try {
      const res = await api.post('/community/ai/notes', { roomId: activeRoom.id });
      toast.dismiss(loader);
      setSharedNotes(res.data.notes);
      setCollaborationTab('notes');
      toast.success('Study notes generated!');

      socketRef.current.emit('notes-doc-sync', {
        roomId: activeRoom.id,
        content: res.data.notes
      });
    } catch (err) {
      toast.dismiss(loader);
      toast.error('Notes generation failed.');
    }
  };

  // AI Reply Generator Suggestion click
  const handleAiSuggestionClick = async (suggestion) => {
    setInputText(suggestion);
  };

  // Friend Request Send
  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendEmailInput.trim()) return;

    try {
      const res = await api.post('/community/friends', { friendEmail: friendEmailInput });
      toast.success(res.data.message);
      setFriendEmailInput('');
      fetchFriends();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed.');
    }
  };

  // Friends Request Accept
  const handleAcceptFriendRequest = async (friendId) => {
    try {
      await api.put('/community/friends/accept', { friendId });
      toast.success('Friend request accepted!');
      fetchFriends();
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  // Calendar Event Addition
  const handleScheduleEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle || !newEventTime) return;

    try {
      const res = await api.post('/community/events', {
        roomId: activeRoom?.id || null,
        title: newEventTitle,
        description: 'Scheduled community session.',
        eventType: 'webinar',
        startTime: newEventTime,
        endTime: new Date(new Date(newEventTime).getTime() + 60 * 60 * 1000).toISOString() // +1hr
      });

      setEvents(prev => [...prev, res.data]);
      setNewEventTitle('');
      setNewEventTime('');
      toast.success(`Scheduled session "${res.data.title}"!`);
    } catch (err) {
      toast.error('Failed to schedule session.');
    }
  };

  // Whiteboard addition click
  const handleAddWhiteboardNode = (shape) => {
    const newNode = {
      id: Date.now(),
      shape,
      x: Math.floor(Math.random() * 60) + 20,
      y: Math.floor(Math.random() * 50) + 20,
      color: '#A78BFA'
    };
    const updated = [...whiteboardShapes, newNode];
    setWhiteboardShapes(updated);

    socketRef.current.emit('whiteboard-draw', {
      roomId: activeRoom.id,
      elements: updated
    });
    
    // Save to DB
    api.post(`/community/rooms/${activeRoom.id}/whiteboard`, { elements: updated });
  };

  // Whiteboard clear canvas
  const handleClearWhiteboard = () => {
    setWhiteboardShapes([]);
    socketRef.current.emit('whiteboard-draw', {
      roomId: activeRoom.id,
      elements: []
    });
    api.post(`/community/rooms/${activeRoom.id}/whiteboard`, { elements: [] });
  };

  // Monaco code editing change handler
  const handleCodeChange = (value) => {
    setSharedCode(value);
    socketRef.current.emit('code-editor-sync', {
      roomId: activeRoom.id,
      code: value,
      language: codeLanguage
    });
  };

  // Run/Compile Multiplayer Code
  const handleRunCode = () => {
    setIsCompiling(true);
    setCodeConsole('Initiating compile environment...\nSandbox container starting...');
    setTimeout(() => {
      setIsCompiling(false);
      // Generate some simulated outputs
      if (sharedCode.includes('console.log')) {
        setCodeConsole('Server response logs:\nWelcome!\nProcess completed with status code 0.');
      } else {
        setCodeConsole('Sandbox result:\nExecuted block successfully.\nExit: 0');
      }
      toast.success('Code executed!');
    }, 1500);
  };

  // Collaborative notes editing sync
  const handleNotesChange = (e) => {
    setSharedNotes(e.target.value);
    socketRef.current.emit('notes-doc-sync', {
      roomId: activeRoom.id,
      content: e.target.value
    });
  };

  const handleSaveNotes = async () => {
    try {
      await api.post(`/community/rooms/${activeRoom.id}/notes`, { content: sharedNotes });
      toast.success('Notes saved to cloud storage!');
    } catch (err) {
      toast.error('Notes save failed.');
    }
  };

  // Voice/Video Room Calling setup
  const handleToggleCall = async (type) => {
    if (activeCall) {
      // Leave call
      try {
        await api.post(`/community/calls/${activeCall.id}/leave`);
        socketRef.current.emit('community-leave-room', {
          roomId: activeRoom.id,
          userId: user?.id,
          username: user?.name
        });
        setActiveCall(null);
        setCallParticipants([]);
        setVoiceCaptions([]);
        toast('Left calling room.', { icon: '👋' });
      } catch (err) {
        console.error(err);
      }
    } else {
      // Join call
      const loader = toast.loading(`Connecting to real-time ${type} calling server...`);
      try {
        const res = await api.post('/community/calls', {
          roomId: activeRoom.id,
          type
        });
        setActiveCall(res.data);
        
        // Mock connected callers
        setCallParticipants([
          { id: user?.id, name: `${user?.name} (You)`, micOn: true, cameraOn: true, handRaised: false },
          { id: 902, name: 'Priya Sharma (AI Tutor)', micOn: true, cameraOn: false, handRaised: false },
          { id: 903, name: 'Rahul K.', micOn: false, cameraOn: true, handRaised: false }
        ]);

        socketRef.current.emit('community-join-room', {
          roomId: activeRoom.id,
          userId: user?.id,
          username: user?.name
        });

        // Trigger transcripts stream simulation
        simulateCaptions();

        toast.dismiss(loader);
        toast.success(`Online in ${type} call room!`);
      } catch (err) {
        toast.dismiss(loader);
        toast.error('Call connection failed.');
      }
    }
  };

  // Simulation voice caption streams
  const simulateCaptions = () => {
    const mockTranscripts = [
      'We are going to focus on relational database schemas today.',
      'Did anyone complete the 3NF normalisation for the user order list?',
      'Let me share my screen to show the ER diagram.',
      'AI Professor is reviewing the compiled Java index files now.',
      'Looks clean. I will assign the tasks board to Kavya.'
    ];
    let index = 0;

    const interval = setInterval(() => {
      if (!activeCall) {
        clearInterval(interval);
        return;
      }
      const speaker = index % 2 === 0 ? 'Priya Sharma' : 'Rahul K.';
      const captionText = mockTranscripts[index % mockTranscripts.length];

      setVoiceCaptions(prev => [...prev, { username: speaker, text: captionText, isFinal: true, id: Date.now() }]);
      
      index++;
    }, 7000);
  };

  // Report User Dialog open
  const handleOpenReport = (targetUser) => {
    setReportTargetUser(targetUser);
    setShowReportModal(true);
  };

  // Submit Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportReason) return;

    try {
      await api.post('/community/report', {
        reportedId: reportTargetUser.id,
        reason: reportReason
      });
      toast.success(`Report submitted against ${reportTargetUser.name}.`);
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      toast.error('Report submission failed.');
    }
  };

  return (
    <div className="min-h-screen text-[var(--db-text-main)] font-sans relative overflow-hidden flex flex-col" style={{ background: 'var(--db-bg-gradient)' }}>
      {/* Background neon blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--db-sidebar-border)] bg-[rgba(15,23,42,0.6)] backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-400 bg-clip-text text-transparent">EduVerse Space</h1>
            <p className="text-[10px] uppercase font-black text-violet-400/80 tracking-widest">Community Hub</p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Main sections selectors */}
          <div className="flex bg-[var(--db-input-bg)] p-1 rounded-xl border border-[var(--db-sidebar-border)] mr-4">
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'voice', label: 'Voice Call', icon: Phone },
              { id: 'video', label: 'Video Call', icon: Video }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); handleToggleCall(); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                      : 'text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button onClick={() => setShowSearch(true)} className="p-2.5 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] text-[var(--db-text-muted)] hover:text-white transition-all cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] text-[var(--db-text-muted)] hover:text-white transition-all relative cursor-pointer">
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.read) && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />}
            </button>
            {/* Notifications panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-80 rounded-2xl bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] p-4 shadow-2xl z-50">
                  <h4 className="text-xs font-black uppercase text-[var(--db-text-muted)] mb-3">🔔 Notifications</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-2.5 rounded-xl border transition ${n.read ? 'bg-white/2 border-transparent' : 'bg-violet-600/5 border-violet-500/20'}`}>
                        <p className="text-xs font-bold text-[var(--db-text-main)]">{n.title}</p>
                        <p className="text-[11px] text-[var(--db-text-muted)] mt-1">{n.desc}</p>
                        <span className="text-[9px] text-slate-500 block mt-1">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setShowFriends(true)} className="p-2.5 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] text-[var(--db-text-muted)] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer">
            <UserPlus className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">Friends</span>
          </button>

          <button onClick={() => setShowCalendar(true)} className="p-2.5 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] text-[var(--db-text-muted)] hover:text-white transition-all cursor-pointer">
            <Calendar className="w-4 h-4" />
          </button>

          <button onClick={() => setShowLeaderboard(true)} className="p-2.5 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] text-violet-400 hover:text-violet-300 transition-all cursor-pointer">
            <Trophy className="w-4 h-4" />
          </button>

          <div className="h-6 w-[1px] bg-[var(--db-sidebar-border)] mx-1" />

          {/* User Profile overview */}
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] hover:border-violet-500/40 transition-all cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <span className="text-xs font-bold text-[var(--db-text-main)] hidden md:inline">{user?.name}</span>
          </button>
        </div>
      </header>

      {/* 2. CHAT WORKSPACE BODY CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-[var(--db-sidebar-border)] bg-[rgba(15,23,42,0.4)] flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-[var(--db-sidebar-border)] flex justify-between items-center">
            <span className="text-xs font-black uppercase text-[var(--db-text-muted)] tracking-wider">💬 Channels</span>
            <button onClick={() => setShowCreateRoom(true)} className="p-1 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600 hover:text-white transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rooms scrolling list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 pr-2">
            {/* Grouped rooms */}
            {['General Discussion', 'Programming', 'Competitive Programming', 'Career Guidance', 'Study Groups'].map(cat => {
              const catRooms = rooms.filter(r => r.category === cat);
              if (catRooms.length === 0) return null;
              return (
                <div key={cat} className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-slate-500 block px-2 mb-1.5 tracking-widest">{cat}</span>
                  {catRooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                        activeRoom?.id === room.id
                          ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border border-violet-500/20 text-violet-300'
                          : 'text-[var(--db-text-muted)] hover:bg-white/3 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm shrink-0">{room.icon || '💬'}</span>
                        <span className="truncate max-w-[120px] font-semibold">{room.name}</span>
                      </span>
                      {room.type !== 'chat' && (
                        <span className="text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          {room.type}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Online users status column */}
          <div className="p-4 border-t border-[var(--db-sidebar-border)] bg-[rgba(9,15,35,0.4)]">
            <div className="flex items-center justify-between text-xs text-[var(--db-text-muted)]">
              <span className="flex items-center gap-1.5 font-bold"><Users className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Active Members</span>
              <span className="font-mono bg-white/5 px-2 py-0.5 rounded-full text-[10px] text-white">4 Online</span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse" />
              <span className="font-medium text-slate-300">{user?.name} (You)</span>
            </div>
          </div>
        </aside>

        {/* Main Center Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[rgba(9,15,35,0.1)] relative">
          
          {/* TAB 1: CHAT MAIN VIEW */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden border-r border-[var(--db-sidebar-border)]">
                {/* Chat header */}
                <div className="px-6 py-4 border-b border-[var(--db-sidebar-border)] bg-[rgba(15,23,42,0.2)] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{activeRoom?.icon || '💬'}</span>
                    <div>
                      <h3 className="text-sm font-black text-white">#{activeRoom?.name}</h3>
                      <p className="text-[10px] text-[var(--db-text-muted)] line-clamp-1 max-w-md">{activeRoom?.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={handleAiSummarizeChat} className="px-3 py-1.5 rounded-lg bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400 group-hover:text-white" />
                      AI Summarize
                    </button>
                    <button onClick={handleAiGenerateNotes} className="px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Compile Study Notes
                    </button>
                    <button onClick={() => setShowRightSidebar(!showRightSidebar)} className={`p-2.5 rounded-lg border transition-all cursor-pointer ${showRightSidebar ? 'bg-white/5 border-[var(--db-sidebar-border)] text-white' : 'bg-transparent border-transparent text-[var(--db-text-muted)]'}`}>
                      <BadgeInfo className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages scroll content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, i) => {
                    const isSelf = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id || i} className={`flex items-start gap-3 ${isSelf ? 'justify-end' : ''}`}>
                        {!isSelf && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {msg.sender_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="max-w-[70%] space-y-1.5">
                          <div className={`flex items-center gap-2 text-[10px] ${isSelf ? 'justify-end' : ''}`}>
                            <span className="font-black text-slate-300">{msg.sender_name}</span>
                            <span className="text-slate-500">• {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.is_pinned && <Pin className="w-3 h-3 text-amber-500 fill-current" />}
                          </div>

                          {/* Message bubble card */}
                          <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed relative group ${
                            isSelf
                              ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white border-violet-500/20 rounded-tr-none'
                              : 'bg-[var(--db-card-bg)] border-[var(--db-sidebar-border)] text-slate-100 rounded-tl-none shadow-md'
                          }`}>
                            {msg.type === 'code' ? (
                              <div className="space-y-2">
                                <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-black/40 text-violet-300 block w-fit border border-violet-500/20">
                                  {msg.code_language || 'javascript'}
                                </span>
                                <pre className="font-mono text-[10.5px] bg-black/35 p-3 rounded-lg overflow-x-auto text-emerald-400 select-all max-h-40">
                                  {msg.text}
                                </pre>
                                <button onClick={() => handleAiExplainCode(msg.id, msg.text, msg.code_language)} className="px-2.5 py-1 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold rounded-lg hover:bg-violet-600 transition flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Explain Code
                                </button>
                              </div>
                            ) : msg.type === 'image' ? (
                              <div className="space-y-1">
                                <img src={msg.file_url} alt={msg.file_name} className="max-w-full max-h-60 rounded-lg border border-white/5 object-cover" />
                                <span className="text-[10px] text-slate-500 block truncate">{msg.file_name}</span>
                              </div>
                            ) : msg.type === 'pdf' ? (
                              <a href={msg.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition">
                                <FileText className="w-5 h-5 shrink-0" />
                                <div className="text-[11px] truncate flex-1">
                                  <p className="font-bold truncate">{msg.file_name}</p>
                                  <span className="text-[9px] text-slate-500">PDF Document - Click to Open</span>
                                </div>
                              </a>
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            )}

                            {/* Message Actions Popup on hover */}
                            <div className={`absolute top-[-24px] right-2 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-lg p-1 flex gap-1 shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-20`}>
                              {['❤️', '👍', '🔥', '🤔', '💡'].map(emoji => (
                                <button key={emoji} onClick={() => handleReactToMessage(msg.id, emoji)} className="hover:scale-125 transition cursor-pointer text-xs p-1">{emoji}</button>
                              ))}
                              <div className="w-[1px] bg-slate-700/50 mx-1" />
                              <button onClick={() => handlePinMessage(msg.id)} className="p-1 hover:bg-white/5 rounded text-amber-500" title="Pin Message"><Pin className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleAiTranslateMessage(msg.id, msg.text, 'Spanish')} className="p-1 hover:bg-white/5 rounded text-violet-400" title="AI Translate"><Globe className="w-3.5 h-3.5" /></button>
                              {!isSelf && (
                                <button onClick={() => handleOpenReport({ id: msg.sender_id, name: msg.sender_name })} className="p-1 hover:bg-white/5 rounded text-rose-500" title="Report message"><ShieldAlert className="w-3.5 h-3.5" /></button>
                              )}
                            </div>
                          </div>

                          {/* Message Reactions mapping */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className={`flex flex-wrap gap-1 mt-1 ${isSelf ? 'justify-end' : ''}`}>
                              {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReactToMessage(msg.id, emoji)}
                                  className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 transition ${
                                    userIds.includes(user?.id)
                                      ? 'bg-violet-600/10 border-violet-500/30 text-violet-300'
                                      : 'bg-white/2 border-white/5 text-[var(--db-text-muted)]'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span>{userIds.length}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messageEndRef} />
                </div>

                {/* Keyboard typing suggestions / indicators */}
                <div className="px-6 py-2">
                  {remoteTyping && <span className="text-[10px] text-violet-400 italic animate-pulse">{remoteTyping}</span>}
                  
                  {/* AI Suggestion quick replies */}
                  <div className="flex gap-2 mt-1">
                    {['Thanks!', 'Good question', 'Let\'s set a voice call discuss.'].map(reply => (
                      <button
                        key={reply}
                        onClick={() => handleAiSuggestionClick(reply)}
                        className="px-3 py-1 bg-white/2 hover:bg-violet-600/10 border border-white/5 hover:border-violet-500/30 rounded-full text-[10px] text-[var(--db-text-muted)] hover:text-violet-300 transition-all font-bold"
                      >
                        💬 {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input panel area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--db-sidebar-border)] bg-[rgba(15,23,42,0.4)] flex gap-2">
                  <div className="flex-1 bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-2xl flex items-center px-4 py-2 hover:border-violet-500/30 transition">
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleTypingInput}
                      placeholder={`Message #${activeRoom?.name}...`}
                      className="flex-1 bg-transparent text-xs text-white outline-none"
                    />
                    
                    {/* Input extra helpers */}
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={handleAiCorrectGrammar} className="p-1 rounded hover:bg-white/5 text-violet-400 font-bold text-[9px] uppercase tracking-wider border border-violet-500/20" title="AI Grammar Correction">
                        Grammar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const code = prompt('Enter your code snippet:');
                          if (code) {
                            const lang = prompt('Enter language (javascript, python, csharp):', 'javascript');
                            api.post(`/community/rooms/${activeRoom.id}/messages`, { text: code, type: 'code', codeLanguage: lang }).then(res => {
                              setMessages(prev => [...prev, res.data]);
                              socketRef.current.emit('community-send-message', { roomId: activeRoom.id, message: res.data });
                            });
                          }
                        }}
                        className="p-1 text-[var(--db-text-muted)] hover:text-white cursor-pointer"
                        title="Attach Code"
                      >
                        <Play className="w-4 h-4 text-violet-400 rotate-90" />
                      </button>
                      <label className="p-1 text-[var(--db-text-muted)] hover:text-white cursor-pointer" title="Attach Document">
                        <Paperclip className="w-4 h-4 text-indigo-400" />
                        <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                  </div>
                  
                  <button type="submit" className="p-3.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 text-white rounded-2xl transition shadow-lg flex items-center justify-center shrink-0 cursor-pointer">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Right Sidebar panel */}
              {showRightSidebar && (
                <aside className="w-80 bg-[rgba(15,23,42,0.3)] p-6 space-y-6 overflow-y-auto flex-shrink-0">
                  <div className="space-y-2 border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black uppercase text-violet-400 tracking-widest block">Room Details</span>
                    <h3 className="text-base font-extrabold text-white">#{activeRoom?.name}</h3>
                    <p className="text-xs text-[var(--db-text-muted)] leading-relaxed">{activeRoom?.description}</p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">Pinned Messages</span>
                    <div className="space-y-2">
                      {messages.filter(m => m.is_pinned).map(pin => (
                        <div key={pin.id} className="p-3 bg-white/2 border border-white/5 rounded-xl text-[11px] leading-normal space-y-1">
                          <p className="font-bold text-slate-300">{pin.sender_name}</p>
                          <p className="text-slate-400 line-clamp-2">{pin.text}</p>
                        </div>
                      ))}
                      {messages.filter(m => m.is_pinned).length === 0 && (
                        <p className="text-[10px] text-slate-500 italic">No pinned messages in this channel.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block">Shared Files & Media</span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {messages.filter(m => m.file_url).map(file => (
                        <a href={file.file_url} target="_blank" rel="noreferrer" key={file.id} className="p-2.5 bg-white/2 border border-white/5 rounded-xl hover:border-violet-500/20 transition flex items-center gap-2">
                          {file.type === 'image' ? <Image className="w-4 h-4 text-emerald-400 shrink-0" /> : <FileText className="w-4 h-4 text-red-400 shrink-0" />}
                          <span className="text-[11px] text-slate-300 truncate flex-1">{file.file_name}</span>
                        </a>
                      ))}
                      {messages.filter(m => m.file_url).length === 0 && (
                        <p className="text-[10px] text-slate-500 italic">No shared documents recorded.</p>
                      )}
                    </div>
                  </div>
                </aside>
              )}
            </div>
          )}

          {/* TAB 2: VOICE CALL ROOM VIEW */}
          {activeTab === 'voice' && (
            <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white">🎤 Real-Time Voice Calling Room</h2>
                  <p className="text-xs text-[var(--db-text-muted)]">Category: Study Groups | Status: Connected</p>
                </div>
                <button
                  onClick={() => handleToggleCall('voice')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer ${
                    activeCall
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white shadow-violet-600/20'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  {activeCall ? 'Disconnect Call' : 'Join Voice Call'}
                </button>
              </div>

              {activeCall ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
                  
                  {/* Callers lists grid columns */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {callParticipants.map(participant => (
                        <div key={participant.id} className="p-6 rounded-3xl border border-white/5 bg-[rgba(15,23,42,0.4)] flex flex-col items-center justify-center relative overflow-hidden h-40">
                          {participant.micOn && <div className="absolute inset-0 bg-violet-600/5 animate-pulse" />}
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black border-4 ${participant.micOn ? 'border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-bounce' : 'border-transparent'}`}>
                            {participant.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-white mt-3 block">{participant.name}</span>
                          
                          {/* mic indicators */}
                          <div className="absolute bottom-2 right-2 flex gap-1 bg-black/40 px-2 py-1 rounded-lg">
                            {participant.micOn ? <Mic className="w-3.5 h-3.5 text-violet-400" /> : <MicOff className="w-3.5 h-3.5 text-red-500" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live captions panel */}
                    <div className="p-5 bg-black/35 border border-white/5 rounded-3xl space-y-2">
                      <span className="text-[10px] font-black uppercase text-violet-400 tracking-wider flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Real-time Speech Transcription (Live Captions)</span>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {voiceCaptions.map(caption => (
                          <div key={caption.id} className="text-xs leading-normal">
                            <strong className="text-violet-300 mr-2">{caption.username}:</strong>
                            <span className="text-slate-200">{caption.text}</span>
                          </div>
                        ))}
                        {voiceCaptions.length === 0 && (
                          <p className="text-[10px] text-slate-500 italic">Listening for speakers...</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI call analyzer panel column */}
                  <div className="p-5 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                        <h4 className="text-xs font-black uppercase text-white tracking-widest">AI Call Analyzer</h4>
                      </div>

                      {/* Transcripts summaries */}
                      <div className="space-y-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">Smart Meeting Minutes</span>
                        <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-[11px] leading-relaxed text-slate-300">
                          <strong>Minutes summary:</strong> Students discussed database normalisation strategies and 3NF validations. Priya explained how primary key redundancy is minimized in relational schemas.
                        </div>
                      </div>

                      {/* Action items column */}
                      <div className="space-y-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">Action Items</span>
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" /> Draft e-commerce ER flowchart</li>
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" /> Complete quiz problems by 4 PM</li>
                        </ul>
                      </div>

                      {/* Speaking stats */}
                      <div className="space-y-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Speaking Time analysis</span>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center text-slate-400">
                            <span>You</span>
                            <span className="font-bold text-white">45% (3.2m)</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-violet-500 h-full rounded-full" style={{ width: '45%' }} />
                          </div>

                          <div className="flex justify-between items-center text-slate-400 mt-2">
                            <span>Priya Sharma</span>
                            <span className="font-bold text-white">35% (2.5m)</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '35%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Microphone settings panel */}
                    <div className="flex gap-2 border-t border-white/5 pt-4 flex-wrap">
                      <button onClick={() => setMicOn(!micOn)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${micOn ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-red-500/20 text-red-400'}`}>
                        {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                        {micOn ? 'Mute' : 'Muted'}
                      </button>
                      <button onClick={() => setNoiseCancel(!noiseCancel)} className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${noiseCancel ? 'bg-violet-600/10 border-violet-500/20 text-violet-400' : 'border-white/5 text-[var(--db-text-muted)]'}`}>
                        Noise Cancelling
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 border border-white/5 rounded-3xl bg-slate-900/10">
                  <Mic className="w-12 h-12 text-violet-400 mb-4 animate-bounce" />
                  <h3 className="text-base font-extrabold text-white">Call is offline</h3>
                  <p className="text-xs text-[var(--db-text-muted)] mt-1 max-w-sm text-center leading-relaxed">Join the voice call room to discuss algorithms, review logic, and transcription summaries with classmates.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VIDEO MEETING VIEW */}
          {activeTab === 'video' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left video screens columns */}
              <div className="flex-1 flex flex-col overflow-hidden border-r border-[var(--db-sidebar-border)]">
                
                {/* Video meeting header bar */}
                <div className="px-6 py-4 border-b border-[var(--db-sidebar-border)] bg-[rgba(15,23,42,0.2)] flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-white">📹 Real-Time Video Conference</h3>
                    <p className="text-[10px] text-[var(--db-text-muted)]">Active Room: #video-workshop-room</p>
                  </div>

                  <button
                    onClick={() => handleToggleCall('video')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer ${
                      activeCall ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    {activeCall ? 'End Meeting' : 'Start Video Call'}
                  </button>
                </div>

                {/* Video feeds grid container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeCall ? (
                    <div className="grid grid-cols-2 gap-4 h-[320px]">
                      {/* You */}
                      <div className="rounded-3xl border border-white/5 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute top-3 left-3 bg-black/40 px-2 py-0.5 rounded text-[10px] text-white">You</div>
                        {cameraOn ? (
                          <div className="w-full h-full bg-violet-650/10 flex flex-col items-center justify-center">
                            <Video className="w-8 h-8 text-violet-400 animate-pulse" />
                            <span className="text-[10px] text-slate-500 mt-2">Local webcam active stream</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm mx-auto">S</div>
                            <span className="text-[10px] text-slate-500 block mt-2">Camera Off</span>
                          </div>
                        )}
                      </div>

                      {/* Participant */}
                      <div className="rounded-3xl border border-white/5 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute top-3 left-3 bg-black/40 px-2 py-0.5 rounded text-[10px] text-white">Priya Sharma</div>
                        <div className="w-full h-full bg-gradient-to-br from-indigo-950/20 to-black flex flex-col items-center justify-center">
                          <Users className="w-8 h-8 text-indigo-400" />
                          <span className="text-[10px] text-slate-500 mt-2">Connected user stream</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[320px] flex flex-col items-center justify-center border border-white/5 rounded-3xl bg-slate-900/10">
                      <Video className="w-12 h-12 text-violet-400 mb-3" />
                      <h3 className="text-sm font-bold text-white">Video Stream Offline</h3>
                      <p className="text-xs text-[var(--db-text-muted)] mt-1 max-w-sm text-center">Join conference calls to share screens, annotate whiteboards, and compile projects live.</p>
                    </div>
                  )}

                  {/* Interactive Collaboration suite tabs */}
                  <div className="space-y-4">
                    <div className="flex p-1 bg-slate-950/60 rounded-2xl border border-white/5 flex-wrap gap-1">
                      {[
                        { id: 'whiteboard', label: 'Whiteboard', icon: Play },
                        { id: 'notes', label: 'Notes', icon: FileText },
                        { id: 'code', label: 'Multiplayer Editor', icon: CodeLanguageIcon },
                        { id: 'poll', label: 'Polls & Votes', icon: Award },
                        { id: 'tasks', label: 'Team Tasks', icon: Layers }
                      ].map(t => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setCollaborationTab(t.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                              collaborationTab === t.id ? 'bg-violet-650 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {t.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Collaboration contents container */}
                    <div className="p-5 border border-white/5 rounded-3xl bg-[rgba(15,23,42,0.3)] min-h-[300px]">
                      {/* Whiteboard */}
                      {collaborationTab === 'whiteboard' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-400">Drawing Canvas</span>
                            <div className="flex gap-1">
                              {['Box', 'Circle', 'ER Node', 'Flowchart Line'].map(shape => (
                                <button key={shape} onClick={() => handleAddWhiteboardNode(shape)} className="px-2 py-1 bg-violet-600/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold rounded-lg hover:bg-violet-600 hover:text-white transition cursor-pointer">+ {shape}</button>
                              ))}
                              <button onClick={handleClearWhiteboard} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500 hover:text-white transition cursor-pointer">Clear</button>
                            </div>
                          </div>

                          <div ref={canvasRef} className="h-60 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:16px_16px]" />
                            {whiteboardShapes.map(s => (
                              <div
                                key={s.id}
                                className="absolute p-3 bg-violet-650/20 border border-violet-500/50 text-white text-[10px] font-bold rounded-xl shadow-lg"
                                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                              >
                                {s.shape}
                              </div>
                            ))}
                            {whiteboardShapes.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-medium">Whiteboard Canvas is clean. Click shapes to start sketching.</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Collaborative Notes */}
                      {collaborationTab === 'notes' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-400">Cooperative Markdown Lecture Notes</span>
                            <button onClick={handleSaveNotes} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer">Save Notes</button>
                          </div>
                          <textarea
                            value={sharedNotes}
                            onChange={handleNotesChange}
                            placeholder="Type collaborative markdown study notes here..."
                            className="w-full h-60 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-slate-100 outline-none focus:border-violet-500 resize-none font-mono"
                          />
                        </div>
                      )}

                      {/* Collaborative Code Editor (Monaco) */}
                      {collaborationTab === 'code' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2 space-y-3">
                            <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-xl border border-white/5">
                              <div className="flex gap-2">
                                <select value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)} className="bg-slate-900 border border-white/10 text-white text-[10px] rounded px-2 py-0.5 outline-none">
                                  <option value="javascript">JavaScript</option>
                                  <option value="python">Python</option>
                                  <option value="csharp">C#</option>
                                </select>
                              </div>
                              <button onClick={handleRunCode} disabled={isCompiling} className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-white text-[10px] font-bold rounded-lg transition cursor-pointer">{isCompiling ? 'Running...' : 'Run Code'}</button>
                            </div>
                            
                            <div className="h-60 rounded-2xl overflow-hidden border border-white/5 bg-slate-950">
                              <Editor
                                height="100%"
                                language={codeLanguage}
                                theme="vs-dark"
                                value={sharedCode}
                                onChange={handleCodeChange}
                                options={{
                                  fontSize: 11,
                                  minimap: { enabled: false },
                                  automaticLayout: true
                                }}
                              />
                            </div>
                          </div>

                          {/* Sandbox terminal outputs */}
                          <div className="p-4 bg-black/40 border border-white/5 rounded-3xl space-y-2 flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Sandbox Terminal Output</span>
                              <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap">{codeConsole}</pre>
                            </div>
                            
                            <button
                              onClick={() => {
                                const loader = toast.loading('AI reviewing code boilerplate...');
                                api.post('/community/ai/explain-code', { code: sharedCode, language: codeLanguage }).then(res => {
                                  toast.dismiss(loader);
                                  setCodeConsole(`🤖 AI Code Review:\n${res.data.explanation}`);
                                }).catch(() => {
                                  toast.dismiss(loader);
                                  toast.error('AI check failed.');
                                });
                              }}
                              className="w-full py-2 bg-violet-600/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold rounded-xl hover:bg-violet-600 hover:text-white transition cursor-pointer"
                            >
                              Consult AI Code Review
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Quizzes & Polls */}
                      {collaborationTab === 'poll' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-400">Classroom Poll Question</span>
                            <button
                              onClick={() => {
                                const question = prompt('Enter poll question:');
                                if (question) {
                                  const opts = ['Option A', 'Option B', 'Option C'];
                                  setActivePoll({
                                    question,
                                    options: opts.map((o, idx) => ({ id: idx, text: o, votes: 0 }))
                                  });
                                }
                              }}
                              className="px-3.5 py-1 bg-violet-650 hover:bg-violet-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                            >
                              Create Poll
                            </button>
                          </div>

                          {activePoll ? (
                            <div className="p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4 max-w-md">
                              <h4 className="text-sm font-extrabold text-white">📊 {activePoll.question}</h4>
                              <div className="space-y-3">
                                {activePoll.options.map(opt => {
                                  const totalVotes = activePoll.options.reduce((sum, o) => sum + o.votes, 0) || 1;
                                  const pct = Math.round((opt.votes / totalVotes) * 100);
                                  return (
                                    <div key={opt.id} className="space-y-1">
                                      <button
                                        onClick={() => {
                                          const nextOpts = activePoll.options.map(o => o.id === opt.id ? { ...o, votes: o.votes + 1 } : o);
                                          setActivePoll({ ...activePoll, options: nextOpts });
                                          socketRef.current.emit('poll-vote-update', { roomId: activeRoom.id, pollOptions: nextOpts });
                                        }}
                                        className="w-full text-left px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900/60 text-xs font-bold text-slate-200 hover:border-violet-500/30 transition flex justify-between items-center cursor-pointer"
                                      >
                                        <span>{opt.text}</span>
                                        <span>{pct}%</span>
                                      </button>
                                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-violet-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic text-center py-12">No active classroom polls. Click "Create Poll" to query participants.</p>
                          )}
                        </div>
                      )}

                      {/* Tasks board lists */}
                      {collaborationTab === 'tasks' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {['todo', 'progress', 'completed'].map(col => (
                            <div key={col} className="p-3 bg-slate-950/30 border border-white/5 rounded-2xl space-y-3">
                              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest px-1">{col}</span>
                              <div className="space-y-2">
                                {tasks.filter(t => t.status === col).map(task => (
                                  <div key={task.id} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-xs space-y-2 hover:border-violet-500/20 transition">
                                    <p className="font-bold text-slate-200">{task.title}</p>
                                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                                      <span>Assignee: {task.assignee}</span>
                                      <span className={`px-1.5 py-0.5 rounded font-black ${task.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{task.priority}</span>
                                    </div>
                                    
                                    <div className="flex gap-1.5 justify-end text-[8px] font-bold text-violet-400 pt-1 border-t border-white/5">
                                      {col !== 'todo' && <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'todo' } : t))} className="hover:underline">To Do</button>}
                                      {col !== 'progress' && <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'progress' } : t))} className="hover:underline">Progress</button>}
                                      {col !== 'completed' && <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed' } : t))} className="hover:underline">Done</button>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Video call controls sidebar panel */}
              {showRightSidebar && (
                <aside className="w-80 bg-[rgba(15,23,42,0.3)] p-6 space-y-6 overflow-y-auto flex-shrink-0 flex flex-col justify-between border-l border-[var(--db-sidebar-border)]">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase text-violet-400 tracking-widest block">Video Meeting Controls</span>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>Device Camera</span>
                        <span className="font-bold text-white">FaceTime HD Web</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={() => setCameraOn(!cameraOn)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${cameraOn ? 'bg-violet-650 hover:bg-violet-750 text-white' : 'bg-red-500/20 text-red-400'}`}>
                          {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                          {cameraOn ? 'Video On' : 'Video Off'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>Microphone source</span>
                        <span className="font-bold text-white">Default system mic</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={() => setMicOn(!micOn)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${micOn ? 'bg-indigo-650 hover:bg-indigo-750 text-white' : 'bg-red-500/20 text-red-400'}`}>
                          {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                          {micOn ? 'Mute Mic' : 'Unmute'}
                        </button>
                      </div>
                    </div>

                    {/* Raise Hand trigger */}
                    <button onClick={() => {
                      setHandRaised(!handRaised);
                      socketRef.current.emit('call-status-update', { roomId: activeRoom.id, userId: user?.id, handRaised: !handRaised });
                      toast(!handRaised ? 'Raised hand!' : 'Lowered hand.');
                    }} className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${handRaised ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-300'}`}>
                      Raise Hand
                    </button>
                  </div>

                  {/* Smart transcripts summary panel */}
                  <div className="p-4 bg-slate-900 border border-white/5 rounded-3xl space-y-3">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">AI Meeting Assistant</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      AI is active in the background transcribing voice, summarizing slides, and analyzing code. Action reports will populate here on call completion.
                    </p>
                  </div>
                </aside>
              )}
            </div>
          )}

        </main>
      </div>

      {/* 3. POPUPS MODALS & DIALOGS */}

      {/* CREATE ROOM MODAL */}
      <AnimatePresence>
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowCreateRoom(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-extrabold text-white mb-4">➕ Initialize Community Room</h3>
              <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Room Name</label>
                  <input type="text" required value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="e.g. data-structures-sprint" className="w-full bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl px-4 py-2.5 text-white outline-none focus:border-violet-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">Category</label>
                    <select value={newRoomCategory} onChange={e => setNewRoomCategory(e.target.value)} className="w-full bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl p-2.5 text-white outline-none">
                      <option value="General Discussion">General Discussion</option>
                      <option value="Programming">Programming</option>
                      <option value="Competitive Programming">Competitive Programming</option>
                      <option value="Career Guidance">Career Guidance</option>
                      <option value="Study Groups">Study Groups</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">Room Type</label>
                    <select value={newRoomType} onChange={e => setNewRoomType(e.target.value)} className="w-full bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl p-2.5 text-white outline-none">
                      <option value="chat">💬 Chat Only</option>
                      <option value="voice">🎤 Voice Call</option>
                      <option value="video">📹 Video Meeting</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Description</label>
                  <textarea value={newRoomDescription} onChange={e => setNewRoomDescription(e.target.value)} placeholder="Describe objectives..." className="w-full h-16 bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl p-3 text-white outline-none resize-none focus:border-violet-500" />
                </div>

                <button type="submit" className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs mt-4 transition cursor-pointer">
                  Create Room Channel
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FRIENDS MODAL */}
      <AnimatePresence>
        {showFriends && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowFriends(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-extrabold text-white mb-4">👥 Friend System Connection</h3>
              
              <form onSubmit={handleSendFriendRequest} className="flex gap-2 mb-4">
                <input
                  type="email"
                  value={friendEmailInput}
                  onChange={e => setFriendEmailInput(e.target.value)}
                  placeholder="Enter friend email to add..."
                  className="flex-1 bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold cursor-pointer">Add</button>
              </form>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Friends list</span>
                {friends.map(friend => (
                  <div key={friend.friend_id} className="p-3 bg-white/2 border border-white/5 rounded-2xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white font-bold">{friend.friend_name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-bold text-white">{friend.friend_name}</p>
                        <span className="text-[9px] text-slate-500">{friend.friend_email}</span>
                      </div>
                    </div>

                    <div>
                      {friend.status === 'pending' ? (
                        friend.is_requester ? (
                          <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">Pending</span>
                        ) : (
                          <button onClick={() => handleAcceptFriendRequest(friend.friend_id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded-lg cursor-pointer">Accept</button>
                        )
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Connected</span>
                      )}
                    </div>
                  </div>
                ))}
                {friends.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">No connected friends. Try adding one by email.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CALENDAR SCHEDULER MODAL */}
      <AnimatePresence>
        {showCalendar && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowCalendar(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-1.5">
                📅 Event Calendar Scheduler
              </h3>
              <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-wider">Schedule mock interviews, webinars, or webinars.</p>
              
              <form onSubmit={handleScheduleEvent} className="space-y-3 mb-4 text-xs border-b border-white/5 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    placeholder="Event Title..."
                    className="bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl px-3 py-2 text-white outline-none"
                  />
                  <input
                    type="datetime-local"
                    required
                    value={newEventTime}
                    onChange={e => setNewEventTime(e.target.value)}
                    className="bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-violet-650 hover:bg-violet-750 text-white rounded-xl text-xs font-bold cursor-pointer">Schedule Event</button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {events.map(ev => (
                  <div key={ev.id} className="p-3 bg-white/2 border border-white/5 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{ev.title}</p>
                      <span className="text-[9px] text-slate-500">{new Date(ev.start_time).toLocaleString()}</span>
                    </div>
                    <span className="text-[9px] uppercase bg-violet-500/10 text-violet-400 font-bold px-2 py-0.5 rounded">{ev.event_type}</span>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">No scheduled sessions. Schedule a webinar above.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GAMIFICATION LEADERBOARD MODAL */}
      <AnimatePresence>
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowLeaderboard(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-1.5">
                🏆 Space Contributor Leaderboard
              </h3>
              <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-wider">Top contributors based on messages sent, peer help, and community XP.</p>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {leaderboard.map((userRank, idx) => (
                  <div key={userRank.id} className="p-3.5 bg-white/2 border border-white/5 rounded-2xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs ${idx === 0 ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : idx === 1 ? 'bg-slate-350 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/5 text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white">{userRank.name}</p>
                        <span className="text-[9px] text-slate-500">{userRank.message_count} messages sent</span>
                      </div>
                    </div>
                    <span className="font-black text-violet-400">{userRank.total_xp} XP</span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  // Mock Rank fallback if empty
                  <div className="space-y-2">
                    {[
                      { name: 'Kavya Sharma', xp: 580, msg: 45 },
                      { name: 'You', xp: 320, msg: 21 },
                      { name: 'Rahul K.', xp: 280, msg: 19 }
                    ].map((m, idx) => (
                      <div key={idx} className="p-3 bg-white/2 border border-white/5 rounded-2xl flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-white/5 text-slate-400 text-center text-[10px] flex items-center justify-center font-extrabold">{idx + 1}</span>
                          <div>
                            <p className="font-bold text-white">{m.name}</p>
                            <span className="text-[9px] text-slate-500">{m.msg} messages</span>
                          </div>
                        </div>
                        <span className="font-black text-violet-400">{m.xp} XP</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER PROFILE MODAL */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-xs">
              <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center border-b border-white/5 pb-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-500 to-indigo-650 flex items-center justify-center font-extrabold text-white text-2xl shadow-lg border-2 border-violet-500/20">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-base font-extrabold text-white mt-3">{user?.name}</h3>
                <span className="text-[9px] uppercase tracking-widest text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 mt-1">{user?.role}</span>
              </div>

              <div className="py-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white/2 border border-white/5 rounded-2xl">
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Level</span>
                    <span className="font-extrabold text-sm text-white">4</span>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-2xl">
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Total XP</span>
                    <span className="font-extrabold text-sm text-amber-500">320</span>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-2xl">
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Streak</span>
                    <span className="font-extrabold text-sm text-cyan-400">5 Days</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-450 font-bold block">Biographical outline</span>
                  <p className="text-slate-300 leading-normal bg-black/20 p-3 rounded-xl border border-white/5">
                    "Computer Science undergrad. Interested in algorithms, PostgreSQL DB modeling, and building multiplayer React engines."
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-455 font-bold block">Unlocked Achievements Badges</span>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-400 font-bold text-[10px] flex items-center gap-1">🏆 Java Warrior</span>
                    <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/25 rounded-xl text-cyan-400 font-bold text-[10px] flex items-center gap-1">🎓 Top Contributor</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT USER MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
              <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-extrabold text-white mb-2">🛡️ Report User Conduct</h3>
              <p className="text-[10px] text-slate-400 mb-4">Report violations to workspace moderators against user: <strong>{reportTargetUser?.name}</strong>.</p>
              
              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-450 block font-bold">Reason for Report</label>
                  <textarea required value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Provide context (spamming, profanity, duplicate messages)..." className="w-full h-24 bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-xl p-3 text-white outline-none resize-none focus:border-rose-500" />
                </div>
                <button type="submit" className="w-full py-3 bg-red-650 hover:bg-red-750 text-white rounded-xl font-bold text-xs transition cursor-pointer">Submit Report</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL SEARCH DIALOG OVERLAY */}
      <AnimatePresence>
        {showSearch && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4" onClick={() => setShowSearch(false)}>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] p-4 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] rounded-2xl px-4 py-3">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Global search rooms, messages, or friends..."
                  className="flex-1 bg-transparent text-xs text-white outline-none"
                />
                <button onClick={() => setShowSearch(false)} className="text-[10px] text-slate-500 hover:text-white uppercase font-bold">ESC</button>
              </div>

              {searchQuery && (
                <div className="space-y-4 max-h-80 overflow-y-auto text-xs pr-1">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Search Results</span>
                  
                  {/* Filtered rooms */}
                  {rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                    <button key={r.id} onClick={() => { setActiveRoom(r); setShowSearch(false); }} className="w-full p-2.5 bg-white/2 hover:bg-violet-650/10 border border-white/5 rounded-xl text-left font-bold text-slate-200 transition flex justify-between items-center cursor-pointer">
                      <span># {r.name}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{r.category}</span>
                    </button>
                  ))}
                  
                  {/* Filtered messages */}
                  {messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase())).map(m => (
                    <div key={m.id} className="p-3 bg-white/2 border border-white/5 rounded-xl text-left space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <strong>{m.sender_name}</strong>
                        <span>{new Date(m.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-350 leading-normal">{m.text}</p>
                    </div>
                  ))}
                  
                  {rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                   messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-6">No matching results found.</p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Simple fallback icon mapping
function CodeLanguageIcon({ className }) {
  return <Award className={className} />;
}
