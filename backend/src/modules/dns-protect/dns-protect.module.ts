import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnsProtectController } from './dns-protect.controller';
import { DnsProtectService } from './services/dns-protect.service';
import { DnsCheckEntity } from './entities/dns-check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DnsCheckEntity])],
  controllers: [DnsProtectController],
  providers: [DnsProtectService],
})
export class DnsProtectModule {}
