import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity for storing threat indicators (IOCs - Indicators of Compromise)
 * Can be used to store known malicious domains, IPs, hashes, etc.
 */
@Entity('threat_indicators')
export class ThreatIndicator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  type: 'domain' | 'ip' | 'hash' | 'url' | 'email';

  @Column()
  @Index()
  value: string;

  @Column({ default: 'unknown' })
  threatType: string; // malware, phishing, c2, etc.

  @Column('jsonb', { default: {} })
  metadata: {
    source?: string;
    firstSeen?: Date;
    lastSeen?: Date;
    confidence?: number;
    tags?: string[];
    description?: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date; // When this indicator should be considered stale
}
