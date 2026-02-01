import OpenAI from 'openai';
import type { GeneratedGig, KeywordData } from '../types';

const KEYWORD_RESEARCH_PROMPT = `Research 30 Fiverr keywords for: "{query}"

Return JSON with this structure:
{
  "keywords": [
    {
      "keyword": "search term buyers use",
      "source": "fiverr|reddit|google|trending|competitor",
      "relevance": 85,
      "searchVolume": "low|medium|high|very_high",
      "competition": "low|medium|high",
      "trend": "up|down|stable|hot"
    }
  ]
}

Mix sources: 8 fiverr, 6 reddit, 6 google, 6 trending, 4 competitor keywords.`;

const GIG_GENERATION_PROMPT = `You are a Fiverr SEO expert who creates gigs that RANK HIGH and CONVERT.

Top Keywords: {keywords}
Niche: {niche}

===== GIG TITLE (EXACTLY 80 characters) =====

Create a KEYWORD-STUFFED title that includes multiple high-ranking keywords.
Format: "I will [keyword1] [keyword2] [keyword3] for [outcome]"

GOOD: "I will design logo brand identity business card letterhead for startup"
BAD: "I will design a beautiful logo for your business" (too generic, wastes characters)

Pack as many relevant keywords as possible. Readability is secondary to SEO.

===== METADATA (Use REAL Fiverr Categories) =====

Choose from actual Fiverr categories:
- Graphics & Design > Logo Design, Brand Style Guides, Business Cards, Illustration
- Programming & Tech > Web Development, Mobile Apps, WordPress, AI Services
- Digital Marketing > Social Media Marketing, SEO, Video Marketing
- Video & Animation > Video Editing, Animation, Explainer Videos
- Writing & Translation > Content Writing, Copywriting, Translation
- AI Services > AI Development, AI Art, AI Content

===== SEARCH TAGS (5 tags, max 20 chars each) =====

Use high-intent buyer keywords that get searched:
- Mix of broad + specific long-tail
- Include related keywords not in title
- Research what buyers actually search

===== PRICING (Realistic for the service) =====

Research actual Fiverr pricing for this service category:
- Basic: Entry-level, minimal features ($5-$25 typical)
- Standard: Most popular, good value ($25-$75 typical)  
- Premium: Full service, all features ($75-$200+ typical)

Each tier MUST have UNIQUE descriptions explaining the VALUE difference.

===== DESCRIPTION (1200 characters minimum) =====

Structure for SEO and conversions:

HOOK (emotional + keyword-rich):
"🚀 Looking for [keyword]? Need [keyword] that [benefit]?"

WHAT YOU GET (keyword-stuffed bullet points):
"✅ [Keyword-rich deliverable 1]
✅ [Keyword-rich deliverable 2]
✅ [Keyword-rich deliverable 3]
✅ [Keyword-rich deliverable 4]"

WHY CHOOSE ME (credibility + keywords):
"With [X] years of experience in [keyword niche], I deliver [keyword] that [benefit]."

PROCESS:
"📋 How it works:
1. [Step with keyword]
2. [Step with keyword]
3. [Step with keyword]"

CTA:
"💬 Message me now for [keyword]! Order today for [benefit]."

Use emojis strategically. Pack keywords naturally throughout.

===== FAQS (5 service-specific questions) =====

Real questions THIS service's buyers ask:
- Specific to the deliverables
- About the process for THIS service
- Timeline for THIS type of work
- Format/file types for THIS service
- Revision policy for THIS work

===== REQUIREMENTS (4-5 specific questions) =====

What you ACTUALLY need to start THIS service:
- Service-specific inputs
- File formats needed
- Brand assets required
- Goals and preferences

===== IMAGE PROMPT =====

Create a prompt for a professional Fiverr thumbnail:
- Show the service outcome visually
- Clean, modern design
- NO TEXT (AI can't spell correctly)
- Include relevant imagery/mockups
- Professional humans if appropriate
- Vibrant colors, high contrast

===== OUTPUT FORMAT =====

Return valid JSON:
{
  "title": "I will [80 chars keyword-stuffed title]",
  "metadata": {
    "category": "Graphics & Design",
    "subcategory": "Logo Design",
    "serviceType": "Minimalist Logo"
  },
  "searchTags": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "pricing": {
    "basic": {
      "name": "Starter",
      "price": 15,
      "description": "Unique value proposition for this tier",
      "deliveryTime": "3 days",
      "revisions": 1,
      "features": ["Feature 1", "Feature 2"]
    },
    "standard": {
      "name": "Professional",
      "price": 45,
      "description": "Unique value proposition for this tier",
      "deliveryTime": "2 days",
      "revisions": 3,
      "features": ["Feature 1", "Feature 2", "Feature 3"]
    },
    "premium": {
      "name": "Enterprise",
      "price": 99,
      "description": "Unique value proposition for this tier",
      "deliveryTime": "1 day",
      "revisions": "unlimited",
      "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
    }
  },
  "description": "1200+ character keyword-rich description",
  "faqs": [
    {"question": "Service-specific question", "answer": "Helpful answer"}
  ],
  "requirements": [
    {"question": "Service-specific requirement", "type": "text", "required": true, "options": []}
  ],
  "imagePrompt": "Professional thumbnail prompt with no text"
}`;

