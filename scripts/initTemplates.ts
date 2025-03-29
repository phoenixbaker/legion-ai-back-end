import { AgentTemplate, PrismaClient } from '@prisma/client';

import { config } from 'dotenv';
config();

const baseAgentTemplates: Omit<
  AgentTemplate,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  {
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

const prisma = new PrismaClient();

baseAgentTemplates.forEach(async (template) => {
  await prisma.agentTemplate.create({
    data: template,
  });
});
