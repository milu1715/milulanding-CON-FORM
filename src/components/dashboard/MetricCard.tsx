import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  variant?: "default" | "positive" | "warning" | "danger";
}

const variantStyles = {
  default: "text-[var(--primary)]",
  positive: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-rose-400",
};

export function MetricCard({ label, value, subValue, icon: Icon, trend, trendLabel, variant = "default" }: Props) {
  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-current/10", variantStyles[variant])}>
          <Icon className={cn("w-4 h-4", variantStyles[variant])} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
        {subValue && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{subValue}</p>}
      </div>
      {trendLabel && (
        <p className={cn("text-xs font-medium", {
          "text-emerald-400": trend === "up",
          "text-rose-400": trend === "down",
          "text-[var(--muted-foreground)]": trend === "neutral",
        })}>
          {trendLabel}
        </p>
      )}
    </div>
  );
}
