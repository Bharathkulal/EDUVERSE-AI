import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  const loadStudents = (q = '') => {
    api.get(`/admin/students${q ? `?search=${q}` : ''}`).then((res) => setStudents(res.data));
  };

  useEffect(() => { loadStudents(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStudents(search);
  };

  const deleteStudent = async (id, name) => {
    if (!confirm(`Delete student ${name}?`)) return;
    try {
      await api.delete(`/admin/students/${id}`);
      toast.success('Student deleted');
      loadStudents(search);
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-slate-500">View, search, and manage students</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input className="input-field max-w-xs" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Study Hours</th>
              <th className="pb-3 pr-4">Quiz Avg</th>
              <th className="pb-3 pr-4">Coding Avg</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium">{s.name}</td>
                <td className="py-3 pr-4">{s.email}</td>
                <td className="py-3 pr-4">{parseFloat(s.study_hours || 0).toFixed(1)}h</td>
                <td className="py-3 pr-4">{Math.round(s.avg_quiz_score || 0)}%</td>
                <td className="py-3 pr-4">{Math.round(s.avg_coding_score || 0)}%</td>
                <td className="py-3">
                  <button onClick={() => deleteStudent(s.id, s.name)} className="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
