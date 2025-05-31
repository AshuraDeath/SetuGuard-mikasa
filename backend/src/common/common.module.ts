import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RootController } from './root.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
  ],
  providers: [
    ConfigService,
  ],
  controllers: [
    RootController,
  ],
  exports: [
    ConfigService,
  ],
})
export class CommonModule {}
