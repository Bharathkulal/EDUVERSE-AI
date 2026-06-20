import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const subjectIcons = {
  FOC: '🔢', Java: '☕', 'Advanced Java': '⚡', DSA: '🌳', 'C#': '🔷',
  DBMS: '🗄️', Python: '🐍', 'Web Development': '🌐', Mathematics: '🧮',
};

const subjectBlobColors = {
  FOC: 'blob-foc',
  Java: 'blob-java',
  'Advanced Java': 'blob-advjava',
  DSA: 'blob-dsa',
  'C#': 'blob-csharp',
  DBMS: 'blob-dbms',
  Python: 'blob-python',
  'Web Development': 'blob-webdev',
  Mathematics: 'blob-python',
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subjects')
      .then(res => {
        const uniqueSubjects = [];
        const seen = new Set();
        for (const item of res.data) {
          if (!seen.has(item.subject_name)) {
            seen.add(item.subject_name);
            uniqueSubjects.push(item);
          }
        }
        // Inject Mathematics for prototype if not present
        if (!uniqueSubjects.find(s => s.subject_name === 'Mathematics')) {
          uniqueSubjects.push({
            id: 'math-proto',
            subject_name: 'Mathematics',
            description: 'Advanced numerical methods and calculus execution engines.',
            topic_count: 3,
            unit_count: 1
          });
        }
        setSubjects(uniqueSubjects);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-[260px] bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Learning Modules</h1>
        <p className="text-slate-500">Explore subjects with theory, notes, PDFs, and videos</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {subjects.map((s) => (
          <Link key={s.id} to={`/subjects/${s.id}`} className="subject-card group">
            <div className={`subject-card-blob ${subjectBlobColors[s.subject_name] || 'blob-default'}`} />
            <div className="subject-card-bg" />
            <div className="subject-card-content">
              <div>
                <div className="text-4xl mb-3">{subjectIcons[s.subject_name] || '📚'}</div>
                <h3 className="font-semibold text-lg text-[var(--db-text-main)] group-hover:text-emerald-500 transition-colors duration-300">{s.subject_name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">{s.description}</p>
              </div>
              <div className="flex gap-4 mt-6 text-xs font-medium text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {s.topic_count || 0} topics
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {s.unit_count || 0} units
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

