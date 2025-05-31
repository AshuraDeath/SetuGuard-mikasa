import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { DomainCheckController } from './domain-check.controller';
import { DomainCheckService } from './services/domain-check.service';
import { DomainCheckEntity } from './entities/domain-check.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DomainCheckEntity]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [DomainCheckController],
  providers: [DomainCheckService],
  exports: [DomainCheckService],
})
export class DomainCheckModule {}
