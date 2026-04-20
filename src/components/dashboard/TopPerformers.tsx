import type { NormalizedRow } from "@/types/reports";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";

function aggregateByCampaign(rows: NormalizedRow[]) {
  const map = new Map<string, { spend: number; sales: number; orders: number }>();
  for (const row of rows) {
    const name = row.campaignName ?? "—";
    const e = map.get(name) ?? { spend: 0, sales: 0, orders: 0 };
    e.spend += row.spend ?? 0;
    e.sales += row.sales ?? 0;
    e.orders += row.orders ?? 0;
    map.set(name, e);
  }
  return Array.from(map.entries())
    .filter(([, v]) => v.spend > 0)
    .map(([name, v]) => ({ name, ...v, roas: v.spend > 0 ? v.sales / v.spend : 0, acos: v.sales > 0 ? v.spend / v.sales : 0 }))
    .sort((a, b) => b.roas - a.roas);
}

export function TopPerformers({ rows }: { rows: NormalizedRow[] }) {
  const campaigns = aggregateByCampaign(rows);
  const top = campaigns.slice(0, 5);
  const bottom = [...campaigns].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Top 5 per ROAS</h3>
        </div>
        <div className="space-y-2">
          {top.map((c) => (
            <div key={c.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--secondary)]">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--foreground)] truncate">{c.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {formatCurrency(c.spend)} · ACOS {formatPercent(c.acos)}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap">{c.roas.toFixed(2)}x</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Bottom 5 per ROAS</h3>
        </div>
        <div className="space-y-2">
          {bottom.map((c) => (
            <div key={c.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--secondary)]">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--foreground)] truncate">{c.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {formatCurrency(c.spend)} · ACOS {formatPercent(c.acos)}
                </p>
              </div>
              <span className="text-xs font-semibold text-rose-400 whitespace-nowrap">{c.roas.toFixed(2)}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
