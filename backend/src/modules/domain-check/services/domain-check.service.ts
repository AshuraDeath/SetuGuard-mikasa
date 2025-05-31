import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainCheckEntity } from '../entities/domain-check.entity';
import { DomainCheckDto } from '../dto/domain-check.dto';

@Injectable()
export class DomainCheckService {
  constructor(
    @InjectRepository(DomainCheckEntity)
    private domainCheckRepository: Repository<DomainCheckEntity>,
  ) {}

  async checkDomain(domain: string): Promise<any> {
    // TODO: Implement domain checking logic
    return {
      domain,
      isSuspicious: false,
      similarityScore: 0,
      typosquattingDetected: false,
      certificateStatus: 'valid',
      dnsStatus: 'valid',
    };
  }

  async saveCheckResult(domain: string, results: any, userId: string): Promise<DomainCheckEntity> {
    const entity = this.domainCheckRepository.create({
      domain,
      results,
      userId,
    });

    return this.domainCheckRepository.save(entity);
  }

  async getCheckHistory(userId: string): Promise<DomainCheckEntity[]> {
    return this.domainCheckRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
