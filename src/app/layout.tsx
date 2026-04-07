// src/app/layout.tsx
import type { Metadata, Viewport } from "next";

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
  userScalable: false, // Biar gak bisa di-zoom, makin kerasa kayak app native
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}