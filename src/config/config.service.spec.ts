import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import * as path from 'path';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct config', () => {
    expect(service.get('agentConfigDirPath')).toBe(
      path.join(process.cwd(), 'src/template/config/'),
    );
    expect(service.get('agentSystemPromptDirPath')).toBe(
      path.join(process.cwd(), 'src/template/prompts/'),
    );
  });
});
