import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

export class AuthController {
  private authService = new AuthService();
  private tokenService = new TokenService();

  googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as any;
      const tokens = this.authService.generateTokens(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      res.redirect(
        `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
      );
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  };

  requestOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      await this.authService.requestOtp(email);
      res.json({ message: 'OTP sent to your email' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        res.status(400).json({ message: 'Email and code are required' });
        return;
      }

      const tokens = await this.authService.verifyOtp(email, code);
      res.json(tokens);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }

      const tokens = await this.authService.refreshTokens(refreshToken);
      res.json(tokens);
    } catch (error: any) {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ user: req.user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}