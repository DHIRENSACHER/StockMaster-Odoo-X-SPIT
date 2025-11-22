import dotenv from 'dotenv';

dotenv.config();

const required = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  appName: process.env.APP_NAME || 'stockmaster',
  jwtSecret: required(process.env.JWT_SECRET, 'JWT_SECRET'),
  firebase: {
    projectId: required(process.env.FIREBASE_PROJECT_ID, 'FIREBASE_PROJECT_ID'),
    clientEmail: required(process.env.FIREBASE_CLIENT_EMAIL, 'FIREBASE_CLIENT_EMAIL'),
    privateKey: required(process.env.FIREBASE_PRIVATE_KEY, 'FIREBASE_PRIVATE_KEY'),
  },
  db: {
    host: required(process.env.DB_HOST, 'DB_HOST'),
    port: Number(process.env.DB_PORT) || 3306,
    user: required(process.env.DB_USER, 'DB_USER'),
    password: required(process.env.DB_PASSWORD, 'DB_PASSWORD'),
    database: required(process.env.DB_NAME, 'DB_NAME'),
  },
};
