import { IsNotEmpty, IsString } from 'class-validator';

export class MessageAgentDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
