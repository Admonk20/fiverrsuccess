import { useState, useEffect } from 'react';
import { User, Target, DollarSign, Briefcase, Plus, X, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserSpecialty } from '../types';

interface SpecialtyProfileProps {
    userId: string;
    onComplete?: (specialty: UserSpecialty) => void;
}

const POPULAR_SERVICES = [
    'Logo Design', 'Video Editing', 'Web Development', 'Graphic Design',
    'SEO Services', 'Social Media Marketing', 'Content Writing', 'Voice Over',
    'Translation', 'Data Entry', 'Virtual Assistant', 'Illustration',
    'Animation', 'Music Production', 'Photography', 'WordPress Development',
    'Mobile App Development', 'UI/UX Design', 'Copywriting', 'Podcast Editing'
];

export function SpecialtyProfile({ userId, onComplete }: SpecialtyProfileProps) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [existingProfile, setExistingProfile] = useState<UserSpecialty | null>(null);

    // Form state
    const [primaryService, setPrimaryService] = useState('');
    const [customService, setCustomService] = useState('');
    const [subNiches, setSubNiches] = useState<string[]>([]);
    const [newSubNiche, setNewSubNiche] = useState('');
    const [targetClients, setTargetClients] = useState<string[]>([]);
    const [newClient, setNewClient] = useState('');
    const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
    const [priceMin, setPriceMin] = useState(5);
    const [priceMax, setPriceMax] = useState(100);

    // Load existing profile
    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from('user_specialties')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (data) {
                setExistingProfile(data as unknown as UserSpecialty);
                setPrimaryService(data.primary_service);
                setSubNiches(data.sub_niches || []);
                setTargetClients(data.target_clients || []);
                setExperienceLevel(data.experience_level);
                setPriceMin(data.price_range?.min || 5);
                setPriceMax(data.price_range?.max || 100);
            }
        } catch (e) {
            // No profile exists yet
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelect = (service: string) => {
        setPrimaryService(service);
        setStep(2);
    };

    const handleCustomService = () => {
        if (customService.trim()) {
            setPrimaryService(customService.trim());
            setStep(2);
        }
    };

    const addSubNiche = () => {
        if (newSubNiche.trim() && !subNiches.includes(newSubNiche.trim())) {
            setSubNiches([...subNiches, newSubNiche.trim()]);
            setNewSubNiche('');
        }
    };

    const removeSubNiche = (niche: string) => {
        setSubNiches(subNiches.filter(n => n !== niche));
    };

    const addTargetClient = () => {
        if (newClient.trim() && !targetClients.includes(newClient.trim())) {
            setTargetClients([...targetClients, newClient.trim()]);
            setNewClient('');
        }
    };

    const removeTargetClient = (client: string) => {
        setTargetClients(targetClients.filter(c => c !== client));
    };

    const saveProfile = async () => {
        setIsSaving(true);
        try {
            const profileData = {
                user_id: userId,
                primary_service: primaryService,
                sub_niches: subNiches,
                target_clients: targetClients,
                experience_level: experienceLevel,
                price_range: { min: priceMin, max: priceMax },
                updated_at: new Date().toISOString()
            };

            if (existingProfile) {
                await supabase
                    .from('user_specialties')
                    .update(profileData)
                    .eq('user_id', userId);
            } else {
                await supabase
                    .from('user_specialties')
                    .insert({
                        ...profileData,
                        created_at: new Date().toISOString()
                    });
            }

            const specialty: UserSpecialty = {
                id: existingProfile?.id || '',
                userId,
                primaryService,
                subNiches,
                targetClients,
                experienceLevel,
                priceRange: { min: priceMin, max: priceMax },
                createdAt: existingProfile?.createdAt || new Date(),
                updatedAt: new Date()
            };

            onComplete?.(specialty);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="specialty-loading">
                <Loader2 className="animate-spin" size={32} />
                <span>Loading your profile...</span>
            </div>
        );
    }

    return (
        <div className="specialty-profile">
            <div className="profile-header">
                <User size={24} />
                <div>
                    <h3>Your Specialty Profile</h3>
                    <p>Tell us about your services for smarter keyword research</p>
                </div>
            </div>

            <div className="profile-progress">
                <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                    <span className="step-num">1</span>
                    <span className="step-label">Service</span>
                </div>
                <div className="progress-line" />
                <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                    <span className="step-num">2</span>
                    <span className="step-label">Niches</span>
                </div>
                <div className="progress-line" />
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                    <span className="step-num">3</span>
                    <span className="step-label">Clients</span>
                </div>
                <div className="progress-line" />
                <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
                    <span className="step-num">4</span>
                    <span className="step-label">Pricing</span>
                </div>
            </div>

            {step === 1 && (
                <div className="profile-step">
                    <h4><Briefcase size={18} /> What's your primary service?</h4>
                    <div className="service-grid">
                        {POPULAR_SERVICES.map(service => (
                            <button
                                key={service}
                                onClick={() => handleServiceSelect(service)}
                                className={`service-btn ${primaryService === service ? 'active' : ''}`}
                            >
                                {service}
                            </button>
                        ))}
                    </div>
                    <div className="custom-service">
                        <input
                            type="text"
                            placeholder="Or enter your specific service..."
                            value={customService}
                            onChange={e => setCustomService(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCustomService()}
                        />
                        <button onClick={handleCustomService} disabled={!customService.trim()}>
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="profile-step">
                    <h4><Target size={18} /> What sub-niches do you specialize in?</h4>
                    <p className="step-desc">Add specific areas within {primaryService}</p>

                    <div className="tag-input-group">
                        <input
                            type="text"
                            placeholder={`e.g., "Minimalist ${primaryService}", "3D ${primaryService}"...`}
                            value={newSubNiche}
                            onChange={e => setNewSubNiche(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addSubNiche()}
                        />
                        <button onClick={addSubNiche} className="btn-add">
                            <Plus size={16} />
                        </button>
                    </div>

                    {subNiches.length > 0 && (
                        <div className="tag-list">
                            {subNiches.map(niche => (
                                <span key={niche} className="tag">
                                    {niche}
                                    <button onClick={() => removeSubNiche(niche)}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="step-nav">
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                        <button className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="profile-step">
                    <h4><User size={18} /> Who are your ideal clients?</h4>
                    <p className="step-desc">This helps find keywords your buyers actually search</p>

                    <div className="tag-input-group">
                        <input
                            type="text"
                            placeholder="e.g., Startups, E-commerce, Restaurants..."
                            value={newClient}
                            onChange={e => setNewClient(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addTargetClient()}
                        />
                        <button onClick={addTargetClient} className="btn-add">
                            <Plus size={16} />
                        </button>
                    </div>

                    {targetClients.length > 0 && (
                        <div className="tag-list">
                            {targetClients.map(client => (
                                <span key={client} className="tag">
                                    {client}
                                    <button onClick={() => removeTargetClient(client)}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="experience-select">
                        <label>Your experience level:</label>
                        <div className="exp-buttons">
                            {(['beginner', 'intermediate', 'expert'] as const).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setExperienceLevel(level)}
                                    className={`exp-btn ${experienceLevel === level ? 'active' : ''}`}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="step-nav">
                        <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                        <button className="btn btn-primary" onClick={() => setStep(4)}>Continue</button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="profile-step">
                    <h4><DollarSign size={18} /> Your price range</h4>
                    <p className="step-desc">Helps find keywords in your market segment</p>

                    <div className="price-range">
                        <div className="price-input">
                            <label>Minimum ($)</label>
                            <input
                                type="number"
                                min={5}
                                value={priceMin}
                                onChange={e => setPriceMin(Number(e.target.value))}
                            />
                        </div>
                        <span className="price-separator">to</span>
                        <div className="price-input">
                            <label>Maximum ($)</label>
                            <input
                                type="number"
                                min={priceMin}
                                value={priceMax}
                                onChange={e => setPriceMax(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="profile-summary">
                        <h5>Your Profile Summary</h5>
                        <div className="summary-item">
                            <strong>Service:</strong> {primaryService}
                        </div>
                        {subNiches.length > 0 && (
                            <div className="summary-item">
                                <strong>Sub-niches:</strong> {subNiches.join(', ')}
                            </div>
                        )}
                        {targetClients.length > 0 && (
                            <div className="summary-item">
                                <strong>Target clients:</strong> {targetClients.join(', ')}
                            </div>
                        )}
                        <div className="summary-item">
                            <strong>Experience:</strong> {experienceLevel}
                        </div>
                        <div className="summary-item">
                            <strong>Price range:</strong> ${priceMin} - ${priceMax}
                        </div>
                    </div>

                    <div className="step-nav">
                        <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
                        <button
                            className="btn btn-primary"
                            onClick={saveProfile}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Save & Start Researching
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
