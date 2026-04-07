// src/app/api/tasks/me/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: { createdAt: 'desc' },
      include: { assignee: true }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}