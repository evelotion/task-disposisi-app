import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Ambil semua data tugas untuk Dashboard Client
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

// POST: Simpan tugas baru dari form
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, dueDate, attachmentUrl, assigneeId } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        attachmentUrl,
        assigneeId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan tugas' }, { status: 500 });
  }
}

// PATCH: Update status tugas (Checklist)
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