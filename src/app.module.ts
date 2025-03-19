import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module';
import { TemplateModule } from './template/template.module';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { LlmModule } from './llm/llm.module';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [AgentModule, TemplateModule, ConfigModule, PrismaModule, LlmModule, ProjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
