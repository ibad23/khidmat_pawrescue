"use client";

import { ReactNode, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const [showBack, setShowBack] = useState(true);
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name?: string | null; role?: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const ref = document.referrer || "";
      // Hide back button if user likely came from login or there's no prior history
      if (ref.includes("/login") || window.history.length <= 2) {
        setShowBack(false);
      }
    } catch (err) {
      // ignore
    }
  }, []);

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
              <SidebarTrigger className="-ml-2" />
              
              {showBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-muted-foreground hover:text-foreground gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}

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
                      {profile?.name ? (
                        <AvatarImage src={
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`
                        } />
                      ) : (
                        <></>
                      )}
                      <AvatarFallback>
                        <User className="w-4 h-4" />
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
