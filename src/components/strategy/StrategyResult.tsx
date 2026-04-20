"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ChevronRight, Save } from "lucide-react";
import type { GeneratedStrategy, StrategyGoal } from "@/types/strategy";
import { ActionItem } from "./ActionItem";
import { streamStrategy, parseStrategyJson } from "@/lib/api-client";

interface Props {
  reportId: string;
  goal: StrategyGoal;
  customGoalText?: string;
  reportSummary: string;
  decisions: import("@/types/decisions").DecisionEntry[];
  targetMetrics?: { acos?: number; roas?: number };
  onSave: (strategy: GeneratedStrategy) => void;
  onSaveToDecisionLog: (strategy: GeneratedStrategy) => void;
}

export function StrategyResult({
  reportId, goal, customGoalText, reportSummary, decisions,
  targetMetrics, onSave, onSaveToDecisionLog,
}: Props) {
  const [streamText, setStreamText] = useState("");
  const [strategy, setStrategy] = useState<GeneratedStrategy | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIsStreaming(true);
    setStreamText("");
    setStrategy(null);
    setError(null);
    setSaved(false);

    let accumulated = "";

    const cancel = streamStrategy(
      { reportSummary, goal, customGoalText, decisionHistory: decisions.slice(0, 5), targetMetrics },
      (chunk) => {
        accumulated += chunk;
        setStreamText(accumulated);
      },
      (fullText) => {
        setIsStreaming(false);
        try {
          const finalStrategy = parseStrategyJson(fullText, reportId, goal, customGoalText);
          setStrategy(finalStrategy);
          onSave(finalStrategy);
        } catch {
          setError("Impossibile interpretare la risposta dell'IA. Riprova.");
        }
      },
      (err) => {
        setIsStreaming(false);
        setError(err);
      }
    );

    cancelRef.current = cancel;
    return () => cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (isStreaming && !strategy) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <Sparkles className="w-5 h-5 text-[var(--primary)] animate-pulse" />
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Claude sta analizzando i dati…</p>
            <p className="text-xs text-[var(--muted-foreground)]">Generazione strategia in corso</p>
          </div>
        </div>
        {streamText && (
          <pre className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)] overflow-auto max-h-48 font-mono whitespace-pre-wrap">
            {streamText}
          </pre>
        )}
      </div>
    );
  }

  if (!strategy) return null;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="p-5 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-semibold text-[var(--foreground)]">Sintesi Strategica</span>
        </div>
        <p className="text-sm text-[var(--foreground)] leading-relaxed">{strategy.summary}</p>
      </div>

      {/* Next move highlight */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
        <ChevronRight className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">Prossima Mossa Immediata</p>
          <p className="text-sm text-[var(--foreground)]">{strategy.nextMove}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Azioni Consigliate ({strategy.actions.length})
        </h3>
        {strategy.actions.map((action, i) => (
          <ActionItem key={action.id} action={action} index={i} />
        ))}
      </div>

      {/* Save button */}
      {!saved && (
        <button
          onClick={() => { onSaveToDecisionLog(strategy); setSaved(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          Salva Azioni nel Decision Log
        </button>
      )}
      {saved && (
        <p className="text-sm text-emerald-400 font-medium">✓ Azioni salvate nel Decision Log</p>
      )}
    </div>
  );
}
