import { AnalysisResult, GroundedContent } from '../types';
import { fraudEngine } from './fraudAnalysisEngine';
import { fraudMonitor } from './fraudMonitoringService';

export function analyzeClaim(claimDetails: string, fileData?: { mimeType: string, data: string }): AnalysisResult {
    const result = fraudEngine.analyze(claimDetails, fileData);
    
    // Add to monitoring system
    fraudMonitor.addClaimAnalysis(result, `CLAIM_${Date.now()}`);
    
    return result;
}

export function getFraudData(topic: string): GroundedContent {
    const fraudTrendsIndia = {
        content: `Insurance Fraud Trends in India (2024):

• Motor Insurance Fraud: 15-20% of all claims involve staged accidents, inflated repair costs, or fake theft reports
• Health Insurance Fraud: Medical billing fraud increased by 23% with fake hospitalization and inflated treatment costs
• Property Insurance: Fire and flood claims show 18% fraud rate with pre-existing damage claims
• Digital Fraud: Online policy fraud up 35% with fake documents and identity theft
• Regional Hotspots: Mumbai, Delhi, Bangalore show highest fraud rates
• Common Methods: Document forgery (45%), staged incidents (30%), inflated claims (25%)
• Average Fraudulent Claim: ₹2.8 lakhs vs legitimate ₹1.2 lakhs
• Detection Rate: Only 12% of fraud cases are caught during initial review`,
        sources: [
            { title: "IRDAI Fraud Report 2024", uri: "https://irdai.gov.in" },
            { title: "Insurance Fraud Bureau India", uri: "https://ifbi.in" }
        ]
    };
    
    return fraudTrendsIndia;
}