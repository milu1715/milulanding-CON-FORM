"use client";

import { Upload, BarChart2, Euro, ShoppingCart, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { useReports } from "@/hooks/useReports";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { KeywordRankingTable } from "@/components/dashboard/KeywordRankingTable";
import { ReportTypeBadge } from "@/components/upload/ReportTypeBadge";
import { formatCurrency, formatPercent, formatNumber, formatDate } from "@/lib/utils/formatters";

export default function DashboardPage() {
  const { reports, latestReport, isLoading } = useReports();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
      </div>
    );
  }

  if (!latestReport) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
          <BarChart2 className="w-8 h-8 text-[var(--muted-foreground)]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Nessun Report Caricato</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Carica il tuo primo report CSV per iniziare ad analizzare le performance.
          </p>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          Carica Report
        </Link>
      </div>
    );
  }

  const { aggregates, rows, reportType, dateRange } = latestReport;
  const hasOrganicRank = reports.some((r) => r.reportType === "helium10_rank");
  const hasKeywordData = rows.some((r) => r.keywordText || r.customerSearchTerm);

  const allRows = reportType === "helium10_rank" ? [] : rows;

  return (
    <div className="space-y-6">
      {/* Report info */}
      <div className="flex items-center gap-3 flex-wrap">
        <ReportTypeBadge type={reportType} />
        <span className="text-xs text-[var(--muted-foreground)]">
          {latestReport.fileName}
          {dateRange && ` · ${formatDate(dateRange.from)} → ${formatDate(dateRange.to)}`}
        </span>
        {reports.length > 1 && (
          <span className="text-xs text-[var(--muted-foreground)]">
            · +{reports.length - 1} altri report
          </span>
        )}
      </div>

      {/* KPI Cards */}
      {reportType !== "helium10_rank" && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Spesa Totale"
            value={formatCurrency(aggregates.totalSpend)}
            icon={Euro}
            variant="default"
          />
          <MetricCard
            label="Vendite Totali"
            value={formatCurrency(aggregates.totalSales)}
            icon={Euro}
            variant="positive"
          />
          <MetricCard
            label="ACOS Medio"
            value={formatPercent(aggregates.avgAcos)}
            icon={BarChart2}
            variant={aggregates.avgAcos > 0.4 ? "danger" : aggregates.avgAcos > 0.25 ? "warning" : "positive"}
          />
          <MetricCard
            label="ROAS Medio"
            value={`${aggregates.avgRoas.toFixed(2)}x`}
            icon={BarChart2}
            variant={aggregates.avgRoas < 2 ? "danger" : aggregates.avgRoas > 4 ? "positive" : "warning"}
          />
          <MetricCard
            label="Ordini Totali"
            value={formatNumber(aggregates.totalOrders)}
            icon={ShoppingCart}
            subValue={`${formatNumber(aggregates.totalClicks)} click`}
            variant="default"
          />
        </div>
      )}

      {/* Click metric row if helium10 */}
      {reportType === "helium10_rank" && (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Report Helium 10 — Rank Organico</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {formatNumber(latestReport.rowCount)} keyword tracciate
              {dateRange && ` · ${formatDate(dateRange.from)} → ${formatDate(dateRange.to)}`}
            </p>
          </div>
        </div>
      )}

      {/* Time Series Chart */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2 mb-4">
          <MousePointerClick className="w-4 h-4 text-[var(--muted-foreground)]" />
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Andamento nel Tempo</h2>
        </div>
        <TimeSeriesChart data={aggregates.timeSeries} hasOrganicRank={hasOrganicRank} />
      </div>

      {/* Campaign Table + Top Performers */}
      {allRows.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Performance Campagne</h2>
            </div>
            <CampaignTable rows={allRows} />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <TopPerformers rows={allRows} />
          </div>
        </div>
      )}

      {/* Keyword tables */}
      {hasKeywordData && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Analisi Keyword</h2>
          <KeywordRankingTable rows={allRows} />
        </div>
      )}
    </div>
  );
}
