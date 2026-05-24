import type { ParsedReport, NormalizedRow } from "@/types/reports";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";

function topN<T>(arr: T[], key: (v: T) => number, n: number, desc = true): T[] {
  return [...arr].sort((a, b) => desc ? key(b) - key(a) : key(a) - key(b)).slice(0, n);
}

function aggregateCampaigns(rows: NormalizedRow[]) {
  const map = new Map<string, { spend: number; sales: number; orders: number; clicks: number; impressions: number }>();
  for (const row of rows) {
    const name = row.campaignName ?? "—";
    const e = map.get(name) ?? { spend: 0, sales: 0, orders: 0, clicks: 0, impressions: 0 };
    e.spend += row.spend ?? 0;
    e.sales += row.sales ?? 0;
    e.orders += row.orders ?? 0;
    e.clicks += row.clicks ?? 0;
    e.impressions += row.impressions ?? 0;
    map.set(name, e);
  }
  return Array.from(map.entries()).map(([name, v]) => ({
    name, ...v,
    acos: v.sales > 0 ? v.spend / v.sales : Infinity,
    roas: v.spend > 0 ? v.sales / v.spend : 0,
  }));
}

function aggregateKeywords(rows: NormalizedRow[]) {
  const map = new Map<string, { spend: number; sales: number; orders: number; clicks: number; matchType?: string }>();
  for (const row of rows) {
    const key = row.keywordText ?? row.customerSearchTerm;
    if (!key) continue;
    const e = map.get(key) ?? { spend: 0, sales: 0, orders: 0, clicks: 0, matchType: row.matchType };
    e.spend += row.spend ?? 0;
    e.sales += row.sales ?? 0;
    e.orders += row.orders ?? 0;
    e.clicks += row.clicks ?? 0;
    map.set(key, e);
  }
  return Array.from(map.entries()).map(([keyword, v]) => ({
    keyword, ...v,
    acos: v.sales > 0 ? v.spend / v.sales : Infinity,
    roas: v.spend > 0 ? v.sales / v.spend : 0,
  }));
}

export function buildReportSummary(report: ParsedReport): string {
  const { aggregates, rows, reportType, dateRange, fileName } = report;

  if (reportType === "helium10_rank") {
    const keywords = rows.slice(0, 20).map(r => `  - "${r.keywordText}": rank organico ${r.organicRank ?? "?"}, rank sponsorizzato ${r.sponsoredRank ?? "?"}`);
    return `REPORT: Helium 10 Organic Rank Tracker
File: ${fileName}
Periodo: ${dateRange?.from ?? "?"} → ${dateRange?.to ?? "?"}
Keyword tracciate: ${report.rowCount}

TOP KEYWORD PER RANK:
${keywords.join("\n")}`;
  }

  const campaigns = aggregateCampaigns(rows);
  const keywords = aggregateKeywords(rows);

  const topCampaigns = topN(campaigns, (c) => c.spend, 5);
  const bottomCampaigns = topN(campaigns.filter(c => c.spend > 5), (c) => c.roas, 5, false);
  const highWasteKeywords = keywords.filter(k => k.acos > 0.8 && k.spend > 3).slice(0, 8);
  const topKeywords = topN(keywords.filter(k => k.orders > 0), (k) => k.roas, 8);

  const lines: string[] = [
    `REPORT AMAZON ADS — SOMMARIO`,
    `Tipo: ${reportType === "campaign" ? "Sponsored Products Campaign" : reportType === "search_term" ? "Search Terms" : reportType === "keyword" ? "Keyword" : "ASIN/Prodotto"}`,
    `File: ${fileName}`,
    `Periodo: ${dateRange?.from ?? "?"} → ${dateRange?.to ?? "?"}`,
    `Righe dati: ${report.rowCount}`,
    ``,
    `METRICHE AGGREGATE:`,
    `  Spesa totale: ${formatCurrency(aggregates.totalSpend)}`,
    `  Vendite totali: ${formatCurrency(aggregates.totalSales)}`,
    `  Ordini totali: ${aggregates.totalOrders}`,
    `  Click totali: ${aggregates.totalClicks}`,
    `  Impression totali: ${aggregates.totalImpressions.toLocaleString()}`,
    `  ACOS medio: ${formatPercent(aggregates.avgAcos)}`,
    `  ROAS medio: ${aggregates.avgRoas.toFixed(2)}x`,
    `  CTR medio: ${formatPercent(aggregates.avgCtr)}`,
    `  CPC medio: ${formatCurrency(aggregates.avgCpc)}`,
    `  Campagne attive: ${aggregates.campaignCount}`,
    ``,
    `TOP 5 CAMPAGNE PER SPESA:`,
    ...topCampaigns.map((c, i) =>
      `  ${i + 1}. "${c.name}" — Spesa: ${formatCurrency(c.spend)}, Vendite: ${formatCurrency(c.sales)}, ACOS: ${formatPercent(c.acos)}, ROAS: ${c.roas.toFixed(2)}x, Ordini: ${c.orders}`
    ),
  ];

  if (bottomCampaigns.length > 0) {
    lines.push(``, `BOTTOM 5 CAMPAGNE PER ROAS (potenziali sprechi):`);
    bottomCampaigns.forEach((c, i) => {
      lines.push(`  ${i + 1}. "${c.name}" — Spesa: ${formatCurrency(c.spend)}, Vendite: ${formatCurrency(c.sales)}, ACOS: ${c.acos === Infinity ? "∞" : formatPercent(c.acos)}, ROAS: ${c.roas.toFixed(2)}x, Ordini: ${c.orders}`);
    });
  }

  if (highWasteKeywords.length > 0) {
    lines.push(``, `KEYWORD AD ALTO SPRECO (ACOS > 80%, spesa > €3):`);
    highWasteKeywords.forEach(k => {
      lines.push(`  - "${k.keyword}" (${k.matchType ?? "?"}) — Spesa: ${formatCurrency(k.spend)}, Ordini: ${k.orders}, ACOS: ${k.acos === Infinity ? "nessuna vendita" : formatPercent(k.acos)}`);
    });
  }

  if (topKeywords.length > 0) {
    lines.push(``, `TOP KEYWORD PER CONVERSIONI:`);
    topKeywords.forEach(k => {
      lines.push(`  - "${k.keyword}" — ROAS: ${k.roas.toFixed(2)}x, Ordini: ${k.orders}, Spesa: ${formatCurrency(k.spend)}`);
    });
  }

  return lines.join("\n");
}
