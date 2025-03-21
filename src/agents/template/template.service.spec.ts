import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { AgentTemplate } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  agentTemplate: {
    findUnique: jest.fn().mockResolvedValue({
      id: '123',
      model: 'test-model',
      name: 'test-name',
      systemPrompt: 'test-system-prompt',
      temperature: 0.7,
      tools: ['test-tool'],
    } as AgentTemplate),
    create: jest.fn().mockResolvedValue({
      id: '123',
      model: 'test-model',
      name: 'test-name',
      systemPrompt: 'test-system-prompt',
      temperature: 0.7,
      tools: ['test-tool'],
    } as AgentTemplate),
  },
};

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get an agent template by id', async () => {
    const result = await service.getAgentTemplateById('123');
    expect(result).toBeDefined();
    expect(mockPrismaService.agentTemplate.findUnique).toHaveBeenCalledWith({
      where: { id: '123' },
    });
  });

  it('should create an agent template', async () => {
    const result = await service.createAgentTemplate({
      model: 'test-model',
      name: 'test-name',
      systemPrompt: 'test-prompt',
      temperature: 0.7,
      tools: ['test-tool'],
    });
    expect(result).toBeDefined();
    expect(mockPrismaService.agentTemplate.create).toHaveBeenCalledWith({
      data: {
        model: 'test-model',
        name: 'test-name',
        systemPrompt: 'test-prompt',
        temperature: 0.7,
        tools: ['test-tool'],
      },
    });
  });
});
