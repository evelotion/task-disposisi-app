// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State form tambah user
  const [nip, setNip] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("STAF");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Proteksi Halaman: Cek apakah yang login adalah ADMIN
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    
    const user = JSON.parse(session);
    if (user.role !== "ADMIN") {
      alert("Akses Ditolak! Anda bukan Admin.");
      router.push("/login");
      return;
    }
    
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Gagal memuat user", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Pastikan format nomor WA diawali 62
      const formattedPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip, name, phone: formattedPhone, role })
      });
      
      if (!res.ok) throw new Error("Gagal menambah user. NIP mungkin sudah terdaftar.");
      
      // Reset form dan ambil data terbaru
      setNip(""); setName(""); setPhone(""); setRole("STAF");
      fetchUsers();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`Yakin ingin menghapus ${userName} dari sistem?`)) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (error) {
      alert("Gagal menghapus user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Memuat data...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Admin */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
            <p className="text-sm text-slate-500">Manajemen Data Karyawan (NIP & Akses)</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl transition-colors">
            Logout Keluar
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Kolom Kiri: Form Tambah User */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Tambah Karyawan</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">NIP (Login ID)</label>
                <input type="text" required value={nip} onChange={(e) => setNip(e.target.value.toUpperCase())} placeholder="Contoh: STF003" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nama Lengkap</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Rina (Keuangan)" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nomor WhatsApp</label>
                <input type="number" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contoh: 081234..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Role / Jabatan</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="STAF">Staf (Penerima Tugas)</option>
                  <option value="DIREKSI">Direksi (Pemberi Tugas)</option>
                  <option value="ADMIN">Admin (IT / System)</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 mt-2">
                {isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Tabel Daftar User */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Daftar Karyawan Terdaftar</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">NIP</th>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">No. WA</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{user.nip}</td>
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3 text-slate-500">{user.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'DIREKSI' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDelete(user.id, user.name)}
                          className="text-red-500 hover:text-red-700 font-semibold text-xs bg-red-50 px-2 py-1 rounded"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}