import { IsNotEmpty, IsString, IsOptional, IsEnum, IsObject, IsUrl, IsEmail, IsIP } from 'class-validator';
import { FeedbackType } from '../enums/feedback-type.enum';

export interface FeedbackMetadata {
  userAgent?: string;
  ipAddress?: string;
  email?: string;
  url?: string;
  [key: string]: any;
}

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  domain: string;

  @IsNotEmpty()
  @IsEnum(FeedbackType, { message: 'Invalid feedback type' })
  type: FeedbackType;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsString()
  screenshot?: string;

  @IsOptional()
  @IsObject()
  metadata?: FeedbackMetadata;
}
