import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const languages = ['java', 'python', 'c', 'csharp'];

export default function Coding() {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProblems();
    loadSubmissions();
  }, [language]);

  const loadProblems = () => {
    api.get(`/coding/problems?language=${language}`).then((res) => setProblems(res.data));
  };

  const loadSubmissions = () => {
    api.get('/coding/submissions').then((res) => setSubmissions(res.data));
  };

  const selectProblem = (p) => {
    setSelectedProblem(p);
    setCode(getStarterCode(p.language));
  };

  const getStarterCode = (lang) => {
    const templates = {
      java: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
      python: '# Write your solution here\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()',
      c: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}',
      csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        // Your code here\n    }\n}',
    };
    return templates[lang] || templates.python;
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/coding/submit', {
        language,
        code,
        problem_id: selectedProblem?.id,
      });
      toast.success(`Submitted! Score: ${data.score}%`);
      loadSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coding Practice</h1>
        <p className="text-slate-500">Practice Java, Python, C, and C# problems</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {languages.map((l) => (
          <button key={l} onClick={() => { setLanguage(l); setSelectedProblem(null); }} className={`px-4 py-2 rounded-lg capitalize ${language === l ? 'bg-primary-600 text-white' : 'bg-white border border-slate-300'}`}>
            {l === 'csharp' ? 'C#' : l}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1 h-fit max-h-96 overflow-y-auto">
          <h2 className="font-semibold mb-3">Problems</h2>
          {problems.map((p) => (
            <button key={p.id} onClick={() => selectProblem(p)} className={`w-full text-left p-3 rounded-lg mb-2 ${selectedProblem?.id === p.id ? 'bg-primary-100' : 'hover:bg-slate-50'}`}>
              <p className="font-medium text-sm">{p.title}</p>
              <p className="text-xs text-slate-500 capitalize">{p.difficulty}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedProblem && (
            <div className="card">
              <h3 className="font-semibold">{selectedProblem.title}</h3>
              <p className="text-slate-600 mt-2 text-sm">{selectedProblem.description}</p>
            </div>
          )}
          <div className="card p-0 overflow-hidden">
            <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
              <span className="text-white text-sm font-mono">Code Editor</span>
              <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1 rounded" disabled={submitting}>
                {submitting ? 'Running...' : 'Submit Code'}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-80 p-4 font-mono text-sm bg-slate-900 text-green-400 focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Recent Submissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-2">Language</th>
                <th className="pb-2">Problem</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.slice(0, 10).map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="py-2 capitalize">{s.language}</td>
                  <td>{s.problem_title || 'Custom'}</td>
                  <td><span className="font-medium text-primary-600">{s.score}%</span></td>
                  <td className="text-slate-500">{new Date(s.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
