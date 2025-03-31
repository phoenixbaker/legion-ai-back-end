import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { ToolsService } from '../tools/tools.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Message } from '@prisma/client';
import { OpenaiService } from '../openai/openai.service';
import { TemplateService } from '../template/template.service';
import { MessagesService } from '../messages/messages.service';
import { LoggerService } from '../../common/logger/logger.service';

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

const mockAgent = {
  id: 'mock-agent-id',
  templateId: 'mock-template-id',
  tools: ['say-hi', 'say-bye'],
  projectId: 'mock-project-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaService = {
  agent: {
    delete: jest.fn().mockResolvedValue(mockAgent),
    create: jest.fn().mockResolvedValue(mockAgent),
    findUnique: jest.fn().mockResolvedValue({
      ...mockAgent,
      messages: [],
      template: {
        model: 'mock-model',
        temperature: 0.7,
      },
    }),
    update: jest.fn().mockResolvedValue({
      ...mockAgent,
      id: 'new-mock-agent-id',
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

const mockTemplateService = {
  getAgentTemplateById: jest.fn(),
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
        { provide: TemplateService, useValue: mockTemplateService },
        { provide: MessagesService, useValue: {} },
        { provide: LoggerService, useValue: {} },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get an agent', async () => {
    const result = await service.getAgent('mock-agent');

    expect(result).toBeDefined();
    expect(mockPrismaService.agent.findUnique).toHaveBeenCalledWith({
      where: { id: 'mock-agent' },
      include: {
        template: true,
        messages: true,
        project: true,
        receivedMessages: true,
        sentMessages: true,
      },
    });
  });

  it('should delete an agent', async () => {
    const result = await service.deleteAgent('mock-agent');

    expect(result).toBeDefined();
    expect(mockPrismaService.agent.delete).toHaveBeenCalledWith({
      where: { id: 'mock-agent' },
      include: {
        messages: true,
      },
    });
  });

  it('should create an agent', async () => {
    const result = await service.createAgent('mock-template', 'mock-project');

    expect(result).toBeDefined();
    expect(mockPrismaService.agent.create).toHaveBeenCalled();
  });
});
