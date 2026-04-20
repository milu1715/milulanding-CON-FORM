"use client";

import { useState } from "react";
import { Trash2, FileText } from "lucide-react";
import { DropZone } from "@/components/upload/DropZone";
import { ReportTypeBadge } from "@/components/upload/ReportTypeBadge";
import { useReports } from "@/hooks/useReports";
import type { ParsedReport } from "@/types/reports";
import { formatDate, formatNumber } from "@/lib/utils/formatters";

export default function UploadPage() {
  const { reports, isLoading, refresh, deleteReport } = useReports();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSaved = (report: ParsedReport) => {
    void report;
    refresh();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteReport(id);
    setDeleting(null);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Carica Nuovo Report
        </h2>
        <DropZone onSaved={handleSaved} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Report Salvati ({reports.length})
        </h2>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-[var(--card)] animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && reports.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <FileText className="w-8 h-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">Nessun report caricato ancora.</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Carica il tuo primo CSV da Amazon Ads o Helium 10 qui sopra.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]"
            >
              <FileText className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">
                    {report.fileName}
                  </span>
                  <ReportTypeBadge type={report.reportType} />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {formatNumber(report.rowCount)} righe ·{" "}
                  {report.dateRange
                    ? `${formatDate(report.dateRange.from)} → ${formatDate(report.dateRange.to)}`
                    : "nessuna data"}
                  {" · "}Caricato il {formatDate(report.uploadedAt)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(report.id)}
                disabled={deleting === report.id}
                className="p-1.5 rounded text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
