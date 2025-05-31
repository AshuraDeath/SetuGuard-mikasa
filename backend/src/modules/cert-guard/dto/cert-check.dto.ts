import { IsNotEmpty, IsString } from 'class-validator';

export class CertCheckDto {
  @IsNotEmpty()
  @IsString()
  domain: string;
}
