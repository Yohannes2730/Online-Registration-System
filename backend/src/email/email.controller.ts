import {
  Controller,
  Post} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDto } from './dto/email.dto';
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  
  }

 

