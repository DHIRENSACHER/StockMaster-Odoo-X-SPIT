import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  name: env.appName,
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  transport: env.nodeEnv === 'production' ? undefined : { target: 'pino-pretty' },
});
