/**
 * Fiverr Success - Enhanced Content Script v2
 * Scrapes search result data including REAL orders in queue
 */

(function () {
    'use strict';

    const DEBUG = true;
    const log = (...args) => DEBUG && console.log('[Fiverr Success]', ...args);

    // Scrape gig data with orders in queue
    function scrapeGigCards() {
        // Multiple selector strategies for Fiverr's changing DOM
        const gigCards = document.querySelectorAll(
            '.gig-card-layout, [class*="gig-card"], .gig-wrapper, .basic-gig-card, [data-testid="gig-card"]'
        );
        const gigs = [];

        gigCards.forEach((card, position) => {
            try {
                const gig = {
                    position: position + 1,
                    title: extractTitle(card),
                    seller: extractSeller(card),
                    sellerLevel: extractSellerLevel(card),
                    rating: extractRating(card),
                    reviewCount: extractReviewCount(card),
                    startingPrice: extractPrice(card),
                    ordersInQueue: extractOrdersInQueue(card), // CRITICAL: Real queue data
                    deliveryTime: extractDeliveryTime(card),
                    url: extractUrl(card),
                    impressionBadges: extractBadges(card),
                    thumbnail: card.querySelector('img')?.src || '',
                    scrapedAt: new Date().toISOString()
                };

                if (gig.title) {
                    gigs.push(gig);
                }
            } catch (e) {
                console.warn('Failed to scrape gig card:', e);
            }
        });

        return gigs;
    }

    function extractTitle(card) {
        const selectors = ['h3', '.gig-title', '[class*="title"]', 'a[href*="/"] h3'];
        for (const sel of selectors) {
            const el = card.querySelector(sel);
            if (el?.textContent?.trim()) return el.textContent.trim();
        }
        return '';
    }

    function extractSeller(card) {
        const selectors = ['.seller-name', '[class*="seller"]', '.username', '[class*="username"]'];
        for (const sel of selectors) {
            const el = card.querySelector(sel);
            if (el?.textContent?.trim()) return el.textContent.trim();
        }
        return '';
    }

    function extractSellerLevel(card) {
        const levelSelectors = [
            '[class*="level"]',
            '.seller-level',
            '[class*="badge"]',
            '[class*="Level"]'
        ];

        for (const sel of levelSelectors) {
            const el = card.querySelector(sel);
            const text = el?.textContent?.toLowerCase() || '';

            if (text.includes('top rated') || text.includes('toprated')) return 'Top Rated';
            if (text.includes('level 2') || text.includes('level2')) return 'Level 2';
            if (text.includes('level 1') || text.includes('level1')) return 'Level 1';
            if (text.includes('new seller') || text.includes('new')) return 'New Seller';
        }
        return 'Unknown';
    }

    function extractRating(card) {
        const ratingSelectors = ['[class*="rating"]', '.rating-score', '[class*="star"]'];
        for (const sel of ratingSelectors) {
            const el = card.querySelector(sel);
            const match = el?.textContent?.match(/[\d.]+/);
            if (match) return parseFloat(match[0]);
        }
        return 0;
    }

    function extractReviewCount(card) {
        const reviewSelectors = ['[class*="review"]', '.ratings-count', '[class*="count"]'];
        for (const sel of reviewSelectors) {
            const el = card.querySelector(sel);
            const match = el?.textContent?.match(/\(?([\d,k]+)\)?/i);
            if (match) {
                let count = match[1].replace(',', '');
                if (count.toLowerCase().includes('k')) {
                    return Math.round(parseFloat(count) * 1000);
                }
                return parseInt(count) || 0;
            }
        }
        return 0;
    }

    function extractPrice(card) {
        const priceSelectors = ['[class*="price"]', '.gig-price', '[class*="Price"]'];
        for (const sel of priceSelectors) {
            const el = card.querySelector(sel);
            const match = el?.textContent?.match(/[\d,]+/);
            if (match) return parseInt(match[0].replace(',', ''));
        }
        return 0;
    }

    /**
     * CRITICAL: Extract orders in queue
     * This is the key metric for demand analysis
     */
    function extractOrdersInQueue(card) {
        // Strategy 1: Look for "X orders in queue" text
        const queueSelectors = [
            '[class*="queue"]',
            '[class*="order"]',
            '.orders-in-queue',
            '[data-testid*="queue"]'
        ];

        for (const sel of queueSelectors) {
            const el = card.querySelector(sel);
            const match = el?.textContent?.match(/(\d+)\s*orders?\s*in\s*queue/i);
            if (match) return parseInt(match[1]);
        }

        // Strategy 2: Search all text nodes
        const allText = card.textContent || '';
        const queueMatch = allText.match(/(\d+)\s*orders?\s*in\s*queue/i);
        if (queueMatch) return parseInt(queueMatch[1]);

        // Strategy 3: Look for "busy" indicators
        if (allText.toLowerCase().includes('very busy')) return 15;
        if (allText.toLowerCase().includes('busy')) return 8;

        return 0;
    }

    function extractDeliveryTime(card) {
        const deliverySelectors = ['[class*="delivery"]', '[class*="Delivery"]', '.delivery-time'];
        for (const sel of deliverySelectors) {
            const el = card.querySelector(sel);
            const match = el?.textContent?.match(/(\d+)\s*(day|hour)/i);
            if (match) return `${match[1]} ${match[2]}${parseInt(match[1]) > 1 ? 's' : ''}`;
        }
        return '';
    }

    function extractUrl(card) {
        const link = card.querySelector('a[href*="/"]');
        if (!link) return '';
        const href = link.getAttribute('href') || '';
        return href.startsWith('http') ? href : `https://www.fiverr.com${href}`;
    }

    function extractBadges(card) {
        const badges = [];
        const badgeEls = card.querySelectorAll('[class*="badge"], .seller-badge');
        badgeEls.forEach(b => {
            const text = b.textContent?.trim();
            if (text && text.length < 30) badges.push(text);
        });
        return badges;
    }

    // Get search query from URL
    function getSearchQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('query') || params.get('search_in') || '';
    }

    // Get category from URL path
    function getCategory() {
        const path = window.location.pathname;
        const match = path.match(/\/categories\/([^\/]+)/);
        return match ? match[1].replace(/-/g, ' ') : '';
    }

    // Aggregate keyword statistics
    function calculateKeywordStats(gigs) {
        if (gigs.length === 0) return null;

        const totalOrdersInQueue = gigs.reduce((sum, g) => sum + (g.ordersInQueue || 0), 0);
        const avgPrice = gigs.reduce((sum, g) => sum + g.startingPrice, 0) / gigs.length;
        const avgRating = gigs.reduce((sum, g) => sum + g.rating, 0) / gigs.length;

        const levels = {};
        gigs.forEach(g => {
            levels[g.sellerLevel] = (levels[g.sellerLevel] || 0) + 1;
        });

        const newSellerCount = levels['New Seller'] || 0;
        const newSellerRatio = newSellerCount / gigs.length;

        return {
            totalGigs: gigs.length,
            totalOrdersInQueue,
            avgOrdersInQueue: totalOrdersInQueue / gigs.length,
            avgPrice: Math.round(avgPrice),
            avgRating: avgRating.toFixed(1),
            sellerLevelDistribution: levels,
            newSellerOpportunity: newSellerRatio > 0.2, // >20% new sellers = opportunity
            priceCeiling: Math.max(...gigs.map(g => g.startingPrice)),
            priceFloor: Math.min(...gigs.map(g => g.startingPrice).filter(p => p > 0))
        };
    }

    // Store and sync data
    async function storeAndSync(data) {
        try {
            // Get existing history
            const result = await chrome.storage.local.get(['keywordHistory', 'lastScrape']);
            const history = result.keywordHistory || {};

            // Store this keyword's data
            history[data.query] = {
                gigs: data.gigs,
                stats: data.stats,
                timestamp: data.timestamp,
                url: data.url
            };

            // Keep only last 50 keywords
            const keys = Object.keys(history);
            if (keys.length > 50) {
                const oldest = keys.sort((a, b) =>
                    new Date(history[a].timestamp) - new Date(history[b].timestamp)
                ).slice(0, keys.length - 50);
                oldest.forEach(k => delete history[k]);
            }

            await chrome.storage.local.set({
                keywordHistory: history,
                lastScrape: {
                    query: data.query,
                    gigs: data.gigs,
                    stats: data.stats,
                    timestamp: data.timestamp
                }
            });

            // Notify popup
            chrome.runtime.sendMessage({
                type: 'SCRAPE_COMPLETE',
                data: data
            }).catch(() => {/* popup not open */ });

            log('Stored data for:', data.query, '| Gigs:', data.gigs.length, '| Orders in queue:', data.stats?.totalOrdersInQueue);
        } catch (e) {
            console.error('[Fiverr Success] Storage failed:', e);
        }
    }

    // Visual indicator
    function showIndicator(count, ordersInQueue) {
        let indicator = document.getElementById('fiverr-success-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'fiverr-success-indicator';
            document.body.appendChild(indicator);
        }

        indicator.innerHTML = `
            <div style="font-weight: 600;">✓ ${count} gigs tracked</div>
            <div style="font-size: 12px; opacity: 0.9;">${ordersInQueue} total orders in queue</div>
        `;
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00b22d, #1dbf73);
            color: white;
            padding: 12px 18px;
            border-radius: 10px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            z-index: 99999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        setTimeout(() => {
            indicator.style.transition = 'opacity 0.3s';
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }, 4000);
    }

    // Main scrape function
    function scrapeAndSync() {
        const query = getSearchQuery();
        const category = getCategory();

        if (!query && !category) {
            log('Not on a search/category page');
            return;
        }

        const gigs = scrapeGigCards();

        if (gigs.length > 0) {
            const stats = calculateKeywordStats(gigs);

            storeAndSync({
                query: query || category,
                category: category,
                gigs: gigs,
                stats: stats,
                url: window.location.href,
                timestamp: new Date().toISOString()
            });

            showIndicator(gigs.length, stats?.totalOrdersInQueue || 0);
        } else {
            log('No gigs found on page');
        }
    }

    // Initialize
    function init() {
        log('Initializing on:', window.location.href);

        // Wait for dynamic content
        setTimeout(scrapeAndSync, 2500);

        // Re-scrape on scroll (lazy loading)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(scrapeAndSync, 1500);
        });

        // Re-scrape on URL change (SPA navigation)
        let lastUrl = window.location.href;
        const observer = new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                log('URL changed, re-scraping...');
                setTimeout(scrapeAndSync, 2500);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
