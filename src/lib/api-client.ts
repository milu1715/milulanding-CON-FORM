import type { StrategyGoal, GeneratedStrategy, RecommendedAction } from "@/types/strategy";
import type { DecisionEntry } from "@/types/decisions";
import { v4 as uuidv4 } from "uuid";

declare global {
  interface Window {
    electronAPI?: {
      getApiKey: () => Promise<string | null>;
      setApiKey: (key: string) => Promise<void>;
      deleteApiKey: () => Promise<void>;
      analyzeStream: (
        params: AnalyzeParams,
        onChunk: (text: string) => void
      ) => Promise<string>;
      getNextMove: (params: NextMoveParams) => Promise<NextMoveResult>;
    };
  }
}

export interface AnalyzeParams {
  reportSummary: string;
  goal: StrategyGoal;
  customGoalText?: string;
  decisionHistory?: DecisionEntry[];
  targetMetrics?: { acos?: number; roas?: number };
}

export interface NextMoveParams {
  reportSummary: string;
  decisionHistory: DecisionEntry[];
}

export interface NextMoveResult {
  nextMove: string;
  reasoning: string;
  expectedImpact: string;
  priority: string;
}

export function isElectron(): boolean {
  return typeof window !== "undefined" && !!window.electronAPI;
}

export function parseStrategyJson(
  raw: string,
  reportId: string,
  goal: StrategyGoal,
  customGoalText?: string
): GeneratedStrategy {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch?.[0] ?? raw);
  return {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    reportId,
    goal,
    customGoalText,
    summary: parsed.summary ?? "",
    actions: (parsed.actions ?? []).map((a: RecommendedAction, i: number) => ({
      ...a,
      id: a.id ?? `action_${i}`,
    })),
    nextMove: parsed.nextMove ?? "",
    aiRawResponse: raw,
    targetMetrics: parsed.targetMetrics,
  };
}

// ─── Strategy streaming ──────────────────────────────────────────────────────

export function streamStrategy(
  params: AnalyzeParams,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void
): () => void {
  if (isElectron()) {
    let cancelled = false;
    window.electronAPI!.analyzeStream(params, (chunk) => {
      if (!cancelled) onChunk(chunk);
    })
      .then((fullText) => { if (!cancelled) onDone(fullText); })
      .catch((err: Error) => { if (!cancelled) onError(err.message); });
    return () => { cancelled = true; };
  }

  // Web mode — SSE
  const ctrl = new AbortController();
  let accumulated = "";

  fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: ctrl.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: res.statusText }));
        onError(e.error ?? "Errore nella generazione");
        return;
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const p = JSON.parse(data);
            if (p.text) { accumulated += p.text; onChunk(p.text); }
            if (p.error) onError(p.error);
          } catch {}
        }
      }
      onDone(accumulated);
    })
    .catch((err) => { if (err.name !== "AbortError") onError(String(err)); });

  return () => ctrl.abort();
}

// ─── Next move ───────────────────────────────────────────────────────────────

export async function fetchNextMove(params: NextMoveParams): Promise<NextMoveResult> {
  if (isElectron()) {
    return window.electronAPI!.getNextMove(params);
  }
  const res = await fetch("/api/next-move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

// ─── API Key (Electron only) ─────────────────────────────────────────────────

export async function getStoredApiKey(): Promise<string | null> {
  if (isElectron()) return window.electronAPI!.getApiKey();
  return null;
}

export async function saveApiKey(key: string): Promise<void> {
  if (isElectron()) await window.electronAPI!.setApiKey(key);
}
