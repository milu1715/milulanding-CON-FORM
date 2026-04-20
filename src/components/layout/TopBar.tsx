"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Panoramica performance campagne" },
  "/upload": { title: "Carica Report", subtitle: "Importa CSV da Amazon Ads o Helium 10" },
  "/strategy": { title: "Strategia IA", subtitle: "Genera strategie ottimizzate con Claude AI" },
  "/decisions": { title: "Decision Log", subtitle: "Storico decisioni e prossima mossa consigliata" },
  "/settings": { title: "Impostazioni", subtitle: "Chiave API e configurazione app" },
};

export function TopBar() {
  const pathname = usePathname();
  const match = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path));
  const { title, subtitle } = match?.[1] ?? { title: "Console", subtitle: "" };

  return (
    <header className="h-16 flex items-center px-6 border-b border-[var(--border)] bg-[var(--background)]">
      <div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p>}
      </div>
    </header>
  );
}
