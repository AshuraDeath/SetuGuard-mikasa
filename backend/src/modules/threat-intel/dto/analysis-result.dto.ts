import { ApiProperty } from '@nestjs/swagger';

export class AnalysisResultDto {
  @ApiProperty({ description: 'The target that was analyzed' })
  target: string;

  @ApiProperty({ description: 'Type of analysis performed' })
  type: string;

  @ApiProperty({ description: 'Whether the target is considered malicious' })
  isMalicious: boolean;

  @ApiProperty({ description: 'Confidence score (0-1)' })
  confidence: number;

  @ApiProperty({ description: 'List of detected threats' })
  threats: Array<{
    type: string;
    description: string;
    confidence: number;
    source?: string;
  }>;

  @ApiProperty({
    description: 'Detailed analysis results',
    type: 'object',
    additionalProperties: true,
  })
  details: Record<string, any>;

  @ApiProperty({ description: 'Timestamp of the analysis' })
  timestamp: Date;

  @ApiProperty({
    description: 'Metadata about the analysis',
    type: 'object',
    additionalProperties: true,
    required: false,
  })
  metadata?: Record<string, any>;
}
