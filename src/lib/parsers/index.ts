"use client";

import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import type { ParsedReport, ReportType, NormalizedRow, ReportAggregates, TimeSeriesPoint } from "@/types/reports";
import {
  CAMPAIGN_COLUMN_MAP,
  SEARCH_TERM_COLUMN_MAP,
  KEYWORD_COLUMN_MAP,
  PRODUCT_COLUMN_MAP,
  HELIUM10_COLUMN_MAP,
  coerceNumeric,
} from "./columnMaps";

const NUMERIC_FIELDS = new Set<keyof NormalizedRow>([
  "bid", "impressions", "clicks", "ctr", "cpc", "spend", "sales",
  "orders", "acos", "roas", "units", "ntbOrders", "ntbSales",
  "organicRank", "sponsoredRank",
]);

function detectReportType(headers: string[]): ReportType {
  const headerSet = new Set(headers.map((h) => h.trim().toLowerCase()));

  // Helium 10: organic/sponsored rank columns
  if (headerSet.has("organic rank") || headerSet.has("organic position") || headerSet.has("sponsored rank")) {
    return "helium10_rank";
  }
  // Search term: customer search term
  if (headerSet.has("customer search term") || headerSet.has("search term") || headerSet.has("termine di ricerca del cliente")) {
    return "search_term";
  }
  // Keyword: has keyword text + bid
  if ((headerSet.has("keyword text") || headerSet.has("keyword") || headerSet.has("parola chiave")) && headerSet.has("bid")) {
    return "keyword";
  }
  // Product: has ASIN column
  if (headerSet.has("asin") || headerSet.has("advertised asin")) {
    return "product";
  }
  // Default to campaign if has spend/sales
  if (headerSet.has("spend") || headerSet.has("spesa") || headerSet.has("campaign name") || headerSet.has("nome campagna")) {
    return "campaign";
  }
  return "unknown";
}

function getColumnMap(reportType: ReportType): Record<string, keyof NormalizedRow> {
  switch (reportType) {
    case "search_term": return SEARCH_TERM_COLUMN_MAP;
    case "keyword": return KEYWORD_COLUMN_MAP;
    case "product": return PRODUCT_COLUMN_MAP;
    case "helium10_rank": return HELIUM10_COLUMN_MAP;
    default: return CAMPAIGN_COLUMN_MAP;
  }
}

function mapRow(
  rawRow: Record<string, string>,
  columnMap: Record<string, keyof NormalizedRow>
): NormalizedRow {
  const normalized: NormalizedRow = {};
  for (const [rawKey, rawValue] of Object.entries(rawRow)) {
    const normalizedKey = columnMap[rawKey.trim()];
    if (!normalizedKey) continue;
    if (NUMERIC_FIELDS.has(normalizedKey)) {
      const num = coerceNumeric(rawValue);
      if (num !== null) {
        (normalized as Record<string, unknown>)[normalizedKey] = num;
      }
    } else {
      (normalized as Record<string, unknown>)[normalizedKey] = rawValue?.trim() || undefined;
    }
  }
  return normalized;
}

function computeAggregates(rows: NormalizedRow[], reportType: ReportType): ReportAggregates {
  if (reportType === "helium10_rank") {
    const timeMap = new Map<string, { organicRank: number[]; count: number }>();
    for (const row of rows) {
      if (!row.date) continue;
      const key = row.date;
      const existing = timeMap.get(key) || { organicRank: [], count: 0 };
      if (row.organicRank) existing.organicRank.push(row.organicRank);
      existing.count++;
      timeMap.set(key, existing);
    }
    const timeSeries: TimeSeriesPoint[] = Array.from(timeMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        spend: 0, sales: 0, orders: 0, clicks: 0, impressions: 0, acos: 0, roas: 0,
        organicRank: data.organicRank.length
          ? data.organicRank.reduce((a, b) => a + b, 0) / data.organicRank.length
          : undefined,
      }));
    return {
      totalSpend: 0, totalSales: 0, totalOrders: 0, totalClicks: 0, totalImpressions: 0,
      avgAcos: 0, avgRoas: 0, avgCtr: 0, avgCpc: 0, campaignCount: 0, timeSeries,
    };
  }

  let totalSpend = 0, totalSales = 0, totalOrders = 0, totalClicks = 0, totalImpressions = 0;
  const campaigns = new Set<string>();
  const timeMap = new Map<string, { spend: number; sales: number; orders: number; clicks: number; impressions: number }>();

  for (const row of rows) {
    totalSpend += row.spend ?? 0;
    totalSales += row.sales ?? 0;
    totalOrders += row.orders ?? 0;
    totalClicks += row.clicks ?? 0;
    totalImpressions += row.impressions ?? 0;
    if (row.campaignName) campaigns.add(row.campaignName);

    if (row.date) {
      const existing = timeMap.get(row.date) || { spend: 0, sales: 0, orders: 0, clicks: 0, impressions: 0 };
      existing.spend += row.spend ?? 0;
      existing.sales += row.sales ?? 0;
      existing.orders += row.orders ?? 0;
      existing.clicks += row.clicks ?? 0;
      existing.impressions += row.impressions ?? 0;
      timeMap.set(row.date, existing);
    }
  }

  const timeSeries: TimeSeriesPoint[] = Array.from(timeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      spend: data.spend,
      sales: data.sales,
      orders: data.orders,
      clicks: data.clicks,
      impressions: data.impressions,
      acos: data.sales > 0 ? data.spend / data.sales : 0,
      roas: data.spend > 0 ? data.sales / data.spend : 0,
    }));

  return {
    totalSpend,
    totalSales,
    totalOrders,
    totalClicks,
    totalImpressions,
    avgAcos: totalSales > 0 ? totalSpend / totalSales : 0,
    avgRoas: totalSpend > 0 ? totalSales / totalSpend : 0,
    avgCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    campaignCount: campaigns.size,
    timeSeries,
  };
}

function extractDateRange(rows: NormalizedRow[]): { from: string; to: string } | null {
  const dates = rows
    .map((r) => r.date)
    .filter((d): d is string => !!d)
    .sort();
  if (dates.length === 0) return null;
  return { from: dates[0], to: dates[dates.length - 1] };
}

export function parseReport(file: File): Promise<ParsedReport> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawRows = results.data as Record<string, string>[];
          if (rawRows.length === 0) {
            reject(new Error("Il file CSV è vuoto o non ha righe di dati."));
            return;
          }
          const headers = Object.keys(rawRows[0]);
          const reportType = detectReportType(headers);
          const columnMap = getColumnMap(reportType);
          const rows = rawRows.map((r) => mapRow(r, columnMap));
          const aggregates = computeAggregates(rows, reportType);
          const dateRange = extractDateRange(rows);

          const report: ParsedReport = {
            id: uuidv4(),
            uploadedAt: new Date().toISOString(),
            fileName: file.name,
            reportType,
            dateRange,
            rowCount: rows.length,
            rows,
            aggregates,
          };
          resolve(report);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(new Error(`Errore nel parsing del CSV: ${err.message}`)),
    });
  });
}

export { detectReportType };
