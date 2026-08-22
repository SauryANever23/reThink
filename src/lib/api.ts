import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { categories, products } from "@/data/catalog";
import { deterministicExplain, deterministicWhatChanged } from "@/engine/explain.ts";
import { recommend, runWhatIf } from "@/engine/recommend.ts";
import type { RecommendOk } from "@/engine/types.ts";
import { decisionInputSchema } from "./schema";

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  return { products, categories };
});

export const generateRecommendation = createServerFn({ method: "POST" })
  .validator((input: unknown) => decisionInputSchema.parse(input))
  .handler(async ({ data }) => {
    return recommend(data, products);
  });

const whatIfRequestSchema = z.object({
  input: decisionInputSchema,
  question: z.string().trim().min(3).max(400),
});

export const applyWhatIf = createServerFn({ method: "POST" })
  .validator((input: unknown) => whatIfRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { parseWhatIfWithModel, explainWithModel } = await import("./ai.server");
    const modelPatch = await parseWhatIfWithModel(
      data.question,
      data.input,
      products,
    );
    const result = runWhatIf({
      input: data.input,
      question: data.question,
      catalog: products,
      categories,
      modelPatch,
    });

    const beforeKit = result.before.ok
      ? result.before.strategies.find(
          (s) => result.before.ok && s.id === result.before.recommendedId,
        )
      : undefined;
    const afterKit = result.after.ok
      ? result.after.strategies.find(
          (s) => result.after.ok && s.id === result.after.recommendedId,
        )
      : undefined;

    const fallback = deterministicWhatChanged({
      changed: result.changed,
      beforeName: beforeKit?.bundle.products.map((p) => p.name).join(", "),
      afterName: afterKit?.bundle.products.map((p) => p.name).join(", "),
      beforeCost: beforeKit?.bundle.cost,
      afterCost: afterKit?.bundle.cost,
    });

    let narrative: string | null = fallback;
    if (result.before.ok && result.after.ok) {
      const prompt = `Explain in 2 short paragraphs what changed in this decision. Use ONLY this data. No invented products or numbers.

Change: ${result.changed.join(" ")}
Patch: ${result.patch.summary}
Before kit: ${JSON.stringify(
        beforeKit?.bundle.products.map((p) => ({ name: p.name, price: p.price })),
      )}
After kit: ${JSON.stringify(
        afterKit?.bundle.products.map((p) => ({ name: p.name, price: p.price })),
      )}
Before remaining: ${beforeKit?.bundle.remaining}
After remaining: ${afterKit?.bundle.remaining}`;
      narrative = (await explainWithModel(prompt)) ?? fallback;
    }

    return { ...result, narrative };
  });

const explainRequestSchema = z.object({
  strategyId: z.enum([
    "best_overall",
    "performance_first",
    "best_value",
    "conservative",
  ]),
  result: z.custom<RecommendOk>((v) => Boolean(v && (v as RecommendOk).ok)),
});

export const explainDecision = createServerFn({ method: "POST" })
  .validator((input: unknown) => explainRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { explainWithModel } = await import("./ai.server");
    const strategy =
      data.result.strategies.find((s) => s.id === data.strategyId) ??
      data.result.strategies[0];
    if (!strategy) throw new Error("Strategy not found.");
    const fallback = deterministicExplain(data.result, strategy);
    const prompt = `Write a calm 3-paragraph explanation of this buying decision for a thoughtful adult. Use ONLY this JSON. Never invent products, prices, or scores. Emphasize opportunity cost — what is gained, given up, and what else the extra money could have bought.

${JSON.stringify({
  strategy: strategy.name,
  budget: data.result.input.budget,
  spent: strategy.bundle.cost,
  remaining: strategy.bundle.remaining,
  products: strategy.bundle.products.map((p) => ({
    name: p.name,
    price: p.price,
    category: p.category,
  })),
  utility: Math.round(strategy.bundle.avgUtility),
  goalCoverage: Math.round(strategy.bundle.goalCoverage * 100),
  opportunityCost: strategy.opportunityCost,
})}`;
    const text = await explainWithModel(prompt);
    return {
      text: text ?? fallback,
      source: text ? ("model" as const) : ("deterministic" as const),
    };
  });
