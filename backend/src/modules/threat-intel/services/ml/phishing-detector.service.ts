import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ThreatAnalysis } from '../../entities/threat-analysis.entity';
import { BaseMLService } from './base-ml.service';

/**
 * Service for detecting phishing attempts using ML models
 * Analyzes URLs, email content, and website content for phishing indicators
 */
@Injectable()
export class PhishingDetectorService extends BaseMLService {
  constructor(
    @InjectRepository(ThreatAnalysis)
    threatAnalysisRepo: Repository<ThreatAnalysis>,
    configService: ConfigService,
    httpService: HttpService,
  ) {
    super(threatAnalysisRepo, configService, httpService);
    this.modelName = 'PhishingDetector';
  }

  /**
   * Check if a URL is likely a phishing attempt
   */
  async detectPhishingUrl(
    url: string,
    context: Record<string, any> = {},
  ): Promise<{ isPhishing: boolean; confidence: number; details: any }> {
    try {
      const features = await this.preprocessUrl(url);
      
      const mlResponse = await this.callMLService('/detect/phishing/url', {
        url,
        features,
        context,
      });

      const result = {
        isPhishing: mlResponse.score > 0.7, // Threshold can be configured
        confidence: mlResponse.score,
        details: mlResponse,
      };

      await this.logAnalysis(
        { url, features },
        result,
        { analysisType: 'phishing_url', ...context },
      );

      return result;
    } catch (error) {
      this.logger.error(`Phishing detection failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Analyze email content for phishing indicators
   */
  async analyzeEmail(
    email: { subject: string; body: string; from: string; to: string },
    context: Record<string, any> = {},
  ): Promise<any> {
    try {
      const features = await this.preprocessEmail(email);
      
      const mlResponse = await this.callMLService('/analyze/email', {
        ...email,
        features,
        context,
      });

      const result = {
        isPhishing: mlResponse.score > 0.7,
        confidence: mlResponse.score,
        indicators: mlResponse.indicators || [],
        details: mlResponse,
      };

      await this.logAnalysis(
        { email: { ...email, body: email.body.substring(0, 500) + '...' } },
        result,
        { analysisType: 'phishing_email', ...context },
      );

      return result;
    } catch (error) {
      this.logger.error(`Email analysis failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Preprocess URL for phishing detection
   */
  private async preprocessUrl(url: string): Promise<Record<string, any>> {
    try {
      const urlObj = new URL(url);
      return {
        url_length: url.length,
        domain_length: urlObj.hostname.length,
        path_length: urlObj.pathname.length,
        has_port: !!urlObj.port,
        has_query: !!urlObj.search,
        has_fragment: !!urlObj.hash,
        has_at_symbol: url.includes('@'),
        has_ip: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url),
        // Add more URL-based features
      };
    } catch (error) {
      this.logger.warn(`Invalid URL during preprocessing: ${url}`);
      return { invalid_url: true };
    }
  }

  /**
   * Preprocess email for analysis
   */
  private async preprocessEmail(email: {
    subject: string;
    body: string;
    from: string;
    to: string;
  }): Promise<Record<string, any>> {
    return {
      subject_length: email.subject.length,
      body_length: email.body.length,
      has_links: /https?:\/\//.test(email.body),
      has_attachments: /attachment|Content-Disposition: attachment/i.test(email.body),
      from_domain: email.from.split('@')[1] || '',
      to_domain: email.to.split('@')[1] || '',
      // Add more email-based features
    };
  }

  protected async preprocess(data: any): Promise<Record<string, any>> {
    // Implement abstract method
    return {};
  }

  protected async postprocess(output: any): Promise<Record<string, any>> {
    // Add any post-processing logic here
    return {
      ...output,
      processedAt: new Date().toISOString(),
    };
  }
}
