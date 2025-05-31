import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('root')
@Controller('api')
export class RootController {
  @Get()
  getRoot() {
    return {
      status: 'success',
      message: 'Welcome to SetuGuard API',
      endpoints: {
        auth: '/api/auth',
        domainCheck: '/api/domain-check',
        docs: '/api/docs'
      }
    };
  }
}
