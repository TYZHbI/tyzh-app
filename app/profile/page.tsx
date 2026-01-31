'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Edit2,
  Camera,
  LogOut,
  Shield,
  Zap,
  Sparkles,
  Layout,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon,
  Play,
  Pause,
  Copy,
  Check,
  Terminal,
  Film,
  Music,
  Hash,
  Clock,
  Flame,
  User,
  Palette,
  Loader2,
  Eye,
  AlignLeft,
  UserPlus,
  UserCheck,
  Users,
  FileText,
} from 'lucide-react';

// --- ГРАДИЕНТЫ ---
const GRADIENTS = [
  { name: 'None', value: '' },
  {
    name: 'Holo',
    value: 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 50%, #ff9a9e 100%)',
  },
  {
    name: 'Aurora',
    value: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 50%, #00c6ff 100%)',
  },
  {
    name: 'Candy',
    value: 'linear-gradient(90deg, #d4fc79 0%, #96e6a1 50%, #d4fc79 100%)',
  },
  {
    name: 'Sunset',
    value: 'linear-gradient(90deg, #fa709a 0%, #fee140 50%, #fa709a 100%)',
  },
  {
    name: 'Gold',
    value: 'linear-gradient(90deg, #f3ec78 0%, #af4261 50%, #f3ec78 100%)',
  },
  {
    name: 'Cyber',
    value: 'linear-gradient(90deg, #00f260 0%, #0575e6 50%, #00f260 100%)',
  },
  {
    name: 'Royal',
    value: 'linear-gradient(90deg, #c471f5 0%, #fa71cd 50%, #c471f5 100%)',
  },
];

// --- КОМПОНЕНТЫ ---

const SmartCodeBlock = ({
  filename,
  code,
}: {
  filename: string;
  code: string;
}) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    const cleanCode = code
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl select-text group text-left w-full">
      <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2 text-indigo-400">
          <Terminal size={14} />
          <span className="text-xs font-mono font-bold text-gray-400">
            {filename || 'snippet'}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-500" /> Copied
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar bg-[#050505]">
        <pre className="font-mono text-sm leading-relaxed text-[#d4d4d4] whitespace-pre-wrap">
          <code dangerouslySetInnerHTML={{ __html: code }} />
        </pre>
      </div>
    </div>
  );
};

const PostContent = ({ html }: { html: string }) => (
  <div className="text-gray-200 text-sm leading-7 whitespace-pre-wrap select-text post-body">
    <style jsx global>{`
      .post-body b { font-weight: 900; color: #fff; }
      .post-body blockquote { border-left: 4px solid #6366f1; padding-left: 12px; font-style: italic; color: #a5b4fc; background: rgba(99,102,241,0.1); padding: 8px 12px; border-radius: 0 8px 8px 0; margin: 8px 0; }
      .post-body img, .post-body video { display: block; border-radius: 12px; margin: 12px 0; max-width: 100%; cursor: zoom-in; }
    `}</style>
    {html.split(/(```[\s\S]*?```)/g).map((part, i) => {
      if (part.startsWith('```')) {
        const content = part.slice(3, -3);
        const breakIdx = content.indexOf('\n');
        const lang =
          breakIdx !== -1 ? content.substring(0, breakIdx).trim() : 'text';
        const code =
          breakIdx !== -1 ? content.substring(breakIdx + 1) : content;
        return <SmartCodeBlock key={i} filename={lang} code={code} />;
      }
      return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
    })}
  </div>
);

const StatCard = ({
  label,
  count,
  icon: Icon,
}: {
  label: string;
  count: number;
  icon: any;
}) => (
  <div className="bg-[#111]/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 transition-all group cursor-default backdrop-blur-md">
    <Icon
      size={20}
      className="text-gray-600 mb-2 group-hover:text-white transition-colors"
    />
    <span className="text-2xl font-black text-white">{count}</span>
    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest group-hover:text-gray-400 transition-colors">
      {label}
    </span>
  </div>
);

