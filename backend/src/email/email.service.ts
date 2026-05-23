import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer'; 
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}


  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  
  async sendOtp(email: string): Promise<{ message: string }> {
    if (!email) throw new BadRequestException('Email is required');

    const otp = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await this.prisma.Otp.deleteMany({
      where: { email },
    });

    await this.prisma.Otp.create({
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
      from: `"Your App" <${process.env.MAIL_USER}>`,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `
        <div>
          <h2>Your OTP Code</h2>
          <p><b>${otp}</b></p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return { message: 'OTP sent successfully' };
  }

    async verifyOtp(email: string, otp: string) {
    if (!email) throw new BadRequestException('Email is required');

    const record = await this.prisma.Otp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new BadRequestException('OTP not found');

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const isValid = await bcrypt.compare(otp, record.otp);
    if (!isValid) throw new BadRequestException('Invalid OTP');

    await this.prisma.Otp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    await this.prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return { message: 'Email verified successfully' };
  }
  async resendOtp(email: string): Promise<{ message: string }> {
    const record = await this.prisma.Otp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    if (record) {
      if (record.resendCount >= 3) {
        throw new BadRequestException('Resend OTP limit reached');
      }

      if (
        record.lastResendAt &&
        now.getTime() - new Date(record.lastResendAt).getTime() < 60000
      ) {
        throw new BadRequestException('Wait 60 seconds before resending OTP');
      }

      await this.prisma.Otp.update({
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