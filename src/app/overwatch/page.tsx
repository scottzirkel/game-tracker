"use client";

import { useEffect, useState } from "react";
import { FACTIONS, Faction, THEMES } from "@/lib/factions";
import { DETACHMENTS } from "@/lib/detachments";
import type { ScoreState } from "@/lib/scoreStore";
import { FIXED_SECONDARIES_2025 } from "@/lib/secondaries";
import { iconPathForFaction } from "@/lib/iconMap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Pause, Square, RotateCcw } from "lucide-react";
import RosterManager from "@/components/RosterManager";
import ValueStepper from "@/components/ValueStepper";

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
  const PHASES = ["Command", "Movement", "Shooting", "Charge", "Fight"] as const;

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((s) => setState(s));
  }, []);

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

  const update = async (patch: Partial<ScoreState>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const s = await res.json();
      setState(s);
    } finally {
      setSaving(false);
    }
  };

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

  const Section = ({ side }: { side: "left" | "right" }) => {
    const d = state?.[side];
    const faction = d?.faction || FACTIONS[0];
    const f = faction;
    const theme = THEMES[faction];
    const detachmentList = d?.faction ? DETACHMENTS[d.faction] || [] : [];
    const locked = state ? !state.gameActive : true;
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
                  >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
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
                    >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
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
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
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
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
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
          <CardContent className="p-6 relative pb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-[0.20em] text-white font-rajdhani uppercase">
                Scoring
              </h3>
              <div className="text-2xl font-bold text-white">
                <span
                  className={`font-orbitron font-black ${victory >= 30 ? "text-green-400" : victory >= 20 ? "text-yellow-400" : "text-white"}`}
                >
                  {victory}
                </span>
                <span className="text-sm text-gray-400 font-rajdhani tracking-[0.12em] uppercase ml-2">
                  Victory Points
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ValueStepper
                label="Primary"
                value={d?.primary ?? 0}
                onDec={() => nudge(side, "primary", -1)}
                onInc={() => nudge(side, "primary", +1)}
                disabled={locked}
                buttonClassName={`bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
              />
              <ValueStepper
                label="Secondary"
                value={d?.secondary ?? 0}
                onDec={() => nudge(side, "secondary", -1)}
                onInc={() => nudge(side, "secondary", +1)}
                disabled={locked}
                buttonClassName={`bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
              />
              <ValueStepper
                label="Command Points"
                value={d?.commandPoints ?? 0}
                onDec={() => nudge(side, "commandPoints", -1)}
                onInc={() => nudge(side, "commandPoints", +1)}
                disabled={locked}
                buttonClassName={`bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Removed in-page timer/roster to match original Commander layout */}
      </div>
    );
  };

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="min-h-screen text-white bg-[#0b0d10]">
      <div className="max-w-7xl mx-auto p-4">
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-[0.25em] font-orbitron text-white">
                OVERWATCH
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimerRunning((r) => !r)}
                  className="h-9 w-9 p-0"
                  title={timerRunning ? "Pause" : "Start"}
                >
                  {timerRunning ? <Pause className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                </Button>
                <Button
                  variant={state?.gameActive ? "secondary" : "default"}
                  size="sm"
                  onClick={() => update({ gameActive: !state?.gameActive })}
                  className="h-9 w-9 p-0"
                  title={state?.gameActive ? "Stop Game" : "Start Game"}
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGameTimer(0);
                    setTimerRunning(false);
                  }}
                  className="h-9 w-9 p-0"
                  title="Reset Timer"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <div className="ml-2 text-sm text-gray-400 font-orbitron">
                  {formatTime(gameTimer)}
                </div>
              </div>
            </div>
            <div className="flex items-end gap-4">
              <ValueStepper
                label="Round"
                value={state?.battleRound ?? 1}
                onDec={() => update({ battleRound: Math.max(1, (state?.battleRound ?? 1) - 1) })}
                onInc={() => update({ battleRound: (state?.battleRound ?? 1) + 1 })}
              />
              <div className="text-gray-400 font-rajdhani tracking-[0.15em] uppercase ml-4">
                Phase
              </div>
              <Select
                value={(state?.phase as string) || undefined}
                onValueChange={(v) => update({ phase: v } as any)}
              >
                <SelectTrigger className="min-w-40 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select phase…" />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section side="left" />
          <Section side="right" />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <RosterManager side="left" faction={(state?.left.faction as any) || undefined} />
          <RosterManager side="right" faction={(state?.right.faction as any) || undefined} />
        </div>
      </div>
    </div>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
