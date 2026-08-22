import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recommend, runWhatIf } from "./recommend.ts";
import { applyWhatIfPatch, parseWhatIfHeuristic } from "./what-if.ts";
import type { Category, DecisionInput, Product } from "./types.ts";

function p(
  id: string,
  category: string,
  price: number,
  performance: number,
): Product {
  return {
    id,
    name: id.replaceAll("_", " "),
    brand: "T",
    category,
    price,
    summary: "",
    attributes: {
      performance,
      battery: 70,
      portability: 70,
      longevity: 70,
      quality: 70,
    },
    goals: ["programming", "study"],
    tags: [],
  };
}

const catalog: Product[] = [
  p("lap_low", "laptop", 400, 50),
  p("lap_mid", "laptop", 650, 75),
  p("lap_high", "laptop", 900, 95),
  p("mon_low", "monitor", 120, 55),
  p("mon_high", "monitor", 300, 88),
  p("hp_low", "headphones", 50, 50),
  p("ssd", "storage", 90, 80),
];

const categories: Category[] = [
  { id: "laptop", label: "Laptop", singular: "laptop", hint: "" },
  { id: "monitor", label: "Monitor", singular: "monitor", hint: "" },
  { id: "headphones", label: "Headphones", singular: "headphones", hint: "" },
  { id: "storage", label: "Storage", singular: "drive", hint: "" },
];

const base: DecisionInput = {
  budget: 1000,
  goals: ["programming"],
  mustHaves: ["laptop"],
  wants: ["monitor", "headphones"],
  alreadyOwn: [],
  priorities: {
    performance: 40,
    value: 20,
    longevity: 20,
    portability: 10,
    quality: 10,
  },
};

describe("opportunity cost", () => {
  it("explains gain, give-up, and concrete alternatives", () => {
    const result = recommend(base, catalog);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const s = result.strategies[0]!;
    assert.ok(s.opportunityCost.youGain.length >= 2);
    assert.ok(s.opportunityCost.youGiveUp.length >= 1);
    assert.ok(s.opportunityCost.instead.length >= 1);
    assert.ok(
      s.opportunityCost.instead.some((u) => /savings/i.test(u.label)),
    );
  });

  it("measures extra spend against the cheapest must-have kit", () => {
    const result = recommend(base, catalog);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    for (const s of result.strategies) {
      assert.equal(s.opportunityCost.cheapestMustHaveCost, 400);
      assert.ok(s.opportunityCost.extraSpentVsCheapest >= 0);
    }
  });
});

describe("what-if", () => {
  it("parses a larger budget from natural language", () => {
    const patch = parseWhatIfHeuristic(
      "What if I had $200 more?",
      base,
      catalog,
      categories,
    );
    assert.equal(patch.budgetDelta, 200);
    const next = applyWhatIfPatch(base, patch);
    assert.equal(next.budget, 1200);
  });

  it("parses a save constraint", () => {
    const patch = parseWhatIfHeuristic(
      "What if I need to save $300?",
      base,
      catalog,
      categories,
    );
    assert.equal(patch.minRemaining, 300);
  });

  it("parses dropping a monitor", () => {
    const patch = parseWhatIfHeuristic(
      "What if I remove the monitor?",
      base,
      catalog,
      categories,
    );
    assert.ok(patch.removeCategories?.includes("monitor"));
  });

  it("parses a performance priority shift", () => {
    const patch = parseWhatIfHeuristic(
      "What if performance became my top priority?",
      base,
      catalog,
      categories,
    );
    assert.ok(patch.priorities);
    assert.ok(patch.priorities.performance > patch.priorities.value);
  });

  it("recalculates after a budget increase", () => {
    const result = runWhatIf({
      input: base,
      question: "What if I had $200 more?",
      catalog,
      categories,
    });
    assert.equal(result.after.ok, true);
    assert.equal(result.before.ok, true);
    if (!result.after.ok || !result.before.ok) return;
    assert.equal(result.after.input.budget, 1200);
    const beforeMax = Math.max(
      ...result.before.strategies.map((s) =>
        Math.max(...s.bundle.products.map((p) => p.attributes.performance)),
      ),
    );
    const afterMax = Math.max(
      ...result.after.strategies.map((s) =>
        Math.max(...s.bundle.products.map((p) => p.attributes.performance)),
      ),
    );
    assert.ok(afterMax >= beforeMax);
  });
});
