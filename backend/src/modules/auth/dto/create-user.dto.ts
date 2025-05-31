import { IsNotEmpty, IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  browser: string;

  @IsString()
  @IsOptional()
  browserVersion?: string;

  @IsString()
  @IsOptional()
  extensionVersion?: string;
}
