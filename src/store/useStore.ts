import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { GeneratedGig, KeywordData } from '../types';
import type { GigSession, Profile } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { openaiService } from '../services/openaiService';

interface AuthState {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;

    // Auth actions
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setProfile: (profile: Profile | null) => void;
    setLoading: (loading: boolean) => void;
    signUp: (email: string, password: string, fullName?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    updateApiKey: (apiKey: string) => Promise<void>;
    initializeAuth: () => Promise<void>;
}

interface GigState {
    niche: string;
    keywords: KeywordData[];
    generatedGig: GeneratedGig | null;
    savedSessions: GigSession[];
    currentSessionId: string | null;
    isSearching: boolean;
    isGenerating: boolean;
    isGeneratingImage: boolean;
    error: string | null;

    // Gig actions
    setNiche: (niche: string) => void;
    setKeywords: (keywords: KeywordData[]) => void;
    setGeneratedGig: (gig: GeneratedGig | null) => void;
    setSearching: (searching: boolean) => void;
    setGenerating: (generating: boolean) => void;
    setError: (error: string | null) => void;
    searchKeywords: (niche: string) => Promise<void>;
    generateGig: () => Promise<void>;
    generateGigImage: () => Promise<void>;
    saveSession: () => Promise<void>;
    loadSession: (sessionId: string) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    fetchSessions: () => Promise<void>;
    clearCurrentSession: () => void;
}

interface SettingsState {
    openaiApiKey: string;
    showSettings: boolean;

    // Settings actions
    setOpenaiApiKey: (key: string) => void;
    setShowSettings: (show: boolean) => void;
    initializeOpenAI: (apiKey: string) => void;
}

type AppState = AuthState & GigState & SettingsState;

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Auth state
            user: null,
            session: null,
            profile: null,
            isLoading: true,

            // Gig state
            niche: '',
            keywords: [],
            generatedGig: null,
            savedSessions: [],
            currentSessionId: null,
            isSearching: false,
            isGenerating: false,
            isGeneratingImage: false,
            error: null,

            // Settings state
            openaiApiKey: '',
            showSettings: false,

            // Auth actions
            setUser: (user) => set({ user }),
            setSession: (session) => set({ session }),
            setProfile: (profile) => set({ profile }),
            setLoading: (isLoading) => set({ isLoading }),

