// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Admin() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // State Data
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' atau 'form'

  // State Form
  const [nip, setNip] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("STAF");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(session);
    // Tolak akses kalau Staf biasa
    if (parsedUser.role === "STAF") {
      router.push("/my-tasks");
      return;
    }
    setCurrentUser(parsedUser);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Gagal memuat data pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitUser = async () => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip, name, password, phone, role }),
      });
      if (!res.ok) throw new Error("Gagal menambah pengguna");
    };

    toast.promise(submitUser(), {
      loading: 'Menyimpan data pengguna...',
      success: () => {
        setNip(""); setName(""); setPassword(""); setPhone(""); setRole("STAF");
        setView("list");
        fetchUsers();
        return 'Pengguna berhasil ditambahkan!';
      },
      error: 'Gagal! NIP mungkin sudah terdaftar.',
    }).finally(() => setIsSubmitting(false));
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (!window.confirm(`Yakin ingin menghapus ${userName}?`)) return;

    const deleteReq = async () => {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal hapus");
    };

    toast.promise(deleteReq(), {
      loading: 'Menghapus data...',
      success: () => {
        fetchUsers();
        return `${userName} berhasil dihapus!`;
      },
      error: 'Gagal menghapus pengguna.',
    });
  };

  // FITUR BARU: RESET PASSWORD 🔥
  const handleResetPassword = async (id: string, userName: string) => {
    if (!window.confirm(`Yakin ingin mereset password ${userName} menjadi "password123"?`)) return;

    const resetReq = async () => {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reset_password" }),
      });
      if (!res.ok) throw new Error("Gagal reset");
    };

    toast.promise(resetReq(), {
      loading: 'Mereset password...',
      success: `Password ${userName} direset ke "password123"`,
      error: 'Gagal mereset password.',
    });
  };

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[850px] md:my-8 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:border-8 border-white">
        
        {view === "list" ? (
          <>
            {/* Header Admin */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-10 pb-6 text-white md:rounded-t-[2rem] rounded-b-3xl shadow-md z-10 relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Command Center</p>
                  <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>
                
                {/* Kumpulan Tombol Kanan Atas 🔥 */}
                <div className="flex gap-2 shrink-0">
                  {/* Tombol Export Excel khusus Admin */}
                  <a href="/api/export" target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-full transition shadow-md" title="Download Rekap Excel">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </a>
                  
                  {/* Tombol Back / Logout */}
                  {currentUser.role === "KADEP" ? (
                    <button onClick={() => router.push("/")} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </button>
                  ) : (
                    <button onClick={() => { localStorage.removeItem("user_session"); router.push("/login"); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Staf</p>
                  <p className="text-xl font-bold">{users.filter(u => u.role === 'STAF').length} <span className="text-sm font-medium text-slate-400">orang</span></p>
                </div>
              </div>
            </div>

            {/* List User */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-extrabold text-slate-800">Daftar Pengguna</h2>
              </div>
              
              <div className="space-y-3 pb-24">
                {isLoading ? (
                  /* Skeleton Loading */
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-pulse flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  users.map((u: any) => (
                    <div key={u.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition hover:border-slate-300">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${u.role === 'KADEP' ? 'bg-indigo-100 text-indigo-600' : u.role === 'ADMIN' ? 'bg-slate-800 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm truncate">{u.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{u.role}</span>
                          <span className="text-xs font-medium text-slate-500 truncate">{u.nip}</span>
                        </div>
                      </div>
                      
                      {/* Tombol Aksi (Sembunyikan kalau diri sendiri) */}
                      {u.id !== currentUser.id && (
                        <div className="flex gap-1 shrink-0">
                          {/* Tombol Kunci (Reset Password) 🔥 */}
                          <button onClick={() => handleResetPassword(u.id, u.name)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition" title="Reset Password ke password123">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-4l5.618-5.618A6 6 0 0115 5v2z" /></svg>
                          </button>
                          
                          {/* Tombol Hapus */}
                          <button onClick={() => handleDeleteUser(u.id, u.name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition" title="Hapus Pengguna">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tombol Tambah User */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6 z-10 animate-in slide-in-from-bottom-4">
              <button onClick={() => setView("form")} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-slate-900/30 flex items-center justify-center gap-2 transform transition active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Tambah Pengguna Baru
              </button>
            </div>
          </>
        ) : (
          /* FORM TAMBAH USER SLIDE OVER */
          <div className="flex-1 bg-white flex flex-col h-full animate-in slide-in-from-bottom-8 duration-300">
            <div className="border-b border-slate-100 p-4 flex items-center gap-3 bg-white/90 backdrop-blur-md sticky top-0 z-10">
              <button onClick={() => setView("list")} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="font-bold text-slate-800 text-lg">Buat Akun Baru</h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleAddUser} className="space-y-5 pb-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role Akun</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-bold text-slate-900 shadow-sm cursor-pointer">
                      <option value="STAF">STAF</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="KADEP">KADEP</option> {/* SUDAH DIGANTI JADI KADEP 🔥 */}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Inisial (Login)</label>
                    <input type="text" required value={nip} onChange={(e) => setNip(e.target.value.toUpperCase())} placeholder="Misal: ABC" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm transition-all uppercase" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Lengkap</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Pengguna" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nomor WhatsApp</label>
                  <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="628123..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm transition-all" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-md shadow-slate-900/30 transform active:scale-95 transition-all disabled:opacity-50 mt-6">
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}