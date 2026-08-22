import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeGoals,
  normalizeWeights,
  productUtility,
  productValueScore,
} from "./scoring.ts";
import type { Product } from "./types.ts";

const cheap: Product = {
  id: "a",
  name: "Cheap",
  brand: "X",
  category: "laptop",
  price: 400,
  summary: "",
  attributes: {
    performance: 50,
    battery: 50,
    portability: 50,
    longevity: 50,
    quality: 50,
  },
  goals: ["study"],
  tags: [],
};

const pricey: Product = {
  ...cheap,
  id: "b",
  name: "Pricey",
  price: 1000,
  attributes: { ...cheap.attributes, performance: 90 },
};

describe("normalizeWeights", () => {
  it("normalizes to a unit sum", () => {
    const w = normalizeWeights({
      performance: 40,
      value: 20,
      longevity: 25,
      portability: 15,
      quality: 0,
    });
    const sum =
      w.performance + w.value + w.longevity + w.portability + w.quality;
    assert.ok(Math.abs(sum - 1) < 1e-9);
    assert.equal(w.performance, 0.4);
    assert.equal(w.quality, 0);
  });

  it("falls back when all weights are zero", () => {
    const w = normalizeWeights({
      performance: 0,
      value: 0,
      longevity: 0,
      portability: 0,
      quality: 0,
    });
    assert.equal(w.performance, 0.2);
  });

  it("ignores negative weights", () => {
    const w = normalizeWeights({
      performance: 10,
      value: -5,
      longevity: 0,
      portability: 0,
      quality: 0,
    });
    assert.equal(w.performance, 1);
    assert.equal(w.value, 0);
  });
});

describe("product utility", () => {
  it("gives cheaper items a higher value score", () => {
    const catalog = [cheap, pricey];
    assert.equal(productValueScore(cheap, catalog), 100);
    assert.equal(productValueScore(pricey, catalog), 0);
  });

  it("weights performance when asked", () => {
    const catalog = [cheap, pricey];
    const perf = productUtility(
      pricey,
      {
        performance: 1,
        value: 0,
        longevity: 0,
        portability: 0,
        quality: 0,
      },
      catalog,
    );
    const value = productUtility(
      cheap,
      {
        performance: 0,
        value: 1,
        longevity: 0,
        portability: 0,
        quality: 0,
      },
      catalog,
    );
    assert.equal(perf, 90);
    assert.equal(value, 100);
  });
});

describe("normalizeGoals", () => {
  it("aliases university to study and de-dupes", () => {
    assert.deepEqual(normalizeGoals(["University", "study", "coding"]), [
      "study",
      "programming",
    ]);
  });
});
