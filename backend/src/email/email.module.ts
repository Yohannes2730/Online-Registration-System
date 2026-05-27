import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { EmailService } from './email.service';
import { EmailController } from './email.controller';

import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,

    MailerModule.forRoot({
      transport: {
        service: 'gmail',

        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },

      defaults: {
        from: `"No Reply" <${process.env.EMAIL_USER}>`,
      },
    }),
  ],

  controllers: [EmailController],

  providers: [EmailService],

  exports: [EmailService],
})
export class EmailModule {}