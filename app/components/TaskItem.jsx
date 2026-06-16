'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const priorityColors = {
  5: 'bg-red-100 text-red-700',
  4: 'bg-orange-100 text-orange-700',
  3: 'bg-yellow-100 text-yellow-700',
  2: 'bg-blue-100 text-blue-700',
  1: 'bg-green-100 text-green-700',
};

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [busy, setBusy] = useState(false);

  async function toggleComplete() {
    const newStatus = !task.completed;
    onUpdate(task.id, { completed: newStatus }); // Optimistic

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newStatus })
      .eq('id', task.id);

    if (error) {
      onUpdate(task.id, { completed: !newStatus }); // Rollback
      alert('Gagal update: ' + error.message);
    }
  }

  async function handleDelete() {
    if (!confirm('Hapus task ini?')) return;
    setBusy(true);
    onDelete(task.id); // Optimistic

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id);

    if (error) {
      alert('Gagal hapus: ' + error.message);
      // Note: rollback delete butuh refetch — lihat Catatan Asisten
    }
    setBusy(false);
  }

  return (
    <div className={`p-4 border rounded-lg flex items-start justify-between gap-3 ${task.completed ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${priorityColors[task.priority] || priorityColors[3]}`}>
          P{task.priority}
        </span>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={toggleComplete}
          disabled={busy}
          className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300"
        >
          {task.completed ? 'Batal' : 'Selesai'}
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="px-3 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}