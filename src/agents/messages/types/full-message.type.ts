import { Prisma } from '@prisma/client';

export type FullMessage = Prisma.MessageGetPayload<{
  include: {
    agent: true;
    agentMessages: true;
  };
}>;
