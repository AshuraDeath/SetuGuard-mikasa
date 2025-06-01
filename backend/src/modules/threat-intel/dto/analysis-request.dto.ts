import { IsString, IsOptional, IsObject, IsNumber, IsBoolean } from 'class-validator';

export class AnalysisRequestDto {
  @IsString()
  target: string; // Domain, IP, URL, etc.

  @IsString()
  @IsOptional()
  type?: 'domain' | 'ip' | 'url' | 'email';

  @IsObject()
  @IsOptional()
  context?: Record<string, any>; // Additional context for analysis

  @IsNumber()
  @IsOptional()
  timeout?: number = 5000; // Timeout in ms

  @IsBoolean()
  @IsOptional()
  detailed?: boolean = false; // Whether to return detailed analysis
}
