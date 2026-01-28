import type {
    UserSpecialty,
    KeywordData,
    KeywordConfidence,
    KeywordAlert,
    TrackedKeyword
} from '../types';
import { openaiService } from './openaiService';
import { supabase } from '../lib/supabase';

class KeywordIntelligenceService {
    private userId: string | null = null;
    private specialty: UserSpecialty | null = null;

    setUser(userId: string, specialty?: UserSpecialty) {
        this.userId = userId;
        this.specialty = specialty || null;
    }

    setSpecialty(specialty: UserSpecialty) {
        this.specialty = specialty;
    }

    /**
     * Calculate order confidence score for a keyword
     * Higher score = more likely to get orders
     */
    calculateConfidence(keyword: KeywordData, specialty?: UserSpecialty): KeywordConfidence {
        const spec = specialty || this.specialty;

        // Factor scores (0-100 each)
        const factors = {
            demandScore: this.calculateDemandScore(keyword),
            competitionScore: this.calculateCompetitionScore(keyword),
            priceViability: this.calculatePriceViability(keyword, spec),
            newSellerSuccess: this.calculateNewSellerSuccess(keyword),
            trendMomentum: this.calculateTrendMomentum(keyword)
        };

        // Weighted average (demand and competition matter most)
        const weights = {
            demandScore: 0.30,
            competitionScore: 0.25,
            priceViability: 0.15,
            newSellerSuccess: 0.15,
            trendMomentum: 0.15
        };

        const overallScore = Math.round(
            factors.demandScore * weights.demandScore +
            factors.competitionScore * weights.competitionScore +
            factors.priceViability * weights.priceViability +
            factors.newSellerSuccess * weights.newSellerSuccess +
            factors.trendMomentum * weights.trendMomentum
        );

        // Determine recommendation
        let recommendation: KeywordConfidence['recommendation'];
        if (overallScore >= 75) recommendation = 'highly_recommended';
        else if (overallScore >= 55) recommendation = 'recommended';
        else if (overallScore >= 35) recommendation = 'consider';
        else recommendation = 'avoid';

        // Generate reasoning
        const reasoning = this.generateReasoning(factors, overallScore, keyword);

        // Estimate orders and time
        const estimatedOrdersPerMonth = this.estimateMonthlyOrders(overallScore, keyword);
        const estimatedTimeToFirstOrder = this.estimateTimeToOrder(overallScore, keyword);

        return {
            keyword: keyword.keyword,
            overallScore,
            factors,
            recommendation,
            reasoning,
            estimatedOrdersPerMonth,
            estimatedTimeToFirstOrder
        };
    }

    private calculateDemandScore(keyword: KeywordData): number {
        let score = 50; // Base score

        // Orders in queue is the strongest signal
        if (keyword.ordersInQueue !== undefined) {
            if (keyword.ordersInQueue >= 20) score += 40;
            else if (keyword.ordersInQueue >= 10) score += 30;
            else if (keyword.ordersInQueue >= 5) score += 20;
            else if (keyword.ordersInQueue >= 1) score += 10;
        }

        // Recent sales indicates active market
        if (keyword.recentSales !== undefined) {
            if (keyword.recentSales <= 1) score += 15;
            else if (keyword.recentSales <= 3) score += 10;
            else if (keyword.recentSales <= 7) score += 5;
        }

        // Buyer intent
        if (keyword.buyerIntent === 'high') score += 15;
        else if (keyword.buyerIntent === 'medium') score += 5;

        // Search volume
        if (keyword.searchVolume === 'very_high') score += 10;
        else if (keyword.searchVolume === 'high') score += 5;

        return Math.min(100, Math.max(0, score));
    }

