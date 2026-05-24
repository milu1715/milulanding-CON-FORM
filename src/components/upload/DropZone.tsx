"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { parseReport } from "@/lib/parsers";
import { saveReport } from "@/lib/storage/reports";
import type { ParsedReport } from "@/types/reports";
import { ReportPreview } from "./ReportPreview";

interface Props {
  onSaved: (report: ParsedReport) => void;
}

export function DropZone({ onSaved }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedReport | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setError("Seleziona un file CSV valido.");
      return;
    }
    setError(null);
    setIsParsing(true);
    try {
      const report = await parseReport(file);
      setParsed(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel parsing del file.");
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  const handleConfirm = async () => {
    if (!parsed) return;
    setIsSaving(true);
    try {
      await saveReport(parsed);
      onSaved(parsed);
      setParsed(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  if (parsed) {
    return (
      <ReportPreview
        report={parsed}
        onConfirm={handleConfirm}
        onCancel={() => setParsed(null)}
        isSaving={isSaving}
      />
    );
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor="csv-upload"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-12 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
          isDragging
            ? "border-[var(--primary)] bg-blue-500/10"
            : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--secondary)]"
        )}
      >
        {isParsing ? (
          <>
            <div className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--muted-foreground)]">Analisi del file in corso…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">
                Trascina il file CSV qui
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                oppure <span className="text-[var(--primary)]">clicca per selezionarlo</span>
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              {["Campagne SP", "Search Terms", "Keyword", "ASIN", "Helium 10"].map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded bg-[var(--secondary)] text-[var(--muted-foreground)]">
                  {t}
                </span>
              ))}
            </div>
          </>
        )}
      </label>
      <input id="csv-upload" type="file" accept=".csv,text/csv" className="sr-only" onChange={handleInput} />

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)]">
        <FileText className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 shrink-0" />
        <p className="text-xs text-[var(--muted-foreground)]">
          Supportati: report Sponsored Products, Search Terms, Keyword, ASIN e Helium 10 Rank Tracker.
          Il tipo viene rilevato automaticamente dalle colonne del CSV.
        </p>
      </div>
    </div>
  );
}
