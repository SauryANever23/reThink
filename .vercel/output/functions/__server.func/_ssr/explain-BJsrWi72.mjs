//#region node_modules/.nitro/vite/services/ssr/assets/explain-BJsrWi72.js
function money(amount) {
	return `$${Math.round(amount).toLocaleString("en-US")}`;
}
function deterministicExplain(result, strategy) {
	const b = strategy.bundle;
	const names = b.products.map((p) => p.name).join(", ");
	const oc = strategy.opportunityCost;
	const gain = oc.youGain.slice(0, 3).join("; ");
	const give = oc.youGiveUp.slice(0, 3).join("; ");
	const instead = oc.instead.slice(0, 3).map((u) => u.label).join("; ");
	return [
		`${strategy.name} spends ${money(b.cost)} of ${money(result.input.budget)} (${money(b.remaining)} left) on ${names || "no extra items"}.`,
		`Average utility is ${Math.round(b.avgUtility)}/100 with ${Math.round(b.goalCoverage * 100)}% goal coverage.`,
		gain ? `You gain: ${gain}.` : "",
		give ? `You give up: ${give}.` : "",
		instead ? `The extra spend versus a bare-minimum kit could instead have gone to: ${instead}.` : ""
	].filter(Boolean).join(" ");
}
function deterministicWhatChanged(args) {
	return [
		args.changed.join(" "),
		args.beforeName && args.afterName && args.beforeName !== args.afterName ? `The recommended kit moved from ${args.beforeName} to ${args.afterName}.` : "The recommended kit stayed in the same strategy family.",
		args.beforeCost != null && args.afterCost != null ? `Spend went from ${money(args.beforeCost)} to ${money(args.afterCost)}.` : ""
	].filter(Boolean).join(" ");
}
//#endregion
export { deterministicWhatChanged as n, deterministicExplain as t };
