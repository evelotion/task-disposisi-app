// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { nip } = await req.json();

    // Cari karyawan berdasarkan NIP (Pastikan huruf besar/kecil nggak masalah)
    const user = await prisma.user.findUnique({
      where: { nip: nip.toUpperCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'NIP tidak ditemukan. Silakan hubungi Admin.' },
        { status: 404 }
      );
    }

    // Kalau ketemu, kita kasih data user-nya ke frontend untuk disimpan di session/localstorage
    return NextResponse.json({
      id: user.id,
      nip: user.nip,
      name: user.name,
      role: user.role,
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}