import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import registerRTCNamespace from './sockets/rtc.js';

const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  }
});

registerRTCNamespace(io);

server.listen(PORT, () => {
  console.log(`Sign Caption backend listening on http://localhost:${PORT}`);
  if (ALLOWED_ORIGINS.length) {
    console.log('CORS allowed:', ALLOWED_ORIGINS.join(', '));
  } else {
    console.log('CORS allowed: any origin (dev default)');
  }
});