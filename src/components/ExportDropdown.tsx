import { useState } from 'react';
import { Download, Copy, Check, FileText, ChevronDown } from 'lucide-react';
import type { GeneratedGig } from '../types';

interface ExportDropdownProps {
    gig: GeneratedGig;
}

export function ExportDropdown({ gig }: ExportDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatGigAsText = () => {
        const lines = [
            '=== GIG TITLE ===',
            gig.title,
            '',
            '=== SEARCH TAGS ===',
            gig.searchTags?.join(', ') || '',
            '',
            '=== DESCRIPTION ===',
            gig.description,
            '',
            '=== PRICING ===',
            `Basic: $${gig.pricing.basic.price} - ${gig.pricing.basic.description}`,
            `Standard: $${gig.pricing.standard.price} - ${gig.pricing.standard.description}`,
            `Premium: $${gig.pricing.premium.price} - ${gig.pricing.premium.description}`,
            '',
            '=== FAQs ===',
            ...gig.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`),
            '',
            '=== REQUIREMENTS ===',
            ...gig.requirements.map(r => `- ${r.question}`),
        ];
        return lines.join('\n');
    };

    const copyAll = async () => {
        const text = formatGigAsText();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setIsOpen(false);
    };

    const downloadTxt = () => {
        const text = formatGigAsText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gig-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    return (
        <div className="export-dropdown">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-secondary export-trigger"
            >
                <Download size={16} />
                Export
                <ChevronDown size={14} />
            </button>

            {isOpen && (
                <>
                    <div className="export-backdrop" onClick={() => setIsOpen(false)} />
                    <div className="export-menu">
                        <button onClick={copyAll} className="export-option">
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied!' : 'Copy All to Clipboard'}
                        </button>
                        <button onClick={downloadTxt} className="export-option">
                            <FileText size={16} />
                            Download as .txt
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
