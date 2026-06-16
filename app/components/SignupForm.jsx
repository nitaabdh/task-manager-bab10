'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validateEmail(email) {
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Semua field wajib diisi.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Format email tidak valid.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (error) {
      setError('Pendaftaran gagal. Silakan coba lagi.');
    } else {
      router.push('/login?message=check-email');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg border">
      <h2 className="text-2xl font-bold mb-6">Daftar Akun</h2>
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nama lengkap"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <input
          type="password"
          placeholder="Password (min. 8 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </div>
      <p className="mt-4 text-sm text-center text-gray-500">
        Sudah punya akun?{' '}
        <a href="/login" className="text-blue-600 hover:underline">Login</a>
      </p>
    </div>
  );
}