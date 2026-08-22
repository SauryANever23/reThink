import { whatIfPatchSchema } from "./schema";
import type { DecisionInput, Product, WhatIfPatch } from "@/engine/types.ts";

function extractJson(text: string): unknown {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function chat(prompt: string, maxTokens: number): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14000);
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.2,
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content:
              "Use ONLY the supplied data. Never invent products, prices, scores, calculations, or financial facts. If information is unavailable, say so.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return body.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function parseWhatIfWithModel(
  question: string,
  input: DecisionInput,
  products: Product[],
): Promise<WhatIfPatch | null> {
  const catalog = products
    .map((p) => `${p.id} | ${p.name} | ${p.category} | $${p.price}`)
    .join("\n");
  const prompt = `Convert this what-if question into a JSON patch for a budget optimizer.
Return JSON only, no markdown.

Schema:
{
  "budgetDelta": number or null,
  "budgetSet": number or null,
  "minRemaining": number or null,
  "priorities": {"performance":0-100,"value":0-100,"longevity":0-100,"portability":0-100,"quality":0-100} or null,
  "removeCategories": string[] or null,
  "addMustHaves": string[] or null,
  "addWants": string[] or null,
  "addAlreadyOwn": string[] or null,
  "forceIncludeIds": string[] or null,
  "forceExcludeIds": string[] or null,
  "summary": "short description of the structured change"
}

Rules:
- budgetDelta is added to the current budget (use for "had $200 more").
- budgetSet replaces the budget (use for "if my budget was $1500").
- Categories must be one of: laptop, monitor, headphones, keyboard, mouse, phone, backpack, storage.
- forceIncludeIds / forceExcludeIds must be catalog ids from the list. Never invent ids.
- If the question does not change something, leave it null.
- summary must describe only the structured change.

Current decision:
${JSON.stringify(input)}

Catalog:
${catalog}

Question:
${question}`;

  const text = await chat(prompt, 400);
  if (!text) return null;
  const parsed = extractJson(text);
  const safe = whatIfPatchSchema.safeParse(parsed);
  if (!safe.success) return null;
  const p = safe.data;
  const clean = <T>(v: T | null | undefined): T | undefined =>
    v == null ? undefined : v;
  return {
    budgetDelta: clean(p.budgetDelta) ?? undefined,
    budgetSet: clean(p.budgetSet),
    minRemaining: clean(p.minRemaining),
    priorities: clean(p.priorities),
    removeCategories: clean(p.removeCategories),
    addMustHaves: clean(p.addMustHaves),
    addWants: clean(p.addWants),
    addAlreadyOwn: clean(p.addAlreadyOwn),
    forceIncludeIds: clean(p.forceIncludeIds),
    forceExcludeIds: clean(p.forceExcludeIds),
    summary: p.summary,
  };
}

export async function explainWithModel(prompt: string): Promise<string | null> {
  return chat(prompt, 420);
}
