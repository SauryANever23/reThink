import { buildBundle, normalizeGoals, normalizeWeights, productCoversGoal } from "./scoring.ts";
import type {
  AlternativeUse,
  Bundle,
  DecisionInput,
  OpportunityCost,
  Product,
  Strategy,
  StrategyId,
} from "./types.ts";

function cheapestMustHaveBundle(
  input: DecisionInput,
  catalog: Product[],
): Bundle | null {
  const weights = normalizeWeights(input.priorities);
  const exclude = new Set(input.forceExcludeIds ?? []);
  const owned = new Set(input.alreadyOwn);
  const products: Product[] = [];
  const force = (input.forceIncludeIds ?? [])
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  products.push(...force);
  const forcedCats = new Set(force.map((p) => p.category));
  for (const cat of input.mustHaves) {
    if (owned.has(cat) || forcedCats.has(cat)) continue;
    const options = catalog
      .filter((p) => p.category === cat && !exclude.has(p.id))
      .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
    if (!options[0]) return null;
    products.push(options[0]);
  }
  return buildBundle(products, input, catalog, weights);
}

function strengthLines(bundle: Bundle): string[] {
  const lines: string[] = [];
  for (const p of bundle.products) {
    const a = p.attributes;
    const highs: string[] = [];
    if (a.performance >= 82) highs.push("performance");
    if (a.longevity >= 85) highs.push("longevity");
    if (a.portability >= 85) highs.push("portability");
    if (a.quality >= 85) highs.push("build quality");
    if (a.battery >= 85) highs.push("battery life");
    if (highs.length) {
      lines.push(`${p.name} is strong on ${highs.join(", ")}`);
    }
  }
  return lines.slice(0, 3);
}

function skippedUpgrades(
  bundle: Bundle,
  catalog: Product[],
  budget: number,
): string[] {
  const lines: string[] = [];
  const selectedIds = new Set(bundle.products.map((p) => p.id));
  for (const p of bundle.products) {
    const better = catalog
      .filter(
        (c) =>
          c.category === p.category &&
          !selectedIds.has(c.id) &&
          c.price > p.price &&
          c.price <= p.price + bundle.remaining + 40 &&
          c.attributes.performance - p.attributes.performance >= 6,
      )
      .sort((a, b) => b.attributes.performance - a.attributes.performance);
    const top = better[0];
    if (top) {
      const delta = top.price - p.price;
      lines.push(
        `${top.name} in ${p.category} (+$${delta} for higher performance)`,
      );
    }
  }
  if (lines.length === 0) {
    const unaffordable = catalog
      .filter(
        (c) =>
          c.price > budget &&
          !selectedIds.has(c.id) &&
          bundle.products.some((p) => p.category === c.category),
      )
      .sort((a, b) => a.price - b.price);
    if (unaffordable[0]) {
      lines.push(
        `${unaffordable[0].name} sits above this budget at $${unaffordable[0].price}`,
      );
    }
  }
  return lines.slice(0, 3);
}

function alternativeUses(
  extra: number,
  selected: Bundle,
  catalog: Product[],
  input: DecisionInput,
): AlternativeUse[] {
  const uses: AlternativeUse[] = [];
  uses.push({
    label: `Keep ${Math.round(extra)} as savings`,
    items: ["Unspent cash — optionality for later"],
    cost: 0,
  });

  const selectedIds = new Set(selected.products.map((p) => p.id));
  const selectedCats = new Set(selected.products.map((p) => p.category));
  const pool = catalog
    .filter((p) => {
      if (selectedIds.has(p.id)) return false;
      if (input.alreadyOwn.includes(p.category)) return false;
      if (selectedCats.has(p.category) && p.price >= 80) return false;
      return p.price <= extra && p.price >= 25;
    })
    .sort((a, b) => b.price - a.price || a.id.localeCompare(b.id));

  const singles = pool.slice(0, 4);
  for (const p of singles) {
    uses.push({
      label: p.name,
      items: [p.name],
      cost: p.price,
    });
  }

  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const a = pool[i]!;
      const b = pool[j]!;
      if (a.category === b.category) continue;
      const cost = a.price + b.price;
      if (cost <= extra && cost >= extra * 0.45) {
        uses.push({
          label: `${a.name} + ${b.name}`,
          items: [a.name, b.name],
          cost,
        });
      }
      if (uses.length >= 8) break;
    }
    if (uses.length >= 8) break;
  }

  const seen = new Set<string>();
  const unique: AlternativeUse[] = [];
  for (const u of uses) {
    const key = u.items.slice().sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(u);
  }
  return unique.slice(0, 5);
}

