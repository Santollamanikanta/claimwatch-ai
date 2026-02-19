
export interface AnalysisResult {
  riskScore: number;
  suspiciousIndicators: string[];
  riskBreakdown: string;
  recommendedAction: 'Approve' | 'Investigate' | 'Reject';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GroundedContent {
  content: string;
  sources: GroundingSource[];
}
