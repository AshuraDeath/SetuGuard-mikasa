import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FeedbackType } from '../enums/feedback-type.enum';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
