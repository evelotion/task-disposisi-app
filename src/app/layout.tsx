// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast"; // <-- 1. Import Toaster
import "./globals.css";

export const metadata: Metadata = {
  title: "SIMT App",
  description: "Sistem Informasi Manajemen Tugas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIMT App",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        {/* 2. Taruh Toaster di sini biar aktif se-aplikasi */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '12px',
            },
            success: {
              style: { background: '#10b981' }, // Hijau Tailwind
            },
            error: {
              style: { background: '#ef4444' }, // Merah Tailwind
            },
          }} 
        />
        {children}
      </body>
    </html>
  );
}