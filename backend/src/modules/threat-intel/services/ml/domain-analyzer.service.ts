import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { ThreatAnalysis } from "../../entities/threat-analysis.entity";
import { BaseMLService } from "./base-ml.service";

@Injectable()
export class DomainAnalyzerService extends BaseMLService {
  constructor(
    @InjectRepository(ThreatAnalysis)
    threatAnalysisRepo: Repository<ThreatAnalysis>,
    configService: ConfigService,
    httpService: HttpService
  ) {
    super(threatAnalysisRepo, configService, httpService);
    this.modelName = "DomainAnalyzer";
  }

  /**
   * Analyze a domain for potential threats
   * @param domain The domain to analyze (e.g., 'example.com')
   * @param context Additional context for analysis (optional)
   * @returns Promise with analysis results including:
   * - isMalicious: boolean
   * - confidence: number (0-1)
   * - threatTypes: string[]
   * - reputationScore: number (0-100)
   * - metadata: Additional analysis data
   * 
   * @example
   * const result = await domainAnalyzer.analyzeDomain('example.com');
   * if (result.isMalicious) {
   *   console.log('Domain is malicious!', result.threatTypes);
   * }
   */
  async analyzeDomain(
    domain: string,
    context: Record<string, any> = {}
  ): Promise<any> {
    try {
      // Preprocess the domain
      const features = await this.preprocess(domain);

      // Call ML service
      const mlResponse = await this.callMLService("/analyze/domain", {
        domain,
        features,
        context,
      });

      // Post-process the results
      const result = await this.postprocess(mlResponse);

      // Log the analysis
      await this.logAnalysis({ domain, features }, result, {
        analysisType: "domain",
        ...context,
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Domain analysis failed: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Preprocess domain for analysis
   */
  protected async preprocess(domain: string): Promise<Record<string, any>> {
    // Extract features from domain
    const domainParts = domain.split(".");
    const tld = domainParts.pop();
    const sld = domainParts.pop() || "";

    return {
      domain_length: domain.length,
      tld_length: tld?.length || 0,
      sld_length: sld.length,
      has_hyphen: domain.includes("-"),
      has_number: /\d/.test(domain),
      subdomain_count: Math.max(0, domainParts.length - 1),
      // Add more features as needed
    };
  }

  /**
   * Post-process ML service response
   */
  protected async postprocess(output: any): Promise<Record<string, any>> {
    // Add any post-processing logic here
    return {
      ...output,
      processedAt: new Date().toISOString(),
    };
  }

  /**
   * Batch analyze multiple domains
   */
  async analyzeDomains(
    domains: string[],
    context: Record<string, any> = {}
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const domain of domains) {
      try {
        results[domain] = await this.analyzeDomain(domain, context);
      } catch (error) {
        results[domain] = { error: error.message };
      }
    }

    return results;
  }
}
