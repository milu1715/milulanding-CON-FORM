"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesPoint } from "@/types/reports";
import { formatShortDate, formatCurrency, formatPercent, formatNumber } from "@/lib/utils/formatters";

type MetricKey = "spend" | "sales" | "acos" | "roas" | "clicks" | "impressions" | "organicRank";

interface MetricConfig {
  label: string;
  color: string;
  format: (v: number) => string;
}

const METRICS: Record<MetricKey, MetricConfig> = {
  spend: { label: "Spesa", color: "#3b82f6", format: formatCurrency },
  sales: { label: "Vendite", color: "#22c55e", format: formatCurrency },
  acos: { label: "ACOS", color: "#f59e0b", format: (v) => formatPercent(v) },
  roas: { label: "ROAS", color: "#a855f7", format: (v) => `${v.toFixed(2)}x` },
  clicks: { label: "Click", color: "#06b6d4", format: (v) => formatNumber(v) },
  impressions: { label: "Impression", color: "#64748b", format: (v) => formatNumber(v) },
  organicRank: { label: "Rank Organico", color: "#f43f5e", format: (v) => `#${Math.round(v)}` },
};

interface Props {
  data: TimeSeriesPoint[];
  hasOrganicRank?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, activeMetric }: any) {
  if (!active || !payload?.length) return null;
  const config = METRICS[activeMetric as MetricKey];
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-[var(--muted-foreground)] mb-1">{formatShortDate(label)}</p>
      <p className="text-sm font-semibold text-[var(--foreground)]">
        {config.format(payload[0]?.value ?? 0)}
      </p>
    </div>
  );
}

export function TimeSeriesChart({ data, hasOrganicRank }: Props) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("spend");
  const availableMetrics = Object.entries(METRICS).filter(
    ([key]) => key !== "organicRank" || hasOrganicRank
  ) as [MetricKey, MetricConfig][];

  const config = METRICS[activeMetric];

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[var(--muted-foreground)] text-sm">
        Nessun dato temporale disponibile.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metric tabs */}
      <div className="flex flex-wrap gap-1">
        {availableMetrics.map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setActiveMetric(key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeMetric === key
                ? "text-white"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--secondary)]"
            }`}
            style={activeMetric === key ? { backgroundColor: cfg.color } : {}}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatShortDate}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => config.format(v).replace(".", ",")}
            width={60}
          />
          <Tooltip content={<CustomTooltip activeMetric={activeMetric} />} />
          <Area
            type="monotone"
            dataKey={activeMetric}
            stroke={config.color}
            strokeWidth={2}
            fill="url(#colorGradient)"
            dot={false}
            activeDot={{ r: 4, fill: config.color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
