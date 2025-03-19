import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentTemplate } from '@prisma/client';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  public async getAgentTemplateById(
    _id: string,
  ): Promise<AgentTemplate | null> {
    return await this.prisma.agentTemplate.findUnique({
      where: { id: _id },
    });
  }

  public async createAgentTemplate(
    config: AgentTemplate,
  ): Promise<AgentTemplate> {
    return await this.prisma.agentTemplate.create({
      data: config,
    });
  }
}
