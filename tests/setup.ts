// Test setup file
import { LoggerFactory, LogLevelEnum } from '../src/utils/logger';

// Configure test logger
LoggerFactory.configure(
  LoggerFactory.createConsoleLogger({ 
    level: process.env['DEBUG'] ? LogLevelEnum.DEBUG : LogLevelEnum.INFO 
  })
);

// Global test timeout
jest.setTimeout(60000); // 60 seconds for e2e tests

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 