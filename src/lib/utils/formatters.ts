export function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatRoas(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "short",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
