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

1. **searchVolume**: Estimate based on market size
   - "very_high": 10,000+ monthly searches
   - "high": 1,000-10,000
   - "medium": 100-1,000  
   - "low": Under 100

2. **difficulty**: How hard to rank (1-100)
   - 1-30: Easy, few competitors
   - 31-60: Medium, moderate competition
   - 61-100: Hard, dominated by top sellers

3. **buyerIntent**: Will they buy immediately?
   - "high": Ready to order now
   - "medium": Comparing options
   - "low": Just researching

4. **trendingScore**: Current momentum (1-100)
   - 80-100: 🔥 Hot right now
   - 50-79: Growing
   - 20-49: Stable
   - 1-19: Declining

5. **keywordType**: Classification
   - "long_tail": 4+ words, very specific
   - "short_tail": 1-2 words, broad
   - "question": Starts with how/what/can
   - "comparison": X vs Y, best X for Y
   - "action": I need, create, fix, help

6. **competitorUsage**: How many sellers use this?
   - "rare": Untapped opportunity
   - "common": Standard usage
   - "saturated": Overused

7. **seasonality**: Time-based demand
   - "evergreen": Year-round demand
   - "seasonal": Peaks at certain times
   - "trending_now": Currently hot

===== OUTPUT FORMAT =====

Return EXACTLY this JSON (no markdown, no code blocks):
[
  {
    "keyword": "exact buyer search phrase",
    "source": "fiverr" | "reddit" | "google" | "trending" | "competitor",
    "competition": "low" | "medium" | "high",
    "trend": "up" | "down" | "stable" | "hot",
    "relevance": 70-100,
    "searchVolume": "low" | "medium" | "high" | "very_high",
    "difficulty": 1-100,
    "buyerIntent": "high" | "medium" | "low",
    "keywordType": "long_tail" | "short_tail" | "question" | "comparison" | "action",
    "trendingScore": 1-100,
    "competitorUsage": "rare" | "common" | "saturated",
    "seasonality": "evergreen" | "seasonal" | "trending_now",
    "suggestedBid": "$X.XX-$X.XX"
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
            throw new Error('Failed to search keywords. Please try again.');
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
}

// Singleton instance
export const openaiService = new OpenAIService();
