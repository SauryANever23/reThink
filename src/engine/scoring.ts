import type {
  Bundle,
  DecisionInput,
  Priorities,
  Product,
  ScoredProduct,
} from "./types.ts";
import { PRIORITY_KEYS } from "./types.ts";

export const GOAL_ALIASES: Record<string, string> = {
  university: "study",
  college: "study",
  school: "study",
  "content creation": "content",
  video: "content",
  photo: "content",
  photography: "content",
  code: "programming",
  coding: "programming",
  developer: "programming",
  dev: "programming",
  office: "work",
  job: "work",
  commute: "travel",
};

export function normalizeGoal(raw: string): string {
  const g = raw.trim().toLowerCase();
  return GOAL_ALIASES[g] ?? g;
}

export function normalizeGoals(goals: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const g of goals) {
    const n = normalizeGoal(g);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

export function normalizeWeights(p: Priorities): Priorities {
  let sum = 0;
  for (const k of PRIORITY_KEYS) sum += Math.max(0, p[k] ?? 0);
  if (sum <= 0) {
    return {
      performance: 0.2,
      value: 0.2,
      longevity: 0.2,
      portability: 0.2,
      quality: 0.2,
    };
  }
  return {
    performance: Math.max(0, p.performance) / sum,
    value: Math.max(0, p.value) / sum,
    longevity: Math.max(0, p.longevity) / sum,
    portability: Math.max(0, p.portability) / sum,
    quality: Math.max(0, p.quality) / sum,
  };
}

export function productValueScore(
  product: Product,
  catalog: Product[],
): number {
  const same = catalog.filter((p) => p.category === product.category);
  if (same.length === 0) return 50;
  const min = Math.min(...same.map((p) => p.price));
  const max = Math.max(...same.map((p) => p.price));
  if (max <= min) return 70;
  const inverted = 1 - (product.price - min) / (max - min);
  return Math.round(inverted * 100);
}

export function productUtility(
  product: Product,
  weights: Priorities,
  catalog: Product[],
): number {
  const value = productValueScore(product, catalog);
  const a = product.attributes;
  return (
    weights.performance * a.performance +
    weights.value * value +
    weights.longevity * a.longevity +
    weights.portability * a.portability +
    weights.quality * a.quality
  );
}

export function scoreProduct(
  product: Product,
  weights: Priorities,
  catalog: Product[],
): ScoredProduct {
  const valueScore = productValueScore(product, catalog);
  const perfWeights: Priorities = {
    performance: 0.7,
    value: 0.05,
    longevity: 0.1,
    portability: 0.05,
    quality: 0.1,
  };
  return {
    product,
    utility: productUtility(product, weights, catalog),
    valueScore,
    performanceUtility: productUtility(product, perfWeights, catalog),
  };
}

export function productCoversGoal(product: Product, goal: string): boolean {
  const g = normalizeGoal(goal);
  return product.goals.some((pg) => normalizeGoal(pg) === g);
}

export function coveredGoals(products: Product[], goals: string[]): string[] {
  const g = normalizeGoals(goals);
  return g.filter((goal) => products.some((p) => productCoversGoal(p, goal)));
}

export function goalCoverage(products: Product[], goals: string[]): number {
  const g = normalizeGoals(goals);
  if (g.length === 0) return 1;
  return coveredGoals(products, g).length / g.length;
}

function redundancyPenalty(products: Product[]): number {
  if (products.length <= 1) return 0;
  const cats = new Set(products.map((p) => p.category));
  if (cats.size < products.length) return 12;
  let overlap = 0;
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const a = new Set(products[i]!.goals.map(normalizeGoal));
      const shared = products[j]!.goals.filter((g) =>
        a.has(normalizeGoal(g)),
      ).length;
      overlap += shared;
    }
  }
  return Math.min(8, overlap * 0.4);
}

