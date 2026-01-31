'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Paperclip,
  MessageSquare,
  Heart,
  Loader2,
  Bold,
  Quote,
  Code as CodeIcon,
  Smile,
  Trash2,
  Terminal,
  Check,
  Copy,
  X,
  Play,
  Pause,
  Camera,
  AlertTriangle,
  BarChart2,
  Eye,
  EyeOff,
  Share2,
  Hash,
  Clock,
  Flame,
  User,
  Pin,
  ArrowUp,
  Search,
  Bookmark,
  Volume2,
  Flag,
  MoreHorizontal,
  ZoomIn,
  ExternalLink,
  Activity,
  Palette,
  Italic,
  Underline,
  Strikethrough,
  List,
  Type,
  Omega,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react';

// --- КОНФИГ ---

const POST_THEMES: Record<string, string> = {
  default: 'bg-[#0f0f0f] border-white/10',
  neon: 'bg-black border-pink-500/50 shadow-[0_0_30px_-10px_rgba(236,72,153,0.3)]',
  cyber:
    'bg-[#050a14] border-cyan-500/50 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]',
  gold: 'bg-gradient-to-br from-[#1a1000] to-black border-yellow-500/40',
  forest: 'bg-[#051405] border-emerald-500/40',
  ghost: 'bg-white/5 border-white/20 backdrop-blur-md',
  fire: 'bg-gradient-to-br from-[#200505] to-black border-orange-500/50',
};

const TEXT_COLORS = [
  { color: '#ffffff', name: 'Белый' },
  { color: '#ef4444', name: 'Красный' },
  { color: '#f97316', name: 'Оранжевый' },
  { color: '#eab308', name: 'Желтый' },
  { color: '#22c55e', name: 'Зеленый' },
  { color: '#06b6d4', name: 'Циан' },
  { color: '#3b82f6', name: 'Синий' },
  { color: '#a855f7', name: 'Фиолетовый' },
  { color: '#ec4899', name: 'Розовый' },
];

const SYMBOLS_PACKS = {
  Валюта: ['₽', '$', '€', '£', '¥', '₿', '¢', '₸', '₴'],
  Стрелки: ['←', '→', '↑', '↓', '↔', '⇒', '⇐', '⇑', '⇓', '➤'],
  Мат: ['+', '-', '×', '÷', '=', '≠', '≈', '∞', '√', 'π', '∑', '∫', '±'],
  Разное: [
    '★',
    '♥',
    '♦',
    '♣',
    '♠',
    '♪',
    '♫',
    '✔',
    '✖',
    '©',
    '®',
    '™',
    '§',
    '¶',
  ],
};

const STICKER_PACKS = {
  Pepe: ['🗿', '🤡', '💀', '🔥', '💩', '🦍', '🧢', '👀', '🫠', '🤮'],
  Base: ['❤️', '👍', '👎', '🤬', '😱', '🎉', '👋', '🙏', '🤝', '💎'],
  Space: ['🚀', '🛸', '🪐', '⭐', '🌌', '🌑', '👨‍🚀', '👾', '🤖', '👽'],
};

// --- UTILS ---
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'только что';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
};

const calculateReadTime = (text: string) => {
  const cleanText = text.replace(/<[^>]*>?/gm, '');
  const charCount = cleanText.length;
  const time = Math.ceil(charCount / 950);
  return time < 1 ? 1 : time;
};

// --- COMPONENTS ---

