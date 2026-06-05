import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Headers,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';

import { EmailService } from '../email/email.service';
import { SendOtpDto } from '../email/dto/email.send.dto';
import { VerifyOtpDto } from '../email/dto/email.verify.dto';
import { ResendOtpDto } from '../email/dto/email.resend.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  // ---------------- REGISTER ----------------
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // ---------------- LOGIN ----------------
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ---------------- VERIFY OTP ----------------
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.emailService.verifyOtp(dto.email, dto.otp);
  }

  // ---------------- RESEND OTP ----------------
  @Post('resend-otp')
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.emailService.resendOtp(dto.email);
  }

  // ---------------- FORGOT PASSWORD ----------------
  @Post('forgot-password')
  forgotPassword(@Body() dto: SendOtpDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // ---------------- RESET PASSWORD ----------------
  @Post('reset-password')
  resetPassword(
    @Body()
    body: {
      email: string;
      otp: string;
      newPassword: string;
    },
  ) {
    return this.authService.resetPassword(
      body.email,
      body.otp,
      body.newPassword,
    );
  }

  // ---------------- LOGOUT ----------------
  @Post('logout')
  logout(@Headers('authorization') token: string) {
    return this.authService.logout(token);
  }

  // ---------------- GET CURRENT USER ----------------
  @Get('me')
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user?.id);
  }
}