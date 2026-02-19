import { AnalysisResult, GroundedContent } from '../types';

export interface AnalysisProgress {
  stage: 'initializing' | 'processing' | 'analyzing' | 'finalizing' | 'complete';
  progress: number;
  message: string;
  partialResult?: Partial<AnalysisResult>;
}

export class RealTimeAnalysisService {
  private eventSource: EventSource | null = null;
  
  async analyzeClaimRealTime(
    claimDetails: string,
    onProgress: (progress: AnalysisProgress) => void,
    fileData?: { mimeType: string, data: string }
  ): Promise<AnalysisResult> {
    
    // Simulate real-time progress updates
    const stages = [
      { stage: 'initializing' as const, progress: 10, message: 'Initializing AI analysis...' },
      { stage: 'processing' as const, progress: 30, message: 'Processing claim details...' },
      { stage: 'analyzing' as const, progress: 60, message: 'Analyzing for fraud indicators...' },
      { stage: 'finalizing' as const, progress: 90, message: 'Generating final report...' }
    ];

    // Send progress updates
    for (const stage of stages) {
      onProgress(stage);
      await this.delay(800);
    }

    // Simulate streaming partial results
    onProgress({
      stage: 'analyzing',
      progress: 70,
      message: 'Partial analysis complete...',
      partialResult: {
        riskScore: 65,
        suspiciousIndicators: ['Unusual timing of claim', 'Inconsistent documentation']
      }
    });

    await this.delay(1000);

    // Final result
    const result: AnalysisResult = {
      riskScore: 72,
      suspiciousIndicators: [
        'Unusual timing of claim submission',
        'Inconsistent documentation provided',
        'Previous claims history shows pattern',
        'Location data inconsistencies'
      ],
      riskBreakdown: `The claim shows a moderate-to-high fraud risk score of 72/100. Key concerns include timing inconsistencies and documentation gaps. The claimant's history shows similar patterns that warrant investigation.`,
      recommendedAction: 'Investigate'
    };

    onProgress({
      stage: 'complete',
      progress: 100,
      message: 'Analysis complete!',
      partialResult: result
    });

    return result;
  }

  async streamFraudData(
    topic: string,
    onUpdate: (data: GroundedContent) => void
  ): Promise<void> {
    // Simulate real-time data streaming
    const updates = [
      {
        content: 'Loading latest fraud trends...',
        sources: []
      },
      {
        content: 'Recent insurance fraud cases in India have increased by 15% this quarter. Common patterns include:\n\n• Medical claim inflation\n• Staged accidents\n• False documentation',
        sources: [
          { title: 'Insurance Fraud Report 2024', uri: 'https://example.com/report1' }
        ]
      },
      {
        content: 'Recent insurance fraud cases in India have increased by 15% this quarter. Common patterns include:\n\n• Medical claim inflation (32% of cases)\n• Staged accidents (28% of cases)\n• False documentation (25% of cases)\n• Identity theft (15% of cases)\n\nKey indicators to watch:\n- Claims submitted within 24 hours of policy purchase\n- Multiple claims from same location\n- Unusual medical billing patterns',
        sources: [
          { title: 'Insurance Fraud Report 2024', uri: 'https://example.com/report1' },
          { title: 'Fraud Detection Trends', uri: 'https://example.com/report2' }
        ]
      }
    ];

    for (const update of updates) {
      onUpdate(update);
      await this.delay(1500);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const realTimeService = new RealTimeAnalysisService();