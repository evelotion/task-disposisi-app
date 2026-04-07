"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"BERJALAN" | "SELESAI">("BERJALAN");

  // Ambil data tugas saat halaman dibuka
  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setIsLoading(false);
      });
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "PENDING" ? "DONE" : "PENDING";
    
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));

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

  // Kalkulasi Angka untuk Summary Cards
  const stats = useMemo(() => {
    const total = tasks.length;
    const selesai = tasks.filter(t => t.status === "DONE").length;
    const berjalan = total - selesai;
    return { total, berjalan, selesai };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchTab = activeTab === "BERJALAN" 
        ? task.status !== "DONE" 
        : task.status === "DONE";

      const query = searchQuery.toLowerCase();
      const matchSearch = 
        task.title.toLowerCase().includes(query) ||
        task.taskNumber.toLowerCase().includes(query) ||
        task.assignee.name.toLowerCase().includes(query);

      return matchTab && matchSearch;
    });
  }, [tasks, activeTab, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[850px] md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:my-8 md:border-8 border-white">
        
        {/* Top App Bar & Dashboard Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 pt-4 pb-2">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors active:scale-95">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </Link>
              <div>
                <h1 className="text-lg font-extrabold text-slate-800 leading-tight">Executive Dashboard</h1>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Ringkasan Disposisi
                </p>
              </div>
            </div>
            
            <a href="/api/export" className="p-2.5 bg-green-500 text-white rounded-full shadow-md shadow-green-500/30 hover:bg-green-600 transition-all active:scale-95">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
          </div>

          {/* FASE 4: SUMMARY CARDS (STATISTIK) */}
          <div className="grid grid-cols-3 gap-3 mb-5 px-1">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-3.5 text-white shadow-lg shadow-slate-900/20 transform transition hover:-translate-y-0.5">
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mb-1">Total Tugas</p>
              <h3 className="text-2xl font-black">{stats.total}</h3>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-3.5 text-white shadow-lg shadow-amber-500/30 transform transition hover:-translate-y-0.5">
              <p className="text-[9px] font-bold text-amber-100 uppercase tracking-wider mb-1">Berjalan</p>
              <h3 className="text-2xl font-black">{stats.berjalan}</h3>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-3.5 text-white shadow-lg shadow-emerald-500/30 transform transition hover:-translate-y-0.5">
              <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-wider mb-1">Selesai</p>
              <h3 className="text-2xl font-black">{stats.selesai}</h3>
            </div>
          </div>

          {/* SMART SEARCH BAR */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Cari judul, no tugas, staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* TAB FILTER STATUS */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("BERJALAN")}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${activeTab === "BERJALAN" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Berjalan
            </button>
            <button
              onClick={() => setActiveTab("SELESAI")}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${activeTab === "SELESAI" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Selesai
            </button>
          </div>
        </header>

        {/* List Tugas */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth bg-slate-50">
          <div className="space-y-4 pb-24">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse">
                    <div className="flex items-start gap-3 mb-3"><div className="w-6 h-6 rounded-full bg-slate-200 shrink-0"></div><div className="h-5 bg-slate-200 rounded-md w-3/4 mt-0.5"></div></div>
                    <div className="pl-9 space-y-2 mb-4"><div className="h-3 bg-slate-200 rounded w-full"></div><div className="h-3 bg-slate-200 rounded w-5/6"></div></div>
                  </div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center mt-12 text-center px-4">
                 <div className="w-20 h-20 bg-slate-200/50 rounded-full flex items-center justify-center mb-4">
                   {searchQuery ? (
                     <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   ) : activeTab === "BERJALAN" ? (
                     <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                   ) : (
                     <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                   )}
                 </div>
                 <h3 className="text-slate-800 font-bold mb-1">
                   {searchQuery ? "Tidak ditemukan" : activeTab === "BERJALAN" ? "Semua tugas beres!" : "Belum ada yang selesai"}
                 </h3>
                 <p className="text-slate-500 text-sm">
                   {searchQuery ? `Pencarian "${searchQuery}" tidak ada hasilnya.` : activeTab === "BERJALAN" ? "Tidak ada tugas yang sedang berjalan saat ini." : "Tugas yang di-checklist akan masuk ke sini."}
                 </p>
               </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task, index) => (
                  <motion.div 
                    layout 
                    key={task.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`relative p-5 rounded-2xl shadow-sm border mb-4 transition-all duration-300 overflow-hidden ${task.status === "DONE" ? "bg-slate-50/70 border-slate-100 opacity-75" : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"}`}
                  >
                    
                    {/* Aksen Garis Samping untuk Tugas Berjalan */}
                    {task.status !== "DONE" && (
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === "PENDING" ? "bg-red-400" : "bg-amber-400"}`}></div>
                    )}

                    {/* Title & Checkbox Area */}
                    <div className="flex items-start gap-3 mb-3 pl-1">
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

                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h2 className={`font-bold text-[15px] leading-snug transition-all ${task.status === "DONE" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                            {task.title}
                          </h2>
                          
                          {/* FASE 4: BADGE "BARU" DENGAN TITIK MERAH KEDIP JIKA STATUS PENDING */}
                          {task.status === "PENDING" ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-black px-2 py-1 bg-red-50 text-red-600 rounded-md shrink-0 border border-red-100 shadow-sm">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              BARU
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md shrink-0">
                              {task.taskNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Catatan */}
                    <p className={`text-sm mb-4 pl-10 line-clamp-2 leading-relaxed ${task.status === "DONE" ? "text-slate-400" : "text-slate-500"}`}>
                      {task.description || "Tidak ada catatan spesifik."}
                    </p>
                    
                    {/* Assignee & Due Date */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 ml-10">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${task.status === "DONE" ? "bg-slate-200 text-slate-500" : "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white"}`}>
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

                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}