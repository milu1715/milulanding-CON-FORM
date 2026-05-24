import type { ReportType } from "@/types/reports";
import { cn } from "@/lib/utils/cn";

const LABELS: Record<ReportType, { label: string; color: string }> = {
  campaign: { label: "Campagne SP", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  search_term: { label: "Search Terms", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  keyword: { label: "Keyword Report", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  product: { label: "ASIN / Prodotto", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  helium10_rank: { label: "Helium 10 Rank", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  unknown: { label: "Tipo Sconosciuto", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
};

export function ReportTypeBadge({ type }: { type: ReportType }) {
  const { label, color } = LABELS[type] ?? LABELS.unknown;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", color)}>
      {label}
    </span>
  );
}
