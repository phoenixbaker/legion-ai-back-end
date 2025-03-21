import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agents/agent/agent.module';
import { TemplateModule } from './agents/template/template.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { ToolsModule } from './agents/tools/tools.module';
import { OpenaiModule } from './agents/openai/openai.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AgentModule,
    TemplateModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProjectModule,
    ToolsModule,
    OpenaiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
