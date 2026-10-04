import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Analysis Categories
  const kromatografi = await prisma.analysisCategory.upsert({
    where: { name: 'Kromatografi' },
    update: {},
    create: { name: 'Kromatografi' },
  });

  const elektronMikroskop = await prisma.analysisCategory.upsert({
    where: { name: 'Elektron Mikroskobu' },
    update: {},
    create: { name: 'Elektron Mikroskobu' },
  });

  const mekanikTest = await prisma.analysisCategory.upsert({
    where: { name: 'Mekanik Test' },
    update: {},
    create: { name: 'Mekanik Test' },
  });

  const molekulerSpektroskopi = await prisma.analysisCategory.upsert({
    where: { name: 'Moleküler Spektroskopi' },
    update: {},
    create: { name: 'Moleküler Spektroskopi' },
  });

  const raman = await prisma.analysisCategory.upsert({
    where: { name: 'Raman' },
    update: {},
    create: { name: 'Raman' },
  });

  const elementelSpektroskopi = await prisma.analysisCategory.upsert({
    where: { name: 'Elementel Spektroskopi' },
    update: {},
    create: { name: 'Elementel Spektroskopi' },
  });

  // Create Analysis Types
  await prisma.analysisType.createMany({
    data: [
      { categoryId: kromatografi.id, name: 'HPLC', price: 500.00 },
      { categoryId: kromatografi.id, name: 'GC-MS', price: 600.00 },
      { categoryId: kromatografi.id, name: 'LC-MS', price: 700.00 },
      { categoryId: elektronMikroskop.id, name: 'SEM', price: 800.00 },
      { categoryId: elektronMikroskop.id, name: 'TEM', price: 900.00 },
      { categoryId: mekanikTest.id, name: 'Tensil Test', price: 300.00 },
      { categoryId: mekanikTest.id, name: 'Sertlik Test', price: 250.00 },
      { categoryId: molekulerSpektroskopi.id, name: 'FTIR', price: 400.00 },
      { categoryId: molekulerSpektroskopi.id, name: 'NMR', price: 1000.00 },
      { categoryId: raman.id, name: 'Raman Spektroskopi', price: 450.00 },
      { categoryId: elementelSpektroskopi.id, name: 'AAS-ALEV', price: 350.00 },
      { categoryId: elementelSpektroskopi.id, name: 'AAS-GRAFIT', price: 300.00 },
      { categoryId: elementelSpektroskopi.id, name: 'ICP-MS', price: 1200.00 },
      { categoryId: elementelSpektroskopi.id, name: 'ICP-OES', price: 800.00 },
      { categoryId: elementelSpektroskopi.id, name: 'XRF', price: 550.00 },
    ],
    skipDuplicates: true,
  });

  console.log('Analysis categories and types seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
