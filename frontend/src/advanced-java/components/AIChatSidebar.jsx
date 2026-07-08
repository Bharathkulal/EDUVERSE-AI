/**
 * AIChatSidebar — Floating AI chat panel for Advanced Java lessons
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, RefreshCw, Bot, User, Sparkles } from 'lucide-react';
import api from '../../api/axios';

const QUICK_PROMPTS = [
  { label: '❓ What is this?',       text: 'Explain this Java concept in simple terms' },
  { label: '🏛️ Architect view',     text: 'Explain from a Software Architect perspective' },
  { label: '💡 Simpler example',     text: 'Give me an even simpler Java code example' },
  { label: '🧠 Interview question',  text: 'Give me a Java interview question on this topic' },
  { label: '📝 Practice problem',    text: 'Generate a Java practice problem for me' },
  { label: '⚠️ Common mistakes',    text: 'What are common mistakes Java developers make here?' },
  { label: '🌐 Real-world use',      text: 'Where is this used in enterprise Java projects?' },
  { label: '🔍 Deep dive',           text: 'Give me an advanced explanation of this concept' },
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
      content: `Hi! 👋 I'm your AI Java Architect tutor for **${lesson?.title || 'this lesson'}**. Ask me anything about enterprise Java — I'm here to help!`,
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
        subject: `Advanced Java - ${lesson?.title || 'General'}`
      });
      const aiText = resp.data?.response || "I'm having trouble connecting. Please try again!";
      setMessages(prev =>
        prev.map(m => m.id === loadEntry.id ? { ...m, loading: false, content: aiText } : m)
      );
    } catch {
      const fallback = `[Demo Mode] For "${userMsg}" regarding ${lesson?.title}:\n\nThis is a key concept in Enterprise Java. Try reviewing the lesson content and code examples. For live AI responses, ensure the backend AI service is connected!`;
      setMessages(prev =>
        prev.map(m => m.id === loadEntry.id ? { ...m, loading: false, content: fallback } : m)
      );
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl z-50 border"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
              borderColor: accentColor + '60',
              boxShadow: `0 8px 30px ${accentColor}40`,
            }}
          >
            <MessageSquare size={22} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-[380px] h-[520px] rounded-2xl border flex flex-col overflow-hidden z-50 shadow-2xl"
            style={{
              borderColor: accentColor + '30',
              background: '#0c0e1a',
              boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${accentColor}10`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: accentColor + '20', background: accentColor + '08' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: accentColor + '20', border: `1px solid ${accentColor}40` }}
              >
                <Bot size={16} style={{ color: accentColor }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Java Architect AI</div>
                <div className="text-[10px] text-slate-500">{lesson?.title || 'Advanced Java'}</div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map(msg => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-3 py-2 border-t border-slate-800/50 overflow-x-auto flex gap-1.5 flex-shrink-0 scrollbar-thin">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => sendMessage(p.text)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-800/50 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about Java architecture..."
                  className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl transition-all disabled:opacity-30"
                  style={{ background: accentColor }}
                >
                  <Send size={14} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
