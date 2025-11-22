import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';
import { ensureUserFromFirebase } from '../services/userService';
import { logAuthEvent } from '../services/auditService';

const router = Router();

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

router.post('/sync', authenticate, async (req, res, next) => {
  try {
    if (!req.user?.email) throw new HttpError(401, 'Unauthenticated');
    const user = await ensureUserFromFirebase({
      email: req.user.email,
      fullName: req.user.fullName,
      firebaseUid: req.user.firebaseUid,
    });
    await logAuthEvent({
      event: 'login',
      userEmail: user.email,
      firebaseUid: user.firebaseUid,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
      },
    });
  } catch (error) {
    next(error);
  }
});

const trackSchema = z.object({
  event: z.string(),
});

router.post('/track', authenticate, async (req, res, next) => {
  try {
    const { event } = trackSchema.parse(req.body);
    if (!req.user?.email) throw new HttpError(401, 'Unauthenticated');
    await logAuthEvent({
      event,
      userEmail: req.user.email,
      firebaseUid: req.user.firebaseUid,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const authRouter = router;
