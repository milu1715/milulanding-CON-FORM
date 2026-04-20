"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { DecisionEntry, OutcomeMetrics } from "@/types/decisions";

interface Props {
  decision: DecisionEntry;
  onSave: (id: string, patch: Partial<DecisionEntry>) => void;
  onClose: () => void;
}

export function OutcomeEvaluator({ decision, onSave, onClose }: Props) {
  const [actualOutcome, setActualOutcome] = useState(decision.actualOutcome ?? "");
  const [acosDelta, setAcosDelta] = useState(decision.outcomeMetrics?.acosDelta != null ? String(decision.outcomeMetrics.acosDelta * 100) : "");
  const [roasDelta, setRoasDelta] = useState(decision.outcomeMetrics?.roasDelta != null ? String(decision.outcomeMetrics.roasDelta) : "");
  const [salesDelta, setSalesDelta] = useState(decision.outcomeMetrics?.salesDelta != null ? String(decision.outcomeMetrics.salesDelta) : "");

  const handleSave = () => {
    const metrics: OutcomeMetrics = {};
    if (acosDelta !== "") metrics.acosDelta = parseFloat(acosDelta) / 100;
    if (roasDelta !== "") metrics.roasDelta = parseFloat(roasDelta);
    if (salesDelta !== "") metrics.salesDelta = parseFloat(salesDelta);

    onSave(decision.id, {
      actualOutcome,
      status: "evaluated",
      evaluatedAt: new Date().toISOString(),
      outcomeMetrics: Object.keys(metrics).length > 0 ? metrics : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Valuta Risultato</h2>
          <button onClick={onClose} className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Context */}
          <div className="p-3 rounded-lg bg-[var(--secondary)] space-y-1">
            <p className="text-xs font-medium text-[var(--foreground)]">{decision.title}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Previsto: {decision.expectedOutcome}
            </p>
          </div>

          {/* Actual outcome */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Cosa è successo effettivamente?
            </label>
            <textarea
              value={actualOutcome}
              onChange={(e) => setActualOutcome(e.target.value)}
              rows={3}
              placeholder="es: L'ACOS è sceso dal 45% al 28% in 10 giorni, ordini aumentati del 20%"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>

          {/* Delta metrics */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">
              Variazione Metriche (opzionale)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1">Δ ACOS (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={acosDelta}
                  onChange={(e) => setAcosDelta(e.target.value)}
                  placeholder="-15"
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1">Δ ROAS (x)</label>
                <input
                  type="number"
                  step="0.01"
                  value={roasDelta}
                  onChange={(e) => setRoasDelta(e.target.value)}
                  placeholder="+1.2"
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] mb-1">Δ Vendite (€)</label>
                <input
                  type="number"
                  step="1"
                  value={salesDelta}
                  onChange={(e) => setSalesDelta(e.target.value)}
                  placeholder="+500"
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Salva Valutazione
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
