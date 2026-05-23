import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';
import { auth } from '../auth/auth';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

    return {
      success: true,
      message: 'User registered successfully',
      data: result,
    };
  }

  // ---------------- LOGIN ----------------
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const session = await auth.api.signInEmail({
      body: {
        email: email.trim().toLowerCase(),
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