import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { TemplateModule } from '../template/template.module';
import { ToolsModule } from '../tools/tools.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [TemplateModule, ToolsModule, PrismaModule, OpenaiModule],
  providers: [AgentService],
  exports: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
