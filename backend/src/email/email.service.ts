import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { EmailDto } from './dto/email.dto';
@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const otp = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otp.deleteMany({
      where: { email },
    });

    await this.prisma.otp.create({
      data: {
        email,
        otp: hashedOtp,
        expiresAt,
        verified: false,
        resendCount: 0,
        lastResendAt: new Date(),
      },
    });

    await this.mailerService.sendMail({
      to: email,
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Email Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new BadRequestException('Email and OTP are required');
    }

    const record = await this.prisma.otp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('OTP not found');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const isValid = await bcrypt.compare(otp, record.otp);

    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.prisma.otp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    await this.prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return { message: 'Email verified successfully' };
  }

  async resendOtp(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const record = await this.prisma.otp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    if (record) {
      if (record.resendCount >= 3) {
        throw new BadRequestException('Resend limit reached');
      }

      if (
        record.lastResendAt &&
        now.getTime() - record.lastResendAt.getTime() < 60000
      ) {
        throw new BadRequestException('Wait 60 seconds before resending');
      }

      await this.prisma.otp.update({
        where: { id: record.id },
        data: {
          resendCount: record.resendCount + 1,
          lastResendAt: now,
        },
      });
    }

    return this.sendOtp(email);
  }
}
