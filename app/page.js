'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  async function fetchTasks(currentFilter = 'all') {
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*')
      .order('priority', { ascending: false });
    if (currentFilter === 'active') query = query.eq('completed', false);
    if (currentFilter === 'completed') query = query.eq('completed', true);
    const { data, error } = await query;
    if (error) {
      console.error('Error:', error.message);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }

 useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks(filter);
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              setTasks((prev) => {
                const exists = prev.some((t) => t.id === payload.new.id);
                if (exists) return prev;
                return [payload.new, ...prev];
              });
              break;
            case 'UPDATE':
              setTasks((prev) =>
                prev.map((t) => (t.id === payload.new.id ? payload.new : t))
              );
              break;
            case 'DELETE':
              setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function handleFilterChange(newFilter) {
    setFilter(newFilter);
    fetchTasks(newFilter);
  }

  function handleTaskCreated(newTask) {
    setTasks((prev) => [newTask, ...prev]);
  }

  function handleTaskUpdate(taskId, updates) {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  }

  function handleTaskDelete(taskId) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  if (loading) return <p className="p-8 text-gray-500">Memuat tasks...</p>;

  return (
    <main className="max-w-3xl mx-auto p-8 bg-red-500">
      <h1 className="text-3xl font-bold mb-6">Task Manager</h1>
      <TaskForm onTaskCreated={handleTaskCreated} />
      <div className="flex gap-2 mt-6">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Selesai'}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {tasks.length === 0 && (
          <p className="text-gray-500 text-center py-8">Tidak ada task.</p>
        )}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
          />
        ))}
      </div>
    </main>
  );
}