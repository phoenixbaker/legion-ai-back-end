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
