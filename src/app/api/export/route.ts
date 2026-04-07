// src/app/api/export/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: { assignee: true },
      orderBy: { createdAt: 'desc' } 
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Disposisi');

    // Kolom Excel udah di-update pakai struktur V2.0 (Ada Nomor Task & Lokasi, dueDate dihapus)
    worksheet.columns = [
      { header: 'No. Tugas', key: 'taskNumber', width: 20 },
      { header: 'Tanggal Dibuat', key: 'createdAt', width: 20 },
      { header: 'Judul Tugas', key: 'title', width: 35 },
      { header: 'Lokasi', key: 'location', width: 15 },
      { header: 'Disposisi Ke', key: 'assignee', width: 25 },
      { header: 'Catatan / Detail', key: 'description', width: 45 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Link Lampiran', key: 'attachmentUrl', width: 50 },
    ];

    tasks.forEach(task => {
      worksheet.addRow({
        taskNumber: task.taskNumber,
        createdAt: task.createdAt.toLocaleDateString('id-ID'),
        title: task.title,
        location: task.location,
        assignee: task.assignee.name,
        description: task.description || '-',
        status: task.status,
        attachmentUrl: task.attachmentUrl || '-',
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="Rekap_Disposisi_V2.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal export excel' }, { status: 500 });
  }
}