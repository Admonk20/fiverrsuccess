import OpenAI from 'openai';
import type { GeneratedGig, KeywordData } from '../types';

const KEYWORD_RESEARCH_PROMPT = `You are an elite Fiverr keyword research expert with access to deep market intelligence. Perform comprehensive keyword research for this service.

Service/Niche: "{query}"

===== DEEP RESEARCH METHODOLOGY =====

**PHASE 1: Core Fiverr Keywords (8 keywords)**
Research what buyers ACTUALLY type on Fiverr:
- Action-based: "I need", "help me", "create my", "fix my"
- Urgent: "urgent", "asap", "same day", "rush"
- Budget: "cheap", "affordable", "budget", "best value"
- Quality: "premium", "professional", "high quality", "expert"
- Format-specific: Include file types, dimensions, platforms

**PHASE 2: Reddit/Forum Keywords (6 keywords)**
Phrases from r/forhire, r/slavelabour, r/freelance, Discord servers:
- Real questions people ask
- Pain points they describe
- Specific outcomes they want

**PHASE 3: Google/SEO Keywords (6 keywords)**
Commercial intent searches:
- "hire [service] online"
- "best [service] freelancer"
- "[service] for small business"
- Comparison searches: "[service] vs [alternative]"

**PHASE 4: Trending & Hot Keywords (6 keywords)**
Currently trending in 2024-2025:
- AI-related variations
- Platform-specific (TikTok, Reels, Shorts)
- Industry buzzwords
- Seasonal opportunities

**PHASE 5: Competitor Gap Keywords (4 keywords)**
Keywords top sellers rank for but have low competition:
- Long-tail variations of popular searches
- Underserved niches
- Emerging sub-services

===== FOR EACH KEYWORD, ANALYZE =====

1. **searchVolume**: Estimate based on market size (low, medium, high, very_high)
2. **difficulty**: How hard to rank (1-100)
3. **buyerIntent**: Will they buy immediately? (high, medium, low)
4. **trendingScore**: Current momentum (1-100)
5. **keywordType**: Classification (long_tail, short_tail, question, comparison, action)
6. **competitorUsage**: How many sellers use this? (rare, common, saturated)
7. **seasonality**: Time-based demand (evergreen, seasonal, trending_now)
8. **suggestedBid**: CPC estimate like "$0.50-$2.00"
9. **ordersInQueue**: Estimate active orders (0-50) based on typical demand.
10. **recentSales**: Estimate days since last sale (0-30).

===== OUTPUT FORMAT =====

Return EXACTLY this JSON (no markdown, no code blocks):
[
  {
    "keyword": "exact buyer search phrase",
    "source": "fiverr",
    "competition": "low",
    "trend": "up",
    "relevance": 95,
    "searchVolume": "high",
    "difficulty": 45,
    "buyerIntent": "high",
    "keywordType": "long_tail",
    "trendingScore": 85,
    "competitorUsage": "common",
    "seasonality": "evergreen",
    "suggestedBid": "$1.50-$3.00",
    "ordersInQueue": 12,
    "recentSales": 2
  }
]

Generate exactly 30 keywords total. Prioritize HIGH buyer intent and LOW difficulty keywords.
Sort by: trendingScore (desc), then relevance (desc).`;

