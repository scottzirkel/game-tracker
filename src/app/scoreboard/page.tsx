"use client";

import { useEffect, useState } from "react";
import type { ScoreState } from "@/lib/scoreStore";
import { THEMES } from "@/lib/factions";
import { iconPathForFaction } from "@/lib/iconMap";
import type { Faction } from "@/lib/factions";

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

function iconOpacityClass(f: Faction) {
  // Slightly stronger on darker palettes; Custodes is brighter so a touch lighter
  switch (f) {
    case "Adeptus Custodes":
      return "opacity-60";
    default:
      return "opacity-70";
  }
}

function FactionTitle({
  name,
  align = "left",
}: {
  name: string;
  align?: "left" | "right";
}) {
  const parts = (name || "").split(" ");
  const isTwo = parts.length >= 2;
  const container =
    align === "right" ? "items-end text-right" : "items-start text-left";
  if (isTwo) {
    const first = parts[0];
    const rest = parts.slice(1).join(" ");
    return (
      <div
        className={`${container} flex flex-col justify-center w-56 md:w-72 min-h-[60px] md:min-h-[68px] uppercase`}
      >
        <div className="text-base md:text-lg font-bold tracking-[0.18em] opacity-90 leading-none">
          <p>{first}</p>
        </div>
        <div className="text-3xl md:text-4xl font-extrabold tracking-[0.14em] leading-none -mt-1">
          <p>{rest}</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`text-3xl md:text-4xl font-extrabold tracking-[0.16em] ${container} flex flex-col justify-center w-56 md:w-72 min-h-[60px] md:min-h-[68px] uppercase`}
    >
      <p>{name}</p>
    </div>
  );
}

