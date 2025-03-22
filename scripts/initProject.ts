import { PrismaClient } from '@prisma/client';

import { config } from 'dotenv';
config();

async function main() {
  const prisma = new PrismaClient();
  await prisma.project.create({
    data: {
      name: 'Test Project',
    },
  });
}

main();
