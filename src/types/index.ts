// Types for the Fiverr Gig Optimizer

export interface KeywordData {
    keyword: string;
    source: 'fiverr' | 'reddit' | 'google';
    volume?: number;
    competition?: string;
    trend?: 'up' | 'down' | 'stable';
    relevance: number;
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
