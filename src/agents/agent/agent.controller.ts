import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { Agent } from '@prisma/client';
import { CreateUserDto } from './dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get(':id')
  async getAgent(@Query('id') id: string) {
    return this.agentService.getAgent(id);
  }

  @Delete(':id')
  async deleteAgent(@Query('id') id: string) {
    return this.agentService.deleteAgent(id);
  }

  @Put(':id')
  async updateAgent(@Query('id') id: string, @Body() dto: Partial<Agent>) {
    return this.agentService.updateAgent(id, dto);
  }

  @Post()
  async createAgent(@Body() dto: CreateUserDto) {
    return this.agentService.createAgent(dto.templateId, dto.projectId);
  }
}
