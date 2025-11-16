import { Router } from 'express';
import { publicRoomSnapshot } from '../lib/store.js';

const router = Router();
router.get('/:roomId', (req, res) => {
  const { roomId } = req.params;
  return res.json({ ok: true, room: publicRoomSnapshot(roomId) });
});
export default router;