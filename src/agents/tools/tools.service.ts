import { Injectable } from '@nestjs/common';
import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources/chat';
import { exec } from 'child_process';
import axios from 'axios';

export type ToolFunction = (args: any) => Promise<any>;

@Injectable()
export class ToolsService {
  private toolDefinitions: Record<string, ChatCompletionTool> = {};
  private globalToolMap: Record<string, ToolFunction> = {};

  constructor() {
    this.toolDefinitions = {
      'execute-cli': {
        type: 'function',
        function: {
          name: 'execute-cli',
          description:
            'Execute a command line instruction in a controlled environment',
          parameters: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'The CLI command to execute',
              },
              workingDirectory: {
                type: 'string',
                description: 'Optional directory to execute the command in',
              },
            },
            required: ['command'],
          },
        },
      },
      'web-search': {
        type: 'function',
        function: {
          name: 'web-search',
          description: 'Search the web for information',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query to look up',
              },
            },
            required: ['query'],
          },
        },
      },
      'api-call': {
        type: 'function',
        function: {
          name: 'api-call',
          description: 'Make API calls to external services',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The URL to call',
              },
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                description: 'The HTTP method to use',
              },
              body: {
                type: 'object',
                description:
                  'Optional request body for POST, PUT, PATCH requests',
              },
              headers: {
                type: 'object',
                description: 'Optional headers for the request',
              },
            },
            required: ['url', 'method'],
          },
        },
      },
      'agent-communication': {
        type: 'function',
        function: {
          name: 'agent-communication',
          description: 'Communicate with another agent in the system',
          parameters: {
            type: 'object',
            properties: {
              agentId: {
                type: 'string',
                description: 'The ID of the agent to communicate with',
              },
              message: {
                type: 'string',
                description: 'The message to send to the agent',
              },
              attachments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      description:
                        'The type of attachment (file, image, code, etc.)',
                    },
                    content: {
                      type: 'string',
                      description: 'The content or reference to the attachment',
                    },
                  },
                },
                description: 'Optional attachments to include with the message',
              },
            },
            required: ['agentId', 'message'],
          },
        },
      },
    };

    this.globalToolMap = {
      'execute-cli': async (args: any) => {
        const { command, workingDirectory } = args;

        // Security check - implement more robust security measures here
        // This is just a basic example
        if (command.includes('rm -rf') || command.includes('sudo')) {
          return { error: 'Potentially dangerous command rejected' };
        }

        return new Promise((resolve) => {
          exec(
            command,
            {
              cwd: workingDirectory || process.cwd(),
              maxBuffer: 1024 * 1024 * 10,
            },
            (error, stdout, stderr) => {
              if (error) {
                resolve({ error: error.message, stderr });
                return;
              }
              resolve({ stdout, stderr });
            },
          );
        });
      },

      'web-search': async (args: any) => {
        const { query } = args;

        try {
          // Implement search functionality - this is a placeholder
          // You should integrate with a search API like Google Search API or Bing Search API
          console.log(`Searching for: ${query}`);

          // Placeholder response - replace with actual search API integration
          return {
            results: `Search results for: ${query}`,
            message:
              'Note: This is a placeholder. Implement actual search API integration.',
          };
        } catch (error) {
          return { error: error.message };
        }
      },

      'api-call': async (args: any) => {
        const { url, method, body, headers } = args;

        try {
          let response;
          switch (method.toUpperCase()) {
            case 'GET':
              response = await axios.get(url, { headers });
              break;
            case 'POST':
              response = await axios.post(url, body, { headers });
              break;
            case 'PUT':
              response = await axios.put(url, body, { headers });
              break;
            case 'DELETE':
              response = await axios.delete(url, { headers });
              break;
            case 'PATCH':
              response = await axios.patch(url, body, { headers });
              break;
            default:
              return { error: 'Unsupported HTTP method' };
          }

          return {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
          };
        } catch (error) {
          return {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
          };
        }
      },

      'agent-communication': async (args: any) => {
        const { agentId, message, attachments } = args;

        // This should connect to your agent communication system
        console.log(`Sending message to agent ${agentId}: ${message}`);

        // Placeholder implementation - replace with actual agent communication logic
        try {
          // You'll need to implement this based on your agent architecture
          // const response = await yourAgentService.sendMessage(agentId, message, attachments);
          // return response;

          return {
            success: true,
            agentId,
            message: 'Message delivered successfully',
          };
        } catch (error) {
          return { error: error.message };
        }
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
