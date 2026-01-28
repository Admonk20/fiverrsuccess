import { useState } from 'react';
import { Globe, Loader2, Copy, Check, Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import type { GeneratedGig } from '../types';

interface MultiLanguageExpanderProps {
    gig: GeneratedGig;
}

interface Language {
    code: string;
    name: string;
    flag: string;
    fiverr: boolean; // Available on Fiverr
}

const LANGUAGES: Language[] = [
    { code: 'es', name: 'Spanish', flag: '🇪🇸', fiverr: true },
    { code: 'de', name: 'German', flag: '🇩🇪', fiverr: true },
    { code: 'fr', name: 'French', flag: '🇫🇷', fiverr: true },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷', fiverr: true },
    { code: 'it', name: 'Italian', flag: '🇮🇹', fiverr: true },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', fiverr: true },
];

interface TranslatedGig {
    language: Language;
    title: string;
    description: string;
    tags: string[];
    faqs: { question: string; answer: string }[];
}

export function MultiLanguageExpander({ gig }: MultiLanguageExpanderProps) {
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['es', 'de']);
    const [translations, setTranslations] = useState<TranslatedGig[]>([]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedLang, setExpandedLang] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const toggleLanguage = (code: string) => {
        setSelectedLanguages(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const translateGig = async () => {
        if (selectedLanguages.length === 0) {
            setError('Select at least one language');
            return;
        }

        setIsTranslating(true);
        setError(null);
        setTranslations([]);

        try {
            const results = await openaiService.translateGig(gig, selectedLanguages);
            setTranslations(results);
            if (results.length > 0) {
                setExpandedLang(results[0].language.code);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Translation failed');
        } finally {
            setIsTranslating(false);
        }
    };

    const copyToClipboard = async (text: string, fieldId: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const copyAllForLanguage = async (translation: TranslatedGig) => {
        const fullText = `
TITLE:
${translation.title}

DESCRIPTION:
${translation.description}

TAGS:
${translation.tags.join(', ')}

FAQs:
${translation.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}
        `.trim();

        await copyToClipboard(fullText, `all-${translation.language.code}`);
    };

    return (
        <div className="multi-language-expander">
            <div className="expander-header">
                <Globe size={24} />
                <div>
                    <h3>Multi-Language Expander</h3>
                    <p>Translate your gig to reach international buyers</p>
                </div>
            </div>

            <div className="language-selector">
                <label>Select Target Languages</label>
                <div className="language-grid">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => toggleLanguage(lang.code)}
                            className={`language-btn ${selectedLanguages.includes(lang.code) ? 'active' : ''}`}
                        >
                            <span className="lang-flag">{lang.flag}</span>
                            <span className="lang-name">{lang.name}</span>
                            {selectedLanguages.includes(lang.code) && (
                                <Check size={14} className="lang-check" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={translateGig}
                disabled={isTranslating || selectedLanguages.length === 0}
                className="btn btn-primary w-full"
            >
                {isTranslating ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Translating to {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''}...
                    </>
                ) : (
                    <>
                        <Languages size={18} />
                        Translate Gig ({selectedLanguages.length} selected)
                    </>
                )}
            </button>

            {error && (
                <div className="expander-error">{error}</div>
            )}

            {translations.length > 0 && (
                <div className="translations-list">
                    {translations.map(translation => (
                        <div key={translation.language.code} className="translation-card">
                            <button
                                className="translation-header"
                                onClick={() => setExpandedLang(
                                    expandedLang === translation.language.code ? null : translation.language.code
                                )}
                            >
                                <div className="translation-title">
                                    <span className="lang-flag">{translation.language.flag}</span>
                                    <span>{translation.language.name}</span>
                                </div>
                                {expandedLang === translation.language.code ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                            </button>

                            {expandedLang === translation.language.code && (
                                <div className="translation-content">
                                    <div className="translation-section">
                                        <div className="section-header">
                                            <label>Title</label>
                                            <button
                                                onClick={() => copyToClipboard(translation.title, `title-${translation.language.code}`)}
                                                className="copy-btn"
                                            >
                                                {copiedField === `title-${translation.language.code}` ? (
                                                    <Check size={14} />
                                                ) : (
                                                    <Copy size={14} />
                                                )}
                                            </button>
                                        </div>
                                        <p className="translated-text">{translation.title}</p>
                                    </div>

                                    <div className="translation-section">
                                        <div className="section-header">
                                            <label>Description</label>
                                            <button
                                                onClick={() => copyToClipboard(translation.description, `desc-${translation.language.code}`)}
                                                className="copy-btn"
                                            >
                                                {copiedField === `desc-${translation.language.code}` ? (
                                                    <Check size={14} />
                                                ) : (
                                                    <Copy size={14} />
                                                )}
                                            </button>
                                        </div>
                                        <p className="translated-text description">{translation.description}</p>
                                    </div>

                                    <div className="translation-section">
                                        <div className="section-header">
                                            <label>Search Tags</label>
                                            <button
                                                onClick={() => copyToClipboard(translation.tags.join(', '), `tags-${translation.language.code}`)}
                                                className="copy-btn"
                                            >
                                                {copiedField === `tags-${translation.language.code}` ? (
                                                    <Check size={14} />
                                                ) : (
                                                    <Copy size={14} />
                                                )}
                                            </button>
                                        </div>
                                        <div className="tag-list">
                                            {translation.tags.map((tag, i) => (
                                                <span key={i} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="translation-section">
                                        <label>FAQs</label>
                                        <div className="faq-list">
                                            {translation.faqs.slice(0, 3).map((faq, i) => (
                                                <div key={i} className="faq-item">
                                                    <strong>Q: {faq.question}</strong>
                                                    <p>A: {faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => copyAllForLanguage(translation)}
                                        className="btn btn-secondary w-full mt-4"
                                    >
                                        {copiedField === `all-${translation.language.code}` ? (
                                            <>
                                                <Check size={16} />
                                                Copied All!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                Copy All {translation.language.name} Content
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
