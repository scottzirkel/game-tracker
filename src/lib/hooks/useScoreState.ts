"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ScoreState } from "@/lib/scoreStore";
import {
  SUPABASE_GAME_STATE_ID,
  SUPABASE_GAME_STATE_TABLE,
} from "@/lib/supabase/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type LiveMode = "idle" | "sse" | "polling" | "supabase" | "error";

export interface UseScoreStateOptions {
  enableSSE?: boolean;
  pollingIntervalMs?: number; // default 5000
  maxSseBackoffMs?: number; // cap for exponential backoff, default 30000
}

export interface UseScoreStateResult {
  state: ScoreState | null;
  mode: LiveMode;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useScoreState(options: UseScoreStateOptions = {}): UseScoreStateResult {
  const {
    enableSSE = true,
    pollingIntervalMs = 5000,
    maxSseBackoffMs = 30000,
  } = options;

  const supabase = useMemo<SupabaseClient | null>(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }, []);

  const [state, setState] = useState<ScoreState | null>(null);
  const [mode, setMode] = useState<LiveMode>("idle");
  const [error, setError] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<number | null>(null);
  const backoffRef = useRef<number>(1000);
  const stoppedRef = useRef<boolean>(false);
  const supabaseChannelRef = useRef<ReturnType<SupabaseClient["channel"]> | null>(null);

  const clearPolling = () => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const closeES = () => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  };

  const startPolling = useCallback(() => {
    if (stoppedRef.current) return;
    closeES();
    setMode("polling");
    clearPolling();
    const tick = async () => {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (!res.ok) throw new Error(`Polling failed: ${res.status}`);
        const data = (await res.json()) as ScoreState;
        setState(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Polling error");
      }
    };
    void tick();
    pollRef.current = window.setInterval(tick, Math.max(1000, pollingIntervalMs));
  }, [pollingIntervalMs]);

  const tryStartSSE = useCallback(() => {
    if (stoppedRef.current || !enableSSE) return;
    clearPolling();
    closeES();
    setMode("sse");
    setError(null);

    const es = new EventSource("/api/stream");
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as ScoreState;
        setState(data);
        backoffRef.current = 1000;
      } catch {
        // ignore malformed payloads
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;

      const next = Math.min(backoffRef.current * 2, maxSseBackoffMs);
      const delay = backoffRef.current;
      backoffRef.current = next;

      if (delay >= maxSseBackoffMs) {
        setMode("polling");
        startPolling();
        return;
      }

      window.setTimeout(() => {
        if (!stoppedRef.current) tryStartSSE();
      }, delay);
    };
  }, [enableSSE, maxSseBackoffMs, startPolling]);

  const fetchFromSupabase = useCallback(async () => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(SUPABASE_GAME_STATE_TABLE)
      .select('state')
      .eq('id', SUPABASE_GAME_STATE_ID)
      .maybeSingle();
    if (error) throw error;
    if (data?.state) {
      const next = data.state as ScoreState;
      setState(next);
      setError(null);
      setMode("supabase");
      return next;
    }
    return null;
  }, [supabase]);

  const refresh = useCallback(async () => {
    try {
      if (supabase) {
        const next = await fetchFromSupabase();
        if (next) return;
      }

      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = (await res.json()) as ScoreState;
      setState(data);
      setError(null);
      setMode(supabase ? "supabase" : "polling");
    } catch (e: any) {
      setError(e?.message ?? "Failed to refresh");
      setMode("error");
    }
  }, [fetchFromSupabase, supabase]);

  useEffect(() => {
    if (supabase) {
      stoppedRef.current = false;
      let cancelled = false;

      const channel = supabase
        .channel("score-state")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: SUPABASE_GAME_STATE_TABLE,
            filter: `id=eq.${SUPABASE_GAME_STATE_ID}`,
          },
          (payload) => {
            if (cancelled) return;
            const next = (payload.new as { state?: ScoreState } | null)?.state;
            if (next) {
              setState(next);
              setError(null);
              setMode("supabase");
            }
          },
        )
        .subscribe((status) => {
          if (cancelled) return;
          if (status === "SUBSCRIBED") {
            setMode("supabase");
          }
          if (status === "CHANNEL_ERROR") {
            setMode("error");
            setError("Realtime channel error");
          }
        });

      supabaseChannelRef.current = channel;

      void refresh().catch((err) => {
        if (cancelled) return;
        setMode("error");
        setError(err?.message ?? "Failed to load state");
      });

      return () => {
        cancelled = true;
        stoppedRef.current = true;
        if (supabaseChannelRef.current) {
          supabase.removeChannel(supabaseChannelRef.current);
          supabaseChannelRef.current = null;
        }
      };
    }

    stoppedRef.current = false;
    void refresh();

    if (enableSSE && typeof window !== "undefined" && "EventSource" in window) {
      tryStartSSE();
    } else {
      startPolling();
    }

    return () => {
      stoppedRef.current = true;
      clearPolling();
      closeES();
    };
  }, [enableSSE, refresh, startPolling, supabase, tryStartSSE]);

  return { state, mode, error, refresh };
}
