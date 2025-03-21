import { Module } from '@nestjs/common';
import OpenAI from 'openai';

@Module({})
export class OpenaiModule extends OpenAI {
  constructor() {
    super({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
}
