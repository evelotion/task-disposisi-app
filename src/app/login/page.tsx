// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // <-- Import toast di sini

export default function Login() {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // GANTI ALERT JADI TOAST ERROR 🔥
        toast.error(data.error || "Login gagal!");
        setIsLoading(false);
        return;
      }

      // Simpan session
      localStorage.setItem("user_session", JSON.stringify(data.user));
      
      // TOAST SUCCESS 🔥
      toast.success(`Selamat datang, ${data.user.name}!`);

      // Arahin sesuai role
      if (data.user.role === "DIREKSI") {
        router.push("/");
      } else if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/my-tasks");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Login SIMT</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Sistem Manajemen Tugas Internal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Inisial Nama</label>
            <input 
              type="text" required value={nip} onChange={(e) => setNip(e.target.value.toUpperCase())} placeholder="Misal: ABC" 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 transition-all uppercase" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 transition-all" 
            />
          </div>

          <button 
            type="submit" disabled={isLoading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/30 transform active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? "Memverifikasi..." : "Masuk ke Sistem"}
          </button>
        </form>
      </div>
    </main>
  );
}