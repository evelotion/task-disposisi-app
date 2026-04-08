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
    { nip: 'ABC', name: 'Andreanne B Christie', phone: '62818415996', role: Role.KADEP }, // Kepala Departemen (Satu-satunya pemberi tugas)
    { nip: 'FER', name: 'Dian Ferdian', phone: '628567076858', role: Role.STAF },
    { nip: 'NOV', name: 'Novianti Siswandi', phone: '6281385270839', role: Role.STAF },
    { nip: 'MAU', name: 'Maulina Ayu Arini', phone: '6285692876080', role: Role.STAF },
    { nip: 'ASM', name: 'Anisa Salsabila M', phone: '6287726120957', role: Role.STAF },
    { nip: 'MLK', name: 'Malik Alfazari', phone: '6281226840858', role: Role.STAF },
    { nip: 'IND', name: 'Indra Dwi Ananda', phone: '6285179677792', role: Role.STAF }, // Lu gue jadiin ADMIN biar bisa atur user
    { nip: 'RML', name: 'Rani Marlia Lubis', phone: '6281315339728', role: Role.STAF },
    { nip: 'GES', name: 'Ginanjar Eka Saputra', phone: '6287885463444', role: Role.STAF },
    { nip: 'RAP', name: 'Rangga Pradipta', phone: '6285731013115', role: Role.STAF },
    { nip: 'YNS', name: 'Yuni Setiawaty', phone: '628111972606', role: Role.STAF },
    { nip: 'IDH', name: 'Intan Dwi Hidayati', phone: '6285719318563', role: Role.STAF },
    { nip: 'AND', name: 'Andhika Meviantama', phone: '6285884891328', role: Role.STAF },
    { nip: 'MWS', name: 'Marcus Williams', phone: '6289636583943', role: Role.STAF },
    { nip: 'HEN', name: 'Hendrik Burhan', phone: '6281286812227', role: Role.STAF },
    { nip: 'RIN', name: 'Kamerina', phone: '6281317737283', role: Role.STAF },
    { nip: 'RKS', name: 'Ruri Kartika Sari', phone: '6281311845273', role: Role.STAF },
    { nip: 'ADM', name: 'ADMIN', phone: '6285179677792', role: Role.ADMIN },
    { nip: 'ETK', name: 'Etik Fikria Zulfa', phone: '6281326393756', role: Role.STAF },
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