
import { GoogleGenAI, Type, GenerateContentResponse, Part } from "@google/genai";
import { AnalysisResult, GroundedContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisResultSchema = {
    type: Type.OBJECT,
    properties: {
        riskScore: { 
            type: Type.INTEGER,
            description: "A fraud risk score from 0 (no risk) to 100 (high risk)."
        },
        suspiciousIndicators: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of bullet points highlighting suspicious elements found in the claim."
        },
        riskBreakdown: {
            type: Type.STRING,
            description: "A detailed paragraph explaining the reasoning behind the risk score and indicators."
        },
        recommendedAction: {
            type: Type.STRING,
            enum: ["Approve", "Investigate", "Reject"],
            description: "The recommended next step for the insurer."
        }
    },
    required: ["riskScore", "suspiciousIndicators", "riskBreakdown", "recommendedAction"]
};

export async function analyzeClaim(claimDetails: string, fileData?: { mimeType: string, data: string }): Promise<AnalysisResult> {
    const model = "gemini-3-pro-preview";
    
    const textPart = { text: `Analyze the following insurance claim for potential fraud. Consider the claim details, policy history, customer behavior, and any provided documents. Provide a detailed analysis. \n\nCLAIM DETAILS:\n${claimDetails}` };

    const parts: Part[] = [textPart];

    if (fileData) {
        parts.push({
            inlineData: {
                mimeType: fileData.mimeType,
                data: fileData.data
            }
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                responseMimeType: "application/json",
                responseSchema: analysisResultSchema
            }
        });

        if (!response.text) {
             throw new Error("Received an empty response from the AI.");
        }
        
        return JSON.parse(response.text) as AnalysisResult;
    } catch (error) {
        console.error(`Error analyzing claim with ${model}:`, error);
        throw new Error("Failed to analyze claim. Please check the console for details.");
    }
}

export async function getFraudData(topic: string): Promise<GroundedContent> {
    const model = "gemini-3-flash-preview";
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Provide a concise summary on the topic: "${topic}".`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const content = response.text || "No information available.";
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map((chunk: any) => ({
                title: chunk.web?.title || 'Untitled',
                uri: chunk.web?.uri || '#',
            }))
            .filter(source => source.uri !== '#');

        return { content, sources };
    } catch (error) {
        console.error(`Error fetching fraud data with ${model}:`, error);
        throw new Error("Failed to fetch fraud data.");
    }
}
