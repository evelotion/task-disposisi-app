// prisma/seed.ts
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = [
    // Akun buat lu sebagai Developer/Admin
    { nip: 'ADMIN01', name: 'Indra (Admin)', phone: '6281234567890', role: 'ADMIN' },
    
    // Akun buat Bos lu (Direksi)
    { nip: 'BOS01', name: 'Bapak Direktur', phone: '628111111111', role: 'DIREKSI' },
    
    // Akun Staf
    { nip: 'STAF01', name: 'Budi (Operasional)', phone: '628222222222', role: 'STAF' },
    { nip: 'STF02', name: 'Siska (Admin)', phone: '628333333333', role: 'STAF' },
  ]

  console.log('Sedang memasukkan data user awal...')

  for (const u of users) {
    // Pakai upsert biar kalau di-run berkali-kali nggak error duplikat
    await prisma.user.upsert({
      where: { nip: u.nip },
      update: {},
      create: u,
    })
  }

  console.log('Seeding selesai! Data user berhasil dibuat.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })