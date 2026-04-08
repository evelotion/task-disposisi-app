// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // <-- Import alat pembaca password acaknya

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { nip, password } = await req.json();

    if (!nip || !password) {
      return NextResponse.json({ error: "Inisial dan password harus diisi" }, { status: 400 });
    }

    // Cari user berdasarkan Inisial (NIP)
    const user = await prisma.user.findUnique({
      where: { nip: nip.toUpperCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "Inisial tidak ditemukan di sistem" }, { status: 401 });
    }

    // Cocokkan password yang diketik dengan password acak di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah!" }, { status: 401 });
    }

    // Kalau sukses, buang data password dari response biar aman
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem di server" }, { status: 500 });
  }
}