// src/app/api/users/change-password/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Enkripsi password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update ke database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password berhasil diubah' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}