import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DnsCheckDto } from './dto/dns-check.dto';
import { DnsProtectService } from './services/dns-protect.service';

@ApiTags('dns-protect')
@Controller('dns-protect')
export class DnsProtectController {
  constructor(private readonly dnsProtectService: DnsProtectService) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Check DNS security' })
  @ApiBody({ type: DnsCheckDto })
  async checkDnsSecurity(@Body() dnsCheckDto: DnsCheckDto) {
    return this.dnsProtectService.checkDnsSecurity(dnsCheckDto);
  }
}
