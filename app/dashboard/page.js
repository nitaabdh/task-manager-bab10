'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import { logAuditEvent } from '@/lib/audit';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      await fetchTasks('all');
    }
    init();
  }, []);

  async function fetchTasks(filter = 'all') {
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*')
      .order('priority', { ascending: false });

    if (filter === 'active') query = query.eq('completed', false);
    if (filter === 'completed') query = query.eq('completed', true);

    const { data, error } = await query;
    if (error) {
      console.error('Error:', error.message);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }

  function handleFilterChange(newFilter) {
    setFilter(newFilter);
    fetchTasks(newFilter);
  }

  async function handleLogout() {
  try {
    await logAuditEvent('user_logout');
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    router.push('/login');
  }
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

  if (loading) return <p className="p-8 text-gray-500">Memuat...</p>;

  return (
    <main className="max-w-3xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Task Manager</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
        >
          Logout
        </button>
      </div>

      <TaskForm onTaskCreated={handleTaskCreated} />

      {/* Filter */}
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

      {/* Task List */}
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