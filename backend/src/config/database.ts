import { DataSource } from 'typeorm';
import { ENV } from './env';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  synchronize: false,
  logging: ENV.NODE_ENV === 'development',
  ssl: ENV.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  entities: [__dirname + '/../modules/**/**.entity.js'],
  migrations: [],
  subscribers: [],
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};