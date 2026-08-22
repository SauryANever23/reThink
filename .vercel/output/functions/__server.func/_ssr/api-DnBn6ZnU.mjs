import { o as object, r as custom, s as string, t as _enum } from "../_libs/zod.mjs";
import { i as decisionInputSchema, r as categories, s as products } from "./catalog-gU5nJfsC.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { n as deterministicWhatChanged, t as deterministicExplain } from "./explain-BJsrWi72.mjs";
import { a as normalizeGoals, c as performanceScore, i as emptyPriorities, l as productCoversGoal, n as bundleKey, o as normalizeWeights, r as conservativeScore, s as overallScore, t as buildBundle, u as valueScore } from "./scoring-DVLqGuVq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DnBn6ZnU.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function cheapestMustHaveBundle(input, catalog) {
	const weights = normalizeWeights(input.priorities);
	const exclude = new Set(input.forceExcludeIds ?? []);
	const owned = new Set(input.alreadyOwn);
	const products = [];
	const force = (input.forceIncludeIds ?? []).map((id) => catalog.find((p) => p.id === id)).filter((p) => Boolean(p));
	products.push(...force);
	const forcedCats = new Set(force.map((p) => p.category));
	for (const cat of input.mustHaves) {
		if (owned.has(cat) || forcedCats.has(cat)) continue;
		const options = catalog.filter((p) => p.category === cat && !exclude.has(p.id)).sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
		if (!options[0]) return null;
		products.push(options[0]);
	}
	return buildBundle(products, input, catalog, weights);
}
function strengthLines(bundle) {
	const lines = [];
	for (const p of bundle.products) {
		const a = p.attributes;
		const highs = [];
		if (a.performance >= 82) highs.push("performance");
		if (a.longevity >= 85) highs.push("longevity");
		if (a.portability >= 85) highs.push("portability");
		if (a.quality >= 85) highs.push("build quality");
		if (a.battery >= 85) highs.push("battery life");
		if (highs.length) lines.push(`${p.name} is strong on ${highs.join(", ")}`);
	}
	return lines.slice(0, 3);
}
function skippedUpgrades(bundle, catalog, budget) {
	const lines = [];
	const selectedIds = new Set(bundle.products.map((p) => p.id));
	for (const p of bundle.products) {
		const top = catalog.filter((c) => c.category === p.category && !selectedIds.has(c.id) && c.price > p.price && c.price <= p.price + bundle.remaining + 40 && c.attributes.performance - p.attributes.performance >= 6).sort((a, b) => b.attributes.performance - a.attributes.performance)[0];
		if (top) {
			const delta = top.price - p.price;
			lines.push(`${top.name} in ${p.category} (+$${delta} for higher performance)`);
		}
	}
	if (lines.length === 0) {
		const unaffordable = catalog.filter((c) => c.price > budget && !selectedIds.has(c.id) && bundle.products.some((p) => p.category === c.category)).sort((a, b) => a.price - b.price);
		if (unaffordable[0]) lines.push(`${unaffordable[0].name} sits above this budget at $${unaffordable[0].price}`);
	}
	return lines.slice(0, 3);
}
function alternativeUses(extra, selected, catalog, input) {
	const uses = [];
	uses.push({
		label: `Keep ${Math.round(extra)} as savings`,
		items: ["Unspent cash — optionality for later"],
		cost: 0
	});
	const selectedIds = new Set(selected.products.map((p) => p.id));
	const selectedCats = new Set(selected.products.map((p) => p.category));
	const pool = catalog.filter((p) => {
		if (selectedIds.has(p.id)) return false;
		if (input.alreadyOwn.includes(p.category)) return false;
		if (selectedCats.has(p.category) && p.price >= 80) return false;
		return p.price <= extra && p.price >= 25;
	}).sort((a, b) => b.price - a.price || a.id.localeCompare(b.id));
	const singles = pool.slice(0, 4);
	for (const p of singles) uses.push({
		label: p.name,
		items: [p.name],
		cost: p.price
	});
	for (let i = 0; i < pool.length; i++) {
		for (let j = i + 1; j < pool.length; j++) {
			const a = pool[i];
			const b = pool[j];
			if (a.category === b.category) continue;
			const cost = a.price + b.price;
			if (cost <= extra && cost >= extra * .45) uses.push({
				label: `${a.name} + ${b.name}`,
				items: [a.name, b.name],
				cost
			});
			if (uses.length >= 8) break;
		}
		if (uses.length >= 8) break;
	}
	const seen = /* @__PURE__ */ new Set();
	const unique = [];
	for (const u of uses) {
		const key = u.items.slice().sort().join("|");
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push(u);
	}
	return unique.slice(0, 5);
}
function computeOpportunityCost(selected, others, input, catalog) {
	const cheapestCost = cheapestMustHaveBundle(input, catalog)?.cost ?? 0;
	const extra = Math.max(0, selected.bundle.cost - cheapestCost);
	const goals = normalizeGoals(input.goals);
	const youGain = [];
	if (input.mustHaves.length > 0) youGain.push(`All mandatory requirements covered (${input.mustHaves.join(", ")})`);
	for (const g of selected.bundle.coveredGoals) youGain.push(`Supports ${g}`);
	for (const w of selected.bundle.includedWants) {
		const item = selected.bundle.products.find((p) => p.category === w);
		if (item) youGain.push(`Want included: ${item.name}`);
	}
	if (selected.bundle.remaining >= 1) youGain.push(`$${Math.round(selected.bundle.remaining)} remaining`);
	else youGain.push("Budget fully allocated");
	youGain.push(...strengthLines(selected.bundle));
	const youGiveUp = [];
	for (const w of selected.bundle.missingWants) youGiveUp.push(`No ${w} in this kit`);
	youGiveUp.push(...skippedUpgrades(selected.bundle, catalog, input.budget));
	const conservative = others.find((s) => s.id === "conservative");
	if (conservative && conservative.id !== selected.id && conservative.bundle.remaining > selected.bundle.remaining + 15) {
		const delta = Math.round(conservative.bundle.remaining - selected.bundle.remaining);
		youGiveUp.push(`$${delta} of additional savings vs the conservative kit`);
	}
	const bestPerf = others.find((s) => s.id === "performance_first");
	if (bestPerf && bestPerf.id !== selected.id && bestPerf.bundle.performanceUtility > selected.bundle.performanceUtility + 4) {
		const names = bestPerf.bundle.products.filter((p) => !selected.bundle.products.some((s) => s.id === p.id)).map((p) => p.name);
		if (names[0]) youGiveUp.push(`Higher-capability option: ${names[0]}`);
	}
	const uncovered = goals.filter((g) => !selected.bundle.products.some((p) => productCoversGoal(p, g)));
	for (const g of uncovered) youGiveUp.push(`Weaker coverage for ${g}`);
	if (selected.bundle.mustHaveGoalCoverage < 1 && goals.length > 0) {
		const primaryMiss = goals.filter((g) => !selected.bundle.products.filter((p) => input.mustHaves.includes(p.category) || (input.forceIncludeIds ?? []).includes(p.id)).some((p) => productCoversGoal(p, g)));
		for (const g of primaryMiss) youGiveUp.push(`The required item is a weak fit for ${g}`);
	}
	const vsOtherStrategies = others.filter((s) => s.id !== selected.id).map((s) => {
		const gained = s.bundle.products.filter((p) => !selected.bundle.products.some((x) => x.id === p.id)).map((p) => p.name);
		const lost = selected.bundle.products.filter((p) => !s.bundle.products.some((x) => x.id === p.id)).map((p) => p.name);
		return {
			strategyId: s.id,
			strategyName: s.name,
			gainedProducts: gained,
			lostProducts: lost,
			costDelta: s.bundle.cost - selected.bundle.cost,
			utilityDelta: s.bundle.avgUtility - selected.bundle.avgUtility,
			remainingDelta: s.bundle.remaining - selected.bundle.remaining
		};
	});
	return {
		extraSpentVsCheapest: extra,
		cheapestMustHaveCost: cheapestCost,
		youGain: uniqueLines(youGain).slice(0, 7),
		youGiveUp: uniqueLines(youGiveUp).slice(0, 7),
		instead: alternativeUses(extra || selected.bundle.remaining, selected.bundle, catalog, input),
		vsOtherStrategies
	};
}
function uniqueLines(lines) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const l of lines) {
		if (seen.has(l)) continue;
		seen.add(l);
		out.push(l);
	}
	return out;
}
var BEAM_WIDTH = 2800;
var BRUTE_CAP = 18e3;
function estimatedCombos(slots) {
	let n = 1;
	for (const s of slots) {
		const choices = s.options.length + (s.required ? 0 : 1);
		n *= Math.max(1, choices);
		if (n > 1e6) return n;
	}
	return n;
}
function comparePartial(a, b) {
	if (a.spent !== b.spent) return a.spent - b.spent;
	const ka = a.products.map((p) => p.id).join("|");
	const kb = b.products.map((p) => p.id).join("|");
	return ka.localeCompare(kb);
}
function enumerateBundles(slots, budget) {
	if (slots.length === 0) return [[]];
	if (estimatedCombos(slots) <= BRUTE_CAP) {
		const results = [];
		const rec = (i, chosen, spent) => {
			if (i === slots.length) {
				results.push(chosen.slice());
				return;
			}
			const slot = slots[i];
			if (!slot.required) rec(i + 1, chosen, spent);
			for (const p of slot.options) if (spent + p.price <= budget) {
				chosen.push(p);
				rec(i + 1, chosen, spent + p.price);
				chosen.pop();
			}
		};
		rec(0, [], 0);
		return results;
	}
	let beam = [{
		products: [],
		spent: 0
	}];
	for (const slot of slots) {
		const next = [];
		for (const b of beam) {
			if (!slot.required) next.push(b);
			for (const p of slot.options) if (b.spent + p.price <= budget) next.push({
				products: [...b.products, p],
				spent: b.spent + p.price
			});
		}
		next.sort(comparePartial);
		beam = next.slice(0, BEAM_WIDTH);
	}
	return beam.map((b) => b.products);
}
function cheapestMustHaves(mustHaves, catalog, excludeIds) {
	const out = [];
	for (const cat of mustHaves) {
		const first = catalog.filter((p) => p.category === cat && !excludeIds.has(p.id)).sort((a, b) => a.price - b.price || a.id.localeCompare(b.id))[0];
		if (first) out.push({
			name: first.name,
			price: first.price,
			category: cat
		});
	}
	return out;
}
function isParetoEfficient(bundle, others) {
	for (const o of others) {
		if (o === bundle) continue;
		const betterOrEqual = o.avgUtility >= bundle.avgUtility - 1e-9 && o.remaining >= bundle.remaining - 1e-9 && o.goalCoverage >= bundle.goalCoverage - 1e-9;
		const strictlyBetter = o.avgUtility > bundle.avgUtility + 1e-9 || o.remaining > bundle.remaining + 1e-9 || o.goalCoverage > bundle.goalCoverage + 1e-9;
		if (betterOrEqual && strictlyBetter) return false;
	}
	return true;
}
function pickDistinct(ranked, taken) {
	for (const row of ranked) {
		const key = bundleKey(row.bundle.products);
		if (!taken.has(key)) {
			taken.add(key);
			return row;
		}
	}
	return ranked[0] ?? null;
}
var STRATEGY_META = {
	best_overall: {
		name: "Best Overall",
		tagline: "The strongest balance of your priorities, coverage, and spend."
	},
	performance_first: {
		name: "Performance First",
		tagline: "Maximize the capability of the kit, even if it spends more."
	},
	best_value: {
		name: "Best Value",
		tagline: "The most useful outcome per dollar actually spent."
	},
	conservative: {
		name: "Conservative",
		tagline: "Cover what you must, keep as much money as you can."
	}
};
function optimize(input, catalog) {
	if (!Number.isFinite(input.budget) || input.budget < 0) return {
		ok: false,
		error: "invalid",
		message: "Budget must be a number of zero or more."
	};
	if (input.mustHaves.length === 0 && input.wants.length === 0) return {
		ok: false,
		error: "empty",
		message: "Add at least one must-have or want so there is something to decide."
	};
	const weights = normalizeWeights(input.priorities);
	const exclude = new Set(input.forceExcludeIds ?? []);
	const owned = new Set(input.alreadyOwn);
	const forceInclude = (input.forceIncludeIds ?? []).map((id) => catalog.find((p) => p.id === id)).filter((p) => p !== void 0 && !exclude.has(p.id));
	for (const p of forceInclude) if (owned.has(p.category)) owned.delete(p.category);
	const forcedCost = forceInclude.reduce((s, p) => s + p.price, 0);
	const forcedCats = new Set(forceInclude.map((p) => p.category));
	const minRemaining = Math.max(0, input.minRemaining ?? 0);
	const spendCap = input.budget - minRemaining;
	if (forcedCost > spendCap) {
		const minBudget = forcedCost + minRemaining;
		return {
			ok: false,
			error: "infeasible",
			message: minRemaining > 0 ? `The required items already cost ${forcedCost}, which leaves less than the $${minRemaining} you asked to save.` : "The items you required already exceed the budget.",
			minimumBudget: minBudget,
			additionalNeeded: Math.max(0, minBudget - input.budget),
			cheapestMustHaves: forceInclude.map((p) => ({
				name: p.name,
				price: p.price,
				category: p.category
			}))
		};
	}
	const mustHaves = input.mustHaves.filter((c) => !owned.has(c) && !forcedCats.has(c));
	const wants = input.wants.filter((c) => !owned.has(c) && !forcedCats.has(c) && !mustHaves.includes(c));
	const missingCats = [];
	for (const cat of mustHaves) if (catalog.filter((p) => p.category === cat && !exclude.has(p.id) && p.price <= spendCap).length === 0) missingCats.push(cat);
	const cheapest = cheapestMustHaves([...mustHaves, ...forceInclude.map((p) => p.category)], catalog, exclude);
	const minMustCost = cheapest.reduce((s, p) => s + p.price, 0) + forceInclude.filter((p) => !cheapest.some((c) => c.category === p.category)).reduce((s, p) => s + p.price, 0);
	if (missingCats.length > 0 || minMustCost > spendCap) {
		const minimumBudget = minMustCost + minRemaining;
		return {
			ok: false,
			error: "infeasible",
			message: missingCats.length > 0 ? `No product in the catalog can cover: ${missingCats.join(", ")}.` : "No feasible decision satisfies all mandatory requirements.",
			minimumBudget,
			additionalNeeded: Math.max(0, minimumBudget - input.budget),
			cheapestMustHaves: cheapest
		};
	}
	const slots = [];
	for (const cat of mustHaves) {
		const options = catalog.filter((p) => p.category === cat && !exclude.has(p.id)).sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
		slots.push({
			category: cat,
			required: true,
			options
		});
	}
	for (const cat of wants) {
		const options = catalog.filter((p) => p.category === cat && !exclude.has(p.id)).sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
		if (options.length) slots.push({
			category: cat,
			required: false,
			options
		});
	}
	const combos = enumerateBundles(slots, spendCap - forcedCost);
	const feasible = [];
	const seen = /* @__PURE__ */ new Set();
	for (const combo of combos) {
		const products = [...forceInclude, ...combo];
		const key = bundleKey(products);
		if (seen.has(key)) continue;
		seen.add(key);
		const bundle = buildBundle(products, input, catalog, weights);
		if (bundle.cost > spendCap + 1e-6) continue;
		const coversMust = mustHaves.every((c) => products.some((p) => p.category === c));
		const coversForced = forceInclude.every((f) => products.some((p) => p.id === f.id));
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
			cheapestMustHaves: cheapest
		};
	}
	const overallRanked = feasible.map((b) => ({
		bundle: b,
		score: overallScore(b, input.budget)
	})).sort((a, b) => b.score - a.score || bundleKey(a.bundle.products).localeCompare(bundleKey(b.bundle.products)));
	const perfRanked = feasible.map((b) => ({
		bundle: b,
		score: performanceScore(b)
	})).sort((a, b) => b.score - a.score || bundleKey(a.bundle.products).localeCompare(bundleKey(b.bundle.products)));
	const valueRanked = feasible.map((b) => ({
		bundle: b,
		score: valueScore(b)
	})).sort((a, b) => b.score - a.score || bundleKey(a.bundle.products).localeCompare(bundleKey(b.bundle.products)));
	const consRanked = feasible.map((b) => ({
		bundle: b,
		score: conservativeScore(b, input.budget)
	})).sort((a, b) => b.score - a.score || bundleKey(a.bundle.products).localeCompare(bundleKey(b.bundle.products)));
	const taken = /* @__PURE__ */ new Set();
	const picks = [];
	const order = [
		{
			id: "best_overall",
			ranked: overallRanked
		},
		{
			id: "performance_first",
			ranked: perfRanked
		},
		{
			id: "best_value",
			ranked: valueRanked
		},
		{
			id: "conservative",
			ranked: consRanked
		}
	];
	for (const { id, ranked } of order) {
		const row = pickDistinct(ranked, taken);
		if (row) picks.push({
			id,
			row
		});
	}
	const pickBundles = picks.map((p) => p.row.bundle);
	const strategies = picks.map(({ id, row }) => {
		const meta = STRATEGY_META[id];
		return {
			id,
			name: meta.name,
			tagline: meta.tagline,
			bundle: row.bundle,
			score: row.score,
			paretoEfficient: isParetoEfficient(row.bundle, pickBundles)
		};
	});
	const paretoNote = strategies.filter((s) => s.paretoEfficient).length <= 1 ? "One of these strategies dominates the others on utility, leftover money, and goal coverage." : "There is no universally perfect choice. Improving one objective requires sacrificing another.";
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
				vsOtherStrategies: []
			}
		})),
		recommendedId: "best_overall",
		feasibleCount: feasible.length,
		paretoNote
	};
}
var PRIORITY_WORDS = [
	{
		key: "performance",
		words: [
			"performance",
			"power",
			"speed",
			"fast",
			"gpu"
		]
	},
	{
		key: "value",
		words: [
			"value",
			"cheap",
			"price",
			"budget",
			"affordable"
		]
	},
	{
		key: "longevity",
		words: [
			"longevity",
			"durable",
			"last",
			"repair",
			"years"
		]
	},
	{
		key: "portability",
		words: [
			"portability",
			"portable",
			"light",
			"travel",
			"thin"
		]
	},
	{
		key: "quality",
		words: [
			"quality",
			"premium",
			"build"
		]
	}
];
function money(s, re) {
	const m = s.match(re);
	if (!m?.[1]) return void 0;
	return Number(m[1]);
}
function parseWhatIfHeuristic(question, input, products, categories) {
	const s = question.toLowerCase().replace(/,/g, "");
	const patch = { summary: question.trim() };
	const parts = [];
	const more = money(s, /(?:had|have|with|got|add(?:ed)?|extra|another)?\s*\$?\s*(\d{2,6})\s*(?:more|extra|additional|on top)/);
	const more2 = money(s, /(?:increase|raise|boost)(?: the)? budget (?:by |to )?\$?\s*(\d{2,6})/);
	if (more != null) {
		patch.budgetDelta = more;
		parts.push(`increase budget by $${more}`);
	} else if (more2 != null && /by /.test(s)) {
		patch.budgetDelta = more2;
		parts.push(`increase budget by $${more2}`);
	} else {
		const setTo = money(s, /(?:had|have|budget of|budget is|set budget(?: to)?|with a budget of)\s*\$?\s*(\d{3,6})/);
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
	const boosted = {};
	let boostCount = 0;
	for (const { key, words } of PRIORITY_WORDS) if (words.some((w) => s.includes(w)) && /priority|top|first|maximize|maximise|focus|care|matter|important/.test(s)) {
		boosted[key] = 70;
		boostCount += 1;
		parts.push(`make ${key} the top priority`);
	}
	if (boostCount > 0) {
		const next = { ...emptyPriorities() };
		for (const k of Object.keys(next)) next[k] = boosted[k] ?? 8;
		patch.priorities = next;
	}
	const removeCats = [];
	for (const cat of categories) if ([
		cat.id,
		cat.singular,
		cat.label.toLowerCase()
	].some((n) => {
		return new RegExp(`(?:remove|skip|drop|without|no|don't need|do not need|exclude)\\s+(?:the |a |an |my )?${n}`).test(s);
	})) removeCats.push(cat.id);
	if (removeCats.length) {
		patch.removeCategories = removeCats;
		parts.push(`remove ${removeCats.join(", ")}`);
	}
	const addMust = [];
	for (const cat of categories) if ([
		cat.id,
		cat.singular,
		cat.label.toLowerCase()
	].some((n) => new RegExp(`(?:must have|need|require|absolutely need)\\s+(?:a |an |the |this )?${n}`).test(s)) && !input.mustHaves.includes(cat.id)) addMust.push(cat.id);
	if (addMust.length) {
		patch.addMustHaves = addMust;
		parts.push(`require ${addMust.join(", ")}`);
	}
	const forceIds = [];
	const sorted = [...products].sort((a, b) => b.name.length - a.name.length);
	for (const p of sorted) {
		const name = p.name.toLowerCase();
		if (name.length < 5) continue;
		if (s.includes(name) && /need|must|require|force|absolutely|lock|choose|pick|want the/.test(s)) {
			forceIds.push(p.id);
			break;
		}
		const short = name.replace(/\s+\d+.*$/, "");
		if (short.length >= 8 && s.includes(short) && /need|must|require|absolutely|lock/.test(s)) {
			forceIds.push(p.id);
			break;
		}
	}
	if (forceIds.length) {
		patch.forceIncludeIds = forceIds;
		const names = forceIds.map((id) => products.find((p) => p.id === id)?.name ?? id).join(", ");
		parts.push(`require ${names}`);
	}
	patch.summary = parts.length ? parts.join("; ") : "No structured change detected";
	return patch;
}
function applyWhatIfPatch(input, patch) {
	const next = {
		...input,
		goals: [...input.goals],
		mustHaves: [...input.mustHaves],
		wants: [...input.wants],
		alreadyOwn: [...input.alreadyOwn],
		priorities: { ...input.priorities },
		forceIncludeIds: [...input.forceIncludeIds ?? []],
		forceExcludeIds: [...input.forceExcludeIds ?? []],
		minRemaining: input.minRemaining
	};
	if (patch.budgetSet != null) next.budget = Math.max(0, patch.budgetSet);
	if (patch.budgetDelta != null) next.budget = Math.max(0, next.budget + patch.budgetDelta);
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
	for (const c of patch.addWants ?? []) if (!next.wants.includes(c) && !next.mustHaves.includes(c)) next.wants.push(c);
	for (const c of patch.addAlreadyOwn ?? []) {
		if (!next.alreadyOwn.includes(c)) next.alreadyOwn.push(c);
		next.mustHaves = next.mustHaves.filter((w) => w !== c);
		next.wants = next.wants.filter((w) => w !== c);
	}
	for (const id of patch.forceIncludeIds ?? []) if (!next.forceIncludeIds.includes(id)) next.forceIncludeIds.push(id);
	for (const id of patch.forceExcludeIds ?? []) if (!next.forceExcludeIds.includes(id)) next.forceExcludeIds.push(id);
	return next;
}
function describeChange(beforeInput, afterInput) {
	const lines = [];
	if (afterInput.budget !== beforeInput.budget) {
		const d = afterInput.budget - beforeInput.budget;
		lines.push(d > 0 ? `Budget increased by $${d} to $${afterInput.budget}.` : `Budget decreased by $${-d} to $${afterInput.budget}.`);
	}
	if ((afterInput.minRemaining ?? 0) !== (beforeInput.minRemaining ?? 0)) lines.push(`Now holding back at least $${afterInput.minRemaining ?? 0}.`);
	const bp = beforeInput.priorities;
	const ap = afterInput.priorities;
	if (bp.performance !== ap.performance || bp.value !== ap.value || bp.longevity !== ap.longevity || bp.portability !== ap.portability || bp.quality !== ap.quality) lines.push("Priorities were reweighted.");
	const removedMust = beforeInput.mustHaves.filter((c) => !afterInput.mustHaves.includes(c));
	const addedMust = afterInput.mustHaves.filter((c) => !beforeInput.mustHaves.includes(c));
	if (removedMust.length) lines.push(`Removed requirement: ${removedMust.join(", ")}.`);
	if (addedMust.length) lines.push(`Added requirement: ${addedMust.join(", ")}.`);
	const removedWant = beforeInput.wants.filter((c) => !afterInput.wants.includes(c));
	if (removedWant.length) lines.push(`Dropped want: ${removedWant.join(", ")}.`);
	const addedForce = (afterInput.forceIncludeIds ?? []).filter((id) => !(beforeInput.forceIncludeIds ?? []).includes(id));
	if (addedForce.length) lines.push(`Locked in specific products (${addedForce.length}).`);
	if (lines.length === 0) lines.push("Constraints were unchanged.");
	return lines;
}
function recommend(input, catalog) {
	const result = optimize(input, catalog);
	if (!result.ok) return result;
	const base = result.strategies.map((s) => ({
		id: s.id,
		name: s.name,
		tagline: s.tagline,
		bundle: s.bundle,
		score: s.score,
		paretoEfficient: s.paretoEfficient
	}));
	return {
		...result,
		strategies: result.strategies.map((s) => ({
			...s,
			opportunityCost: computeOpportunityCost(s, base, input, catalog)
		}))
	};
}
function runWhatIf(args) {
	const heuristic = parseWhatIfHeuristic(args.question, args.input, args.catalog, args.categories);
	const patch = args.modelPatch && args.modelPatch.summary ? args.modelPatch : heuristic;
	const parsedBy = args.modelPatch && args.modelPatch.summary ? "model" : "heuristic";
	const nextInput = applyWhatIfPatch(args.input, patch);
	return {
		patch,
		parsedBy,
		before: recommend(args.input, args.catalog),
		after: recommend(nextInput, args.catalog),
		changed: describeChange(args.input, nextInput)
	};
}
var getCatalog_createServerFn_handler = createServerRpc({
	id: "4c379969150198f4ca48a83bec4c02a94fbed9ae3fb57e8eb155161b28d4b863",
	name: "getCatalog",
	filename: "src/lib/api.ts"
}, (opts) => getCatalog.__executeServer(opts));
var getCatalog = createServerFn({ method: "GET" }).handler(getCatalog_createServerFn_handler, async () => {
	return {
		products,
		categories
	};
});
var generateRecommendation_createServerFn_handler = createServerRpc({
	id: "0e4855404190be99f6bb3be799a6a566508c15f01b550107c4de99536197d4d2",
	name: "generateRecommendation",
	filename: "src/lib/api.ts"
}, (opts) => generateRecommendation.__executeServer(opts));
var generateRecommendation = createServerFn({ method: "POST" }).validator((input) => decisionInputSchema.parse(input)).handler(generateRecommendation_createServerFn_handler, async ({ data }) => {
	return recommend(data, products);
});
var whatIfRequestSchema = object({
	input: decisionInputSchema,
	question: string().trim().min(3).max(400)
});
var applyWhatIf_createServerFn_handler = createServerRpc({
	id: "704c2ab8850cce902be47f3f66a25a8b8aa330163244e274f357f5d2683f9010",
	name: "applyWhatIf",
	filename: "src/lib/api.ts"
}, (opts) => applyWhatIf.__executeServer(opts));
var applyWhatIf = createServerFn({ method: "POST" }).validator((input) => whatIfRequestSchema.parse(input)).handler(applyWhatIf_createServerFn_handler, async ({ data }) => {
	const { parseWhatIfWithModel, explainWithModel } = await import("./ai.server-sQs6eusQ.mjs");
	const modelPatch = await parseWhatIfWithModel(data.question, data.input, products);
	const result = runWhatIf({
		input: data.input,
		question: data.question,
		catalog: products,
		categories,
		modelPatch
	});
	const beforeKit = result.before.ok ? result.before.strategies.find((s) => result.before.ok && s.id === result.before.recommendedId) : void 0;
	const afterKit = result.after.ok ? result.after.strategies.find((s) => result.after.ok && s.id === result.after.recommendedId) : void 0;
	const fallback = deterministicWhatChanged({
		changed: result.changed,
		beforeName: beforeKit?.bundle.products.map((p) => p.name).join(", "),
		afterName: afterKit?.bundle.products.map((p) => p.name).join(", "),
		beforeCost: beforeKit?.bundle.cost,
		afterCost: afterKit?.bundle.cost
	});
	let narrative = fallback;
	if (result.before.ok && result.after.ok) narrative = await explainWithModel(`Explain in 2 short paragraphs what changed in this decision. Use ONLY this data. No invented products or numbers.

Change: ${result.changed.join(" ")}
Patch: ${result.patch.summary}
Before kit: ${JSON.stringify(beforeKit?.bundle.products.map((p) => ({
		name: p.name,
		price: p.price
	})))}
After kit: ${JSON.stringify(afterKit?.bundle.products.map((p) => ({
		name: p.name,
		price: p.price
	})))}
Before remaining: ${beforeKit?.bundle.remaining}
After remaining: ${afterKit?.bundle.remaining}`) ?? fallback;
	return {
		...result,
		narrative
	};
});
var explainRequestSchema = object({
	strategyId: _enum([
		"best_overall",
		"performance_first",
		"best_value",
		"conservative"
	]),
	result: custom((v) => Boolean(v && v.ok))
});
var explainDecision_createServerFn_handler = createServerRpc({
	id: "89113a70e32c250386cf5d8c659eed2432cb418baca99290dbbc3ce71e5f18e6",
	name: "explainDecision",
	filename: "src/lib/api.ts"
}, (opts) => explainDecision.__executeServer(opts));
var explainDecision = createServerFn({ method: "POST" }).validator((input) => explainRequestSchema.parse(input)).handler(explainDecision_createServerFn_handler, async ({ data }) => {
	const { explainWithModel } = await import("./ai.server-sQs6eusQ.mjs");
	const strategy = data.result.strategies.find((s) => s.id === data.strategyId) ?? data.result.strategies[0];
	if (!strategy) throw new Error("Strategy not found.");
	const fallback = deterministicExplain(data.result, strategy);
	const text = await explainWithModel(`Write a calm 3-paragraph explanation of this buying decision for a thoughtful adult. Use ONLY this JSON. Never invent products, prices, or scores. Emphasize opportunity cost — what is gained, given up, and what else the extra money could have bought.

${JSON.stringify({
		strategy: strategy.name,
		budget: data.result.input.budget,
		spent: strategy.bundle.cost,
		remaining: strategy.bundle.remaining,
		products: strategy.bundle.products.map((p) => ({
			name: p.name,
			price: p.price,
			category: p.category
		})),
		utility: Math.round(strategy.bundle.avgUtility),
		goalCoverage: Math.round(strategy.bundle.goalCoverage * 100),
		opportunityCost: strategy.opportunityCost
	})}`);
	return {
		text: text ?? fallback,
		source: text ? "model" : "deterministic"
	};
});
//#endregion
export { applyWhatIf_createServerFn_handler, explainDecision_createServerFn_handler, generateRecommendation_createServerFn_handler, getCatalog_createServerFn_handler };
