import { TrendingUp, Target, ShoppingCart, Users, Zap, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { KeywordConfidence } from '../types';

interface KeywordConfidenceCardProps {
    confidence: KeywordConfidence;
    onTrack?: () => void;
}

export function KeywordConfidenceCard({ confidence, onTrack }: KeywordConfidenceCardProps) {
    const getRecommendationStyle = () => {
        switch (confidence.recommendation) {
            case 'highly_recommended': return { bg: 'bg-green', icon: <CheckCircle size={20} />, text: '🔥 Highly Recommended' };
            case 'recommended': return { bg: 'bg-blue', icon: <CheckCircle size={18} />, text: '✓ Recommended' };
            case 'consider': return { bg: 'bg-yellow', icon: <AlertTriangle size={18} />, text: '⚠ Consider Carefully' };
            case 'avoid': return { bg: 'bg-red', icon: <XCircle size={18} />, text: '✗ Not Recommended' };
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'score-high';
        if (score >= 50) return 'score-medium';
        if (score >= 30) return 'score-low';
        return 'score-very-low';
    };

    const style = getRecommendationStyle();

    return (
        <div className={`confidence-card ${style.bg}`}>
            <div className="confidence-header">
                <div className="confidence-keyword">
                    <h4>"{confidence.keyword}"</h4>
                    <span className={`recommendation-badge ${confidence.recommendation}`}>
                        {style.text}
                    </span>
                </div>
                <div className={`confidence-score-circle ${getScoreColor(confidence.overallScore)}`}>
                    <span className="score-value">{confidence.overallScore}</span>
                    <span className="score-label">Score</span>
                </div>
            </div>

            <div className="confidence-factors">
                <div className="factor">
                    <div className="factor-label">
                        <ShoppingCart size={14} />
                        <span>Demand</span>
                    </div>
                    <div className="factor-bar">
                        <div
                            className={`factor-fill ${getScoreColor(confidence.factors.demandScore)}`}
                            style={{ width: `${confidence.factors.demandScore}%` }}
                        />
                    </div>
                    <span className="factor-value">{confidence.factors.demandScore}</span>
                </div>

                <div className="factor">
                    <div className="factor-label">
                        <Users size={14} />
                        <span>Competition</span>
                    </div>
                    <div className="factor-bar">
                        <div
                            className={`factor-fill ${getScoreColor(confidence.factors.competitionScore)}`}
                            style={{ width: `${confidence.factors.competitionScore}%` }}
                        />
                    </div>
                    <span className="factor-value">{confidence.factors.competitionScore}</span>
                </div>

                <div className="factor">
                    <div className="factor-label">
                        <Target size={14} />
                        <span>New Seller</span>
                    </div>
                    <div className="factor-bar">
                        <div
                            className={`factor-fill ${getScoreColor(confidence.factors.newSellerSuccess)}`}
                            style={{ width: `${confidence.factors.newSellerSuccess}%` }}
                        />
                    </div>
                    <span className="factor-value">{confidence.factors.newSellerSuccess}</span>
                </div>

                <div className="factor">
                    <div className="factor-label">
                        <Zap size={14} />
                        <span>Trend</span>
                    </div>
                    <div className="factor-bar">
                        <div
                            className={`factor-fill ${getScoreColor(confidence.factors.trendMomentum)}`}
                            style={{ width: `${confidence.factors.trendMomentum}%` }}
                        />
                    </div>
                    <span className="factor-value">{confidence.factors.trendMomentum}</span>
                </div>
            </div>

            <div className="confidence-reasoning">
                <p>{confidence.reasoning}</p>
            </div>

            <div className="confidence-estimates">
                <div className="estimate">
                    <TrendingUp size={16} />
                    <div>
                        <span className="estimate-value">{confidence.estimatedOrdersPerMonth}</span>
                        <span className="estimate-label">Est. orders/month</span>
                    </div>
                </div>
                <div className="estimate">
                    <Clock size={16} />
                    <div>
                        <span className="estimate-value">{confidence.estimatedTimeToFirstOrder}</span>
                        <span className="estimate-label">Time to first order</span>
                    </div>
                </div>
            </div>

            {onTrack && (
                <button onClick={onTrack} className="btn btn-sm btn-secondary w-full mt-4">
                    <Target size={14} />
                    Track This Keyword
                </button>
            )}
        </div>
    );
}

interface TopPicksSectionProps {
    topPicks: KeywordConfidence[];
    onTrack?: (keyword: string) => void;
}

export function TopPicksSection({ topPicks, onTrack }: TopPicksSectionProps) {
    if (topPicks.length === 0) return null;

    return (
        <div className="top-picks-section">
            <div className="section-header">
                <TrendingUp size={20} />
                <div>
                    <h3>🎯 Top Keyword Picks</h3>
                    <p>Highest confidence keywords for getting orders</p>
                </div>
            </div>

            <div className="picks-grid">
                {topPicks.map(pick => (
                    <KeywordConfidenceCard
                        key={pick.keyword}
                        confidence={pick}
                        onTrack={onTrack ? () => onTrack(pick.keyword) : undefined}
                    />
                ))}
            </div>
        </div>
    );
}
