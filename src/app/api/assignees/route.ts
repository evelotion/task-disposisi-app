// src/app/api/assignees/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const assignees = await prisma.assignee.findMany();
    return NextResponse.json(assignees);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data staf' }, { status: 500 });
  }
}