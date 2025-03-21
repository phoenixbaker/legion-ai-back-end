import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { TemplateService } from 'src/agents/template/template.service';
import { ToolsService } from '../tools/tools.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentController } from './agent.controller';

@Module({
  providers: [AgentService, TemplateService, ToolsService, PrismaService],
  exports: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
