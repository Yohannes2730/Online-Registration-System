import { IsEmail, IsString } from "class-validator";

export class EmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;
  @IsString()
  otp :string;

  @IsString()
  message: string;
}