/**
 * Fiverr Success - Content Script
 * Scrapes search result data from Fiverr search pages
 */

(function () {
    'use strict';

    // Configuration
    const DASHBOARD_API = 'YOUR_DASHBOARD_URL/api/sync-rankings';

    // Scrape gig data from search results
    function scrapeGigCards() {
        const gigCards = document.querySelectorAll('[class*="gig-card"], .gig-wrapper, .basic-gig-card');
        const gigs = [];

        gigCards.forEach((card, position) => {
            try {
                const gig = {
                    position: position + 1,
                    title: card.querySelector('h3, .gig-title, [class*="title"]')?.textContent?.trim() || '',
                    seller: card.querySelector('[class*="seller"], .username')?.textContent?.trim() || '',
                    sellerLevel: extractSellerLevel(card),
                    rating: extractRating(card),
                    reviewCount: extractReviewCount(card),
                    startingPrice: extractPrice(card),
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

    function extractSellerLevel(card) {
        const levelEl = card.querySelector('[class*="level"], .seller-level');
        if (!levelEl) return 'Unknown';

        const text = levelEl.textContent?.toLowerCase() || '';
        if (text.includes('top rated')) return 'Top Rated';
        if (text.includes('level 2')) return 'Level 2';
        if (text.includes('level 1')) return 'Level 1';
        if (text.includes('new')) return 'New Seller';
        return 'Unknown';
    }

    function extractRating(card) {
        const ratingEl = card.querySelector('[class*="rating"], .rating-score');
        const match = ratingEl?.textContent?.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }

    function extractReviewCount(card) {
        const reviewEl = card.querySelector('[class*="review"], .ratings-count');
        const match = reviewEl?.textContent?.match(/\(?([\d,k]+)\)?/i);
        if (!match) return 0;

        let count = match[1].replace(',', '');
        if (count.toLowerCase().includes('k')) {
            return Math.round(parseFloat(count) * 1000);
        }
        return parseInt(count) || 0;
    }

    function extractPrice(card) {
        const priceEl = card.querySelector('[class*="price"], .gig-price');
        const match = priceEl?.textContent?.match(/[\d,]+/);
        return match ? parseInt(match[0].replace(',', '')) : 0;
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
            if (text) badges.push(text);
        });
        return badges;
    }

    // Extract search query from URL
    function getSearchQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('query') || params.get('search_in') || '';
    }

    // Send data to dashboard
    async function syncToDashboard(data) {
        try {
            // Store locally first
            chrome.storage.local.set({
                lastScrape: {
                    query: data.query,
                    gigs: data.gigs,
                    timestamp: data.timestamp
                }
            });

            // Notify popup
            chrome.runtime.sendMessage({
                type: 'SCRAPE_COMPLETE',
                data: data
            });

            console.log('[Fiverr Success] Scraped', data.gigs.length, 'gigs for:', data.query);
        } catch (e) {
            console.error('[Fiverr Success] Sync failed:', e);
        }
    }

    // Add visual indicator
    function showScrapeIndicator(count) {
        let indicator = document.getElementById('fiverr-success-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'fiverr-success-indicator';
            document.body.appendChild(indicator);
        }

        indicator.textContent = `✓ ${count} gigs tracked`;
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00b22d, #1dbf73);
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;

        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }, 3000);
    }

    // Main scrape function
    function scrapeAndSync() {
        const query = getSearchQuery();
        if (!query) return;

        const gigs = scrapeGigCards();

        if (gigs.length > 0) {
            syncToDashboard({
                query: query,
                gigs: gigs,
                url: window.location.href,
                timestamp: new Date().toISOString()
            });

            showScrapeIndicator(gigs.length);
        }
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(scrapeAndSync, 2000); // Wait for dynamic content
        });
    } else {
        setTimeout(scrapeAndSync, 2000);
    }

    // Re-scrape on scroll (lazy loading)
    let scrapeTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrapeTimeout);
        scrapeTimeout = setTimeout(scrapeAndSync, 1000);
    });
})();
