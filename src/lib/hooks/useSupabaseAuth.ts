"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export interface SupabaseAuthState {
  supabase: ReturnType<typeof getSupabaseBrowserClient>;
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useSupabaseAuth(): SupabaseAuthState {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError("Supabase client unavailable. Check environment configuration.");
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error: authError }) => {
        if (!active) return;
        if (authError) {
          setError(authError.message);
        }
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_, nextSession) => {
      if (!active) return;
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription?.subscription.unsubscribe();
    };
  }, [supabase]);

  const clearError = useCallback(() => setError(null), []);

  return {
    supabase,
    session,
    user: session?.user ?? null,
    loading,
    error,
    clearError,
  };
}
