import 'reflect-metadata';
import http from 'http';
import App from './app';
import { connectDatabase } from './config/database';
import { ENV } from './config/env';

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  const appInstance = new App();
  const server = http.createServer(appInstance.app);

  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
    console.log(`📡 Environment: ${ENV.NODE_ENV}`);
  });
};

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});