const GIG_GENERATION_PROMPT = `You are the #1 Fiverr gig optimization expert. You write gigs that get clicks and orders.

Keywords: {keywords}
Niche: {niche}

===== CRITICAL REQUIREMENTS =====

**LANGUAGE RULES** (Grade 6 reading level):
- Use simple, everyday words
- Short sentences (max 15 words)
- Write like you're talking to a friend
- No jargon or fancy words
- Use "you" and "your" frequently

**TITLE** (max 80 characters, starts with "I will"):
- Include the #1 keyword naturally
- Be specific about what you deliver
- Include a power word (fast, stunning, professional)
- Example: "I will design a stunning logo for your business in 24 hours"

**SEARCH TAGS** (5 tags, each max 20 chars, max 3 words):
- Mix of specific + broad terms
- Include at least 2 long-tail keywords
- No generic tags like "design" alone

**DESCRIPTION** (MUST follow this EXACT structure):

Paragraph 1 - THE HOOK (emotional question):
"Tired of [pain point]? 🤔" or "Need [outcome] fast? ⚡"

Paragraph 2 - WHAT YOU GET (bullet benefits):
"Here's what I'll deliver:
✅ [Specific deliverable 1]
✅ [Specific deliverable 2]
✅ [Specific deliverable 3]
✅ [Bonus if any]"

Paragraph 3 - TRUST BUILDER (1-2 sentences):
Brief credibility statement.

Paragraph 4 - CTA (urgency + action):
"Ready to [achieve goal]? 👉 Order now and let's make it happen!"

Total: 800-1000 characters. Simple words only.

**FAQS** (5 questions buyers ACTUALLY ask):
- About revisions and changes
- About timeline and delivery
- About file formats
- About communication
- About refunds or guarantees
Use simple, friendly answers.

**REQUIREMENTS** (4-5 buyer questions):
Ask only what you NEED to start. Be specific.

**IMAGE PROMPT**:
Describe a clean, professional gig image. Fiverr style: clean background, bold text, relevant imagery.

===== OUTPUT FORMAT =====
Return ONLY valid JSON (no markdown blocks):
{
  "title": "I will...",
  "metadata": {
    "category": "string",
    "subcategory": "string",
    "serviceType": "string"
  },
  "searchTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "pricing": {
    "basic": {
      "name": "Starter",
      "price": number,
      "description": "One sentence, simple",
      "deliveryTime": "X days",
      "revisions": number,
      "features": ["feature1", "feature2", "feature3"]
    },
    "standard": {
      "name": "Professional",
      "price": number,
      "description": "One sentence, simple",
      "deliveryTime": "X days",
      "revisions": number,
      "features": ["feature1", "feature2", "feature3", "feature4"]
    },
    "premium": {
      "name": "Enterprise",
      "price": number,
      "description": "One sentence, simple",
      "deliveryTime": "X days",
      "revisions": number,
      "features": ["feature1", "feature2", "feature3", "feature4", "feature5"]
    }
  },
  "description": "The full description following the exact structure above",
  "faqs": [
    {"question": "Real buyer question", "answer": "Simple, friendly answer"}
  ],
  "requirements": [
    {"question": "What I need from you", "type": "text|file|multiple_choice", "required": true, "options": []}
  ],
  "imagePrompt": "Professional gig cover image description"
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
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an elite Fiverr keyword research analyst with deep market intelligence. Perform thorough research across Fiverr, Reddit, Google, trending platforms, and competitor analysis. Return only valid JSON arrays with comprehensive keyword data including all metrics. No markdown formatting, no code blocks.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.85,
                max_tokens: 4000
            });

            const text = response.choices[0]?.message?.content || '';

            // Extract JSON from the response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.error('Raw response:', text);
                throw new Error('Invalid response format from AI');
            }

            const keywords: KeywordData[] = JSON.parse(jsonMatch[0]);
            return keywords;
        } catch (error) {
            console.error('Keyword search error:', error);
            if (error instanceof Error && error.message.includes('401')) {
                throw new Error('Invalid API key. Please check your OpenAI API key.');
            }
            throw error; // Re-throw actual error for UI
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
                model: 'gpt-4o',
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
                max_tokens: 3500
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
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert Fiverr competitor analyst. Analyze gig URLs and provide actionable competitive intelligence. Return only valid JSON.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
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
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a keyword clustering expert. Group keywords by buyer intent funnel stages. Return only valid JSON array.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.6,
                max_tokens: 2500
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

        const prompt = `Generate 5 title variations for this Fiverr gig:

Current Title: ${gig.title}
Niche: ${gig.metadata?.category || 'General'}
Top Keywords: ${gig.searchTags?.join(', ') || 'N/A'}

Create 5 different title strategies:
1. EMOTIONAL - Triggers feelings (fear of missing out, excitement)
2. BENEFIT - Focuses on the outcome/result
3. KEYWORD - Maximizes SEO with primary keywords
4. URGENCY - Creates time pressure
5. SOCIAL_PROOF - Implies popularity/trust

Each title MUST:
- Start with "I will"
- Be max 80 characters
- Sound natural, not spammy

Return ONLY valid JSON array:
[
    {
        "title": "I will...",
        "strategy": "emotional",
        "strategyLabel": "🎯 Emotional Hook",
        "explanation": "Why this works",
        "predictedCTR": "high"
    }
]`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Fiverr title optimization expert. Create compelling title variations using different psychological strategies. Return only valid JSON array.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 1500
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
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Fiverr gig quality expert. Analyze descriptions and provide actionable scores and improvements. Be specific and helpful. Return only valid JSON.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 1500
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
}

// Singleton instance
export const openaiService = new OpenAIService();

