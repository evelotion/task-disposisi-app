// src/app/api/tasks/[taskNumber]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Ambil detail 1 tugas beserta riwayat log-nya
export async function GET(req: Request, { params }: { params: { taskNumber: string } }) {
  try {
    const task = await prisma.task.findUnique({
      where: { taskNumber: params.taskNumber },
      include: {
        assignee: true,
        logs: {
          include: { user: true }, // Tarik data siapa yang nulis log
          orderBy: { createdAt: 'asc' } // Urutkan dari yang paling lama ke baru
        }
      }
    });

    if (!task) return NextResponse.json({ error: 'Task tidak ditemukan' }, { status: 404 });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data task' }, { status: 500 });
  }
}

// POST: Tambah laporan progress ke tugas ini
export async function POST(req: Request, { params }: { params: { taskNumber: string } }) {
  try {
    const body = await req.json();
    const { message, status, userId } = body;

    const task = await prisma.task.findUnique({
      where: { taskNumber: params.taskNumber }
    });

    if (!task) return NextResponse.json({ error: 'Task tidak ditemukan' }, { status: 404 });

    // 1. Simpan pesan ke tabel TaskLog
    const newLog = await prisma.taskLog.create({
      data: {
        message,
        taskId: task.id,
        userId: userId
      }
    });

    // 2. Update status tugas utama (kalau staf milih status baru)
    if (status && status !== task.status) {
      await prisma.task.update({
        where: { id: task.id },
        data: { status }
      });
    }

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah progress' }, { status: 500 });
  }
}