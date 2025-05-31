import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RPKIVerifyController } from './rpki-verify.controller';
import { RPKIVerifyService } from './services/rpki-verify.service';
import { RPKICheckEntity } from './entities/rpki-check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RPKICheckEntity])],
  controllers: [RPKIVerifyController],
  providers: [RPKIVerifyService],
})
export class RPKIVerifyModule {}
