/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // "Vercel, не смотри на ошибки стиля"
    },
    typescript: {
      ignoreBuildErrors: true, // "Vercel, не смотри на ошибки типов"
    },
    images: {
       unoptimized: true, // "Vercel, не усложняй работу с картинками"
    }
  };
  
  module.exports = nextConfig;