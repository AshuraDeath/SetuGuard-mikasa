import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertGuardController } from './cert-guard.controller';
import { CertGuardService } from './services/cert-guard.service';
import { CertCheckEntity } from './entities/cert-check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CertCheckEntity])],
  controllers: [CertGuardController],
  providers: [CertGuardService],
})
export class CertGuardModule {}
