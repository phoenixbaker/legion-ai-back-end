import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  public async createAgent(templateId: string, projectId: string) {
    return this.prisma.agent.create({
      data: {
        templateId,
        projectId,
        messages: [],
      },
    });
  }
}
