import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Delete existing admin user if exists
  await prisma.user.deleteMany({
    where: { email: 'admin@bumlab.com.tr' },
  });

  // Create new admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bumlab.com.tr',
      password: hashedPassword,
      role: Role.ADMIN,
      adSoyad: 'Admin User',
    },
  });

  console.log('Admin user created:', admin);
  console.log('Login credentials:');
  console.log('Email:', admin.email);
  console.log('Password: admin123');
  console.log('Role:', admin.role);

  // Create analysis category
  const category = await prisma.analysisCategory.upsert({
    where: { name: 'Genel Analizler' },
    update: {},
    create: {
      name: 'Genel Analizler',
    },
  });

  console.log('Analysis category created/updated:', category);

  // Create analysis types
  const analyses = await Promise.all([
    prisma.analysisType.upsert({
      where: { id: 'xrf-analysis' },
      update: {},
      create: {
        id: 'xrf-analysis',
        name: 'XRF Analizi',
        price: 500,
        categoryId: category.id,
      },
    }),
    prisma.analysisType.upsert({
      where: { id: 'sem-imaging' },
      update: {},
      create: {
        id: 'sem-imaging',
        name: 'SEM Görüntüleme',
        price: 1200,
        categoryId: category.id,
      },
    }),
    prisma.analysisType.upsert({
      where: { id: 'xrd-analysis' },
      update: {},
      create: {
        id: 'xrd-analysis',
        name: 'XRD Analizi',
        price: 800,
        categoryId: category.id,
      },
    }),
    prisma.analysisType.upsert({
      where: { id: 'icp-ms-analysis' },
      update: {},
      create: {
        id: 'icp-ms-analysis',
        name: 'ICP-MS Analizi',
        price: 1500,
        categoryId: category.id,
      },
    }),
  ]);

  console.log('Analysis types created/updated:', analyses);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
