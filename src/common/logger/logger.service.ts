import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  public defaultContext: string = 'Application';

  public log(message: string, context: string = this.defaultContext) {
    console.log(`[${context}] ${message}`);
  }

  public error(message: string, context: string = this.defaultContext) {
    console.error(`[${context}] ${message}`);
  }

  public warn(
    message: string,
    trace?: string,
    context: string = this.defaultContext,
  ) {
    console.warn(`[${context}] ${message}`);
    if (trace) {
      console.warn(trace);
    }
  }

  public debug(message: string, context: string = this.defaultContext) {
    console.debug(`[${context}] ${message}`);
  }
}
