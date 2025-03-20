import { Injectable } from '@nestjs/common';
import { StructuredTool } from '@langchain/core/tools';

@Injectable()
export class ToolsService {
  private toolImplementations = {
    'say-hi': async (args: { query: string }) => {
      console.log('Hi from tool call');
      return `Hi ${args.query}`;
    },
  };

  public getImplementation(name: string) {
    return this.toolImplementations[name];
  }
}
