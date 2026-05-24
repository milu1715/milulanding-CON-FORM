import type { NormalizedRow } from "@/types/reports";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

function aggregateKeywords(rows: NormalizedRow[]) {
  const map = new Map<string, { spend: number; sales: number; orders: number; clicks: number }>();
  for (const row of rows) {
    const key = row.keywordText ?? row.customerSearchTerm;
    if (!key) continue;
    const e = map.get(key) ?? { spend: 0, sales: 0, orders: 0, clicks: 0 };
    e.spend += row.spend ?? 0;
    e.sales += row.sales ?? 0;
    e.orders += row.orders ?? 0;
    e.clicks += row.clicks ?? 0;
    map.set(key, e);
  }
  return Array.from(map.entries())
    .filter(([, v]) => v.spend > 0)
    .map(([keyword, v]) => ({
      keyword,
      ...v,
      acos: v.sales > 0 ? v.spend / v.sales : Infinity,
      roas: v.spend > 0 ? v.sales / v.spend : 0,
      convRate: v.clicks > 0 ? v.orders / v.clicks : 0,
    }));
}

export function KeywordRankingTable({ rows }: { rows: NormalizedRow[] }) {
  const keywords = aggregateKeywords(rows);
  if (keywords.length === 0) return null;

  const topConverting = [...keywords].sort((a, b) => b.roas - a.roas).slice(0, 10);
  const highWaste = keywords
    .filter((k) => k.acos > 0.8 && k.spend > 5)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top converting */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Top Keyword per ROAS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-3 py-2 text-left text-[var(--muted-foreground)]">Keyword</th>
                <th className="px-3 py-2 text-right text-[var(--muted-foreground)]">Spesa</th>
                <th className="px-3 py-2 text-right text-[var(--muted-foreground)]">ROAS</th>
                <th className="px-3 py-2 text-right text-[var(--muted-foreground)]">Ordini</th>
              </tr>
            </thead>
            <tbody>
              {topConverting.map((k) => (
                <tr key={k.keyword} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]">
                  <td className="px-3 py-2 text-[var(--foreground)] max-w-[150px] truncate" title={k.keyword}>{k.keyword}</td>
                  <td className="px-3 py-2 text-right text-[var(--foreground)]">{formatCurrency(k.spend)}</td>
                  <td className="px-3 py-2 text-right text-emerald-400 font-medium">{k.roas.toFixed(2)}x</td>
                  <td className="px-3 py-2 text-right text-[var(--foreground)]">{k.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* High waste */}
      {highWaste.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            Keyword ad Alto Spreco (ACOS {">"} 80%)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 text-left text-[var(--muted-foreground)]">Keyword</th>
                  <th className="px-3 py-2 text-right text-[var(--muted-foreground)]">Spesa</th>
                  <th className="px-3 py-2 text-right text-[var(--muted-foreground)]">ACOS</th>
                  <th className="px-3 py-2 text-right text-[var(--muted-foreground)]">Ordini</th>
                </tr>
              </thead>
              <tbody>
                {highWaste.map((k) => (
                  <tr key={k.keyword} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]">
                    <td className="px-3 py-2 text-[var(--foreground)] max-w-[150px] truncate" title={k.keyword}>{k.keyword}</td>
                    <td className="px-3 py-2 text-right text-[var(--foreground)]">{formatCurrency(k.spend)}</td>
                    <td className={cn("px-3 py-2 text-right font-medium", k.acos === Infinity ? "text-rose-400" : "text-rose-400")}>
                      {k.acos === Infinity ? "∞" : formatPercent(k.acos)}
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--foreground)]">{k.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
