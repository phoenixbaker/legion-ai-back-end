import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { Agent } from '@prisma/client';

const mockAgent = {
  id: 'mock-agent-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  projectId: 'mock-project-id',
  templateId: 'mock-template-id',
  tools: ['mock-tool-1', 'mock-tool-2'],
} as Agent;

const mockAgentService = {
  getAgent: jest.fn().mockResolvedValue(mockAgent),
  createAgent: jest.fn().mockResolvedValue(mockAgent),
};

describe('AgentController', () => {
  let controller: AgentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
      providers: [
        {
          provide: AgentService,
          useValue: mockAgentService,
        },
      ],
    }).compile();

    controller = module.get<AgentController>(AgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an agent', async () => {
    const result = await controller.getAgent('mock-agent-id');
    expect(result).toEqual(mockAgent);
  });

  it('should return an error if the agent is not found', async () => {
    mockAgentService.getAgent.mockResolvedValue(null);
    const result = await controller.getAgent('mock-non-existent-agent-id');
    expect(result).toEqual(null);
  });

  it('should create an agent', async () => {
    const result = await controller.createAgent({
      projectId: 'mock-project-id',
      templateId: 'mock-template-id',
    });

    expect(result).toEqual(mockAgent);
  });
});
