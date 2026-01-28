import { useState } from 'react';
import { Image, Loader2, Download, RefreshCw, Sparkles, Layout, Grid3X3, Layers } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import type { GeneratedGig } from '../types';

interface GigImageSuiteProps {
    gig: GeneratedGig;
}

interface GigImage {
    id: string;
    label: string;
    description: string;
    prompt: string;
    url: string | null;
    isGenerating: boolean;
}

export function GigImageSuite({ gig }: GigImageSuiteProps) {
    const [images, setImages] = useState<GigImage[]>([
        {
            id: 'main',
            label: 'Main Cover',
            description: 'Primary gig image (1280x769)',
            prompt: `Professional Fiverr gig cover for "${gig.title}". Clean, modern design with bold typography. High contrast, vibrant colors, professional look. Show the service outcome visually. No text or minimal text overlay.`,
            url: null,
            isGenerating: false
        },
        {
            id: 'portfolio',
            label: 'Portfolio Sample',
            description: 'Showcase your work quality',
            prompt: `Portfolio showcase image for "${gig.metadata?.category || 'professional service'}". Display a realistic sample of work output. High quality, detailed, professional presentation. Clean background, product-focused.`,
            url: null,
            isGenerating: false
        },
        {
            id: 'process',
            label: 'Process Visual',
            description: 'Show your workflow',
            prompt: `Infographic-style image showing the workflow/process for "${gig.title}". Step-by-step visual guide. Clean icons, numbered steps, professional layout. Modern flat design with brand colors.`,
            url: null,
            isGenerating: false
        }
    ]);

    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    const generateImage = async (imageId: string) => {
        const imageIndex = images.findIndex(img => img.id === imageId);
        if (imageIndex === -1) return;

        // Set generating state
        setImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, isGenerating: true } : img
        ));

        try {
            const url = await openaiService.generateImage(images[imageIndex].prompt);
            setImages(prev => prev.map(img => 
                img.id === imageId ? { ...img, url, isGenerating: false } : img
            ));
        } catch (error) {
            console.error('Image generation failed:', error);
            setImages(prev => prev.map(img => 
                img.id === imageId ? { ...img, isGenerating: false } : img
            ));
        }
    };

    const generateAllImages = async () => {
        setIsGeneratingAll(true);
        
        for (const image of images) {
            if (!image.url) {
                await generateImage(image.id);
            }
        }
        
        setIsGeneratingAll(false);
    };

    const regenerateImage = async (imageId: string) => {
        await generateImage(imageId);
    };

    const downloadImage = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            // Fallback: open in new tab
            window.open(url, '_blank');
        }
    };

    const getImageIcon = (id: string) => {
        switch (id) {
            case 'main': return <Layout size={16} />;
            case 'portfolio': return <Grid3X3 size={16} />;
            case 'process': return <Layers size={16} />;
            default: return <Image size={16} />;
        }
    };

    const generatedCount = images.filter(img => img.url).length;

    return (
        <div className="gig-image-suite">
            <div className="suite-header">
                <div className="suite-title">
                    <Image size={24} />
                    <div>
                        <h3>Gig Image Suite</h3>
                        <p>Generate all 3 required Fiverr images</p>
                    </div>
                </div>
                <div className="suite-progress">
                    <span className="progress-text">{generatedCount}/3 images</span>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${(generatedCount / 3) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={generateAllImages}
                disabled={isGeneratingAll || generatedCount === 3}
                className="btn btn-primary generate-all-btn"
            >
                {isGeneratingAll ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Generating All Images...
                    </>
                ) : generatedCount === 3 ? (
                    <>
                        <Sparkles size={18} />
                        All Images Generated!
                    </>
                ) : (
                    <>
                        <Sparkles size={18} />
                        Generate All 3 Images
                    </>
                )}
            </button>

            <div className="image-grid">
                {images.map((image) => (
                    <div key={image.id} className="image-card">
                        <div className="image-card-header">
                            {getImageIcon(image.id)}
                            <div>
                                <h4>{image.label}</h4>
                                <span>{image.description}</span>
                            </div>
                        </div>

                        <div className="image-preview">
                            {image.isGenerating ? (
                                <div className="image-loading">
                                    <Loader2 className="animate-spin" size={32} />
                                    <span>Generating with DALL-E 3...</span>
                                </div>
                            ) : image.url ? (
                                <img src={image.url} alt={image.label} />
                            ) : (
                                <div className="image-placeholder">
                                    <Image size={48} />
                                    <span>Click to generate</span>
                                </div>
                            )}
                        </div>

                        <div className="image-actions">
                            {image.url ? (
                                <>
                                    <button
                                        onClick={() => regenerateImage(image.id)}
                                        disabled={image.isGenerating}
                                        className="btn btn-sm btn-secondary"
                                    >
                                        <RefreshCw size={14} />
                                        Regenerate
                                    </button>
                                    <button
                                        onClick={() => downloadImage(image.url!, `gig-${image.id}-${Date.now()}.png`)}
                                        className="btn btn-sm btn-primary"
                                    >
                                        <Download size={14} />
                                        Download
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => generateImage(image.id)}
                                    disabled={image.isGenerating || isGeneratingAll}
                                    className="btn btn-sm btn-primary w-full"
                                >
                                    <Sparkles size={14} />
                                    Generate
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="suite-tips">
                <h5>💡 Pro Tips</h5>
                <ul>
                    <li>First image is your main cover - make it eye-catching</li>
                    <li>Portfolio image shows buyers what they'll get</li>
                    <li>Process image builds trust by showing your workflow</li>
                    <li>Download and resize to 1280x769px for Fiverr</li>
                </ul>
            </div>
        </div>
    );
}
