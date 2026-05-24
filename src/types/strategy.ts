export type StrategyGoal =
  | "rinforzare_organico"
  | "lancio_aggressivo"
  | "obiettivo_roas"
  | "riduzione_sprechi"
  | "brand_awareness"
  | "custom";

export interface StrategyGoalOption {
  id: StrategyGoal;
  labelIT: string;
  labelEN: string;
  icon: string;
  description: string;
  color: string;
}

export type ActionType =
  | "bid_increase"
  | "bid_decrease"
  | "budget_increase"
  | "budget_decrease"
  | "add_negative_keyword"
  | "add_keyword"
  | "change_match_type"
  | "pause_campaign"
  | "enable_campaign"
  | "restructure"
  | "general";

export type ActionPriority = "critical" | "high" | "medium" | "low";
export type ActionEffect = "positive" | "neutral" | "risk";

export interface RecommendedAction {
  id: string;
  actionType: ActionType;
  priority: ActionPriority;
  target: string;
  currentValue?: string;
  recommendedValue?: string;
  reasoning: string;
  expectedImpact: string;
  estimatedEffect: ActionEffect;
}

export interface GeneratedStrategy {
  id: string;
  createdAt: string;
  reportId: string;
  goal: StrategyGoal;
  customGoalText?: string;
  summary: string;
  actions: RecommendedAction[];
  nextMove: string;
  aiRawResponse: string;
  targetMetrics?: {
    acos?: number;
    roas?: number;
    impressions?: number;
  };
}
