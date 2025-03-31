import { Provider } from '@nestjs/common';
import { LoggerService } from './logger.service';

const defaultContext = 'Application';

export const mockLoggerService = {
  defaultContext,
  log: jest.fn().mockImplementation((message, context = defaultContext) => {
    console.log(`[${context}] ${message}`);
  }),
  error: jest.fn().mockImplementation((message, context = defaultContext) => {
    console.error(`[${context}] ${message}`);
  }),
  warn: jest
    .fn()
    .mockImplementation((message, trace, context = defaultContext) => {
      console.warn(`[${context}] ${message}`);
      if (trace) {
        console.warn(trace);
      }
    }),
  debug: jest.fn().mockImplementation((message, context = defaultContext) => {
    console.debug(`[${context}] ${message}`);
  }),
};

export const MockLoggerService: Provider = {
  provide: LoggerService,
  useValue: mockLoggerService,
};
