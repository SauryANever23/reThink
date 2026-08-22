import type { RecommendOk, StrategyResult } from "./types.ts";

function money(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

export function deterministicExplain(
  result: RecommendOk,
  strategy: StrategyResult,
): string {
  const b = strategy.bundle;
  const names = b.products.map((p) => p.name).join(", ");
  const oc = strategy.opportunityCost;
  const gain = oc.youGain.slice(0, 3).join("; ");
  const give = oc.youGiveUp.slice(0, 3).join("; ");
  const instead = oc.instead
    .slice(0, 3)
    .map((u) => u.label)
    .join("; ");
  return [
    `${strategy.name} spends ${money(b.cost)} of ${money(result.input.budget)} (${money(b.remaining)} left) on ${names || "no extra items"}.`,
    `Average utility is ${Math.round(b.avgUtility)}/100 with ${Math.round(b.goalCoverage * 100)}% goal coverage.`,
    gain ? `You gain: ${gain}.` : "",
    give ? `You give up: ${give}.` : "",
    instead
      ? `The extra spend versus a bare-minimum kit could instead have gone to: ${instead}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function deterministicWhatChanged(args: {
  changed: string[];
  beforeName?: string;
  afterName?: string;
  beforeCost?: number;
  afterCost?: number;
}): string {
  const constraint = args.changed.join(" ");
  const swap =
    args.beforeName && args.afterName && args.beforeName !== args.afterName
      ? `The recommended kit moved from ${args.beforeName} to ${args.afterName}.`
      : "The recommended kit stayed in the same strategy family.";
  const moneyLine =
    args.beforeCost != null && args.afterCost != null
      ? `Spend went from ${money(args.beforeCost)} to ${money(args.afterCost)}.`
      : "";
  return [constraint, swap, moneyLine].filter(Boolean).join(" ");
}
