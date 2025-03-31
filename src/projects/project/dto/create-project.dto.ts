import { IsNotEmpty } from 'class-validator';

import { IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  containerId?: string;
}
