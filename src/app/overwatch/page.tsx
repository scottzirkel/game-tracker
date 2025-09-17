"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FACTIONS, Faction, THEMES } from "@/lib/factions";
import { DETACHMENTS } from "@/lib/detachments";
import { createDefaultScoreState, type ScoreState } from "@/lib/scoreStore";
import { FIXED_SECONDARIES_2025 } from "@/lib/secondaries";
import { iconPathForFaction } from "@/lib/iconMap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Minus,
  Square,
  RotateCcw,
  Play,
  RefreshCcw,
  ChevronRight,
} from "lucide-react";
import RosterManager from "@/components/RosterManager";
import ValueStepper from "@/components/ValueStepper";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";

const OVERWATCH_STORAGE_KEY = "overwatch-score-state:v1";
const PHASES = ["Command", "Movement", "Shooting", "Charge", "Fight"] as const;
type Phase = (typeof PHASES)[number];

type StoredOverwatchState = {
  version: 1;
  savedAt: string;
  state: ScoreState;
};

const isScoreState = (value: unknown): value is ScoreState => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    "left" in candidate &&
    "right" in candidate &&
    "battleRound" in candidate &&
    "phase" in candidate
  );
};

function FactionIcon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      className={className}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        backgroundColor: "currentColor",
        display: "inline-block",
      }}
    />
  );
}

