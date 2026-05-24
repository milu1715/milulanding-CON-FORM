"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Sparkles,
  GitBranch,
  TrendingUp,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Carica Report", icon: Upload },
  { href: "/strategy", label: "Strategia IA", icon: Sparkles },
  { href: "/decisions", label: "Decision Log", icon: GitBranch },
  { href: "/settings", label: "Impostazioni", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col border-r border-[var(--border)] bg-[var(--card)] z-40">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--border)]">
        <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
        <div>
          <div className="text-sm font-bold text-[var(--foreground)]">MiLù Ads</div>
          <div className="text-xs text-[var(--muted-foreground)]">AI Console</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)]">MiLù Home © 2025</p>
      </div>
    </aside>
  );
}
