import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto, MessageAgentDto } from './dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get(':id')
  async getAgent(@Param('id') id: string) {
    return await this.agentService.getAgent(id);
  }

  @Delete(':id')
  async deleteAgent(@Param('id') id: string) {
    return await this.agentService.deleteAgent(id);
  }

  @Post()
  async createAgent(@Body() dto: CreateAgentDto) {
    return await this.agentService.createAgent(dto.templateId, dto.projectId);
  }

  @Post(':id/chat')
  async messageAgent(@Param('id') id: string, @Body() dto: MessageAgentDto) {
    return await this.agentService.sendMessage(id, dto.message);
  }
}
