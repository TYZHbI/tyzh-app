'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, User, AlertCircle, Hash, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Состояние "проверки на входе" — по умолчанию true
  const [isChecking, setIsChecking] = useState(true); 
  
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '' });

  // ==========================================================
  // ЭТОТ СКРИПТ СРАБОТАЕТ СРАЗУ ПРИ ОТКРЫТИИ СТРАНИЦЫ
  // ==========================================================
  useEffect(() => {
    const autoRedirect = async () => {
      // Пытаемся достать сессию из хранилища браузера
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Если сессия есть — мгновенно редиректим, заменяя историю (replace)
        router.replace('/feed'); 
      } else {
        // Если сессии нет — выключаем лоадер и показываем форму входа
        setIsChecking(false);
      }
    };

    autoRedirect();

    // Слушаем изменения (на случай, если пользователь вошел в другой вкладке)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/feed');
    });

    return () => subscription.unsubscribe();
  }, [router]);
  // ==========================================================

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUsername = formData.username.trim().replace(/\s/g, '');
    const fakeEmail = `${cleanUsername.toLowerCase()}@tyzh.local`;

    try {
      const { error: authError } = isLogin 
        ? await supabase.auth.signInWithPassword({ email: fakeEmail, password: formData.password })
        : await supabase.auth.signUp({ 
            email: fakeEmail, 
            password: formData.password,
            options: { data: { username: cleanUsername } } 
          });

      if (authError) throw authError;
      // Редирект сработает через onAuthStateChange автоматически
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Пока идет тихая проверка при открытии — показываем только лоадер на черном фоне
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black flex items-center justify-center gap-2">
            <Hash className="text-indigo-500" /> TYZH
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {isLogin ? 'Вход' : 'Регистрация'}
            </h2>
            <Sparkles size={20} className="text-yellow-400" />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-500 shrink-0" size={20} />
                  <p className="text-red-400 text-sm font-bold">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <User size={18} className="text-gray-500" />
              <input
                required
                placeholder="Никнейм"
                className="bg-transparent text-sm text-white w-full outline-none"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <Lock size={18} className="text-gray-500" />
              <input
                required
                type="password"
                placeholder="Пароль"
                className="bg-transparent text-sm text-white w-full outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-xl mt-4 hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : isLogin ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-gray-500 text-xs hover:text-white transition"
            >
              {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}