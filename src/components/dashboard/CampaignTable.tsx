"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { NormalizedRow } from "@/types/reports";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface CampaignRow {
  name: string;
  spend: number;
  sales: number;
  acos: number;
  roas: number;
  clicks: number;
  impressions: number;
  orders: number;
}

function aggregateCampaigns(rows: NormalizedRow[]): CampaignRow[] {
  const map = new Map<string, CampaignRow>();
  for (const row of rows) {
    const name = row.campaignName ?? "—";
    const existing = map.get(name) ?? { name, spend: 0, sales: 0, acos: 0, roas: 0, clicks: 0, impressions: 0, orders: 0 };
    existing.spend += row.spend ?? 0;
    existing.sales += row.sales ?? 0;
    existing.clicks += row.clicks ?? 0;
    existing.impressions += row.impressions ?? 0;
    existing.orders += row.orders ?? 0;
    map.set(name, existing);
  }
  return Array.from(map.values()).map((r) => ({
    ...r,
    acos: r.sales > 0 ? r.spend / r.sales : 0,
    roas: r.spend > 0 ? r.sales / r.spend : 0,
  }));
}

type SortKey = keyof Omit<CampaignRow, "name">;

interface Props {
  rows: NormalizedRow[];
}

export function CampaignTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const campaigns = aggregateCampaigns(rows);
  const sorted = [...campaigns].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortDir === "desc" ? -diff : diff;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  function setDir(fn: (d: "asc" | "desc") => "asc" | "desc") {
    setSortDir((d) => fn(d));
  }

  const columns: { key: SortKey; label: string; format: (v: number) => string }[] = [
    { key: "spend", label: "Spesa", format: formatCurrency },
    { key: "sales", label: "Vendite", format: formatCurrency },
    { key: "acos", label: "ACOS", format: formatPercent },
    { key: "roas", label: "ROAS", format: (v) => `${v.toFixed(2)}x` },
    { key: "clicks", label: "Click", format: (v) => formatNumber(v) },
    { key: "orders", label: "Ordini", format: (v) => formatNumber(v) },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="px-3 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              Campagna
            </th>
            {columns.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="px-3 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider cursor-pointer hover:text-[var(--foreground)] whitespace-nowrap select-none"
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  {label}
                  {sortKey === key ? (
                    sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                  ) : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.name} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]">
              <td className="px-3 py-2.5 text-[var(--foreground)] max-w-[200px] truncate" title={c.name}>{c.name}</td>
              {columns.map(({ key, format }) => (
                <td key={key} className={cn(
                  "px-3 py-2.5 text-right tabular-nums",
                  key === "acos" && c.acos > 0.5 ? "text-rose-400" :
                  key === "acos" && c.acos < 0.2 ? "text-emerald-400" :
                  "text-[var(--foreground)]"
                )}>
                  {format(c[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="text-center py-8 text-sm text-[var(--muted-foreground)]">Nessun dato campagna.</p>
      )}
    </div>
  );
}
