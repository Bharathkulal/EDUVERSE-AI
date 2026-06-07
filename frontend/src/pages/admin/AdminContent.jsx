import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AdminContent() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subject_name: '', description: '' });
  const [topicForm, setTopicForm] = useState({ subjectId: '', title: '', content: '', notes: '', pdf_url: '', video_url: '' });
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/subjects').then((res) => setSubjects(res.data));
  useEffect(() => { load(); }, []);

  const addSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', form);
      toast.success('Subject added');
      setForm({ subject_name: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const updateSubject = async (id) => {
    try {
      await api.put(`/subjects/${id}`, editing);
      toast.success('Subject updated');
      setEditing(null);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteSubject = async (id) => {
    if (!confirm('Delete this subject and all content?')) return;
    await api.delete(`/subjects/${id}`);
    toast.success('Deleted');
    load();
  };

  const addTopic = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/subjects/${topicForm.subjectId}/topics`, topicForm);
      toast.success('Topic added');
      setTopicForm({ subjectId: '', title: '', content: '', notes: '', pdf_url: '', video_url: '' });
    } catch {
      toast.error('Failed to add topic');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Content Management</h1>
        <p className="text-slate-500">Manage subjects, topics, notes, PDFs, and videos</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={addSubject} className="card space-y-4">
          <h2 className="font-semibold">Add Subject</h2>
          <input className="input-field" placeholder="Subject Name" value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} required />
          <textarea className="input-field" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="btn-primary">Add Subject</button>
        </form>

        <form onSubmit={addTopic} className="card space-y-4">
          <h2 className="font-semibold">Add Topic</h2>
          <select className="input-field" value={topicForm.subjectId} onChange={(e) => setTopicForm({ ...topicForm, subjectId: e.target.value })} required>
            <option value="">Select Subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
          </select>
          <input className="input-field" placeholder="Topic Title" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} required />
          <textarea className="input-field" placeholder="Content" rows={2} value={topicForm.content} onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })} />
          <input className="input-field" placeholder="Notes" value={topicForm.notes} onChange={(e) => setTopicForm({ ...topicForm, notes: e.target.value })} />
          <input className="input-field" placeholder="PDF URL" value={topicForm.pdf_url} onChange={(e) => setTopicForm({ ...topicForm, pdf_url: e.target.value })} />
          <input className="input-field" placeholder="Video URL" value={topicForm.video_url} onChange={(e) => setTopicForm({ ...topicForm, video_url: e.target.value })} />
          <button type="submit" className="btn-primary">Add Topic</button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Subjects</h2>
        <div className="space-y-3">
          {subjects.map((s) => (
            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg gap-3">
              {editing?.id === s.id ? (
                <div className="flex-1 flex gap-2 flex-wrap">
                  <input className="input-field flex-1" value={editing.subject_name} onChange={(e) => setEditing({ ...editing, subject_name: e.target.value })} />
                  <button onClick={() => updateSubject(s.id)} className="btn-primary text-sm">Save</button>
                  <button onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancel</button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium">{s.subject_name}</p>
                    <p className="text-sm text-slate-500">{s.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(s)} className="btn-secondary text-sm">Edit</button>
                    <button onClick={() => deleteSubject(s.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
