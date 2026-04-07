// src/app/task/[taskNumber]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // <-- Tambahan Fase 5
import toast from "react-hot-toast";

export default function TaskDetail() {
  const router = useRouter();
  const params = useParams();
  const taskNumber = params.taskNumber as string;

  const [task, setTask] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State form laporan
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State & Ref untuk Fase 5 (Modal Gambar & Auto Scroll)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const timelineEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    setCurrentUser(JSON.parse(session));
    fetchTask();
  }, [taskNumber]);

  // Efek untuk Auto-Scroll tiap kali data 'task' (termasuk logs) berubah
  useEffect(() => {
    if (timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: "smooth" });
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
    if (!message.trim()) return toast.error("Pesan update tidak boleh kosong!");
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
      toast.success("Progress berhasil diupdate!");
      fetchTask(); 
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pengecekan apakah URL lampiran adalah gambar
  const isAttachmentImage = task?.attachmentUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!task) return null;

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[850px] md:my-8 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:border-8 border-slate-200">
        
        {/* Top App Bar */}
        <header className="border-b border-slate-100 px-4 py-4 flex items-center gap-3 bg-white sticky top-0 z-20 shadow-sm shadow-slate-100/50">
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
        <div className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth">
          
          {/* Card Detail Instruksi Utama */}
          <div className="bg-white p-6 mb-2 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{task.title}</h2>
            
            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {task.assignee.name.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">DITUGASKAN KEPADA</p>
                <p className="text-sm font-bold text-slate-800">{task.assignee.name} <span className="text-slate-500 font-medium">({task.location})</span></p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {task.description || "Tidak ada detail instruksi khusus."}
            </p>

            {/* Tombol Lampiran Dinamis (Fase 5) */}
            {task.attachmentUrl && (
              <div className="mt-5">
                {isAttachmentImage ? (
                  <button 
                    onClick={() => setPreviewImage(task.attachmentUrl)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Lihat Gambar Lampiran
                  </button>
                ) : (
                  <a 
                    href={task.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Unduh File Lampiran
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Timeline Progress */}
          <div className="p-6 pb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Riwayat Progress
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
              {task.logs.length === 0 ? (
                <p className="text-center text-sm font-medium text-slate-400 italic py-4">Belum ada laporan progress.</p>
              ) : (
                task.logs.map((log: any, index: number) => {
                  const isMe = currentUser?.id === log.userId;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={log.id} 
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                    >
                      {/* Lingkaran Timeline */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 font-bold text-xs shadow shrink-0 z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isMe ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border-slate-200'}`}>
                        {log.user.name.charAt(0)}
                      </div>
                      
                      {/* Balon Chat / Log */}
                      <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-sm ${isMe ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-1.5">
                          <span className={`font-bold text-sm ${isMe ? 'text-blue-800' : 'text-slate-800'}`}>{isMe ? 'Anda' : log.user.name}</span>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className={`text-sm leading-relaxed ${isMe ? 'text-blue-900/80' : 'text-slate-600'}`}>{log.message}</p>
                      </div>
                    </motion.div>
                  )
                })
              )}
              {/* Ref point untuk auto-scroll */}
              <div ref={timelineEndRef} className="h-2"></div>
            </div>
          </div>
        </div>

        {/* Input Laporan Progress */}
        <div className="bg-white border-t border-slate-100 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-20">
          <form onSubmit={handleUpdateProgress} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-wide cursor-pointer hover:bg-slate-100 transition"
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
                placeholder="Ketik update laporan..." 
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 transition"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Kirim Update Progress
                </>
              )}
            </button>
          </form>
        </div>

        {/* IMAGE PREVIEW MODAL LIGHTBOX */}
        <AnimatePresence>
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4"
              onClick={() => setPreviewImage(null)}
            >
              <button 
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                onClick={() => setPreviewImage(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <motion.img
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                src={previewImage}
                alt="Preview Lampiran"
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-white/10"
                onClick={(e) => e.stopPropagation()} // Biar pas gambar diklik, modal gak ketutup
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}