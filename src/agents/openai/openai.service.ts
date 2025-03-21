import { ConfigService } from '../../config/config.service';
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService extends OpenAI {
  constructor(configService: ConfigService) {
    super({
      apiKey: configService.get('OPENROUTER_API_KEY'),
      baseURL: configService.get('OPENROUTER_BASE_URL'),
    });
  }
}
