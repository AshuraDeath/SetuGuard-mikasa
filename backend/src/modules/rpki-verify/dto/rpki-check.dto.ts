import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RPKICheckDto {
  /**
   * IP address to verify against RPKI
   * @example 192.0.2.1
   */
  @IsNotEmpty()
  @IsString()
  ip: string;

  /**
   * Optional: Prefix length for validation
   * @example 24
   */
  @IsOptional()
  @IsString()
  prefixLength?: string;

  /**
   * Optional: AS number to verify
   * @example 65000
   */
  @IsOptional()
  @IsString()
  asn?: string;
}
