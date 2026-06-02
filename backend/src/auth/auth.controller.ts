import { Controller, Post, Body, Get, Req, Headers } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';
import { EmailService } from '../email/email.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  //  REGISTER
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('verify-otp')
  verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.emailService.verifyOtp(body.email, body.otp);
  }
// resend otp
  @Post('resend-otp')
  resendOtp(@Body() body: { email: string }) {
    return this.emailService.resendOtp(body.email);
  }
  //  LOGIN
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  //  LOGOUT
  @Post('logout')
  logout(@Headers('authorization') token: string) {
    return this.authService.logout(token);
  }

  //  GET CURRENT USER
  @Get('me')
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user?.id);
  }
}
