import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,

   MailerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    transport: {
      host: config.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: config.get<number>('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: config.get<string>('EMAIL_USER'),
        pass: config.get<string>('EMAIL_PASSWORD'),
      },
    },
  }),
})
  ],

  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}