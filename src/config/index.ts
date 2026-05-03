import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  mongo: {
    uri: process.env.NODE_ENV === 'test'
      ? (process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/taskapi_test')
      : (process.env.MONGODB_URI || 'mongodb://localhost:27017/taskapi'),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },
};
