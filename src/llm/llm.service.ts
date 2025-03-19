import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '../config/config.service';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { Tool } from '@langchain/core/tools';
import { AgentTemplate } from '@prisma/client';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private model: BaseChatModel;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get the underlying LLM model
   */
  getModel(): BaseChatModel {
    return this.model;
  }

  /**
   * Simple method to generate a chat completion
   * @param prompt Text prompt to send to the model
   * @returns The model's response as a string
   */
  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.model.invoke(prompt);
      return response.content.toString();
    } catch (error) {
      this.logger.error(
        `Error generating LLM response: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate a response from a conversation history
   * @param messages Array of messages in the conversation
   * @returns The model's response
   */
  async chat(messages: BaseMessage[]): Promise<AIMessage> {
    try {
      return await this.model.invoke(messages);
    } catch (error) {
      this.logger.error(`Error in chat: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a message from human input
   * @param content The content of the message
   * @returns A HumanMessage object
   */
  createHumanMessage(content: string): HumanMessage {
    return new HumanMessage(content);
  }

  /**
   * Create a system message
   * @param content The content of the message
   * @returns A SystemMessage object
   */
  createSystemMessage(content: string): SystemMessage {
    return new SystemMessage(content);
  }

  /**
   * Execute a conversation with tool calling
   * @param systemPrompt System prompt for the conversation
   * @param userPrompt User's query
   * @param tools Array of tools
   * @param options Additional options for the model
   * @returns The model's response
   */
  async executeWithTools(
    systemPrompt: string,
    userPrompt: string,
    tools: Tool[],
    options: {
      temperature?: number;
      modelName?: string;
      maxTokens?: number;
      forceTool?: boolean;
    } = {},
  ): Promise<AIMessage> {
    try {
      const llm = this.createToolCallingModel(tools, options);

      const chatPrompt = ChatPromptTemplate.fromMessages([
        ['system', systemPrompt],
        ['human', userPrompt],
      ]);

      const chain = chatPrompt.pipe(llm);

      return await chain.invoke({});
    } catch (error) {
      this.logger.error(
        `Error executing with tools: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
