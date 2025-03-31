import * as util from 'util';
import { exec } from 'child_process';
import { CreateContainerResponse } from './types';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class DockerService {
  constructor(private readonly logger: LoggerService) {
    this.logger.defaultContext = 'DockerService';
  }

  public async createContainer(): Promise<CreateContainerResponse> {
    const execAsync = util.promisify(exec);

    try {
      const response = await execAsync(
        'docker create alpine:latest tail -f /dev/null',
      );
      return {
        success: true,
        containerId: response.stdout.trim(),
        stdout: response.stdout,
        stderr: response.stderr,
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  public async startContainer(containerId: string): Promise<void> {
    const execAsync = util.promisify(exec);
    await execAsync(`docker start ${containerId}`);
  }

  public async stopContainer(containerId: string): Promise<void> {
    const execAsync = util.promisify(exec);
    await execAsync(`docker stop ${containerId}`);
  }

  public async removeContainer(containerId: string): Promise<void> {
    const execAsync = util.promisify(exec);
    await execAsync(`docker rm ${containerId}`);
  }

  public async containerInspect(
    containerId: string,
  ): Promise<Record<string, any>> {
    const execAsync = util.promisify(exec);
    const result = await execAsync(`docker inspect ${containerId}`);
    return JSON.parse(result.stdout);
  }

  public async containerStatus(containerId: string): Promise<string> {
    const inspect = await this.containerInspect(containerId);
    return inspect[0].State.Status;
  }
}
