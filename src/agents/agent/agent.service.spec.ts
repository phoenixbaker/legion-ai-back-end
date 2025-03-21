import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { ToolsService } from '../tools/tools.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Message } from '@prisma/client';
import { OpenaiService } from '../openai/openai.service';

const mockOpenai = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: { content: 'mock-content' },
            },
          },
        ],
      }),
    },
  },
};

const mockToolsService = {
  getTools: jest.fn().mockReturnValue([
    {
      name: 'say-hi',
      description: 'Say hi to the user',
      parameters: {},
    },
    {
      name: 'say-bye',
      description: 'Say bye to the user',
      parameters: {},
    },
  ]),
};

const mockPrismaService = {
  agent: {
    create: jest.fn().mockResolvedValue({
      id: '123',
      templateId: 'mock-template',
      tools: ['say-hi', 'say-bye'],
      projectId: 'mock-project',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    findUnique: jest.fn().mockResolvedValue({
      id: '123',
      templateId: 'mock-template',
      tools: ['say-hi', 'say-bye'],
      projectId: 'mock-project',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      template: {
        model: 'mock-model',
        temperature: 0.7,
      },
    }),
  },
  message: {
    create: jest.fn().mockResolvedValue({
      id: '123',
      agentId: 'mock-agent',
      content: 'mock-content',
      role: 'assistant',
    } as Message),
  },
};

describe('AgentService', () => {
  let service: AgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ToolsService, useValue: mockToolsService },
        { provide: OpenaiService, useValue: mockOpenai },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an agent', async () => {
    const result = await service.createAgent('mock-template', 'mock-project');

    expect(result).toBeDefined();
    expect(mockPrismaService.agent.create).toHaveBeenCalledWith({
      data: {
        templateId: 'mock-template',
        projectId: 'mock-project',
        tools: ['say-hi', 'say-bye'],
      },
    });
  });

  it('should send a message', async () => {
    await service.sendMessage('mock-agent', 'mock-message');

    expect(mockOpenai.chat.completions.create).toHaveBeenCalled();
    expect(mockPrismaService.message.create).toHaveBeenCalled();
  });
});
