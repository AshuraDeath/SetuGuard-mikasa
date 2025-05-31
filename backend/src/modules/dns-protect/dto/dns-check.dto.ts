import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class DnsCheckDto {
  /**
   * Domain name to check DNS security for
   * @example example.com
   */
  @IsNotEmpty()
  @IsString()
  domain: string;

  /**
   * Optional: Specific DNS record types to check
   * @example ['A', 'AAAA', 'MX', 'TXT']
   */
  @IsOptional()
  @IsString({ each: true })
  recordTypes?: string[];
}
