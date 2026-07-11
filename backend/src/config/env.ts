import * as dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  // server
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  BACKEND_URL: process.env.BACKEND_URL || '',

  // database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_USER: process.env.DB_USER || 'chatuser',
  DB_PASSWORD: process.env.DB_PASSWORD || 'chatpassword',
  DB_NAME: process.env.DB_NAME || 'chatapp',

  // jwt
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkey',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey',

  // google oauth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',

  // redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),

  // otp
  OTP_EXPIRES_IN_MINUTES: parseInt(process.env.OTP_EXPIRES_IN_MINUTES || '10'),

  // frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};