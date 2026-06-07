import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data));
    loadQuizzes();
  }, []);

  const loadQuizzes = (subjectId = '') => {
    const params = subjectId ? `?subject_id=${subjectId}` : '';
    api.get(`/quizzes${params}`).then((res) => setQuizzes(res.data));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quiz Module</h1>
          <p className="text-slate-500">Subject-wise and topic-wise MCQ quizzes</p>
        </div>
        <select className="input-field max-w-xs" value={filter} onChange={(e) => { setFilter(e.target.value); loadQuizzes(e.target.value); }}>
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
        </select>
      </div>

      <div className="grid gap-4">
        {quizzes.map((q) => (
          <div key={q.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-sm text-slate-500">{q.subject_name} • {q.question_count || 0} questions</p>
            </div>
            <Link to={`/quizzes/${q.id}`} className="btn-primary text-sm shrink-0">Start Quiz</Link>
          </div>
        ))}
        {quizzes.length === 0 && <p className="text-slate-500 text-center py-8">No quizzes available</p>}
      </div>
    </div>
  );
}
