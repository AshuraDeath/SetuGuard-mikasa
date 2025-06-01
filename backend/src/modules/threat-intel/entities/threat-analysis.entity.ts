import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity for storing ML model analysis results
 * Tracks model predictions, inputs, and performance
 */
@Entity('threat_analysis')
export class ThreatAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  model: string; // Name of the ML model used

  @Column('float', { nullable: true })
  confidence: number;

  @Column('jsonb', { default: {} })
  input: Record<string, any>; // Raw input data

  @Column('jsonb', { default: {} })
  output: Record<string, any>; // Model output

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>; // Additional metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ default: false })
  isTrainingData: boolean; // Whether to use for model training
}
