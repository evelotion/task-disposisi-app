// src/app/task/[taskNumber]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function TaskDetail() {
  const router = useRouter();
  const params = useParams();
  const taskNumber = params.taskNumber as string;

  const [task, setTask] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk form laporan progress
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Cek Session
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    setCurrentUser(JSON.parse(session));

    // Tarik data task
    fetchTask();
  }, [taskNumber]);

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskNumber}`);
      if (!res.ok) throw new Error("Task tidak ditemukan");
      
      const data = await res.json();
      setTask(data);
      setStatus(data.status); // Set status awal di dropdown form sama dengan status saat ini
    } catch (error) {
      alert("Nomor Task tidak ditemukan!");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return alert("Pesan update tidak boleh kosong!");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/tasks/${taskNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message, 
          status, 
          userId: currentUser.id 
        })
      });

      if (!res.ok) throw new Error("Gagal mengirim update");

      setMessage("");
      fetchTask(); // Refresh data otomatis biar chat-nya langsung muncul
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold text-slate-500">Memuat detail tugas...</div>;
  if (!task) return null;

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[850px] md:my-8 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:border-8 border-slate-200">
        
        {/* Top App Bar */}
        <header className="border-b border-slate-100 px-4 py-4 flex items-center gap-3 bg-white sticky top-0 z-20">
          <button onClick={() => router.back()} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600 transition active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg leading-tight">{task.taskNumber}</h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{new Date(task.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="ml-auto">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
              task.status === 'DONE' ? 'bg-green-100 text-green-700' : 
              task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 
              'bg-amber-100 text-amber-700'
            }`}>
              {task.status.replace("_", " ")}
            </span>
          </div>
        </header>

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          
          {/* Card Detail Instruksi Utama */}
          <div className="bg-white p-6 mb-2 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{task.title}</h2>
            
            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {task.assignee.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">DITUGASKAN KEPADA</p>
                <p className="text-sm font-bold text-slate-800">{task.assignee.name} <span className="text-slate-500 font-medium">({task.location})</span></p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {task.description || "Tidak ada detail instruksi khusus."}
            </p>

            {task.attachmentUrl && (
              <a href={task.attachmentUrl} target="_blank" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Lihat Lampiran
              </a>
            )}
          </div>

          {/* Timeline Progress */}
          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Timeline Progress</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {task.logs.length === 0 ? (
                <p className="text-center text-sm font-medium text-slate-400 italic">Belum ada update progress.</p>
              ) : (
                task.logs.map((log: any, index: number) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Lingkaran Timeline */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-blue-100 text-blue-600 font-bold text-xs shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {log.user.name.charAt(0)}
                    </div>
                    {/* Balon Chat / Log */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 text-sm">{log.user.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{log.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Input Laporan Progress (Sticky di bawah) */}
        <div className="bg-white border-t border-slate-100 p-4">
          <form onSubmit={handleUpdateProgress} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-wide"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">Proses</option>
                <option value="REVISION">Revisi</option>
                <option value="DONE">Selesai</option>
              </select>
              <input 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Ketik update laporan di sini..." 
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Update Progress"}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}