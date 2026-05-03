import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
  }),
];

if (config.env !== 'test') {
  transports.push(
    new DailyRotateFile({
      dirname: config.log.dir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      format: combine(timestamp(), errors({ stack: true }), logFormat),
    }),
    new DailyRotateFile({
      dirname: config.log.dir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      format: combine(timestamp(), errors({ stack: true }), logFormat),
    })
  );
}

export const logger = winston.createLogger({
  level: config.log.level,
  format: combine(errors({ stack: true }), timestamp()),
  transports,
  silent: config.env === 'test',
});
