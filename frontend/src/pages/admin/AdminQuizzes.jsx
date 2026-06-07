import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState('quizzes');
  const [form, setForm] = useState({
    subject_id: '', title: '',
    questions: [{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' }],
  });

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data));
    loadQuizzes();
    api.get('/quizzes/results/all').then((res) => setResults(res.data));
  }, []);

  const loadQuizzes = () => api.get('/quizzes').then((res) => setQuizzes(res.data));

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' }] });
  };

  const createQuiz = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quizzes', form);
      toast.success('Quiz created');
      setForm({ subject_id: '', title: '', questions: [{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' }] });
      loadQuizzes();
    } catch {
      toast.error('Failed to create quiz');
    }
  };

  const deleteQuiz = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    await api.delete(`/quizzes/${id}`);
    toast.success('Deleted');
    loadQuizzes();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quiz Management</h1>
        <p className="text-slate-500">Create, edit, and view quiz results</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('quizzes')} className={tab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}>Quizzes</button>
        <button onClick={() => setTab('results')} className={tab === 'results' ? 'btn-primary' : 'btn-secondary'}>Results</button>
        <button onClick={() => setTab('create')} className={tab === 'create' ? 'btn-primary' : 'btn-secondary'}>Create Quiz</button>
      </div>

      {tab === 'create' && (
        <form onSubmit={createQuiz} className="card space-y-4">
          <select className="input-field" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} required>
            <option value="">Select Subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
          </select>
          <input className="input-field" placeholder="Quiz Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          {form.questions.map((q, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg space-y-2">
              <input className="input-field" placeholder="Question" value={q.question} onChange={(e) => { const qs = [...form.questions]; qs[i].question = e.target.value; setForm({ ...form, questions: qs }); }} />
              {['a', 'b', 'c', 'd'].map((opt) => (
                <input key={opt} className="input-field text-sm" placeholder={`Option ${opt.toUpperCase()}`} value={q[`option_${opt}`]} onChange={(e) => { const qs = [...form.questions]; qs[i][`option_${opt}`] = e.target.value; setForm({ ...form, questions: qs }); }} />
              ))}
              <select className="input-field" value={q.correct_answer} onChange={(e) => { const qs = [...form.questions]; qs[i].correct_answer = e.target.value; setForm({ ...form, questions: qs }); }}>
                <option value="a">Correct: A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="btn-secondary">+ Add Question</button>
          <button type="submit" className="btn-primary w-full">Create Quiz</button>
        </form>
      )}

      {tab === 'quizzes' && (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q.id} className="card flex justify-between items-center">
              <div>
                <p className="font-medium">{q.title}</p>
                <p className="text-sm text-slate-500">{q.subject_name} • {q.question_count} questions</p>
              </div>
              <button onClick={() => deleteQuiz(q.id)} className="text-red-600 text-sm">Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'results' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2">Student</th><th className="pb-2">Quiz</th><th className="pb-2">Subject</th><th className="pb-2">Score</th><th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2">{r.student_name}</td>
                  <td>{r.quiz_title}</td>
                  <td>{r.subject_name}</td>
                  <td className="font-medium text-primary-600">{r.score}%</td>
                  <td className="text-slate-500">{new Date(r.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
