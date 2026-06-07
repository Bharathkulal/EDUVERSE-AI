import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/quizzes/${id}`).then((res) => setQuiz(res.data));
  }, [id]);

  const selectAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    const answerList = Object.entries(answers).map(([question_id, answer]) => ({
      question_id: parseInt(question_id),
      answer,
    }));
    if (answerList.length < (quiz?.questions?.length || 0)) {
      toast.error('Please answer all questions');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/quizzes/${id}/submit`, { answers: answerList });
      setResult(data);
      toast.success(`Score: ${data.score}%`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz) return <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />;

  if (result) {
    return (
      <div className="max-w-lg mx-auto card text-center">
        <div className="text-6xl mb-4">{result.score >= 70 ? '🎉' : '📚'}</div>
        <h1 className="text-3xl font-bold text-primary-600">{result.score}%</h1>
        <p className="text-slate-600 mt-2">You got {result.correct} out of {result.total} correct</p>
        <button onClick={() => navigate('/quizzes')} className="btn-primary mt-6">Back to Quizzes</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-slate-500">{quiz.subject_name} • {quiz.questions?.length} questions</p>
      </div>

      {quiz.questions?.map((q, idx) => (
        <div key={q.id} className="card">
          <p className="font-medium mb-3">{idx + 1}. {q.question}</p>
          <div className="space-y-2">
            {['a', 'b', 'c', 'd'].map((opt) => (
              <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${answers[q.id] === opt ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === opt} onChange={() => selectAnswer(q.id, opt)} className="text-primary-600" />
                <span className="uppercase font-medium text-slate-400 w-4">{opt}.</span>
                <span>{q[`option_${opt}`]}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button onClick={submitQuiz} className="btn-primary w-full" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
}
