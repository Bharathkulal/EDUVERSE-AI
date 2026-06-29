import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X, Send, Sparkles, Code, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function AIChatLayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m Friday, your AI study assistant. Ask me anything — doubts, code examples, or concept explanations!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Detect current page context
  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes('/dsa/stack')) return 'Stack (LIFO Data Structure)';
    if (path.includes('/dsa/queue')) return 'Queue (FIFO Data Structure)';
    if (path.includes('/dsa/linked-list')) return 'Linked List (Dynamic Data Structure)';
    if (path.includes('/dsa/tree')) return 'Tree (Hierarchical Data Structure)';
    if (path.includes('/dsa/graph')) return 'Graph (Network Data Structure)';
    if (path.includes('/coding')) return 'Coding Playground';
    if (path.includes('/subjects')) return 'Subjects & Syllabus';
    if (path.includes('/quizzes')) return 'Quizzes & Assessments';
    if (path.includes('/dashboard')) return 'Student Dashboard';
    if (path.includes('/mathematics')) return 'Mathematics Visualizer';
    return 'EduVerse AI Platform';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Determine category based on route
    const getCategory = () => {
      const path = location.pathname;
      if (path.includes('/dsa') || path.includes('/coding')) return 'coding';
      if (path.includes('/quizzes') || path.includes('/arena')) return 'pgcet';
      if (path.includes('/question-bank') || path.includes('/subjects')) return 'question-bank';
      return 'tutor';
    };

    try {
      const { data } = await api.post('/friday/chat', {
        message: userMessage,
        category: getCategory(),
        subject: getPageContext()
      });

      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.response || 'I couldn\'t generate a response. Please try again.',
      }]);
    } catch (err) {
      console.error('Friday AI error:', err);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `I'm having trouble connecting right now. Here's what I'd suggest for "${userMessage}":\n\n1. Break the problem into smaller steps\n2. Review your course materials on this topic\n3. Try practicing with examples\n\nPlease try again in a moment!`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #3B82F6, #6366F1, #8B5CF6)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
          }}
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <BrainCircuit className="w-7 h-7" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
        </motion.button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-50 w-[340px] md:w-[400px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(99, 102, 241, 0.15)'
            }}
          >
            {/* Header */}
            <div
              className="p-4 flex justify-between items-center text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1, #8B5CF6)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">Friday AI</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-200 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online • {getPageContext()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3" style={{ background: '#f8fafc' }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`max-w-[88%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div
                    className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-sm'
                    }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.text}
                  </div>
                  {msg.code && (
                    <div className="mt-2 bg-slate-900 rounded-xl p-3 text-xs font-mono text-blue-300 relative group overflow-hidden border border-slate-800">
                      <Code className="w-3 h-3 absolute top-2 right-2 text-slate-600" />
                      <pre className="relative z-10 whitespace-pre-wrap">{msg.code}</pre>
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-sm p-3 w-fit shadow-sm flex items-center gap-2"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-400">Friday is thinking...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Friday anything..."
                  className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="text-indigo-600 disabled:text-slate-300 transition hover:text-indigo-700 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-slate-400 text-center mt-1.5 font-medium">
                Powered by EduVerse AI • Double-tap screen for voice mode
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
