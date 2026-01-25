import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  Settings,
  Zap,
  TrendingUp,
  DollarSign,
  MessageSquare,
  FileText,
  Image,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Tag,
  HelpCircle,
  List,
  Star,
  ArrowRight,
  Globe,
  MessageCircle,
  ShoppingBag,
  LogOut,
  User,
  Menu,
  X,
  Target,
  FolderOpen
} from 'lucide-react';
import { useStore } from './store/useStore';
import { isSupabaseConfigured } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { SessionsList } from './components/SessionsList';
import { SettingsModal } from './components/SettingsModal';
import { openaiService } from './services/openaiService';
import type { KeywordData } from './types';
import './App.css';

function App() {
  const {
    user,
    profile,
    isLoading: authLoading,
    signOut,
    initializeAuth,
    niche,
    setNiche,
    keywords,
    generatedGig,
    isSearching,
    isGenerating,
    error,
    setError,
    searchKeywords,
    generateGig,
    openaiApiKey,
    initializeOpenAI
  } = useStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const supabaseConfigured = isSupabaseConfigured();

  // Initialize on mount
  useEffect(() => {
    // Initialize auth if Supabase is configured
    if (supabaseConfigured) {
      initializeAuth();
    } else {
      useStore.setState({ isLoading: false });
    }

    // Initialize OpenAI from stored key
    if (openaiApiKey) {
      initializeOpenAI(openaiApiKey);
    }
  }, []);

  // Scroll to results when gig is generated
  useEffect(() => {
    if (generatedGig) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [generatedGig]);

  const handleSearch = async () => {
    if (!niche.trim()) {
      setError('Please enter a niche or service type');
      return;
    }

    if (!openaiService.isInitialized()) {
      setShowSettings(true);
      setError('Please set your OpenAI API key first');
      return;
    }

    await searchKeywords(niche);
  };

  const handleGenerateGig = async () => {
    // Require auth for gig generation
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await generateGig();
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'fiverr': return <ShoppingBag size={14} />;
      case 'reddit': return <MessageCircle size={14} />;
      case 'google': return <Globe size={14} />;
      case 'trending': return <TrendingUp size={14} />;
      case 'competitor': return <Target size={14} />;
      default: return <Tag size={14} />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'fiverr': return 'source-fiverr';
      case 'reddit': return 'source-reddit';
      case 'google': return 'source-google';
      case 'trending': return 'source-trending';
      case 'competitor': return 'source-competitor';
      default: return '';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={12} className="trend-up" />;
      case 'down': return <TrendingUp size={12} className="trend-down" style={{ transform: 'rotate(180deg)' }} />;
      default: return <span className="trend-stable">—</span>;
    }
  };

  if (authLoading) {
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
      {/* Background Effects */}
      <div className="bg-effects">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="grid-pattern"></div>
      </div>

      {/* Sidebar for logged-in users */}
      {user && supabaseConfigured && (
        <>
          <div className={`sidebar-overlay ${showSidebar ? 'visible' : ''}`} onClick={() => setShowSidebar(false)} />
          <aside className={`sidebar ${showSidebar ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Saved Sessions</h3>
              <button className="btn btn-ghost btn-icon sidebar-close" onClick={() => setShowSidebar(false)}>
                <X size={20} />
              </button>
            </div>
            <SessionsList />
          </aside>
        </>
      )}

      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="header-left">
            {user && supabaseConfigured && (
              <button
                className="btn btn-ghost btn-icon sidebar-toggle"
                onClick={() => setShowSidebar(true)}
              >
                <Menu size={20} />
              </button>
            )}
            <div className="logo">
              <Sparkles className="logo-icon" />
              <span className="logo-text">Fiverr<span className="gradient-text">Success</span></span>
            </div>
          </div>

          <div className="header-right">
            {user ? (
              <div className="user-menu">
                <div className="user-info">
                  <User size={16} />
                  <span>{profile?.full_name || user.email}</span>
                </div>
                <a href="/history" className="btn btn-ghost" title="History">
                  <FolderOpen size={18} />
                </a>
                <button className="btn btn-ghost" onClick={() => setShowSettings(true)} title="Settings">
                  <Settings size={18} />
                </button>
                <button className="btn btn-ghost" onClick={signOut} title="Sign Out">
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
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Welcome Back</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAuthModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <AuthForm onSuccess={() => setShowAuthModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`main-content ${user && supabaseConfigured ? 'with-sidebar' : ''}`}>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-content animate-slideUp">
              <div className="hero-badge">
                <Zap size={14} />
                <span>AI-Powered Gig Optimization</span>
              </div>
              <h1 className="hero-title">
                Create <span className="gradient-text">Winning</span> Fiverr Gigs
                <br />with AI Intelligence
              </h1>
              <p className="hero-subtitle">
                Research trending keywords from Fiverr, Reddit, and Google. Generate optimized titles,
                descriptions, pricing, and more—all tailored to rank higher and convert better.
              </p>

              {/* Search Box */}
              <div className="search-container">
                <div className="search-box">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Enter your niche or service (e.g., logo design, video editing, SEO)..."
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    className="btn btn-primary search-btn"
                    onClick={handleSearch}
                    disabled={isSearching || !niche.trim()}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Find Keywords
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="error-message animate-fadeIn">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="features-row">
                <div className="feature-item">
                  <ShoppingBag size={18} className="feature-icon fiverr" />
                  <span>Fiverr</span>
                </div>
                <div className="feature-item">
                  <MessageCircle size={18} className="feature-icon reddit" />
                  <span>Reddit</span>
                </div>
                <div className="feature-item">
                  <Globe size={18} className="feature-icon google" />
                  <span>Google</span>
                </div>
                <div className="feature-item">
                  <TrendingUp size={18} className="feature-icon trending" />
                  <span>Trending</span>
                </div>
                <div className="feature-item">
                  <Target size={18} className="feature-icon competitor" />
                  <span>Competitor Gap</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keywords Section */}
        {keywords.length > 0 && (
          <section className="keywords-section animate-slideUp">
            <div className="container">
              <div className="section-header">
                <div>
                  <h2 className="section-title">
                    <Tag size={24} />
                    Keyword Research Results
                  </h2>
                  <p className="section-subtitle">
                    Found {keywords.length} high-potential keywords across multiple platforms
                  </p>
                </div>
                <button
                  className={`btn ${user ? 'btn-primary' : 'btn-secondary'} btn-lg`}
                  onClick={handleGenerateGig}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Generating Gig...
                    </>
                  ) : user ? (
                    <>
                      <Zap size={20} />
                      Generate Complete Gig
                      <ArrowRight size={20} />
                    </>
                  ) : (
                    <>
                      <User size={20} />
                      Sign In to Generate Gig
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>

              <div className="keywords-grid keywords-grid-5">
                {['fiverr', 'reddit', 'google', 'trending', 'competitor'].map(source => (
                  <div key={source} className={`keywords-column glass-card ${getSourceColor(source)}`}>
                    <div className="column-header">
                      {getSourceIcon(source)}
                      <h3>{source === 'competitor' ? 'Competitor Gap' : source.charAt(0).toUpperCase() + source.slice(1)} Keywords</h3>
                    </div>
                    <div className="keywords-list">
                      {keywords
                        .filter((k: KeywordData) => k.source === source)
                        .sort((a: KeywordData, b: KeywordData) => (b.trendingScore || 0) - (a.trendingScore || 0))
                        .map((keyword: KeywordData, idx: number) => (
                          <div key={idx} className="keyword-item keyword-item-rich">
                            <div className="keyword-main">
                              <span className="keyword-text">{keyword.keyword}</span>
                              {keyword.trend === 'hot' && <span className="hot-badge">🔥</span>}
                              {getTrendIcon(keyword.trend)}
                            </div>
                            <div className="keyword-metrics">
                              <div className="metric-row">
                                <span className={`intent-badge intent-${keyword.buyerIntent || 'medium'}`}>
                                  {keyword.buyerIntent === 'high' ? '💰 High Intent' : keyword.buyerIntent === 'medium' ? '👀 Medium' : '📖 Low'}
                                </span>
                                {keyword.trendingScore && keyword.trendingScore >= 80 && (
                                  <span className="trending-badge">📈 {keyword.trendingScore}</span>
                                )}
                              </div>
                              <div className="metric-row">
                                <span className={`difficulty-badge diff-${keyword.difficulty && keyword.difficulty <= 30 ? 'easy' : keyword.difficulty && keyword.difficulty <= 60 ? 'medium' : 'hard'}`}>
                                  Diff: {keyword.difficulty || 50}
                                </span>
                                <span className={`volume-badge vol-${keyword.searchVolume || 'medium'}`}>
                                  Vol: {keyword.searchVolume || 'medium'}
                                </span>
                              </div>
                            </div>
                            <div className="keyword-meta">
                              <span className={`competition-badge ${keyword.competition}`}>
                                {keyword.competition}
                              </span>
                              {keyword.competitorUsage === 'rare' && (
                                <span className="opportunity-badge">💎 Opportunity</span>
                              )}
                              <span className="relevance-score">{keyword.relevance}%</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Generated Gig Section */}
        {generatedGig && (
          <section className="generated-section animate-slideUp" ref={resultsRef}>
            <div className="container">
              <div className="section-header">
                <div>
                  <h2 className="section-title">
                    <Star size={24} />
                    Your Optimized Fiverr Gig
                  </h2>
                  <p className="section-subtitle">
                    Complete gig package ready to publish
                    {user && <span className="auto-saved"> • Auto-saved to your account</span>}
                  </p>
                </div>
              </div>

              <div className="gig-content">
                {/* Gig Title */}
                <div className="gig-card glass-card animate-scaleIn">
                  <div className="card-header">
                    <FileText size={20} />
                    <h3>Gig Title</h3>
                    <span className="char-count">
                      {generatedGig.title.length}/80 characters
                    </span>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => copyToClipboard(generatedGig.title, 'title')}
                    >
                      {copiedField === 'title' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="title-preview">
                    <p className="gig-title">{generatedGig.title}</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="gig-card glass-card animate-scaleIn stagger-1">
                  <div className="card-header">
                    <List size={20} />
                    <h3>Gig Metadata</h3>
                  </div>
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="meta-label">Category</span>
                      <span className="meta-value">{generatedGig.metadata.category}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="meta-label">Subcategory</span>
                      <span className="meta-value">{generatedGig.metadata.subcategory}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="meta-label">Service Type</span>
                      <span className="meta-value">{generatedGig.metadata.serviceType}</span>
                    </div>
                  </div>
                </div>

                {/* Search Tags */}
                <div className="gig-card glass-card animate-scaleIn stagger-2">
                  <div className="card-header">
                    <Tag size={20} />
                    <h3>Search Tags</h3>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => copyToClipboard(generatedGig.searchTags.join(', '), 'tags')}
                    >
                      {copiedField === 'tags' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="tags-container">
                    {generatedGig.searchTags.map((tag, idx) => (
                      <div key={idx} className="search-tag">
                        <span>{tag}</span>
                        <span className="tag-chars">{tag.length}/20</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="gig-card glass-card animate-scaleIn stagger-3">
                  <div className="card-header">
                    <DollarSign size={20} />
                    <h3>Pricing Packages</h3>
                  </div>
                  <div className="pricing-grid">
                    {(['basic', 'standard', 'premium'] as const).map(tier => {
                      const pkg = generatedGig.pricing[tier];
                      return (
                        <div key={tier} className={`pricing-tier ${tier}`}>
                          <div className="tier-header">
                            <span className="tier-name">{pkg.name}</span>
                            <span className="tier-price">${pkg.price}</span>
                          </div>
                          <p className="tier-description">{pkg.description}</p>
                          <div className="tier-details">
                            <div className="detail-row">
                              <span>Delivery</span>
                              <span>{pkg.deliveryTime}</span>
                            </div>
                            <div className="detail-row">
                              <span>Revisions</span>
                              <span>{pkg.revisions}</span>
                            </div>
                          </div>
                          <ul className="tier-features">
                            {pkg.features.map((feature, idx) => (
                              <li key={idx}>
                                <Check size={14} />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="gig-card glass-card animate-scaleIn stagger-4">
                  <div className="card-header">
                    <FileText size={20} />
                    <h3>Gig Description</h3>
                    <span className="char-count">
                      {generatedGig.description.length} characters
                    </span>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => copyToClipboard(generatedGig.description, 'description')}
                    >
                      {copiedField === 'description' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="description-content">
                    <p>{generatedGig.description}</p>
                  </div>
                </div>

                {/* FAQs */}
                <div className="gig-card glass-card animate-scaleIn stagger-5">
                  <div className="card-header">
                    <HelpCircle size={20} />
                    <h3>Frequently Asked Questions</h3>
                  </div>
                  <div className="faqs-list">
                    {generatedGig.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className={`faq-item ${expandedFaq === idx ? 'expanded' : ''}`}
                      >
                        <button
                          className="faq-question"
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        >
                          <span>{faq.question}</span>
                          {expandedFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {expandedFaq === idx && (
                          <div className="faq-answer animate-fadeIn">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="gig-card glass-card animate-scaleIn">
                  <div className="card-header">
                    <MessageSquare size={20} />
                    <h3>Buyer Requirements</h3>
                  </div>
                  <div className="requirements-list">
                    {generatedGig.requirements.map((req, idx) => (
                      <div key={idx} className="requirement-item">
                        <div className="req-header">
                          <span className="req-type">{req.type}</span>
                          {req.required && <span className="req-badge">Required</span>}
                        </div>
                        <p className="req-question">{req.question}</p>
                        {req.options && req.options.length > 0 && (
                          <div className="req-options">
                            {req.options.map((opt, optIdx) => (
                              <span key={optIdx} className="req-option">{opt}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gig Image */}
                <div className="gig-card glass-card animate-scaleIn">
                  <div className="card-header">
                    <Image size={20} />
                    <h3>Gig Image (1280×769)</h3>
                  </div>
                  <div className="image-section">
                    <div className="image-prompt">
                      <span className="prompt-label">AI Image Prompt:</span>
                      <p>{generatedGig.imagePrompt}</p>
                      <button
                        className="btn btn-ghost"
                        onClick={() => copyToClipboard(generatedGig.imagePrompt, 'imagePrompt')}
                      >
                        {copiedField === 'imagePrompt' ? <Check size={14} /> : <Copy size={14} />}
                        Copy Prompt
                      </button>
                    </div>
                    <div className="image-placeholder">
                      <Image size={48} />
                      <p>Use the prompt above with an AI image generator like DALL-E, Midjourney, or Canva AI</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>
            <Sparkles size={14} /> Fiverr Success — AI-Powered Gig Optimization
          </p>
          <p className="footer-note">
            Not affiliated with Fiverr International Ltd.
          </p>
          <p className="footer-credit">
            Made with ❤️ by <a href="https://braandex.com" target="_blank" rel="noopener noreferrer">Braandex</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
