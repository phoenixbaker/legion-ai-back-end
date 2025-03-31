import { Test, TestingModule } from '@nestjs/testing';
import { ToolsService } from './tools.service';
import { ChatCompletionMessageToolCall } from 'openai/resources/index';

describe('ToolsService', () => {
  let service: ToolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolsService],
    }).compile();

    service = module.get<ToolsService>(ToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get tools', () => {
    const result = service.getTools(['execute-cli']);

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('function');
    expect(result[0].function.name).toBe('execute-cli');
  });

  it('should register a tool', () => {
    service.registerTool('mock-tool', () => Promise.resolve('mock-result'), {
      type: 'function',
      function: {
        name: 'mock-tool',
      },
    });

    expect(service.getTools(['mock-tool'])).toBeDefined();
    expect(service.getTools(['mock-tool']).length).toBe(1);
    expect(service.getTools(['mock-tool'])[0].type).toBe('function');
    expect(service.getTools(['mock-tool'])[0].function.name).toBe('mock-tool');
  });

  it('should execute a tool', async () => {
    service.registerTool('mock-tool', () => Promise.resolve('mock-result'), {
      type: 'function',
      function: {
        name: 'mock-tool',
      },
    });

    const result = await service.executeTool({
      type: 'function',
      function: {
        name: 'mock-tool',
        arguments: '{}',
      },
    } as ChatCompletionMessageToolCall);

    expect(result).toBeDefined();
    expect(result).toBe('mock-result');
  });
});
