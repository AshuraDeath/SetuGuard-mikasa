import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cert_checks')
export class CertCheckEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  domain: string;

  @Column({ type: 'jsonb', nullable: true })
  certificateInfo: any;

  @Column({ type: 'boolean', default: false })
  isValid: boolean;

  @Column({ type: 'text', nullable: true })
  validationErrors: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
