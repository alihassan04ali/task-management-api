import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongo.uri, {
      autoIndex: config.env !== 'production',
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB disconnected');
};
