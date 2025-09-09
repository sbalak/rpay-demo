import { consoleTransport, logger } from 'react-native-logs';
import Constants from 'expo-constants';
import * as Sentry from "@sentry/react-native";

// Determine log level based on environment
const isDev = __DEV__ || Constants.expoConfig?.extra?.debug === true;
const logLevel = isDev ? 'debug' : 'debug';

const logInstance = logger.createLogger({
  severity: logLevel,
  transport: [consoleTransport], // Only use console transport
  transportOptions: {
    colors: {
      debug: "blueBright",
      info: "greenBright",
      warn: "yellowBright",
      error: "redBright",
    },
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  fixedExtLvlLength: false,
  enabled: true,
});

// Create custom log methods that send to both console and Sentry
const createLogMethod = (level: 'debug' | 'info' | 'warn' | 'error') => {
  return (...args: any[]) => {
    // Send to console via react-native-logs
    logInstance[level](...args);
    
    // Send to Sentry based on log level
    const message = args.join(' ');
    
    if (level === 'error' || level === 'warn') {
      // Send errors and warnings as error events
      Sentry.captureException(new Error(message));
    } else {
      // Send debug and info as log messages
      Sentry.captureMessage(message, { level: 'info' });
    }
  };
};

// Export individual log methods for convenience
export const log = {
  debug: createLogMethod('debug'),
  info: createLogMethod('info'),
  warn: createLogMethod('warn'),
  error: createLogMethod('error'),
};

// Default export for easy importing
export default log;
