import type { UserSpecialty, KeywordAlert } from '../types';
import { keywordIntelligence } from './keywordIntelligence';
import { supabase } from '../lib/supabase';

interface MonitorConfig {
    userId: string;
    specialty: UserSpecialty;
    checkIntervalMs: number; // Default: weekly (7 * 24 * 60 * 60 * 1000)
    onNewAlerts?: (alerts: KeywordAlert[]) => void;
}

class KeywordMonitorService {
    private config: MonitorConfig | null = null;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isRunning = false;
    private lastCheckTime: Date | null = null;

    /**
     * Start background monitoring with given config
     */
    start(config: MonitorConfig) {
        if (this.isRunning) {
            console.log('[KeywordMonitor] Already running, updating config...');
            this.stop();
        }

        this.config = config;
        this.isRunning = true;

        keywordIntelligence.setUser(config.userId, config.specialty);

        // Run initial check
        this.runCheck();

        // Schedule periodic checks
        this.intervalId = setInterval(() => {
            this.runCheck();
        }, config.checkIntervalMs);

        console.log(`[KeywordMonitor] Started with ${config.checkIntervalMs / (1000 * 60 * 60)}h interval`);
    }

    /**
     * Stop monitoring
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('[KeywordMonitor] Stopped');
    }

    /**
     * Get last check time
     */
    getLastCheckTime(): Date | null {
        return this.lastCheckTime;
    }

    /**
     * Check if running
     */
    isActive(): boolean {
        return this.isRunning;
    }

    /**
     * Force an immediate check
     */
    async runCheck(): Promise<KeywordAlert[]> {
        if (!this.config) {
            console.warn('[KeywordMonitor] No config set');
            return [];
        }

        console.log('[KeywordMonitor] Running keyword check...');
        this.lastCheckTime = new Date();

        try {
            // Generate alerts based on specialty
            const alerts = await keywordIntelligence.generateAlerts(this.config.specialty);

            if (alerts.length > 0) {
                // Store alerts in database
                await this.storeAlerts(alerts);

                // Notify callback
                this.config.onNewAlerts?.(alerts);

                console.log(`[KeywordMonitor] Found ${alerts.length} new opportunities`);
            } else {
                console.log('[KeywordMonitor] No new opportunities found');
            }

            // Update last check time in database
            await this.updateLastCheckTime();

            return alerts;
        } catch (error) {
            console.error('[KeywordMonitor] Check failed:', error);
            return [];
        }
    }

    /**
     * Store alerts in Supabase
     */
    private async storeAlerts(alerts: KeywordAlert[]): Promise<void> {
        if (!this.config?.userId) return;

        const alertsToStore = alerts.map(a => ({
            user_id: this.config!.userId,
            type: a.type,
            title: a.title,
            description: a.description,
            keyword: a.keyword,
            priority: a.priority,
            is_read: false,
            created_at: new Date().toISOString()
        }));

        try {
            await supabase.from('keyword_alerts').insert(alertsToStore);
        } catch (error) {
            console.error('[KeywordMonitor] Failed to store alerts:', error);
        }
    }

    /**
     * Update last check timestamp
     */
    private async updateLastCheckTime(): Promise<void> {
        if (!this.config?.userId) return;

        try {
            await supabase
                .from('user_specialties')
                .update({ last_keyword_check: new Date().toISOString() })
                .eq('user_id', this.config.userId);
        } catch (error) {
            console.error('[KeywordMonitor] Failed to update check time:', error);
        }
    }

    /**
     * Load stored alerts from database
     */
    async loadStoredAlerts(userId: string, limit = 20): Promise<KeywordAlert[]> {
        try {
            const { data } = await supabase
                .from('keyword_alerts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (!data) return [];

            return data.map(row => ({
                id: row.id,
                userId: row.user_id,
                type: row.type,
                title: row.title,
                description: row.description,
                keyword: row.keyword,
                priority: row.priority,
                isRead: row.is_read,
                createdAt: new Date(row.created_at)
            }));
        } catch (error) {
            console.error('[KeywordMonitor] Failed to load alerts:', error);
            return [];
        }
    }

    /**
     * Mark alert as read
     */
    async markAsRead(alertId: string): Promise<void> {
        try {
            await supabase
                .from('keyword_alerts')
                .update({ is_read: true })
                .eq('id', alertId);
        } catch (error) {
            console.error('[KeywordMonitor] Failed to mark as read:', error);
        }
    }

    /**
     * Get monitoring stats
     */
    getStats() {
        return {
            isRunning: this.isRunning,
            lastCheckTime: this.lastCheckTime,
            intervalMs: this.config?.checkIntervalMs || 0,
            specialty: this.config?.specialty?.primaryService || 'Not set'
        };
    }
}

// Export singleton
export const keywordMonitor = new KeywordMonitorService();

// Helper to start weekly monitoring
export function startWeeklyMonitoring(
    userId: string,
    specialty: UserSpecialty,
    onNewAlerts?: (alerts: KeywordAlert[]) => void
) {
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    keywordMonitor.start({
        userId,
        specialty,
        checkIntervalMs: WEEK_MS,
        onNewAlerts
    });
}

// Helper for daily monitoring (for testing or premium users)
export function startDailyMonitoring(
    userId: string,
    specialty: UserSpecialty,
    onNewAlerts?: (alerts: KeywordAlert[]) => void
) {
    const DAY_MS = 24 * 60 * 60 * 1000;

    keywordMonitor.start({
        userId,
        specialty,
        checkIntervalMs: DAY_MS,
        onNewAlerts
    });
}
