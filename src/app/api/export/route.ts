// src/app/api/export/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Tarik semua data dari database sekaligus dengan nama stafnya
    const tasks = await prisma.task.findMany({
      include: { assignee: true },
      orderBy: { createdAt: 'desc' } // Urutkan dari yang terbaru
    });

    // Buat file Excel baru
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Disposisi');

    // Tentukan kolom-kolomnya
    worksheet.columns = [
      { header: 'Tanggal Dibuat', key: 'createdAt', width: 20 },
      { header: 'Judul Tugas', key: 'title', width: 35 },
      { header: 'Disposisi Ke', key: 'assignee', width: 25 },
      { header: 'Follow Up Tanggal', key: 'dueDate', width: 20 },
      { header: 'Catatan / Detail', key: 'description', width: 45 },
      { header: 'Link Lampiran', key: 'attachmentUrl', width: 50 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Masukkan data ke baris Excel
    tasks.forEach(task => {
      worksheet.addRow({
        createdAt: task.createdAt.toLocaleDateString('id-ID'),
        title: task.title,
        assignee: task.assignee.name,
        dueDate: task.dueDate.toLocaleDateString('id-ID'),
        description: task.description || '-',
        attachmentUrl: task.attachmentUrl || '-',
        status: task.status,
      });
    });

    // Bikin header Excelnya jadi tebal (bold)
    worksheet.getRow(1).font = { bold: true };

    // Proses jadi file yang bisa didownload
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="Rekap_Disposisi.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal export excel' }, { status: 500 });
  }
}