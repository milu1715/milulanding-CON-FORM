"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { DecisionEntry } from "@/types/decisions";
import type { ActionType } from "@/types/strategy";

const ACTION_TYPE_OPTIONS: { value: ActionType; label: string }[] = [
  { value: "bid_increase", label: "Aumento Bid" },
  { value: "bid_decrease", label: "Riduzione Bid" },
  { value: "budget_increase", label: "Aumento Budget" },
  { value: "budget_decrease", label: "Riduzione Budget" },
  { value: "add_negative_keyword", label: "Aggiunta Keyword Negativa" },
  { value: "add_keyword", label: "Aggiunta Keyword" },
  { value: "change_match_type", label: "Cambio Match Type" },
  { value: "pause_campaign", label: "Pausa Campagna" },
  { value: "enable_campaign", label: "Attivazione Campagna" },
  { value: "restructure", label: "Ristrutturazione" },
  { value: "general", label: "Altra Azione" },
];

interface Props {
  onAdd: (entry: Omit<DecisionEntry, "id" | "createdAt">) => void;
  onClose: () => void;
}

export function AddDecisionModal({ onAdd, onClose }: Props) {
  const [form, setForm] = useState({
    title: "",
    target: "",
    actionType: "general" as ActionType,
    description: "",
    reasoning: "",
    expectedOutcome: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.expectedOutcome) return;
    onAdd({
      ...form,
      status: "planned",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Aggiungi Decisione Manuale</h2>
          <button onClick={onClose} className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Titolo *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="es: Aumento bid keyword principale"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Tipo Azione</label>
              <select
                value={form.actionType}
                onChange={(e) => setForm({ ...form, actionType: e.target.value as ActionType })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none"
              >
                {ACTION_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Target (campagna/keyword)</label>
              <input
                type="text"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                placeholder="es: [EXACT] tappetino induzione"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Descrizione</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Cosa hai fatto esattamente?"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Motivazione</label>
            <textarea
              value={form.reasoning}
              onChange={(e) => setForm({ ...form, reasoning: e.target.value })}
              rows={2}
              placeholder="Perché hai preso questa decisione?"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Risultato Atteso *</label>
            <input
              type="text"
              value={form.expectedOutcome}
              onChange={(e) => setForm({ ...form, expectedOutcome: e.target.value })}
              placeholder="es: -15% ACOS nelle prossime 2 settimane"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Aggiungi Decisione
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
