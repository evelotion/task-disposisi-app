import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

// Memaksa Next.js untuk selalu mengambil data terbaru
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const tasks = await prisma.task.findMany({
    include: { assignee: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    // Background luar (kalau dibuka di Desktop)
    <main className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
      
      {/* Container ala Layar HP (Native App Feel) */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen md:min-h-[850px] md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative md:my-8 md:border-8 border-white">
        
        {/* Top App Bar (Sticky) */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors active:scale-95">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 leading-tight">Daftar Tugas</h1>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{tasks.length} Disposisi</p>
            </div>
          </div>
          
          <a href="/api/export" className="p-2.5 bg-green-500 text-white rounded-full shadow-md shadow-green-500/30 hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </a>
        </header>

        {/* Content / List Tugas */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <div className="space-y-4 pb-10">
            {tasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center mt-20 text-center">
                 <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                   <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                 </div>
                 <p className="text-slate-500 font-medium">Belum ada tugas.</p>
               </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:bg-slate-50 transition-colors">
                  
                  {/* Title & Status */}
                  <div className="flex justify-between items-start mb-3">
                     <h2 className="font-bold text-slate-800 text-[15px] leading-snug pr-4">{task.title}</h2>
                     <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 mt-0.5">
                       {task.status}
                     </span>
                  </div>
                  
                  {/* Catatan */}
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {task.description || "Tidak ada catatan spesifik."}
                  </p>
                  
                  {/* Assignee & Due Date (Divider line) */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar Bulat (Inisial Nama) */}
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                        {task.assignee.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{task.assignee.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {task.dueDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                    </div>
                  </div>

                  {/* Attachment Button (Jika Ada) */}
                  {task.attachmentUrl && (
                    <div className="mt-4 pt-3 border-t border-slate-50">
                      <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
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