export class OpenAIService {
    private client: OpenAI | null = null;
    private apiKeySource: 'env' | 'user' | null = null;

    constructor() {
        // Auto-initialize from environment variable if available
        const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (envApiKey) {
            this.client = new OpenAI({
                apiKey: envApiKey,
                dangerouslyAllowBrowser: true
            });
            this.apiKeySource = 'env';
        }
    }

    initialize(apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.client = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true
        });
        this.apiKeySource = 'user';
    }

    isInitialized(): boolean {
        return this.client !== null;
    }

    getApiKeySource(): 'env' | 'user' | null {
        return this.apiKeySource;
    }

    hasEnvKey(): boolean {
        return !!import.meta.env.VITE_OPENAI_API_KEY;
    }

    async searchKeywords(query: string): Promise<KeywordData[]> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized. Please add your API key.');
        }

        const prompt = KEYWORD_RESEARCH_PROMPT.replace('{query}', query);

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-5.2',
                messages: [
                    {
                        role: 'system',
                        content: `You are an elite Fiverr keyword research analyst. 
                        
CRITICAL: You MUST return a valid JSON object with this EXACT structure:
{
  "keywords": [
    {"keyword": "example", "source": "fiverr", "relevance": 85, "searchVolume": "medium", "competition": "low", "trend": "up"}
  ]
}

- Return 25-30 keywords
- Each keyword MUST have: keyword (string), source (string), relevance (number 1-100)
- Optional: searchVolume, competition, trend
- NO markdown, NO explanations, ONLY the JSON object`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
                max_completion_tokens: 4000
            });

            let text = response.choices[0]?.message?.content || '';

            // Log detailed response info for debugging
            console.log('OpenAI Response Details:', {
                id: response.id,
                model: response.model,
                finish_reason: response.choices[0]?.finish_reason,
                content_length: text.length,
                content_preview: text.substring(0, 200)
            });

            // Check for empty response
            if (!text || text.trim().length === 0) {
                console.error('Empty response from GPT-5.2. Finish reason:', response.choices[0]?.finish_reason);
                throw new Error('AI returned empty response. The model may be overloaded - please try again.');
            }

            // Debug: log first 500 chars of response
            console.log('AI Response (first 500 chars):', text.substring(0, 500));

            // Strip markdown code blocks if present
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

            // Try to extract JSON if wrapped in other content
            if (!text.startsWith('{') && !text.startsWith('[')) {
                const jsonStart = text.search(/[\[{]/);
                if (jsonStart > 0) {
                    text = text.substring(jsonStart);
                }
            }

            // Parse the JSON response
            let parsed: unknown;
            try {
                parsed = JSON.parse(text);
            } catch (parseError) {
                console.error('Initial JSON parse failed, trying to extract JSON...');

                // Try to find JSON object in response
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsed = JSON.parse(jsonMatch[0]);
                    } catch {
                        // Try array format
                        const arrayMatch = text.match(/\[[\s\S]*\]/);
                        if (arrayMatch) {
                            try {
                                parsed = JSON.parse(arrayMatch[0]);
                            } catch {
                                console.error('All JSON extraction attempts failed');
                                console.error('Raw response:', text.substring(0, 1000));
                                throw new Error('AI returned malformed data. Please try again.');
                            }
                        } else {
                            throw new Error('AI returned invalid format. Please try again.');
                        }
                    }
                } else {
                    throw new Error('AI returned no valid data. Please try again.');
                }
            }

            // Extract keywords array from various response structures
            let keywords: KeywordData[];

            if (Array.isArray(parsed)) {
                keywords = parsed;
            } else if (parsed && typeof parsed === 'object') {
                const obj = parsed as Record<string, unknown>;

                // Check common property names
                if (Array.isArray(obj.keywords)) {
                    keywords = obj.keywords;
                } else if (Array.isArray(obj.data)) {
                    keywords = obj.data;
                } else if (Array.isArray(obj.results)) {
                    keywords = obj.results;
                } else {
                    // Find first array property
                    const arrayProp = Object.values(obj).find(v => Array.isArray(v));
                    if (arrayProp) {
                        keywords = arrayProp as KeywordData[];
                    } else {
                        console.error('No array found in response:', JSON.stringify(parsed).substring(0, 500));
                        throw new Error('AI returned unexpected structure. Please try again.');
                    }
                }
            } else {
                throw new Error('AI returned unexpected format. Please try again.');
            }

            // Validate and fix each keyword
            const validSources = ['fiverr', 'reddit', 'google', 'trending', 'competitor'] as const;
            type ValidSource = typeof validSources[number];

            const normalizeSource = (src: unknown): ValidSource => {
                const s = String(src || 'fiverr').toLowerCase();
                if (validSources.includes(s as ValidSource)) {
                    return s as ValidSource;
                }
                // Map common AI responses to valid sources
                if (s.includes('fiverr') || s === 'ai' || s === 'gpt') return 'fiverr';
                if (s.includes('reddit')) return 'reddit';
                if (s.includes('google') || s.includes('search')) return 'google';
                if (s.includes('trend')) return 'trending';
                if (s.includes('compet')) return 'competitor';
                return 'fiverr'; // default
            };

            keywords = keywords
                .filter(k => k && typeof k === 'object' && k.keyword)
                .map(k => ({
                    keyword: String(k.keyword || '').toLowerCase().trim(),
                    source: normalizeSource(k.source),
                    relevance: Math.min(100, Math.max(1, Number(k.relevance) || 75)),
                    searchVolume: (k.searchVolume as KeywordData['searchVolume']) || 'medium',
                    competition: (k.competition as KeywordData['competition']) || 'medium',
                    trend: (k.trend as KeywordData['trend']) || 'stable',
                    buyerIntent: k.buyerIntent as KeywordData['buyerIntent']
                }))
                .filter(k => k.keyword.length > 1);

            if (keywords.length === 0) {
                throw new Error('No valid keywords found. Please try a different search term.');
            }

            console.log(`Successfully parsed ${keywords.length} keywords`);
            return keywords;

        } catch (error) {
            console.error('Keyword search error:', error);

            // Extract detailed error message
            let errorMessage = 'Keyword research failed';
            let errorDetails = '';

            if (error instanceof Error) {
                errorDetails = error.message;
                console.error('Error details:', errorDetails);

                // Check for specific API errors
                if (errorDetails.includes('401') || errorDetails.includes('Unauthorized')) {
                    throw new Error('Invalid API key. Please check your OpenAI API key.');
                }
                if (errorDetails.includes('429') || errorDetails.includes('rate limit')) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                }
                if (errorDetails.includes('404') || errorDetails.includes('model')) {
                    throw new Error(`Model error: ${errorDetails}. Check if your API key has access to gpt-5.2.`);
                }
                if (errorDetails.includes('insufficient_quota')) {
                    throw new Error('API quota exhausted. Please check your OpenAI billing.');
                }
                if (errorDetails.includes('AI returned')) {
                    throw error; // Re-throw our custom parsing errors
                }

                errorMessage = errorDetails;
            }

            throw new Error(`Keyword research failed: ${errorMessage}`);
        }
    }

    async generateGig(keywords: KeywordData[], niche: string): Promise<GeneratedGig> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized. Please add your API key.');
        }

        // Format keywords with context
        const keywordList = keywords
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 15)
            .map(k => `"${k.keyword}" (${k.source}, ${k.relevance}% relevance)`)
            .join('\n');

        const prompt = GIG_GENERATION_PROMPT
            .replace('{keywords}', keywordList)
            .replace('{niche}', niche);

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-5.2',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an elite Fiverr gig writer. Create gigs that get clicks and orders. Use simple language (grade 6 level). Return only valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_completion_tokens: 3500
            });

            const text = response.choices[0]?.message?.content || '';

            // Extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('Raw response:', text);
                throw new Error('Invalid response format from AI');
            }

            const gig: GeneratedGig = JSON.parse(jsonMatch[0]);
            gig.keywords = keywords;

            // Validate and fix title length
            if (gig.title.length > 80) {
                gig.title = gig.title.substring(0, 77) + '...';
            }

            // Validate and fix tags
            gig.searchTags = gig.searchTags.slice(0, 5).map(tag => {
                if (tag.length > 20) {
                    return tag.substring(0, 20);
                }
                return tag;
            });

            return gig;
        } catch (error) {
            console.error('Gig generation error:', error);
            if (error instanceof Error && error.message.includes('401')) {
                throw new Error('Invalid API key. Please check your OpenAI API key.');
            }
            throw new Error('Failed to generate gig. Please try again.');
        }
    }

    async generateImage(prompt: string): Promise<string> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized');
        }

        try {
            const response = await this.client.images.generate({
                model: "dall-e-3",
                prompt: `Professional Fiverr Gig Thumbnail: ${prompt}. High quality, 4k, clean composition, vibrant colors, text-free or minimal text.`,
                n: 1,
                size: "1024x1024",
                quality: "standard",
            });

            return response.data?.[0]?.url || '';
        } catch (error) {
            console.error('Image generation error:', error);
            throw new Error('Failed to generate images. Please try again.');
        }
    }

    async analyzeCompetitor(gigUrl: string): Promise<import('../types').CompetitorAnalysis> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized');
        }

        const prompt = `Analyze this Fiverr gig URL and provide competitive intelligence:
URL: ${gigUrl}

Based on the URL structure and common Fiverr patterns, provide a detailed analysis.

Return ONLY valid JSON (no markdown):
{
    "url": "${gigUrl}",
    "title": "Estimated gig title based on URL",
    "sellerLevel": "New Seller|Level 1|Level 2|Top Rated",
    "rating": 4.8,
    "reviewCount": 150,
    "startingPrice": 25,
    "keywordsUsed": ["keyword1", "keyword2", "keyword3"],
    "titlePatterns": ["Pattern used in title", "Another pattern"],
    "descriptionStrengths": ["Strength 1", "Strength 2"],
    "descriptionWeaknesses": ["Weakness 1", "Weakness 2"],
    "pricingStrategy": "Description of their pricing approach",
    "uniqueSellingPoints": ["USP 1", "USP 2"],
    "improvementSuggestions": ["How to compete", "What to do better"],
    "estimatedMonthlyOrders": 50,
    "competitiveAdvantages": ["What makes them rank well"]
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-5.2',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert Fiverr competitor analyst. Analyze gig URLs and provide actionable competitive intelligence. Return only valid JSON.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_completion_tokens: 2000
            });

            const text = response.choices[0]?.message?.content || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid response format');

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Competitor analysis error:', error);
            throw new Error('Failed to analyze competitor. Please try again.');
        }
    }

    async clusterKeywords(keywords: KeywordData[]): Promise<import('../types').KeywordCluster[]> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized');
        }

        const keywordList = keywords.map(k => k.keyword).join(', ');

        const prompt = `Cluster these keywords by buyer intent funnel stage:

Keywords: ${keywordList}

Group into 3 stages:
1. AWARENESS - Buyer is researching, learning, exploring options
2. CONSIDERATION - Buyer is comparing options, looking for solutions
3. DECISION - Buyer is ready to purchase, looking for specific services

Return ONLY valid JSON array:
[
    {
        "stage": "awareness",
        "stageLabel": "🔍 Awareness",
        "keywords": [{"keyword": "...", "source": "fiverr", "relevance": 80}],
        "description": "These buyers are just starting their search",
        "targetingTips": ["Tip 1", "Tip 2"]
    },
    {
        "stage": "consideration",
        "stageLabel": "🤔 Consideration", 
        "keywords": [...],
        "description": "These buyers are comparing options",
        "targetingTips": ["Tip 1", "Tip 2"]
    },
    {
        "stage": "decision",
        "stageLabel": "✅ Decision",
        "keywords": [...],
        "description": "These buyers are ready to purchase",
        "targetingTips": ["Tip 1", "Tip 2"]
    }
]`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-5.2',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a keyword clustering expert. Group keywords by buyer intent funnel stages. Return only valid JSON array.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.6,
                max_completion_tokens: 2500
            });

            const text = response.choices[0]?.message?.content || '';
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error('Invalid response format');

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Keyword clustering error:', error);
            throw new Error('Failed to cluster keywords. Please try again.');
        }
    }

    async generateTitleVariations(gig: GeneratedGig): Promise<import('../types').TitleVariation[]> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized');
        }

        const keywordList = gig.keywords?.map(k => k.keyword).slice(0, 15).join(', ') || gig.title;

        const prompt = `Create 5 KEYWORD-STUFFED title variations for this Fiverr gig.

