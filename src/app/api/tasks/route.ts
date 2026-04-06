// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, dueDate, attachmentUrl, assigneeId } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate), // Pastikan formatnya ISO-8601 dari frontend
        attachmentUrl,
        assigneeId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan tugas' }, { status: 500 });
  }
}