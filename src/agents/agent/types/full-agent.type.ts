import { Prisma } from '@prisma/client';

export type FullAgent = Prisma.AgentGetPayload<{
  include: {
    template: true;
    messages: true;
    project: true;
  };
}>;