export default function ScoreboardPage() {
  const [state, setState] = useState<ScoreState | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/state");
        const s = (await res.json()) as ScoreState;
        if (mounted) setState(s);
      } catch {}
      try {
        es = new EventSource("/api/stream");
        es.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data) as ScoreState;
            if (mounted) setState(data);
          } catch {}
        };
      } catch {}
    })();
    return () => {
      mounted = false;
      es?.close();
    };
  }, []);

  const leftFaction = state?.left.faction || "Ultramarines";
  const rightFaction = state?.right.faction || "Chaos Marines";
  const leftTheme = THEMES[leftFaction];
  const rightTheme = THEMES[rightFaction];

  return (
    <div className="h-screen text-white relative overflow-hidden bg-radial-[at_50%_40%] from-[#343d4c] to-[#0b0d10]">
      {/* Ambient grit/noise */}
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Corner vignettes removed */}

      {/* Top hazard bar */}
      <div className="absolute top-0 left-0 right-0 h-3 z-10 [background-image:repeating-linear-gradient(45deg,#f59e0b_0_16px,#111827_16px_32px)] opacity-60" />

      {/* Subtle scanlines overlay (raised z to ensure visibility) */}
      <div className="pointer-events-none absolute inset-0 z-30 [background-image:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.08),rgba(255,255,255,0.08)_1px,transparent_1px,transparent_4px)] [background-size:100%_4px] animate-[scan_6s_linear_infinite]" />

      {/* Half-screen clipped faction watermarks, centered in each half */}
      {state && (
        <>
          <div className="pointer-events-none fixed inset-y-0 left-0 w-1/2 blur-xs overflow-hidden z-0 grid place-items-center">
            <FactionIcon
              src={iconPathForFaction(leftFaction)}
              className="w-[75vh] h-[75vh] text-white/8"
            />
          </div>
          <div className="pointer-events-none fixed inset-y-0 right-0 w-1/2 blur-xs overflow-hidden z-0 grid place-items-center">
            <FactionIcon
              src={iconPathForFaction(rightFaction)}
              className="w-[75vh] h-[75vh] text-white/8"
            />
          </div>
        </>
      )}

      {/* Battle Round Plate */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 shadow-xl">
        <div className="px-8 py-3 bg-gradient-to-b from-[#1a1f23] to-[#0e1215] border border-white/15 text-center font-orbitron">
          <div className="text-[11px] tracking-[0.35em] text-gray-300">
            BATTLE
          </div>
          <div className="text-2xl font-black tracking-[0.25em] text-white">
            ROUND {state ? state.battleRound.toString().padStart(2, "0") : ""}
          </div>
          {state && (
            <div className="mt-2 inline-block px-3 py-1 bg-gray-200 text-gray-800 border border-black/20 text-[12px] md:text-sm tracking-[0.28em] uppercase font-rajdhani font-black">
              PHASE: {state.phase}
            </div>
          )}
        </div>
      </div>

      {/* No game active banner */}
      {state && !state.gameActive && (
        <div className="absolute inset-0 grid place-items-center z-20">
          <div className="text-sm md:text-base tracking-[0.3em] text-white/80 bg-black/40 border border-white/20 px-6 py-3">
            NO ACTIVE GAME
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="h-full w-full flex items-center justify-center p-6">
        <main className="w-full max-w-7xl uppercase">
          {/* Faction plates + VP */}
          <div className="flex items-stretch justify-between gap-8 mb-10">
            {/* Left faction plate */}
            <div className="flex-1">
              <div
                className={`relative w-full px-6 py-5 bg-gradient-to-r ${leftTheme.primaryFrom} ${leftTheme.primaryTo} ${leftTheme.primaryBorder} border font-rajdhani ${state?.left.faction === "Adeptus Custodes" ? "text-amber-950" : ""}`}
              >
                {/* prev Ultramarines plate border override: border-amber-300/70 */}
                {state?.left.faction === "Adeptus Custodes" && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-transparent opacity-30" />
                    <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white/25 to-transparent opacity-60" />
                  </div>
                )}
                {/* Removed green radial highlight to reduce visual noise */}
                <div className="relative flex items-center gap-3">
                  {state && (
                    <FactionIcon
                      src={iconPathForFaction(state.left.faction)}
                      className={`h-8 w-8 ${iconOpacityClass(state.left.faction)} text-current`}
                    />
                  )}
                  {/* prev Ultramarines title border: border border-amber-300/70 px-2 py-1 */}
                  <FactionTitle name={state?.left.faction || ""} align="left" />
                </div>
                <div
                  className={`relative mt-1 text-base md:text-lg font-bold tracking-[0.18em] opacity-90 uppercase ${state?.left.faction === "Adeptus Custodes" ? "text-amber-950" : "text-gray-100"}`}
                >
                  {state?.left.name || ""}
                </div>
                {/* Detachment shown beside PRIMARY label below */}
                {state?.left.enhancement ? (
                  <div className="relative text-[10px] mt-0.5 tracking-[0.2em] text-emerald-200/50">
                    {state.left.enhancement}
                  </div>
                ) : null}
                {/* CP chip integrated into plate */}
                <div className="relative mt-2 flex items-center gap-3 uppercase">
                  <span
                    className={`font-black tracking-[0.18em] font-rajdhani uppercase ${state?.left.faction === "Adeptus Custodes" ? "text-amber-950" : "text-gray-200/90"}`}
                  >
                    COMMAND POINTS
                  </span>
                  <span className="text-xl md:text-2xl font-extrabold font-orbitron">
                    {state?.left.commandPoints ?? 0}
                  </span>
                </div>
                {/* Decorative rivets removed */}
              </div>
            </div>

            {/* Central VP */}
            <div className="self-stretch flex items-stretch justify-center gap-12 font-orbitron">
              <div className="text-center flex flex-col">
                <div className="flex-1 flex items-center justify-center px-6 text-7xl leading-none font-black bg-gradient-to-b from-[#1c2126] to-[#0f1317] border border-white/15 shadow-inner font-orbitron min-w-[6rem]">
                  {(state?.left.victoryPoints ?? 0).toString().padStart(2, "0")}
                </div>
                <div className="mt-2 text-[11px] tracking-[0.3em] text-gray-300">
                  VICTORY POINTS
                </div>
              </div>
              <div className="text-center flex flex-col">
                <div className="flex-1 flex items-center justify-center px-6 text-7xl leading-none font-black bg-gradient-to-b from-[#1c2126] to-[#0f1317] border border-white/15 shadow-inner font-orbitron min-w-[6rem]">
                  {(state?.right.victoryPoints ?? 0)
                    .toString()
                    .padStart(2, "0")}
                </div>
                <div className="mt-2 text-[11px] tracking-[0.3em] text-gray-300">
                  VICTORY POINTS
                </div>
              </div>
            </div>

            {/* Right faction plate */}
            <div className="flex-1 text-right">
              <div
                className={`relative w-full px-6 py-5 bg-gradient-to-l ${rightTheme.primaryFrom} ${rightTheme.primaryTo} ${rightTheme.primaryBorder} border font-rajdhani ${state?.right.faction === "Adeptus Custodes" ? "text-amber-950" : ""}`}
              >
                {/* prev Ultramarines plate border override: border-amber-300/70 */}
                {state?.right.faction === "Adeptus Custodes" && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-bl from-white/25 via-white/10 to-transparent opacity-30" />
                    <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white/25 to-transparent opacity-60" />
                  </div>
                )}
                {/* Removed green radial highlight to reduce visual noise */}
                <div className="relative flex items-center justify-end gap-3">
                  {/* prev Ultramarines title border: border border-amber-300/70 px-2 py-1 */}
                  <FactionTitle
                    name={state?.right.faction || ""}
                    align="right"
                  />
                  {state && (
                    <FactionIcon
                      src={iconPathForFaction(state.right.faction)}
                      className={`h-8 w-8 ${iconOpacityClass(state.right.faction)} text-current`}
                    />
                  )}
                </div>
                <div
                  className={`relative mt-1 text-base md:text-lg font-bold tracking-[0.18em] opacity-90 uppercase ${state?.right.faction === "Adeptus Custodes" ? "text-amber-950" : "text-gray-100"}`}
                >
                  {state?.right.name || ""}
                </div>
                {/* Detachment shown beside PRIMARY label below */}
                {state?.right.enhancement ? (
                  <div className="relative text-[10px] mt-0.5 tracking-[0.2em] text-emerald-200/50">
                    {state.right.enhancement}
                  </div>
                ) : null}
                {/* CP chip integrated into plate */}
                <div className="relative mt-2 flex items-center justify-end gap-3 uppercase">
                  <span
                    className={`text-xl md:text-2xl font-extrabold font-orbitron ${state?.right.faction === "Adeptus Custodes" ? "text-amber-950" : ""}`}
                  >
                    {state?.right.commandPoints ?? 0}
                  </span>
                  <span
                    className={`font-black tracking-[0.18em] font-rajdhani uppercase ${state?.right.faction === "Adeptus Custodes" ? "text-amber-950" : "text-gray-200/90"}`}
                  >
                    COMMAND POINTS
                  </span>
                </div>
                {/* Decorative rivets removed */}
              </div>
            </div>
          </div>

          {/* Primary bar with detachment label */}
          <div className="flex items-stretch gap-5 mb-5">
            {/* Left half */}
            <div className="flex-1 relative">
              <div
                className={`w-full px-6 py-3 bg-gradient-to-r ${leftTheme.primaryFrom} ${leftTheme.primaryTo} ${leftTheme.primaryBorder} border flex flex-col gap-2 relative ${state?.left.faction === "Adeptus Custodes" ? "text-amber-950" : ""}`}
              >
                {state?.left.faction === "Adeptus Custodes" && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-transparent opacity-30" />
                    <div className="pointer-events-none absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white/25 to-transparent opacity-60" />
                  </>
                )}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-black tracking-[0.2em] font-rajdhani">
                      PRIMARY
                    </span>
                    {state?.left.detachment ? (
                      <span
                        className={`font-black tracking-[0.18em] font-rajdhani uppercase ${state?.left.faction === "Adeptus Custodes" ? "text-amber-950" : "text-gray-200/90"}`}
                      >
                        {state.left.detachment}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-2xl font-black font-orbitron">
                    {state?.left.primary ?? 0}
                  </div>
                </div>
              </div>
              <div
                className={`pointer-events-none absolute inset-x-0 -bottom-2 h-2 ${leftTheme.accentHazard} [background-image:repeating-linear-gradient(45deg,#f59e0b_0_12px,#111827_12px_24px)]`}
              />
            </div>
            {/* Right half */}
            <div className="flex-1 relative">
              <div
                className={`w-full px-6 py-3 bg-gradient-to-l ${rightTheme.primaryFrom} ${rightTheme.primaryTo} ${rightTheme.primaryBorder} border flex flex-col gap-2 relative ${state?.right.faction === "Adeptus Custodes" ? "text-amber-950" : ""}`}
              >
                {state?.right.faction === "Adeptus Custodes" && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-white/25 via-white/10 to-transparent opacity-30" />
                    <div className="pointer-events-none absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white/25 to-transparent opacity-60" />
                  </>
                )}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="text-2xl font-black font-orbitron">
                    {state?.right.primary ?? 0}
                  </div>
                  <div className="flex items-center gap-4">
                    {state?.right.detachment ? (
                      <span
                        className={`font-black tracking-[0.18em] font-rajdhani uppercase ${state?.right.faction === "Adeptus Custodes" ? "text-amber-950" : "text-gray-200/90"}`}
                      >
                        {state.right.detachment}
                      </span>
                    ) : null}
                    <span className="font-black tracking-[0.2em] font-rajdhani">
                      PRIMARY
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`pointer-events-none absolute inset-x-0 -bottom-2 h-2 ${rightTheme.accentHazard} [background-image:repeating-linear-gradient(45deg,#f59e0b_0_12px,#111827_12px_24px)]`}
              />
            </div>
          </div>

          {/* Secondary bar */}
          <div className="flex items-stretch gap-5">
            {/* Left half */}
            <div className="flex-1 relative">
              <div
                className={`w-full px-6 py-3 bg-gradient-to-r ${leftTheme.secondaryFrom} ${leftTheme.secondaryTo} ${leftTheme.secondaryBorder} border flex flex-col gap-2 relative`}
              >
                <div className="absolute inset-0 bg-white/5 opacity-10 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span className="font-black tracking-[0.2em] font-rajdhani uppercase">
                        SECONDARY
                      </span>
                      <span className="font-black tracking-[0.18em] text-gray-200/90 font-rajdhani uppercase">
                        {state?.left.currentSecondary || ""}
                      </span>
                    </div>
                    <div className="text-2xl font-black font-orbitron">
                      {state?.left.secondary ?? 0}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-2 opacity-40 [background-image:repeating-linear-gradient(45deg,#9ca3af_0_10px,#111827_10px_20px)]" />
            </div>
            {/* Right half */}
            <div className="flex-1 relative">
              <div
                className={`w-full px-6 py-3 bg-gradient-to-l ${rightTheme.secondaryFrom} ${rightTheme.secondaryTo} ${rightTheme.secondaryBorder} border flex flex-col gap-2 relative`}
              >
                <div className="absolute inset-0 bg-white/5 opacity-10 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-black font-orbitron">
                      {state?.right.secondary ?? 0}
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-black tracking-[0.18em] text-gray-200/90 font-rajdhani uppercase">
                        {state?.right.currentSecondary || ""}
                      </span>
                      <span className="font-black tracking-[0.2em] font-rajdhani uppercase">
                        SECONDARY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-2 opacity-40 [background-image:repeating-linear-gradient(45deg,#9ca3af_0_10px,#111827_10px_20px)]" />
            </div>
          </div>

          {/* Decorative bottom icons removed */}
        </main>
      </div>

      {/* Removed display-only overlay/tag */}
    </div>
  );
}
