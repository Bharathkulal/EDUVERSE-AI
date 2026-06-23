import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const languages = ['java', 'python', 'c', 'csharp'];

function LazyMonacoEditor({ value, onChange, language }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const initMonaco = () => {
      if (!window.require) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs/loader.min.js';
        script.onload = () => {
          if (active) loadEditor();
        };
        document.body.appendChild(script);
      } else {
        loadEditor();
      }
    };

    const loadEditor = () => {
      window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
      window.require(['vs/editor/editor.main'], () => {
        if (!active || !containerRef.current) return;
        
        if (editorRef.current) {
          editorRef.current.dispose();
        }

        const monacoLang = language === 'csharp' ? 'csharp' : (language === 'c' ? 'cpp' : (language === 'java' ? 'java' : 'python'));

        editorRef.current = window.monaco.editor.create(containerRef.current, {
          value: value,
          language: monacoLang,
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
        });

        editorRef.current.onDidChangeModelContent(() => {
          if (onChange) {
            onChange(editorRef.current.getValue());
          }
        });

        setLoading(false);
      });
    };

    initMonaco();

    return () => {
      active = false;
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current && window.monaco) {
      const model = editorRef.current.getModel();
      if (model) {
        const monacoLang = language === 'csharp' ? 'csharp' : (language === 'c' ? 'cpp' : (language === 'java' ? 'java' : 'python'));
        window.monaco.editor.setModelLanguage(model, monacoLang);
      }
    }
  }, [language]);

  return (
    <div className="relative w-full h-80 bg-slate-900">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-slate-400">
          Initializing Monaco Editor...
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

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
            <LazyMonacoEditor
              value={code}
              onChange={setCode}
              language={language}
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
