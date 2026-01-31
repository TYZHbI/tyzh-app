'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { KNOWLEDGE_BASE, Profession, Branch } from './data';
import {
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Layers,
  Hash,
  Clock,
  Flame,
  User,
  MessageSquare,
  Send,
  Heart,
  Loader2,
  Bold,
  Quote,
  Code as CodeIcon,
  Paperclip,
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
  FileText,
  List,
} from 'lucide-react';
import Link from 'next/link';

// --- КОНФИГ СТИКЕРОВ ---
const STICKER_PACKS = {
  Pepe: ['🗿', '🤡', '💀', '🔥', '💩', '🦍', '🧢', '👀', '🫠', '🤮'],
  Base: ['❤️', '👍', '👎', '🤬', '😱', '🎉', '👋', '🙏', '🤝', '💎'],
  Space: ['🚀', '🛸', '🪐', '⭐', '🌌', '🌑', '👨‍🚀', '👾', '🤖', '👽'],
};

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

// 1. Блок кода
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

// 2. Аудио плеер
const AudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-3 flex items-center gap-3 w-full max-w-sm my-2 inline-flex">
      <button
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition shrink-0"
      >
        {playing ? (
          <Pause size={14} fill="black" />
        ) : (
          <Play size={14} fill="black" className="ml-0.5" />
        )}
      </button>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden min-w-[100px]">
        <div
          className="h-full bg-indigo-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) =>
          setProgress(
            (e.currentTarget.currentTime / e.currentTarget.duration) * 100
          )
        }
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
};

