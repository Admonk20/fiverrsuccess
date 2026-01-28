import { useState } from 'react';
import { Monitor, Smartphone, FileImage, Loader2, Download, RefreshCw, Sparkles, Frame } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import type { GeneratedGig } from '../types';

interface PortfolioMockupProps {
    gig: GeneratedGig;
}

type MockupType = 'laptop' | 'phone' | 'billboard' | 'social' | 'print';

interface MockupOption {
    id: MockupType;
    label: string;
    description: string;
    icon: React.ReactNode;
    promptBase: string;
}

const MOCKUP_OPTIONS: MockupOption[] = [
    {
        id: 'laptop',
        label: 'Laptop Screen',
        description: 'Professional website/app showcase',
        icon: <Monitor size={20} />,
        promptBase: 'Realistic MacBook Pro laptop mockup displaying a professional'
    },
    {
        id: 'phone',
        label: 'Mobile App',
        description: 'Smartphone app display',
        icon: <Smartphone size={20} />,
        promptBase: 'Realistic iPhone mockup showing a modern mobile app interface for'
    },
    {
        id: 'billboard',
        label: 'Billboard',
        description: 'Large format advertising',
        icon: <Frame size={20} />,
        promptBase: 'Photorealistic outdoor billboard mockup in urban setting displaying'
    },
    {
        id: 'social',
        label: 'Social Media',
        description: 'Instagram/LinkedIn post',
        icon: <FileImage size={20} />,
        promptBase: 'Clean social media post mockup showing a professional Instagram or LinkedIn post for'
    },
    {
        id: 'print',
        label: 'Print Material',
        description: 'Business cards, flyers',
        icon: <FileImage size={20} />,
        promptBase: 'Elegant print mockup with business cards and brochures for'
    }
];

export function PortfolioMockupGenerator({ gig }: PortfolioMockupProps) {
    const [selectedType, setSelectedType] = useState<MockupType>('laptop');
    const [customContext, setCustomContext] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<{ type: MockupType; url: string }[]>([]);

    const generateMockup = async () => {
        setIsGenerating(true);
        setError(null);

        const option = MOCKUP_OPTIONS.find(o => o.id === selectedType);
        if (!option) return;

        const context = customContext || gig.metadata?.category || gig.title;
        const fullPrompt = `${option.promptBase} ${context}. High quality, photorealistic, professional photography style. Clean background, excellent lighting, high resolution 4K. The mockup should showcase work quality for a Fiverr seller offering: ${gig.title}`;

        try {
            const url = await openaiService.generateImage(fullPrompt);
            setGeneratedUrl(url);
            setHistory(prev => [{ type: selectedType, url }, ...prev].slice(0, 6));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `portfolio-mockup-${selectedType}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="portfolio-mockup-generator">
            <div className="mockup-header">
                <Frame size={24} />
                <div>
                    <h3>Portfolio Mockup Generator</h3>
                    <p>Create realistic portfolio samples to showcase your work</p>
                </div>
            </div>

            <div className="mockup-types">
                <label>Select Mockup Type</label>
                <div className="mockup-grid">
                    {MOCKUP_OPTIONS.map(option => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedType(option.id)}
                            className={`mockup-type-btn ${selectedType === option.id ? 'active' : ''}`}
                        >
                            {option.icon}
                            <span className="type-label">{option.label}</span>
                            <span className="type-desc">{option.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mockup-context">
                <label>Custom Context (Optional)</label>
                <input
                    type="text"
                    placeholder={`e.g., "e-commerce website", "fitness app", "restaurant menu"...`}
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    className="context-input"
                />
            </div>

            <button
                onClick={generateMockup}
                disabled={isGenerating}
                className="btn btn-primary w-full"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Creating Mockup...
                    </>
                ) : (
                    <>
                        <Sparkles size={18} />
                        Generate Mockup
                    </>
                )}
            </button>

            {error && (
                <div className="mockup-error">{error}</div>
            )}

            {generatedUrl && (
                <div className="mockup-result">
                    <div className="result-header">
                        <h4>Generated Mockup</h4>
                        <div className="result-actions">
                            <button
                                onClick={generateMockup}
                                disabled={isGenerating}
                                className="btn btn-sm btn-secondary"
                            >
                                <RefreshCw size={14} />
                                Regenerate
                            </button>
                            <button
                                onClick={() => downloadImage(generatedUrl)}
                                className="btn btn-sm btn-primary"
                            >
                                <Download size={14} />
                                Download
                            </button>
                        </div>
                    </div>
                    <img src={generatedUrl} alt="Portfolio Mockup" className="mockup-image" />
                </div>
            )}

            {history.length > 1 && (
                <div className="mockup-history">
                    <h5>Recent Mockups</h5>
                    <div className="history-grid">
                        {history.slice(1).map((item, i) => (
                            <div key={i} className="history-item" onClick={() => setGeneratedUrl(item.url)}>
                                <img src={item.url} alt={`Mockup ${i + 1}`} />
                                <span>{MOCKUP_OPTIONS.find(o => o.id === item.type)?.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
