// src/app/my-tasks/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // <-- Import Toast

export default function MyTasks() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // <-- State Skeleton
  const [activeTab, setActiveTab] = useState("BERJALAN"); // <-- State Tab Filter

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(session);
    setUser(parsedUser);

    fetch(`/api/tasks/me?userId=${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Gagal memuat tugas");
        setIsLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    toast.success("Berhasil keluar");
    router.push("/login");
  };

  if (!user) return null;

  // Logic Tab Filter: Kalau tab BERJALAN, tampilkan PENDING/PROSES/REVISI. Kalau SELESAI, tampilkan DONE.
  const filteredTasks = tasks.filter(task => 
    activeTab === "SELESAI" ? task.status === "DONE" : task.status !== "DONE"
  );

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[850px] md:my-8 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:border-8 border-white">
        
        {/* Header Profil Staf */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 px-6 pt-10 pb-6 text-white md:rounded-t-[2rem] rounded-b-3xl shadow-md z-10 relative">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Halo, semangat kerja!</p>
              <h1 className="text-2xl font-bold truncate pr-4">{user.name}</h1>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition backdrop-blur-sm shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
          <div className="mt-4 flex gap-4">
            <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider">Total Tugas</p>
              <p className="text-lg font-bold">{tasks.length}</p>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider">Berjalan</p>
              <p className="text-lg font-bold">{tasks.filter(t => t.status !== 'DONE').length}</p>
            </div>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="flex-1 overflow-y-auto pb-24">
          
          {/* TAB FILTER (Fase 3) 🔥 */}
          <div className="flex p-4 gap-2 sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab("BERJALAN")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "BERJALAN" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"}`}
            >
              🔥 Sedang Berjalan
            </button>
            <button 
              onClick={() => setActiveTab("SELESAI")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "SELESAI" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"}`}
            >
              ✅ Selesai
            </button>
          </div>

          {/* List Tugas Saya */}
          <div className="p-4 space-y-3">
            {isLoading ? (
              /* SKELETON LOADING 🔥 */
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-3.5 bg-slate-200 rounded-md w-24"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-16"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-slate-200 rounded-md w-24"></div>
                    <div className="h-3 bg-slate-200 rounded-md w-16"></div>
                  </div>
                </div>
              ))
            ) : filteredTasks.length === 0 ? (
              /* EMPTY STATE DINAMIS 🔥 */
              <div className="text-center mt-12 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === "BERJALAN" ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  )}
                </div>
                <p className="text-slate-500 font-medium">
                  {activeTab === "BERJALAN" ? "Yeay! Semua tugas Anda sudah selesai." : "Belum ada tugas yang diselesaikan."}
                </p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => router.push(`/task/${task.taskNumber}`)} 
                  className={`p-4 rounded-2xl shadow-sm border cursor-pointer transition active:scale-95 ${task.status === 'DONE' ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-extrabold text-emerald-600">{task.taskNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      task.status === 'DONE' ? 'bg-slate-200 text-slate-600' : 
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm mb-2 ${task.status === 'DONE' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.title}</h3>
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(task.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {task.location}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM NAVIGATION KHUSUS STAF 🔥 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around items-center pt-3 pb-5 px-4 z-20 md:rounded-b-[2rem]">
          <button className="flex flex-col items-center gap-1 text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-[10px] font-bold">Tugas Saya</span>
          </button>
          
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-[10px] font-bold">Keluar</span>
          </button>
        </div>

      </div>
    </main>
  );
}