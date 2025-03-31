import { Prisma } from '@prisma/client';

export type FullProject = Prisma.ProjectGetPayload<{
  include: {
    agents: true;
  };
}>;
