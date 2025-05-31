import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('domain_checks')
export class DomainCheckEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  domain: string;

  @Column({ type: 'jsonb' })
  results: {
    isSuspicious: boolean;
    similarityScore: number;
    typosquattingDetected: boolean;
    certificateStatus: string;
    dnsStatus: string;
  };

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
