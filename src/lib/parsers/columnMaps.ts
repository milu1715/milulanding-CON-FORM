import type { NormalizedRow } from "@/types/reports";

export function coerceNumeric(value: string): number | null {
  if (!value || value === "--" || value === "-" || value === "N/A" || value === "n/a") return null;
  // Remove currency symbols and thousands separators
  let cleaned = value.replace(/[$€£,]/g, "").trim();
  // Handle percentage strings
  if (cleaned.endsWith("%")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num / 100;
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export const CAMPAIGN_COLUMN_MAP: Record<string, keyof NormalizedRow> = {
  // English columns
  "Date": "date",
  "Campaign Name": "campaignName",
  "Campaign name": "campaignName",
  "Ad Group Name": "adGroup",
  "Ad group name": "adGroup",
  "Targeting": "targeting",
  "Impressions": "impressions",
  "Clicks": "clicks",
  "Click-Thru Rate (CTR)": "ctr",
  "CTR": "ctr",
  "Cost Per Click (CPC)": "cpc",
  "CPC": "cpc",
  "Spend": "spend",
  "7 Day Total Sales": "sales",
  "7 Day Total Sales ($)": "sales",
  "Total Sales": "sales",
  "Total Advertising Cost of Sales (ACoS)": "acos",
  "Total Advertising Cost of Sales (ACOS)": "acos",
  "ACoS": "acos",
  "ACOS": "acos",
  "Total Return on Advertising Spend (RoAS)": "roas",
  "Total Return on Advertising Spend (ROAS)": "roas",
  "RoAS": "roas",
  "ROAS": "roas",
  "7 Day Total Orders (#)": "orders",
  "7 Day Total Orders": "orders",
  "Total Orders": "orders",
  "Orders": "orders",
  "7 Day Total Units (#)": "units",
  "7 Day Total Units": "units",
  "Total Units": "units",
  "7 Day New-to-Brand Orders (#)": "ntbOrders",
  "New-to-Brand Orders": "ntbOrders",
  "7 Day New-to-Brand Sales": "ntbSales",
  "New-to-Brand Sales": "ntbSales",
  // Italian locale
  "Data": "date",
  "Nome campagna": "campaignName",
  "Nome gruppo di annunci": "adGroup",
  "Impression": "impressions",
  "Percentuale di clic (CTR)": "ctr",
  "Costo per clic (CPC)": "cpc",
  "Spesa": "spend",
  "Vendite totali (7 giorni)": "sales",
  "Costo pubblicitario delle vendite (ACOS)": "acos",
  "Ritorno sulla spesa pubblicitaria (ROAS)": "roas",
  "Ordini totali (7 giorni)": "orders",
  "Unità totali (7 giorni)": "units",
};

export const SEARCH_TERM_COLUMN_MAP: Record<string, keyof NormalizedRow> = {
  ...CAMPAIGN_COLUMN_MAP,
  "Customer Search Term": "customerSearchTerm",
  "Search Term": "customerSearchTerm",
  "Keyword": "keywordText",
  "Keyword Text": "keywordText",
  "Match Type": "matchType",
  "match type": "matchType",
  // Italian
  "Termine di ricerca del cliente": "customerSearchTerm",
  "Parola chiave": "keywordText",
  "Tipo di corrispondenza": "matchType",
};

export const KEYWORD_COLUMN_MAP: Record<string, keyof NormalizedRow> = {
  ...SEARCH_TERM_COLUMN_MAP,
  "Bid": "bid",
  "Keyword bid": "bid",
  "Offerta": "bid",
};

export const PRODUCT_COLUMN_MAP: Record<string, keyof NormalizedRow> = {
  ...CAMPAIGN_COLUMN_MAP,
  "ASIN": "asin",
  "Advertised ASIN": "asin",
  "Advertised SKU": "asin",
  "Product Name": "productName",
  "Advertised product": "productName",
};

export const HELIUM10_COLUMN_MAP: Record<string, keyof NormalizedRow> = {
  "Keyword": "keywordText",
  "keyword": "keywordText",
  "Search Volume": "impressions",
  "Organic Rank": "organicRank",
  "organic rank": "organicRank",
  "Organic Position": "organicRank",
  "Sponsored Rank": "sponsoredRank",
  "Sponsored Position": "sponsoredRank",
  "Date": "date",
  "date": "date",
  "ASIN": "asin",
  "asin": "asin",
  "Rank": "organicRank",
  "Position": "organicRank",
};
