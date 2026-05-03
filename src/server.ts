import app from './app';
import { connectDB } from './config/database';
import { config } from './config';
import { logger } from './utils/logger';

const start = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on port ${config.port}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      const { disconnectDB } = await import('./config/database');
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
    server.close(() => process.exit(1));
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
