import { useEffect, useState, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface ResearchTerminalProps {
    query: string;
    isVisible: boolean;
}

export function ResearchTerminal({ query, isVisible }: ResearchTerminalProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const [, setCurrentLogIndex] = useState(0); // Index only used for setter logic
    const scrollRef = useRef<HTMLDivElement>(null);

    const researchSteps = [
        `> Initializing specialized agent for "${query}"...`,
        `> Authenticating with OpenAI GPT-4o...`,
        `> access_token: verified_active`,
        `> Scanning Fiverr categories for high-demand gaps...`,
        `> Parsing top 100 competitor gigs...`,
        `> Analyzing Reddit threads in r/freelance & r/slavelabour...`,
        `> Identifying high-intent buyer keywords...`,
        `> Calculating difficulty scores (0-100)...`,
        `> Cross-referencing with Google Search volume...`,
        `> Finalizing keyword matrix...`,
        `> Generating optimization strategy...`,
        `> Done.`
    ];

    useEffect(() => {
        if (!isVisible) {
            setLogs([]);
            setCurrentLogIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentLogIndex((prev) => {
                if (prev >= researchSteps.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                const next = prev + 1;
                setLogs((currentLogs) => [...currentLogs, researchSteps[next]]);
                return next;
            });
        }, 800); // Add a new log every 800ms

        // Initial log
        setLogs([researchSteps[0]]);

        return () => clearInterval(interval);
    }, [isVisible, query]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    if (!isVisible) return null;

    return (
        <div className="research-terminal container animate-slideDown">
            <div className="terminal-window glass-card">
                <div className="terminal-header">
                    <div className="terminal-controls">
                        <div className="control-dot red"></div>
                        <div className="control-dot yellow"></div>
                        <div className="control-dot green"></div>
                    </div>
                    <div className="terminal-title">
                        <Terminal size={12} />
                        <span>research_agent.exe</span>
                    </div>
                </div>
                <div className="terminal-body" ref={scrollRef}>
                    {logs.map((log, index) => (
                        <div key={index} className="terminal-line typing-effect">
                            <span className="prompt">$</span> {log}
                        </div>
                    ))}
                    <div className="terminal-cursor">_</div>
                </div>
            </div>
        </div>
    );
}
