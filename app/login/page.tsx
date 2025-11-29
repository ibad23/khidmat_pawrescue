"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { ForgotPasswordDialog } from "@/components/dialogs/ForgotPasswordDialog";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signIn, user } = useAuth();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // call supabase sign in
    (async () => {
      try {
        const res = await signIn(email, password);
        if (res?.error) {
          toast({ title: "Login failed", description: res.error.message });
          return;
        }
        router.replace("/dashboard");
      } catch (err: any) {
        toast({ title: "Login error", description: err?.message ?? String(err) });
      }
    })();
  };

  const { toast } = useToast();

  useEffect(() => {
    // if already authenticated, redirect to dashboard
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <>
      <div className="flex min-h-screen">
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <img
            src="/login-cat.jpg"
            alt="Cute kitten"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 flex items-center justify-center bg-background p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="flex justify-center mb-8">
              <Logo />
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Login</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="xyz@abcmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  Login
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-primary hover:text-primary/90 text-sm font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordDialog open={showForgotPassword} onOpenChange={setShowForgotPassword} />
    </>
  );
}
