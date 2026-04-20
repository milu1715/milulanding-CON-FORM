"use client";

import type { ParsedReport } from "@/types/reports";
import { ReportTypeBadge } from "./ReportTypeBadge";
import { formatCurrency, formatPercent, formatNumber, formatDate } from "@/lib/utils/formatters";

interface Props {
  report: ParsedReport;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ReportPreview({ report, onConfirm, onCancel, isSaving }: Props) {
  const { aggregates, rows, reportType } = report;
  const previewRows = rows.slice(0, 10);
  const headers = previewRows.length > 0 ? Object.keys(previewRows[0]).filter((k) => previewRows[0][k as keyof typeof previewRows[0]] !== undefined) : [];

  return (
    <div className="space-y-4">
      {/* Detected info */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--foreground)]">{report.fileName}</span>
            <ReportTypeBadge type={reportType} />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            {formatNumber(report.rowCount)} righe
            {report.dateRange && ` · ${formatDate(report.dateRange.from)} → ${formatDate(report.dateRange.to)}`}
          </p>
        </div>
      </div>

      {/* Aggregates */}
      {aggregates.totalSpend > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Spesa Totale", value: formatCurrency(aggregates.totalSpend) },
            { label: "Vendite Totali", value: formatCurrency(aggregates.totalSales) },
            { label: "ACOS Medio", value: formatPercent(aggregates.avgAcos) },
            { label: "ROAS Medio", value: `${aggregates.avgRoas.toFixed(2)}x` },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
              <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Preview table */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">
            ANTEPRIMA (prime {previewRows.length} righe)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[var(--muted-foreground)] font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]">
                  {headers.map((h) => (
                    <td key={h} className="px-3 py-2 text-[var(--foreground)] whitespace-nowrap">
                      {String(row[h as keyof typeof row] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={isSaving}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSaving ? "Salvataggio…" : "Conferma e Salva"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
