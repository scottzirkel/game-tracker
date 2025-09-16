import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-radial-[at_50%_40%] from-[#343d4c] to-[#0b0d10]">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:12px_12px]" />
      <div className="absolute top-0 left-0 right-0 h-3 z-20 [background-image:repeating-linear-gradient(45deg,#f59e0b_0_16px,#111827_16px_32px)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 z-10 [background-image:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.08),rgba(255,255,255,0.08)_1px,transparent_1px,transparent_4px)] [background-size:100%_4px] animate-[scan_6s_linear_infinite]" />

      <main className="relative z-30 flex flex-col items-center justify-center h-full px-6 py-16 text-center gap-12">
        <header className="space-y-4">
          <p className="text-sm tracking-[0.55em] text-white/70 font-rajdhani uppercase">
            Warhammer 40,000 Command Console
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] uppercase">
            Choose Your Station
          </h1>
          <p className="text-base md:text-lg text-white/70 tracking-[0.18em] uppercase">
            Jump into the live tools that power your tabletop battles.
          </p>
        </header>

        <div className="w-full max-w-xl space-y-6">
          <Link
            href="/overwatch"
            className="group relative block overflow-hidden rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-10 py-8 text-left uppercase transition-all duration-200 hover:border-emerald-300/80 hover:bg-emerald-500/20"
          >
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <div className="relative z-10 flex items-center justify-between gap-6">
              <div>
                <div className="text-xs tracking-[0.4em] text-emerald-200/70 font-rajdhani">
                  OPERATIONS HUB
                </div>
                <div className="mt-2 text-3xl font-black tracking-[0.2em]">
                  Overwatch
                </div>
                <p className="mt-3 text-sm text-white/70 tracking-[0.22em] font-rajdhani">
                  Manage rosters, scoring, and live game state.
                </p>
              </div>
              <ChevronRight className="h-8 w-8 text-emerald-200/70 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-100" />
            </div>
          </Link>

          <Link
            href="/scoreboard"
            className="group relative block overflow-hidden rounded-lg border border-sky-400/30 bg-sky-500/10 px-10 py-8 text-left uppercase transition-all duration-200 hover:border-sky-300/80 hover:bg-sky-500/20"
          >
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-sky-400/15 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <div className="relative z-10 flex items-center justify-between gap-6">
              <div>
                <div className="text-xs tracking-[0.4em] text-sky-200/70 font-rajdhani">
                  BROADCAST DECK
                </div>
                <div className="mt-2 text-3xl font-black tracking-[0.2em]">
                  Scoreboard
                </div>
                <p className="mt-3 text-sm text-white/70 tracking-[0.22em] font-rajdhani">
                  Project the round, faction themes, and live totals.
                </p>
              </div>
              <ChevronRight className="h-8 w-8 text-sky-200/70 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-sky-100" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
