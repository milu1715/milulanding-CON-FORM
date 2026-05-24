import type { RecommendedAction } from "@/types/strategy";
import { cn } from "@/lib/utils/cn";
import { ArrowUp, ArrowDown, MinusCircle, PlusCircle, Pause, Play, RefreshCw, Wrench, AlertTriangle, ChevronRight } from "lucide-react";

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bid_increase: ArrowUp,
  bid_decrease: ArrowDown,
  budget_increase: ArrowUp,
  budget_decrease: ArrowDown,
  add_negative_keyword: MinusCircle,
  add_keyword: PlusCircle,
  change_match_type: RefreshCw,
  pause_campaign: Pause,
  enable_campaign: Play,
  restructure: Wrench,
  general: ChevronRight,
};

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Critica",
  high: "Alta",
  medium: "Media",
  low: "Bassa",
};

const EFFECT_STYLES: Record<string, string> = {
  positive: "text-emerald-400",
  neutral: "text-[var(--muted-foreground)]",
  risk: "text-amber-400",
};

interface Props {
  action: RecommendedAction;
  index: number;
}

export function ActionItem({ action, index }: Props) {
  const Icon = ACTION_ICONS[action.actionType] ?? ChevronRight;

  return (
    <div className={cn(
      "p-4 rounded-xl border bg-[var(--card)] space-y-3 transition-all",
      action.priority === "critical" ? "border-red-500/30" :
      action.priority === "high" ? "border-orange-500/30" :
      "border-[var(--border)]"
    )}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-[var(--secondary)] flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--muted-foreground)]">#{index + 1}</span>
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", PRIORITY_STYLES[action.priority])}>
              {PRIORITY_LABELS[action.priority]}
            </span>
            {action.estimatedEffect === "risk" && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                <AlertTriangle className="w-3 h-3" /> Attenzione
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-[var(--foreground)]">{action.target}</p>
          {(action.currentValue || action.recommendedValue) && (
            <div className="flex items-center gap-2 text-xs">
              {action.currentValue && <span className="text-[var(--muted-foreground)]">Attuale: <span className="text-[var(--foreground)]">{action.currentValue}</span></span>}
              {action.currentValue && action.recommendedValue && <ChevronRight className="w-3 h-3 text-[var(--muted-foreground)]" />}
              {action.recommendedValue && <span className="text-[var(--muted-foreground)]">Target: <span className="text-emerald-400 font-medium">{action.recommendedValue}</span></span>}
            </div>
          )}
        </div>
      </div>

      <div className="pl-10 space-y-2">
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{action.reasoning}</p>
        <p className={cn("text-xs font-medium", EFFECT_STYLES[action.estimatedEffect])}>
          Impatto atteso: {action.expectedImpact}
        </p>
      </div>
    </div>
  );
}
