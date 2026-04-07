// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fungsi untuk GET (Nanti dipakai di Dashboard)
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: { assignee: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// Fungsi POST (Terima submit dari Form)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, attachmentUrl, assigneeId, location } = body;

    // 1. GENERATOR NOMOR TASK (Contoh: TSK-260407-001)
    const today = new Date();
    const dateString = today.toISOString().slice(2, 10).replace(/-/g, ''); // Format YYMMDD
    
    // Cari hari ini udah ada berapa tugas
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const taskCountToday = await prisma.task.count({
      where: { createdAt: { gte: startOfDay } }
    });

    // Bikin nomor baru (Urutan ke berapa hari ini)
    const nextNumber = (taskCountToday + 1).toString().padStart(3, '0');
    const generatedTaskNumber = `TSK-${dateString}-${nextNumber}`;

    // 2. SIMPAN KE DATABASE
    const task = await prisma.task.create({
      data: {
        taskNumber: generatedTaskNumber,
        title,
        description,
        attachmentUrl,
        assigneeId,
        location, // Simpan data lokasi dropdown
        // dueDate udah nggak ada, kita pakai createdAt otomatis
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal menyimpan tugas' }, { status: 500 });
  }
}

// Fungsi PATCH untuk checklist/update status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update status' }, { status: 500 });
  }
}