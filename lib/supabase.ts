import { createClient } from '@supabase/supabase-js';

// ПРЯМАЯ ВСТАВКА КЛЮЧЕЙ ДЛЯ СТАБИЛЬНОСТИ В STACKBLITZ
const supabaseUrl = 'https://nfvonpfcsbpdbsbapudo.supabase.co';
const supabaseAnonKey = 'sb_publishable_VSfBawiA-iBsQfxxAp_rvg_Te661Z9z';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Сохраняет вход в браузере
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
