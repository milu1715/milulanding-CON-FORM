export type ReportType =
  | "campaign"
  | "search_term"
  | "keyword"
  | "product"
  | "helium10_rank"
  | "unknown";

export interface NormalizedRow {
  date?: string;
  campaignName?: string;
  adGroup?: string;
  targeting?: string;
  matchType?: string;
  customerSearchTerm?: string;
  keywordText?: string;
  bid?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  spend?: number;
  sales?: number;
  orders?: number;
  acos?: number;
  roas?: number;
  units?: number;
  ntbOrders?: number;
  ntbSales?: number;
  // ASIN/Product fields
  asin?: string;
  productName?: string;
  // Helium 10 organic rank fields
  organicRank?: number;
  sponsoredRank?: number;
}

export interface TimeSeriesPoint {
  date: string;
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  impressions: number;
  acos: number;
  roas: number;
  organicRank?: number;
}

export interface ReportAggregates {
  totalSpend: number;
  totalSales: number;
  totalOrders: number;
  totalClicks: number;
  totalImpressions: number;
  avgAcos: number;
  avgRoas: number;
  avgCtr: number;
  avgCpc: number;
  campaignCount: number;
  timeSeries: TimeSeriesPoint[];
}

export interface ParsedReport {
  id: string;
  uploadedAt: string;
  fileName: string;
  reportType: ReportType;
  dateRange: { from: string; to: string } | null;
  rowCount: number;
  rows: NormalizedRow[];
  aggregates: ReportAggregates;
}
