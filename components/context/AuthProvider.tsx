'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import client from '@/app/api/client';
import axios from 'axios';

export type UserRole = 'Administrator' | 'Moderator' | 'Surgeon' | null;

type AuthContextType = {
    user: any | null;
    loading: boolean;
    userRole: UserRole;
    userName: string | null;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [userName, setUserName] = useState<string | null>(null);

    const fetchProfile = useCallback(async (email: string) => {
        try {
            const cacheKey = `profile:${email}`;
            const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;

            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setUserName(parsed.name ?? null);
                    setUserRole(parsed.role as UserRole);
                    return;
                } catch {
                    // Failed to parse, continue to fetch
                }
            }

            const res = await axios.post('/api/profile', { email });
            const profile = res.data?.user ?? null;

            if (profile) {
                setUserName(profile.name ?? null);
                setUserRole(profile.role as UserRole);

                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify(profile));
                } catch {
                    // Ignore storage errors
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setUserRole(null);
            setUserName(null);
        }
    }, []);

    const clearProfile = useCallback(() => {
        setUserRole(null);
        setUserName(null);

        // Clear cached profiles from sessionStorage
        if (typeof window !== 'undefined') {
            try {
                const keys = Object.keys(sessionStorage);
                for (const k of keys) {
                    if (k.startsWith('profile:')) sessionStorage.removeItem(k);
                }
            } catch {
                // Ignore
            }
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user?.email) {
            // Clear cache first
            const cacheKey = `profile:${user.email}`;
            try {
                sessionStorage.removeItem(cacheKey);
            } catch {
                // Ignore
            }
            await fetchProfile(user.email);
        }
    }, [user?.email, fetchProfile]);

    useEffect(() => {
        client.auth.getSession().then(({ data }) => {
            const sessionUser = data?.session?.user ?? null;
            setUser(sessionUser);
            if (sessionUser?.email) {
                fetchProfile(sessionUser.email);
            }
            setLoading(false);
        });

        const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
            const sessionUser = session?.user ?? null;
            setUser(sessionUser);
            if (sessionUser?.email) {
                fetchProfile(sessionUser.email);
            } else {
                clearProfile();
            }
        });

        return () => {
            listener?.subscription?.unsubscribe?.();
        };
    }, [fetchProfile, clearProfile]);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        const res = await client.auth.signInWithPassword({ email, password });
        const loggedInUser = res.data?.user ?? null;
        setUser(loggedInUser);

        if (loggedInUser?.email) {
            await fetchProfile(loggedInUser.email);
        }

        setLoading(false);
        return res;
    };

    const signOut = async () => {
        await client.auth.signOut();
        setUser(null);
        clearProfile();
    };

    return (
        <AuthContext.Provider value={{ user, loading, userRole, userName, signIn, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
