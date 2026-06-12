import { AppDataSource } from '../../config/database';
import { UserEntity } from '../users/user.entity';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { JwtPayload } from '../../common/types';

interface GoogleProfile {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Partial<UserEntity>;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(UserEntity);
  private tokenService = new TokenService();
  private otpService = new OtpService();

  async findOrCreateGoogleUser(profile: GoogleProfile): Promise<UserEntity> {
    let user = await this.userRepository.findOne({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      user = await this.userRepository.findOne({
        where: { email: profile.email },
      });

      if (user) {
        user.googleId = profile.googleId;
        user.avatarUrl = profile.avatarUrl;
        await this.userRepository.save(user);
      } else {
        user = await this.userRepository.save({
          googleId: profile.googleId,
          email: profile.email,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          isVerified: true,
        });
      }
    }

    return user;
  }

  generateTokens(user: UserEntity): AuthTokens {
    const payload: JwtPayload = { userId: user.id, email: user.email };
    return {
      accessToken: this.tokenService.generateAccessToken(payload),
      refreshToken: this.tokenService.generateRefreshToken(payload),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    };
  }

  async requestOtp(email: string): Promise<void> {
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = await this.userRepository.save({
        email,
        isVerified: false,
      });
    }

    const code = await this.otpService.createOtp(user.id);
    await this.otpService.sendOtpEmail(email, code);
  }

  async verifyOtp(email: string, code: string): Promise<AuthTokens> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error('User not found');

    const isValid = await this.otpService.verifyOtp(user.id, code);
    if (!isValid) throw new Error('Invalid or expired OTP');

    if (!user.isVerified) {
      await this.userRepository.update(user.id, { isVerified: true });
      user.isVerified = true;
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const tokenService = new TokenService();
    const payload = tokenService.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });
    if (!user) throw new Error('User not found');

    return this.generateTokens(user);
  }
}