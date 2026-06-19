import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import CSharpLab from '../components/CSharpLab';
import DBMSLab from '../components/DBMSLab';
import JavaLab from '../components/JavaLab';
import DSALab from '../components/DSALab';

export default function SubjectDetail() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);

  useEffect(() => {
    api.get(`/subjects/${id}`).then((res) => {
      setSubject(res.data);
      if (res.data.topics?.length) setActiveTopic(res.data.topics[0]);
    });
  }, [id]);

  const markComplete = async (topicId) => {
    try {
      await api.post('/progress/complete-topic', { topic_id: topicId, study_minutes: 20 });
      toast.success('Topic marked as completed!');
    } catch {
      toast.error('Could not update progress');
    }
  };

  if (!subject) return <div className="animate-pulse h-96 bg-slate-200 rounded-xl" />;

  // DBMS gets the interactive lab experience
  if (subject.subject_name === 'DBMS') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px' }}>{subject.subject_name}</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>{subject.description}</p>
        </div>
        <DBMSLab />
      </div>
    );
  }

  // Advanced Java gets the interactive lab experience
  if (subject.subject_name === 'Advanced Java') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px' }}>{subject.subject_name}</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>{subject.description}</p>
        </div>
        <JavaLab />
      </div>
    );
  }

  // C# gets the interactive lab experience
  if (subject.subject_name === 'C#') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px' }}>{subject.subject_name}</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>{subject.description}</p>
        </div>
        <CSharpLab />
      </div>
    );
  }

  // DSA gets the interactive lab experience
  if (subject.subject_name === 'DSA') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px' }}>{subject.subject_name}</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>{subject.description}</p>
        </div>
        <DSALab />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{subject.subject_name}</h1>
        <p className="text-slate-500">{subject.description}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 card h-fit">
          <h2 className="font-semibold mb-3">Topics</h2>
          <ul className="space-y-1">
            {subject.topics?.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveTopic(t)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeTopic?.id === t.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-slate-100'}`}
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 card">
          {activeTopic ? (
            <>
              <h2 className="text-xl font-semibold">{activeTopic.title}</h2>
              <div className="prose prose-slate mt-4 max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap">{activeTopic.content}</p>
                {activeTopic.notes && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-medium text-amber-800">Notes</h3>
                    <p className="text-amber-900 mt-1">{activeTopic.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {activeTopic.pdf_url && (
                  <a href={activeTopic.pdf_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm">📄 View PDF</a>
                )}
                {activeTopic.video_url && (
                  <a href={activeTopic.video_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm">🎥 Watch Video</a>
                )}
                <button onClick={() => markComplete(activeTopic.id)} className="btn-primary text-sm">Mark as Completed</button>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Select a topic to view content</p>
          )}
        </div>
      </div>
    </div>
  );
}
