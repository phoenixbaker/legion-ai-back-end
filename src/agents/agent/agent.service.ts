import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAI } from 'openai';
import { Message } from '@prisma/client';
import {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionToolChoiceOption,
} from 'openai/resources/chat';
import { ToolsService } from '../tools/tools.service';

@Injectable()
export class AgentService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private toolsService: ToolsService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  public setOpenAIClient(client: OpenAI) {
    this.openai = client;
  }

  public async createAgent(templateId: string, projectId: string) {
    return this.prisma.agent.create({
      data: {
        templateId,
        projectId,
        tools: ['say-hi', 'say-bye'],
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
    const tools = this.toolsService.getTools(agent.tools);

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
