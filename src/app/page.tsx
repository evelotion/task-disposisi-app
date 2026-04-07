"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  // State User & Tampilan
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState("dashboard"); // 'dashboard' atau 'form'
  const [searchQuery, setSearchQuery] = useState("");
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  
  // State Form Disposisi
  const [assignees, setAssignees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [location, setLocation] = useState("KP");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // 1. Proteksi Halaman & Ambil Session
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(session);
    // Kalau STAF yang login, lempar ke halaman my-tasks
    if (parsedUser.role === "STAF") {
      router.push("/my-tasks");
      return;
    }
    setUser(parsedUser);

    // 2. Load Data Karyawan (Untuk Dropdown Form)
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setAssignees(data));

    // 3. Load Data Tugas Terbaru (Untuk list di dashboard)
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        // Ambil 5 tugas terbaru aja buat preview
        setRecentTasks(data.slice(0, 5));
      });
  }, [router]);

  // Fungsi Fitur Pencarian
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    // Ngarahin ke halaman detail task (Fase 6 nanti)
    router.push(`/task/${searchQuery.toUpperCase()}`);
  };

  // Fungsi Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let attachmentUrl = "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ml_default"); 
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST", body: formData,
        });
        const uploadData = await uploadRes.json();
        attachmentUrl = uploadData.secure_url; 
      }

      const taskRes = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, attachmentUrl, assigneeId }),
      });

      if (!taskRes.ok) throw new Error("Gagal simpan tugas");
      
      const responseData = await taskRes.json();
      const generatedTaskNumber = responseData.taskNumber;

      // Lempar ke WA dengan format baru (Sistem Loop)
      const selectedStaff: any = assignees.find((a: any) => a.id === assigneeId);
      if (selectedStaff) {
        const waNumber = selectedStaff.phone;
        const taskUrl = `${window.location.origin}/task/${generatedTaskNumber}`; // Link otomatis menyesuaikan domain
        
        const waText = `Halo ${selectedStaff.name}, ada disposisi baru dari Direksi:%0A%0ANo: *${generatedTaskNumber}*%0ALokasi: ${location}%0A*${title}*%0A%0ACek detail instruksi dan lapor progress pengerjaan melalui link berikut:%0A${taskUrl}`;
        
        window.open(`https://wa.me/${waNumber}?text=${waText}`, "_blank");
      }

      // Reset form & kembali ke dashboard
      setTitle(""); setDescription(""); setAssigneeId(""); setLocation("KP"); setFile(null);
      setView("dashboard");
      
      // Refresh list
      fetch("/api/tasks").then(res => res.json()).then(data => setRecentTasks(data.slice(0, 5)));
      
    } catch (error) {
      alert("Terjadi kesalahan saat mengirim tugas.");
    } finally {
      setIsSubmitting(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  if (!user) return null; // Layar kosong sebentar saat loading

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[850px] md:my-8 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:border-8 border-white">
        
        {/* TAMPILAN DASHBOARD UTAMA */}
        {view === "dashboard" ? (
          <>
            {/* Header Profil */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-10 pb-6 text-white rounded-b-3xl shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">Selamat datang,</p>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                </div>
                <button onClick={handleLogout} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>

              {/* Fitur Pencarian Task */}
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder="Cari Nomor Task (Cth: TSK-001)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-blue-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:bg-white/20 focus:border-white/40 transition uppercase font-medium tracking-wide"
                />
                <svg className="w-5 h-5 absolute left-4 top-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <button type="submit" className="absolute right-2 top-2 bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition">
                  CARI
                </button>
              </form>
            </div>

            {/* List Tugas Terbaru */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-extrabold text-slate-800">Riwayat Terakhir</h2>
                <button onClick={() => router.push("/admin")} className="text-xs font-bold text-blue-600 hover:text-blue-800">Menu Admin</button>
              </div>
              
              <div className="space-y-3 pb-24">
                {recentTasks.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm mt-8">Belum ada tugas yang dibuat.</p>
                ) : (
                  recentTasks.map(task => (
                    <div key={task.id} onClick={() => router.push(`/task/${task.taskNumber}`)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 cursor-pointer transition active:scale-95">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-blue-600">{task.taskNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${task.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {task.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mb-2">{task.title}</h3>
                      <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                        <span>{task.assignee.name}</span>
                        <span>{task.location}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Floating Action Button (FAB) untuk Form Baru */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
              <button onClick={() => setView("form")} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-slate-900/30 flex items-center justify-center gap-2 transform transition active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Buat Disposisi Baru
              </button>
            </div>
          </>
        ) : (
          /* =======================================
             TAMPILAN FORM INPUT (SLIDE OVER)
             ======================================= */
          <div className="flex-1 bg-white flex flex-col h-full animate-in slide-in-from-bottom-8 duration-300">
            {/* Header Form */}
            <div className="border-b border-slate-100 p-4 flex items-center gap-3 bg-white sticky top-0 z-10">
              <button onClick={() => setView("dashboard")} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="font-bold text-slate-800 text-lg">Buat Disposisi</h2>
            </div>

            {/* Isi Form (Sama persis kayak sebelumnya) */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-5 pb-10">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Task</label>
                  <input 
                    type="text" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Contoh: Revisi Laporan" 
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm transition-all" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Lokasi</label>
                    <select 
                      required 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 shadow-sm cursor-pointer"
                    >
                      <option value="KP">Kantor Pusat</option>
                      <option value="CABANG">Cabang</option>
                      <option value="UNIT_KERJA">Unit Kerja</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kirim Ke</label>
                    <select 
                      required 
                      value={assigneeId} 
                      onChange={(e) => setAssigneeId(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 shadow-sm cursor-pointer"
                    >
                      <option value="" disabled>-- Staf --</option>
                      {assignees.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Catatan</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Instruksi tambahan..." 
                    className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 placeholder:text-slate-400 shadow-sm resize-y" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Lampiran</label>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
                    className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/30 transform active:scale-95 transition-all disabled:opacity-50 mt-6"
                >
                  {isSubmitting ? "Memproses..." : "Kirim via WhatsApp"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}