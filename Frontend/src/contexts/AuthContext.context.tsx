'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase.service';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: AuthError }>;
    signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
    signInWithGoogle: () => Promise<{ error?: AuthError }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ error?: Error }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from database
    const fetchProfile = async (userId: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    };

    // Refresh profile data
    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id);
            setProfile(profileData);
        }
    };

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Set token for API client
                apiClient.setToken(session.access_token);
                fetchProfile(session.user.id).then(setProfile);
            }

            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Set token for API client
                apiClient.setToken(session.access_token);
                const profileData = await fetchProfile(session.user.id);
                setProfile(profileData);
            } else {
                // Clear token from API client
                apiClient.clearToken();
                setProfile(null);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Sign up function
    const signUp = async (email: string, password: string, displayName?: string) => {
        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName,
                    },
                },
            });

            if (error) {
                toast.error(error.message);
                return { error };
            }

            if (authData.user && !authData.session) {
                toast.success('Please check your email to confirm your account');
            }

            return { error: undefined };
        } catch (error) {
            const authError = error as AuthError;
            toast.error(authError.message);
            return { error: authError };
        }
    };

    // Sign in function
    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return { error };
            }

            toast.success('Successfully signed in');
            return { error: undefined };
        } catch (error) {
            const authError = error as AuthError;
            toast.error(authError.message);
            return { error: authError };
        }
    };

    // Sign in with Google function
    const signInWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });

            if (error) {
                toast.error(error.message);
                return { error };
            }

            return { error: undefined };
        } catch (error) {
            const authError = error as AuthError;
            toast.error(authError.message);
            return { error: authError };
        }
    };

    // Sign out function
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                toast.error(error.message);
                return;
            }

            // Clear API client token
            apiClient.clearToken();
            setUser(null);
            setProfile(null);
            setSession(null);
            toast.success('Successfully signed out');
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error('Error signing out');
        }
    };

    // Update profile function
    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) {
            return { error: new Error('No user logged in') };
        }

        try {
            const response = await apiClient.updateUserProfile(updates);

            if (response.error) {
                toast.error('Failed to update profile');
                return { error: new Error(response.error) };
            }

            if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                const responseData = response.data as any;
                if (responseData.data?.profile) {
                    setProfile(responseData.data.profile);
                    toast.success('Profile updated successfully');
                }
            }

            return { error: undefined };
        } catch (error) {
            const err = error as Error;
            toast.error('Failed to update profile');
            return { error: err };
        }
    };

    const value = {
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}