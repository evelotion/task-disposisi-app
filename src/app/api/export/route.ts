// src/app/api/export/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Tambahin 'logs' (riwayat progress) di sini 🔥
    const tasks = await prisma.task.findMany({
      include: { 
        assignee: true,
        logs: {
          include: { user: true },
          orderBy: { createdAt: 'asc' } // Urut dari laporan terlama ke terbaru
        }
      },
      orderBy: { createdAt: 'desc' } 
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Disposisi');

    // 2. Tambah Kolom 'Riwayat Progress' 🔥
    worksheet.columns = [
      { header: 'No. Tugas', key: 'taskNumber', width: 20 },
      { header: 'Tanggal Dibuat', key: 'createdAt', width: 20 },
      { header: 'Task', key: 'title', width: 35 },
      { header: 'Lokasi', key: 'location', width: 15 },
      { header: 'Disposisi Ke', key: 'assignee', width: 25 },
      { header: 'Catatan / Detail', key: 'description', width: 45 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Riwayat Progress', key: 'history', width: 60 }, // <-- KOLOM BARU
      { header: 'Link Lampiran', key: 'attachmentUrl', width: 50 },
    ];

    tasks.forEach(task => {
      // 3. Susun isi chat-nya biar rapi di dalam 1 sel Excel 🔥
      const historyText = task.logs.length > 0 
        ? task.logs.map(log => `[${log.createdAt.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}] ${log.user.name}: ${log.message}`).join('\n\n')
        : 'Belum ada progress/laporan';

      const row = worksheet.addRow({
        taskNumber: task.taskNumber,
        createdAt: task.createdAt.toLocaleDateString('id-ID'),
        title: task.title,
        location: task.location,
        assignee: task.assignee.name,
        description: task.description || '-',
        status: task.status,
        history: historyText, // <-- MASUKIN DATA CHAT KE SINI
        attachmentUrl: task.attachmentUrl || '-',
      });

      // Bikin teks otomatis wrap (turun ke bawah) di kolom deskripsi & progress
      row.getCell('description').alignment = { wrapText: true, vertical: 'top' };
      row.getCell('history').alignment = { wrapText: true, vertical: 'top' };
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="Rekap_Disposisi_Lengkap.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal export excel' }, { status: 500 });
  }
}