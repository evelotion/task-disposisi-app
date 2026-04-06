"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data tugas saat halaman dibuka
  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setIsLoading(false);
      });
  }, []);

  // Fungsi toggle checklist (Optimistic UI)
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "PENDING" ? "DONE" : "PENDING";
    
    // 1. Langsung update UI sebelum nunggu database (Biar kerasa instan)
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));

    // 2. Tembak perubahan ke database di background
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (error) {
      console.error("Gagal update status", error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[850px] md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:my-8 md:border-8 border-white">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors active:scale-95">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 leading-tight">Daftar Tugas</h1>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {isLoading ? "Memuat..." : `${tasks.length} Disposisi`}
              </p>
            </div>
          </div>
          
          <a href="/api/export" className="p-2.5 bg-green-500 text-white rounded-full shadow-md shadow-green-500/30 hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </a>
        </header>

        {/* List Tugas */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <div className="space-y-4 pb-10">
            {isLoading ? (
              <div className="flex justify-center mt-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : tasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center mt-20 text-center">
                 <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                   <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                 </div>
                 <p className="text-slate-500 font-medium">Belum ada tugas.</p>
               </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={`p-5 rounded-2xl shadow-sm border transition-all duration-300 ${task.status === "DONE" ? "bg-slate-50/70 border-slate-100 opacity-75" : "bg-white border-slate-100"}`}>
                  
                  {/* Title & Checkbox Area */}
                  <div className="flex items-start gap-3 mb-3">
                    
                    {/* Tombol Checklist */}
                    <button 
                      onClick={() => toggleStatus(task.id, task.status)}
                      className="mt-0.5 shrink-0 focus:outline-none transform active:scale-90 transition-transform"
                    >
                      {task.status === "DONE" ? (
                        <svg className="w-6 h-6 text-green-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-blue-400 transition-colors"></div>
                      )}
                    </button>

                    <h2 className={`font-bold text-[15px] leading-snug pt-0.5 transition-all ${task.status === "DONE" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                      {task.title}
                    </h2>
                  </div>
                  
                  {/* Catatan */}
                  <p className={`text-sm mb-4 pl-9 line-clamp-2 leading-relaxed ${task.status === "DONE" ? "text-slate-400" : "text-slate-500"}`}>
                    {task.description || "Tidak ada catatan spesifik."}
                  </p>
                  
                  {/* Assignee & Due Date */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 ml-9">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${task.status === "DONE" ? "bg-slate-200 text-slate-500" : "bg-blue-100 text-blue-700"}`}>
                        {task.assignee.name.charAt(0)}
                      </div>
                      <span className={`text-sm font-semibold ${task.status === "DONE" ? "text-slate-400" : "text-slate-700"}`}>
                        {task.assignee.name}
                      </span>
                    </div>

                    <div className={`flex items-center gap-1.5 text-xs font-medium ${task.status === "DONE" ? "text-slate-400" : "text-slate-500"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(task.dueDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                    </div>
                  </div>

                  {/* Attachment Button */}
                  {task.attachmentUrl && (
                    <div className="mt-4 pt-3 border-t border-slate-100 ml-9">
                      <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${task.status === "DONE" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-600 hover:text-blue-700"}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        Lihat Lampiran
                      </a>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}