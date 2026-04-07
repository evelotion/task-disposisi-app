// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Kita cuma narik data user yang role-nya STAF (Bos nggak mungkin disposisi ke bos)
    const stafList = await prisma.user.findMany({
      where: { role: 'STAF' },
      select: { id: true, name: true, phone: true } // Cuma ambil data yang perlu aja
    });
    return NextResponse.json(stafList);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data staf' }, { status: 500 });
  }
}