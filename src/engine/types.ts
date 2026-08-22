export type ProductAttributes = {
  performance: number;
  battery: number;
  portability: number;
  longevity: number;
  quality: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  summary: string;
  attributes: ProductAttributes;
  goals: string[];
  tags: string[];
};

export type Category = {
  id: string;
  label: string;
  singular: string;
  hint: string;
};

export type Priorities = {
  performance: number;
  value: number;
  longevity: number;
  portability: number;
  quality: number;
};

export const PRIORITY_KEYS = [
  "performance",
  "value",
  "longevity",
  "portability",
  "quality",
] as const;

export type PriorityKey = (typeof PRIORITY_KEYS)[number];

export type DecisionInput = {
  budget: number;
  goals: string[];
  mustHaves: string[];
  wants: string[];
  alreadyOwn: string[];
  priorities: Priorities;
  forceIncludeIds?: string[];
  forceExcludeIds?: string[];
  minRemaining?: number;
};

export type ScoredProduct = {
  product: Product;
  utility: number;
  valueScore: number;
  performanceUtility: number;
};

export type Bundle = {
  products: Product[];
  cost: number;
  remaining: number;
  totalUtility: number;
  avgUtility: number;
  performanceUtility: number;
  goalCoverage: number;
  coveredGoals: string[];
  wantCoverage: number;
  includedWants: string[];
  missingWants: string[];
  redundancy: number;
  mustHaveGoalCoverage: number;
  primaryUtility: number;
};

export type StrategyId =
  | "best_overall"
  | "performance_first"
  | "best_value"
  | "conservative";

export type Strategy = {
  id: StrategyId;
  name: string;
  tagline: string;
  bundle: Bundle;
  score: number;
  paretoEfficient: boolean;
};

export type AlternativeUse = {
  label: string;
  items: string[];
  cost: number;
};

export type OpportunityCost = {
  extraSpentVsCheapest: number;
  cheapestMustHaveCost: number;
  youGain: string[];
  youGiveUp: string[];
  instead: AlternativeUse[];
  vsOtherStrategies: {
    strategyId: StrategyId;
    strategyName: string;
    gainedProducts: string[];
    lostProducts: string[];
    costDelta: number;
    utilityDelta: number;
    remainingDelta: number;
  }[];
};

export type StrategyResult = Strategy & {
  opportunityCost: OpportunityCost;
};

export type RecommendOk = {
  ok: true;
  input: DecisionInput;
  normalizedPriorities: Priorities;
  strategies: StrategyResult[];
  recommendedId: StrategyId;
  feasibleCount: number;
  paretoNote: string;
};

export type RecommendInfeasible = {
  ok: false;
  error: "infeasible";
  message: string;
  minimumBudget: number;
  additionalNeeded: number;
  cheapestMustHaves: { name: string; price: number; category: string }[];
};

export type RecommendError = {
  ok: false;
  error: "invalid" | "empty";
  message: string;
};

export type RecommendResult = RecommendOk | RecommendInfeasible | RecommendError;

export type WhatIfPatch = {
  budgetDelta?: number;
  budgetSet?: number;
  minRemaining?: number;
  priorities?: Priorities;
  removeCategories?: string[];
  addMustHaves?: string[];
  addWants?: string[];
  addAlreadyOwn?: string[];
  forceIncludeIds?: string[];
  forceExcludeIds?: string[];
  summary: string;
};

export type WhatIfResult = {
  patch: WhatIfPatch;
  parsedBy: "heuristic" | "model";
  before: RecommendResult;
  after: RecommendResult;
  changed: string[];
};
