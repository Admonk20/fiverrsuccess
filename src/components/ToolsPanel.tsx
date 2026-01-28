import { useState } from 'react';
import {
    Wrench, Target, Layers, Type, Award, Bell, Image, Globe,
    Frame, ChevronRight, User as UserIcon, TrendingUp
} from 'lucide-react';

// Import all tool components
import { CompetitorAnalyzer } from './CompetitorAnalyzer';
import { KeywordClusterView } from './KeywordClusterView';
import { TitleGenerator } from './TitleGenerator';
import { GigScoreChecker } from './GigScoreChecker';
import { AlertsPanel } from './AlertsPanel';
import { SpecialtyProfile } from './SpecialtyProfile';
import { TopPicksSection } from './KeywordConfidenceCard';
import { GigImageSuite } from './GigImageSuite';
import { PortfolioMockupGenerator } from './PortfolioMockupGenerator';
import { MultiLanguageExpander } from './MultiLanguageExpander';
import { keywordIntelligence } from '../services/keywordIntelligence';
import type { GeneratedGig, KeywordData, KeywordAlert, KeywordConfidence, UserSpecialty, KeywordCluster } from '../types';

interface ToolsPanelProps {
    userId?: string;
    keywords: KeywordData[];
    generatedGig: GeneratedGig | null;
    onSearch?: (keyword: string) => void;
}

type ToolTab =
    | 'profile'
    | 'alerts'
    | 'confidence'
    | 'competitor'
    | 'clusters'
    | 'titles'
    | 'score'
    | 'images'
    | 'mockups'
    | 'translate';

interface Tool {
    id: ToolTab;
    label: string;
    icon: React.ReactNode;
    category: 'intelligence' | 'analysis' | 'content' | 'visual';
    requiresGig?: boolean;
    requiresKeywords?: boolean;
}

const TOOLS: Tool[] = [
    { id: 'profile', label: 'My Specialty', icon: <UserIcon size={16} />, category: 'intelligence' },
    { id: 'alerts', label: 'Keyword Alerts', icon: <Bell size={16} />, category: 'intelligence' },
    { id: 'confidence', label: 'Order Confidence', icon: <TrendingUp size={16} />, category: 'intelligence', requiresKeywords: true },
    { id: 'competitor', label: 'Competitor Analysis', icon: <Target size={16} />, category: 'analysis' },
    { id: 'clusters', label: 'Keyword Clusters', icon: <Layers size={16} />, category: 'analysis', requiresKeywords: true },
    { id: 'titles', label: 'A/B Titles', icon: <Type size={16} />, category: 'content', requiresGig: true },
    { id: 'score', label: 'Gig Score', icon: <Award size={16} />, category: 'content', requiresGig: true },
    { id: 'images', label: 'Gig Images', icon: <Image size={16} />, category: 'visual', requiresGig: true },
    { id: 'mockups', label: 'Portfolio Mockups', icon: <Frame size={16} />, category: 'visual', requiresGig: true },
    { id: 'translate', label: 'Multi-Language', icon: <Globe size={16} />, category: 'visual', requiresGig: true },
];

const CATEGORY_LABELS: Record<Tool['category'], string> = {
    intelligence: '🎯 Keyword Intelligence',
    analysis: '📊 Analysis Tools',
    content: '✍️ Content Tools',
    visual: '🎨 Visual Tools'
};

