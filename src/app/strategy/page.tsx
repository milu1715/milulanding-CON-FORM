"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Sparkles, FileText, ChevronDown } from "lucide-react";
import Link from "next/link";
import { GoalSelector } from "@/components/strategy/GoalSelector";
import { StrategyResult } from "@/components/strategy/StrategyResult";
import { useReports } from "@/hooks/useReports";
import { useDecisions } from "@/hooks/useDecisions";
import { useStrategies } from "@/hooks/useStrategies";
import { buildReportSummary } from "@/lib/ai/summarize";
import type { StrategyGoal, GeneratedStrategy } from "@/types/strategy";
import { formatDate } from "@/lib/utils/formatters";
import { ReportTypeBadge } from "@/components/upload/ReportTypeBadge";

export default function StrategyPage() {
  const { reports, isLoading: reportsLoading } = useReports();
  const { decisions, addDecision } = useDecisions();
  const { saveStrategy } = useStrategies();

  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [goal, setGoal] = useState<StrategyGoal | null>(null);
  const [customText, setCustomText] = useState("");
  const [targetAcos, setTargetAcos] = useState("");
  const [targetRoas, setTargetRoas] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationKey, setGenerationKey] = useState(0);

  const selectedReport = reports.find((r) => r.id === selectedReportId) ?? reports[0];

  const handleGenerate = () => {
    if (!goal || !selectedReport) return;
    setIsGenerating(true);
    setGenerationKey((k) => k + 1);
  };

  const handleSaveStrategy = async (strategy: GeneratedStrategy) => {
    await saveStrategy(strategy);
  };

  const handleSaveToDecisionLog = async (strategy: GeneratedStrategy) => {
    for (const action of strategy.actions) {
      await addDecision({
        title: action.target,
        description: action.reasoning,
        actionType: action.actionType,
        target: action.target,
        reasoning: action.reasoning,
        expectedOutcome: action.expectedImpact,
        status: "planned",
        linkedStrategyId: strategy.id,
        linkedReportId: strategy.reportId,
      });
    }
  };

  if (reportsLoading) {
    return <div className="h-40 bg-[var(--card)] rounded-xl animate-pulse" />;
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[60vh] text-center">
        <FileText className="w-12 h-12 text-[var(--muted-foreground)]" />
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Nessun Report Disponibile</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Carica prima un report CSV da Amazon Ads per generare una strategia.
          </p>
        </div>
        <Link href="/upload" className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90">
          Carica Report
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Report selector */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          1. Seleziona Report da Analizzare
        </h2>
        <div className="relative">
          <select
            value={selectedReportId || selectedReport?.id || ""}
            onChange={(e) => setSelectedReportId(e.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] appearance-none focus:outline-none focus:border-[var(--primary)]"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fileName} · {r.dateRange ? `${formatDate(r.dateRange.from)} → ${formatDate(r.dateRange.to)}` : "nessuna data"}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
        </div>
        {selectedReport && (
          <div className="flex items-center gap-2">
            <ReportTypeBadge type={selectedReport.reportType} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {selectedReport.rowCount} righe
            </span>
          </div>
        )}
      </section>

      {/* Goal selector */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          2. Scegli il Tuo Obiettivo
        </h2>
        <GoalSelector
          selected={goal}
          onSelect={setGoal}
          customText={customText}
          onCustomTextChange={setCustomText}
        />
      </section>

      {/* Optional target metrics */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          3. Target Metriche (opzionale)
        </h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">ACOS Target (%)</label>
            <input
              type="number"
              min="0"
              max="200"
              value={targetAcos}
              onChange={(e) => setTargetAcos(e.target.value)}
              placeholder="es: 25"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">ROAS Target (x)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={targetRoas}
              onChange={(e) => setTargetRoas(e.target.value)}
              placeholder="es: 4.0"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </section>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!goal || !selectedReport || isGenerating}
        className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        <Sparkles className="w-4 h-4" />
        {isGenerating ? "Generazione in corso…" : "Genera Strategia con Claude AI"}
      </button>

      {/* Result */}
      {isGenerating && selectedReport && goal && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Strategia Generata
          </h2>
          <StrategyResult
            key={generationKey}
            reportId={selectedReport.id}
            goal={goal}
            customGoalText={customText || undefined}
            reportSummary={buildReportSummary(selectedReport)}
            decisions={decisions}
            targetMetrics={{
              acos: targetAcos ? parseFloat(targetAcos) / 100 : undefined,
              roas: targetRoas ? parseFloat(targetRoas) : undefined,
            }}
            onSave={handleSaveStrategy}
            onSaveToDecisionLog={handleSaveToDecisionLog}
          />
        </section>
      )}
    </div>
  );
}
