import { IsDefined, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateAgentDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsDefined()
  templateId: string;

  @IsMongoId()
  @IsNotEmpty()
  @IsDefined()
  projectId: string;
}