    private calculateCompetitionScore(keyword: KeywordData): number {
        let score = 50;

        // Low competition = higher score
        if (keyword.competition === 'low') score += 35;
        else if (keyword.competition === 'medium') score += 15;
        else if (keyword.competition === 'high') score -= 15;

        // Difficulty
        if (keyword.difficulty !== undefined) {
            if (keyword.difficulty <= 20) score += 25;
            else if (keyword.difficulty <= 40) score += 15;
            else if (keyword.difficulty <= 60) score += 5;
            else if (keyword.difficulty > 80) score -= 20;
        }

        // Competitor usage
        if (keyword.competitorUsage === 'rare') score += 20;
        else if (keyword.competitorUsage === 'common') score += 5;
        else if (keyword.competitorUsage === 'saturated') score -= 25;

        return Math.min(100, Math.max(0, score));
    }

    private calculatePriceViability(keyword: KeywordData, _spec?: UserSpecialty | null): number {
        let score = 60; // Assume viable by default

        // If we have suggested bid info, use it
        if (keyword.suggestedBid) {
            const match = keyword.suggestedBid.match(/\$([\d.]+)/);
            if (match) {
                const bid = parseFloat(match[1]);
                if (bid >= 2) score += 25;
                else if (bid >= 1) score += 15;
                else if (bid >= 0.5) score += 5;
            }
        }

        // Seasonality affects viability
        if (keyword.seasonality === 'evergreen') score += 15;
        else if (keyword.seasonality === 'trending_now') score += 10;

        return Math.min(100, Math.max(0, score));
    }

    private calculateNewSellerSuccess(keyword: KeywordData): number {
        let score = 50;

        // Low competition helps new sellers
        if (keyword.competition === 'low') score += 30;
        else if (keyword.competition === 'medium') score += 10;
        else if (keyword.competition === 'high') score -= 20;

        // Long-tail keywords are easier for new sellers
        if (keyword.keywordType === 'long_tail') score += 20;
        else if (keyword.keywordType === 'question') score += 15;
        else if (keyword.keywordType === 'action') score += 10;

        // Rare keywords give new sellers a chance
        if (keyword.competitorUsage === 'rare') score += 15;

        return Math.min(100, Math.max(0, score));
    }

    private calculateTrendMomentum(keyword: KeywordData): number {
        let score = 50;

        // Trend direction
        if (keyword.trend === 'hot') score += 35;
        else if (keyword.trend === 'up') score += 25;
        else if (keyword.trend === 'stable') score += 5;
        else if (keyword.trend === 'down') score -= 20;

        // Trending score
        if (keyword.trendingScore !== undefined) {
            if (keyword.trendingScore >= 80) score += 20;
            else if (keyword.trendingScore >= 60) score += 10;
            else if (keyword.trendingScore >= 40) score += 5;
            else if (keyword.trendingScore < 20) score -= 10;
        }

        // Seasonality
        if (keyword.seasonality === 'trending_now') score += 15;

        return Math.min(100, Math.max(0, score));
    }

    private generateReasoning(factors: KeywordConfidence['factors'], _score: number, keyword: KeywordData): string {
        const parts: string[] = [];

        if (factors.demandScore >= 70) {
            parts.push(`High demand with ${keyword.ordersInQueue || 'active'} orders in queue`);
        } else if (factors.demandScore <= 30) {
            parts.push('Low buyer activity detected');
        }

        if (factors.competitionScore >= 70) {
            parts.push('Low competition makes ranking easier');
        } else if (factors.competitionScore <= 30) {
            parts.push('Saturated market - hard to stand out');
        }

        if (factors.newSellerSuccess >= 70) {
            parts.push('New sellers can succeed here');
        } else if (factors.newSellerSuccess <= 30) {
            parts.push('Dominated by established sellers');
        }

        if (factors.trendMomentum >= 70) {
            parts.push('Strong upward trend');
        } else if (factors.trendMomentum <= 30) {
            parts.push('Declining interest');
        }

        return parts.join('. ') + '.';
    }

