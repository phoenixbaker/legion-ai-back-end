import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Message, Prisma } from '@prisma/client';

type MessageRole = Message['role'];

export class UpdateMessageDto implements Prisma.MessageUpdateInput {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(['user', 'assistant', 'system', 'tool'])
  @IsOptional()
  role?: MessageRole;

  @IsString()
  @IsOptional()
  tool_call_id?: string;
}
