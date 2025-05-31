import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dns_checks')
export class DnsCheckEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  domain: string;

  @Column({ type: 'jsonb', nullable: true })
  dnsRecords: any;

  @Column({ type: 'boolean', default: false })
  hasDnsSec: boolean;

  @Column({ type: 'boolean', default: false })
  hasDnsOverHttps: boolean;

  @Column({ type: 'boolean', default: false })
  hasDnsOverTls: boolean;

  @Column({ type: 'text', nullable: true })
  validationErrors: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
