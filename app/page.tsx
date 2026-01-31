'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Настройки анимации (Лесенка)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

// Настройки элемента (Пружина)
const itemVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

export default function Home() {
  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none"
    >
      {/* ФОН */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none"
      ></motion.div>

      {/* ЛОГОТИП */}
      <motion.div
        variants={itemVariants}
        className="z-10 flex items-end mb-8 relative group cursor-default"
      >
        <h1 className="text-9xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]">
          TYZH
        </h1>
        <span className="mb-5 ml-4 text-xl text-indigo-200 font-mono font-bold tracking-widest border border-indigo-500/30 bg-indigo-900/30 px-3 py-1 rounded-md backdrop-blur-md">
          .SOCIAL
        </span>
      </motion.div>

      {/* СЛОГАН */}
      <motion.p
        variants={itemVariants}
        className="z-10 text-2xl text-gray-400 mb-16 font-bold tracking-[0.15em] uppercase text-center max-w-2xl leading-relaxed"
      >
        ТУТ ДИВАННЫЙ ЭКСПЕРТ <br /> ГОЛОСА НЕ ИМЕЕТ
      </motion.p>

      {/* КНОПКИ */}
      <motion.div
        variants={itemVariants}
        className="z-10 flex flex-col sm:flex-row gap-6 w-full max-w-md sm:max-w-none justify-center items-center"
      >
        {/* КНОПКА 1: ВХОД */}
        <Link href="/login">
          <button className="w-full sm:w-auto px-12 py-5 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 font-bold text-lg tracking-wider hover:text-white hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:scale-105 transition-all duration-300 backdrop-blur-md">
            ВОЙТИ
          </button>
        </Link>

        {/* КНОПКА 2: ПРИСОЕДИНИТЬСЯ (Исправленная) */}
        <Link href="/register">
          <button className="w-full sm:w-auto relative px-12 py-5 rounded-xl bg-white text-black font-black text-lg tracking-wider overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            {/* ВОТ ЭТОТ ГРАДИЕНТ Я ВЕРНУЛ: */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">
              ПРИСОЕДЕНИТЬСЯ
            </span>
          </button>
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="absolute bottom-8 text-gray-700 font-mono text-[10px] tracking-[0.3em] z-10 opacity-50"
      >
        SYSTEM_READY // V.1.0.0
      </motion.div>
    </motion.main>
  );
}
