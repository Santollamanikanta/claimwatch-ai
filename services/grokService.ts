import { AnalysisResult, GroundedContent } from '../types';

const GROQ_API_KEY = process.env.GROK_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function analyzeClaim(claimDetails: string, fileData?: { mimeType: string, data: string }): Promise<AnalysisResult> {
    const prompt = `Analyze the following insurance claim for potential fraud. Consider the claim details, policy history, customer behavior, and any provided documents.

CLAIM DETAILS:
${claimDetails}

${fileData ? `\n[Document attached: ${fileData.mimeType}]` : ''}

Provide a JSON response with:
- riskScore: number (0-100)
- suspiciousIndicators: array of strings
- riskBreakdown: detailed explanation string
- recommendedAction: "Approve" | "Investigate" | "Reject"`;

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [
                { role: 'system', content: 'You are an expert insurance fraud detection AI. Analyze claims and respond only with valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API Error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse JSON from Groq response');
    }
    
    return JSON.parse(jsonMatch[0]) as AnalysisResult;
}

export async function getFraudData(topic: string): Promise<GroundedContent> {
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [
                { role: 'user', content: `Provide a concise summary on the topic: "${topic}"` }
            ],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API Error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content || 'No information available.';
    
    return { content, sources: [] };
}
