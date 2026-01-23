export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    openai_api_key: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    openai_api_key?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    openai_api_key?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            gig_sessions: {
                Row: {
                    id: string;
                    user_id: string;
                    niche: string;
                    keywords: object;
                    generated_gig: object | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    niche: string;
                    keywords: object;
                    generated_gig?: object | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    niche?: string;
                    keywords?: object;
                    generated_gig?: object | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type GigSession = Database['public']['Tables']['gig_sessions']['Row'];
