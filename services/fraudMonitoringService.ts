import { AnalysisResult } from '../types';

export interface FraudAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  claimId?: string;
}

export interface FraudMetrics {
  totalClaims: number;
  fraudulentClaims: number;
  fraudRate: number;
  avgRiskScore: number;
  topIndicators: string[];
}

export class FraudMonitoringService {
  private alerts: FraudAlert[] = [];
  private claimHistory: AnalysisResult[] = [];

  addClaimAnalysis(result: AnalysisResult, claimId?: string): void {
    this.claimHistory.push(result);
    
    // Generate alerts based on risk score
    if (result.riskScore >= 80) {
      this.generateAlert('critical', `Critical fraud risk detected (${result.riskScore}/100)`, claimId);
    } else if (result.riskScore >= 60) {
      this.generateAlert('high', `High fraud risk detected (${result.riskScore}/100)`, claimId);
    }

    // Pattern-based alerts
    this.checkForPatterns(result, claimId);
  }

  private generateAlert(severity: FraudAlert['severity'], message: string, claimId?: string): void {
    const alert: FraudAlert = {
      id: Date.now().toString(),
      severity,
      message,
      timestamp: new Date(),
      claimId
    };
    
    this.alerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }
  }

  private checkForPatterns(result: AnalysisResult, claimId?: string): void {
    // Check for repeated indicators
    const recentClaims = this.claimHistory.slice(-10);
    const commonIndicators = this.findCommonIndicators(recentClaims);
    
    if (commonIndicators.length > 0) {
      this.generateAlert('medium', 
        `Pattern detected: ${commonIndicators[0]} appears in multiple recent claims`, 
        claimId
      );
    }

    // Check for fraud rate spike
    const recentFraudRate = this.calculateRecentFraudRate();
    if (recentFraudRate > 0.3) {
      this.generateAlert('high', 
        `Fraud rate spike detected: ${(recentFraudRate * 100).toFixed(1)}% of recent claims flagged`,
        claimId
      );
    }
  }

  private findCommonIndicators(claims: AnalysisResult[]): string[] {
    const indicatorCount = new Map<string, number>();
    
    claims.forEach(claim => {
      claim.suspiciousIndicators.forEach(indicator => {
        indicatorCount.set(indicator, (indicatorCount.get(indicator) || 0) + 1);
      });
    });

    return Array.from(indicatorCount.entries())
      .filter(([_, count]) => count >= 3)
      .map(([indicator, _]) => indicator);
  }

  private calculateRecentFraudRate(): number {
    const recentClaims = this.claimHistory.slice(-20);
    if (recentClaims.length === 0) return 0;
    
    const fraudulentClaims = recentClaims.filter(claim => 
      claim.recommendedAction === 'Reject' || claim.riskScore >= 70
    ).length;
    
    return fraudulentClaims / recentClaims.length;
  }

  getMetrics(): FraudMetrics {
    const totalClaims = this.claimHistory.length;
    const fraudulentClaims = this.claimHistory.filter(claim => 
      claim.recommendedAction === 'Reject' || claim.riskScore >= 70
    ).length;
    
    const avgRiskScore = totalClaims > 0 
      ? this.claimHistory.reduce((sum, claim) => sum + claim.riskScore, 0) / totalClaims 
      : 0;

    const indicatorCount = new Map<string, number>();
    this.claimHistory.forEach(claim => {
      claim.suspiciousIndicators.forEach(indicator => {
        indicatorCount.set(indicator, (indicatorCount.get(indicator) || 0) + 1);
      });
    });

    const topIndicators = Array.from(indicatorCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([indicator, _]) => indicator);

    return {
      totalClaims,
      fraudulentClaims,
      fraudRate: totalClaims > 0 ? fraudulentClaims / totalClaims : 0,
      avgRiskScore,
      topIndicators
    };
  }

  getRecentAlerts(limit: number = 10): FraudAlert[] {
    return this.alerts.slice(0, limit);
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  // Simulate real-time data for demo
  generateSampleData(): void {
    const sampleResults: AnalysisResult[] = [
      {
        riskScore: 85,
        suspiciousIndicators: ['Round amount billing', 'Missing documentation'],
        riskBreakdown: 'High risk claim',
        recommendedAction: 'Reject'
      },
      {
        riskScore: 45,
        suspiciousIndicators: ['Timing anomaly'],
        riskBreakdown: 'Moderate risk claim',
        recommendedAction: 'Investigate'
      },
      {
        riskScore: 25,
        suspiciousIndicators: [],
        riskBreakdown: 'Low risk claim',
        recommendedAction: 'Approve'
      }
    ];

    sampleResults.forEach((result, index) => {
      this.addClaimAnalysis(result, `CLAIM_${Date.now()}_${index}`);
    });
  }
}

export const fraudMonitor = new FraudMonitoringService();