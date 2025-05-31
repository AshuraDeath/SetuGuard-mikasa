import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DomainCheckDto } from './dto/domain-check.dto';
import { DomainCheckService } from './services/domain-check.service';

@ApiTags('domain-check')
@Controller('domain-check')
export class DomainCheckController {
  constructor(private readonly domainCheckService: DomainCheckService) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Check a domain for potential threats' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        domain: { type: 'string' }
      }
    }
  })
  async checkDomain(@Body() body: { domain: string }): Promise<any> {
    const { domain } = body;
    const results = await this.domainCheckService.checkDomain(domain);
    return results;
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Get domain check history' })
  async getCheckHistory(@Param('id') userId: string): Promise<any> {
    return await this.domainCheckService.getCheckHistory(userId);
  }
}
