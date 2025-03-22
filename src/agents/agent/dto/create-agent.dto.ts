import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateAgentDto {
  @IsMongoId()
  @IsNotEmpty()
  templateId: string;

  @IsMongoId()
  @IsNotEmpty()
  projectId: string;
}
