import { AnalysisResult } from '../types';

interface FraudPattern {
  name: string;
  weight: number;
  check: (text: string) => boolean;
  description: string;
}

interface RiskFactor {
  category: string;
  indicators: string[];
  score: number;
}

export class FraudAnalysisEngine {
  private patterns: FraudPattern[] = [
    {
      name: 'timing_anomaly',
      weight: 25,
      check: (text) => /claim.{0,20}(immediately|same day|within hours|right after)/i.test(text),
      description: 'Claim submitted unusually quickly after incident'
    },
    {
      name: 'round_amounts',
      weight: 20,
      check: (text) => /₹\s*\d+[05]0{3,}|₹\s*[1-9]\.0+\s*L|\$\s*\d+[05]0{3,}|\d+[05]0{3,}\s*(rupees|dollars)/i.test(text),
      description: 'Suspiciously round billing amounts'
    },
    {
      name: 'documentation_gaps',
      weight: 30,
      check: (text) => /(missing|lost|unavailable|no receipt|no bill|destroyed|stolen documents)/i.test(text),
      description: 'Critical documentation missing or unavailable'
    },
    {
      name: 'medical_inflation',
      weight: 35,
      check: (text) => this.checkMedicalInflation(text),
      description: 'Potential medical billing inflation detected'
    },
    {
      name: 'repeat_claimant',
      weight: 40,
      check: (text) => /(previous claim|multiple claims|frequent claimant|history of claims)/i.test(text),
      description: 'History of multiple claims'
    },
    {
      name: 'witness_issues',
      weight: 25,
      check: (text) => /(no witness|witnesses unavailable|family witness|friend witness)/i.test(text),
      description: 'Questionable or missing witness testimony'
    },
    {
      name: 'location_risk',
      weight: 20,
      check: (text) => /(remote area|isolated location|no CCTV|dark area)/i.test(text),
      description: 'Incident occurred in high-risk location'
    },
    {
      name: 'policy_timing',
      weight: 35,
      check: (text) => /(new policy|recent policy|just purchased|within days)/i.test(text),
      description: 'Claim on recently purchased policy'
    }
  ];

  private checkMedicalInflation(text: string): boolean {
    const amounts = text.match(/[₹$]\s*[\d,]+|\d+\s*(rupees|dollars)/gi) || [];
    return amounts.some(amount => {
      const num = parseInt(amount.replace(/[₹$,\s\w]/g, ''));
      return num > 100000; // High medical bills
    });
  }

  analyze(claimDetails: string, fileData?: any): AnalysisResult {
    const indicators: string[] = [];
    let totalScore = 0;

    // Base score for any claim (5-15 points)
    const baseScore = Math.floor(Math.random() * 11) + 5;
    totalScore += baseScore;

    // Fast pattern matching
    for (const pattern of this.patterns) {
      if (pattern.check(claimDetails)) {
        totalScore += pattern.weight;
        indicators.push(pattern.description);
      }
    }

    // Quick behavioral check
    if (/(desperate|urgent|emergency)/i.test(claimDetails)) {
      totalScore += 15;
      indicators.push('Emotional manipulation detected');
    }

    if (/(somehow|maybe|possibly|not sure)/i.test(claimDetails)) {
      totalScore += 20;
      indicators.push('Vague claim details');
    }

    // Additional realistic scoring factors
    const words = claimDetails.split(/\s+/).length;
    if (words < 20) {
      totalScore += 10;
      indicators.push('Insufficient claim details provided');
    }

    if (words > 200) {
      totalScore += 8;
      indicators.push('Unusually verbose claim description');
    }

    // Check for common fraud keywords
    if (/(accident|injury|damage|loss|theft|fire|flood)/i.test(claimDetails)) {
      totalScore += 5; // Normal claim types get small addition
    }

    const riskScore = Math.min(totalScore, 100);

    return {
      riskScore,
      suspiciousIndicators: indicators.length > 0 ? indicators : ['Standard claim - minimal risk indicators detected'],
      riskBreakdown: this.generateDetailedBreakdown(riskScore, indicators, baseScore, claimDetails),
      recommendedAction: riskScore >= 75 ? 'Reject' : riskScore >= 35 ? 'Investigate' : 'Approve'
    };
  }

  private analyzeBehavioralPatterns(text: string): RiskFactor {
    const indicators: string[] = [];
    let score = 0;

    // Check for emotional manipulation
    if (/(desperate|urgent|emergency|please help)/i.test(text)) {
      indicators.push('Emotional manipulation detected in claim language');
      score += 15;
    }

    // Check for excessive detail
    const sentences = text.split(/[.!?]+/).length;
    if (sentences > 20) {
      indicators.push('Unusually detailed claim description');
      score += 10;
    }

    // Check for vague descriptions
    if (/(somehow|maybe|possibly|not sure|unclear)/i.test(text)) {
      indicators.push('Vague or uncertain claim details');
      score += 20;
    }

    return {
      category: 'behavioral_analysis',
      indicators,
      score
    };
  }

  private analyzeDocuments(fileData: any): RiskFactor {
    const indicators: string[] = [];
    let score = 0;

    // Simulate document analysis
    if (fileData.mimeType.includes('image')) {
      indicators.push('Image-based documentation requires manual verification');
      score += 10;
    }

    if (fileData.data.length < 10000) {
      indicators.push('Unusually small document size');
      score += 15;
    }

    return {
      category: 'document_analysis',
      indicators,
      score
    };
  }

  private generateDetailedBreakdown(riskScore: number, indicators: string[], baseScore: number, claimText: string): string {
    let breakdown = `FRAUD RISK ASSESSMENT REPORT\n${'='.repeat(35)}\n\n`;
    
    breakdown += `Overall Risk Score: ${riskScore}/100\n`;
    breakdown += `Risk Level: ${riskScore >= 75 ? 'HIGH RISK' : riskScore >= 35 ? 'MODERATE RISK' : 'LOW RISK'}\n\n`;
    
    breakdown += `SCORING BREAKDOWN:\n`;
    breakdown += `• Base Assessment: ${baseScore} points\n`;
    
    if (indicators.length > 0) {
      breakdown += `• Risk Indicators Found: ${indicators.length}\n\n`;
      breakdown += `DETAILED FINDINGS:\n`;
      indicators.forEach((indicator, index) => {
        breakdown += `${index + 1}. ${indicator}\n`;
      });
    } else {
      breakdown += `• No major fraud indicators detected\n`;
    }
    
    breakdown += `\nCLAIM ANALYSIS:\n`;
    const wordCount = claimText.split(/\s+/).length;
    breakdown += `• Claim Length: ${wordCount} words\n`;
    breakdown += `• Detail Level: ${wordCount < 20 ? 'Insufficient' : wordCount > 200 ? 'Excessive' : 'Adequate'}\n`;
    
    breakdown += `\nRECOMMENDATION:\n`;
    if (riskScore >= 75) {
      breakdown += `REJECT - Multiple high-risk indicators detected. Immediate investigation required.`;
    } else if (riskScore >= 35) {
      breakdown += `INVESTIGATE - Moderate risk factors present. Additional verification recommended.`;
    } else {
      breakdown += `APPROVE - Low risk profile. Standard processing acceptable.`;
    }
    
    return breakdown;
  }

  private getRecommendation(score: number): 'Approve' | 'Investigate' | 'Reject' {
    if (score >= 75) return 'Reject';
    if (score >= 35) return 'Investigate';
    return 'Approve';
  }
}

export const fraudEngine = new FraudAnalysisEngine();