// 3. Сетка медиа
const MediaGrid = ({
  files,
  onDelete,
}: {
  files: string[];
  onDelete?: (i: number) => void;
}) => {
  if (!files || !Array.isArray(files) || files.length === 0) return null;
  return (
    <div
      className={`grid gap-2 mt-2 ${
        files.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
      }`}
    >
      {files.map((file, i) => {
        if (!file || typeof file !== 'string') return null;
        const isVideo = file.startsWith('data:video');
        const isAudio = file.startsWith('data:audio');
        return (
          <div
            key={i}
            className={`relative rounded-xl overflow-hidden border border-white/10 bg-black/50 ${
              files.length === 1 ? 'aspect-auto' : 'aspect-square'
            }`}
          >
            {isVideo ? (
              <video
                src={file}
                controls
                className="w-full h-full object-cover bg-black"
                playsInline
              />
            ) : isAudio ? (
              <div className="w-full h-full flex items-center justify-center p-6">
                <AudioPlayer src={file} />
              </div>
            ) : (
              <img src={file} className="w-full h-full object-cover" />
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(i)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 p-1.5 rounded-full text-white backdrop-blur-md transition z-10"
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 4. Модальное окно
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

// 5. Пост Контент
const PostContent = ({ html }: { html: string }) => (
  <div className="text-gray-200 text-sm leading-7 whitespace-pre-wrap select-text post-body">
    <style
      jsx
      global
    >{` .post-body b { font-weight: 900; color: #fff; } .post-body blockquote { border-left: 4px solid #6366f1; padding-left: 12px; font-style: italic; color: #a5b4fc; background: rgba(99,102,241,0.1); padding: 8px 12px; border-radius: 0 8px 8px 0; margin: 8px 0; } .post-body img, .post-body video { display: block; border-radius: 12px; margin: 12px 0; max-width: 100%; } @keyframes shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } } `}</style>
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

export default function RecommendationsPage() {
  // Navigation
  const [selectedProf, setSelectedProf] = useState<Profession | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [activeTab, setActiveTab] = useState<'handbook' | 'roadmap' | 'forum'>(
    'handbook'
  );

  // User & Data
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Editor & Interactions
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState('');
  const [commentFiles, setCommentFiles] = useState<string[]>([]);
  const commentFileRef = useRef<HTMLInputElement>(null);

  // Modals
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    postId: null as string | null,
  });
  const [codeModal, setCodeModal] = useState({
    isOpen: false,
    savedSelection: null as Range | null,
  });
  const [codeData, setCodeData] = useState({ filename: '', content: '' });

  // Init User
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(data);
      }
    };
    getUser();
  }, []);

  // Fetch Posts on Branch Change
  useEffect(() => {
    if (selectedBranch) {
      setActiveTab('handbook');
      fetchBranchPosts(selectedBranch.id);
    }
  }, [selectedBranch]);

  const fetchBranchPosts = async (branchId: string) => {
    setLoadingPosts(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });
    setForumPosts(data || []);
    setLoadingPosts(false);
  };

  const fetchComments = async (postId: string) => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments((prev) => ({ ...prev, [postId]: data || [] }));
  };

  // --- EDITOR LOGIC ---
  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const insertMediaAtCursor = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const div = document.createElement('div');
    div.innerHTML = html;
    const node = div.firstChild;
    if (!node) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(node);
      range.setStartAfter(node);
      range.setEndAfter(node);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('insertHTML', false, '<br><br>');
    } else {
      editorRef.current.appendChild(node);
    }
  };

  const enableImageResize = (e: any) => {
    if (e.target.tagName !== 'IMG') return;
    e.preventDefault();
    const img = e.target;
    const startX = e.clientX;
    const startWidth = img.clientWidth;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth > 50) {
        img.style.width = `${newWidth}px`;
        img.style.maxWidth = '100%';
      }
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handlePostFiles = async (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        if (!res) return;
        let html = '';
        if (file.type.startsWith('image/'))
          html = `<img src="${res}" class="rounded-xl my-2 border border-white/10 cursor-ew-resize hover:opacity-90 transition-opacity" style="width: 100%; max-width: 100%; display: block;">`;
        else if (file.type.startsWith('video/'))
          html = `<video src="${res}" controls class="w-full rounded-xl my-2 border border-white/10 bg-black"></video>`;
        else if (file.type.startsWith('audio/'))
          html = `<audio src="${res}" controls class="w-full my-2"></audio>`;
        if (html) insertMediaAtCursor(html);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ACTIONS ---
  const handleCreatePost = async () => {
    if (!currentUser) return alert('Войдите в аккаунт');
    const content = editorRef.current?.innerHTML || '';
    if (
      !content.trim() &&
      !content.includes('<img') &&
      !content.includes('<video')
    )
      return;

    setIsPosting(true);
    const { error } = await supabase.from('posts').insert([
      {
        content,
        author_id: currentUser.id,
        author_name: currentUser.username,
        author_class: currentUser.user_class,
        author_color: currentUser.neon_color,
        author_avatar: currentUser.avatar_url,
        author_glow: currentUser.nickname_glow,
        author_text_gradient: currentUser.text_gradient,
        branch_id: selectedBranch?.id,
        media_urls: [],
        liked_by: [],
      },
    ]);
    if (!error) {
      if (editorRef.current) editorRef.current.innerHTML = '';
      fetchBranchPosts(selectedBranch!.id);
    }
    setIsPosting(false);
  };

  const handleLike = async (post: any) => {
    if (!currentUser) return alert('Войдите!');
    const current = post.liked_by || [];
    const newLikes = current.includes(currentUser.id)
      ? current.filter((id: string) => id !== currentUser.id)
      : [...current, currentUser.id];
    setForumPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, liked_by: newLikes } : p))
    );
    await supabase
      .from('posts')
      .update({ liked_by: newLikes })
      .eq('id', post.id);
  };

  const confirmDelete = async () => {
    if (!deleteModal.postId) return;
    setForumPosts((prev) => prev.filter((p) => p.id !== deleteModal.postId));
    await supabase.from('posts').delete().eq('id', deleteModal.postId);
    setDeleteModal({ isOpen: false, postId: null });
  };

  // --- COMMENTS ---
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

  const handleSendComment = async (postId: string) => {
    if (!newComment.trim() && !commentFiles.length) return;
    await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          content: newComment,
          author_id: currentUser.id,
          author_name: currentUser.username,
          author_color: currentUser.neon_color,
          author_avatar: currentUser.avatar_url,
          media_urls: commentFiles,
          author_text_gradient: currentUser.text_gradient,
        },
      ]);
    setNewComment('');
    setCommentFiles([]);
    fetchComments(postId);
  };

  // --- CODE MODAL ---
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

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans flex overflow-hidden">
      {/* 1. MODALS */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, postId: null })}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black mb-2 uppercase">Удалить пост?</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal({ isOpen: false, postId: null })}
              className="flex-1 bg-[#1a1a1a] py-3 rounded-xl text-sm font-bold border border-white/5"
            >
              ОТМЕНА
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 bg-white text-black hover:bg-gray-200 py-3 rounded-xl text-sm font-black uppercase"
            >
              УДАЛИТЬ
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={codeModal.isOpen}
        onClose={() => setCodeModal({ ...codeModal, isOpen: false })}
      >
        <div>
          <div className="flex items-center gap-3 mb-6 text-indigo-400 font-bold">
            <Terminal size={20} /> Вставка кода
          </div>
          <div className="space-y-4">
            <input
              value={codeData.filename}
              onChange={(e) =>
                setCodeData((p) => ({ ...p, filename: e.target.value }))
              }
              placeholder="main.js"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              autoFocus
            />
            <textarea
              value={codeData.content}
              onChange={(e) =>
                setCodeData((p) => ({ ...p, content: e.target.value }))
              }
              placeholder="// Code..."
              className="w-full h-40 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-gray-300 outline-none focus:border-indigo-500 resize-none"
            />
            <button
              onClick={submitCodeBlock}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 uppercase tracking-widest text-xs"
            >
              Добавить
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. SIDEBAR */}
      <aside className="w-72 border-r border-white/5 p-6 hidden md:flex flex-col bg-black/50 backdrop-blur-xl h-screen sticky top-0 shrink-0 overflow-y-auto custom-scrollbar">
        <h1 className="text-4xl font-black mb-8 tracking-tighter flex items-center gap-2">
          <Hash className="text-indigo-500" />
          TYZH
        </h1>
        <div className="space-y-2 mb-8">
          <Link
            href="/feed"
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <Clock size={18} /> Лента
          </Link>
          <div className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Flame size={18} /> База Знаний
          </div>
          <Link
            href="/profile"
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <User size={18} /> Профиль
          </Link>
        </div>
        <div className="h-px bg-white/5 w-full mb-6" />
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-black mb-3 px-2 tracking-widest">
            Категории
          </p>
          <div className="space-y-1">
            {KNOWLEDGE_BASE.map((prof) => (
              <button
                key={prof.id}
                onClick={() => {
                  setSelectedProf(prof);
                  setSelectedBranch(null);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all text-left group ${
                  selectedProf?.id === prof.id
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    selectedProf?.id === prof.id
                      ? 'bg-white/10'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}
                >
                  <prof.icon size={16} style={{ color: prof.color }} />
                </div>
                {prof.name}
                {selectedProf?.id === prof.id && (
                  <ChevronRight size={14} className="ml-auto text-gray-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 3. MAIN CONTENT */}
      <section className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar relative h-screen">
        <AnimatePresence mode="wait">
          {!selectedProf && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center pb-20"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                <BookOpen size={48} className="text-indigo-400" />
              </div>
              <h2 className="text-4xl font-black text-white mb-4">
                База Знаний TYZH
              </h2>
              <p className="text-gray-500 max-w-md text-lg">
                Выберите категорию в меню слева.
              </p>
            </motion.div>
          )}

          {selectedProf && !selectedBranch && (
            <motion.div
              key="branches"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="mb-10 flex items-center gap-6">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center bg-[#111] border border-white/10 shadow-2xl"
                  style={{ borderColor: selectedProf.color }}
                >
                  <selectedProf.icon
                    size={40}
                    style={{ color: selectedProf.color }}
                  />
                </div>
                <div>
                  <h2 className="text-5xl font-black mb-2 tracking-tight">
                    {selectedProf.name}
                  </h2>
                  <p className="text-gray-400 text-lg">Выберите направление</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProf.branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch)}
                    className="group bg-[#111] border border-white/5 p-6 rounded-3xl text-left hover:border-white/20 hover:bg-white/5 transition-all relative overflow-hidden h-48 flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform duration-500" />
                    <div>
                      <h3
                        className="text-2xl font-bold mb-2 group-hover:text-white transition-colors"
                        style={{ color: selectedProf.color }}
                      >
                        {branch.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">
                        {branch.description}
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-bold text-gray-600 group-hover:text-white transition-colors uppercase tracking-widest mt-4">
                      Открыть <ChevronRight size={14} className="ml-1" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedBranch && selectedProf && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-4xl mx-auto pb-40"
            >
              <button
                onClick={() => setSelectedBranch(null)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white mb-8 transition-colors uppercase tracking-widest"
              >
                <ArrowLeft size={16} /> Назад к: {selectedProf.name}
              </button>

              <div className="bg-[#111] border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl mb-12">
                <div
                  className="absolute top-0 left-0 w-full h-2"
                  style={{ backgroundColor: selectedProf.color }}
                />
                <h1 className="text-4xl md:text-6xl font-black mb-4 flex items-center gap-4 tracking-tighter">
                  {selectedBranch.name}
                </h1>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  {selectedBranch.description}
                </p>
                <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/10 inline-flex">
                  <button
                    onClick={() => setActiveTab('handbook')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'handbook'
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FileText size={16} /> Справочник
                  </button>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'roadmap'
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List size={16} /> Рекомендации
                  </button>
                  <button
                    onClick={() => setActiveTab('forum')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'forum'
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare size={16} /> Форум
                  </button>
                </div>
              </div>

              {/* TABS CONTENT */}
              <div>
                {activeTab === 'handbook' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111] border border-white/5 rounded-3xl p-8 leading-loose text-gray-300 text-lg shadow-2xl"
                  >
                    {selectedBranch.handbook}
                  </motion.div>
                )}
                {activeTab === 'roadmap' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111] border border-white/5 rounded-3xl p-8 leading-loose text-gray-300 text-lg shadow-2xl"
                  >
                    {selectedBranch.roadmap}
                  </motion.div>
                )}

                {/* FORUM TAB */}
                {activeTab === 'forum' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 shadow-2xl relative z-20 mb-12">
                      {/* EDITOR */}
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                        <div
                          className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden"
                          style={{
                            boxShadow: currentUser?.nickname_glow
                              ? `0 0 10px ${currentUser?.neon_color}`
                              : 'none',
                            borderColor: currentUser?.neon_color,
                          }}
                        >
                          {currentUser?.avatar_url ? (
                            <img
                              src={currentUser.avatar_url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                              YOU
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-400">
                          Создать тему в {selectedBranch.name}
                        </p>
                      </div>
                      <div className="flex gap-1 mb-4 border-b border-white/5 pb-2 overflow-x-auto">
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            execCmd('bold');
                          }}
                          className="p-2 hover:bg-white/5 rounded text-gray-400"
                        >
                          <Bold size={18} />
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            execCmd('formatBlock', 'blockquote');
                          }}
                          className="p-2 hover:bg-white/5 rounded text-gray-400"
                        >
                          <Quote size={18} />
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            openCodeModal();
                          }}
                          className="p-2 bg-indigo-500/10 text-indigo-400 rounded hover:bg-indigo-500/20"
                        >
                          <CodeIcon size={18} />
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                        >
                          <Paperclip size={18} />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          hidden
                          multiple
                          accept="image/*,video/*,audio/*"
                          onChange={handlePostFiles}
                        />
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded ml-auto transition-colors"
                        >
                          <Smile size={18} />
                        </button>
                      </div>
                      <div
                        ref={editorRef}
                        contentEditable
                        className="w-full min-h-[100px] outline-none text-white text-base placeholder:text-gray-700 empty:before:content-['Ваш_вопрос_или_пост...'] empty:before:text-gray-700"
                        onMouseDown={enableImageResize}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            document.execCommand(
                              'defaultParagraphSeparator',
                              false,
                              'p'
                            );
                          }
                        }}
                      />
                      <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                        <button
                          onClick={handleCreatePost}
                          disabled={isPosting}
                          className="bg-white text-black px-8 py-3 rounded-2xl font-black text-xs hover:bg-indigo-500 hover:text-white transition-all active:scale-95 uppercase shadow-lg"
                        >
                          {isPosting ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            'Опубликовать'
                          )}
                        </button>
                      </div>
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
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
                    </div>

                    {loadingPosts ? (
                      <div className="text-center text-gray-600 animate-pulse font-bold tracking-widest">
                        ЗАГРУЗКА...
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {forumPosts.map((post) => (
                          <div
                            key={post.id}
                            className="bg-[#111] border border-white/5 rounded-3xl p-6 relative shadow-2xl"
                          >
                            {currentUser?.id === post.author_id && (
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    isOpen: true,
                                    postId: post.id,
                                  })
                                }
                                className="absolute top-6 right-6 text-gray-600 hover:text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                                style={{
                                  boxShadow: post.author_glow
                                    ? `0 0 15px ${post.author_color}44`
                                    : 'none',
                                }}
                              >
                                {post.author_avatar ? (
                                  <img
                                    src={post.author_avatar}
                                    className="w-full h-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <div>
                                <h3
                                  className="text-sm font-bold"
                                  style={getTextStyle(
                                    post.author_text_gradient,
                                    post.author_glow,
                                    post.author_color
                                  )}
                                >
                                  {post.author_name}
                                </h3>
                                <p className="text-[10px] text-gray-600 font-bold uppercase">
                                  {new Date(
                                    post.created_at
                                  ).toLocaleDateString()}{' '}
                                  в{' '}
                                  {new Date(post.created_at).toLocaleTimeString(
                                    [],
                                    { hour: '2-digit', minute: '2-digit' }
                                  )}
                                </p>
                              </div>
                            </div>
                            <PostContent html={post.content} />
                            <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                              <button
                                onClick={() => handleLike(post)}
                                className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                                  post.liked_by?.includes(currentUser?.id)
                                    ? 'text-red-500'
                                    : 'text-gray-500 hover:text-white'
                                }`}
                              >
                                <Heart
                                  size={18}
                                  fill={
                                    post.liked_by?.includes(currentUser?.id)
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
                                  if (activePostId !== post.id)
                                    fetchComments(post.id);
                                }}
                                className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white"
                              >
                                <MessageSquare size={18} />{' '}
                                {comments[post.id]?.length || 'Комментировать'}
                              </button>
                            </div>
                            <AnimatePresence>
                              {activePostId === post.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-4 pt-4 border-t border-white/5 space-y-4"
                                >
                                  <div className="max-h-80 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                                    {comments[post.id]?.map((comment) => (
                                      <div
                                        key={comment.id}
                                        className="flex gap-3 items-start"
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 shrink-0 overflow-hidden cursor-pointer">
                                          {comment.author_avatar && (
                                            <img
                                              src={comment.author_avatar}
                                              className="w-full h-full object-cover"
                                            />
                                          )}
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
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="space-y-3 pt-2">
                                    <MediaGrid
                                      files={commentFiles}
                                      onDelete={(i) =>
                                        setCommentFiles((p) =>
                                          p.filter((_, idx) => idx !== i)
                                        )
                                      }
                                    />
                                    <div className="flex gap-2">
                                      <input
                                        value={newComment}
                                        onChange={(e) =>
                                          setNewComment(e.target.value)
                                        }
                                        placeholder="Написать комментарий..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm outline-none focus:border-indigo-500/50"
                                      />
                                      <button
                                        onClick={() =>
                                          commentFileRef.current?.click()
                                        }
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
                                        onClick={() =>
                                          handleSendComment(post.id)
                                        }
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
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
