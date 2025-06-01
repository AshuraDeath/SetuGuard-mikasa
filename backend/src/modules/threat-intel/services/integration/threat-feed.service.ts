import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ThreatIndicator } from '../../entities/threat-indicator.entity';

/**
 * Service for managing and querying threat intelligence feeds
 * Integrates with external threat intelligence platforms and maintains a local cache
 */
@Injectable()
export class ThreatFeedService {
  private readonly logger = new Logger(ThreatFeedService.name);
  private readonly updateInterval: number;
  private lastUpdate: Date;

  constructor(
    @InjectRepository(ThreatIndicator)
    private readonly threatIndicatorRepo: Repository<ThreatIndicator>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.updateInterval = this.configService.get<number>('THREAT_FEED_UPDATE_INTERVAL', 3600 * 1000); // 1 hour
    this.lastUpdate = new Date(0); // Epoch start
  }

  /**
   * Check if an indicator exists in threat feeds
   */
  async checkIndicator(
    type: 'domain' | 'ip' | 'hash' | 'url',
    value: string,
  ): Promise<{ isMalicious: boolean; details?: ThreatIndicator }> {
    // Check local cache first
    const indicator = await this.threatIndicatorRepo.findOne({
      where: { type, value, isActive: true },
    });

    if (indicator) {
      return { isMalicious: true, details: indicator };
    }

    // If not found locally and feed needs update, update first
    if (this.shouldUpdateFeeds()) {
      await this.updateFeeds();
      return this.checkIndicator(type, value);
    }

    return { isMalicious: false };
  }

  /**
   * Update threat feeds from configured sources
   */
  async updateFeeds(): Promise<void> {
    const feedUrls = this.configService.get<string[]>('THREAT_FEED_URLS', []);
    
    if (feedUrls.length === 0) {
      this.logger.warn('No threat feed URLs configured');
      return;
    }

    this.logger.log(`Updating threat feeds from ${feedUrls.length} sources`);
    
    try {
      for (const url of feedUrls) {
        await this.updateFeedFromUrl(url);
      }
      this.lastUpdate = new Date();
      this.logger.log('Threat feeds updated successfully');
    } catch (error) {
      this.logger.error(`Failed to update threat feeds: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update feed from a specific URL
   */
  private async updateFeedFromUrl(url: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const indicators = this.parseFeedData(response.data, url);
      
      // Save indicators to database
      await this.saveIndicators(indicators);
      
      this.logger.log(`Updated ${indicators.length} indicators from ${url}`);
    } catch (error) {
      this.logger.error(`Failed to update feed from ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse feed data into ThreatIndicator entities
   */
  private parseFeedData(data: any, source: string): ThreatIndicator[] {
    // This is a simplified parser - should be customized based on feed format
    if (Array.isArray(data)) {
      return data.map(item => {
        const indicator = new ThreatIndicator();
        indicator.type = item.type || 'unknown';
        indicator.value = item.indicator || item.value;
        indicator.threatType = item.threat_type || 'malicious';
        indicator.metadata = {
          source,
          firstSeen: item.first_seen || new Date(),
          lastSeen: item.last_seen || new Date(),
          ...(item.metadata || {}),
        };
        indicator.isActive = true;
        return indicator;
      });
    }
    return [];
  }

  /**
   * Save indicators to database with deduplication
   */
  private async saveIndicators(indicators: ThreatIndicator[]): Promise<void> {
    for (const indicator of indicators) {
      try {
        // Check if indicator already exists
        const existing = await this.threatIndicatorRepo.findOne({
          where: {
            type: indicator.type,
            value: indicator.value,
          },
        });

        if (existing) {
          // Update existing indicator
          existing.isActive = true;
          existing.metadata = {
            ...existing.metadata,
            ...indicator.metadata,
            lastSeen: new Date(),
          };
          await this.threatIndicatorRepo.save(existing);
        } else {
          // Create new indicator
          await this.threatIndicatorRepo.save(indicator);
        }
      } catch (error) {
        this.logger.error(
          `Failed to save indicator ${indicator.value}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Check if feeds should be updated based on last update time
   */
  private shouldUpdateFeeds(): boolean {
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - this.lastUpdate.getTime();
    return timeSinceLastUpdate > this.updateInterval;
  }

  /**
   * Get indicators matching specific criteria
   */
  async findIndicators(criteria: {
    type?: string;
    threatType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ThreatIndicator[]; total: number }> {
    const query = this.threatIndicatorRepo.createQueryBuilder('indicator')
      .where('indicator.isActive = :isActive', { isActive: true });

    if (criteria.type) query.andWhere('indicator.type = :type', { type: criteria.type });
    if (criteria.threatType) query.andWhere('indicator.threatType = :threatType', { threatType: criteria.threatType });

    const [data, total] = await query
      .take(criteria.limit || 100)
      .skip(criteria.offset || 0)
      .orderBy('indicator.updatedAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }
}