export function buildBundle(
  products: Product[],
  input: DecisionInput,
  catalog: Product[],
  weights: Priorities,
): Bundle {
  const cost = products.reduce((s, p) => s + p.price, 0);
  const remaining = Math.max(0, input.budget - cost);
  const scored = products.map((p) => scoreProduct(p, weights, catalog));
  const totalUtility = scored.reduce((s, p) => s + p.utility, 0);
  const avgUtility =
    products.length === 0 ? 0 : totalUtility / products.length;
  const performanceUtility = scored.reduce(
    (s, p) => s + p.performanceUtility,
    0,
  );
  const goals = normalizeGoals(input.goals);
  const covered = coveredGoals(products, goals);
  const includedWants = input.wants.filter((w) =>
    products.some((p) => p.category === w),
  );
  const missingWants = input.wants.filter(
    (w) =>
      !input.alreadyOwn.includes(w) &&
      !products.some((p) => p.category === w),
  );
  const wantDenom = input.wants.filter((w) => !input.alreadyOwn.includes(w))
    .length;
  const wantCoverage = wantDenom === 0 ? 1 : includedWants.length / wantDenom;

  const mustHaveProducts = products.filter(
    (p) =>
      input.mustHaves.includes(p.category) ||
      (input.forceIncludeIds ?? []).includes(p.id),
  );
  const primary =
    mustHaveProducts.length > 0 ? mustHaveProducts : products.slice(0, 1);
  const primaryScored = primary.map((p) => scoreProduct(p, weights, catalog));
  const primaryUtility =
    primaryScored.length === 0
      ? 0
      : primaryScored.reduce((s, p) => s + p.utility, 0) / primaryScored.length;
  const mustHaveGoalCoverage =
    goals.length === 0
      ? 1
      : goals.filter((goal) => primary.some((p) => productCoversGoal(p, goal)))
          .length / goals.length;

  return {
    products: [...products].sort((a, b) => a.category.localeCompare(b.category)),
    cost,
    remaining,
    totalUtility,
    avgUtility,
    performanceUtility,
    goalCoverage: goals.length === 0 ? 1 : covered.length / goals.length,
    coveredGoals: covered,
    wantCoverage,
    includedWants,
    missingWants,
    redundancy: redundancyPenalty(products),
    mustHaveGoalCoverage,
    primaryUtility,
  };
}

export function bundleKey(products: Product[]): string {
  return products
    .map((p) => p.id)
    .sort()
    .join("|");
}

export function overallScore(bundle: Bundle, budget: number): number {
  const remainRatio = budget <= 0 ? 0 : bundle.remaining / budget;
  return (
    0.42 * bundle.primaryUtility +
    0.16 * bundle.avgUtility +
    0.24 * bundle.mustHaveGoalCoverage * 100 +
    0.1 * bundle.wantCoverage * 80 +
    0.08 * remainRatio * 40 -
    bundle.redundancy
  );
}

export function performanceScore(bundle: Bundle): number {
  const avgPerf =
    bundle.products.length === 0
      ? 0
      : bundle.performanceUtility / bundle.products.length;
  const peak = Math.max(
    0,
    ...bundle.products.map((p) => p.attributes.performance),
  );
  const primaryPeak = Math.max(
    0,
    ...bundle.products
      .filter((p) =>
        ["laptop", "phone"].includes(p.category),
      )
      .map((p) => p.attributes.performance),
    peak * 0.5,
  );
  return (
    0.5 * primaryPeak +
    0.25 * avgPerf +
    0.15 * bundle.mustHaveGoalCoverage * 100 +
    0.1 * bundle.goalCoverage * 40 -
    bundle.redundancy * 0.5
  );
}

export function valueScore(bundle: Bundle): number {
  const useful =
    bundle.primaryUtility *
      (0.4 + 0.6 * bundle.mustHaveGoalCoverage) +
    bundle.avgUtility * 0.25 +
    bundle.wantCoverage * 8;
  return useful / Math.max(bundle.cost, 1) * 1200 - bundle.redundancy;
}

export function conservativeScore(bundle: Bundle, budget: number): number {
  const remainRatio = budget <= 0 ? 0 : bundle.remaining / budget;
  return (
    remainRatio * 120 +
    bundle.mustHaveGoalCoverage * 28 +
    bundle.primaryUtility * 0.22 -
    bundle.products.length * 2
  );
}

export function emptyPriorities(): Priorities {
  return {
    performance: 20,
    value: 20,
    longevity: 20,
    portability: 20,
    quality: 20,
  };
}
