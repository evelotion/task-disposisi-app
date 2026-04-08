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
  const [file, setFile] = useState<File | null>(null); // State buat nampung foto 🔥
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Referensi ke input file tersembunyi

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }
    setCurrentUser(JSON.parse(session));
    fetchTask();
  }, [taskNumber]);

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
    if (!message.trim() && !file) return toast.error("Pesan atau foto tidak boleh kosong!");
    setIsSubmitting(true);

    const submitUpdate = async () => {
      let attachmentUrl = "";

      // Kalau ada file, upload ke Cloudinary dulu 🔥
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

      // Lempar data ke API
      const res = await fetch(`/api/tasks/${taskNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, status, userId: currentUser.id, attachmentUrl })
      });
      if (!res.ok) throw new Error("Gagal mengirim update");
    };

    toast.promise(submitUpdate(), {
      loading: file ? 'Mengupload gambar & laporan...' : 'Mengirim laporan...',
      success: () => {
        
        // --- FITUR AUTO-WA KE BOS (KADEP) 🔥 ---
        fetch("/api/users")
          .then(res => res.json())
          .then(users => {
            // Cari user yang jabatannya KADEP
            const bos = users.find((u: any) => u.role === "KADEP");
            
            if (bos && task) {
              let waNumber = bos.phone.replace(/\D/g, ''); 
              if (waNumber.startsWith('0')) {
                waNumber = '62' + waNumber.substring(1);
              }

              const taskUrl = `${window.location.origin}/task/${taskNumber}`;
              const reportText = message ? message : "Ada lampiran foto baru.";
              const statusText = status.replace("_", " ");
              
              // Susun teks laporan untuk Bos
              const rawText = `*UPDATE TUGAS MASUK* 🔔\n\nNo: *${task.taskNumber}*\nJudul: ${task.title}\nDari: ${currentUser.name}\n\n*Status:* ${statusText}\n*Pesan:* ${reportText}\n\nCek progres lengkap dan foto lampiran di sini:\n${taskUrl}`;
              
              const encodedText = encodeURIComponent(rawText);
              
              // Jurus nembus PWA iOS/Android
              const waUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodedText}`;
              const link = document.createElement("a");
              link.href = waUrl;
              link.target = "_top"; 
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          });
        // ----------------------------------------

        setMessage("");
        setFile(null); // Reset file
        fetchTask(); 
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
            <div className="p-6 space-y-4">
              <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4 mb-6"></div>
              <div className="h-16 bg-slate-200 rounded-xl animate-pulse w-full"></div>
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
                  <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 w-full py-3 rounded-xl transition shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    Lihat Lampiran File Tugas
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
                      const isMe = log.userId === currentUser.id; 
                      return (
                        <div key={log.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                              {isMe ? 'Anda' : log.user.name} • {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            <div className={`p-2.5 rounded-2xl shadow-sm border ${isMe ? 'bg-emerald-600 text-white rounded-br-none border-emerald-700' : 'bg-white text-slate-700 rounded-bl-none border-slate-200'}`}>
                              {/* Render Fotonya kalau ada 🔥 */}
                              {log.attachmentUrl && (
                                <a href={log.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                  <img src={log.attachmentUrl} alt="Lampiran Laporan" className="mb-2 w-full max-h-48 object-cover rounded-xl border border-black/10 shadow-sm" />
                                </a>
                              )}
                              <p className={`text-sm px-1.5 pb-1 leading-relaxed ${isMe ? 'font-medium' : 'font-medium'}`}>{log.message}</p>
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} className="h-1"></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Input Laporan Progress (Sticky Bottom ala WhatsApp) */}
        {!isLoading && task && (
          <div className="bg-white border-t border-slate-200 p-3 pb-4 md:rounded-b-[2rem] z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <form onSubmit={handleUpdateProgress} className="flex flex-col gap-2 relative">
              
              {/* Notifikasi mini kalau ada foto yang dipilih */}
              {file && (
                <div className="absolute -top-12 left-2 right-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-700 shadow-md animate-in slide-in-from-bottom-2">
                  <span className="truncate flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Foto Siap Dikirim
                  </span>
                  <button type="button" onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 p-1">Hapus</button>
                </div>
              )}

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
                
                <div className="flex-1 relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:ring-2 focus-within:ring-emerald-500 transition-all overflow-hidden">
                  
                  {/* Tombol Klip Kertas buat pilih Foto */}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="pl-4 pr-2 text-slate-400 hover:text-emerald-600 transition">
                    <svg className="w-5 h-5 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />

                  <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Ketik laporan..." 
                    className="w-full bg-transparent pr-12 py-3 text-sm focus:outline-none font-medium text-slate-800"
                  />
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting || (!message.trim() && !file)}
                    className="absolute right-1 top-1 bottom-1 aspect-square bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-all transform active:scale-95"
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