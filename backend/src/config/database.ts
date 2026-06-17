import { DataSource } from 'typeorm';
import { ENV } from './env';

const isProduction = ENV.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  synchronize: false,
  logging: false,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  entities: isProduction
    ? [__dirname + '/../modules/**/**.entity.js']
    : [__dirname + '/../modules/**/**.entity.ts'],
  migrations: [],
  subscribers: [],
  poolSize: 10,
  connectTimeoutMS: 10000,
  extra: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
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