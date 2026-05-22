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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //  REGISTER
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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