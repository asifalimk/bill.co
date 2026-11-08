import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const username = (process.env.ADMIN_USERNAME ?? 'admin').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = (process.env.ADMIN_NAME ?? 'Store Administrator').trim();

  if (!username) {
    throw new Error('ADMIN_USERNAME must not be empty.');
  }
  if (!name) {
    throw new Error('ADMIN_NAME must not be empty.');
  }
  if (!password) {
    throw new Error('Set ADMIN_PASSWORD before seeding.');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters before seeding.');
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.upsert({
    where: { username },
    update: { name, role: UserRole.ADMIN },
    create: {
      username,
      password_hash: passwordHash,
      name,
      role: UserRole.ADMIN,
    },
  });
  console.log(`Administrator account "${username}" is ready.`);
}

main()
  .catch((error: unknown) => {
    console.error('Unable to seed administrator account.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
