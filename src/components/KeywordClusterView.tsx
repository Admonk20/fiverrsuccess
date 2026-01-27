import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Target, ShoppingCart, Search as SearchIcon } from 'lucide-react';
import type { KeywordCluster } from '../types';

interface KeywordClusterViewProps {
    clusters: KeywordCluster[];
}

export function KeywordClusterView({ clusters }: KeywordClusterViewProps) {
    const [expandedStage, setExpandedStage] = useState<string | null>('decision');

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case 'awareness': return <SearchIcon size={18} />;
            case 'consideration': return <Target size={18} />;
            case 'decision': return <ShoppingCart size={18} />;
            default: return <Layers size={18} />;
        }
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'awareness': return 'stage-awareness';
            case 'consideration': return 'stage-consideration';
            case 'decision': return 'stage-decision';
            default: return '';
        }
    };

    if (!clusters || clusters.length === 0) {
        return (
            <div className="cluster-empty">
                <Layers size={24} />
                <p>No keyword clusters available. Run a keyword search first.</p>
            </div>
        );
    }

    return (
        <div className="keyword-clusters">
            <div className="clusters-header">
                <h3><Layers size={20} /> Keyword Clusters by Buyer Intent</h3>
                <p>Keywords grouped by purchase funnel stage</p>
            </div>

            <div className="clusters-list">
                {clusters.map((cluster) => (
                    <div key={cluster.stage} className={`cluster-card ${getStageColor(cluster.stage)}`}>
                        <button
                            className="cluster-header"
                            onClick={() => setExpandedStage(
                                expandedStage === cluster.stage ? null : cluster.stage
                            )}
                        >
                            <div className="cluster-title">
                                {getStageIcon(cluster.stage)}
                                <span>{cluster.stageLabel}</span>
                                <span className="cluster-count">{cluster.keywords.length} keywords</span>
                            </div>
                            {expandedStage === cluster.stage ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {expandedStage === cluster.stage && (
                            <div className="cluster-content">
                                <p className="cluster-description">{cluster.description}</p>

                                <div className="cluster-keywords">
                                    {cluster.keywords.map((kw, i) => (
                                        <div key={i} className="cluster-keyword">
                                            <span className="kw-text">{kw.keyword}</span>
                                            <span className="kw-relevance">{kw.relevance}%</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="cluster-tips">
                                    <h6>🎯 Targeting Tips</h6>
                                    <ul>
                                        {cluster.targetingTips.map((tip, i) => (
                                            <li key={i}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
