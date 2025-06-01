import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ThreatAnalysis } from '../../entities/threat-analysis.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class ModelInfo {
  name: string = '';
  version: string = '1.0.0';
  status: 'loading' | 'ready' | 'error' = 'loading';
  lastUpdated: Date = new Date();
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
  };
  metadata?: Record<string, any>;

  constructor(partial: Partial<ModelInfo> = {}) {
    Object.assign(this, partial);
    this.lastUpdated = partial.lastUpdated || new Date();
  }
}

// Export type for type checking
export type ModelInfoType = InstanceType<typeof ModelInfo>;

/**
 * Service for managing ML models lifecycle
 * Handles model loading, versioning, and performance monitoring
 */
@Injectable()
export class ModelManagerService implements OnModuleInit {
  private readonly logger = new Logger(ModelManagerService.name);
  private models: Record<string, ModelInfo> = {};
  
  // For type reference in other files
  static readonly ModelInfo = ModelInfo;
  private readonly mlServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(ThreatAnalysis)
    private readonly threatAnalysisRepo: Repository<ThreatAnalysis>,
  ) {
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL', 'http://ml-service:5000');
  }

  async onModuleInit() {
    await this.initializeModels();
  }

  /**
   * Initialize all models on service start
   */
  private async initializeModels(): Promise<void> {
    try {
      const models = this.configService.get<string[]>('ML_MODELS', [
        'domain-analyzer',
        'phishing-detector',
      ]);

      await Promise.all(
        models.map((model) => this.loadModel(model)),
      );
      
      this.logger.log(`Initialized ${models.length} models`);
    } catch (error) {
      this.logger.error(`Failed to initialize models: ${error.message}`, error.stack);
    }
  }

  /**
   * Load a specific model
   */
  async loadModel(modelName: string): Promise<ModelInfo> {
    try {
      this.models[modelName] = {
        name: modelName,
        version: 'unknown',
        status: 'loading',
        lastUpdated: new Date(),
      };

      const response = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/models/${modelName}/info`),
      );

      this.models[modelName] = {
        ...this.models[modelName],
        ...response.data,
        status: 'ready',
        lastUpdated: new Date(),
      };

      this.logger.log(`Model loaded: ${modelName}@${this.models[modelName].version}`);
      return this.models[modelName];
    } catch (error) {
      this.logger.error(`Failed to load model ${modelName}: ${error.message}`);
      this.models[modelName] = {
        ...this.models[modelName],
        status: 'error',
        metadata: { error: error.message },
      };
      throw error;
    }
  }

  /**
   * Get model information
   */
  getModelInfo(modelName: string): ModelInfo | undefined {
    return this.models[modelName];
  }

  /**
   * Get all models information
   */
  getAllModels(): ModelInfo[] {
    return Object.values(this.models);
  }

  /**
   * Check for model updates periodically
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkForModelUpdates(): Promise<void> {
    this.logger.log('Checking for model updates...');
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/models/updates`),
      );
      
      const updates = response.data.updates || [];
      
      for (const update of updates) {
        if (
          !this.models[update.name] || 
          this.models[update.name].version !== update.version
        ) {
          this.logger.log(`Updating model ${update.name} to version ${update.version}`);
          await this.loadModel(update.name);
        }
      }
      
      this.logger.log(`Model update check complete. ${updates.length} updates available.`);
    } catch (error) {
      this.logger.error(`Failed to check for model updates: ${error.message}`);
    }
  }

  /**
   * Monitor model performance and log metrics
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async monitorModelPerformance(): Promise<void> {
    this.logger.log('Monitoring model performance...');
    
    try {
      for (const modelName of Object.keys(this.models)) {
        try {
          const stats = await this.calculateModelStats(modelName);
          this.models[modelName].metrics = stats;
          
          // Log performance metrics
          this.logger.log(
            `Model ${modelName} performance: ${JSON.stringify(stats)}`,
          );
          
          // Trigger retraining if performance drops below threshold
          if (stats.accuracy < 0.8) {
            this.logger.warn(
              `Model ${modelName} accuracy (${stats.accuracy}) below threshold`,
            );
            await this.triggerRetraining(modelName);
          }
        } catch (error) {
          this.logger.error(
            `Failed to monitor model ${modelName}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Model performance monitoring failed: ${error.message}`);
    }
  }

  /**
   * Calculate model performance statistics
   */
  private async calculateModelStats(modelName: string): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    sampleSize: number;
  }> {
    // Get recent predictions with feedback
    const recentAnalyses = await this.threatAnalysisRepo.find({
      where: { model: modelName },
      order: { createdAt: 'DESC' },
      take: 1000, // Adjust based on your needs
    });

    // Simple implementation - in practice, you'd compare predictions with ground truth
    // This is a placeholder that assumes 95% accuracy for demonstration
    return {
      accuracy: 0.95,
      precision: 0.94,
      recall: 0.93,
      f1Score: 0.935,
      sampleSize: recentAnalyses.length,
    };
  }

  /**
   * Trigger model retraining
   */
  private async triggerRetraining(modelName: string): Promise<void> {
    try {
      this.logger.log(`Triggering retraining for model: ${modelName}`);
      
      await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/models/${modelName}/retrain`),
      );
      
      // Reload the model after retraining
      await this.loadModel(modelName);
      
      this.logger.log(`Model ${modelName} retraining completed successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to retrain model ${modelName}: ${error.message}`,
      );
      throw error;
    }
  }
}
