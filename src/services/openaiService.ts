import OpenAI from 'openai';
import type { GeneratedGig, KeywordData } from '../types';

const KEYWORD_RESEARCH_PROMPT = `You are a top Fiverr keyword research expert. Your job is to find SPECIFIC, actionable keywords that actual Fiverr buyers search for.

Service/Niche: "{query}"

RULES FOR KEYWORDS:
1. Be ULTRA-SPECIFIC - no generic terms like "professional" or "quality"
2. Include buyer intent phrases (e.g., "urgent logo needed", "fix my website", "edit my video")
3. Include price-related searches (e.g., "cheap logo design", "affordable video editing")
4. Include format-specific terms (e.g., "transparent PNG logo", "4K video edit", "wordpress fix")
5. Include pain points (e.g., "logo revision", "quick turnaround", "same day delivery")

FOR EACH SOURCE:
- **Fiverr**: What buyers actually type in search. Use action words + specifics.
- **Reddit**: What people ask for in r/forhire, r/slavelabour, r/freelance. Real phrases from posts.
- **Google**: Commercial searches with buyer intent. "hire [service]", "[service] near me", "best [service]"

Return EXACTLY this JSON (no markdown):
[
  {
    "keyword": "specific buyer search phrase",
    "source": "fiverr" | "reddit" | "google",
    "competition": "low" | "medium" | "high",
    "trend": "up" | "down" | "stable",
    "relevance": 70-100
  }
]

Generate 18-21 keywords (6-7 per source). Make them ACTIONABLE and SPECIFIC.`;

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

    initialize(apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.client = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true
        });
    }

    isInitialized(): boolean {
        return this.client !== null;
    }

    async searchKeywords(query: string): Promise<KeywordData[]> {
        if (!this.client) {
            throw new Error('OpenAI API not initialized. Please add your API key.');
        }

        const prompt = KEYWORD_RESEARCH_PROMPT.replace('{query}', query);

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Fiverr SEO expert. Return only valid JSON arrays with specific, actionable keywords. No markdown formatting.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 2500
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
                model: 'gpt-4o-mini',
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
