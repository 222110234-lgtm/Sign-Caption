import { Router } from 'express';
const router = Router();
router.get('/', (_req, res) => {
  res.json({
    webrtc: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] }
  });
});
export default router;