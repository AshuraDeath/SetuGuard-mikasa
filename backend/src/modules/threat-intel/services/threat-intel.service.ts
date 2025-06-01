import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainAnalyzerService } from './ml/domain-analyzer.service';
import { PhishingDetectorService } from './ml/phishing-detector.service';
import { ModelManagerService } from './integration/model-manager.service';
import { ThreatFeedService } from './integration/threat-feed.service';

export type ThreatType = 'domain' | 'url' | 'ip' | 'email' | 'file' | 'hash';

export interface ThreatAnalysisResult {
  isMalicious: boolean;
  confidence: number;
  threatTypes: string[];
  metadata: Record<string, any>;
  analyzedAt: Date;
  source: string;
}

export interface ThreatAnalysisRequest {
  data: string;
  type?: ThreatType;
  context?: Record<string, any>;
}

/**
 * Unified Threat Intelligence Service
 * 
 * This is the main entry point for all threat intelligence operations.
 * It orchestrates between different specialized services to provide comprehensive
 * threat analysis capabilities.
 */
@Injectable()
export class ThreatIntelService {
  private readonly logger = new Logger(ThreatIntelService.name);

  constructor(
    private readonly domainAnalyzer: DomainAnalyzerService,
    private readonly phishingDetector: PhishingDetectorService,
    private readonly modelManager: ModelManagerService,
    private readonly threatFeed: ThreatFeedService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Analyze a potential threat
   * Automatically detects the type of threat if not specified
   */
  async analyze(request: ThreatAnalysisRequest): Promise<ThreatAnalysisResult> {
    const { data, type, context = {} } = request;
    const detectedType = type || this.detectThreatType(data);

    this.logger.log(`Analyzing ${detectedType}: ${data}`);

    try {
      // Ensure we have the latest models loaded
      try {
        await this.modelManager.checkForModelUpdates();
      } catch (error) {
        this.logger.warn(`Failed to update models: ${error.message}`);
        // Continue with existing models if update fails
      }
      // Check threat feeds first (skip for email type as it's not supported by the feed)
      if (detectedType !== 'email') {
        const feedResult = await this.threatFeed.checkIndicator(detectedType as 'domain' | 'url' | 'ip' | 'hash', data);
        if (feedResult?.isMalicious) {
          return {
            isMalicious: true,
            confidence: 0.95, // High confidence for known threats
            threatTypes: feedResult.details?.threatType ? [feedResult.details.threatType] : ['known_malicious'],
            metadata: { 
              source: 'threat_feed', 
              details: feedResult.details 
            },
            analyzedAt: new Date(),
            source: 'threat-feed',
          };
        }
      }

      // Perform type-specific analysis
      switch (detectedType) {
        case 'domain':
          return await this.analyzeDomain(data, context);
        case 'url':
          return await this.analyzeUrl(data, context);
        case 'ip':
          return await this.analyzeIp(data, context);
        case 'email':
          return await this.analyzeEmail(data, context);
        default:
          throw new Error(`Unsupported threat type: ${detectedType}`);
      }
    } catch (error) {
      this.logger.error(`Error analyzing ${detectedType}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Analyze a domain
   */
  async analyzeDomain(domain: string, context: Record<string, any> = {}): Promise<ThreatAnalysisResult> {
    // Get the current model info for domain analysis
    const modelInfo = this.modelManager.getModelInfo('DomainAnalyzer');
    
    // Add model version to context for analysis
    const analysisContext = {
      ...context,
      modelVersion: modelInfo?.version || 'unknown',
    };

    // Perform domain analysis
    const result = await this.domainAnalyzer.analyzeDomain(domain, analysisContext);
    
    // Log model usage
    if (modelInfo) {
      this.logger.log(`Using DomainAnalyzer model v${modelInfo.version} for analysis`);
    }

    return {
      ...result,
      analyzedAt: new Date(),
      source: 'domain-analyzer',
      metadata: {
        ...result.metadata,
        modelVersion: modelInfo?.version || 'unknown',
        modelStatus: modelInfo?.status || 'unknown'
      },
    };
  }

  /**
   * Analyze a URL for phishing or other threats
   */
  async analyzeUrl(url: string, context: Record<string, any> = {}): Promise<ThreatAnalysisResult> {
    // Get the current model info for phishing detection
    const modelInfo = this.modelManager.getModelInfo('PhishingDetector');
    
    // Add model version to context for analysis
    const analysisContext = {
      ...context,
      modelVersion: modelInfo?.version || 'unknown',
    };

    // Use the phishing detector's URL analysis
    const result = await this.phishingDetector.detectPhishingUrl(url, analysisContext);
    
    // Log model usage
    if (modelInfo) {
      this.logger.log(`Using PhishingDetector model v${modelInfo.version} for URL analysis`);
    }

    return {
      isMalicious: result.isPhishing,
      confidence: result.confidence,
      threatTypes: result.details?.threatTypes || [],
      metadata: {
        ...result.details,
        modelVersion: modelInfo?.version || 'unknown',
        modelStatus: modelInfo?.status || 'unknown'
      },
      analyzedAt: new Date(),
      source: 'phishing-detector',
    };
  }

  /**
   * Analyze an email for phishing or other threats
   */
  async analyzeEmail(email: string, context: Record<string, any> = {}): Promise<ThreatAnalysisResult> {
    // Get the current model info for phishing detection
    const modelInfo = this.modelManager.getModelInfo('PhishingDetector');
    
    // Add model version to context for analysis
    const analysisContext = {
      ...context,
      modelVersion: modelInfo?.version || 'unknown',
      analysisType: 'email',
    };

    // If email contains a URL, analyze it as well
    let urlAnalysis: ThreatAnalysisResult | null = null;
    if (email.includes('http')) {
      const urlMatch = email.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        urlAnalysis = await this.analyzeUrl(urlMatch[0], { 
          ...analysisContext,
          fromEmail: email,
          isEmbeddedInEmail: true 
        });
      }
    }
    
    // Basic email analysis
    const result: ThreatAnalysisResult = {
      isMalicious: urlAnalysis?.isMalicious || false,
      confidence: urlAnalysis?.confidence || 0,
      threatTypes: urlAnalysis?.threatTypes || [],
      metadata: {
        ...(urlAnalysis?.metadata || {}),
        modelVersion: modelInfo?.version || 'unknown',
        modelStatus: modelInfo?.status || 'unknown',
        message: urlAnalysis 
          ? 'Email contained URLs that were analyzed' 
          : 'Basic email analysis - no specific checks performed',
      },
      analyzedAt: new Date(),
      source: 'email-analyzer',
    };

    // Log model usage
    if (modelInfo) {
      this.logger.log(`Using PhishingDetector model v${modelInfo.version} for email analysis`);
    }

    return result;
  }

  /**
   * Analyze an IP address
   */
  async analyzeIp(ip: string, context: Record<string, any> = {}): Promise<ThreatAnalysisResult> {
    // Check threat feeds first
    const feedResult = await this.threatFeed.checkIndicator('ip', ip);
    
    if (feedResult?.isMalicious) {
      return {
        isMalicious: true,
        confidence: 0.8, // Default confidence for feed matches
        threatTypes: feedResult.details?.threatType ? [feedResult.details.threatType] : ['known_malicious'],
        metadata: { 
          source: 'threat_feed',
          details: feedResult.details 
        },
        analyzedAt: new Date(),
        source: 'threat-feed',
      };
    }

    // If no feed match, return a basic analysis
    return {
      isMalicious: false,
      confidence: 0,
      threatTypes: [],
      metadata: {},
      analyzedAt: new Date(),
      source: 'basic-analysis',
    };
  }

  /**
   * Detect the type of threat based on the input
   */
  private detectThreatType(input: string): ThreatType {
    // Simple detection logic - can be enhanced
    if (input.includes('@')) return 'email';
    if (input.startsWith('http://') || input.startsWith('https://')) return 'url';
    if (input.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) return 'ip';
    if (input.match(/^[a-f0-9]{32}$/i) || input.match(/^[a-f0-9]{40}$/i) || input.match(/^[a-f0-9]{64}$/i)) return 'hash';
    if (input.match(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i)) return 'domain';
    
    // Default to domain if no match
    return 'domain';
  }
}
