// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hapus data dummy sebelumnya
  await prisma.taskLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // Data User Asli Kantor Lu
  const usersData = [
    { nip: 'ABC', name: 'Andreanne B Christie', phone: '62811111111', role: Role.DIREKSI }, // Kepala Departemen (Satu-satunya pemberi tugas)
    { nip: 'FER', name: 'Dian Ferdian', phone: '62811111112', role: Role.STAF },
    { nip: 'NOV', name: 'Novianti Siswandi', phone: '62811111113', role: Role.STAF },
    { nip: 'MAU', name: 'Maulina Ayu Arini', phone: '62811111114', role: Role.STAF },
    { nip: 'ASM', name: 'Anisa Salsabila M', phone: '62811111115', role: Role.STAF },
    { nip: 'MLK', name: 'Malik Alfazari', phone: '62811111116', role: Role.STAF },
    { nip: 'IND', name: 'Indra Dwi Ananda', phone: '62811111117', role: Role.ADMIN }, // Lu gue jadiin ADMIN biar bisa atur user
    { nip: 'RML', name: 'Rani Marlia Lubis', phone: '62811111118', role: Role.STAF },
    { nip: 'GES', name: 'Ginanjar Eka Saputra', phone: '62811111119', role: Role.STAF },
    { nip: 'RAP', name: 'Rangga Pradipta', phone: '62811111120', role: Role.STAF },
    { nip: 'YNS', name: 'Yuni Setiawaty', phone: '62811111121', role: Role.STAF },
    { nip: 'IDH', name: 'Intan Dwi Hidayati', phone: '62811111122', role: Role.STAF },
    { nip: 'AND', name: 'Andhika Meviantama', phone: '62811111123', role: Role.STAF },
    { nip: 'MWS', name: 'Marcus Williams', phone: '62811111124', role: Role.STAF },
    { nip: 'HEN', name: 'Hendrik Burhan', phone: '62811111125', role: Role.STAF },
    { nip: 'RIN', name: 'Kamerina', phone: '62811111126', role: Role.STAF },
    { nip: 'RKS', name: 'Ruri Kartika Sari', phone: '62811111127', role: Role.STAF },
    { nip: 'ETK', name: 'Etik Fikria Zulfa', phone: '62811111128', role: Role.STAF },
  ];

  console.log('Menyiapkan data karyawan baru...');
  
  for (const u of usersData) {
    await prisma.user.upsert({
      where: { nip: u.nip }, // Kita tetep pakai kolom DB "nip", tapi isinya Inisial
      update: {},
      create: {
        nip: u.nip,
        name: u.name,
        password: defaultPassword,
        phone: u.phone,
        role: u.role,
      },
    });
  }

  console.log('✅ Semua user berhasil dimasukkan! Password default: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });