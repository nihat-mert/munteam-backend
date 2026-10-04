import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@bumlab.gov.tr';
  const password = 'Admin123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      adSoyad: 'Sistem Yöneticisi',
      kurumTipi: 'KURUMSAL',
    },
  });

  console.log('Admin kullanıcısı oluşturuldu:');
  console.log('E-posta:', email);
  console.log('Şifre:', password);
  console.log('Rol:', admin.role);
}

createAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
