import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Zap, Heart, Search, Clock, Users } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import type { GeneratedGig, TitleVariation } from '../types';

interface TitleGeneratorProps {
    gig: GeneratedGig;
}

export function TitleGenerator({ gig }: TitleGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [variations, setVariations] = useState<TitleVariation[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const result = await openaiService.generateTitleVariations(gig);
            setVariations(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate titles');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyTitle = (title: string, index: number) => {
        navigator.clipboard.writeText(title);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const getStrategyIcon = (strategy: string) => {
        switch (strategy) {
            case 'emotional': return <Heart size={16} />;
            case 'benefit': return <Zap size={16} />;
            case 'keyword': return <Search size={16} />;
            case 'urgency': return <Clock size={16} />;
            case 'social_proof': return <Users size={16} />;
            default: return <Sparkles size={16} />;
        }
    };

    const getCTRBadge = (ctr: string) => {
        switch (ctr) {
            case 'high': return <span className="ctr-badge ctr-high">High CTR</span>;
            case 'medium': return <span className="ctr-badge ctr-medium">Medium CTR</span>;
            case 'low': return <span className="ctr-badge ctr-low">Low CTR</span>;
            default: return null;
        }
    };

    return (
        <div className="title-generator">
            <div className="generator-header">
                <h3><Sparkles size={20} /> A/B Title Generator</h3>
                <p>Generate multiple title strategies to test</p>
            </div>

            <div className="current-title">
                <label>Current Title:</label>
                <span>{gig.title}</span>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn btn-primary w-full"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="animate-spin" size={16} />
                        Generating Variations...
                    </>
                ) : (
                    <>
                        <Sparkles size={16} />
                        Generate 5 Title Variations
                    </>
                )}
            </button>

            {error && <div className="generator-error">{error}</div>}

            {variations.length > 0 && (
                <div className="variations-list">
                    {variations.map((v, i) => (
                        <div key={i} className={`variation-card strategy-${v.strategy}`}>
                            <div className="variation-header">
                                <div className="strategy-label">
                                    {getStrategyIcon(v.strategy)}
                                    {v.strategyLabel}
                                </div>
                                {getCTRBadge(v.predictedCTR)}
                            </div>
                            <div className="variation-title">
                                {v.title}
                            </div>
                            <div className="variation-explanation">
                                {v.explanation}
                            </div>
                            <button
                                onClick={() => copyTitle(v.title, i)}
                                className="btn btn-sm btn-secondary"
                            >
                                {copiedIndex === i ? (
                                    <>
                                        <Check size={14} /> Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} /> Copy Title
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
