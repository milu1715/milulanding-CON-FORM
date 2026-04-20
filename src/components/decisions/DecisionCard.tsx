"use client";

import { useState } from "react";
import { Pencil, Trash2, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import type { DecisionEntry, DecisionStatus } from "@/types/decisions";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/formatters";

const STATUS_CONFIG: Record<DecisionStatus, { label: string; color: string; dot: string }> = {
  planned: { label: "Pianificata", color: "text-slate-400 bg-slate-500/20 border-slate-500/30", dot: "bg-slate-400" },
  applied: { label: "Applicata", color: "text-blue-400 bg-blue-500/20 border-blue-500/30", dot: "bg-blue-400" },
  monitoring: { label: "In Monitoraggio", color: "text-amber-400 bg-amber-500/20 border-amber-500/30", dot: "bg-amber-400 animate-pulse" },
  evaluated: { label: "Valutata", color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30", dot: "bg-emerald-400" },
  abandoned: { label: "Abbandonata", color: "text-zinc-500 bg-zinc-500/20 border-zinc-500/30", dot: "bg-zinc-500" },
};

interface Props {
  decision: DecisionEntry;
  onUpdate: (id: string, patch: Partial<DecisionEntry>) => void;
  onDelete: (id: string) => void;
  onEvaluate: (decision: DecisionEntry) => void;
}

export function DecisionCard({ decision, onUpdate, onDelete, onEvaluate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[decision.status];

  const handleStatusChange = (status: DecisionStatus) => {
    const patch: Partial<DecisionEntry> = { status };
    if (status === "applied") patch.appliedAt = new Date().toISOString();
    onUpdate(decision.id, patch);
  };

  return (
    <div className={cn(
      "rounded-xl border bg-[var(--card)] overflow-hidden transition-all",
      decision.status === "abandoned" ? "opacity-60" : "",
      decision.status === "evaluated" ? "border-emerald-500/20" : "border-[var(--border)]"
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="flex flex-col items-center gap-1 mt-1">
          <div className={cn("w-2.5 h-2.5 rounded-full", cfg.dot)} />
          <div className="w-px flex-1 bg-[var(--border)]" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--foreground)]">{decision.title}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{decision.target}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cfg.color)}>
                {cfg.label}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {formatDate(decision.createdAt)}
              </span>
            </div>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{decision.description}</p>

          {/* Expected */}
          <div className="flex items-start gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--muted-foreground)] mt-0.5 shrink-0" />
            <span className="text-xs text-[var(--muted-foreground)]">
              Previsto: <span className="text-[var(--foreground)]">{decision.expectedOutcome}</span>
            </span>
          </div>

          {/* Actual outcome */}
          {decision.actualOutcome && (
            <div className="flex items-start gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-xs text-[var(--muted-foreground)]">
                Effettivo: <span className="text-emerald-400">{decision.actualOutcome}</span>
              </span>
            </div>
          )}

          {/* Delta metrics */}
          {decision.outcomeMetrics && (
            <div className="flex flex-wrap gap-3 pt-1">
              {decision.outcomeMetrics.acosDelta != null && (
                <span className={cn("text-xs font-medium", decision.outcomeMetrics.acosDelta < 0 ? "text-emerald-400" : "text-rose-400")}>
                  ACOS: {decision.outcomeMetrics.acosDelta > 0 ? "+" : ""}{(decision.outcomeMetrics.acosDelta * 100).toFixed(1)}%
                </span>
              )}
              {decision.outcomeMetrics.roasDelta != null && (
                <span className={cn("text-xs font-medium", decision.outcomeMetrics.roasDelta > 0 ? "text-emerald-400" : "text-rose-400")}>
                  ROAS: {decision.outcomeMetrics.roasDelta > 0 ? "+" : ""}{decision.outcomeMetrics.roasDelta.toFixed(2)}x
                </span>
              )}
              {decision.outcomeMetrics.salesDelta != null && (
                <span className={cn("text-xs font-medium", decision.outcomeMetrics.salesDelta > 0 ? "text-emerald-400" : "text-rose-400")}>
                  Vendite: {decision.outcomeMetrics.salesDelta > 0 ? "+" : ""}€{Math.abs(decision.outcomeMetrics.salesDelta).toFixed(0)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded reasoning */}
      {expanded && (
        <div className="px-4 pb-4 pl-10 space-y-2">
          <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Motivazione</p>
          <p className="text-xs text-[var(--foreground)] leading-relaxed">{decision.reasoning}</p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-4 pb-3 pl-10">
        <button onClick={() => setExpanded((e) => !e)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Nascondi" : "Dettagli"}
        </button>

        {/* Status transitions */}
        {decision.status === "planned" && (
          <button onClick={() => handleStatusChange("applied")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            → Segna Applicata
          </button>
        )}
        {decision.status === "applied" && (
          <button onClick={() => handleStatusChange("monitoring")} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
            → In Monitoraggio
          </button>
        )}
        {(decision.status === "monitoring" || decision.status === "applied") && (
          <button onClick={() => onEvaluate(decision)} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            Valuta Risultato
          </button>
        )}
        {decision.status !== "abandoned" && decision.status !== "evaluated" && (
          <button onClick={() => handleStatusChange("abandoned")} className="text-xs text-[var(--muted-foreground)] hover:text-zinc-400 transition-colors">
            Abbandona
          </button>
        )}

        <div className="flex-1" />

        <button onClick={() => onDelete(decision.id)} className="p-1 rounded text-[var(--muted-foreground)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
