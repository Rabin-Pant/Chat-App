import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../modules/auth/token.service';
import { AppDataSource } from '../config/database';
import { UserEntity } from '../modules/users/user.entity';

const tokenService = new TokenService();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = tokenService.extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const payload = tokenService.verifyAccessToken(token);
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({ where: { id: payload.userId } });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};