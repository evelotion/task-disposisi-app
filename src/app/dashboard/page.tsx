// src/app/dashboard/page.tsx
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

// Memaksa Next.js untuk selalu mengambil data terbaru (tidak di-cache)
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const tasks = await prisma.task.findMany({
    include: { assignee: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin</h1>
            <p className="text-sm text-slate-500">Rekap semua disposisi tugas ke tim</p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors border border-slate-200">
              Kembali ke Form
            </Link>
            <a href="/api/export" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Excel
            </a>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Judul Tugas</th>
                <th className="px-6 py-4 font-semibold">Disposisi Ke</th>
                <th className="px-6 py-4 font-semibold">Follow Up</th>
                <th className="px-6 py-4 font-semibold">Lampiran</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">Belum ada data tugas yang masuk.</td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{task.createdAt.toLocaleDateString("id-ID")}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                    <td className="px-6 py-4">{task.assignee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.dueDate.toLocaleDateString("id-ID")}</td>
                    <td className="px-6 py-4">
                      {task.attachmentUrl ? (
                        <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Lihat File</a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}