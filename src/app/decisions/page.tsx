"use client";

import { useState } from "react";
import { Plus, GitBranch, Sparkles, Loader2 } from "lucide-react";
import { useDecisions } from "@/hooks/useDecisions";
import { useReports } from "@/hooks/useReports";
import { DecisionCard } from "@/components/decisions/DecisionCard";
import { AddDecisionModal } from "@/components/decisions/AddDecisionModal";
import { OutcomeEvaluator } from "@/components/decisions/OutcomeEvaluator";
import type { DecisionEntry } from "@/types/decisions";
import { buildReportSummary } from "@/lib/ai/summarize";
import { fetchNextMove } from "@/lib/api-client";

interface NextMoveResult {
  nextMove: string;
  reasoning: string;
  expectedImpact: string;
  priority: string;
}

export default function DecisionsPage() {
  const { decisions, isLoading, addDecision, updateDecision, deleteDecision } = useDecisions();
  const { latestReport } = useReports();

  const [showAddModal, setShowAddModal] = useState(false);
  const [evaluating, setEvaluating] = useState<DecisionEntry | null>(null);
  const [nextMove, setNextMove] = useState<NextMoveResult | null>(null);
  const [loadingNextMove, setLoadingNextMove] = useState(false);
  const [filter, setFilter] = useState<DecisionEntry["status"] | "all">("all");

  const filtered = filter === "all" ? decisions : decisions.filter((d) => d.status === filter);

  const loadNextMove = async () => {
    if (!latestReport) return;
    setLoadingNextMove(true);
    try {
      const data = await fetchNextMove({
        reportSummary: buildReportSummary(latestReport),
        decisionHistory: decisions.slice(0, 8),
      });
      setNextMove(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNextMove(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Aggiungi Decisione
        </button>
        {latestReport && (
          <button
            onClick={loadNextMove}
            disabled={loadingNextMove}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors disabled:opacity-50"
          >
            {loadingNextMove ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Prossima Mossa IA
          </button>
        )}
      </div>

      {/* Next move card */}
      {nextMove && (
        <div className="p-5 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-semibold text-[var(--foreground)]">Prossima Mossa Consigliata da Claude</span>
          </div>
          <p className="text-sm text-[var(--foreground)]">{nextMove.nextMove}</p>
          {nextMove.reasoning && (
            <p className="text-xs text-[var(--muted-foreground)]">{nextMove.reasoning}</p>
          )}
          {nextMove.expectedImpact && (
            <p className="text-xs font-medium text-emerald-400">Impatto atteso: {nextMove.expectedImpact}</p>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {(["all", "planned", "applied", "monitoring", "evaluated", "abandoned"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === s
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--secondary)]"
            }`}
          >
            {s === "all" ? "Tutte" :
             s === "planned" ? "Pianificate" :
             s === "applied" ? "Applicate" :
             s === "monitoring" ? "Monitoraggio" :
             s === "evaluated" ? "Valutate" : "Abbandonate"}
            {s !== "all" && (
              <span className="ml-1 text-xs opacity-70">
                ({decisions.filter((d) => d.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty states */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && decisions.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <GitBranch className="w-10 h-10 text-[var(--muted-foreground)]" />
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Nessuna Decisione Registrata</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Vai su Strategia IA e genera un piano, oppure aggiungi manualmente le tue decisioni.
            </p>
          </div>
        </div>
      )}

      {!isLoading && decisions.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-center text-[var(--muted-foreground)] py-8">
          Nessuna decisione con stato "{filter}".
        </p>
      )}

      {/* Decision cards — vertical timeline */}
      {!isLoading && (
        <div className="space-y-3">
          {filtered.map((d) => (
            <DecisionCard
              key={d.id}
              decision={d}
              onUpdate={updateDecision}
              onDelete={deleteDecision}
              onEvaluate={setEvaluating}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddDecisionModal onAdd={addDecision} onClose={() => setShowAddModal(false)} />
      )}
      {evaluating && (
        <OutcomeEvaluator
          decision={evaluating}
          onSave={updateDecision}
          onClose={() => setEvaluating(null)}
        />
      )}
    </div>
  );
}
