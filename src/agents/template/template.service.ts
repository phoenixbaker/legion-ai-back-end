import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
    config: Omit<AgentTemplate, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AgentTemplate> {
    return await this.prisma.agentTemplate.create({
      data: config,
    });
  }
}
