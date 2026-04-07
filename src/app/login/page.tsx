// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [nip, setNip] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal login");
      }

      // Simpan data user ke LocalStorage (sebagai "KTP" selama buka web)
      localStorage.setItem("user_session", JSON.stringify(data));

      // Redirect otomatis sesuai Role / Jabatan
      if (data.role === "ADMIN") {
        router.push("/admin");
      } else if (data.role === "DIREKSI") {
        router.push("/");
      } else {
        router.push("/my-tasks"); // Halaman khusus staf (nanti kita buat)
      }

    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white/50 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 text-center">
        
        {/* Ikon / Logo Dummy */}
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Login SIMT</h1>
        <p className="text-sm text-slate-500 mb-8 font-medium">Sistem Informasi Manajemen Tugas</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label htmlFor="nip" className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Masukkan NIP Anda</label>
            <input 
              type="text" 
              id="nip" 
              required 
              value={nip} 
              onChange={(e) => setNip(e.target.value)} 
              placeholder="Contoh: ADMIN01" 
              className="flex h-12 w-full rounded-xl border border-white/50 bg-white/70 backdrop-blur-sm px-4 py-2 text-center text-lg font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all uppercase"
            />
          </div>

          {/* Menampilkan pesan error kalau NIP salah */}
          {errorMsg && (
            <p className="text-red-500 text-sm font-semibold bg-red-50 py-2 rounded-lg border border-red-100">{errorMsg}</p>
          )}

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold h-12 px-4 rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? "Mengecek..." : "Masuk"}
          </button>
        </form>

      </div>
    </main>
  );
}