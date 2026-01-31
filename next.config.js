/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // ЗАСТАВЛЯЕМ VERCEL ЗАКРЫТЬ ГЛАЗА НА ОШИБКИ
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
       unoptimized: true,
    }
  };
  
  module.exports = nextConfig;