export default function OverwatchPage() {
  const [state, setState] = useState<ScoreState | null>(null);
  const [saving, setSaving] = useState(false);
  const [gameTimer, setGameTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hydratedFromStorage, setHydratedFromStorage] = useState(false);
  const [hadLocalSnapshot, setHadLocalSnapshot] = useState(false);
  const [localBypassActive, setLocalBypassActive] = useState(false);
  const [isLocalEnv, setIsLocalEnv] = useState(false);
  const {
    supabase,
    session,
    loading: authLoading,
    error: supabaseError,
    clearError,
  } = useSupabaseAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const accessToken = session?.access_token ?? null;
  const canEdit = useMemo(
    () => Boolean(accessToken) || localBypassActive,
    [accessToken, localBypassActive],
  );

  useEffect(() => {
    if (supabaseError) {
      setAuthError(supabaseError);
    }
  }, [supabaseError]);

  useEffect(() => {
    if (session) {
      setAuthError(null);
      clearError();
    }
  }, [session, clearError]);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hostname = window.location.hostname;
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    const isLocal = localHosts.has(hostname);
    setIsLocalEnv(isLocal);
    if (isLocal) {
      const stored = window.localStorage.getItem("overwatch-local-bypass");
      if (stored === "1") {
        setLocalBypassActive(true);
      }
    }
    try {
      const raw = window.localStorage.getItem(OVERWATCH_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredOverwatchState | ScoreState;
      const storedState =
        parsed && typeof parsed === "object" && "state" in parsed
          ? (parsed as StoredOverwatchState).state
          : parsed;
      if (isScoreState(storedState)) {
        setState(storedState);
        setHadLocalSnapshot(true);
      }
    } catch (error) {
      console.warn("Failed to load Overwatch state from localStorage", error);
    } finally {
      setHydratedFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hydratedFromStorage) return;
    let cancelled = false;
    const headers: HeadersInit | undefined = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const options = headers ? { headers } : undefined;
    fetch("/api/state", options)
      .then((r) => r.json())
      .then((s: ScoreState) => {
        if (cancelled) return;
        setState((prev) => (prev ? prev : s));
      })
      .catch((error) => {
        console.warn("Failed to fetch Overwatch state", error);
      });
    return () => {
      cancelled = true;
    };
  }, [hydratedFromStorage, accessToken]);

  useEffect(() => {
    if (!state || typeof window === "undefined") return;
    if (!hydratedFromStorage && !hadLocalSnapshot) return;
    try {
      const payload: StoredOverwatchState = {
        version: 1,
        savedAt: new Date().toISOString(),
        state,
      };
      window.localStorage.setItem(
        OVERWATCH_STORAGE_KEY,
        JSON.stringify(payload),
      );
      setHadLocalSnapshot(true);
    } catch (error) {
      console.warn("Failed to save Overwatch state to localStorage", error);
    }
  }, [state, hydratedFromStorage, hadLocalSnapshot]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setGameTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Don't auto-start timer based on gameActive - only when user clicks Start Game

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!state?.gameActive) return;

      // Left player shortcuts (Q/W for primary, A/S for secondary, Z/X for CP)
      if (e.key === "q") nudge("left", "primary", 1);
      if (e.key === "Q") nudge("left", "primary", -1);
      if (e.key === "a") nudge("left", "secondary", 1);
      if (e.key === "A") nudge("left", "secondary", -1);
      if (e.key === "z") nudge("left", "commandPoints", 1);
      if (e.key === "Z") nudge("left", "commandPoints", -1);

      // Right player shortcuts (I/O for primary, K/L for secondary, ,/. for CP)
      if (e.key === "i") nudge("right", "primary", 1);
      if (e.key === "I") nudge("right", "primary", -1);
      if (e.key === "k") nudge("right", "secondary", 1);
      if (e.key === "K") nudge("right", "secondary", -1);
      if (e.key === ",") nudge("right", "commandPoints", 1);
      if (e.key === "<") nudge("right", "commandPoints", -1);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [state?.gameActive]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setAuthError(
        "Supabase client unavailable. Check environment configuration.",
      );
      return;
    }

    setAuthError(null);
    clearError();
    setAuthSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setAuthError(error.message);
        return;
      }
      setPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign-in failed");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } finally {
      setAuthError(null);
      clearError();
      setPassword("");
    }
  };

  const update = useCallback(
    async (patch: Partial<ScoreState>) => {
      if (!accessToken && !localBypassActive) {
        setAuthError("Active Supabase session required to update scores.");
        return;
      }
      setSaving(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }
        if (localBypassActive) {
          headers["X-Local-Bypass"] = "1";
        }
        const res = await fetch("/api/state", {
          method: "POST",
          headers,
          body: JSON.stringify(patch),
        });
        if (res.status === 401 || res.status === 403) {
          setAuthError("You are not authorized to modify the game state.");
          return;
        }
        if (!res.ok) {
          throw new Error(`State update failed with status ${res.status}`);
        }
        const s = (await res.json()) as ScoreState;
        setState(s);
        setAuthError(null);
        clearError();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("Failed to update game state", error);
        setAuthError(message);
      } finally {
        setSaving(false);
      }
    },
    [accessToken, clearError, localBypassActive],
  );

  const nudge = (
    side: "left" | "right",
    key: "primary" | "secondary" | "commandPoints",
    delta: number,
  ) => {
    const curr = (state?.[side] as any)?.[key] ?? 0;
    const next = Math.max(0, curr + delta);
    update({ [side]: { [key]: next } } as any);
  };

  const onFactionChange =
    (side: "left" | "right") => (e: React.ChangeEvent<HTMLSelectElement>) => {
      update({ [side]: { faction: e.target.value as Faction } } as any);
    };

  const NAMES = ["Anthony", "Randy", "Scott", "Tim"] as const;
  type Name = (typeof NAMES)[number];
  const onNameChange =
    (side: "left" | "right") => (e: React.ChangeEvent<HTMLSelectElement>) => {
      const name = e.target.value as Name;
      // Default faction mapping based on selected name
      const defaultFaction: Record<Name, Faction> = {
        Tim: "Ultramarines",
        Scott: "Adeptus Custodes",
        Randy: "Chaos Marines",
        Anthony: "Necrons",
      };
      update({ [side]: { name, faction: defaultFaction[name] } } as any);
    };

  const onNumberChange =
    (side: "left" | "right" | "battleRound", key?: keyof ScoreState["left"]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value || 0);
      if (side === "battleRound") {
        update({ battleRound: Math.max(1, val) });
      } else if (key) {
        update({ [side]: { [key]: Math.max(0, val) } } as any);
      }
    };

  const handleToggleGame = () => {
    if (!state) return;
    if (!canEdit) {
      setAuthError("You must be signed in to manage the game state.");
      return;
    }
    const nextActive = !state.gameActive;
    if (nextActive) {
      setGameTimer(0);
      setTimerRunning(true);
      void update({
        gameActive: true,
        phase: "Command",
        left: { commandPoints: state.left.commandPoints + 1 } as any,
        right: { commandPoints: state.right.commandPoints + 1 } as any,
      });
    } else {
      setTimerRunning(false);
      void update({ gameActive: false });
    }
  };

  const handleResetTimer = () => {
    setGameTimer(0);
    setTimerRunning(false);
  };

  const handleResetGame = async () => {
    if (!canEdit) {
      setAuthError("You must be signed in to reset the game state.");
      return;
    }
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(
            "Reset game data? This clears all scores and configuration.",
          );
    if (!confirmed) return;
    setSaving(true);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(OVERWATCH_STORAGE_KEY);
      }
      const fresh = createDefaultScoreState();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      if (localBypassActive) {
        headers["X-Local-Bypass"] = "1";
      }
      const res = await fetch("/api/state", {
        method: "POST",
        headers,
        body: JSON.stringify(fresh),
      });
      if (res.status === 401 || res.status === 403) {
        setAuthError("You are not authorized to reset the game state.");
        return;
      }
      if (!res.ok) {
        throw new Error(`Reset failed with status ${res.status}`);
      }
      const s = (await res.json()) as ScoreState;
      setState(s);
      setGameTimer(0);
      setTimerRunning(false);
      setHadLocalSnapshot(false);
      setAuthError(null);
      clearError();
    } catch (error) {
      console.warn("Failed to reset game", error);
      setAuthError(
        error instanceof Error ? error.message : "Failed to reset game",
      );
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ side }: { side: "left" | "right" }) => {
    const d = state?.[side];
    const faction = d?.faction || FACTIONS[0];
    const f = faction;
    const theme = THEMES[faction];
    const detachmentList = d?.faction ? DETACHMENTS[d.faction] || [] : [];
    const locked = state ? !state.gameActive : true;
    const selectionDisabled = editingDisabled;
    const scoringDisabled = editingDisabled || locked;
    const victory =
      d?.victoryPoints ?? (d ? (d.primary || 0) + (d.secondary || 0) : 0);
    return (
      <div className="flex-1 space-y-4">
        {/* Settings Card */}
        <Card
          className={`border ${theme.plateBorder} relative overflow-hidden`}
          style={{
            backgroundColor:
              f === "Ultramarines"
                ? "rgba(59, 130, 246, 0.03)"
                : f === "Adeptus Custodes"
                  ? "rgba(251, 191, 36, 0.03)"
                  : f === "Chaos Marines"
                    ? "rgba(239, 68, 68, 0.03)"
                    : f === "Necrons"
                      ? "rgba(16, 185, 129, 0.03)"
                      : f === "Tyranids"
                        ? "rgba(168, 85, 247, 0.03)"
                        : "rgba(23, 23, 23, 0.5)",
          }}
        >
          {/* Faction watermark */}
          {f && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden pr-6">
              <FactionIcon
                src={iconPathForFaction(f)}
                className="w-32 h-32 text-white/5"
              />
            </div>
          )}
          {/* Bottom hazard stripe - outside of card content */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-2 ${theme.accentHazard} [background-image:repeating-linear-gradient(45deg,#f59e0b_0_12px,#111827_12px_24px)]`}
          />
          <CardContent className="p-4 relative pb-6">
            <div className="w-2/3 flex justify-between">
              {/* Left Column: Name + Detachment stacked */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                    Player Name
                  </Label>
                  <Select
                    value={(d?.name as string) || undefined}
                    onValueChange={(v) => {
                      const name = v as Name;
                      const defaultFaction: Record<Name, Faction> = {
                        Tim: "Ultramarines",
                        Scott: "Adeptus Custodes",
                        Randy: "Chaos Marines",
                        Anthony: "Necrons",
                      };
                      update({
                        [side]: { name, faction: defaultFaction[name] },
                      } as any);
                    }}
                    disabled={selectionDisabled}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select player…" />
                    </SelectTrigger>
                    <SelectContent>
                      {NAMES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                    Detachment
                  </Label>
                  <div
                    className={
                      !d?.faction ? "opacity-50 pointer-events-none" : ""
                    }
                  >
                    <Select
                      value={(d?.detachment as string) || undefined}
                      onValueChange={(v) =>
                        update({ [side]: { detachment: v } } as any)
                      }
                      disabled={selectionDisabled || !d?.faction}
                    >
                      <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select detachment…" />
                      </SelectTrigger>
                      <SelectContent>
                        {detachmentList.map((opt) => (
                          <SelectItem key={opt.name} value={opt.name}>
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!d?.faction && (
                    <p className="text-xs text-yellow-400/80">
                      Select a faction first
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Faction + Secondary stacked */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                    Faction
                  </Label>
                  <Select
                    value={(d?.faction as string) || undefined}
                    onValueChange={(v) =>
                      update({ [side]: { faction: v as Faction } } as any)
                    }
                    disabled={selectionDisabled}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select faction…" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACTIONS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                    Secondary Objective
                  </Label>
                  <Select
                    value={(d?.currentSecondary as string) || undefined}
                    onValueChange={(v) =>
                      update({ [side]: { currentSecondary: v } } as any)
                    }
                    disabled={selectionDisabled}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select secondary…" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIXED_SECONDARIES_2025.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Card */}
        <Card
          className={`border ${theme.plateBorder} relative overflow-hidden`}
          style={{
            backgroundColor:
              f === "Ultramarines"
                ? "rgba(59, 130, 246, 0.03)"
                : f === "Adeptus Custodes"
                  ? "rgba(251, 191, 36, 0.03)"
                  : f === "Chaos Marines"
                    ? "rgba(239, 68, 68, 0.03)"
                    : f === "Necrons"
                      ? "rgba(16, 185, 129, 0.03)"
                      : f === "Tyranids"
                        ? "rgba(168, 85, 247, 0.03)"
                        : "rgba(23, 23, 23, 0.5)",
          }}
        >
          {/* Bottom hazard stripe - outside of card content */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-2 ${theme.accentHazard} [background-image:repeating-linear-gradient(45deg,#f59e0b_0_12px,#111827_12px_24px)]`}
          />
          <CardHeader className="border-b border-white/15 px-4 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black tracking-[0.20em] text-white font-rajdhani uppercase">
                Scoring
              </h3>
              <div className="text-2xl font-bold text-white">
                <span className="text-sm text-gray-400 font-rajdhani tracking-[0.12em] uppercase mr-2">
                  Victory Points
                </span>
                <span
                  className={`inline-block min-w-8 text-right font-orbitron font-black ${victory >= 30 ? "text-green-400" : victory >= 20 ? "text-yellow-400" : "text-white"}`}
                >
                  {victory}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 relative pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ValueStepper
                label="Primary"
                value={d?.primary ?? 0}
                onDec={() => nudge(side, "primary", -1)}
                onInc={() => nudge(side, "primary", +1)}
                disabled={scoringDisabled}
                buttonClassName={`bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
              />
              <ValueStepper
                label="Secondary"
                value={d?.secondary ?? 0}
                onDec={() => nudge(side, "secondary", -1)}
                onInc={() => nudge(side, "secondary", +1)}
                disabled={scoringDisabled}
                buttonClassName={`bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
              />
              <ValueStepper
                label="Command Points"
                value={d?.commandPoints ?? 0}
                onDec={() => nudge(side, "commandPoints", -1)}
                onInc={() => nudge(side, "commandPoints", +1)}
                disabled={scoringDisabled}
                buttonClassName={`bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Removed in-page timer/roster to match original Commander layout */}
      </div>
    );
  };

  const handleAdvancePhase = () => {
    if (!state || !state.gameActive) return;
    if (!canEdit) {
      setAuthError("You must be signed in to advance phases.");
      return;
    }
    const currentPhase = state.phase as Phase | undefined;
    const currentIndex = currentPhase ? PHASES.indexOf(currentPhase) : -1;
    const normalizedIndex = currentIndex >= 0 ? currentIndex : 0;
    const wrapping = normalizedIndex === PHASES.length - 1;
    const nextIndex = wrapping ? 0 : normalizedIndex + 1;
    const nextPhase = PHASES[nextIndex];

    const patch: Partial<ScoreState> = { phase: nextPhase };
    if (wrapping) {
      patch.battleRound = (state.battleRound ?? 1) + 1;
    }
    if (nextPhase === "Command") {
      patch.left = { commandPoints: state.left.commandPoints + 1 } as any;
      patch.right = { commandPoints: state.right.commandPoints + 1 } as any;
    }

    void update(patch);
  };

  const editingDisabled = !canEdit;

  const headerDescription = localBypassActive
    ? "Local bypass active. Scores update without Supabase while running on localhost."
    : session
      ? "Authenticated operator. You may update the Overwatch console."
      : "Sign in with an operator account to access the Overwatch console.";

  const shouldShowSetupWarning = !supabase && !session && !localBypassActive;
  const shouldShowSessionInfo = session && !localBypassActive;
  const shouldShowForm =
    !session && !localBypassActive && !authLoading && Boolean(supabase);
  const shouldShowContent = Boolean(
    authError ||
      shouldShowSetupWarning ||
      shouldShowSessionInfo ||
      authLoading ||
      shouldShowForm,
  );

  const authPanel = (
    <Card
      className={`bg-white/5 border-white/10 backdrop-blur-sm py-0! ${
        session || localBypassActive ? "w-full" : ""
      }`}
    >
      <CardHeader className="">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white font-rajdhani tracking-[0.18em] uppercase">
            Operator Access
          </h2>
          {/* <p className="text-[11px] text-gray-300/70 mt-1"> */}
          {/* {headerDescription} */}
          {/* </p> */}
          {localBypassActive ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem("overwatch-local-bypass");
                }
                setLocalBypassActive(false);
                setAuthError(null);
                clearError();
              }}
              className="border-white/30 text-emerald-100 hover:bg-white/10 hover:text-white"
            >
              Disable local bypass
            </Button>
          ) : session ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={authSubmitting}
              className="border-white/30 text-emerald-100 hover:bg-white/10 hover:text-white"
            >
              Sign out
            </Button>
          ) : null}
        </div>
      </CardHeader>
      {shouldShowContent && (
        <CardContent className="space-y-3 px-4 pb-4 text-sm">
          {authError && (
            <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {authError}
            </div>
          )}
          {shouldShowSetupWarning ? (
            <div className="space-y-3">
              <p className="text-sm text-yellow-200/90">
                Supabase client is not configured. Provide{" "}
                <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
                to enable authentication.
              </p>
              {isLocalEnv && (
                <button
                  type="button"
                  className="text-xs font-semibold tracking-[0.18em] uppercase text-emerald-300 hover:text-emerald-200"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(
                        "overwatch-local-bypass",
                        "1",
                      );
                    }
                    setLocalBypassActive(true);
                    setAuthError(null);
                    clearError();
                  }}
                >
                  Bypass authentication (local only)
                </button>
              )}
            </div>
          ) : shouldShowSessionInfo ? (
            <div className="space-y-1 text-sm">
              <div>
                <p className="font-medium text-white">
                  {session?.user?.email ?? "Signed in"}
                </p>
                <p className="text-xs text-gray-400">
                  You may update the Overwatch console.
                </p>
              </div>
            </div>
          ) : authLoading ? (
            <p className="text-sm text-gray-300">Checking Supabase session…</p>
          ) : shouldShowForm ? (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="space-y-1 text-sm">
                <Label
                  htmlFor="overwatch-email"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300"
                >
                  Email
                </Label>
                <Input
                  id="overwatch-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => {
                    setAuthError(null);
                    clearError();
                  }}
                  required
                  autoComplete="email"
                  disabled={authSubmitting}
                  className="bg-white/5 text-white placeholder:text-gray-400 border-white/20"
                />
              </div>
              <div className="space-y-1 text-sm">
                <Label
                  htmlFor="overwatch-password"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300"
                >
                  Password
                </Label>
                <Input
                  id="overwatch-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => {
                    setAuthError(null);
                    clearError();
                  }}
                  required
                  autoComplete="current-password"
                  disabled={authSubmitting}
                  className="bg-white/5 text-white placeholder:text-gray-400 border-white/20"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={authSubmitting || !email || !password}
              >
                {authSubmitting ? "Signing in…" : "Sign in"}
              </Button>
              <p className="text-xs text-gray-400">
                Only approved operator accounts can change scores. Contact the
                admin if you need access.
              </p>
              {isLocalEnv && (
                <button
                  type="button"
                  className="text-xs font-semibold tracking-[0.18em] uppercase text-emerald-300 hover:text-emerald-200"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(
                        "overwatch-local-bypass",
                        "1",
                      );
                    }
                    setLocalBypassActive(true);
                    setAuthError(null);
                    clearError();
                  }}
                >
                  Bypass authentication (local only)
                </button>
              )}
            </form>
          ) : null}
        </CardContent>
      )}
    </Card>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] text-white">
        <p className="text-sm tracking-[0.18em] uppercase text-gray-300">
          Checking credentials…
        </p>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] p-4">
        <div className="w-full max-w-md">{authPanel}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-[#0b0d10]">
      <div className="max-w-7xl mx-auto p-4">
        <div
          className={`mb-6 ${session || localBypassActive ? "" : "max-w-xl"}`}
        >
          {authPanel}
        </div>
        <header className="mb-6">
          <div className="grid grid-cols-3 items-center">
            <div className="justify-self-start">
              <h1 className="text-2xl font-black tracking-[0.25em] font-orbitron text-white">
                OVERWATCH
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant={state?.gameActive ? "secondary" : "default"}
                  size="sm"
                  onClick={handleToggleGame}
                  className="h-9 px-3 flex items-center gap-1"
                  title={state?.gameActive ? "Stop Game" : "Start Game"}
                  disabled={editingDisabled || saving}
                >
                  {state?.gameActive ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>{state?.gameActive ? "Stop Game" : "Start Game"}</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleResetGame}
                  className="h-9 px-3 flex items-center gap-1"
                  title="Clear scores and configuration"
                  disabled={editingDisabled || saving}
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span>Reset Game</span>
                </Button>
                <div className="ml-2 text-lg text-gray-400 font-orbitron">
                  {formatTime(gameTimer)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetTimer}
                  className="h-9 px-3 flex items-center gap-1"
                  title="Reset timer for current game"
                  disabled={editingDisabled}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset Timer</span>
                </Button>
              </div>
            </div>

            {/* Center column: Round, centered */}
            <div className="justify-self-center flex flex-col items-center text-center gap-2">
              <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                Round
              </Label>
              <div className="h-16 w-48 flex items-center justify-center rounded border border-white/20 bg-white/5 font-orbitron text-4xl tracking-[0.25em] text-white">
                {(state?.battleRound ?? 1).toString().padStart(2, "0")}
              </div>
            </div>

            {/* Right column: Phase, right-aligned */}
            <div className="justify-self-end flex flex-col items-end gap-2 text-right">
              <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                Phase
              </Label>
              <div className="flex items-center gap-3">
                <div className="min-w-40 rounded border border-white/20 bg-white/5 px-3 py-2 font-orbitron text-sm uppercase tracking-[0.18em] text-white">
                  {(state?.phase as Phase) ?? "Command"}
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAdvancePhase}
                  className="h-9 px-3 flex items-center gap-1"
                  title="Advance to the next phase"
                  disabled={!state?.gameActive || editingDisabled || saving}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>Next Phase</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {editingDisabled && (
          <p className="mb-6 rounded border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            Viewing live data. Sign in above to unlock editing controls.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section side="left" />
          <Section side="right" />
        </div>

        <div
          className={`mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 ${editingDisabled ? "pointer-events-none opacity-60" : ""}`}
        >
          <RosterManager
            side="left"
            faction={(state?.left.faction as any) || undefined}
          />
          <RosterManager
            side="right"
            faction={(state?.right.faction as any) || undefined}
          />
        </div>
      </div>
    </div>
  );
}
