import { useState } from 'react';
import { Search, Loader2, AlertCircle, ExternalLink, Star, TrendingUp, Target, Lightbulb, DollarSign } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import type { CompetitorAnalysis } from '../types';

export function CompetitorAnalyzer() {
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);

    const handleAnalyze = async () => {
        if (!url.trim()) {
            setError('Please enter a Fiverr gig URL');
            return;
        }

        if (!url.includes('fiverr.com')) {
            setError('Please enter a valid Fiverr gig URL');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const result = await openaiService.analyzeCompetitor(url);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="competitor-analyzer">
            <div className="analyzer-header">
                <h3><Target size={20} /> Competitor Analysis</h3>
                <p>Paste a competitor's Fiverr gig URL to get actionable insights</p>
            </div>

            <div className="analyzer-input-group">
                <input
                    type="url"
                    placeholder="https://www.fiverr.com/seller/gig-name..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="analyzer-input"
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="btn btn-primary"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Search size={16} />
                            Analyze
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="analyzer-error">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {analysis && (
                <div className="analysis-results">
                    <div className="analysis-header">
                        <h4>{analysis.title}</h4>
                        <a href={analysis.url} target="_blank" rel="noreferrer" className="external-link">
                            <ExternalLink size={14} /> View Gig
                        </a>
                    </div>

                    <div className="analysis-grid">
                        <div className="analysis-card">
                            <div className="card-label">
                                <Star size={14} /> Seller Level
                            </div>
                            <div className="card-value">{analysis.sellerLevel}</div>
                        </div>
                        <div className="analysis-card">
                            <div className="card-label">
                                <Star size={14} /> Rating
                            </div>
                            <div className="card-value">{analysis.rating} ({analysis.reviewCount} reviews)</div>
                        </div>
                        <div className="analysis-card">
                            <div className="card-label">
                                <DollarSign size={14} /> Starting Price
                            </div>
                            <div className="card-value">${analysis.startingPrice}</div>
                        </div>
                        <div className="analysis-card">
                            <div className="card-label">
                                <TrendingUp size={14} /> Est. Monthly Orders
                            </div>
                            <div className="card-value">{analysis.estimatedMonthlyOrders}</div>
                        </div>
                    </div>

                    <div className="analysis-section">
                        <h5>🔑 Keywords Used</h5>
                        <div className="tag-list">
                            {analysis.keywordsUsed.map((kw, i) => (
                                <span key={i} className="tag">{kw}</span>
                            ))}
                        </div>
                    </div>

                    <div className="analysis-section">
                        <h5>💪 Strengths</h5>
                        <ul>
                            {analysis.descriptionStrengths.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="analysis-section">
                        <h5>⚠️ Weaknesses</h5>
                        <ul>
                            {analysis.descriptionWeaknesses.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="analysis-section highlight">
                        <h5><Lightbulb size={16} /> How to Beat This Competitor</h5>
                        <ul>
                            {analysis.improvementSuggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
