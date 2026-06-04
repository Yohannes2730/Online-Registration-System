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
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !birthDate ||
      !phoneNumber
    ) {
      throw new BadRequestException('Missing required fields');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // CHECK IF USER EXISTS
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const existing = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    // CREATE USER
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

    // SEND OTP
    await this.emailService.sendOtp(normalizedEmail);

    return {
      success: true,
      message: 'User registered successfully. OTP sent to email.',
      data: result,
    };
  }

  // ---------------- LOGIN ----------------
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const normalizedEmail = email.trim().toLowerCase();

    // CHECK EMAIL VERIFIED
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before login');
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
  if (!email) {
    throw new BadRequestException('Email is required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await this.prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new BadRequestException('User not found');
  }

  await this.emailService.sendOtp(normalizedEmail);

  return {
    success: true,
    message: 'Password reset OTP sent to email',
  };
}
// ---------------- RESET PASSWORD ----------------
async resetPassword(email: string, otp: string, newPassword: string) {
  if (!email || !otp || !newPassword) {
    throw new BadRequestException('Missing required fields');
  }

  const normalizedEmail = email.trim().toLowerCase();

  // verify OTP using email service
  const isValid = await this.emailService.sendOtp(
    normalizedEmail,
    otp,
  );

  if (!isValid) {
    throw new BadRequestException('Invalid or expired OTP');
  }

  await auth.api.updatePassword({
    body: {
      email: normalizedEmail,
      newPassword,
    },
  });

  // cleanup OTP after success
  await this.emailService.sendOtp(normalizedEmail);

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

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }
  // ---------------- LOGOUT ----------------
  async logout(token: string) {
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


