"use client";

import { ReactNode, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name?: string | null; role?: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);



  useEffect(() => {
    let mounted = true;
    if (!user?.email) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const cacheKey = `profile:${user.email}`;
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (mounted) {
          setProfile(parsed);
          setIsLoading(false);
        }
        return;
      } catch (e) {
        // failed parse, continue to fetch
      }
    }

    setIsLoading(true);
    axios
      .post("/api/profile", { email: user.email })
      .then((res) => {
        if (!mounted) return;
        const p = res.data?.user ?? null;
        setProfile(p);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(p));
        } catch (e) {
          // ignore storage errors
        }
      })
      .catch(() => {
        if (mounted) setProfile(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  // clear cached profile(s) on logout
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) return; // only act when logged out

    try {
      const keys = Object.keys(sessionStorage);
      for (const k of keys) {
        if (k.startsWith('profile:')) sessionStorage.removeItem(k);
      }
    } catch (e) {
      // ignore
    }
  }, [user]);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center gap-4 px-6">

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted-foreground/20 animate-pulse" />
                    <div className="flex flex-col">
                      <div className="h-3 w-28 rounded bg-muted-foreground/20 animate-pulse" />
                      <div className="h-2 mt-1 w-20 rounded bg-muted-foreground/20 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {profile?.name ? getInitials(profile.name) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{profile?.name ?? ''}</span>
                      <span className="text-xs text-muted-foreground">{profile?.role ?? ''}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
