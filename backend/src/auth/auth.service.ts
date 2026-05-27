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
      throw new UnauthorizedException(
        'Please verify your email before login',
      );
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

  // ---------------- ME ----------------
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phoneNumber: true,
        image: true,
        role: true,
        birthDate: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }
}