import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Agent, Message } from '@prisma/client';
import {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionToolChoiceOption,
} from 'openai/resources/chat';
import { ToolsService } from '../tools/tools.service';
import { OpenaiService } from '../openai/openai.service';

@Injectable()
export class AgentService {
  constructor(
    private prisma: PrismaService,
    private toolsService: ToolsService,
    private openai: OpenaiService,
  ) {}

  public async getAgent(id: string): Promise<Agent | null> {
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
    });
  }

  public async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    return this.prisma.agent.update({
      where: { id },
      data,
    });
  }

  public async createAgent(
    templateId: string,
    projectId: string,
  ): Promise<Agent> {
    return this.prisma.agent.create({
      data: {
        templateId,
        projectId,
      },
    });
  }

  public async sendMessage(
    agentId: string,
    message: string | null,
    toolCalled: boolean = false,
    currentRetries: number = 0,
  ) {
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

    const messages = this.formatMessages(agent.messages, message, toolCalled);
    const tools = this.toolsService.getTools(agent.template.tools);

    let tool_choice: ChatCompletionToolChoiceOption = 'auto';
    if (currentRetries >= 3) {
      tool_choice = 'none';
    }

    const response = await this.openai.chat.completions.create({
      model: agent.template.model,
      temperature: agent.template.temperature ?? 0.7,
      tool_choice,
      messages,
      tools,
    });

    const assistantMessage = response.choices[0].message;
    const toolCalls = assistantMessage.tool_calls;
    const content = assistantMessage.content;

    if (content) {
      await this.prisma.message.create({
        data: {
          role: 'assistant',
          content,
          agentId,
        },
      });
    }

    if (toolCalls && toolCalls.length > 0 && currentRetries < 3) {
      this.handleToolCalls(toolCalls, agentId);
      return this.sendMessage(agentId, '', true, currentRetries + 1);
    }
    return;
  }

  private async handleToolCalls(
    toolCalls: ChatCompletionMessageToolCall[],
    agentId: string,
  ) {
    const toolCallResults = await Promise.all(
      toolCalls.map((toolCall) => this.toolsService.executeTool(toolCall)),
    );

    const toolMessages = toolCallResults.map((result, index) => {
      return {
        content: JSON.stringify(result),
        role: 'tool',
        toolName: toolCalls[index].function.name,
        agentId,
      };
    });

    await this.prisma.message.createMany({
      data: toolMessages,
    });
  }

  private formatMessages(
    messages: Message[],
    newMessage: string | null,
    toolCalled: boolean = false,
  ) {
    if (toolCalled) return this.formatMessageHistory(messages);
    if (!newMessage)
      throw new Error('New message is required if tool has not been called');

    return this.formatNewMessageWithHistory(messages, newMessage);
  }

  private formatNewMessageWithHistory(
    messageHistory: Message[],
    newMessage: string,
  ): ChatCompletionMessageParam[] {
    const formattedMessageHistory = this.formatMessageHistory(messageHistory);
    return [...formattedMessageHistory, { role: 'user', content: newMessage }];
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
