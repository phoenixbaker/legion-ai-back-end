import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ToolsService } from '../tools/tools.service';
import { LoggerService } from '../../common/logger/logger.service';
import { OpenaiService } from '../openai/openai.service';
import { TemplateService } from '../template/template.service';
import { MessagesController } from './messages.controller';
import { AgentService } from '../agent/agent.service';

describe('MessagesService', () => {
  let service: MessagesService;
  let agentService: AgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        MessagesService,
        PrismaService,
        ConfigService,
        ToolsService,
        TemplateService,
        LoggerService,
        OpenaiService,
        {
          provide: AgentService,
          useValue: {
            handleAgentMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    agentService = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(agentService).toBeDefined();
  });
});
