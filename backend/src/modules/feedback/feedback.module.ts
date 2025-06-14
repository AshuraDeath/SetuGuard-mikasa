import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './service/feedback.service';
import { FeedbackEntity } from './entities/feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedbackEntity]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
