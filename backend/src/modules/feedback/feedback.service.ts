import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackEntity } from './entities/feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackEntity)
    private feedbackRepository: Repository<FeedbackEntity>,
  ) {}

  async createFeedback(dto: CreateFeedbackDto) {
    const feedback = this.feedbackRepository.create({
      ...dto,
      userId: 'user-id', // TODO: Get from auth context
    });

    return this.feedbackRepository.save(feedback);
  }

  async getFeedbackHistory() {
    return this.feedbackRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
