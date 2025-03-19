import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private readonly config: Record<string, any>;

  constructor() {
    this.config = {};
  }

  public get(key: string) {
    return this.config[key];
  }
}
