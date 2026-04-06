// prisma/seed.ts
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Kita masukkan data tim lu di sini
  const assignees = [
    { name: 'Budi (Operasional)', phone: '628123456789' }, // Ganti dengan nomor asli
    { name: 'Siska (Admin)', phone: '628987654321' },
    { name: 'Andi (Staf)', phone: '628112233445' },
  ]

  console.log('Sedang memasukkan data staf...')

  for (const person of assignees) {
    await prisma.assignee.create({
      data: person,
    })
  }

  console.log('Seeding selesai!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })