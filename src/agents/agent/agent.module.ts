import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { TemplateService } from '../template/template.service';
import { ToolsService } from '../tools/tools.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentController } from './agent.controller';
import { OpenaiService } from '../openai/openai.service';

@Module({
  providers: [
    AgentService,
    TemplateService,
    ToolsService,
    PrismaService,
    OpenaiService,
  ],
  exports: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
