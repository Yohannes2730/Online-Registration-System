import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';
import { auth } from '../auth/auth';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // ---------------- REGISTER ----------------
  async register(dto: RegisterDto) {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      birthDate,
      phoneNumber,
      image,
    } = dto;

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    const result = await auth.api.signUpEmail({
      body: {
        email: normalizedEmail,
        password,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        username,
        birthDate: new Date(birthDate),
        phoneNumber,
        image: image || '',
      },
    });

    await this.emailService.sendOtp(normalizedEmail);

    return {
      success: true,
      message: 'User registered. OTP sent.',
      data: result,
    };
  }

  // ---------------- LOGIN ----------------
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) throw new UnauthorizedException('User not found');

    if (!user.emailVerified) {
      throw new UnauthorizedException('Verify email first');
    }

    const session = await auth.api.signInEmail({
      body: {
        email: normalizedEmail,
        password,
      },
    });

    return {
      success: true,
      message: 'Login successful',
      session,
    };
  }

  // ---------------- FORGOT PASSWORD ----------------
  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) throw new BadRequestException('User not found');

    await this.emailService.sendOtp(normalizedEmail);

    return {
      success: true,
      message: 'OTP sent for password reset',
    };
  }

  // ---------------- RESET PASSWORD ----------------
  async resetPassword(email: string, otp: string, newPassword: string) {
    const normalizedEmail = email.trim().toLowerCase();

    await this.emailService.verifyOtp(normalizedEmail, otp);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.account.updateMany({
      where: {
        user: { email: normalizedEmail },
        providerId: 'credential',
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Password reset successful',
    };
  }

  // ---------------- ME ----------------
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return { success: true, data: user };
  }

  // ---------------- LOGOUT ----------------
  async logout(token: string) {
    if (!token) throw new BadRequestException('Token required');

    await auth.api.signOut({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
