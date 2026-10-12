
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt } from 'crypto';
import { OtpType } from '@prisma/client';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly redisService: RedisService,
  ) {}

  private generateOtp(): string {
    return randomInt(100000, 1000000).toString();
  }

  private redisKey(email: string, type: OtpType): string {
    return `otp:${type}:${email}`;
  }

  // ---------------- SEND OTP ----------------
  async sendOtp(
    email: string,
    type: OtpType = OtpType.EMAIL_VERIFICATION,
  ): Promise<{ message: string }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otp.deleteMany({
      where: { email: normalizedEmail, type },
    });

    await this.prisma.otp.create({
      data: {
        email: normalizedEmail,
        otp: hashedOtp,
        type,
        expiresAt,
        resendCount: 0,
        lastResendAt: new Date(),
      },
    });

    await this.redisService.set(
      this.redisKey(normalizedEmail, type),
      hashedOtp,
      300,
    );

    try {
      await this.mailerService.sendMail({
        to: normalizedEmail,
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        subject: 'Your OTP Code',
        html: `
          <h2>OTP Verification</h2>
          <h1 style="letter-spacing:5px">${otp}</h1>
          <p>Valid for 5 minutes</p>
        `,
      });
    } catch (error) {
      await this.redisService.del(this.redisKey(normalizedEmail, type));
      await this.prisma.otp.deleteMany({
        where: { email: normalizedEmail, type },
      });
      throw error;
    }

    return { message: 'OTP sent successfully' };
  }

  // ---------------- VERIFY OTP ----------------
  async verifyOtp(
    email: string,
    otp: string,
    type: OtpType = OtpType.EMAIL_VERIFICATION,
  ): Promise<boolean> {
    if (!email || !otp) {
      throw new BadRequestException('Email and OTP are required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const key = this.redisKey(normalizedEmail, type);

    const record = await this.prisma.otp.findFirst({
      where: { email: normalizedEmail, type },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('OTP not found');
    }

    if (record.expiresAt < new Date()) {
      await this.redisService.del(key);
      throw new BadRequestException('OTP expired');
    }

    const cachedHash = await this.redisService.get(key);

    if (!cachedHash) {
      throw new BadRequestException('OTP expired or unavailable');
    }

    const isValid =
      (await bcrypt.compare(otp, record.otp)) &&
      (await bcrypt.compare(otp, cachedHash));

    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.prisma.otp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    await this.redisService.del(key);

    if (type === OtpType.EMAIL_VERIFICATION) {
      await this.prisma.user.update({
        where: { email: normalizedEmail },
        data: { emailVerified: true },
      });
    }

    return true;
  }

  // ---------------- RESEND OTP ----------------
  async resendOtp(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const record = await this.prisma.otp.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return this.sendOtp(normalizedEmail);
    }

    const now = new Date();

    if (record.resendCount >= 3) {
      throw new BadRequestException('Resend limit reached');
    }

    if (
      record.lastResendAt &&
      now.getTime() - record.lastResendAt.getTime() < 60000
    ) {
      throw new BadRequestException(
        'Wait 60 seconds before resending',
      );
    }

    const type = record.type;
    const otp = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otp.update({
      where: { id: record.id },
      data: {
        otp: hashedOtp,
        verified: false,
        expiresAt,
        resendCount: record.resendCount + 1,
        lastResendAt: now,
      },
    });

    await this.redisService.set(
      this.redisKey(normalizedEmail, type),
      hashedOtp,
      300,
    );

    try {
      await this.mailerService.sendMail({
        to: normalizedEmail,
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        subject: 'Your OTP Code',
        html: `
          <h2>OTP Verification</h2>
          <h1 style="letter-spacing:5px">${otp}</h1>
          <p>Valid for 5 minutes</p>
        `,
      });
    } catch (error) {
      await this.redisService.del(this.redisKey(normalizedEmail, type));
      throw error;
    }

    return { message: 'OTP resent successfully' };
  }
}
