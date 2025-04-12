import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Agent } from '@prisma/client';
import { ToolsService } from '../tools/tools.service';
import { OpenaiService } from '../openai/openai.service';
import { FullAgent } from './types/full-agent.type';
import { TemplateService } from '../template/template.service';
import { LoggerService } from '../../common/logger/logger.service';
import { formatMessageHistory } from '../messages/utils';

@Injectable()
export class AgentService {
  constructor(
    private prisma: PrismaService,
    private toolsService: ToolsService,
    private openai: OpenaiService,
    private templateService: TemplateService,
    private logger: LoggerService,
  ) {
    this.logger.defaultContext = 'AgentService';
  }

  public async getAgent(id: string): Promise<FullAgent | null> {
    return this.prisma.agent.findUnique({
      where: { id },
      include: {
        template: true,
        messages: true,
        project: true,
        receivedMessages: true,
        sentMessages: true,
      },
    });
  }

  public async deleteAgent(id: string): Promise<Agent> {
    return this.prisma.agent.delete({
      where: { id },
      include: {
        messages: true,
      },
    });
  }

  public async createAgent(
    templateId: string,
    projectId: string,
  ): Promise<Agent> {
    const template =
      await this.templateService.getAgentTemplateById(templateId);
    const agent = await this.prisma.agent.create({
      data: {
        messages: {
          create: {
            role: 'system',
            content: template?.systemPrompt,
          },
        },
        template: {
          connect: {
            id: templateId,
          },
        },
        project: {
          connect: { id: projectId },
        },
      },
    });

    return agent;
  }

  public async handleAgentMessage(agentId: string) {
    const agent = await this.getAgent(agentId);
    if (!agent) throw new Error('Agent not found');

    return this.agentChatCompletion(agent);
  }

  private async agentChatCompletion(agent: FullAgent) {
    try {
      const response = await this.openai.chat.completions.create({
        model: agent.template.model,
        temperature: agent.template.temperature ?? 0.7,
        tool_choice: 'auto',
        messages: formatMessageHistory(agent.messages),
        tools: this.toolsService.getTools(agent.template.tools),
      });
      if (!response.choices || response.choices.length === 0) {
        this.logger.warn(`No choices returned from OpenAI API`);
        throw new Error(`No choices returned from OpenAI API`);
      }
      return response.choices[0].message;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
