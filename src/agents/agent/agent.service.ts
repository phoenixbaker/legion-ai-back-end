import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Agent, Message } from '@prisma/client';
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionDeveloperMessageParam,
  ChatCompletionFunctionMessageParam,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionSystemMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat';
import { ToolsService } from '../tools/tools.service';
import { OpenaiService } from '../openai/openai.service';
import { FullAgent } from './types/full-agent.type';
import { TemplateService } from '../template/template.service';

@Injectable()
export class AgentService {
  constructor(
    private prisma: PrismaService,
    private toolsService: ToolsService,
    private openai: OpenaiService,
    private templateService: TemplateService,
  ) {}

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

  public async sendMessage(
    agentId: string,
    message: string | null,
    currentRetries: number = 0,
  ) {
    if (message) await this.saveUserMessage(agentId, message);

    const agent = await this.getAgent(agentId);
    if (!agent) throw new Error('Agent not found');

    const messages = this.formatMessageHistory(agent.messages);
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
      console.log({ response });
      throw new Error(`No choices returned from OpenAI API`);
    }
    const assistantMessage = response.choices[0].message;
    await this.saveAssistantMessage(agentId, assistantMessage);

    const { tool_calls } = assistantMessage;
    if (tool_calls && tool_calls.length > 0 && currentRetries < 3) {
      await this.handleToolCalls(tool_calls, agentId);
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

  private async handleToolCalls(
    toolCalls: ChatCompletionMessageToolCall[],
    agentId: string,
  ) {
    const toolCallResults = await Promise.all(
      toolCalls.map((toolCall) => this.toolsService.executeTool(toolCall)),
    );

    toolCallResults.forEach((result, index) =>
      this.saveToolCallResult(result, toolCalls[index].id, agentId),
    );
  }

  private async saveToolCallResult(
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

  private formatMessageHistory(
    messages: Message[],
  ): ChatCompletionMessageParam[] {
    return messages.map((message): ChatCompletionMessageParam => {
      switch (message.role as ChatCompletionMessageParam['role']) {
        case 'user':
          return {
            role: message.role,
            content: message.content,
          } as ChatCompletionUserMessageParam;
        case 'assistant':
          return {
            role: message.role,
            content: message.content,
            audio: (message.audio as any) || undefined,
            refusal: message.refusal || undefined,
            tool_calls: (message.tool_calls as any) || undefined,
          } as ChatCompletionAssistantMessageParam;
        case 'tool':
          return {
            role: message.role as any,
            content: message.content,
            tool_call_id: message.tool_call_id,
          } as ChatCompletionToolMessageParam;
        case 'system':
          return {
            role: message.role as any,
            content: message.content,
          } as ChatCompletionSystemMessageParam;
        case 'developer':
          return {
            role: message.role as any,
            content: message.content,
          } as ChatCompletionDeveloperMessageParam;
        case 'function':
          return {
            role: message.role as any,
            content: message.content,
          } as ChatCompletionFunctionMessageParam;
      }
    });
  }
}
