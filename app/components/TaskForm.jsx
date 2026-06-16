'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logAuditEvent } from '@/lib/audit';

export default function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(3);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
  e.preventDefault();
  if (title.trim().length < 3) {
    alert('Judul harus minimal 3 karakter.');
    return;
  }
  setLoading(true);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('Anda harus login!');
    setLoading(false);
    return;
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title: title.trim(),
      description: description.trim() || null,
      priority: parseInt(priority),
      user_id: user.id,
    }])
    .select();

  if (error) {
    alert('Gagal membuat task: ' + error.message);
  } else {
    setTitle('');
    setDescription('');
    setPriority(3);
    onTaskCreated(data[0]);
    await logAuditEvent('task_created', 'task', { task_id: data[0].id });
  }
  setLoading(false);
}

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Judul task (min. 3 karakter)"
        required
        className="w-full px-3 py-2 border rounded-lg text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Deskripsi (opsional)"
        rows={2}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      />
      <div className="flex items-center gap-3">
        <label className="text-sm">Priority:</label>
        <input
          type="number"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          min={1} max={5}
          className="w-16 px-2 py-1 border rounded text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Menyimpan...' : 'Tambah Task'}
        </button>
      </div>
    </form>
  );
}