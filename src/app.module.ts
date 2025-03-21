import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agents/agent/agent.module';
import { TemplateModule } from './agents/template/template.module';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { ToolsModule } from './agents/tools/tools.module';

@Module({
  imports: [
    AgentModule,
    TemplateModule,
    ConfigModule,
    PrismaModule,
    ProjectModule,
    ToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
