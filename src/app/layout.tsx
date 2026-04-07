import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import BottomNav from "../components/BottomNav";
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
      {/* Tambahkan bg-slate-100 di body biar warna background konsisten */}
      <body className="bg-slate-100">
        {children}
        <BottomNav />
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#333',
              color: '#fff',
            },
          }} 
        />
      </body>
    </html>
  );
}
