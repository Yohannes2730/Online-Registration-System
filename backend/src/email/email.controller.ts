import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDto } from './dto/email.dto';
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  
  }

 

