import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RPKICheckDto } from './dto/rpki-check.dto';
import { RPKIVerifyService } from './services/rpki-verify.service';

@ApiTags('rpki-verify')
@Controller('rpki-verify')
export class RPKIVerifyController {
  constructor(private readonly rpkiVerifyService: RPKIVerifyService) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Verify RPKI validity' })
  @ApiBody({ type: RPKICheckDto })
  async verifyRPKI(@Body() rpkiCheckDto: RPKICheckDto) {
    return this.rpkiVerifyService.verifyRPKI(rpkiCheckDto);
  }
}
