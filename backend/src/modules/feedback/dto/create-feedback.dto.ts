import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { FeedbackType } from '../enums/feedback-type.enum';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  domain: string;

  @IsNotEmpty()
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  screenshot?: string;
}
