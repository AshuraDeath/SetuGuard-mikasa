import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between, IsNull, Not } from 'typeorm';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { FeedbackEntity } from '../entities/feedback.entity';

import { FeedbackType } from '../enums/feedback-type.enum';

export interface FeedbackQueryOptions {
  page?: number | string;
  limit?: number | string;
  search?: string;
  type?: FeedbackType | string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  isArchived?: boolean;
}

@Injectable()
export class FeedbackService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 20;
  private readonly MAX_LIMIT = 100;

  constructor(
    @InjectRepository(FeedbackEntity)
    private feedbackRepository: Repository<FeedbackEntity>,
  ) {}

  /**
   * Create new feedback
   * @param dto Feedback data
   * @returns Created feedback
   */
  async createFeedback(dto: CreateFeedbackDto): Promise<FeedbackEntity> {
    try {
      const feedback = this.feedbackRepository.create({
        ...dto,
        userId: 'user-id', // TODO: Get from auth context
        metadata: {
          ...dto.metadata,
          userAgent: dto.metadata?.userAgent || 'unknown',
          timestamp: new Date().toISOString(),
        }
      });

      return await this.feedbackRepository.save(feedback);
    } catch (error) {
      throw new BadRequestException('Failed to create feedback');
    }
  }

  /**
   * Get feedback by ID
   * @param id Feedback ID
   * @returns Single feedback item
   */
  async getFeedbackById(id: string | number): Promise<FeedbackEntity> {
    const feedback = await this.feedbackRepository.findOne({ 
      where: { id: Number(id) } 
    });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  /**
   * Get paginated feedback history with filtering options
   * @param options Query options (pagination, filters)
   * @returns Paginated feedback results
   */
  async getFeedbackHistory(
    options: FeedbackQueryOptions = {},
  ): Promise<{ data: FeedbackEntity[]; total: number }> {
    const {
      page = this.DEFAULT_PAGE,
      limit = this.DEFAULT_LIMIT,
      search,
      type,
      startDate,
      endDate,
      userId,
      isArchived,
    } = options;

    // Validate pagination
    const take = Math.min(Number(limit), this.MAX_LIMIT);
    const skip = (Math.max(1, Number(page)) - 1) * take;

    // Build where conditions
    const where: FindOptionsWhere<FeedbackEntity> = {};

    if (search) {
      where.description = Like(`%${search}%`);
    }

    if (type) {
      where.type = type as any; // Type is validated by DTO
    }

    if (startDate || endDate) {
      where.createdAt = Between(
        startDate || new Date(0),
        endDate || new Date(),
      );
    }

    if (userId) {
      where.userId = userId;
    }

    if (isArchived !== undefined) {
      where.archivedAt = isArchived ? Not(IsNull()) : IsNull();
    }

    try {
      const [data, total] = await this.feedbackRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        take,
        skip,
      });

      return { data, total };
    } catch (error) {
      throw new BadRequestException('Failed to fetch feedback history');
    }
  }

  /**
   * Archive a feedback item
   * @param id Feedback ID to archive
   * @returns Archived feedback
   */
  /**
   * Archive a feedback item
   * @param id Feedback ID to archive (string or number)
   * @returns Archived feedback
   */
  async archiveFeedback(id: string | number): Promise<FeedbackEntity> {
    const feedback = await this.getFeedbackById(id);
    feedback.archivedAt = new Date();
    return this.feedbackRepository.save(feedback);
  }

  /**
   * Delete a feedback item
   * @param id Feedback ID to delete (string or number)
   * @throws {NotFoundException} If feedback with given ID is not found
   */
  async deleteFeedback(id: string | number): Promise<void> {
    const result = await this.feedbackRepository.delete(Number(id));
    if (result.affected === 0) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
  }
}
