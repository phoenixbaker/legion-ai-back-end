import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ToolsService } from '../tools/tools.service';

// Mock implementations
const mockPrismaService = {
  agent: {
    create: jest.fn().mockResolvedValue({
      id: 'mock-agent-id',
      templateId: 'mock-template-id',
      projectId: 'mock-project-id',
      tools: ['say-hi', 'say-bye'],
    }),
    findUnique: jest.fn().mockResolvedValue({
      id: 'mock-agent-id',
      tools: ['say-hi', 'say-bye'],
      messages: [],
      template: { model: 'gpt-3.5-turbo' },
    }),
  },
};

const mockToolsService = {
  getTools: jest.fn().mockReturnValue([]),
  executeTool: jest.fn().mockResolvedValue({}),
};

describe('AgentService', () => {
  let service: AgentService;
  let prismaService: PrismaService;
  let toolsService: ToolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ToolsService, useValue: mockToolsService },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
    prismaService = module.get<PrismaService>(PrismaService);
    toolsService = module.get<ToolsService>(ToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an agent', async () => {
    const result = await service.createAgent(
      'test-template-id',
      'test-project-id',
    );
    expect(result).toBeDefined();
    expect(mockPrismaService.agent.create).toHaveBeenCalledWith({
      data: {
        templateId: 'test-template-id',
        projectId: 'test-project-id',
        tools: ['say-hi', 'say-bye'],
      },
    });
  });

  it('should send a message to an agent', async () => {
    // Need to mock OpenAI here or update the service to accept it as a dependency
    // This test might not work without additional mocking for OpenAI
    const agentId = 'mock-agent-id';
    const message = 'Hello, world!';

    await expect(service.sendMessage(agentId, message)).resolves.not.toThrow();
    expect(mockPrismaService.agent.findUnique).toHaveBeenCalledWith({
      where: { id: agentId },
      include: {
        messages: true,
        template: true,
      },
    });
  });
});
