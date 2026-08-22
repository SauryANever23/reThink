import { computeOpportunityCost } from "./opportunity-cost.ts";
import { optimize } from "./optimizer.ts";
import { applyWhatIfPatch, describeChange, parseWhatIfHeuristic } from "./what-if.ts";
import type {
  Category,
  DecisionInput,
  Product,
  RecommendResult,
  WhatIfPatch,
  WhatIfResult,
} from "./types.ts";

export function recommend(
  input: DecisionInput,
  catalog: Product[],
): RecommendResult {
  const result = optimize(input, catalog);
  if (!result.ok) return result;
  const base = result.strategies.map((s) => ({
    id: s.id,
    name: s.name,
    tagline: s.tagline,
    bundle: s.bundle,
    score: s.score,
    paretoEfficient: s.paretoEfficient,
  }));
  return {
    ...result,
    strategies: result.strategies.map((s) => ({
      ...s,
      opportunityCost: computeOpportunityCost(s, base, input, catalog),
    })),
  };
}

export function runWhatIf(args: {
  input: DecisionInput;
  question: string;
  catalog: Product[];
  categories: Category[];
  modelPatch?: WhatIfPatch | null;
}): WhatIfResult {
  const heuristic = parseWhatIfHeuristic(
    args.question,
    args.input,
    args.catalog,
    args.categories,
  );
  const patch =
    args.modelPatch && args.modelPatch.summary
      ? args.modelPatch
      : heuristic;
  const parsedBy: "heuristic" | "model" =
    args.modelPatch && args.modelPatch.summary ? "model" : "heuristic";
  const nextInput = applyWhatIfPatch(args.input, patch);
  const before = recommend(args.input, args.catalog);
  const after = recommend(nextInput, args.catalog);
  return {
    patch,
    parsedBy,
    before,
    after,
    changed: describeChange(args.input, nextInput),
  };
}