// ОБНОВЛЕННЫЙ LIGHTBOX С ЗУМОМ И ПЕРЕТАСКИВАНИЕМ
const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => {
  const [scale, setScale] = useState(1);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) setScale((s) => Math.min(s + 0.2, 5));
    else setScale((s) => Math.max(s - 0.2, 0.5));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center overflow-hidden"
      onClick={onClose}
      onWheel={handleWheel}
    >
      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition z-50 bg-black/50 p-2 rounded-full"
      >
        <X size={32} />
      </button>

      {/* Панель управления зумом */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1a1a1a]/90 border border-white/10 px-6 py-3 rounded-2xl z-50 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setScale((s) => Math.max(s - 0.5, 0.5))}
          className="p-2 hover:bg-white/10 rounded-full transition text-gray-300 hover:text-white"
        >
          <Minus size={20} />
        </button>
        <span className="text-sm font-mono font-bold w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.min(s + 0.5, 5))}
          className="p-2 hover:bg-white/10 rounded-full transition text-gray-300 hover:text-white"
        >
          <Plus size={20} />
        </button>
        <div className="w-px h-6 bg-white/20 mx-2" />
        <button
          onClick={() => setScale(1)}
          className="p-2 hover:bg-white/10 rounded-full transition text-gray-300 hover:text-white"
          title="Сбросить"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Картинка (Draggable) */}
      <motion.div
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          src={src}
          animate={{ scale }}
          drag={scale > 1} // Перетаскивание только если увеличено
          dragConstraints={{
            left: -1000,
            right: 1000,
            top: -1000,
            bottom: 1000,
          }}
          dragElastic={0.1}
          className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
          style={{ touchAction: 'none' }}
        />
      </motion.div>
    </motion.div>
  );
};

const SkeletonPost = () => (
  <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-white/5" />
      <div className="space-y-2">
        <div className="w-32 h-3 bg-white/5 rounded" />
        <div className="w-20 h-2 bg-white/5 rounded" />
      </div>
    </div>
    <div className="w-full h-32 bg-white/5 rounded-xl" />
  </div>
);

