import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const modes = [
  { id: 'doubt', label: 'Ask Doubt', icon: '❓' },
  { id: 'explain', label: 'Explain Concept', icon: '📖' },
  { id: 'example', label: 'Generate Examples', icon: '💡' },
  { id: 'practice', label: 'Practice Questions', icon: '📝' },
  { id: 'career', label: 'AI Career Guide', icon: '🎯' },
  { id: 'interview', label: 'AI Interviewer', icon: '🎙️' },
  { id: 'resume', label: 'Resume Reviewer', icon: '📄' },
  { id: 'planner', label: 'Study Planner', icon: '📅' },
];

const HASH_TO_MODE = {
  '#mentor': 'doubt',
  '#career': 'career',
  '#interviewer': 'interview',
  '#resume': 'resume',
  '#planner': 'planner',
  '#battles': 'practice',
};

export default function AITutor() {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('doubt');
  const [subject, setSubject] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const location = useLocation();

  // Hash-based navigation from sidebar
  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_MODE[hash]) {
      setMode(HASH_TO_MODE[hash]);
    }
  }, [location.hash]);

  useEffect(() => {
    api.get('/ai/history').then((res) => setChats(res.data.reverse()));
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    const userMsg = message;
    setMessage('');
    setChats((prev) => [...prev, { message: userMsg, response: 'Thinking...', pending: true }]);

    try {
      const { data } = await api.post('/ai/chat', { message: userMsg, mode, subject });
      setChats((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { message: userMsg, response: data.response };
        return updated;
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI request failed');
      setChats((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold">AI Tutor</h1>
        <p className="text-slate-500">Powered by Gemini — ask doubts, get explanations & practice questions</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${mode === m.id ? 'bg-primary-600 text-white' : 'bg-white border'}`}>
            {m.icon} {m.label}
          </button>
        ))}
        <input className="input-field max-w-[200px] text-sm" placeholder="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>

      <div className="flex-1 card overflow-y-auto space-y-4 min-h-0">
        {chats.length === 0 && (
          <div className="text-center text-slate-400 py-12">
            <p className="text-4xl mb-2">🤖</p>
            <p>Start a conversation with your AI tutor</p>
          </div>
        )}
        {chats.map((c, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-primary-600 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">{c.message}</div>
            </div>
            <div className="flex justify-start">
              <div className={`bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm max-w-[85%] whitespace-pre-wrap ${c.pending ? 'animate-pulse' : ''}`}>
                {c.response}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input className="input-field flex-1" placeholder="Ask your question..." value={message} onChange={(e) => setMessage(e.target.value)} disabled={loading} />
        <button type="submit" className="btn-primary shrink-0" disabled={loading}>Send</button>
      </form>
    </div>
  );
}
