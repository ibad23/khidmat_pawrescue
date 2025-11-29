'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import client from '@/app/api/client';

type AuthContextType = {
    user: any | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.auth.getSession().then(({ data }) => {
            setUser(data?.session?.user ?? null);
            setLoading(false);
        });

        const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            listener?.subscription?.unsubscribe?.();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        const res = await client.auth.signInWithPassword({ email, password });
        // update local user state if session available
        setUser(res.data?.user ?? null);
        setLoading(false);
        return res;
    };

    const signOut = async () => {
        await client.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };