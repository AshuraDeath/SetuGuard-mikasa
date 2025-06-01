import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ThreatAnalysis } from './entities/threat-analysis.entity';
import { ThreatIndicator } from './entities/threat-indicator.entity';
import { ThreatIntelService } from './services/threat-intel.service';

import { ModelManagerService } from './services/integration/model-manager.service';
import { ThreatFeedService } from './services/integration/threat-feed.service';
import { DomainAnalyzerService } from './services/ml/domain-analyzer.service';
import { PhishingDetectorService } from './services/ml/phishing-detector.service';

/**
 * Threat Intelligence Module
 * 
 * This module provides threat intelligence capabilities including:
 * - Domain analysis and reputation checking
 * - Phishing URL and email detection
 * - Threat feed integration
 * - ML model management
 * 
 * ## Installation
 * 
 * 1. Import the module in your feature module:
 * 
 * ```typescript
 * @Module({
 *   imports: [
 *     // ... other imports
 *     ThreatIntelModule,
 *   ],
 * })
 * export class YourModule {}
 * ```
 * 
 * ## Available Services
 * 
 * ### 1. DomainAnalyzerService
 * For analyzing domains and checking their reputation:
 * ```typescript
 * constructor(private domainAnalyzer: DomainAnalyzerService) {}
 * 
 * async checkDomain(domain: string) {
 *   const result = await this.domainAnalyzer.analyzeDomain(domain);
 *   return result;
 * }
 * ```
 * 
 * ### 2. PhishingDetectorService
 * For detecting phishing attempts in URLs and emails:
 * ```typescript
 * constructor(private phishingDetector: PhishingDetectorService) {}
 * 
 * async checkUrl(url: string) {
 *   return this.phishingDetector.detectPhishingUrl(url);
 * }
 * ```
 * 
 * ### 3. ThreatIntelService
 * High-level service combining all threat intel capabilities:
 * ```typescript
 * constructor(private threatIntel: ThreatIntelService) {}
 * 
 * async analyzeThreat(data: string, type: 'domain' | 'url' | 'ip' | 'email') {
 *   return this.threatIntel.analyze({ data, type });
 * }
 * ```
 * 
 * ## Configuration
 * 
 * Ensure these environment variables are set in your .env file:
 * ```
 * ML_SERVICE_URL=http://localhost:5000  # URL to your ML service
 * THREAT_FEED_URLS=https://example.com/feed1,https://example.com/feed2
 * THREAT_FEED_UPDATE_INTERVAL=3600000  # 1 hour in ms
 * ```
 * 
 * ## Security
 * All endpoints are protected by JWT authentication and role-based access control.
 * Use the @Roles() decorator to restrict access as needed.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ThreatAnalysis, ThreatIndicator]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        timeout: 5000,
        maxRedirects: 3,
      }),
    }),
  ],
  providers: [
    ThreatIntelService,
    ModelManagerService,
    ThreatFeedService,
    DomainAnalyzerService,
    PhishingDetectorService,
  ],
  // Only export the main service to ensure all threat intel goes through a single entry point
  exports: [
    ThreatIntelService,
    DomainAnalyzerService,
    PhishingDetectorService,
    ModelManagerService,
    ThreatFeedService
  ],
})
export class ThreatIntelModule {}
