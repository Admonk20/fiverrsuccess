export interface AnalyzedKeyword {
    keyword: string;
    score: number;
    metrics: {
        totalQueue: number;
        bestRecentDays: number | null; // null means no recent sales found
        frequency: number;
    };
    sourceTitles: string[]; // Keep track of which titles contributed
}

interface RawEntry {
    title: string;
    queueCount: number;
    recentDays: number | null; // null if no recent label
    keywords: string[];
}

/**
 * Parses raw text input containing "I will..." titles and keywords.
 * Expected format blocks:
 * 
 * I will create a python script (5)
 * python, scripting, coding
 * 
 * I will fix your bug (recent 2)
 * bug fix, javascript, react
 */
export function parseAndRankKeywords(inputText: string): AnalyzedKeyword[] {
    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
    const entries: RawEntry[] = [];

    let currentEntry: Partial<RawEntry> | null = null;

    // 1. Parse the Raw Text
    lines.forEach(line => {
        // Check if line is a Title (starts with "I will" case insensitive)
        if (line.toLowerCase().startsWith('i will')) {
            // Parse metrics
            let queueCount = 0;
            let recentDays: number | null = null;

            // Check for (N) - Queue Count
            const queueMatch = line.match(/\((\d+)\)$/);
            if (queueMatch) {
                queueCount = parseInt(queueMatch[1], 10);
            }

            // Check for (recent X)
            const recentMatch = line.match(/\(recent\s+(\d+)\)$/i);
            if (recentMatch) {
                recentDays = parseInt(recentMatch[1], 10);
            }

            currentEntry = {
                title: line,
                queueCount,
                recentDays,
                keywords: []
            };
        }
        // If not a title, assume it's a keyword list for the previous title
        else if (currentEntry) {
            // Split by commas or common separators
            const kws = line.split(/[,\t]+/).map(k => k.trim().toLowerCase()).filter(k => k);
            if (currentEntry.keywords) {
                currentEntry.keywords.push(...kws);
            }
            // Push the completed entry
            entries.push(currentEntry as RawEntry);
            currentEntry = null; // Reset for next block
        }
    });

    // 2. Aggregate Data per Unique Keyword
    const keywordMap = new Map<string, AnalyzedKeyword>();

    entries.forEach(entry => {
        entry.keywords.forEach(kw => {
            const existing = keywordMap.get(kw) || {
                keyword: kw,
                score: 0,
                metrics: { totalQueue: 0, bestRecentDays: null, frequency: 0 },
                sourceTitles: []
            };

            // Update Metrics
            existing.metrics.totalQueue += entry.queueCount;
            existing.metrics.frequency += 1;

            // Track best "recent" (smaller is better)
            if (entry.recentDays !== null) {
                if (existing.metrics.bestRecentDays === null || entry.recentDays < existing.metrics.bestRecentDays) {
                    existing.metrics.bestRecentDays = entry.recentDays;
                }
            }

            existing.sourceTitles.push(entry.title);
            keywordMap.set(kw, existing);
        });
    });

    // 3. Scoring & Sorting Logic
    // Rule: Active-queue > Recent > Frequency

    return Array.from(keywordMap.values()).sort((a, b) => {
        // Primary: Queue Count (Higher is better)
        if (a.metrics.totalQueue !== b.metrics.totalQueue) {
            return b.metrics.totalQueue - a.metrics.totalQueue;
        }

        // Secondary: Recent (Lower days is better)
        // If one has recent data and other doesn't, the one with data wins
        if (a.metrics.bestRecentDays !== null && b.metrics.bestRecentDays === null) return -1;
        if (a.metrics.bestRecentDays === null && b.metrics.bestRecentDays !== null) return 1;

        if (a.metrics.bestRecentDays !== null && b.metrics.bestRecentDays !== null) {
            if (a.metrics.bestRecentDays !== b.metrics.bestRecentDays) {
                return a.metrics.bestRecentDays - b.metrics.bestRecentDays; // Ascending (smaller days = better)
            }
        }

        // Tertiary: Frequency (Higher is better)
        return b.metrics.frequency - a.metrics.frequency;
    });
}