export function computeOpportunityCost(
  selected: Strategy,
  others: Strategy[],
  input: DecisionInput,
  catalog: Product[],
): OpportunityCost {
  const cheapest = cheapestMustHaveBundle(input, catalog);
  const cheapestCost = cheapest?.cost ?? 0;
  const extra = Math.max(0, selected.bundle.cost - cheapestCost);
  const goals = normalizeGoals(input.goals);
  const youGain: string[] = [];

  if (input.mustHaves.length > 0) {
    youGain.push(
      `All mandatory requirements covered (${input.mustHaves.join(", ")})`,
    );
  }
  for (const g of selected.bundle.coveredGoals) {
    youGain.push(`Supports ${g}`);
  }
  for (const w of selected.bundle.includedWants) {
    const item = selected.bundle.products.find((p) => p.category === w);
    if (item) youGain.push(`Want included: ${item.name}`);
  }
  if (selected.bundle.remaining >= 1) {
    youGain.push(`$${Math.round(selected.bundle.remaining)} remaining`);
  } else {
    youGain.push("Budget fully allocated");
  }
  youGain.push(...strengthLines(selected.bundle));

  const youGiveUp: string[] = [];
  for (const w of selected.bundle.missingWants) {
    youGiveUp.push(`No ${w} in this kit`);
  }
  youGiveUp.push(...skippedUpgrades(selected.bundle, catalog, input.budget));

  const conservative = others.find((s) => s.id === "conservative");
  if (
    conservative &&
    conservative.id !== selected.id &&
    conservative.bundle.remaining > selected.bundle.remaining + 15
  ) {
    const delta = Math.round(
      conservative.bundle.remaining - selected.bundle.remaining,
    );
    youGiveUp.push(`$${delta} of additional savings vs the conservative kit`);
  }

  const bestPerf = others.find((s) => s.id === "performance_first");
  if (
    bestPerf &&
    bestPerf.id !== selected.id &&
    bestPerf.bundle.performanceUtility > selected.bundle.performanceUtility + 4
  ) {
    const names = bestPerf.bundle.products
      .filter(
        (p) => !selected.bundle.products.some((s) => s.id === p.id),
      )
      .map((p) => p.name);
    if (names[0]) {
      youGiveUp.push(`Higher-capability option: ${names[0]}`);
    }
  }

  const uncovered = goals.filter(
    (g) => !selected.bundle.products.some((p) => productCoversGoal(p, g)),
  );
  for (const g of uncovered) {
    youGiveUp.push(`Weaker coverage for ${g}`);
  }
  if (selected.bundle.mustHaveGoalCoverage < 1 && goals.length > 0) {
    const primaryMiss = goals.filter(
      (g) =>
        !selected.bundle.products
          .filter(
            (p) =>
              input.mustHaves.includes(p.category) ||
              (input.forceIncludeIds ?? []).includes(p.id),
          )
          .some((p) => productCoversGoal(p, g)),
    );
    for (const g of primaryMiss) {
      youGiveUp.push(`The required item is a weak fit for ${g}`);
    }
  }

  const vsOtherStrategies = others
    .filter((s) => s.id !== selected.id)
    .map((s) => {
      const gained = s.bundle.products
        .filter((p) => !selected.bundle.products.some((x) => x.id === p.id))
        .map((p) => p.name);
      const lost = selected.bundle.products
        .filter((p) => !s.bundle.products.some((x) => x.id === p.id))
        .map((p) => p.name);
      return {
        strategyId: s.id as StrategyId,
        strategyName: s.name,
        gainedProducts: gained,
        lostProducts: lost,
        costDelta: s.bundle.cost - selected.bundle.cost,
        utilityDelta: s.bundle.avgUtility - selected.bundle.avgUtility,
        remainingDelta: s.bundle.remaining - selected.bundle.remaining,
      };
    });

  return {
    extraSpentVsCheapest: extra,
    cheapestMustHaveCost: cheapestCost,
    youGain: uniqueLines(youGain).slice(0, 7),
    youGiveUp: uniqueLines(youGiveUp).slice(0, 7),
    instead: alternativeUses(extra || selected.bundle.remaining, selected.bundle, catalog, input),
    vsOtherStrategies,
  };
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const l of lines) {
    if (seen.has(l)) continue;
    seen.add(l);
    out.push(l);
  }
  return out;
}

export { cheapestMustHaveBundle };
