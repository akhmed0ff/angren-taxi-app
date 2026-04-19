import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';

if (nodeEnv === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv,
  jwtSecret: process.env.JWT_SECRET ?? 'fallback_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databasePath: process.env.DATABASE_PATH ?? './data/angren_taxi.db',
  defaultLanguage: process.env.DEFAULT_LANGUAGE ?? 'ru',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10),
};
