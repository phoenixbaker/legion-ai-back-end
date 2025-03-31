import { Test, TestingModule } from '@nestjs/testing';
import { DockerService } from './docker.service';
import { MockLoggerService } from '../../common/logger/logger.mock';

describe('DockerService', () => {
  let service: DockerService;
  let containerId!: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DockerService, MockLoggerService],
    }).compile();

    service = module.get<DockerService>(DockerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a container', async () => {
    const result = await service.createContainer();
    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error('Container creation failed');
    }

    containerId = result.containerId;
  }, 10000);

  it('should start a container', async () => {
    await service.startContainer(containerId);
    const status = await service.containerStatus(containerId);
    expect(status).toBe('running');
  }, 10000);

  it('should stop a container', async () => {
    await service.stopContainer(containerId);
    const status = await service.containerStatus(containerId);
    expect(status).toBe('exited');
  }, 20000);

  it('should remove a container', async () => {
    await service.removeContainer(containerId);
    expect(service.containerStatus(containerId)).rejects.toThrow();
  }, 20000);
});
