import { Router } from 'express';
import { rooms } from '../lib/store.js';

const router = Router();
router.get('/', (_req, res) => {
  res.json({ ok: true, service: 'sign-caption-backend', rooms: rooms.size, time: new Date().toISOString() });
});
export default router;