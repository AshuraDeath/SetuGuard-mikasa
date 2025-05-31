import { IsNotEmpty, IsString } from 'class-validator';

export class DomainCheckDto {
  @IsNotEmpty()
  @IsString()
  domain: string;
}
