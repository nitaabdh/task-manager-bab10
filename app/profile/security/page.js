'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SecurityHistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error:', error.message);
      } else {
        setLogs(data || []);
      }
      setLoading(false);
    }
    init();
  }, []);

  if (loading) return <p className="p-8 text-gray-500">Memuat...</p>;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Login & Activity History</h1>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Action</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Waktu</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">User Agent</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-400">
                  Belum ada aktivitas tercatat.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="px-4 py-2">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {new Date(log.created_at).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-2 text-gray-500 truncate max-w-xs">
                  {log.metadata?.user_agent || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a href="/dashboard" className="inline-block mt-4 text-sm text-blue-600 hover:underline">
        ← Kembali ke Dashboard
      </a>
    </main>
  );
}