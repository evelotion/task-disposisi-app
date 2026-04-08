// src/app/task/[taskNumber]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TaskDetail() {
  const router = useRouter();
  const params = useParams();
  const taskNumber = params.taskNumber as string;

  const [task, setTask] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Referensi untuk fitur Auto-Scroll ke bawah
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    setCurrentUser(JSON.parse(session));
    fetchTask();
  }, [taskNumber]);

  // Efek untuk Auto-Scroll setiap kali data task (dan chat-nya) berubah
  useEffect(() => {
    if (task?.logs) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [task]);

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskNumber}`);
      if (!res.ok) throw new Error("Task tidak ditemukan");
      
      const data = await res.json();
      setTask(data);
      setStatus(data.status); 
    } catch (error) {
      toast.error("Nomor Task tidak ditemukan!");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return toast.error("Pesan laporan tidak boleh kosong!");
    setIsSubmitting(true);

    const submitUpdate = async () => {
      const res = await fetch(`/api/tasks/${taskNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, status, userId: currentUser.id })
      });
      if (!res.ok) throw new Error("Gagal mengirim update");
    };

    toast.promise(submitUpdate(), {
      loading: 'Mengirim laporan...',
      success: () => {
        setMessage("");
        fetchTask(); // Tarik data chat terbaru
        return 'Laporan progress berhasil dikirim!';
      },
      error: 'Terjadi kesalahan sistem.',
    }).finally(() => setIsSubmitting(false));
  };

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[850px] md:my-8 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:border-8 border-white">
        
        {/* Top App Bar - Sticky */}
        <header className="px-4 py-4 flex items-center gap-3 bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 shadow-sm">
          <button onClick={() => router.back()} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600 transition active:scale-95 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          {isLoading ? (
             <div className="flex-1 animate-pulse"><div className="h-4 bg-slate-200 rounded w-24 mb-1"></div><div className="h-3 bg-slate-200 rounded w-32"></div></div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <h1 className="font-extrabold text-slate-800 text-lg leading-tight truncate">{task.taskNumber}</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{new Date(task.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          )}

          {!isLoading && task && (
            <div className="ml-auto shrink-0">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                task.status === 'DONE' ? 'bg-green-100 text-green-700' : 
                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 
                'bg-amber-100 text-amber-700'
              }`}>
                {task.status.replace("_", " ")}
              </span>
            </div>
          )}
        </header>

        {/* Area Scrollable Utama */}
        <div className="flex-1 overflow-y-auto bg-slate-50 pb-4">
          
          {isLoading ? (
            /* Skeleton Loading untuk Konten */
            <div className="p-6 space-y-4">
              <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4 mb-6"></div>
              <div className="h-16 bg-slate-200 rounded-xl animate-pulse w-full"></div>
              <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
            </div>
          ) : task && (
            <>
              {/* Card Detail Instruksi Utama */}
              <div className="bg-white p-6 mb-4 border-b border-slate-200 shadow-sm rounded-b-3xl">
                <h2 className="text-xl font-bold text-slate-800 mb-4 leading-snug">{task.title}</h2>
                
                <div className="flex items-center gap-3 mb-5 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {task.assignee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mb-0.5">Penanggung Jawab</p>
                    <p className="text-sm font-bold text-slate-800">{task.assignee.name} <span className="text-slate-500 font-medium text-xs">({task.location})</span></p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instruksi Tugas</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {task.description || "Tidak ada detail instruksi khusus."}
                  </p>
                </div>

                {task.attachmentUrl && (
                  <a href={task.attachmentUrl} target="_blank" className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 w-full py-3 rounded-xl transition shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    Lihat Lampiran File
                  </a>
                )}
              </div>

              {/* Chat Timeline Progress */}
              <div className="px-4 pt-2">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 rounded-full">Riwayat Progress</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                
                <div className="space-y-4">
                  {task.logs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm font-medium text-slate-400 italic">Belum ada update laporan progress.</p>
                    </div>
                  ) : (
                    task.logs.map((log: any) => {
                      const isMe = log.userId === currentUser.id; // Cek apakah pesan ini diketik oleh user yang lagi login
                      return (
                        <div key={log.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                              {isMe ? 'Anda' : log.user.name} • {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className={`p-3.5 rounded-2xl shadow-sm border ${isMe ? 'bg-emerald-600 text-white rounded-br-none border-emerald-700' : 'bg-white text-slate-700 rounded-bl-none border-slate-200'}`}>
                              <p className={`text-sm leading-relaxed ${isMe ? 'font-medium' : 'font-medium'}`}>{log.message}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Elemen kosong untuk target Auto-Scroll */}
                  <div ref={chatEndRef} className="h-1"></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Input Laporan Progress (Sticky Bottom ala WhatsApp) */}
        {!isLoading && task && (
          <div className="bg-white border-t border-slate-200 p-3 pb-4 md:rounded-b-[2rem] z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <form onSubmit={handleUpdateProgress} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className={`rounded-full border border-slate-200 px-3 py-2.5 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase tracking-wide shrink-0 ${status === 'DONE' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-700'}`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">Proses</option>
                  <option value="REVISION">Revisi</option>
                  <option value="DONE">Selesai ✅</option>
                </select>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Ketik laporan..." 
                    className="w-full rounded-full border border-slate-200 bg-slate-50 pl-4 pr-12 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !message.trim()}
                    className="absolute right-1 top-1 bottom-1 aspect-square bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-all transform active:scale-90"
                  >
                    <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}