import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('root')
@Controller('api')
export class RootController {
  @Get()
  @ApiOperation({ summary: 'Get API root information and endpoints' })
  @ApiResponse({
    status: 200,
    description: 'Returns API root information and available endpoints',
    schema: {
      example: {
        status: 'success',
        message: 'Welcome to SetuGuard API',
        endpoints: {
          auth: '/api/auth',
          domainCheck: '/api/domain-check',
          certGuard: '/api/cert-guard',
          dnsProtect: '/api/dns-protect',
          health: '/api/health',
          rpkiVerify: '/api/rpki-verify',
          feedback: '/api/feedback',
          docs: '/api/docs'
        }
      }
    }
  })
  getRoot() {
    return {
      status: 'success',
      message: 'Welcome to SetuGuard API',
      endpoints: {
        auth: '/api/auth',
        domainCheck: '/api/domain-check',
        certGuard: '/api/cert-guard',
        dnsProtect: '/api/dns-protect',
        health: '/api/health',
        rpkiVerify: '/api/rpki-verify',
        feedback: '/api/feedback',
        docs: '/api/docs'
      }
    };
  }
}
