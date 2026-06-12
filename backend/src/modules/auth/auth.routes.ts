import { Router } from 'express';
import passport from 'passport';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import '../../config/passport';

const router = Router();
const authController = new AuthController();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/failure' }),
  authController.googleCallback
);

router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

router.post('/otp/request', authController.requestOtp);
router.post('/otp/verify', authController.verifyOtp);
router.post('/refresh', authController.refreshToken);
router.get('/me', authMiddleware, authController.getMe);

export default router;