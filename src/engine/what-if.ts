import type { Category, DecisionInput, Priorities, Product, WhatIfPatch } from "./types.ts";
import { emptyPriorities } from "./scoring.ts";

const PRIORITY_WORDS: { key: keyof Priorities; words: string[] }[] = [
  { key: "performance", words: ["performance", "power", "speed", "fast", "gpu"] },
  { key: "value", words: ["value", "cheap", "price", "budget", "affordable"] },
  { key: "longevity", words: ["longevity", "durable", "last", "repair", "years"] },
  { key: "portability", words: ["portability", "portable", "light", "travel", "thin"] },
  { key: "quality", words: ["quality", "premium", "build"] },
];

function money(s: string, re: RegExp): number | undefined {
  const m = s.match(re);
  if (!m?.[1]) return undefined;
  return Number(m[1]);
}

export function parseWhatIfHeuristic(
  question: string,
  input: DecisionInput,
  products: Product[],
  categories: Category[],
): WhatIfPatch {
  const s = question.toLowerCase().replace(/,/g, "");
  const patch: WhatIfPatch = { summary: question.trim() };
  const parts: string[] = [];

  const more = money(
    s,
    /(?:had|have|with|got|add(?:ed)?|extra|another)?\s*\$?\s*(\d{2,6})\s*(?:more|extra|additional|on top)/,
  );
  const more2 = money(s, /(?:increase|raise|boost)(?: the)? budget (?:by |to )?\$?\s*(\d{2,6})/);
  if (more != null) {
    patch.budgetDelta = more;
    parts.push(`increase budget by $${more}`);
  } else if (more2 != null && /by /.test(s)) {
    patch.budgetDelta = more2;
    parts.push(`increase budget by $${more2}`);
  } else {
    const setTo = money(
      s,
      /(?:had|have|budget of|budget is|set budget(?: to)?|with a budget of)\s*\$?\s*(\d{3,6})/,
    );
    if (setTo != null && more == null) {
      patch.budgetSet = setTo;
      parts.push(`set budget to $${setTo}`);
    }
  }

  const save = money(s, /save\s+\$?\s*(\d{2,6})/);
  const keep = money(s, /(?:keep|leave|hold back|reserve)\s+\$?\s*(\d{2,6})/);
  if (save != null) {
    patch.minRemaining = save;
    parts.push(`keep at least $${save}`);
  } else if (keep != null) {
    patch.minRemaining = keep;
    parts.push(`keep at least $${keep}`);
  }

  const boosted: Partial<Priorities> = {};
  let boostCount = 0;
  for (const { key, words } of PRIORITY_WORDS) {
    if (
      words.some((w) => s.includes(w)) &&
      /priority|top|first|maximize|maximise|focus|care|matter|important/.test(s)
    ) {
      boosted[key] = 70;
      boostCount += 1;
      parts.push(`make ${key} the top priority`);
    }
  }
  if (boostCount > 0) {
    const base = emptyPriorities();
    const next: Priorities = { ...base };
    for (const k of Object.keys(next) as (keyof Priorities)[]) {
      next[k] = boosted[k] ?? 8;
    }
    patch.priorities = next;
  }

  const removeCats: string[] = [];
  for (const cat of categories) {
    const names = [cat.id, cat.singular, cat.label.toLowerCase()];
    const hit = names.some((n) => {
      const re = new RegExp(
        `(?:remove|skip|drop|without|no|don't need|do not need|exclude)\\s+(?:the |a |an |my )?${n}`,
      );
      return re.test(s);
    });
    if (hit) removeCats.push(cat.id);
  }
  if (removeCats.length) {
    patch.removeCategories = removeCats;
    parts.push(`remove ${removeCats.join(", ")}`);
  }

  const addMust: string[] = [];
  for (const cat of categories) {
    const names = [cat.id, cat.singular, cat.label.toLowerCase()];
    const hit = names.some((n) =>
      new RegExp(
        `(?:must have|need|require|absolutely need)\\s+(?:a |an |the |this )?${n}`,
      ).test(s),
    );
    if (hit && !input.mustHaves.includes(cat.id)) addMust.push(cat.id);
  }
  if (addMust.length) {
    patch.addMustHaves = addMust;
    parts.push(`require ${addMust.join(", ")}`);
  }

  const forceIds: string[] = [];
  const sorted = [...products].sort((a, b) => b.name.length - a.name.length);
  for (const p of sorted) {
    const name = p.name.toLowerCase();
    if (name.length < 5) continue;
    if (s.includes(name) && /need|must|require|force|absolutely|lock|choose|pick|want the/.test(s)) {
      forceIds.push(p.id);
      break;
    }
    const short = name.replace(/\s+\d+.*$/, "");
    if (
      short.length >= 8 &&
      s.includes(short) &&
      /need|must|require|absolutely|lock/.test(s)
    ) {
      forceIds.push(p.id);
      break;
    }
  }
  if (forceIds.length) {
    patch.forceIncludeIds = forceIds;
    const names = forceIds
      .map((id) => products.find((p) => p.id === id)?.name ?? id)
      .join(", ");
    parts.push(`require ${names}`);
  }

  patch.summary = parts.length ? parts.join("; ") : "No structured change detected";
  return patch;
}

