import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { AgentModule } from '../agent/agent.module';
import { ToolsModule } from '../tools/tools.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [AgentModule, ToolsModule, PrismaModule],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
