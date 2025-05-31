import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CertGuardService } from './services/cert-guard.service';
import { CertCheckDto } from './dto/cert-check.dto';

@ApiTags('cert-guard')
@Controller('cert-guard')
export class CertGuardController {
  constructor(private readonly certGuardService: CertGuardService) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Check SSL/TLS certificate' })
  @ApiBody({ type: CertCheckDto })
  async checkCertificate(@Body() certCheckDto: CertCheckDto) {
    return this.certGuardService.checkCertificate(certCheckDto);
  }
}