export function ToolsPanel({ userId, keywords, generatedGig, onSearch }: ToolsPanelProps) {
    const [activeTab, setActiveTab] = useState<ToolTab>('profile');
    const [alerts, setAlerts] = useState<KeywordAlert[]>([]);
    const [confidenceScores, setConfidenceScores] = useState<KeywordConfidence[]>([]);
    const [specialty, setSpecialty] = useState<UserSpecialty | null>(null);
    const [clusters] = useState<KeywordCluster[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);

    // Calculate confidence scores when keywords change
    const calculateConfidences = () => {
        if (keywords.length === 0) return;

        const scores = keywords.map(kw => keywordIntelligence.calculateConfidence(kw, specialty || undefined));
        setConfidenceScores(scores);
    };

    const handleSpecialtyComplete = (spec: UserSpecialty) => {
        setSpecialty(spec);
        keywordIntelligence.setSpecialty(spec);
        // Generate initial alerts
        keywordIntelligence.generateAlerts(spec).then(setAlerts);
    };

    const handleDismissAlert = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    };

    const handleAlertAction = (alert: KeywordAlert) => {
        if (alert.keyword && onSearch) {
            onSearch(alert.keyword);
        }
    };

    const handleTrackKeyword = (keyword: string) => {
        const kw = keywords.find(k => k.keyword === keyword);
        const conf = confidenceScores.find(c => c.keyword === keyword);
        if (kw && conf) {
            keywordIntelligence.trackKeyword(kw, conf);
        }
    };

    // Get tools grouped by category
    const toolsByCategory = TOOLS.reduce((acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
    }, {} as Record<Tool['category'], Tool[]>);

    const currentTool = TOOLS.find(t => t.id === activeTab);
    const isToolDisabled = (tool: Tool) => {
        if (tool.requiresGig && !generatedGig) return true;
        if (tool.requiresKeywords && keywords.length === 0) return true;
        return false;
    };

    return (
        <div className="tools-panel">
            <div className="tools-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="tools-title">
                    <Wrench size={20} />
                    <h3>AI Tools</h3>
                    <span className="tools-count">{TOOLS.length} tools</span>
                </div>
                <ChevronRight size={18} className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
            </div>

            {isExpanded && (
                <div className="tools-content">
                    <div className="tools-sidebar">
                        {Object.entries(toolsByCategory).map(([category, tools]) => (
                            <div key={category} className="tool-category">
                                <div className="category-label">
                                    {CATEGORY_LABELS[category as Tool['category']]}
                                </div>
                                {tools.map(tool => (
                                    <button
                                        key={tool.id}
                                        onClick={() => {
                                            setActiveTab(tool.id);
                                            if (tool.id === 'confidence') calculateConfidences();
                                        }}
                                        disabled={isToolDisabled(tool)}
                                        className={`tool-btn ${activeTab === tool.id ? 'active' : ''} ${isToolDisabled(tool) ? 'disabled' : ''}`}
                                    >
                                        {tool.icon}
                                        <span>{tool.label}</span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="tools-main">
                        <div className="tool-header">
                            {currentTool?.icon}
                            <h4>{currentTool?.label}</h4>
                        </div>

                        <div className="tool-content">
                            {activeTab === 'profile' && userId && (
                                <SpecialtyProfile
                                    userId={userId}
                                    onComplete={handleSpecialtyComplete}
                                />
                            )}

                            {activeTab === 'alerts' && (
                                <AlertsPanel
                                    alerts={alerts}
                                    onDismiss={handleDismissAlert}
                                    onAction={handleAlertAction}
                                />
                            )}

                            {activeTab === 'confidence' && (
                                <TopPicksSection
                                    topPicks={confidenceScores
                                        .filter(c => c.recommendation === 'highly_recommended' || c.recommendation === 'recommended')
                                        .slice(0, 5)}
                                    onTrack={handleTrackKeyword}
                                />
                            )}

                            {activeTab === 'competitor' && (
                                <CompetitorAnalyzer />
                            )}

                            {activeTab === 'clusters' && keywords.length > 0 && (
                                <KeywordClusterView clusters={clusters} />
                            )}

                            {activeTab === 'titles' && generatedGig && (
                                <TitleGenerator gig={generatedGig} />
                            )}

                            {activeTab === 'score' && generatedGig && (
                                <GigScoreChecker />
                            )}

                            {activeTab === 'images' && generatedGig && (
                                <GigImageSuite gig={generatedGig} />
                            )}

                            {activeTab === 'mockups' && generatedGig && (
                                <PortfolioMockupGenerator gig={generatedGig} />
                            )}

                            {activeTab === 'translate' && generatedGig && (
                                <MultiLanguageExpander gig={generatedGig} />
                            )}

                            {/* Show message if tool is unavailable */}
                            {currentTool?.requiresGig && !generatedGig && (
                                <div className="tool-unavailable">
                                    <Award size={32} />
                                    <p>Generate a gig first to use this tool</p>
                                </div>
                            )}

                            {currentTool?.requiresKeywords && keywords.length === 0 && (
                                <div className="tool-unavailable">
                                    <Layers size={32} />
                                    <p>Search for keywords first to use this tool</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
