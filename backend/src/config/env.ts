import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required. ' +
    'Set it in your .env file (development) or environment (production).'
  );
}

export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databasePath: process.env.DATABASE_PATH ?? './data/angren_taxi.db',
  defaultLanguage: process.env.DEFAULT_LANGUAGE ?? 'ru',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10),
  routingProvider: process.env.ROUTING_PROVIDER ?? 'osrm',
  osrmBaseUrl: process.env.OSRM_BASE_URL ?? 'https://router.project-osrm.org',
  googleDirectionsApiKey: process.env.GOOGLE_DIRECTIONS_API_KEY,
};
