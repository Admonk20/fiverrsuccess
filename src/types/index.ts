// Types for the Fiverr Gig Optimizer

export interface KeywordData {
    keyword: string;
    source: 'fiverr' | 'reddit' | 'google' | 'trending' | 'competitor';
    volume?: number; // Estimated search volume 1-100
    competition?: 'low' | 'medium' | 'high';
    trend?: 'up' | 'down' | 'stable' | 'hot';
    relevance: number; // 1-100 score
    // Deep research fields
    searchVolume?: 'low' | 'medium' | 'high' | 'very_high';
    difficulty?: number; // 1-100, lower is easier to rank
    buyerIntent?: 'high' | 'medium' | 'low';
    keywordType?: 'long_tail' | 'short_tail' | 'question' | 'comparison' | 'action';
    trendingScore?: number; // 1-100, higher means more trending
    competitorUsage?: 'rare' | 'common' | 'saturated';
    seasonality?: 'evergreen' | 'seasonal' | 'trending_now';
    suggestedBid?: string; // CPC estimate like "$0.50-$2.00"
    ordersInQueue?: number; // Simulated active orders for ranking
    recentSales?: number; // Simulated days since last sale
}

export interface GigPricing {
    basic: {
        name: string;
        price: number;
        description: string;
        deliveryTime: string;
        revisions: number;
        features: string[];
    };
    standard: {
        name: string;
        price: number;
        description: string;
        deliveryTime: string;
        revisions: number;
        features: string[];
    };
    premium: {
        name: string;
        price: number;
        description: string;
        deliveryTime: string;
        revisions: number;
        features: string[];
    };
}

export interface GigFAQ {
    question: string;
    answer: string;
}

export interface GigRequirement {
    question: string;
    type: 'text' | 'file' | 'multiple_choice';
    required: boolean;
    options?: string[];
}

export interface GeneratedGig {
    title: string; // "I will..." format, max 80 chars
    metadata: {
        category: string;
        subcategory: string;
        serviceType: string;
    };
    searchTags: string[]; // 5 tags, each max 20 chars, max 3 words
    pricing: GigPricing;
    description: string;
    faqs: GigFAQ[];
    requirements: GigRequirement[];
    imagePrompt: string; // For generating the gig image
    imageUrl?: string; // The generated DALL-E image URL
    keywords: KeywordData[];
}

export interface SearchResult {
    query: string;
    keywords: KeywordData[];
    isLoading: boolean;
    error?: string;
}

export interface APISettings {
    geminiApiKey: string;
}