Current Title: ${gig.title}
Available Keywords: ${keywordList}
Category: ${gig.metadata?.category || 'Service'}

CRITICAL RULES:
1. Each title MUST be EXACTLY 80 characters (use all available space)
2. Pack as many HIGH-RANKING keywords as possible
3. DO NOT write readable sentences - stuff keywords for SEO visibility
4. Start with "I will" then keyword keyword keyword
5. Each variation must use a DIFFERENT keyword combination

GOOD EXAMPLE: "I will design logo brand identity business card letterhead stationery startup"
BAD EXAMPLE: "I will create a beautiful and professional logo for your business" (wastes characters)

Return ONLY valid JSON array:
[
    {
        "title": "I will [80 chars of keyword-packed title]",
        "strategy": "keyword",
        "strategyLabel": "Keyword Cluster #1",
        "explanation": "Targets: keyword1, keyword2, keyword3",
        "predictedCTR": "high"
    }
]

Create 5 variations, each targeting different keyword combinations from the provided list.`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-5.2',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Fiverr SEO expert. Create keyword-stuffed titles for maximum search visibility. Readability is secondary to SEO rankings. Return only valid JSON array.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.8,
                max_completion_tokens: 2000
            });

            const text = response.choices[0]?.message?.content || '';
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error('Invalid response format');

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Title generation error:', error);
            throw new Error('Failed to generate title variations. Please try again.');
        }
    }

    async scoreGigDescription(description: string): Promise<import('../types').GigScore> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized');
        }

        const prompt = `Score this Fiverr gig description on SEO, readability, and conversion potential:

