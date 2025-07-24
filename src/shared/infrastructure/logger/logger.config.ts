import { LogLevel } from '@nestjs/common';
export interface LoggerConfig {
  logLevels: LogLevel[];
  enableTimestamp: boolean;
  enableColors: boolean;
}
export const getLoggerConfig = (): LoggerConfig => {
  const environment = process.env.NODE_ENV || 'development';
  switch (environment) {
    case 'production':
      return {
        logLevels: ['error', 'warn', 'log'],
        enableTimestamp: true,
        enableColors: false,
      };
    case 'test':
      return {
        logLevels: ['error', 'warn'],
        enableTimestamp: false,
        enableColors: false,
      };
    case 'development':
    default:
      return {
        logLevels: ['error', 'warn', 'log', 'debug', 'verbose'],
        enableTimestamp: true,
        enableColors: true,
      };
  }
};
export const createCustomLogger = () => {
  const config = getLoggerConfig();
  return {
    logger: config.logLevels,
    timestamp: config.enableTimestamp,
    colors: config.enableColors,
  };
};
