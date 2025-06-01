import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FeedbackType } from '../enums/feedback-type.enum';

export interface FeedbackMetadata {
  userAgent?: string;
  timestamp?: string;
  [key: string]: any;
}

@Entity('feedback')
export class FeedbackEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  domain: string;

  @Column()
  type: FeedbackType;

  @Column()
  description: string;

  @Column({ type: 'text', nullable: true })
  screenshot: string;

  @Column()
  userId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: FeedbackMetadata;

  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
