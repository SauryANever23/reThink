import { buildBundle, bundleKey, conservativeScore, normalizeWeights, overallScore, performanceScore, valueScore } from "./scoring.ts";
import type {
  Bundle,
  DecisionInput,
  Product,
  RecommendResult,
  Strategy,
  StrategyId,
} from "./types.ts";

const BEAM_WIDTH = 2800;
const BRUTE_CAP = 18000;

type Slot = {
  category: string;
  required: boolean;
  options: Product[];
};

function estimatedCombos(slots: Slot[]): number {
  let n = 1;
  for (const s of slots) {
    const choices = s.options.length + (s.required ? 0 : 1);
    n *= Math.max(1, choices);
    if (n > 1_000_000) return n;
  }
  return n;
}

function comparePartial(
  a: { products: Product[]; spent: number },
  b: { products: Product[]; spent: number },
): number {
  if (a.spent !== b.spent) return a.spent - b.spent;
  const ka = a.products.map((p) => p.id).join("|");
  const kb = b.products.map((p) => p.id).join("|");
  return ka.localeCompare(kb);
}

function enumerateBundles(slots: Slot[], budget: number): Product[][] {
  if (slots.length === 0) return [[]];
  const estimate = estimatedCombos(slots);
  if (estimate <= BRUTE_CAP) {
    const results: Product[][] = [];
    const rec = (i: number, chosen: Product[], spent: number) => {
      if (i === slots.length) {
        results.push(chosen.slice());
        return;
      }
      const slot = slots[i]!;
      if (!slot.required) rec(i + 1, chosen, spent);
      for (const p of slot.options) {
        if (spent + p.price <= budget) {
          chosen.push(p);
          rec(i + 1, chosen, spent + p.price);
          chosen.pop();
        }
      }
    };
    rec(0, [], 0);
    return results;
  }

  let beam: { products: Product[]; spent: number }[] = [
    { products: [], spent: 0 },
  ];
  for (const slot of slots) {
    const next: { products: Product[]; spent: number }[] = [];
    for (const b of beam) {
      if (!slot.required) next.push(b);
      for (const p of slot.options) {
        if (b.spent + p.price <= budget) {
          next.push({
            products: [...b.products, p],
            spent: b.spent + p.price,
          });
        }
      }
    }
    next.sort(comparePartial);
    beam = next.slice(0, BEAM_WIDTH);
  }
  return beam.map((b) => b.products);
}

function cheapestMustHaves(
  mustHaves: string[],
  catalog: Product[],
  excludeIds: Set<string>,
): { name: string; price: number; category: string }[] {
  const out: { name: string; price: number; category: string }[] = [];
  for (const cat of mustHaves) {
    const options = catalog
      .filter((p) => p.category === cat && !excludeIds.has(p.id))
      .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
    const first = options[0];
    if (first) {
      out.push({ name: first.name, price: first.price, category: cat });
    }
  }
  return out;
}

function isParetoEfficient(
  bundle: Bundle,
  others: Bundle[],
): boolean {
  for (const o of others) {
    if (o === bundle) continue;
    const betterOrEqual =
      o.avgUtility >= bundle.avgUtility - 1e-9 &&
      o.remaining >= bundle.remaining - 1e-9 &&
      o.goalCoverage >= bundle.goalCoverage - 1e-9;
    const strictlyBetter =
      o.avgUtility > bundle.avgUtility + 1e-9 ||
      o.remaining > bundle.remaining + 1e-9 ||
      o.goalCoverage > bundle.goalCoverage + 1e-9;
    if (betterOrEqual && strictlyBetter) return false;
  }
  return true;
}

function pickDistinct(
  ranked: { bundle: Bundle; score: number }[],
  taken: Set<string>,
): { bundle: Bundle; score: number } | null {
  for (const row of ranked) {
    const key = bundleKey(row.bundle.products);
    if (!taken.has(key)) {
      taken.add(key);
      return row;
    }
  }
  return ranked[0] ?? null;
}

const STRATEGY_META: Record<
  StrategyId,
  { name: string; tagline: string }
> = {
  best_overall: {
    name: "Best Overall",
    tagline: "The strongest balance of your priorities, coverage, and spend.",
  },
  performance_first: {
    name: "Performance First",
    tagline: "Maximize the capability of the kit, even if it spends more.",
  },
  best_value: {
    name: "Best Value",
    tagline: "The most useful outcome per dollar actually spent.",
  },
  conservative: {
    name: "Conservative",
    tagline: "Cover what you must, keep as much money as you can.",
  },
};

