// src/app/api/tasks/[taskNumber]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Ambil detail 1 tugas beserta riwayat log-nya
export async function GET(
  req: Request, 
  { params }: { params: Promise<{ taskNumber: string }> } // <-- Ubah jadi Promise
) {
  try {
    const { taskNumber } = await params; // <-- Wajib di-await

    const task = await prisma.task.findUnique({
      where: { taskNumber },
      include: {
        assignee: true,
        logs: {
          include: { user: true },
          orderBy: { createdAt: 'asc' } 
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
export async function POST(
  req: Request, 
  { params }: { params: Promise<{ taskNumber: string }> } // <-- Ubah jadi Promise
) {
  try {
    const { taskNumber } = await params; // <-- Wajib di-await
    const body = await req.json();
    const { message, status, userId } = body;

    const task = await prisma.task.findUnique({
      where: { taskNumber }
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

    // 2. Update status tugas utama 
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