// --- ГЛАВНАЯ СТРАНИЦА ---

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUsername = searchParams.get('user');

  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // STATS
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // EDIT MODE
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    neon_color: '#00ff00',
    nickname_glow: false,
    text_gradient: '',
    bio_gradient: '',
    bio_glow: false,
    avatar_file: null as string | null,
    banner_file: null as string | null,
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let currentUserId = null;
      if (session) {
        currentUserId = session.user.id;
        const { data: myData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserId)
          .single();
        setCurrentUser(myData);
      }

      let query = supabase.from('profiles').select('*');
      if (targetUsername) query = query.eq('username', targetUsername);
      else if (session) query = query.eq('id', session.user.id);
      else return router.push('/feed');

      const { data: profileData, error } = await query.single();

      if (error || !profileData) {
        alert('Профиль не найден');
        return router.push('/feed');
      }

      setProfile(profileData);
      setFormData({
        username: profileData.username,
        bio: profileData.bio || '',
        neon_color: profileData.neon_color || '#00ff00',
        nickname_glow: profileData.nickname_glow || false,
        text_gradient: profileData.text_gradient || '',
        bio_gradient: profileData.bio_gradient || '',
        bio_glow: profileData.bio_glow || false,
        avatar_file: null,
        banner_file: null,
      });

      // Posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', profileData.id)
        .order('created_at', { ascending: false });
      setUserPosts(postsData || []);

      // Stats
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact' })
        .eq('following_id', profileData.id);
      setFollowersCount(followers || 0);

      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact' })
        .eq('follower_id', profileData.id);
      setFollowingCount(following || 0);

      if (currentUserId && currentUserId !== profileData.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUserId)
          .eq('following_id', profileData.id)
          .single();
        setIsFollowing(!!followData);
      }

      setLoading(false);
    };

    fetchProfileData();
  }, [targetUsername]);

  const isMyProfile = currentUser && profile && currentUser.id === profile.id;

  const displayData = isEditing
    ? {
        ...profile,
        username: formData.username,
        bio: formData.bio,
        neon_color: formData.neon_color,
        nickname_glow: formData.nickname_glow,
        text_gradient: formData.text_gradient,
        bio_gradient: formData.bio_gradient,
        bio_glow: formData.bio_glow,
        avatar_url: formData.avatar_file || profile.avatar_url,
        banner_url: formData.banner_file || profile.banner_url,
      }
    : profile;

  const handleFollowToggle = async () => {
    if (!currentUser) return alert('Войдите в аккаунт');
    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id);
      if (!error) {
        setIsFollowing(false);
        setFollowersCount((p) => p - 1);
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert([{ follower_id: currentUser.id, following_id: profile.id }]);
      if (!error) {
        setIsFollowing(true);
        setFollowersCount((p) => p + 1);
      }
    }
  };

  const getTextStyle = (
    gradient: string,
    glow: boolean,
    neonColor: string,
    defaultColor: string = '#ffffff'
  ) => {
    const styles: any = { position: 'relative' };
    if (gradient) {
      styles.backgroundImage = gradient;
      styles.backgroundClip = 'text';
      styles.WebkitBackgroundClip = 'text';
      styles.color = 'transparent';
      styles.backgroundSize = '200% auto';
      styles.animation = 'shimmer 3s linear infinite';
      if (glow) styles.filter = `drop-shadow(0 0 5px ${neonColor})`;
    } else {
      styles.color = defaultColor;
      if (glow)
        styles.textShadow = `0 0 10px ${neonColor}, 1px 1px 0px rgba(0,0,0,0.8)`;
    }
    return styles;
  };

  const handleSave = async () => {
    if (!isMyProfile) return;
    setIsSaving(true);

    const updates: any = {
      username: formData.username,
      bio: formData.bio,
      neon_color: formData.neon_color,
      nickname_glow: formData.nickname_glow,
      text_gradient: formData.text_gradient,
      bio_gradient: formData.bio_gradient,
      bio_glow: formData.bio_glow,
      updated_at: new Date(),
    };

    if (formData.avatar_file) updates.avatar_url = formData.avatar_file;
    if (formData.banner_file) updates.banner_url = formData.banner_file;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id);

    if (!error) {
      setProfile({ ...profile, ...updates });

      // Update posts info
      const authorUpdates = {
        author_name: formData.username,
        author_color: formData.neon_color,
        author_avatar: formData.avatar_file || profile.avatar_url,
        author_glow: formData.nickname_glow,
        author_text_gradient: formData.text_gradient,
      };
      await supabase
        .from('posts')
        .update(authorUpdates)
        .eq('author_id', currentUser.id);
      await supabase
        .from('comments')
        .update({
          author_name: formData.username,
          author_color: formData.neon_color,
          author_avatar: formData.avatar_file || profile.avatar_url,
          author_text_gradient: formData.text_gradient,
        })
        .eq('author_id', currentUser.id);

      setIsEditing(false);
    } else {
      alert('Ошибка: ' + error.message);
    }
    setIsSaving(false);
  };

  const handleFile = (e: any, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (type === 'avatar') setFormData((p) => ({ ...p, avatar_file: res }));
      else setFormData((p) => ({ ...p, banner_file: res }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-black text-white tracking-[0.5em] animate-pulse">
        LOADING...
      </div>
    );

  return (
    <main className="h-screen bg-[#050505] text-white flex font-sans overflow-hidden">
      <style
        jsx
        global
      >{`@keyframes shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }`}</style>

      {/* SIDEBAR (С правильными ссылками) */}
      <aside className="w-72 border-r border-white/5 p-6 hidden md:flex flex-col bg-black/50 backdrop-blur-xl h-full shrink-0">
        <h1 className="text-4xl font-black mb-8 tracking-tighter flex items-center gap-2">
          <Hash className="text-indigo-500" />
          TYZH
        </h1>
        <div className="space-y-2 mb-6">
          <Link
            href="/feed"
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all hover:bg-white/5 text-gray-400 hover:text-white"
          >
            <Clock size={18} /> Лента
          </Link>
          <Link
            href="/recommendations"
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all hover:bg-white/5 text-gray-400 hover:text-white"
          >
            <Flame size={18} /> База Знаний
          </Link>
          <div className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all bg-white text-black">
            <User size={18} /> Профиль
          </div>
        </div>
        {currentUser && (
          <div className="mt-auto bg-[#111] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-black border shrink-0 overflow-hidden"
              style={{ borderColor: currentUser.neon_color }}
            >
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                  {currentUser.username[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p
                className="font-bold text-sm truncate"
                style={{ color: currentUser.neon_color }}
              >
                {currentUser.username}
              </p>
              <p className="text-[10px] text-gray-500 uppercase font-black">
                Online
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* CONTENT */}
      <section className="flex-1 h-full overflow-y-auto relative scroll-smooth custom-scrollbar">
        {/* BANNER */}
        <div className="h-64 md:h-80 w-full relative bg-[#111] overflow-hidden group shrink-0">
          {displayData.banner_url ? (
            <img
              src={displayData.banner_url}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-black">
              <ImageIcon size={48} className="text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
          {isEditing && (
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-4 right-4 bg-black/50 backdrop-blur p-2 rounded-xl text-white hover:bg-white/20 transition flex items-center gap-2 text-xs font-bold uppercase"
            >
              <Camera size={16} /> Обложка
            </button>
          )}
          <input
            type="file"
            ref={bannerInputRef}
            hidden
            accept="image/*"
            onChange={(e) => handleFile(e, 'banner')}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-10 pb-20 relative">
          {/* AVATAR & HEADER */}
          <div className="flex justify-between items-end -mt-20 mb-6 relative z-10">
            <div className="relative group">
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-black border-4 border-[#050505] overflow-hidden shadow-2xl relative"
                style={{
                  boxShadow: displayData.nickname_glow
                    ? `0 0 40px ${displayData.neon_color}66`
                    : 'none',
                }}
              >
                {displayData.avatar_url ? (
                  <img
                    src={displayData.avatar_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl font-black"
                    style={{ color: displayData.neon_color }}
                  >
                    {displayData.username[0]}
                  </div>
                )}
                {isEditing && (
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera size={24} />
                  </div>
                )}
                <input
                  type="file"
                  ref={avatarInputRef}
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFile(e, 'avatar')}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              {!isMyProfile && (
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                    isFollowing
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={18} /> Вы подписаны
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} /> Подписаться
                    </>
                  )}
                </button>
              )}
              {isMyProfile && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-[#1a1a1a] text-red-500 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-500/10 transition"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <div>
              {isEditing ? (
                <input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="bg-transparent text-4xl font-black text-white outline-none border-b border-white/20 w-full mb-2"
                  placeholder="Никнейм"
                />
              ) : (
                <h1
                  className="text-4xl font-black tracking-tight flex items-center gap-3"
                  style={getTextStyle(
                    displayData.text_gradient,
                    displayData.nickname_glow,
                    displayData.neon_color,
                    '#ffffff'
                  )}
                >
                  {displayData.username}
                  <Shield
                    size={20}
                    className="text-gray-500"
                    style={{ filter: 'none', color: '#666' }}
                  />
                </h1>
              )}
              <p className="text-gray-500 font-mono text-sm">
                @{profile.id.slice(0, 8)} • {profile.user_class || 'User'}
              </p>
            </div>

            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-white/30 h-24 resize-none"
                placeholder="О себе..."
              />
            ) : (
              <p
                className="text-gray-300 leading-relaxed max-w-2xl font-medium"
                style={getTextStyle(
                  displayData.bio_gradient,
                  displayData.bio_glow,
                  displayData.neon_color,
                  '#d1d5db'
                )}
              >
                {displayData.bio || 'Описание отсутствует.'}
              </p>
            )}

            {/* СТАТИСТИКА */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6 mb-8">
              <StatCard
                count={followersCount}
                label="Подписчики"
                icon={Users}
              />
              <StatCard
                count={followingCount}
                label="Подписки"
                icon={UserCheck}
              />
              <StatCard
                count={userPosts.length}
                label="Посты"
                icon={FileText}
              />
            </div>

            {/* РЕДАКТОР СТИЛЯ */}
            {isEditing && (
              <div className="bg-[#111] p-6 rounded-2xl border border-white/10 space-y-8 animate-in slide-in-from-top-5">
                {/* PREVIEW */}
                <div className="bg-black/50 p-6 rounded-xl border border-white/5 text-center">
                  <span className="text-[10px] uppercase text-gray-500 font-bold mb-4 block flex items-center justify-center gap-2">
                    <Eye size={12} /> Живой предпросмотр
                  </span>
                  <h2
                    className="text-3xl font-black mb-2"
                    style={getTextStyle(
                      displayData.text_gradient,
                      displayData.nickname_glow,
                      displayData.neon_color,
                      '#fff'
                    )}
                  >
                    {formData.username || 'Ник'}
                  </h2>
                  <p
                    className="text-lg font-medium"
                    style={getTextStyle(
                      displayData.bio_gradient,
                      displayData.bio_glow,
                      displayData.neon_color,
                      '#d1d5db'
                    )}
                  >
                    {formData.bio || 'Твое описание...'}
                  </p>
                </div>

                {/* 1. БАЗОВЫЙ ЦВЕТ */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-3">
                    <Zap size={14} /> Основной неоновый цвет
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={formData.neon_color}
                      onChange={(e) =>
                        setFormData({ ...formData, neon_color: e.target.value })
                      }
                      className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-full overflow-hidden"
                    />
                    <div className="text-sm font-mono text-gray-400">
                      {formData.neon_color}
                    </div>
                  </div>
                </div>

                {/* 2. СТИЛЬ НИКА */}
                <div className="p-4 border border-white/5 rounded-xl bg-black/30">
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-3">
                    <User size={14} /> Стиль Никнейма
                  </label>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {GRADIENTS.map((g) => (
                      <button
                        key={g.name}
                        onClick={() =>
                          setFormData({ ...formData, text_gradient: g.value })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          formData.text_gradient === g.value
                            ? 'border-white text-white'
                            : 'border-white/10 text-gray-500 hover:border-white/30'
                        }`}
                        style={{ background: g.value || '#111' }}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        nickname_glow: !p.nickname_glow,
                      }))
                    }
                    className={`w-full px-4 py-2 rounded-lg text-xs font-bold border ${
                      formData.nickname_glow
                        ? 'bg-white/10 border-white text-white'
                        : 'border-white/10 text-gray-500'
                    }`}
                  >
                    Свечение ника: {formData.nickname_glow ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* 3. СТИЛЬ ОПИСАНИЯ (ВОЗВРАЩЕНО!) */}
                <div className="p-4 border border-white/5 rounded-xl bg-black/30">
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-3">
                    <AlignLeft size={14} /> Стиль Описания (Bio)
                  </label>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {GRADIENTS.map((g) => (
                      <button
                        key={g.name + 'bio'}
                        onClick={() =>
                          setFormData({ ...formData, bio_gradient: g.value })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          formData.bio_gradient === g.value
                            ? 'border-white text-white'
                            : 'border-white/10 text-gray-500 hover:border-white/30'
                        }`}
                        style={{ background: g.value || '#111' }}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setFormData((p) => ({ ...p, bio_glow: !p.bio_glow }))
                    }
                    className={`w-full px-4 py-2 rounded-lg text-xs font-bold border ${
                      formData.bio_glow
                        ? 'bg-white/10 border-white text-white'
                        : 'border-white/10 text-gray-500'
                    }`}
                  >
                    Свечение описания: {formData.bio_glow ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={handleSave}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm uppercase hover:bg-gray-200 w-full flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      'Сохранить изменения'
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="border border-white/10 px-6 py-3 rounded-xl font-bold text-sm uppercase hover:bg-white/5 w-full"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Layout size={20} className="text-indigo-500" /> Публикации
            </h2>
            <div className="space-y-6">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 relative group hover:border-white/10 transition-all"
                  >
                    <div
                      className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full"
                      style={{ backgroundColor: post.author_color }}
                    />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0">
                        {post.author_avatar ? (
                          <img
                            src={post.author_avatar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center font-bold text-xs"
                            style={{ color: post.author_color }}
                          >
                            {post.author_name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        {/* СТИЛЬ ИМЕНИ */}
                        <h3
                          className="font-bold text-sm"
                          style={getTextStyle(
                            post.author_text_gradient,
                            post.author_glow,
                            post.author_color,
                            '#e5e5e5'
                          )}
                        >
                          {post.author_name}
                        </h3>
                        <p className="text-[10px] text-gray-600 uppercase font-black">
                          {new Date(post.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    <PostContent html={post.content} />
                    <div className="flex gap-4 mt-4 pt-4 border-t border-white/5 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      <span>❤️ {post.liked_by?.length || 0} Лайков</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest">
                  Нет публикаций
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
