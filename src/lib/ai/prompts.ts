import type { StrategyGoal, StrategyGoalOption } from "@/types/strategy";
import type { DecisionEntry } from "@/types/decisions";

export const STRATEGY_GOALS: StrategyGoalOption[] = [
  {
    id: "rinforzare_organico",
    labelIT: "Rinforzare Organico",
    labelEN: "Boost Organic Ranking",
    icon: "TrendingUp",
    description: "Usa il PPC per spingere le vendite e migliorare il ranking organico su keyword chiave",
    color: "emerald",
  },
  {
    id: "lancio_aggressivo",
    labelIT: "Lancio Aggressivo",
    labelEN: "Aggressive Launch",
    icon: "Rocket",
    description: "Massimizza visibilità e prime vendite di un prodotto nuovo, accettando ACOS più alto",
    color: "blue",
  },
  {
    id: "obiettivo_roas",
    labelIT: "Obiettivo ROAS",
    labelEN: "Target ROAS",
    icon: "Target",
    description: "Ottimizza verso un ROAS specifico bilanciando volume e efficienza di spesa",
    color: "purple",
  },
  {
    id: "riduzione_sprechi",
    labelIT: "Riduzione Sprechi",
    labelEN: "Waste Reduction",
    icon: "Scissors",
    description: "Taglia la spesa inefficiente, aggiungi negative keyword e pausa campagne in perdita",
    color: "amber",
  },
  {
    id: "brand_awareness",
    labelIT: "Brand Awareness",
    labelEN: "Maximize Impressions",
    icon: "Eye",
    description: "Espandi la presenza del brand massimizzando le impression su keyword di categoria",
    color: "rose",
  },
  {
    id: "custom",
    labelIT: "Obiettivo Custom",
    labelEN: "Custom Goal",
    icon: "Pencil",
    description: "Descrivi il tuo obiettivo specifico in testo libero per una strategia su misura",
    color: "slate",
  },
];

export function buildStrategyPrompt(params: {
  reportSummary: string;
  goal: StrategyGoal;
  customGoalText?: string;
  decisionHistory?: DecisionEntry[];
  targetMetrics?: { acos?: number; roas?: number };
}): string {
  const { reportSummary, goal, customGoalText, decisionHistory, targetMetrics } = params;

  const goalOption = STRATEGY_GOALS.find((g) => g.id === goal)!;
  const goalDesc = goal === "custom"
    ? `OBIETTIVO CUSTOM: "${customGoalText}"`
    : `OBIETTIVO: ${goalOption.labelIT} (${goalOption.labelEN})\n${goalOption.description}`;

  const targetSection = targetMetrics
    ? `\nTARGET METRICHE:\n${targetMetrics.acos != null ? `  ACOS target: ${(targetMetrics.acos * 100).toFixed(0)}%\n` : ""}${targetMetrics.roas != null ? `  ROAS target: ${targetMetrics.roas.toFixed(2)}x` : ""}`
    : "";

  const historySection = decisionHistory && decisionHistory.length > 0
    ? `\nSTORICO ULTIME DECISIONI (per contesto):\n${decisionHistory
        .slice(0, 5)
        .map(
          (d) =>
            `  [${new Date(d.createdAt).toLocaleDateString("it-IT")}] ${d.title} — Previsto: "${d.expectedOutcome}"${d.actualOutcome ? ` — Effettivo: "${d.actualOutcome}"` : " — In attesa di valutazione"} (stato: ${d.status})`
        )
        .join("\n")}`
    : "";

  return `Sei un esperto di Amazon Advertising specializzato nell'ottimizzazione PPC per seller italiani su Amazon Italia.

Il seller vende prodotti per la casa di qualità premium su Amazon Italia (brand: MiLù Home).

DATI PERFORMANCE ATTUALI:
${reportSummary}
${targetSection}
${historySection}

${goalDesc}

COMPITO:
Analizza i dati sopra e fornisci una strategia pubblicitaria concreta e immediatamente applicabile.
Rispondi ESCLUSIVAMENTE con un oggetto JSON valido con questa struttura esatta:

{
  "summary": "Sintesi esecutiva di 2-3 frasi: situazione attuale e approccio raccomandato",
  "actions": [
    {
      "id": "action_1",
      "actionType": "bid_increase|bid_decrease|budget_increase|budget_decrease|add_negative_keyword|add_keyword|change_match_type|pause_campaign|enable_campaign|restructure|general",
      "priority": "critical|high|medium|low",
      "target": "nome esatto della campagna o keyword",
      "currentValue": "valore attuale (opzionale)",
      "recommendedValue": "valore raccomandato (opzionale)",
      "reasoning": "motivazione specifica basata sui dati",
      "expectedImpact": "impatto atteso quantificato (es: -15% ACOS, +2x ROAS)",
      "estimatedEffect": "positive|neutral|risk"
    }
  ],
  "nextMove": "L'azione singola più importante da fare ADESSO nelle prossime 24 ore",
  "targetMetrics": {
    "acos": 0.XX,
    "roas": X.X
  }
}

REGOLE OBBLIGATORIE:
- Cita i nomi esatti di campagne e keyword dai dati
- Ogni raccomandazione deve essere giustificata da una metrica specifica
- Ordina le azioni per priorità (critical prima)
- Sii specifico: non dire "aumenta il bid", di' "aumenta il bid su keyword X da €0.45 a €0.62"
- Massimo 10 azioni
- Considera il mercato italiano e la stagionalità
- Rispondi SOLO con il JSON, senza testo prima o dopo`;
}

export function buildNextMovePrompt(params: {
  reportSummary: string;
  decisionHistory: DecisionEntry[];
}): string {
  const { reportSummary, decisionHistory } = params;

  const historyText = decisionHistory.length > 0
    ? decisionHistory.slice(0, 8).map(d =>
        `[${new Date(d.createdAt).toLocaleDateString("it-IT")}] ${d.title} | Previsto: ${d.expectedOutcome} | Effettivo: ${d.actualOutcome ?? "non valutato"} | Status: ${d.status}`
      ).join("\n")
    : "Nessuna decisione precedente registrata.";

  return `Sei un esperto Amazon Advertising. Analizza i dati e lo storico decisioni e fornisci LA SINGOLA prossima mossa più importante.

PERFORMANCE ATTUALE:
${reportSummary}

STORICO DECISIONI:
${historyText}

Rispondi SOLO con JSON:
{
  "nextMove": "descrizione specifica dell'azione da fare",
  "reasoning": "motivazione basata sui dati e sullo storico",
  "expectedImpact": "impatto atteso",
  "priority": "critical|high|medium|low"
}`;
}
