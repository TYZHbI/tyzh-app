'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, User, Lock, ChevronRight } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (username.length < 3) return setError('Ник слишком короткий');
    setLoading(true);
    setError('');

    // Генерируем "технический" email, который на 100% валиден для Supabase
    // Но так как Confirm Email выключен, он просто создаст запись в базе
    const techEmail = `${username}.${Date.now()}@internal.system`;

    try {
      // Регистрируем
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: techEmail,
        password: password,
        options: { data: { username: username } },
      });

      if (signUpError) {
        // Если лимит писем все равно мешает, пробуем войти - часто юзер уже в базе
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: techEmail,
          password: password,
        });
        if (signInData.session) {
          router.push('/feed');
          return;
        }
        throw signUpError;
      }

      if (data.session) router.push('/feed');
      else {
        // Если сессия не создалась сразу - принудительный вход
        await supabase.auth.signInWithPassword({ email: techEmail, password });
        router.push('/feed');
      }
    } catch (err: any) {
      setError('Сервер занят. Попробуй через 10 сек.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <ShieldCheck size={40} />
          </div>
        </div>

        <h1 className="text-3xl font-black text-center mb-2 tracking-tighter">
          TYZH.GATE
        </h1>
        <p className="text-gray-500 text-center text-xs uppercase tracking-widest mb-8 font-bold">
          Регистрация в системе
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative group">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors"
              size={20}
            />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all font-bold"
            />
          </div>

          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors"
              size={20}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all font-mono"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                СОЗДАТЬ ПРОФИЛЬ <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
