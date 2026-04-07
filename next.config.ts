// @ts-expect-error - next-pwa tidak punya file deklarasi TypeScript bawaan
import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Matikan PWA saat ngoding (dev mode) biar gak ganggu
})({
  // Masukkan config Next.js lu yang lain di sini kalau ada
});

export default nextConfig;