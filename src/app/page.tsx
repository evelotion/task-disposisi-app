"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [assignees, setAssignees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/assignees")
      .then((res) => res.json())
      .then((data) => setAssignees(data))
      .catch((err) => console.error("Gagal load staf", err));
  }, []);

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
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        attachmentUrl = uploadData.secure_url; 
      }

      const taskRes = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          attachmentUrl,
          assigneeId,
        }),
      });

      if (!taskRes.ok) throw new Error("Gagal simpan tugas ke database");

      const selectedStaff: any = assignees.find((a: any) => a.id === assigneeId);
      if (selectedStaff) {
        const waNumber = selectedStaff.phone;
        const waText = `Halo ${selectedStaff.name}, ada tugas baru dari Direksi:%0A%0A*${title}*%0ADeadline: ${dueDate}%0A%0ADetail: ${description}%0A${attachmentUrl ? `Lampiran: ${attachmentUrl}` : ''}%0A%0ATolong segera di-follow up ya.`;
        
        window.open(`https://wa.me/${waNumber}?text=${waText}`, "_blank");
      }

      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDueDate("");
      setFile(null);
      
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengirim tugas.");
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    // Background utama pakai gradasi lembut biar efek glass-nya kontras
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4 md:p-8 flex items-center justify-center">
      
      {/* Container Form dengan Glassmorphism */}
      <div className="w-full max-w-md bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Disposisi Tugas</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Buat dan teruskan task ke tim</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-semibold text-slate-700 ml-1">Judul Tugas</label>
            <input 
              type="text"
              id="title" 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Contoh: Revisi Laporan Keuangan" 
              className="flex h-11 w-full rounded-xl border border-white/50 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="assignee" className="text-sm font-semibold text-slate-700 ml-1">Disposisi Ke</label>
            <select 
              id="assignee" 
              required
              className="flex h-11 w-full rounded-xl border border-white/50 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm text-slate-800 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all cursor-pointer"
              value={assigneeId} 
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="" disabled>-- Pilih Staf --</option>
              {assignees.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dueDate" className="text-sm font-semibold text-slate-700 ml-1">Follow Up Tanggal</label>
            <input 
              type="date" 
              id="dueDate" 
              required
              className="flex h-11 w-full rounded-xl border border-white/50 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm text-slate-800 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700 ml-1">Detail/Catatan <span className="text-slate-400 font-normal">(Opsional)</span></label>
            <textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Tambahkan instruksi spesifik..." 
              className="flex min-h-[100px] w-full rounded-xl border border-white/50 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="file" className="text-sm font-semibold text-slate-700 ml-1">Lampiran Gambar <span className="text-slate-400 font-normal">(Opsional)</span></label>
            <input 
              type="file"
              id="file" 
              accept="image/*,application/pdf"
              className="flex w-full cursor-pointer rounded-xl border border-white/50 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-12 px-4 rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border border-white/20" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses...
              </span>
            ) : "Submit & Kirim WA"}
          </button>

        </form>
      </div>
    </main>
  );
}