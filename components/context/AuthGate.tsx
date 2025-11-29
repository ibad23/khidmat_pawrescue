"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Allow access to login and public paths without auth
  const publicPaths = ["/login"];
  const isPublic = publicPaths.some((p) => pathname?.startsWith(p));

  React.useEffect(() => {
    if (isPublic) return;

    if (!loading && !user) {
      router.replace("/login");
    }
  }, [isPublic, loading, user, router]);

  if (isPublic) return <>{children}</>;

  if (loading) return null; // or a loading spinner

  if (!user) return null; // effect will redirect

  return <>{children}</>;
}
