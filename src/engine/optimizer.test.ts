import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recommend } from "./recommend.ts";
import type { DecisionInput, Product } from "./types.ts";

function p(
  id: string,
  category: string,
  price: number,
  performance: number,
  goals: string[] = ["programming"],
): Product {
  return {
    id,
    name: id,
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
    goals,
    tags: [],
  };
}

const catalog: Product[] = [
  p("lap_low", "laptop", 400, 50, ["study"]),
  p("lap_mid", "laptop", 650, 75, ["programming", "study"]),
  p("lap_high", "laptop", 900, 95, ["programming", "gaming"]),
  p("mon_low", "monitor", 120, 55, ["programming"]),
  p("mon_high", "monitor", 300, 88, ["programming", "content"]),
  p("hp_low", "headphones", 50, 50, ["study"]),
  p("hp_high", "headphones", 200, 90, ["travel"]),
];

const base: DecisionInput = {
  budget: 1000,
  goals: ["programming", "university"],
  mustHaves: ["laptop"],
  wants: ["monitor", "headphones"],
  alreadyOwn: ["mouse"],
  priorities: {
    performance: 40,
    value: 20,
    longevity: 25,
    portability: 15,
    quality: 0,
  },
};

describe("optimizer", () => {
  it("returns four named strategies under a feasible budget", () => {
    const result = recommend(base, catalog);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.strategies.length, 4);
    const ids = result.strategies.map((s) => s.id).sort();
    assert.deepEqual(ids, [
      "best_overall",
      "best_value",
      "conservative",
      "performance_first",
    ]);
    for (const s of result.strategies) {
      assert.ok(s.bundle.cost <= 1000);
      assert.ok(s.bundle.products.some((x) => x.category === "laptop"));
    }
  });

  it("never recommends an already-owned category", () => {
    const result = recommend(
      { ...base, alreadyOwn: ["mouse", "headphones"], wants: ["monitor", "headphones"] },
      catalog,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    for (const s of result.strategies) {
      assert.ok(!s.bundle.products.some((p) => p.category === "headphones"));
    }
  });

  it("is deterministic", () => {
    const a = recommend(base, catalog);
    const b = recommend(base, catalog);
    assert.deepEqual(a, b);
  });

  it("reports the minimum budget when requirements are impossible", () => {
    const result = recommend({ ...base, budget: 100 }, catalog);
    assert.equal(result.ok, false);
    if (result.ok || result.error !== "infeasible") {
      assert.fail("expected infeasible");
    }
    assert.equal(result.minimumBudget, 400);
    assert.equal(result.additionalNeeded, 300);
  });

  it("handles a zero budget with a must-have", () => {
    const result = recommend({ ...base, budget: 0 }, catalog);
    assert.equal(result.ok, false);
    if (result.ok || result.error !== "infeasible") {
      assert.fail("expected infeasible");
    }
    assert.ok(result.minimumBudget >= 400);
  });

  it("performance-first spends toward higher performance laptops", () => {
    const result = recommend(base, catalog);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const perf = result.strategies.find((s) => s.id === "performance_first");
    const cons = result.strategies.find((s) => s.id === "conservative");
    assert.ok(perf && cons);
    const perfLap = perf.bundle.products.find((p) => p.category === "laptop")!;
    const consLap = cons.bundle.products.find((p) => p.category === "laptop")!;
    assert.ok(perfLap.attributes.performance >= consLap.attributes.performance);
    assert.ok(cons.bundle.remaining >= perf.bundle.remaining);
  });

  it("respects force-include even if it is expensive", () => {
    const result = recommend(
      { ...base, forceIncludeIds: ["lap_high"] },
      catalog,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    for (const s of result.strategies) {
      assert.ok(s.bundle.products.some((p) => p.id === "lap_high"));
    }
  });

  it("rejects empty must-haves and wants", () => {
    const result = recommend(
      { ...base, mustHaves: [], wants: [] },
      catalog,
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "empty");
  });
});
