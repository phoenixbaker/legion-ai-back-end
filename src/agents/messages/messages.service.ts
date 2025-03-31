import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Message } from '@prisma/client';
import { AgentService } from '../agent/agent.service';
import { ChatCompletionMessage } from 'openai/resources/index';
import { ToolsService } from '../tools/tools.service';
import { LoggerService } from '../../common/logger/logger.service';
import { UpdateMessageDto } from './dto';
import {
  formatMessageHistory as formatMessageHistoryUtil,
  toolCalled as toolCalledUtil,
} from './utils';
import { FullMessage } from './types';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agentService: AgentService,
    private readonly toolsService: ToolsService,
    private readonly logger: LoggerService,
  ) {
    this.logger.defaultContext = 'MessagesService';
  }

  public async deleteMessage(id: string): Promise<FullMessage> {
    return await this.prisma.message.delete({
      where: {
        id,
      },
      include: {
        agent: true,
        agentMessages: true,
      },
    });
  }

  public async updateMessage(
    id: string,
    data: UpdateMessageDto,
  ): Promise<FullMessage> {
    return await this.prisma.message.update({
      where: {
        id,
      },
      include: {
        agent: true,
        agentMessages: true,
      },
      data,
    });
  }

  public async getMessage(id: string): Promise<FullMessage | null> {
    return await this.prisma.message.findUnique({
      where: {
        id,
      },
      include: {
        agent: true,
        agentMessages: true,
      },
    });
  }

  public async getAllAgentMessages(agentId: string): Promise<FullMessage[]> {
    return await this.prisma.message.findMany({
      where: {
        agentId,
      },
      include: {
        agent: true,
        agentMessages: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  public async sendMessage(
    agentId: string,
    message: string | null,
    currentRetries: number = 0,
  ) {
    if (message) await this.saveUserMessage(agentId, message);

    const assistantMessage =
      await this.agentService.handleAgentMessage(agentId);
    await this.saveAssistantMessage(agentId, assistantMessage);

    if (this.toolCalled(assistantMessage.tool_calls)) {
      const { tool_calls: toolCalls } = assistantMessage;
      const toolCallResults =
        await this.toolsService.handleToolCalls(toolCalls);

      toolCallResults.forEach((result, index) =>
        this.saveToolMessage(result, toolCalls[index].id, agentId),
      );

      return this.sendMessage(agentId, null, currentRetries + 1);
    }

    return {
      success: true,
    };
  }

  private async saveAssistantMessage(
    agentId: string,
    message: ChatCompletionMessage,
  ) {
    await this.prisma.message.create({
      data: {
        ...message,
        audio: message.audio ? JSON.parse(JSON.stringify(message.audio)) : null,
        annotations:
          message.annotations && message.annotations.length > 0
            ? JSON.parse(JSON.stringify(message.annotations))
            : [],
        tool_calls:
          message.tool_calls && message.tool_calls.length > 0
            ? JSON.parse(JSON.stringify(message.tool_calls))
            : [],
        agent: {
          connect: {
            id: agentId,
          },
        },
      },
    });
  }

  private async saveUserMessage(agentId: string, message: string) {
    await this.prisma.message.create({
      data: {
        content: message,
        role: 'user',
        agent: {
          connect: {
            id: agentId,
          },
        },
      },
    });
  }

  private async saveToolMessage(
    result: any,
    toolCallId: string,
    agentId: string,
  ) {
    await this.prisma.message.create({
      data: {
        role: 'tool',
        content: JSON.stringify(result),
        tool_call_id: toolCallId,
        agent: {
          connect: {
            id: agentId,
          },
        },
      },
    });
  }

  public formatMessageHistory = formatMessageHistoryUtil;
  public toolCalled = toolCalledUtil;
}