const PollComponent = ({
  post,
  userId,
  onVote,
}: {
  post: any;
  userId: string;
  onVote: (idx: number) => void;
}) => {
  const options = post.poll_options || [];
  const votes = post.poll_votes || {};
  const totalVotes = Object.values(votes).length;
  const userVote = votes[userId];
  const counts = options.map(
    (_: any, idx: number) =>
      Object.values(votes).filter((v) => v === idx).length
  );

  return (
    <div className="mt-4 mb-2 bg-black/20 rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={16} className="text-indigo-400" />
        <h4 className="font-bold text-white text-sm">{post.poll_question}</h4>
      </div>
      <div className="space-y-2">
        {options.map((opt: string, idx: number) => {
          const count = counts[idx];
          const percent =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isSelected = userVote === idx;
          return (
            <button
              key={idx}
              onClick={() => onVote(idx)}
              disabled={userVote !== undefined}
              className="relative w-full text-left h-10 rounded-lg overflow-hidden group transition-all border border-white/5 hover:border-white/10"
            >
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
                  isSelected ? 'bg-indigo-500/20' : 'bg-white/5'
                }`}
                style={{ width: `${percent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                <span
                  className={`text-sm font-medium flex items-center gap-2 ${
                    isSelected ? 'text-indigo-300' : 'text-gray-300'
                  }`}
                >
                  {opt}{' '}
                  {isSelected && (
                    <Check size={14} className="text-indigo-400" />
                  )}
                </span>
                <span className="text-xs text-gray-500 font-mono font-bold">
                  {percent}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-500 mt-3 text-right font-medium">
        {totalVotes} голосов
      </p>
    </div>
  );
};

const SmartCodeBlock = ({
  filename,
  code,
}: {
  filename: string;
  code: string;
}) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      code
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    );
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

const PostContent = ({
  html,
  isSpoiler,
}: {
  html: string;
  isSpoiler?: boolean;
}) => {
  const [revealed, setRevealed] = useState(!isSpoiler);
  const processText = (text: string) =>
    text
      .replace(
        /(^|[\s>])(#\w+)/g,
        '$1<span class="text-indigo-400 font-bold cursor-pointer hover:underline">$2</span>'
      )
      .replace(
        /(^|[\s>])(@\w+)/g,
        '$1<span class="text-pink-400 font-bold cursor-pointer hover:underline">$2</span>'
      );

  return (
    <div className="relative group">
      {!revealed && (
        <div
          onClick={() => setRevealed(true)}
          className="absolute inset-0 z-10 bg-[#111] flex items-center justify-center cursor-pointer rounded-lg border border-white/5 transition-colors hover:bg-[#151515]"
        >
          <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
            <EyeOff size={24} />{' '}
            <span className="text-xs font-bold uppercase tracking-widest">
              Спойлер
            </span>
          </div>
        </div>
      )}
      <div
        className={`text-gray-200 text-sm leading-7 whitespace-pre-wrap select-text post-body transition-all duration-500 ${
          !revealed ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'
        }`}
      >
        <style jsx global>{`
                    .post-body b { font-weight: 900; color: #fff; }
                    .post-body blockquote { border-left: 4px solid #6366f1; padding-left: 12px; font-style: italic; color: #a5b4fc; background: rgba(99,102,241,0.1); padding: 8px 12px; border-radius: 0 8px 8px 0; margin: 8px 0; }
                    .post-body img { display: block; border-radius: 12px; margin: 12px 0; max-width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
                    .post-body video { display: block; border-radius: 12px; margin: 12px 0; max-width: 100%; }
                    .post-body ul { list-style-type: disc; padding-left: 20px; margin: 8px 0; }
                    .post-body ol { list-style-type: decimal; padding-left: 20px; margin: 8px 0; }
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
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: processText(part) }}
            />
          );
        })}
      </div>
    </div>
  );
};

const Tooltip = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="absolute -top-10 bg-gray-800 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-white/10"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
          >
            <X size={20} />
          </button>
          <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const MediaGrid = ({
  files,
  isNsfw,
  onImageClick,
}: {
  files: string[];
  isNsfw?: boolean;
  onImageClick?: (src: string) => void;
}) => {
  const [blurred, setBlurred] = useState(isNsfw);
  if (!files || !Array.isArray(files) || files.length === 0) return null;
  return (
    <div
      className={`grid gap-2 mt-2 ${
        files.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
      } relative`}
    >
      {blurred && (
        <div
          onClick={() => setBlurred(false)}
          className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center cursor-pointer rounded-xl border border-red-500/30"
        >
          <EyeOff size={32} className="text-red-500 mb-2" />
          <p className="text-red-400 font-bold uppercase text-xs tracking-widest">
            SENSITIVE
          </p>
        </div>
      )}
      {files.map((file, i) => (
        <div
          key={i}
          className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-square"
        >
          <img
            src={file}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => onImageClick?.(file)}
          />
        </div>
      ))}
    </div>
  );
};

export default function Feed() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(
    new Set()
  );
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [doubleTapHeart, setDoubleTapHeart] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  // EDITOR
  const [isPosting, setIsPosting] = useState(false);
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [pollMode, setPollMode] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isNsfw, setIsNsfw] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');

  // POPUPS
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [commentFiles, setCommentFiles] = useState<string[]>([]);
  const commentFileRef = useRef<HTMLInputElement>(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    postId: null as string | null,
  });
  const [codeModal, setCodeModal] = useState({
    isOpen: false,
    savedSelection: null as Range | null,
  });
  const [codeData, setCodeData] = useState({ filename: '', content: '' });

  const getTextStyle = (gradient: string, glow: boolean, neonColor: string) => {
    const styles: any = { position: 'relative' };
    if (gradient) {
      styles.backgroundImage = gradient;
      styles.backgroundClip = 'text';
      styles.WebkitBackgroundClip = 'text';
      styles.color = 'transparent';
      if (glow) styles.filter = `drop-shadow(0 0 5px ${neonColor})`;
    } else {
      styles.color = 'white';
      if (glow) styles.textShadow = `0 0 10px ${neonColor}`;
    }
    return styles;
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setMyProfile({ ...data, id: session.user.id });
      }
      const saved = localStorage.getItem('bookmarks');
      if (saved) setBookmarkedPosts(new Set(JSON.parse(saved)));
      await fetchPosts();
      setLoading(false);
    };
    init();

    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    return posts.filter(
      (p) =>
        p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .is('branch_id', null)
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const handleDoubleTap = (post: any, e: React.MouseEvent) => {
    if (e.detail === 2) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDoubleTapHeart({
        id: post.id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setTimeout(() => setDoubleTapHeart(null), 800);
      if (!post.liked_by?.includes(myProfile?.id)) handleLike(post);
    }
  };
  const handleBookmark = (postId: string) => {
    const newSet = new Set(bookmarkedPosts);
    if (newSet.has(postId)) newSet.delete(postId);
    else newSet.add(postId);
    setBookmarkedPosts(newSet);
    localStorage.setItem('bookmarks', JSON.stringify(Array.from(newSet)));
  };
  const speakText = (text: string) => {
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    window.speechSynthesis.speak(utterance);
  };

  const handleCreatePost = async () => {
    if (!myProfile) return alert('Войдите!');
    if (!rulesAgreed) return alert('Правила!');
    const htmlContent = editorRef.current?.innerHTML || '';
    if (!htmlContent.trim() && !pollMode) return;
    setIsPosting(true);
    const { error } = await supabase
      .from('posts')
      .insert([
        {
          content: htmlContent,
          author_id: myProfile.id,
          author_name: myProfile.username,
          author_class: myProfile.user_class,
          author_color: myProfile.neon_color,
          author_avatar: myProfile.avatar_url,
          author_glow: myProfile.nickname_glow,
          author_text_gradient: myProfile.text_gradient,
          media_urls: [],
          is_nsfw: isNsfw,
          poll_question: pollMode ? pollQuestion : null,
          poll_options: pollMode ? pollOptions.filter((o) => o.trim()) : [],
          poll_votes: {},
          theme: selectedTheme,
        },
      ]);
    if (!error) {
      if (editorRef.current) editorRef.current.innerHTML = '';
      setPollMode(false);
      setSelectedTheme('default');
      fetchPosts();
    }
    setIsPosting(false);
  };

  const handleFile = (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        if (editorRef.current) {
          editorRef.current.focus();
          // Вставляем картинку с обработчиком клика для зума
          const imgHtml = `<br/><img src="${src}" class="rounded-xl my-4 shadow-lg w-full cursor-zoom-in" onclick="window.dispatchEvent(new CustomEvent('lightbox', { detail: '${src}' }))" /><br/><p><br/></p>`;
          document.execCommand('insertHTML', false, imgHtml);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Слушатель для открытия лайтбокса из контента
  useEffect(() => {
    const openLightbox = (e: any) => setLightboxImage(e.detail);
    window.addEventListener('lightbox', openLightbox);
    return () => window.removeEventListener('lightbox', openLightbox);
  }, []);

  const handleLike = async (post: any) => {
    if (!myProfile) return;
    const current = post.liked_by || [];
    const newLikes = current.includes(myProfile.id)
      ? current.filter((id: string) => id !== myProfile.id)
      : [...current, myProfile.id];
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, liked_by: newLikes } : p))
    );
    await supabase
      .from('posts')
      .update({ liked_by: newLikes })
      .eq('id', post.id);
  };
  const handleVote = async (postId: string, optionIdx: number) => {
    if (!myProfile) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const currentVotes = post.poll_votes || {};
    if (currentVotes[myProfile.id] !== undefined) return;
    const newVotes = { ...currentVotes, [myProfile.id]: optionIdx };
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, poll_votes: newVotes } : p))
    );
    await supabase
      .from('posts')
      .update({ poll_votes: newVotes })
      .eq('id', postId);
  };
  const handleShare = (post: any) => {
    if (navigator.share)
      navigator
        .share({ title: 'TYZH Post', url: window.location.href })
        .catch(console.error);
    else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована!');
    }
  };
  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };
  const openCodeModal = () => {
    const sel = window.getSelection();
    let text = '';
    let range = null;
    if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
      text = sel.toString();
    }
    setCodeData({ filename: 'script.js', content: text });
    setCodeModal({ isOpen: true, savedSelection: range });
  };
  const submitCodeBlock = () => {
    setCodeModal((prev) => ({ ...prev, isOpen: false }));
    if (editorRef.current) editorRef.current.focus();
    if (codeModal.savedSelection) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(codeModal.savedSelection);
    }
    const html = `\`\`\`${codeData.filename || 'file'}\n${
      codeData.content
    }\n\`\`\`<br/>`;
    document.execCommand('insertHTML', false, html);
    setCodeData({ filename: '', content: '' });
  };
  const confirmDelete = async () => {
    if (!deleteModal.postId) return;
    setPosts((prev) => prev.filter((p) => p.id !== deleteModal.postId));
    await supabase.from('posts').delete().eq('id', deleteModal.postId);
    setDeleteModal({ isOpen: false, postId: null });
  };
  const fetchComments = async (postId: string) => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments((prev) => ({ ...prev, [postId]: data || [] }));
  };
  const handleSendComment = async (postId: string) => {
    if (!newComment.trim() && !commentFiles.length) return;
    await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          content: newComment,
          author_id: myProfile.id,
          author_name: myProfile.username,
          author_color: myProfile.neon_color,
          author_avatar: myProfile.avatar_url,
          media_urls: commentFiles,
          author_text_gradient: myProfile.text_gradient,
        },
      ]);
    setNewComment('');
    setCommentFiles([]);
    fetchComments(postId);
  };
  const handleCommentFiles = async (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    const promises = files.map(
      (file) =>
        new Promise<string | null>((resolve) => {
          const r = new FileReader();
          r.onload = (ev) =>
            resolve(
              typeof ev.target?.result === 'string' ? ev.target.result : null
            );
          r.readAsDataURL(file);
        })
    );
    const res = await Promise.all(promises);
    setCommentFiles((prev) => [
      ...prev,
      ...res.filter((f): f is string => f !== null),
    ]);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex font-sans overflow-hidden">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[100]"
        style={{ scaleX }}
      />
      <AnimatePresence>
        {lightboxImage && (
          <Lightbox
            src={lightboxImage}
            onClose={() => setLightboxImage(null)}
          />
        )}
      </AnimatePresence>
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, postId: null })}
      >
        <div className="text-center">
          <AlertTriangle size={32} className="mx-auto text-red-500 mb-2" />
          <h3 className="text-xl font-bold">Удалить пост?</h3>
          <button
            onClick={confirmDelete}
            className="bg-red-600 text-white w-full py-3 rounded-xl mt-4 font-bold"
          >
            УДАЛИТЬ
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={codeModal.isOpen}
        onClose={() => setCodeModal({ ...codeModal, isOpen: false })}
      >
        <div>
          <Terminal size={20} className="mb-4 text-indigo-400" />
          <input
            value={codeData.filename}
            onChange={(e) =>
              setCodeData((p) => ({ ...p, filename: e.target.value }))
            }
            placeholder="main.js"
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 mb-2 text-white"
          />
          <textarea
            value={codeData.content}
            onChange={(e) =>
              setCodeData((p) => ({ ...p, content: e.target.value }))
            }
            placeholder="// Code..."
            className="w-full h-40 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white mb-2"
          />
          <button
            onClick={submitCodeBlock}
            className="w-full bg-indigo-600 py-3 rounded-xl font-bold"
          >
            Добавить
          </button>
        </div>
      </Modal>

      <aside className="w-72 border-r border-white/5 p-6 hidden md:flex flex-col bg-black/50 backdrop-blur-xl h-screen sticky top-0">
        <h1 className="text-4xl font-black mb-8 tracking-tighter flex items-center gap-2">
          <Hash className="text-indigo-500" />
          TYZH
        </h1>
        <div className="space-y-2 mb-6">
          <Link
            href="/feed"
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all bg-white text-black"
          >
            <Clock size={18} /> Лента
          </Link>
          <Link
            href="/recommendations"
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all hover:bg-white/5 text-gray-400 hover:text-white"
          >
            <Flame size={18} /> База Знаний
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl font-bold text-gray-400 hover:text-white transition-all"
          >
            <User size={18} /> Мой профиль
          </Link>
        </div>
      </aside>

      <section
        className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth custom-scrollbar relative"
        id="feed-scroll"
      >
        <div className="max-w-2xl mx-auto space-y-8 pb-40">
          <div className="relative group z-30">
            <Search
              className="absolute left-4 top-3.5 text-gray-500 group-hover:text-indigo-400 transition"
              size={20}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск постов и авторов..."
              className="w-full bg-[#0f0f0f] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-lg"
            />
          </div>

          {/* EDITOR */}
          <div
            className={`rounded-3xl p-6 shadow-2xl relative z-20 transition-all duration-500 border ${POST_THEMES[selectedTheme]}`}
          >
            <div className="flex gap-1 mb-4 border-b border-white/5 pb-2 overflow-x-auto items-center">
              {/* TEXT FORMATTING */}
              <Tooltip text="Жирный">
                <button
                  onClick={() => {
                    document.execCommand('bold');
                    editorRef.current?.focus();
                  }}
                  className="p-2 hover:bg-white/5 rounded text-gray-400"
                >
                  <Bold size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Курсив">
                <button
                  onClick={() => {
                    document.execCommand('italic');
                    editorRef.current?.focus();
                  }}
                  className="p-2 hover:bg-white/5 rounded text-gray-400"
                >
                  <Italic size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Подчеркнуть">
                <button
                  onClick={() => {
                    document.execCommand('underline');
                    editorRef.current?.focus();
                  }}
                  className="p-2 hover:bg-white/5 rounded text-gray-400"
                >
                  <Underline size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Зачеркнуть">
                <button
                  onClick={() => {
                    document.execCommand('strikeThrough');
                    editorRef.current?.focus();
                  }}
                  className="p-2 hover:bg-white/5 rounded text-gray-400"
                >
                  <Strikethrough size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Список">
                <button
                  onClick={() => {
                    document.execCommand('insertUnorderedList');
                    editorRef.current?.focus();
                  }}
                  className="p-2 hover:bg-white/5 rounded text-gray-400"
                >
                  <List size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Цвет текста">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={`p-2 rounded transition ${
                    showColorPicker
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Type size={18} />
                </button>
              </Tooltip>
              <div className="w-px h-6 bg-white/10 mx-2" />

              {/* INSERTS */}
              <Tooltip text="Символы">
                <button
                  onClick={() => setShowSymbolPicker(!showSymbolPicker)}
                  className={`p-2 rounded transition ${
                    showSymbolPicker
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Omega size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Стикеры">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded ml-auto transition-colors"
                >
                  <Smile size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Медиа">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                >
                  <Paperclip size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Код">
                <button
                  onClick={() => openCodeModal()}
                  className="p-2 bg-indigo-500/10 text-indigo-400 rounded hover:bg-indigo-500/20"
                >
                  <CodeIcon size={18} />
                </button>
              </Tooltip>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                multiple
                onChange={handleFile}
              />

              <div className="w-px h-6 bg-white/10 mx-2" />

              {/* POST SETTINGS */}
              <Tooltip text="Фон поста">
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className={`p-2 rounded transition ${
                    showThemePicker
                      ? 'text-pink-400 bg-pink-500/10'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Palette size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Опрос">
                <button
                  onClick={() => setPollMode(!pollMode)}
                  className={`p-2 rounded transition ${
                    pollMode
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <BarChart2 size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Спойлер / NSFW">
                <button
                  onClick={() => setIsNsfw(!isNsfw)}
                  className={`p-2 rounded transition ${
                    isNsfw
                      ? 'text-red-500 bg-red-500/10'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <EyeOff size={18} />
                </button>
              </Tooltip>
            </div>

            <div
              ref={editorRef}
              onInput={() =>
                setCharCount(editorRef.current?.innerText.length || 0)
              }
              contentEditable
              className="w-full min-h-[100px] outline-none text-white text-lg placeholder:text-gray-700 empty:before:content-['Что_нового?'] empty:before:text-gray-700 mb-4"
              onMouseDown={(e: any) => {
                if (e.target.tagName === 'IMG') e.preventDefault();
              }}
            />
            <div className="text-right text-[10px] text-gray-500 mb-2">
              {charCount} симв.
            </div>

            <AnimatePresence>
              {/* 1. ЦВЕТ ТЕКСТА */}
              {showColorPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden border-t border-white/5 pt-2"
                >
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">
                    Цвет текста
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {TEXT_COLORS.map((tc) => (
                      <button
                        key={tc.color}
                        onClick={() => {
                          execCmd('foreColor', tc.color);
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition"
                        style={{ backgroundColor: tc.color }}
                        title={tc.name}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 2. СИМВОЛЫ */}
              {showSymbolPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden border-t border-white/5 pt-2"
                >
                  <div className="flex gap-4 pb-2 overflow-x-auto">
                    {Object.entries(SYMBOLS_PACKS).map(
                      ([category, symbols]) => (
                        <div key={category} className="shrink-0">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                            {category}
                          </p>
                          <div className="grid grid-cols-5 gap-1">
                            {symbols.map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  execCmd('insertText', s);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-sm"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </motion.div>
              )}

              {/* 3. ТЕМА ПОСТА */}
              {showThemePicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden border-t border-white/5 pt-2"
                >
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">
                    Стиль поста
                  </p>
                  <div className="flex gap-2 pb-2 overflow-x-auto">
                    {Object.keys(POST_THEMES).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                          selectedTheme === theme
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 4. ОПРОС */}
              {pollMode && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="mb-4 bg-black/30 rounded-xl p-4 border border-white/5 overflow-hidden"
                >
                  <input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Вопрос..."
                    className="w-full bg-transparent border-b border-white/10 py-2 mb-2 text-white outline-none font-bold"
                  />
                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[i] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      placeholder={`Вариант ${i + 1}`}
                      className="w-full bg-white/5 rounded-lg px-3 py-2 mb-2 text-sm text-white outline-none"
                    />
                  ))}
                  <button
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="text-xs text-indigo-400 font-bold hover:underline"
                  >
                    + Добавить вариант
                  </button>
                </motion.div>
              )}

              {/* 5. СТИКЕРЫ */}
              {showEmojiPicker && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="mt-4 border-t border-white/5 pt-4 overflow-hidden"
                >
                  <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {Object.values(STICKER_PACKS)
                      .flat()
                      .map((emoji, i) => (
                        <button
                          key={i}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            execCmd('insertText', emoji);
                          }}
                          className="text-2xl hover:scale-125 transition active:scale-90"
                        >
                          {emoji}
                        </button>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => setRulesAgreed(!rulesAgreed)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  rulesAgreed
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-transparent border-gray-600 text-transparent'
                }`}
              >
                <Check size={12} strokeWidth={4} />
              </button>
              <span
                className="text-xs text-gray-400 cursor-pointer"
                onClick={() => setRulesAgreed(!rulesAgreed)}
              >
                Без политики
              </span>
              <button
                onClick={handleCreatePost}
                disabled={isPosting || !rulesAgreed}
                className={`bg-white text-black px-8 py-3 rounded-2xl font-black text-xs hover:bg-indigo-500 hover:text-white transition-all active:scale-95 uppercase shadow-lg ml-auto ${
                  !rulesAgreed || isPosting
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isPosting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  'Опубликовать'
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {loading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => <SkeletonPost key={i} />)
              : filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`rounded-3xl p-6 relative group transition-all shadow-2xl border ${
                      POST_THEMES[post.theme || 'default']
                    }`}
                    onDoubleClick={(e) => handleDoubleTap(post, e)}
                  >
                    {new Date().getTime() -
                      new Date(post.created_at).getTime() <
                      3600000 && (
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-br-xl rounded-tl-3xl uppercase tracking-widest shadow-lg shadow-pink-500/20">
                        NEW
                      </div>
                    )}
                    {post.is_pinned && (
                      <div className="absolute top-0 left-16 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-b-xl uppercase tracking-widest flex items-center gap-1">
                        <Pin size={10} fill="currentColor" /> PIN
                      </div>
                    )}
                    <AnimatePresence>
                      {doubleTapHeart?.id === post.id && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1.5, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                        >
                          <Heart
                            size={100}
                            className="text-white drop-shadow-2xl"
                            fill="white"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex justify-between items-start mb-4 pl-4 pt-2">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() =>
                          router.push(`/profile?user=${post.author_name}`)
                        }
                      >
                        <div
                          className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden shadow-inner shrink-0"
                          style={{
                            boxShadow: post.author_glow
                              ? `0 0 15px ${post.author_color}44`
                              : 'none',
                          }}
                        >
                          <img
                            src={post.author_avatar}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3
                            className="font-bold text-sm"
                            style={getTextStyle(
                              post.author_text_gradient,
                              post.author_glow,
                              post.author_color
                            )}
                          >
                            {post.author_name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-0.5">
                            <span>{formatRelativeTime(post.created_at)}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span className="flex items-center gap-1 text-gray-400">
                              {calculateReadTime(post.content)} мин. чтения
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookmark(post.id)}
                          className={`p-2 rounded-lg transition ${
                            bookmarkedPosts.has(post.id)
                              ? 'text-yellow-400 bg-yellow-400/10'
                              : 'text-gray-500 hover:bg-white/5'
                          }`}
                        >
                          <Bookmark
                            size={18}
                            fill={
                              bookmarkedPosts.has(post.id)
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                        {myProfile?.id === post.author_id && (
                          <button
                            onClick={() =>
                              setDeleteModal({ isOpen: true, postId: post.id })
                            }
                            className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="pl-4">
                      <PostContent
                        html={post.content}
                        isSpoiler={post.is_nsfw}
                      />
                      {post.poll_question && (
                        <PollComponent
                          post={post}
                          userId={myProfile?.id}
                          onVote={(idx) => handleVote(post.id, idx)}
                        />
                      )}
                    </div>
                    <div className="flex gap-6 pt-4 border-t border-white/5 mt-4 pl-4">
                      <button
                        onClick={() => handleLike(post)}
                        className={`flex items-center gap-2 text-xs font-black transition-all group ${
                          post.liked_by?.includes(myProfile?.id)
                            ? 'text-red-500'
                            : 'text-gray-500 hover:text-white'
                        }`}
                      >
                        <Heart
                          size={20}
                          className="group-active:scale-125 transition-transform"
                          fill={
                            post.liked_by?.includes(myProfile?.id)
                              ? 'currentColor'
                              : 'none'
                          }
                        />{' '}
                        {post.liked_by?.length || 0}
                      </button>
                      <button
                        onClick={() => {
                          setActivePostId(
                            activePostId === post.id ? null : post.id
                          );
                          if (activePostId !== post.id) fetchComments(post.id);
                        }}
                        className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white transition"
                      >
                        <MessageSquare size={20} />{' '}
                        {comments[post.id]?.length || 'Комм.'}
                      </button>
                      <button
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-indigo-400 transition ml-auto"
                      >
                        <Share2 size={20} />
                      </button>
                      <div className="flex items-center gap-2 text-xs font-black text-gray-500 cursor-default">
                        <Activity size={16} /> {post.views_count || 0}
                      </div>
                      <button
                        onClick={() => speakText(post.content)}
                        className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white transition"
                        title="Озвучить"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {activePostId === post.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-white/5 space-y-4 pl-4"
                        >
                          <div className="max-h-80 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                            {comments[post.id]?.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex gap-3 items-start"
                              >
                                <div
                                  className="w-8 h-8 rounded-lg bg-white/5 shrink-0 overflow-hidden cursor-pointer"
                                  onClick={() =>
                                    router.push(
                                      `/profile?user=${comment.author_name}`
                                    )
                                  }
                                >
                                  <img
                                    src={comment.author_avatar}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                  <p
                                    className="text-[10px] font-black mb-1 uppercase"
                                    style={getTextStyle(
                                      comment.author_text_gradient,
                                      false,
                                      comment.author_color
                                    )}
                                  >
                                    {comment.author_name}
                                  </p>
                                  <p className="text-sm text-gray-300 font-light">
                                    {comment.content}
                                  </p>
                                  <MediaGrid
                                    files={comment.media_urls}
                                    isNsfw={false}
                                    onImageClick={setLightboxImage}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-3 pt-2">
                            <MediaGrid
                              files={commentFiles}
                              isNsfw={false}
                              onImageClick={setLightboxImage}
                            />
                            <div className="flex gap-2">
                              <input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Комментировать..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm outline-none focus:border-indigo-500/50"
                              />
                              <button
                                onClick={() => commentFileRef.current?.click()}
                                className="text-gray-500 hover:text-white"
                              >
                                <Camera size={20} />
                              </button>
                              <input
                                type="file"
                                ref={commentFileRef}
                                hidden
                                multiple
                                accept="image/*,video/*,audio/*"
                                onChange={handleCommentFiles}
                              />
                              <button
                                onClick={() => handleSendComment(post.id)}
                                className="bg-white text-black px-4 rounded-xl active:scale-90 transition"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() =>
              document
                .getElementById('feed-scroll')
                ?.scrollTo({ top: 0, behavior: 'smooth' })
            }
            className="fixed bottom-8 right-8 bg-white text-black p-3 rounded-full shadow-2xl z-50 hover:scale-110 transition"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
