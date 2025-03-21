import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAI } from 'openai';
import { Message } from '@prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { ToolsService } from '../tools/tools.service';

@Injectable()
export class AgentService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private toolsService: ToolsService,
  ) {}

  public async createAgent(templateId: string, projectId: string) {
    return this.prisma.agent.create({
      data: {
        templateId,
        projectId,
        tools: ['say-hi', 'say-bye'],
      },
    });
  }

  public async sendMessage(agentId: string, message: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        messages: true,
        template: true,
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    const messageHistory = this.formatMessageHistory(agent.messages);
    const tools = this.toolsService.getTools(agent.tools);

    const response = await this.openai.chat.completions.create({
      model: agent.template.model,
      messages: messageHistory,
      tools: tools,
      tool_choice: 'auto',
    });

    const toolCalls = response.choices[0].message.tool_calls;

    if (toolCalls) {
      await Promise.all(
        toolCalls.map((toolCall) => this.toolsService.executeTool(toolCall)),
      );
    }

    return;
  }

  private formatMessageHistory(
    messages: Message[],
  ): ChatCompletionMessageParam[] {
    return messages.map(
      (message) =>
        ({
          role: message.role,
          content: message.content,
        }) as ChatCompletionMessageParam,
    );
  }
}
