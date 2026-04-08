"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // <-- Import Toast

export default function Home() {
  const router = useRouter();
  
  // State User & Tampilan
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState("dashboard"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true); // <-- State buat Skeleton Loading
  
  // State Form Disposisi
  const [assignees, setAssignees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [location, setLocation] = useState("KP");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(session);
    if (parsedUser.role === "STAF") {
      router.push("/my-tasks");
      return;
    }
    setUser(parsedUser);

    // Ambil Data Staf
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setAssignees(data));

    // Ambil Data Tugas (dengan simulasi delay sedikit biar skeleton-nya kelihatan keren)
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setRecentTasks(data.slice(0, 5));
        setIsLoadingTasks(false); // Matikan loading kalau data udah dapet
      })
      .catch(() => {
        toast.error("Gagal memuat riwayat tugas");
        setIsLoadingTasks(false);
      });
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    router.push(`/task/${searchQuery.toUpperCase()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Kita pakai fitur toast.promise biar ada loading spinner notif di atas layar
    const submitTask = async () => {
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
      return responseData.taskNumber;
    };

    toast.promise(submitTask(), {
      loading: 'Mengirim disposisi...',
      success: (taskNumber) => {
        // Reset Form
        setTitle(""); setDescription(""); setAssigneeId(""); setLocation("KP"); setFile(null);
        setView("dashboard");
        
        // Refresh List
        setIsLoadingTasks(true);
        fetch("/api/tasks").then(res => res.json()).then(data => {
          setRecentTasks(data.slice(0, 5));
          setIsLoadingTasks(false);
        });

        // Lempar ke WA
        const selectedStaff: any = assignees.find((a: any) => a.id === assigneeId);
        if (selectedStaff) {
          const waNumber = selectedStaff.phone;
          const taskUrl = `${window.location.origin}/task/${taskNumber}`;
          const waText = `Halo ${selectedStaff.name}, ada disposisi baru terkait:%0A%0ANo: *${taskNumber}*%0ALokasi: ${location}%0A*${title}*%0A%0ACek detail instruksi dan lapor progress pengerjaan melalui link berikut:%0A${taskUrl}`;
          window.open(`https://wa.me/${waNumber}?text=${waText}`, "_blank");
        }

        return `Tugas ${taskNumber} berhasil dibuat!`;
      },
      error: 'Terjadi kesalahan sistem.',
    }).finally(() => setIsSubmitting(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    toast.success("Berhasil keluar");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[850px] md:my-8 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:border-8 border-white">
        
        {view === "dashboard" ? (
          <>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-10 pb-6 text-white md:rounded-t-[2rem] rounded-b-3xl shadow-md z-10 relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">Selamat datang,</p>
                  <h1 className="text-2xl font-bold truncate pr-4">{user.name}</h1>
                </div>
                <button onClick={handleLogout} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition backdrop-blur-sm shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" placeholder="Cari Nomor Task (Cth: TSK-001)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-blue-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:bg-white/20 focus:border-white/40 transition uppercase font-medium tracking-wide"
                />
                <svg className="w-5 h-5 absolute left-4 top-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <button type="submit" className="absolute right-2 top-2 bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition">CARI</button>
              </form>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-extrabold text-slate-800">Riwayat Terakhir</h2>
              </div>
              
              <div className="space-y-3 pb-48">
                {isLoadingTasks ? (
                  /* INI DIA SKELETON LOADING-NYA BRO 🔥 */
                  [1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                      <div className="flex justify-between items-center mb-3">
                        <div className="h-3.5 bg-slate-200 rounded-md w-24"></div>
                        <div className="h-4 bg-slate-200 rounded-md w-16"></div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-slate-200 rounded-md w-32"></div>
                        <div className="h-3 bg-slate-200 rounded-md w-20"></div>
                      </div>
                    </div>
                  ))
                ) : recentTasks.length === 0 ? (
                  <div className="text-center mt-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Belum ada tugas yang dibuat.</p>
                  </div>
                ) : (
                  recentTasks.map(task => (
                    <div key={task.id} onClick={() => router.push(`/task/${task.taskNumber}`)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 cursor-pointer transition active:scale-95">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-extrabold text-blue-600">{task.taskNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${task.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mb-2">{task.title}</h3>
                      <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{task.assignee.name}</span>
                        <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{task.location}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="absolute bottom-24 left-0 right-0 flex justify-center px-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setView("form")} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-slate-900/30 flex items-center justify-center gap-2 transform transition active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Buat Disposisi Baru
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around items-center pt-3 pb-5 px-4 z-20 md:rounded-b-[2rem]">
              <button className="flex flex-col items-center gap-1 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span className="text-[10px] font-bold">Beranda</span>
              </button>
              
              <button onClick={() => window.open("/api/export", "_blank")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-[10px] font-bold">Rekap Excel</span>
              </button>

              <button onClick={() => router.push("/admin")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-[10px] font-bold">Admin</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-white flex flex-col h-full animate-in slide-in-from-bottom-8 duration-300">
            <div className="border-b border-slate-100 p-4 flex items-center gap-3 bg-white/90 backdrop-blur-md sticky top-0 z-10">
              <button onClick={() => setView("dashboard")} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="font-bold text-slate-800 text-lg">Buat Disposisi Baru</h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-5 pb-10">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Judul Tugas</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Revisi Laporan" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Lokasi</label>
                    <select required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 shadow-sm cursor-pointer">
                      <option value="KP">Kantor Pusat</option>
                      <option value="CABANG">Cabang</option>
                      <option value="UNIT_KERJA">Unit Kerja</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kirim Ke</label>
                    <select required value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 shadow-sm cursor-pointer">
                      <option value="" disabled>-- Pilih Staf --</option>
                      {assignees.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Instruksi Tambahan</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Catatan detail..." className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 placeholder:text-slate-400 shadow-sm resize-y transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Lampiran File/Foto</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-all" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/30 transform active:scale-95 transition-all disabled:opacity-50 mt-6">
                  {isSubmitting ? "Memproses..." : "Kirim Tugas via WhatsApp"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}