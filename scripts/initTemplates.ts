import { AgentTemplate, PrismaClient } from '@prisma/client';

import { config } from 'dotenv';
config();

const baseAgentTemplates: Omit<AgentTemplate, 'createdAt' | 'updatedAt'>[] = [
  {
    id: '67ddf9f2d00bfe7403bffadf',
    name: 'Project Manager',
    systemPrompt: 'You are a helpful assistant.',

    //     systemPrompt: `You are a helpful assistant. When using tools:
    // 1. Always explain what you're doing before using a tool
    // 2. After getting tool results, incorporate them into your response in a natural way
    // 3. If a tool returns data, use that data to answer the user's question

    model: 'deepseek/deepseek-r1-distill-llama-70b',
    temperature: 0.5,
    tools: ['say-hi'],
  },
];

async function main() {
  const prisma = new PrismaClient();

  // Use Promise.all to properly await all operations
  await Promise.all(
    baseAgentTemplates.map((template) =>
      prisma.agentTemplate.create({
        data: template,
      }),
    ),
  );

  console.log('Agent templates created successfully');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
