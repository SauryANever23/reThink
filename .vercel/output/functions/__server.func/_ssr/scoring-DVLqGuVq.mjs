//#region node_modules/.nitro/vite/services/ssr/assets/scoring-DVLqGuVq.js
var PRIORITY_KEYS = [
	"performance",
	"value",
	"longevity",
	"portability",
	"quality"
];
var GOAL_ALIASES = {
	university: "study",
	college: "study",
	school: "study",
	"content creation": "content",
	video: "content",
	photo: "content",
	photography: "content",
	code: "programming",
	coding: "programming",
	developer: "programming",
	dev: "programming",
	office: "work",
	job: "work",
	commute: "travel"
};
function normalizeGoal(raw) {
	const g = raw.trim().toLowerCase();
	return GOAL_ALIASES[g] ?? g;
}
function normalizeGoals(goals) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const g of goals) {
		const n = normalizeGoal(g);
		if (!n || seen.has(n)) continue;
		seen.add(n);
		out.push(n);
	}
	return out;
}
function normalizeWeights(p) {
	let sum = 0;
	for (const k of PRIORITY_KEYS) sum += Math.max(0, p[k] ?? 0);
	if (sum <= 0) return {
		performance: .2,
		value: .2,
		longevity: .2,
		portability: .2,
		quality: .2
	};
	return {
		performance: Math.max(0, p.performance) / sum,
		value: Math.max(0, p.value) / sum,
		longevity: Math.max(0, p.longevity) / sum,
		portability: Math.max(0, p.portability) / sum,
		quality: Math.max(0, p.quality) / sum
	};
}
function productValueScore(product, catalog) {
	const same = catalog.filter((p) => p.category === product.category);
	if (same.length === 0) return 50;
	const min = Math.min(...same.map((p) => p.price));
	const max = Math.max(...same.map((p) => p.price));
	if (max <= min) return 70;
	const inverted = 1 - (product.price - min) / (max - min);
	return Math.round(inverted * 100);
}
function productUtility(product, weights, catalog) {
	const value = productValueScore(product, catalog);
	const a = product.attributes;
	return weights.performance * a.performance + weights.value * value + weights.longevity * a.longevity + weights.portability * a.portability + weights.quality * a.quality;
}
function scoreProduct(product, weights, catalog) {
	const valueScore = productValueScore(product, catalog);
	return {
		product,
		utility: productUtility(product, weights, catalog),
		valueScore,
		performanceUtility: productUtility(product, {
			performance: .7,
			value: .05,
			longevity: .1,
			portability: .05,
			quality: .1
		}, catalog)
	};
}
function productCoversGoal(product, goal) {
	const g = normalizeGoal(goal);
	return product.goals.some((pg) => normalizeGoal(pg) === g);
}
function coveredGoals(products, goals) {
	return normalizeGoals(goals).filter((goal) => products.some((p) => productCoversGoal(p, goal)));
}
function redundancyPenalty(products) {
	if (products.length <= 1) return 0;
	if (new Set(products.map((p) => p.category)).size < products.length) return 12;
	let overlap = 0;
	for (let i = 0; i < products.length; i++) for (let j = i + 1; j < products.length; j++) {
		const a = new Set(products[i].goals.map(normalizeGoal));
		const shared = products[j].goals.filter((g) => a.has(normalizeGoal(g))).length;
		overlap += shared;
	}
	return Math.min(8, overlap * .4);
}
function buildBundle(products, input, catalog, weights) {
	const cost = products.reduce((s, p) => s + p.price, 0);
	const remaining = Math.max(0, input.budget - cost);
	const scored = products.map((p) => scoreProduct(p, weights, catalog));
	const totalUtility = scored.reduce((s, p) => s + p.utility, 0);
	const avgUtility = products.length === 0 ? 0 : totalUtility / products.length;
	const performanceUtility = scored.reduce((s, p) => s + p.performanceUtility, 0);
	const goals = normalizeGoals(input.goals);
	const covered = coveredGoals(products, goals);
	const includedWants = input.wants.filter((w) => products.some((p) => p.category === w));
	const missingWants = input.wants.filter((w) => !input.alreadyOwn.includes(w) && !products.some((p) => p.category === w));
	const wantDenom = input.wants.filter((w) => !input.alreadyOwn.includes(w)).length;
	const wantCoverage = wantDenom === 0 ? 1 : includedWants.length / wantDenom;
	const mustHaveProducts = products.filter((p) => input.mustHaves.includes(p.category) || (input.forceIncludeIds ?? []).includes(p.id));
	const primary = mustHaveProducts.length > 0 ? mustHaveProducts : products.slice(0, 1);
	const primaryScored = primary.map((p) => scoreProduct(p, weights, catalog));
	const primaryUtility = primaryScored.length === 0 ? 0 : primaryScored.reduce((s, p) => s + p.utility, 0) / primaryScored.length;
	const mustHaveGoalCoverage = goals.length === 0 ? 1 : goals.filter((goal) => primary.some((p) => productCoversGoal(p, goal))).length / goals.length;
	return {
		products: [...products].sort((a, b) => a.category.localeCompare(b.category)),
		cost,
		remaining,
		totalUtility,
		avgUtility,
		performanceUtility,
		goalCoverage: goals.length === 0 ? 1 : covered.length / goals.length,
		coveredGoals: covered,
		wantCoverage,
		includedWants,
		missingWants,
		redundancy: redundancyPenalty(products),
		mustHaveGoalCoverage,
		primaryUtility
	};
}
function bundleKey(products) {
	return products.map((p) => p.id).sort().join("|");
}
function overallScore(bundle, budget) {
	const remainRatio = budget <= 0 ? 0 : bundle.remaining / budget;
	return .42 * bundle.primaryUtility + .16 * bundle.avgUtility + .24 * bundle.mustHaveGoalCoverage * 100 + .1 * bundle.wantCoverage * 80 + .08 * remainRatio * 40 - bundle.redundancy;
}
function performanceScore(bundle) {
	const avgPerf = bundle.products.length === 0 ? 0 : bundle.performanceUtility / bundle.products.length;
	const peak = Math.max(0, ...bundle.products.map((p) => p.attributes.performance));
	return .5 * Math.max(0, ...bundle.products.filter((p) => ["laptop", "phone"].includes(p.category)).map((p) => p.attributes.performance), peak * .5) + .25 * avgPerf + .15 * bundle.mustHaveGoalCoverage * 100 + .1 * bundle.goalCoverage * 40 - bundle.redundancy * .5;
}
function valueScore(bundle) {
	return (bundle.primaryUtility * (.4 + .6 * bundle.mustHaveGoalCoverage) + bundle.avgUtility * .25 + bundle.wantCoverage * 8) / Math.max(bundle.cost, 1) * 1200 - bundle.redundancy;
}
function conservativeScore(bundle, budget) {
	return (budget <= 0 ? 0 : bundle.remaining / budget) * 120 + bundle.mustHaveGoalCoverage * 28 + bundle.primaryUtility * .22 - bundle.products.length * 2;
}
function emptyPriorities() {
	return {
		performance: 20,
		value: 20,
		longevity: 20,
		portability: 20,
		quality: 20
	};
}
//#endregion
export { normalizeGoals as a, performanceScore as c, emptyPriorities as i, productCoversGoal as l, bundleKey as n, normalizeWeights as o, conservativeScore as r, overallScore as s, buildBundle as t, valueScore as u };
