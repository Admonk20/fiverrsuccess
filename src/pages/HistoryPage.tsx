import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    ArrowLeft,
    Trash2,
    Clock,
    Tag,
    ChevronDown,
    ChevronUp,
    DollarSign,
    FileText,
    Copy,
    Check,
    HelpCircle,
    MessageSquare,
    Image,
    FolderOpen,
    User,
    Settings,
    LogOut
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { isSupabaseConfigured } from '../lib/supabase';
import { SettingsModal } from '../components/SettingsModal';
import { AuthForm } from '../components/AuthForm';
import type { GigSession } from '../types/database';
import type { GeneratedGig } from '../types';
import '../App.css';

export function HistoryPage() {
    const {
        user,
        profile,
        isLoading,
        signOut,
        initializeAuth,
        savedSessions,
        fetchSessions,
        deleteSession
    } = useStore();

    const [expandedSession, setExpandedSession] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const supabaseConfigured = isSupabaseConfigured();

    useEffect(() => {
        if (supabaseConfigured) {
            initializeAuth();
        } else {
            useStore.setState({ isLoading: false });
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchSessions();
        }
    }, [user]);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            console.error('Failed to copy');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this session?')) {
            await deleteSession(sessionId);
            if (expandedSession === sessionId) {
                setExpandedSession(null);
            }
        }
    };

    const renderGigDetails = (session: GigSession) => {
        const gig = session.generated_gig as unknown as GeneratedGig | null;
        if (!gig) return <p className="no-gig">No gig generated for this session yet.</p>;

        const sessionPrefix = `${session.id}-`;

        return (
            <div className="session-gig-details">
                {/* Title */}
                <div className="detail-section">
                    <div className="detail-header">
                        <FileText size={16} />
                        <h4>Title</h4>
                        <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => copyToClipboard(gig.title, `${sessionPrefix}title`)}
                        >
                            {copiedField === `${sessionPrefix}title` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                    <p className="detail-value title-value">{gig.title}</p>
                </div>

                {/* Tags */}
                <div className="detail-section">
                    <div className="detail-header">
                        <Tag size={16} />
                        <h4>Search Tags</h4>
                    </div>
                    <div className="tags-inline">
                        {gig.searchTags.map((tag, idx) => (
                            <span key={idx} className="tag-pill">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Pricing */}
                <div className="detail-section">
                    <div className="detail-header">
                        <DollarSign size={16} />
                        <h4>Pricing</h4>
                    </div>
                    <div className="pricing-summary">
                        <div className="price-item">
                            <span>Basic</span>
                            <span>${gig.pricing.basic.price}</span>
                        </div>
                        <div className="price-item">
                            <span>Standard</span>
                            <span>${gig.pricing.standard.price}</span>
                        </div>
                        <div className="price-item">
                            <span>Premium</span>
                            <span>${gig.pricing.premium.price}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="detail-section">
                    <div className="detail-header">
                        <FileText size={16} />
                        <h4>Description</h4>
                        <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => copyToClipboard(gig.description, `${sessionPrefix}desc`)}
                        >
                            {copiedField === `${sessionPrefix}desc` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                    <p className="detail-value description-value">{gig.description}</p>
                </div>

                {/* FAQs */}
                <div className="detail-section">
                    <div className="detail-header">
                        <HelpCircle size={16} />
                        <h4>FAQs ({gig.faqs.length})</h4>
                    </div>
                    <div className="faqs-compact">
                        {gig.faqs.map((faq, idx) => (
                            <div key={idx} className="faq-compact">
                                <strong>Q: {faq.question}</strong>
                                <p>A: {faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Requirements */}
                <div className="detail-section">
                    <div className="detail-header">
                        <MessageSquare size={16} />
                        <h4>Requirements ({gig.requirements.length})</h4>
                    </div>
                    <ul className="requirements-compact">
                        {gig.requirements.map((req, idx) => (
                            <li key={idx}>
                                <span className="req-type-badge">{req.type}</span>
                                {req.question}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Image Prompt */}
                <div className="detail-section">
                    <div className="detail-header">
                        <Image size={16} />
                        <h4>Image Prompt</h4>
                        <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => copyToClipboard(gig.imagePrompt, `${sessionPrefix}image`)}
                        >
                            {copiedField === `${sessionPrefix}image` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                    <p className="detail-value">{gig.imagePrompt}</p>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="app loading-screen">
                <div className="loading-content">
                    <Sparkles className="loading-icon animate-pulse" size={48} />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            {/* Background */}
            <div className="bg-effects">
                <div className="gradient-orb gradient-orb-1"></div>
                <div className="gradient-orb gradient-orb-2"></div>
                <div className="grid-pattern"></div>
            </div>

            {/* Header */}
            <header className="header">
                <div className="container header-content">
                    <div className="header-left">
                        <Link to="/" className="btn btn-ghost">
                            <ArrowLeft size={18} />
                            <span>Back</span>
                        </Link>
                        <div className="logo">
                            <Sparkles className="logo-icon" />
                            <span className="logo-text">Gig <span className="gradient-text">History</span></span>
                        </div>
                    </div>

                    <div className="header-right">
                        {user ? (
                            <div className="user-menu">
                                <div className="user-info">
                                    <User size={16} />
                                    <span>{profile?.full_name || user.email}</span>
                                </div>
                                <button className="btn btn-ghost" onClick={() => setShowSettings(true)}>
                                    <Settings size={18} />
                                </button>
                                <button className="btn btn-ghost" onClick={signOut}>
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="guest-menu">
                                {supabaseConfigured && (
                                    <button className="btn btn-secondary" onClick={() => setShowAuthModal(true)}>
                                        <User size={18} />
                                        <span>Sign In</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Settings Modal */}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Sign In</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowAuthModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <AuthForm onSuccess={() => setShowAuthModal(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="main-content history-page">
                <div className="container">
                    <div className="history-header">
                        <h1>Your Gig History</h1>
                        <p>View and manage all your saved gig research sessions</p>
                    </div>

                    {!user ? (
                        <div className="empty-state">
                            <FolderOpen size={64} />
                            <h2>Sign in to view your history</h2>
                            <p>Your gig sessions will be saved to your account</p>
                            {supabaseConfigured && (
                                <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                                    Sign In
                                </button>
                            )}
                        </div>
                    ) : savedSessions.length === 0 ? (
                        <div className="empty-state">
                            <FolderOpen size={64} />
                            <h2>No sessions yet</h2>
                            <p>Generate your first gig to see it here</p>
                            <Link to="/" className="btn btn-primary">
                                Create a Gig
                            </Link>
                        </div>
                    ) : (
                        <div className="sessions-grid">
                            {savedSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`session-card glass-card ${expandedSession === session.id ? 'expanded' : ''}`}
                                >
                                    <div
                                        className="session-card-header"
                                        onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                                    >
                                        <div className="session-info">
                                            <h3 className="session-niche">{session.niche}</h3>
                                            <div className="session-meta">
                                                <Clock size={14} />
                                                <span>{formatDate(session.updated_at)}</span>
                                            </div>
                                        </div>
                                        <div className="session-actions">
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={(e) => handleDeleteSession(session.id, e)}
                                                title="Delete session"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            {expandedSession === session.id ? (
                                                <ChevronUp size={20} />
                                            ) : (
                                                <ChevronDown size={20} />
                                            )}
                                        </div>
                                    </div>

                                    {expandedSession === session.id && (
                                        <div className="session-card-body animate-fadeIn">
                                            {renderGigDetails(session)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>
                        <Sparkles size={14} /> Fiverr Success — AI-Powered Gig Optimization
                    </p>
                    <p className="footer-credit">
                        Made with ❤️ by <a href="https://braandex.com" target="_blank" rel="noopener noreferrer">Braandex</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
