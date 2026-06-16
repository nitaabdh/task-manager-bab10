'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logAuditEvent } from '@/lib/audit';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 menit

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
      setError(`Terlalu banyak percobaan. Coba lagi dalam ${remaining} menit.`);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION);
        setError(`Terlalu banyak percobaan. Coba lagi dalam 5 menit.`);
      } else {
        setError('Email atau password salah.');
      }
    } else {
      setFailedAttempts(0);
      setLockoutUntil(null);
      await logAuditEvent('user_login');
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg border">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </div>
      <p className="mt-4 text-sm text-center text-gray-500">
        Belum punya akun?{' '}
        <a href="/signup" className="text-blue-600 hover:underline">Daftar</a>
      </p>
    </div>
  );
}