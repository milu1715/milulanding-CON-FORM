import type { ActionType } from "./strategy";

export type DecisionStatus =
  | "planned"
  | "applied"
  | "monitoring"
  | "evaluated"
  | "abandoned";

export interface OutcomeMetrics {
  acosDelta?: number;
  roasDelta?: number;
  spendDelta?: number;
  salesDelta?: number;
  clicksDelta?: number;
}

export interface DecisionEntry {
  id: string;
  createdAt: string;
  appliedAt?: string;
  evaluatedAt?: string;
  title: string;
  description: string;
  actionType: ActionType;
  target: string;
  reasoning: string;
  expectedOutcome: string;
  actualOutcome?: string;
  status: DecisionStatus;
  linkedStrategyId?: string;
  linkedReportId?: string;
  outcomeMetrics?: OutcomeMetrics;
}