            initializeAuth: async () => {
                if (!isSupabaseConfigured()) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        set({ session, user: session.user });
                        await get().fetchProfile();
                    }
                } catch (error) {
                    console.error('Auth initialization error:', error);
                } finally {
                    set({ isLoading: false });
                }

                // Listen for auth changes
                supabase.auth.onAuthStateChange(async (_event, session) => {
                    set({ session, user: session?.user || null });
                    if (session?.user) {
                        await get().fetchProfile();
                        await get().fetchSessions();
                    } else {
                        set({ profile: null, savedSessions: [] });
                    }
                });
            },

            signUp: async (email, password, fullName) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { full_name: fullName }
                        }
                    });

                    if (error) throw error;

                    if (data.user) {
                        // Create profile
                        await supabase.from('profiles').insert({
                            id: data.user.id,
                            email: data.user.email!,
                            full_name: fullName || null
                        });
                    }
                } catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Sign up failed' });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            signIn: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (error) throw error;
                } catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Sign in failed' });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            signOut: async () => {
                await supabase.auth.signOut();
                set({
                    user: null,
                    session: null,
                    profile: null,
                    savedSessions: [],
                    keywords: [],
                    generatedGig: null,
                    currentSessionId: null
                });
            },

            fetchProfile: async () => {
                const { user } = get();
                if (!user) return;

                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error) throw error;

                    set({ profile: data });

                    // Initialize OpenAI if key is saved
                    if (data?.openai_api_key) {
                        get().initializeOpenAI(data.openai_api_key);
                    }
                } catch (error) {
                    console.error('Fetch profile error:', error);
                }
            },

            updateApiKey: async (apiKey) => {
                const { user } = get();

                // Initialize OpenAI locally regardless of auth
                get().initializeOpenAI(apiKey);
                set({ openaiApiKey: apiKey });

                // If logged in, also save to profile
                if (user) {
                    try {
                        const { error } = await supabase
                            .from('profiles')
                            .update({ openai_api_key: apiKey, updated_at: new Date().toISOString() })
                            .eq('id', user.id);

                        if (error) throw error;

                        set((state) => ({
                            profile: state.profile ? { ...state.profile, openai_api_key: apiKey } : null
                        }));
                    } catch (error) {
                        console.error('Failed to save API key to profile:', error);
                    }
                }
            },

            // Gig actions
            setNiche: (niche) => set({ niche }),
            setKeywords: (keywords) => set({ keywords }),
            setGeneratedGig: (generatedGig) => set({ generatedGig }),
            setSearching: (isSearching) => set({ isSearching }),
            setGenerating: (isGenerating) => set({ isGenerating }),
            setError: (error) => set({ error }),

            searchKeywords: async (niche) => {
                set({ isSearching: true, error: null, keywords: [], generatedGig: null });

                try {
                    const keywords = await openaiService.searchKeywords(niche);
                    set({ keywords, niche });

                    // Auto-save session if logged in
                    if (get().user) {
                        await get().saveSession();
                    }
                } catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Search failed' });
                } finally {
                    set({ isSearching: false });
                }
            },

            generateGig: async () => {
                const { keywords, niche } = get();
                if (keywords.length === 0) {
                    set({ error: 'Please search for keywords first' });
                    return;
                }

                set({ isGenerating: true, error: null });

                try {
                    const gig = await openaiService.generateGig(keywords, niche);
                    set({ generatedGig: gig });

                    // Auto-save if user is logged in
                    if (get().user) {
                        await get().saveSession();
                    }
                } catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Generation failed' });
                } finally {
                    set({ isGenerating: false });
                }
            },

            generateGigImage: async () => {
                const { generatedGig } = get();
                if (!generatedGig || !generatedGig.imagePrompt) {
                    set({ error: 'No gig generated to create image for' });
                    return;
                }

                set({ isGeneratingImage: true, error: null });

                try {
                    const imageUrl = await openaiService.generateImage(generatedGig.imagePrompt);

                    // Update gig with new image 
                    // (Note: generatedGig type doesn't have imageUrl field yet in types/index.ts, need to add it or use a separate field? 
                    // Actually, generatedGig is huge. I should probably add imageUrl to it or store separately.
                    // For now, let's assume we can extend generatedGig or store it in metadata? 
                    // Wait, I should add imageUrl to GeneratedGig type first.
                    // For now I'll just store it in the store and update generatedGig safely)

                    const updatedGig = { ...generatedGig, imageUrl };
                    set({ generatedGig: updatedGig });

                    // Auto-save
                    if (get().user) {
                        await get().saveSession();
                    }
                } catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Image generation failed' });
                } finally {
                    set({ isGeneratingImage: false });
                }
            },

            saveSession: async () => {
                const { user, niche, keywords, generatedGig, currentSessionId } = get();
                if (!user) return;

                try {
                    if (currentSessionId) {
                        // Update existing session
                        await supabase
                            .from('gig_sessions')
                            .update({
                                niche,
                                keywords: keywords as unknown as object,
                                generated_gig: generatedGig as unknown as object,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', currentSessionId);
                    } else {
                        // Create new session
                        const { data, error } = await supabase
                            .from('gig_sessions')
                            .insert({
                                user_id: user.id,
                                niche,
                                keywords: keywords as unknown as object,
                                generated_gig: generatedGig as unknown as object
                            })
                            .select()
                            .single();

                        if (error) throw error;
                        if (data) {
                            set({ currentSessionId: data.id });
                        }
                    }

                    await get().fetchSessions();
                } catch (error) {
                    console.error('Save session error:', error);
                }
            },

            loadSession: async (sessionId) => {
                try {
                    const { data, error } = await supabase
                        .from('gig_sessions')
                        .select('*')
                        .eq('id', sessionId)
                        .single();

                    if (error) throw error;

                    if (data) {
                        set({
                            currentSessionId: data.id,
                            niche: data.niche,
                            keywords: data.keywords as unknown as KeywordData[],
                            generatedGig: data.generated_gig as unknown as GeneratedGig
                        });
                    }
                } catch (error) {
                    console.error('Load session error:', error);
                }
            },

            deleteSession: async (sessionId) => {
                try {
                    await supabase
                        .from('gig_sessions')
                        .delete()
                        .eq('id', sessionId);

                    if (get().currentSessionId === sessionId) {
                        get().clearCurrentSession();
                    }

                    await get().fetchSessions();
                } catch (error) {
                    console.error('Delete session error:', error);
                }
            },

            fetchSessions: async () => {
                const { user } = get();
                if (!user) return;

                try {
                    const { data, error } = await supabase
                        .from('gig_sessions')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('updated_at', { ascending: false });

                    if (error) throw error;

                    set({ savedSessions: data || [] });
                } catch (error) {
                    console.error('Fetch sessions error:', error);
                }
            },

            clearCurrentSession: () => {
                set({
                    currentSessionId: null,
                    niche: '',
                    keywords: [],
                    generatedGig: null
                });
            },

            // Settings actions
            setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
            setShowSettings: (showSettings) => set({ showSettings }),

            initializeOpenAI: (apiKey) => {
                try {
                    openaiService.initialize(apiKey);
                    set({ openaiApiKey: apiKey });
                } catch (error) {
                    console.error('OpenAI initialization error:', error);
                }
            }
        }),
        {
            name: 'fiverr-success-storage',
            partialize: (state) => ({
                openaiApiKey: state.openaiApiKey
            })
        }
    )
);
