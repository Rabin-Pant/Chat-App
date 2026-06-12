import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';
import { JwtPayload } from '../../common/types';

export class TokenService {
  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as JwtPayload;
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}