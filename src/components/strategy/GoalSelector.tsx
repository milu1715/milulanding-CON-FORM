"use client";

import { TrendingUp, Rocket, Target, Scissors, Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { STRATEGY_GOALS } from "@/lib/ai/prompts";
import type { StrategyGoal } from "@/types/strategy";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp, Rocket, Target, Scissors, Eye, Pencil,
};

const COLOR_MAP: Record<string, string> = {
  emerald: "border-emerald-500/50 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400",
  blue: "border-blue-500/50 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400",
  purple: "border-purple-500/50 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400",
  amber: "border-amber-500/50 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400",
  rose: "border-rose-500/50 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400",
  slate: "border-slate-500/50 hover:border-slate-500 bg-slate-500/5 hover:bg-slate-500/10 text-slate-400",
};

const ACTIVE_COLOR_MAP: Record<string, string> = {
  emerald: "border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/50",
  blue: "border-blue-500 bg-blue-500/15 ring-1 ring-blue-500/50",
  purple: "border-purple-500 bg-purple-500/15 ring-1 ring-purple-500/50",
  amber: "border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/50",
  rose: "border-rose-500 bg-rose-500/15 ring-1 ring-rose-500/50",
  slate: "border-slate-400 bg-slate-500/15 ring-1 ring-slate-400/50",
};

interface Props {
  selected: StrategyGoal | null;
  onSelect: (goal: StrategyGoal) => void;
  customText: string;
  onCustomTextChange: (text: string) => void;
}

export function GoalSelector({ selected, onSelect, customText, onCustomTextChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {STRATEGY_GOALS.map((goal) => {
          const Icon = ICON_MAP[goal.icon] ?? TrendingUp;
          const isActive = selected === goal.id;
          return (
            <button
              key={goal.id}
              onClick={() => onSelect(goal.id)}
              className={cn(
                "flex flex-col gap-2 p-4 rounded-xl border text-left transition-all",
                isActive ? ACTIVE_COLOR_MAP[goal.color] : COLOR_MAP[goal.color]
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", isActive ? "" : "")} />
                <span className="text-sm font-semibold text-[var(--foreground)]">{goal.labelIT}</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{goal.description}</p>
            </button>
          );
        })}
      </div>

      {selected === "custom" && (
        <textarea
          value={customText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder="Descrivi il tuo obiettivo specifico... es: 'Voglio portare l'ACOS sotto il 20% entro 30 giorni mantenendo almeno 50 ordini al mese'"
          className="w-full h-24 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] resize-none"
        />
      )}
    </div>
  );
}
