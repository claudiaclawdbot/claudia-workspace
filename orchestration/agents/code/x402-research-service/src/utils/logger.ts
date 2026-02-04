/**
 * Winston Logger Configuration
 */

import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: config.environment === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'x402-research-service' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: combine(
        timestamp(),
        config.environment === 'production' ? json() : combine(colorize(), devFormat)
      )
    }),
    // File output for production
    ...(config.environment === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: combine(timestamp(), json())
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: combine(timestamp(), json())
      })
    ] : [])
  ],
  exceptionHandlers: [
    new winston.transports.Console()
  ],
  rejectionHandlers: [
    new winston.transports.Console()
  ]
});

export { logger };