export function applyWhatIfPatch(
  input: DecisionInput,
  patch: WhatIfPatch,
): DecisionInput {
  const next: DecisionInput = {
    ...input,
    goals: [...input.goals],
    mustHaves: [...input.mustHaves],
    wants: [...input.wants],
    alreadyOwn: [...input.alreadyOwn],
    priorities: { ...input.priorities },
    forceIncludeIds: [...(input.forceIncludeIds ?? [])],
    forceExcludeIds: [...(input.forceExcludeIds ?? [])],
    minRemaining: input.minRemaining,
  };

  if (patch.budgetSet != null) next.budget = Math.max(0, patch.budgetSet);
  if (patch.budgetDelta != null) {
    next.budget = Math.max(0, next.budget + patch.budgetDelta);
  }
  if (patch.minRemaining != null) next.minRemaining = Math.max(0, patch.minRemaining);
  if (patch.priorities) next.priorities = { ...patch.priorities };

  const remove = new Set(patch.removeCategories ?? []);
  if (remove.size) {
    next.mustHaves = next.mustHaves.filter((c) => !remove.has(c));
    next.wants = next.wants.filter((c) => !remove.has(c));
  }
  for (const c of patch.addMustHaves ?? []) {
    if (!next.mustHaves.includes(c)) next.mustHaves.push(c);
    next.wants = next.wants.filter((w) => w !== c);
    next.alreadyOwn = next.alreadyOwn.filter((w) => w !== c);
  }
  for (const c of patch.addWants ?? []) {
    if (!next.wants.includes(c) && !next.mustHaves.includes(c)) next.wants.push(c);
  }
  for (const c of patch.addAlreadyOwn ?? []) {
    if (!next.alreadyOwn.includes(c)) next.alreadyOwn.push(c);
    next.mustHaves = next.mustHaves.filter((w) => w !== c);
    next.wants = next.wants.filter((w) => w !== c);
  }
  for (const id of patch.forceIncludeIds ?? []) {
    if (!next.forceIncludeIds!.includes(id)) next.forceIncludeIds!.push(id);
  }
  for (const id of patch.forceExcludeIds ?? []) {
    if (!next.forceExcludeIds!.includes(id)) next.forceExcludeIds!.push(id);
  }
  return next;
}

export function describeChange(
  beforeInput: DecisionInput,
  afterInput: DecisionInput,
): string[] {
  const lines: string[] = [];
  if (afterInput.budget !== beforeInput.budget) {
    const d = afterInput.budget - beforeInput.budget;
    lines.push(
      d > 0
        ? `Budget increased by $${d} to $${afterInput.budget}.`
        : `Budget decreased by $${-d} to $${afterInput.budget}.`,
    );
  }
  if ((afterInput.minRemaining ?? 0) !== (beforeInput.minRemaining ?? 0)) {
    lines.push(
      `Now holding back at least $${afterInput.minRemaining ?? 0}.`,
    );
  }
  const bp = beforeInput.priorities;
  const ap = afterInput.priorities;
  if (
    bp.performance !== ap.performance ||
    bp.value !== ap.value ||
    bp.longevity !== ap.longevity ||
    bp.portability !== ap.portability ||
    bp.quality !== ap.quality
  ) {
    lines.push("Priorities were reweighted.");
  }
  const removedMust = beforeInput.mustHaves.filter(
    (c) => !afterInput.mustHaves.includes(c),
  );
  const addedMust = afterInput.mustHaves.filter(
    (c) => !beforeInput.mustHaves.includes(c),
  );
  if (removedMust.length) lines.push(`Removed requirement: ${removedMust.join(", ")}.`);
  if (addedMust.length) lines.push(`Added requirement: ${addedMust.join(", ")}.`);
  const removedWant = beforeInput.wants.filter((c) => !afterInput.wants.includes(c));
  if (removedWant.length) lines.push(`Dropped want: ${removedWant.join(", ")}.`);
  const addedForce = (afterInput.forceIncludeIds ?? []).filter(
    (id) => !(beforeInput.forceIncludeIds ?? []).includes(id),
  );
  if (addedForce.length) {
    lines.push(`Locked in specific products (${addedForce.length}).`);
  }
  if (lines.length === 0) lines.push("Constraints were unchanged.");
  return lines;
}
