import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Agent, Message } from '@prisma/client';
import {
  ChatCompletion,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionToolChoiceOption,
  ChatCompletionToolMessageParam,
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
    console.log(
      messages.map((m) => {
        // @ts-ignore
        return m.tool_calls;
      }),
    );
    if (message) this.saveMessage(agentId, message);

    let tools = this.toolsService.getTools(agent.template.tools);

    if (currentRetries >= 3) tools = undefined as any;

    const response = await this.openai.chat.completions.create({
      model: agent.template.model,
      temperature: agent.template.temperature ?? 0.7,
      tool_choice: 'auto',
      messages,
      tools,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No choices returned from OpenAI API');
    }

    const assistantMessage = response.choices[0].message;
    const toolCalls = assistantMessage.tool_calls;
    const content = assistantMessage.content;

    if (toolCalls && toolCalls.length > 0 && currentRetries < 3) {
      await this.prisma.message.create({
        data: {
          role: 'assistant',
          content: assistantMessage.content || '',
          agentId,
          tool_calls: (assistantMessage.tool_calls as any) || [],
        },
      });
      await this.handleToolCalls(toolCalls, agentId);
      return this.sendMessage(agentId, '', true, currentRetries + 1);
    }

    if (content) {
      await this.prisma.message.create({
        data: {
          role: 'assistant',
          content,
          agentId,
        },
      });
    }

    return {
      success: true,
    };
  }

  private async saveMessage(agentId: string, message: string) {
    await this.prisma.message.create({
      data: {
        agentId,
        content: message,
        role: 'user',
      },
    });
  }

  private async handleToolCalls(
    toolCalls: ChatCompletionMessageToolCall[],
    agentId: string,
  ) {
    const toolCallResults = await Promise.all(
      toolCalls.map((toolCall) => this.toolsService.executeTool(toolCall)),
    );

    // Create tool response messages with proper tool_call_id references
    const toolMessages = toolCallResults.map((result, index) => {
      return {
        content: JSON.stringify(result),
        role: 'tool',
        toolName: toolCalls[index].function.name,
        tool_call_id: toolCalls[index].id,
        agentId,
      };
    });

    // Store all tool response messages together to maintain order
    await this.prisma.message.createMany({
      data: toolMessages,
    });
  }

  private formatMessages(
    messages: Message[],
    newMessage: string | null,
    toolCalled: boolean = false,
  ) {
    // If tool was called and there's no new message, just return the message history
    if (toolCalled) {
      // Check the most recent messages to see if there are any tool calls
      // This helps the model understand the context of what has already been done
      const formattedHistory = this.formatMessageHistory(messages);

      // If this is a continuation after tool calls, make sure we have at least:
      // 1. The original user message
      // 2. The assistant message that triggered the tool
      // 3. The tool response message(s)

      return formattedHistory;
    }

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
    return messages.map((message): ChatCompletionMessageParam => {
      if (message.role === 'tool') {
        return {
          role: message.role,
          content: message.content,
          tool_call_id: message.tool_call_id,
        } as ChatCompletionToolMessageParam;
      }
      return {
        role: message.role as 'user' | 'assistant',
        content: message.content,
        tool_calls:
          message.tool_calls.length > 0
            ? (message.tool_calls as any)
            : undefined,
      };
    });
  }
}