export function optimize(
  input: DecisionInput,
  catalog: Product[],
): RecommendResult {
  if (!Number.isFinite(input.budget) || input.budget < 0) {
    return {
      ok: false,
      error: "invalid",
      message: "Budget must be a number of zero or more.",
    };
  }
  if (input.mustHaves.length === 0 && input.wants.length === 0) {
    return {
      ok: false,
      error: "empty",
      message:
        "Add at least one must-have or want so there is something to decide.",
    };
  }

  const weights = normalizeWeights(input.priorities);
  const exclude = new Set(input.forceExcludeIds ?? []);
  const owned = new Set(input.alreadyOwn);
  const forceInclude = (input.forceIncludeIds ?? [])
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined && !exclude.has(p.id));

  for (const p of forceInclude) {
    if (owned.has(p.category)) owned.delete(p.category);
  }

  const forcedCost = forceInclude.reduce((s, p) => s + p.price, 0);
  const forcedCats = new Set(forceInclude.map((p) => p.category));
  const minRemaining = Math.max(0, input.minRemaining ?? 0);
  const spendCap = input.budget - minRemaining;

  if (forcedCost > spendCap) {
    const minBudget = forcedCost + minRemaining;
    return {
      ok: false,
      error: "infeasible",
      message:
        minRemaining > 0
          ? `The required items already cost ${forcedCost}, which leaves less than the $${minRemaining} you asked to save.`
          : "The items you required already exceed the budget.",
      minimumBudget: minBudget,
      additionalNeeded: Math.max(0, minBudget - input.budget),
      cheapestMustHaves: forceInclude.map((p) => ({
        name: p.name,
        price: p.price,
        category: p.category,
      })),
    };
  }

  const mustHaves = input.mustHaves.filter(
    (c) => !owned.has(c) && !forcedCats.has(c),
  );
  const wants = input.wants.filter(
    (c) => !owned.has(c) && !forcedCats.has(c) && !mustHaves.includes(c),
  );

  const missingCats: string[] = [];
  for (const cat of mustHaves) {
    const options = catalog.filter(
      (p) => p.category === cat && !exclude.has(p.id) && p.price <= spendCap,
    );
    if (options.length === 0) missingCats.push(cat);
  }

  const cheapest = cheapestMustHaves(
    [...mustHaves, ...forceInclude.map((p) => p.category)],
    catalog,
    exclude,
  );
  const minMustCost =
    cheapest.reduce((s, p) => s + p.price, 0) +
    forceInclude
      .filter((p) => !cheapest.some((c) => c.category === p.category))
      .reduce((s, p) => s + p.price, 0);

  if (missingCats.length > 0 || minMustCost > spendCap) {
    const minimumBudget = minMustCost + minRemaining;
    return {
      ok: false,
      error: "infeasible",
      message:
        missingCats.length > 0
          ? `No product in the catalog can cover: ${missingCats.join(", ")}.`
          : "No feasible decision satisfies all mandatory requirements.",
      minimumBudget,
      additionalNeeded: Math.max(0, minimumBudget - input.budget),
      cheapestMustHaves: cheapest,
    };
  }

  const slots: Slot[] = [];
  for (const cat of mustHaves) {
    const options = catalog
      .filter((p) => p.category === cat && !exclude.has(p.id))
      .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
    slots.push({ category: cat, required: true, options });
  }
  for (const cat of wants) {
    const options = catalog
      .filter((p) => p.category === cat && !exclude.has(p.id))
      .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
    if (options.length) {
      slots.push({ category: cat, required: false, options });
    }
  }

  const remainingBudget = spendCap - forcedCost;
  const combos = enumerateBundles(slots, remainingBudget);
  const feasible: Bundle[] = [];
  const seen = new Set<string>();
  for (const combo of combos) {
    const products = [...forceInclude, ...combo];
    const key = bundleKey(products);
    if (seen.has(key)) continue;
    seen.add(key);
    const bundle = buildBundle(products, input, catalog, weights);
    if (bundle.cost > spendCap + 1e-6) continue;
    const coversMust = mustHaves.every((c) =>
      products.some((p) => p.category === c),
    );
    const coversForced = forceInclude.every((f) =>
      products.some((p) => p.id === f.id),
    );
    if (!coversMust || !coversForced) continue;
    feasible.push(bundle);
  }

  if (feasible.length === 0) {
    const minimumBudget = minMustCost + minRemaining;
    return {
      ok: false,
      error: "infeasible",
      message: "No feasible decision satisfies all mandatory requirements.",
      minimumBudget,
      additionalNeeded: Math.max(0, minimumBudget - input.budget),
      cheapestMustHaves: cheapest,
    };
  }

  const overallRanked = feasible
    .map((b) => ({ bundle: b, score: overallScore(b, input.budget) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        bundleKey(a.bundle.products).localeCompare(
          bundleKey(b.bundle.products),
        ),
    );
  const perfRanked = feasible
    .map((b) => ({ bundle: b, score: performanceScore(b) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        bundleKey(a.bundle.products).localeCompare(
          bundleKey(b.bundle.products),
        ),
    );
  const valueRanked = feasible
    .map((b) => ({ bundle: b, score: valueScore(b) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        bundleKey(a.bundle.products).localeCompare(
          bundleKey(b.bundle.products),
        ),
    );
  const consRanked = feasible
    .map((b) => ({ bundle: b, score: conservativeScore(b, input.budget) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        bundleKey(a.bundle.products).localeCompare(
          bundleKey(b.bundle.products),
        ),
    );

  const taken = new Set<string>();
  const picks: { id: StrategyId; row: { bundle: Bundle; score: number } }[] =
    [];
  const order: { id: StrategyId; ranked: { bundle: Bundle; score: number }[] }[] =
    [
      { id: "best_overall", ranked: overallRanked },
      { id: "performance_first", ranked: perfRanked },
      { id: "best_value", ranked: valueRanked },
      { id: "conservative", ranked: consRanked },
    ];

  for (const { id, ranked } of order) {
    const row = pickDistinct(ranked, taken);
    if (row) picks.push({ id, row });
  }

  const pickBundles = picks.map((p) => p.row.bundle);
  const strategies: Strategy[] = picks.map(({ id, row }) => {
    const meta = STRATEGY_META[id];
    return {
      id,
      name: meta.name,
      tagline: meta.tagline,
      bundle: row.bundle,
      score: row.score,
      paretoEfficient: isParetoEfficient(row.bundle, pickBundles),
    };
  });

  const paretoCount = strategies.filter((s) => s.paretoEfficient).length;
  const paretoNote =
    paretoCount <= 1
      ? "One of these strategies dominates the others on utility, leftover money, and goal coverage."
      : "There is no universally perfect choice. Improving one objective requires sacrificing another.";

  return {
    ok: true,
    input,
    normalizedPriorities: weights,
    strategies: strategies.map((s) => ({
      ...s,
      opportunityCost: {
        extraSpentVsCheapest: 0,
        cheapestMustHaveCost: 0,
        youGain: [],
        youGiveUp: [],
        instead: [],
        vsOtherStrategies: [],
      },
    })),
    recommendedId: "best_overall",
    feasibleCount: feasible.length,
    paretoNote,
  };
}

export function allFeasibleBundles(
  input: DecisionInput,
  catalog: Product[],
): Bundle[] {
  const result = optimize(input, catalog);
  if (!result.ok) return [];
  const weights = normalizeWeights(input.priorities);
  const exclude = new Set(input.forceExcludeIds ?? []);
  const owned = new Set(input.alreadyOwn);
  const forceInclude = (input.forceIncludeIds ?? [])
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  const forcedCats = new Set(forceInclude.map((p) => p.category));
  const mustHaves = input.mustHaves.filter(
    (c) => !owned.has(c) && !forcedCats.has(c),
  );
  const wants = input.wants.filter(
    (c) => !owned.has(c) && !forcedCats.has(c) && !mustHaves.includes(c),
  );
  const minRemaining = Math.max(0, input.minRemaining ?? 0);
  const spendCap = input.budget - minRemaining;
  const slots: Slot[] = [];
  for (const cat of mustHaves) {
    slots.push({
      category: cat,
      required: true,
      options: catalog.filter((p) => p.category === cat && !exclude.has(p.id)),
    });
  }
  for (const cat of wants) {
    slots.push({
      category: cat,
      required: false,
      options: catalog.filter((p) => p.category === cat && !exclude.has(p.id)),
    });
  }
  const forcedCost = forceInclude.reduce((s, p) => s + p.price, 0);
  const combos = enumerateBundles(slots, spendCap - forcedCost);
  return combos.map((c) =>
    buildBundle([...forceInclude, ...c], input, catalog, weights),
  );
}
