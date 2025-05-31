import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('rpki_checks')
export class RPKICheckEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ip: string;

  @Column({ type: 'jsonb', nullable: true })
  rpkiValidation: any;

  @Column({ type: 'jsonb', nullable: true })
  roaInformation: any;

  @Column({ type: 'boolean', default: false })
  isValid: boolean;

  @Column({ type: 'text', nullable: true })
  validationErrors: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
