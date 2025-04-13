import { PrismaClient } from '@prisma/client';

import { config } from 'dotenv';
config();

async function main() {
  const prisma = new PrismaClient();
  await prisma.project.create({
    data: {
      name: 'Test Project',
      containerId: '123',
      id: '67de8c6f98f0ee0db7661c2e',
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
