/**
 * AIChatSidebar — Floating AI chat panel for Python lessons
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, RefreshCw, ChevronDown, Bot, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const QUICK_PROMPTS = [
  { label: '❓ What is this?',       text: 'Explain this concept in simple terms' },
  { label: '🔁 Explain again',        text: 'Explain this topic again differently' },
  { label: '💡 Easier example',       text: 'Give me an even simpler example' },
  { label: '🧠 Interview question',   text: 'Give me an interview question on this topic' },
  { label: '📝 Practice problem',     text: 'Generate a practice problem for me' },
  { label: '⚠️ Common mistakes',     text: 'What are common mistakes beginners make here?' },
  { label: '🌐 Real-world use',       text: 'Where is this used in real-world projects?' },
  { label: '🔍 Deep dive',            text: 'Give me an advanced explanation of this concept' },
];

function ChatMessage({ msg }) {
  const isAI = msg.role === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isAI ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-700 border border-slate-600'}`}
      >
        {isAI ? <Bot size={13} className="text-blue-400" /> : <User size={13} className="text-slate-300" />}
      </div>
      <div
        className={`max-w-[78%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
          isAI
            ? 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-sm'
            : 'bg-blue-600/80 text-white rounded-tr-sm'
        }`}
      >
        {msg.loading ? (
          <div className="flex gap-1 items-center py-1">
            {[0,1,2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        ) : (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        )}
      </div>
    </motion.div>
  );
}

export default function AIChatSidebar({ lesson }) {
  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'ai',
      content: `Hi! 👋 I'm your AI tutor for **${lesson?.title || 'this lesson'}**. Ask me anything about the topic — I'm here to help you understand!`,
    }
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef              = useRef(null);
  const inputRef               = useRef(null);
  const accentColor            = lesson?.accent || '#3B82F6';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    const userEntry = { id: Date.now(), role: 'user', content: userMsg };
    const loadEntry = { id: Date.now() + 1, role: 'ai', loading: true, content: '' };
    setMessages(prev => [...prev, userEntry, loadEntry]);
    setLoading(true);

    try {
      const resp = await api.post('/ai/chat', {
        message: userMsg,
        mode: 'explain',
        subject: `Python - ${lesson?.title || 'General'}`
      });
      const aiText = resp.data?.response || 'I\'m having trouble connecting. Please try again!';
      setMessages(prev =>
        prev.map(m => m.id === loadEntry.id ? { ...m, loading: false, content: aiText } : m)
      );
    } catch {
      const fallback = `[Demo Mode] For "${userMsg}" regarding ${lesson?.title}:\n\nThis is a key concept in Python. Try breaking it into smaller parts and reviewing the lesson content. For live AI responses, ensure the backend is connected!`;
      setMessages(prev =>
        prev.map(m => m.id === loadEntry.id ? { ...m, loading: false, content: fallback } : m)
      );
    }
    setLoading(false);
  };

  const handleClear = () => {
    setMessages([{ id: 0, role: 'ai', content: `Chat cleared! Ask me anything about ${lesson?.title || 'Python'}.` }]);
    toast('Chat cleared', { icon: '🗑️' });
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}BB)`,
          boxShadow: `0 8px 32px ${accentColor}60`,
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-900"
          />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 30, y: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 30, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-40 w-[360px] max-h-[600px] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: 'rgba(10,10,20,0.97)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${accentColor}40`,
              boxShadow: `0 25px 60px rgba(0,0,0,0.8), 0 0 30px ${accentColor}20`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: accentColor + '30', background: accentColor + '12' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: accentColor + '30', border: `1px solid ${accentColor}60` }}
              >
                <Sparkles size={14} style={{ color: accentColor }} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">AI Tutor</div>
                <div className="text-[10px] text-slate-500">{lesson?.title}</div>
              </div>
              <div className="ml-auto flex gap-1">
                <button onClick={handleClear} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors" title="Clear chat">
                  <RefreshCw size={12} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Quick prompts */}
            <div className="flex gap-1.5 px-3 py-2 overflow-x-auto flex-shrink-0 border-b border-slate-800/50" style={{ scrollbarWidth: 'none' }}>
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => sendMessage(p.text)}
                  className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-300 transition-all whitespace-nowrap"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-2 px-3 py-3 border-t flex-shrink-0"
              style={{ borderColor: accentColor + '20', background: 'rgba(0,0,0,0.4)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask anything about Python…"
                className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: input.trim() && !loading ? `linear-gradient(135deg, ${accentColor}, ${accentColor}BB)` : '#1E293B',
                  border: `1px solid ${accentColor}40`,
                }}
              >
                {loading
                  ? <RefreshCw size={14} className="animate-spin text-slate-400" />
                  : <Send size={14} style={{ color: input.trim() ? '#fff' : '#475569' }} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
