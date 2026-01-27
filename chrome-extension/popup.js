/**
 * Fiverr Success - Popup Script
 */

document.addEventListener('DOMContentLoaded', () => {
    const lastQueryEl = document.getElementById('lastQuery');
    const lastTimeEl = document.getElementById('lastTime');
    const gigCountEl = document.getElementById('gigCount');
    const queryCountEl = document.getElementById('queryCount');
    const openDashboardBtn = document.getElementById('openDashboard');
    const clearDataBtn = document.getElementById('clearData');

    // Load stored data
    function loadData() {
        chrome.storage.local.get(['lastScrape', 'totalGigs', 'queryHistory'], (result) => {
            if (result.lastScrape) {
                lastQueryEl.textContent = truncate(result.lastScrape.query, 25);
                lastTimeEl.textContent = formatTime(result.lastScrape.timestamp);
                gigCountEl.textContent = result.lastScrape.gigs?.length || 0;
            }

            queryCountEl.textContent = result.queryHistory?.length || 0;
        });
    }

    function truncate(str, len) {
        if (!str) return '-';
        return str.length > len ? str.substring(0, len) + '...' : str;
    }

    function formatTime(isoString) {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
        return date.toLocaleDateString();
    }

    // Open dashboard
    openDashboardBtn.addEventListener('click', () => {
        // Replace with your actual dashboard URL
        chrome.tabs.create({ url: 'https://your-fiverr-success-app.vercel.app' });
    });

    // Clear data
    clearDataBtn.addEventListener('click', () => {
        if (confirm('Clear all stored ranking data?')) {
            chrome.storage.local.clear(() => {
                loadData();
                alert('Data cleared!');
            });
        }
    });

    // Listen for scrape updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'SCRAPE_COMPLETE') {
            loadData();
        }
    });

    // Initial load
    loadData();
});
