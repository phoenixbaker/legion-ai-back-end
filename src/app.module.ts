import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agents/agent/agent.module';
import { TemplateModule } from './agents/template/template.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ProjectModule } from './projects/project/project.module';
import { ToolsModule } from './agents/tools/tools.module';
import { OpenaiModule } from './agents/openai/openai.module';
import { ConfigModule } from '@nestjs/config';
import { DockerModule } from './projects/docker/docker.module';
import { LoggerModule } from './common/logger/logger.module';
import { MessagesModule } from './agents/messages/messages.module';

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
    DockerModule,
    LoggerModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
