import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import healthRouter from './routes/health.js';
import configRouter from './routes/config.js';
import invitationsRouter from './routes/invitations.js';
import roomsRouter from './routes/rooms.js';
import predictionsRouter from './routes/predictions.js';

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '512kb' }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
  }
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/predictions', predictionsRouter);

export default app;