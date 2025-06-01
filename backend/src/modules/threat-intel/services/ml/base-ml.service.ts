import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThreatAnalysis } from '../../entities/threat-analysis.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Base class for all ML-based analysis services
 * Handles common ML operations, model management, and integration with Python ML services
 */
@Injectable()
export abstract class BaseMLService {
  protected readonly logger = new Logger(this.constructor.name);
  protected modelVersion: string = '1.0.0';
  protected modelName: string = this.constructor.name.replace('Service', '');

  constructor(
    @InjectRepository(ThreatAnalysis)
    protected readonly threatAnalysisRepo: Repository<ThreatAnalysis>,
    protected readonly configService: ConfigService,
    protected readonly httpService: HttpService,
  ) {}

  /**
   * Preprocess input data for the model
   */
  protected abstract preprocess(data: any): Promise<Record<string, any>>;

  /**
   * Post-process model output
   */
  protected abstract postprocess(output: any): Promise<Record<string, any>>;

  /**
   * Call the ML service endpoint
   */
  protected async callMLService(
    endpoint: string,
    data: any,
  ): Promise<any> {
    const mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL', 'http://ml-service:5000');
    const url = `${mlServiceUrl}${endpoint}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, {
          ...data,
          model: this.modelName,
          version: this.modelVersion,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `ML Service call failed: ${error.message}`,
        error.stack,
      );
      throw new Error(`ML Service unavailable: ${error.message}`);
    }
  }

  /**
   * Log analysis results for monitoring and retraining
   */
  protected async logAnalysis(
    input: any,
    output: any,
    metadata: Record<string, any> = {},
  ): Promise<ThreatAnalysis> {
    const analysis = this.threatAnalysisRepo.create({
      input,
      output,
      metadata: {
        ...metadata,
        service: this.constructor.name,
      },
      isTrainingData: metadata?.isTrainingData ?? false,
    } as any);

    return this.threatAnalysisRepo.save(analysis as unknown as ThreatAnalysis);
  }

  /**
   * Get the latest model version from the model registry
   */
  protected async getLatestModelVersion(): Promise<string> {
    // Implementation would check a model registry or config service
    return this.modelVersion;
  }

  /**
   * Check if the model needs to be updated
   */
  protected async checkForModelUpdates(): Promise<boolean> {
    const latestVersion = await this.getLatestModelVersion();
    return latestVersion !== this.modelVersion;
  }
}
