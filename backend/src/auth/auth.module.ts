import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PrismaModule } from '../../prisma/prisma.module';

import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule, // IMPORTANT
  ],

  controllers: [AuthController],

  providers: [AuthService],
})
export class AuthModule {}