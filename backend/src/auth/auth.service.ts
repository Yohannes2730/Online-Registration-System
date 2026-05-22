import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { auth } from './auth';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registerData: RegisterDto) {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      birthDate,
      phoneNumber,
      image,
    } = registerData;

    if (!firstName || !lastName || !username || !email || !password) {
      throw new BadRequestException('Missing required fields');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await this.prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    await auth.api.signUpEmail({
      body: {
        email: normalizedEmail,
        password,
        name: `${firstName} ${lastName}`,
      },
    });

    const user = await this.prisma.user.update({
      where: {
        email: normalizedEmail,
      },
      data: {
        firstName,
        lastName,
        username,
        birthDate: new Date(birthDate),
        phoneNumber,
        image,
      },
    });

    return {
      success: true,
      message: 'Registration successful',
      data: user,
    };
  }

  async login(loginData: LoginDto) {
    const { email, password } = loginData;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('Please verify your email');
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
      user,
    };
  }

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

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
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