    private estimateMonthlyOrders(score: number, keyword: KeywordData): number {
        const baseOrders = keyword.ordersInQueue || 5;

        if (score >= 75) return Math.round(baseOrders * 0.4); // 40% market share potential
        if (score >= 55) return Math.round(baseOrders * 0.2); // 20%
        if (score >= 35) return Math.round(baseOrders * 0.1); // 10%
        return Math.round(baseOrders * 0.05); // 5%
    }

    private estimateTimeToOrder(score: number, _keyword: KeywordData): string {
        if (score >= 80) return '1-2 days';
        if (score >= 70) return '3-5 days';
        if (score >= 60) return '1-2 weeks';
        if (score >= 50) return '2-3 weeks';
        if (score >= 40) return '1 month';
        return '1+ months';
    }

    /**
     * Enhanced keyword research with confidence scoring
     */
    async researchKeywordsWithConfidence(query: string): Promise<{
        keywords: KeywordData[];
        confidenceScores: KeywordConfidence[];
        topPicks: KeywordConfidence[];
    }> {
        // Get base keywords from OpenAI
        const keywords = await openaiService.searchKeywords(query);

        // Calculate confidence for each
        const confidenceScores = keywords.map(kw => this.calculateConfidence(kw));

        // Sort by confidence and get top picks
        const sorted = [...confidenceScores].sort((a, b) => b.overallScore - a.overallScore);
        const topPicks = sorted.filter(c => c.recommendation === 'highly_recommended' || c.recommendation === 'recommended').slice(0, 5);

        return { keywords, confidenceScores, topPicks };
    }

    /**
     * Generate alerts based on specialty and market changes
     */
    async generateAlerts(specialty: UserSpecialty): Promise<KeywordAlert[]> {
        if (!this.userId) return [];

        const alerts: KeywordAlert[] = [];

        // Research trending keywords in specialty
        const trendQuery = `${specialty.primaryService} ${specialty.subNiches.slice(0, 2).join(' ')} trending 2025`;

        try {
            const { topPicks } = await this.researchKeywordsWithConfidence(trendQuery);

            // Create alerts for high-confidence new opportunities
            for (const pick of topPicks.slice(0, 3)) {
                if (pick.overallScore >= 70) {
                    alerts.push({
                        id: `alert-${Date.now()}-${Math.random()}`,
                        userId: this.userId,
                        type: 'opportunity',
                        title: `🔥 High-demand keyword found`,
                        description: `"${pick.keyword}" has ${pick.overallScore}% order confidence. ${pick.reasoning}`,
                        keyword: pick.keyword,
                        priority: pick.overallScore >= 80 ? 'urgent' : 'high',
                        isRead: false,
                        createdAt: new Date()
                    });
                }
            }
        } catch (error) {
            console.error('Failed to generate alerts:', error);
        }

        return alerts;
    }

    /**
     * Save tracked keyword to database
     */
    async trackKeyword(keyword: KeywordData, confidence: KeywordConfidence): Promise<void> {
        if (!this.userId || !this.specialty) return;

        const trackedKeyword: Partial<TrackedKeyword> = {
            userId: this.userId,
            keyword: keyword.keyword,
            specialty: this.specialty.primaryService,
            orderConfidence: confidence.overallScore,
            avgOrdersInQueue: keyword.ordersInQueue || 0,
            avgPrice: parseFloat(keyword.suggestedBid?.replace(/[^0-9.]/g, '') || '10'),
            competitorCount: keyword.competition === 'high' ? 50 : keyword.competition === 'medium' ? 25 : 10,
            trend: keyword.trend === 'hot' || keyword.trend === 'up' ? 'rising' :
                keyword.trend === 'down' ? 'falling' : 'stable',
            lastChecked: new Date(),
            history: [{
                date: new Date(),
                rank: 0,
                ordersInQueue: keyword.ordersInQueue || 0
            }]
        };

        try {
            await supabase.from('tracked_keywords').upsert(trackedKeyword);
        } catch (error) {
            console.error('Failed to track keyword:', error);
        }
    }
}

export const keywordIntelligence = new KeywordIntelligenceService();
