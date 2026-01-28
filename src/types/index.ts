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

// Phase 8: Feature Enhancement Types

export interface CompetitorAnalysis {
    url: string;
    title: string;
    sellerLevel: string;
    rating: number;
    reviewCount: number;
    startingPrice: number;
    keywordsUsed: string[];
    titlePatterns: string[];
    descriptionStrengths: string[];
    descriptionWeaknesses: string[];
    pricingStrategy: string;
    uniqueSellingPoints: string[];
    improvementSuggestions: string[];
    estimatedMonthlyOrders: number;
    competitiveAdvantages: string[];
}

export interface KeywordCluster {
    stage: 'awareness' | 'consideration' | 'decision';
    stageLabel: string;
    keywords: KeywordData[];
    description: string;
    targetingTips: string[];
}

export interface TitleVariation {
    title: string;
    strategy: 'emotional' | 'benefit' | 'keyword' | 'urgency' | 'social_proof';
    strategyLabel: string;
    explanation: string;
    predictedCTR: 'low' | 'medium' | 'high';
}

export interface GigScore {
    overallScore: number; // 1-100
    seoScore: number;
    readabilityScore: number;
    conversionScore: number;
    seoIssues: string[];
    readabilityIssues: string[];
    conversionIssues: string[];
    improvements: string[];
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// Phase 10: Technical Types

export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
    timestamp: Date;
    feature: string;
}

export interface CachedSession {
    id: string;
    niche: string;
    keywords: KeywordData[];
    generatedGig: GeneratedGig | null;
    cachedAt: Date;
    expiresAt: Date;
}

// Phase 13: Advanced Keyword Intelligence Types

export interface UserSpecialty {
    id: string;
    userId: string;
    primaryService: string; // e.g., "Logo Design", "Video Editing"
    subNiches: string[]; // e.g., ["Minimalist Logos", "3D Logos", "Mascot Design"]
    targetClients: string[]; // e.g., ["Startups", "E-commerce", "Restaurants"]
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
    priceRange: { min: number; max: number };
    createdAt: Date;
    updatedAt: Date;
}

export interface TrackedKeyword {
    id: string;
    userId: string;
    keyword: string;
    specialty: string;
    lastRank?: number;
    currentRank?: number;
    orderConfidence: number; // 0-100
    avgOrdersInQueue: number;
    avgPrice: number;
    competitorCount: number;
    trend: 'rising' | 'falling' | 'stable' | 'new';
    lastChecked: Date;
    history: {
        date: Date;
        rank: number;
        ordersInQueue: number;
    }[];
}

export interface KeywordAlert {
    id: string;
    userId: string;
    type: 'new_keyword' | 'trend_change' | 'competition_drop' | 'new_service' | 'opportunity';
    title: string;
    description: string;
    keyword?: string;
    actionUrl?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    isRead: boolean;
    createdAt: Date;
}

export interface KeywordConfidence {
    keyword: string;
    overallScore: number; // 0-100
    factors: {
        demandScore: number; // Based on orders in queue
        competitionScore: number; // Lower competition = higher score
        priceViability: number; // Market willing to pay?
        newSellerSuccess: number; // Can beginners rank?
        trendMomentum: number; // Is it growing?
    };
    recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'avoid';
    reasoning: string;
    estimatedOrdersPerMonth: number;
    estimatedTimeToFirstOrder: string;
}

export interface FiverrSearchResult {
    position: number;
    title: string;
    seller: string;
    sellerLevel: string;
    rating: number;
    reviewCount: number;
    startingPrice: number;
    ordersInQueue: number;
    deliveryTime: string;
    url: string;
    scrapedAt: Date;
}

export interface TrendData {
    keyword: string;
    specialty: string;
    dataPoints: {
        date: Date;
        searchVolume: number;
        avgPosition: number;
        avgPrice: number;
    }[];
    prediction: 'growing' | 'declining' | 'stable' | 'volatile';
    confidence: number;
}
