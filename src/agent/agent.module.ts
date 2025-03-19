import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { TemplateService } from 'src/template/template.service';

@Module({
  providers: [AgentService, TemplateService],
  exports: [AgentService],
})
export class AgentModule {}
