import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ToolsService } from '../tools/tools.service';
import { LoggerService } from '../../common/logger/logger.service';
import { OpenaiService } from '../openai/openai.service';
import { TemplateService } from '../template/template.service';
import { AgentService } from '../agent/agent.service';

describe('MessagesController', () => {
  let controller: MessagesController;

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

    controller = module.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
