import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { ToolsService } from '../tools/tools.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockToolsService = {};
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
});
