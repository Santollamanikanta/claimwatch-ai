import { AnalysisResult, GroundedContent } from '../types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Cache for faster repeated analysis
const analysisCache = new Map<string, AnalysisResult>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function analyzeClaim(claimDetails: string, fileData?: { mimeType: string, data: string }): Promise<AnalysisResult> {
    // Check cache first
    const cacheKey = `${claimDetails.slice(0, 100)}${fileData?.mimeType || ''}`;
    const cached = analysisCache.get(cacheKey);
    if (cached) return cached;

    const prompt = `Analyze this insurance claim for fraud. Respond with JSON only:
${claimDetails}
${fileData ? `[${fileData.mimeType}]` : ''}

JSON format: {"riskScore":0-100,"suspiciousIndicators":[],"riskBreakdown":"","recommendedAction":"Approve|Investigate|Reject"}`;

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'ClaimWatch AI'
        },
        body: JSON.stringify({
            model: 'anthropic/claude-3.5-haiku',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}') as AnalysisResult;
    
    // Cache result
    analysisCache.set(cacheKey, result);
    setTimeout(() => analysisCache.delete(cacheKey), CACHE_TTL);
    
    return result;
}

export async function getFraudData(topic: string): Promise<GroundedContent> {
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'ClaimWatch AI'
        },
        body: JSON.stringify({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'user', content: `Provide a concise summary on the topic: "${topic}"` }
            ],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API Error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content || 'No information available.';
    
    return { content, sources: [] };
}