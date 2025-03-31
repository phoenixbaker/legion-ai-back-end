import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { AgentModule } from '../agent/agent.module';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [AgentModule, ToolsModule],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
