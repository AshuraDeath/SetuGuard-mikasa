import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { CertGuardModule } from './modules/cert-guard/cert-guard.module';
import { DnsProtectModule } from './modules/dns-protect/dns-protect.module';
import { DomainCheckModule } from './modules/domain-check/domain-check.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { HealthModule } from './modules/health/health.module';
import { RPKIVerifyModule } from './modules/rpki-verify/rpki-verify.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === process.env.NODE_ENV,
      logging: process.env.NODE_ENV === process.env.NODE_ENV,
    }),
    CommonModule,
    AuthModule,
    CertGuardModule,
    DnsProtectModule,
    DomainCheckModule,
    FeedbackModule,
    HealthModule,
    RPKIVerifyModule,
  ],
  providers: [],
  exports: [JwtAuthGuard, RolesGuard, Roles],
})
export class AppModule {}
