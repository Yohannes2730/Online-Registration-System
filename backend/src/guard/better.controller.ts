import {Controller, UseGuards, Req, Get } from '@nestjs/common';
import { BetterAuthGuard } from './better.guard';


@Controller('auth')
export class BetterController {

  @UseGuards(BetterAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return {
      success: true,
      user: req.user,
    };
  }
}