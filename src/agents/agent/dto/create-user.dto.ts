import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsMongoId()
  @IsNotEmpty()
  templateId: string;

  @IsMongoId()
  @IsNotEmpty()
  projectId: string;
}
