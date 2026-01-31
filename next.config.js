/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // Игнорировать ошибки стиля
    },
    typescript: {
      ignoreBuildErrors: true, // Игнорировать ошибки кода
    },
    images: {
       unoptimized: true, // Чтобы картинки работали везде
    }
  };
  
  module.exports = nextConfig;