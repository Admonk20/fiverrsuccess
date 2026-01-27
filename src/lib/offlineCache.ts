import type { KeywordData, GeneratedGig, CachedSession } from '../types';

const CACHE_KEY = 'fiverr-offline-cache';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

class OfflineCache {
    private sessions: CachedSession[] = [];

    constructor() {
        this.loadFromStorage();
        this.cleanExpired();
    }

    private loadFromStorage() {
        try {
            const saved = localStorage.getItem(CACHE_KEY);
            if (saved) {
                this.sessions = JSON.parse(saved).map((s: CachedSession) => ({
                    ...s,
                    cachedAt: new Date(s.cachedAt),
                    expiresAt: new Date(s.expiresAt)
                }));
            }
        } catch (e) {
            console.warn('Failed to load cache:', e);
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(this.sessions));
        } catch (e) {
            console.warn('Failed to save cache:', e);
        }
    }

    private cleanExpired() {
        const now = new Date();
        this.sessions = this.sessions.filter(s => s.expiresAt > now);
        this.saveToStorage();
    }

    cache(niche: string, keywords: KeywordData[], generatedGig: GeneratedGig | null) {
        const now = new Date();
        const session: CachedSession = {
            id: `cache-${Date.now()}`,
            niche,
            keywords,
            generatedGig,
            cachedAt: now,
            expiresAt: new Date(now.getTime() + CACHE_DURATION_MS)
        };

        // Remove existing cache for same niche
        this.sessions = this.sessions.filter(s => s.niche.toLowerCase() !== niche.toLowerCase());

        this.sessions.push(session);
        this.saveToStorage();

        return session;
    }

    get(niche: string): CachedSession | null {
        this.cleanExpired();
        return this.sessions.find(s =>
            s.niche.toLowerCase() === niche.toLowerCase()
        ) || null;
    }

    getAll(): CachedSession[] {
        this.cleanExpired();
        return [...this.sessions].sort((a, b) =>
            b.cachedAt.getTime() - a.cachedAt.getTime()
        );
    }

    remove(id: string) {
        this.sessions = this.sessions.filter(s => s.id !== id);
        this.saveToStorage();
    }

    clear() {
        this.sessions = [];
        localStorage.removeItem(CACHE_KEY);
    }

    getSize(): number {
        return this.sessions.length;
    }

    isAvailable(): boolean {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch {
            return false;
        }
    }
}

export const offlineCache = new OfflineCache();
