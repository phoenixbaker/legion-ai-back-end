import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ConfigService } from '../../config/config.service';

@Module({
  imports: [ConfigService],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
