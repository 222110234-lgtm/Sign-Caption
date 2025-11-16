import { Router } from 'express';
import { nanoid } from 'nanoid';
import { inviteSchema } from '../utils/validation.js';
// import nodemailer from 'nodemailer';

const router = Router();
router.post('/', async (req, res) => {
  const { value, error } = inviteSchema.validate(req.body);
  if (error) return res.status(400).json({ ok: false, error: error.message });

  const { email, roomId } = value;
  const token = nanoid(8);
  const proto = (req.headers['x-forwarded-proto'] || req.protocol);
  const host = req.get('host');
  const inviteLink = `${proto}://${host}/join/${roomId}?i=${token}`;

  console.log(`[invite] ${email} -> ${inviteLink}`);
  res.json({ ok: true, inviteLink });
});
export default router;