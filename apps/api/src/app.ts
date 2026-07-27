import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOrigins } from './config/env';
import { apiRouter } from './routes';
import { apiRateLimiter } from './middleware/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(apiRateLimiter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
