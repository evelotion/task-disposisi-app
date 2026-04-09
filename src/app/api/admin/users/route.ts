// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    // Buang password sebelum dikirim ke frontend
    const safeUsers = users.map(({ password, ...user }) => user);
    return NextResponse.json(safeUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nip, name, password, phone, role } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: { nip, name, password: hashedPassword, phone, role }
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal buat user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus user' }, { status: 500 });
  }
}

// --- FITUR BARU: RESET PASSWORD ---
export async function PATCH(req: Request) {
  try {
    const { id, action } = await req.json();

    if (action === "reset_password") {
      // Enkripsi default password: "password123"
      const hashedPassword = await bcrypt.hash("password123", 10);
      
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
      
      return NextResponse.json({ message: "Password berhasil direset" }, { status: 200 });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal reset password" }, { status: 500 });
  }
}