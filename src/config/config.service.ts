import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly config: Record<string, any>;

  constructor() {
    this.config = {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    };
  }

  public get(key: string) {
    return this.config[key];
  }
}