DESCRIPTION:
${description}

Analyze and score (1-100):
1. SEO Score - Keyword usage, structure, length
2. Readability Score - Grade level, sentence length, clarity
3. Conversion Score - Hook, benefits, CTA, trust signals

Calculate overall score = (SEO * 0.3) + (Readability * 0.3) + (Conversion * 0.4)

Grade:
- 90-100: A
- 80-89: B
- 70-79: C
- 60-69: D
- Below 60: F

Return ONLY valid JSON:
{
    "overallScore": 85,
    "seoScore": 80,
    "readabilityScore": 90,
    "conversionScore": 85,
    "seoIssues": ["Issue 1", "Issue 2"],
    "readabilityIssues": ["Issue 1"],
    "conversionIssues": ["Issue 1"],
    "improvements": ["Specific actionable improvement 1", "Improvement 2", "Improvement 3"],
    "grade": "B"
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-5.2',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Fiverr gig quality expert. Analyze descriptions and provide actionable scores and improvements. Be specific and helpful. Return only valid JSON.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_completion_tokens: 1500
            });

            const text = response.choices[0]?.message?.content || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid response format');

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Gig scoring error:', error);
            throw new Error('Failed to score gig. Please try again.');
        }
    }

    async improveGigDescription(
        description: string,
        improvements: string[],
        issues: string[]
    ): Promise<string> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized');
        }

        const prompt = `Rewrite this Fiverr gig description to fix ALL the listed issues while implementing ALL recommended improvements.

ORIGINAL DESCRIPTION:
${description}

ISSUES TO FIX:
${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

IMPROVEMENTS TO APPLY:
${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

REWRITING RULES:
1. Keep the seller's voice and style - don't sound robotic
2. Maintain the same service offering - don't change what they sell
3. Add power words: "proven", "guaranteed", "exclusive", "fast"
4. Use short sentences (max 15 words each)
5. Include numbers and specifics where possible
6. Add urgency and scarcity (limited slots, busy schedule)
7. Target 1200-1500 characters total (Fiverr sweet spot)
8. Use formatting: bold key benefits with **text**, add bullet points with ✓
9. Include a strong CTA at the end
10. Add social proof elements (years experience, satisfied clients)

Return ONLY the improved description text - no JSON, no quotes, just the raw description ready to paste into Fiverr.`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-5.2',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Fiverr gig copywriting expert. Rewrite descriptions to be more compelling, SEO-optimized, and conversion-focused while keeping the seller\'s authentic voice.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_completion_tokens: 2000
            });

            const text = response.choices[0]?.message?.content || '';
            if (!text) throw new Error('No improved description generated');

            return text.trim();
        } catch (error) {
            console.error('Gig improvement error:', error);
            throw new Error('Failed to improve gig. Please try again.');
        }
    }

    async translateGig(gig: import('../types').GeneratedGig, languageCodes: string[]): Promise<any[]> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized');
        }

        const LANGUAGES: Record<string, { name: string; flag: string; fiverr: boolean }> = {
            'es': { name: 'Spanish', flag: '🇪🇸', fiverr: true },
            'de': { name: 'German', flag: '🇩🇪', fiverr: true },
            'fr': { name: 'French', flag: '🇫🇷', fiverr: true },
            'pt': { name: 'Portuguese', flag: '🇧🇷', fiverr: true },
            'it': { name: 'Italian', flag: '🇮🇹', fiverr: true },
            'nl': { name: 'Dutch', flag: '🇳🇱', fiverr: true },
        };

        const translations: any[] = [];

        for (const langCode of languageCodes) {
            const lang = LANGUAGES[langCode];
            if (!lang) continue;

            const prompt = `Translate this Fiverr gig content to ${lang.name}. 

ORIGINAL GIG:
Title: ${gig.title}
Description: ${gig.description}
Tags: ${gig.searchTags?.join(', ') || 'N/A'}
FAQs:
${gig.faqs?.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n') || 'N/A'}

TRANSLATION REQUIREMENTS:
1. Translate naturally for ${lang.name}-speaking Fiverr buyers
2. Keep SEO keywords relevant to the ${lang.name} market
3. Maintain the same persuasive tone
4. Adapt cultural references if needed
5. Search tags MUST be popular ${lang.name} search terms on Fiverr

Return ONLY valid JSON:
{
    "title": "Translated title (max 80 chars, starts with equivalent of 'I will')",
    "description": "Full translated description",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "faqs": [
        {"question": "Translated Q1", "answer": "Translated A1"},
        {"question": "Translated Q2", "answer": "Translated A2"},
        {"question": "Translated Q3", "answer": "Translated A3"}
    ]
}`;

            try {
                const response = await this.client.chat.completions.create({
                    model: 'gpt-5.2',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional Fiverr gig translator and SEO expert for the ${lang.name} market. Translate content to be natural, persuasive, and optimized for ${lang.name}-speaking buyers. Return only valid JSON.`
                        },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_completion_tokens: 2000
                });

                const text = response.choices[0]?.message?.content || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    translations.push({
                        language: { code: langCode, ...lang },
                        title: parsed.title,
                        description: parsed.description,
                        tags: parsed.tags || [],
                        faqs: parsed.faqs || []
                    });
                }
            } catch (error) {
                console.error(`Translation to ${lang.name} failed:`, error);
                // Continue with other languages
            }
        }

        if (translations.length === 0) {
            throw new Error('Translation failed for all languages');
        }

        return translations;
    }
}

// Singleton instance
export const openaiService = new OpenAIService();

