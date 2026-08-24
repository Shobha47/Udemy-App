const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating SuperAdmin...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@udemy-clone.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@udemy-clone.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
      headline: 'Platform Administrator',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ SuperAdmin created:', superadmin.email);
  console.log('🎉 Done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });