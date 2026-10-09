import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { getApiEnv } from './config/env.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const env = getApiEnv();
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL }));
  app.use(express.json({ limit: '10kb' }));
  app.use(pinoHttp({ logger }));

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests, please try again later.',
          details: {},
        },
      });
    },
  });

  app.use('/api', limiter);
  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
