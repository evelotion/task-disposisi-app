// src/app/my-tasks/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyTasks() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cek sesi login
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(session);
    setUser(parsedUser);

    // Ambil data tugas khusus untuk user ini
    fetch(`/api/tasks/me?userId=${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[850px] md:my-8 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:border-8 border-white">
        
        {/* Header Profil Staf */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 px-6 pt-10 pb-6 text-white rounded-b-3xl shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Halo, semangat kerja!</p>
              <h1 className="text-2xl font-bold">{user.name}</h1>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
          <div className="mt-4 flex gap-4">
            <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider">Total Tugas</p>
              <p className="text-lg font-bold">{tasks.length}</p>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider">Pending</p>
              <p className="text-lg font-bold">{tasks.filter(t => t.status === 'PENDING').length}</p>
            </div>
          </div>
        </div>

        {/* List Tugas Saya */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-lg font-extrabold text-slate-800 mb-4">Daftar Pekerjaan Anda</h2>
          
          <div className="space-y-3 pb-10">
            {isLoading ? (
              <p className="text-center text-slate-500 text-sm mt-8">Memuat data...</p>
            ) : tasks.length === 0 ? (
              <div className="text-center mt-12">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-slate-500 font-medium">Yeay! Semua tugas sudah selesai.</p>
              </div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => router.push(`/task/${task.taskNumber}`)} 
                  className={`p-4 rounded-2xl shadow-sm border cursor-pointer transition active:scale-95 ${task.status === 'DONE' ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-emerald-600">{task.taskNumber}</span>
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
                    <span>{task.location}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}