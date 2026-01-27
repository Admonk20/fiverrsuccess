import type { TokenUsage } from '../types';

// Pricing per 1K tokens (GPT-4o)
const PRICING = {
    input: 0.0025, // $2.50 per 1M input tokens
    output: 0.01,  // $10 per 1M output tokens
};

class TokenTracker {
    private usage: TokenUsage[] = [];
    private storageKey = 'fiverr-token-usage';

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.usage = JSON.parse(saved).map((u: TokenUsage) => ({
                    ...u,
                    timestamp: new Date(u.timestamp)
                }));
            }
        } catch (e) {
            console.warn('Failed to load token usage:', e);
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.usage));
        } catch (e) {
            console.warn('Failed to save token usage:', e);
        }
    }

    track(promptTokens: number, completionTokens: number, feature: string) {
        const totalTokens = promptTokens + completionTokens;
        const estimatedCost =
            (promptTokens / 1000) * PRICING.input +
            (completionTokens / 1000) * PRICING.output;

        const entry: TokenUsage = {
            promptTokens,
            completionTokens,
            totalTokens,
            estimatedCost,
            timestamp: new Date(),
            feature
        };

        this.usage.push(entry);
        this.saveToStorage();

        return entry;
    }

    getSessionUsage(): { totalTokens: number; estimatedCost: number; byFeature: Record<string, number> } {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sessionUsage = this.usage.filter(u => u.timestamp >= today);

        const totalTokens = sessionUsage.reduce((sum, u) => sum + u.totalTokens, 0);
        const estimatedCost = sessionUsage.reduce((sum, u) => sum + u.estimatedCost, 0);

        const byFeature: Record<string, number> = {};
        sessionUsage.forEach(u => {
            byFeature[u.feature] = (byFeature[u.feature] || 0) + u.totalTokens;
        });

        return { totalTokens, estimatedCost, byFeature };
    }

    getTotalUsage(): { totalTokens: number; estimatedCost: number } {
        const totalTokens = this.usage.reduce((sum, u) => sum + u.totalTokens, 0);
        const estimatedCost = this.usage.reduce((sum, u) => sum + u.estimatedCost, 0);
        return { totalTokens, estimatedCost };
    }

    clearHistory() {
        this.usage = [];
        localStorage.removeItem(this.storageKey);
    }

    getHistory(): TokenUsage[] {
        return [...this.usage];
    }
}

export const tokenTracker = new TokenTracker();
