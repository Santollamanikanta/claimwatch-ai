import { AnalysisResult } from '../types';
import { fraudEngine } from './fraudAnalysisEngine';
import { analyzeClaim } from './openrouterService';

export class FastFraudService {
  private static instance: FastFraudService;
  private pendingAnalyses = new Map<string, Promise<AnalysisResult>>();

  static getInstance(): FastFraudService {
    if (!FastFraudService.instance) {
      FastFraudService.instance = new FastFraudService();
    }
    return FastFraudService.instance;
  }

  async analyzeClaimFast(claimDetails: string, fileData?: { mimeType: string, data: string }): Promise<AnalysisResult> {
    const key = claimDetails.slice(0, 50);
    
    // Prevent duplicate concurrent requests
    if (this.pendingAnalyses.has(key)) {
      return this.pendingAnalyses.get(key)!;
    }

    const analysisPromise = this.performAnalysis(claimDetails, fileData);
    this.pendingAnalyses.set(key, analysisPromise);
    
    try {
      const result = await analysisPromise;
      return result;
    } finally {
      this.pendingAnalyses.delete(key);
    }
  }

  private async performAnalysis(claimDetails: string, fileData?: { mimeType: string, data: string }): Promise<AnalysisResult> {
    // Run local and API analysis concurrently
    const [localResult, apiResult] = await Promise.allSettled([
      Promise.resolve(fraudEngine.analyze(claimDetails, fileData)),
      analyzeClaim(claimDetails, fileData)
    ]);

    // Use API result if available, fallback to local
    if (apiResult.status === 'fulfilled') {
      return apiResult.value;
    } else if (localResult.status === 'fulfilled') {
      return localResult.value;
    }
    
    throw new Error('Both analysis methods failed');
  }

  // Batch analysis for multiple claims
  async analyzeBatch(claims: Array<{ details: string, fileData?: { mimeType: string, data: string } }>): Promise<AnalysisResult[]> {
    const promises = claims.map(claim => 
      this.analyzeClaimFast(claim.details, claim.fileData)
    );
    
    return Promise.all(promises);
  }
}

export const fastFraudService = FastFraudService.getInstance();