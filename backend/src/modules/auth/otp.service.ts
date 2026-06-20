import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { AppDataSource } from '../../config/database';
import { ENV } from '../../config/env';
import { OtpEntity } from './otp.entity';

export class OtpService {
  private otpRepository = AppDataSource.getRepository(OtpEntity);

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOtp(userId: string): Promise<string> {
    await this.otpRepository.delete({ userId });

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + ENV.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

    await this.otpRepository.save({
      userId,
      codeHash,
      expiresAt,
      attempts: 0,
      isUsed: false,
    });

    return code;
  }

  async verifyOtp(userId: string, code: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { userId, isUsed: false },
    });

    if (!otp) return false;
    if (new Date() > otp.expiresAt) return false;
    if (otp.attempts >= 5) return false;

    const isValid = await bcrypt.compare(code, otp.codeHash);

    if (!isValid) {
      await this.otpRepository.update(otp.id, { attempts: otp.attempts + 1 });
      return false;
    }

    await this.otpRepository.update(otp.id, { isUsed: true });
    return true;
  }

  async sendOtpEmail(email: string, code: string): Promise<void> {
    // We cast the config object "as any" to bypass TypeScript's strict 
    // overload checks, which often reject 'family: 4' or the timeouts
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4, // Required for Render's IPv6 issue
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    } as any);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your OTP Code</h2>
          <p>Use the code below to login. It expires in ${ENV.OTP_EXPIRES_IN_MINUTES} minutes.</p>
          <h1 style="letter-spacing: 8px; color: #4F46E5;">${code}</h1>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
  }
}