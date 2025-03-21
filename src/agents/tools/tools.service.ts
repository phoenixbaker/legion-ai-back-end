import { Injectable } from '@nestjs/common';
import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources/chat';

export type ToolFunction = (args: any) => Promise<any>;

@Injectable()
export class ToolsService {
  private toolDefinitions: Record<string, ChatCompletionTool> = {};
  private globalToolMap: Record<string, ToolFunction> = {};

  constructor() {
    this.toolDefinitions = {
      'say-hi': {
        type: 'function',
        function: {
          name: 'say-hi',
        },
      },
      'say-bye': {
        type: 'function',
        function: {
          name: 'say-bye',
        },
      },
    };

    this.globalToolMap = {
      'say-hi': async (args: any) => {
        console.log('Hi from tool call');
        return `Hi ${args.query}`;
      },
      'say-bye': async (args: any) => {
        console.log('Bye from tool call');
        return `Bye ${args.query}`;
      },
    };
  }

  public registerTool(
    name: string,
    toolFunction: ToolFunction,
    chatCompletionTool: ChatCompletionTool,
  ) {
    if (name !== chatCompletionTool.function.name) {
      throw new Error('tool name must match the function name');
    }
    this.globalToolMap[name] = toolFunction;
    this.toolDefinitions[name] = chatCompletionTool;
  }

  public getTools(tools: string[]) {
    return tools.map((tool) => this.toolDefinitions[tool]);
  }

  public async executeTool(tool: ChatCompletionMessageToolCall) {
    const toolCall = tool.function;
    const toolName = toolCall.name;
    const toolArgs = JSON.parse(toolCall.arguments);

    const toolFunction = this.globalToolMap[toolName];
    return toolFunction(toolArgs);
  }
}
