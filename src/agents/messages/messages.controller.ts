import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto, UpdateMessageDto } from './dto';

@Controller('agent/:agentId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async getMessages(@Param('agentId') agentId: string) {
    return await this.messagesService.getAllAgentMessages(agentId);
  }

  @Get(':id')
  async getMessage(@Param('id') id: string) {
    return await this.messagesService.getMessage(id);
  }

  @Post()
  async sendMessage(
    @Param('agentId') agentId: string,
    @Body() dto: SendMessageDto,
  ) {
    return await this.messagesService.sendMessage(agentId, dto.message);
  }

  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    return await this.messagesService.deleteMessage(id);
  }

  @Put(':id')
  async updateMessage(@Param('id') id: string, @Body() dto: UpdateMessageDto) {
    return await this.messagesService.updateMessage(id, dto);
  }
}
