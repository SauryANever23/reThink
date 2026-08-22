import { o as object, r as custom, s as string, t as _enum } from "../_libs/zod.mjs";
import { a as defaultInput, i as decisionInputSchema, o as demoDecision } from "./catalog-gU5nJfsC.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-CtkFFMdi.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
createServerFn({ method: "GET" }).handler(createSsrRpc("4c379969150198f4ca48a83bec4c02a94fbed9ae3fb57e8eb155161b28d4b863"));
var generateRecommendation = createServerFn({ method: "POST" }).validator((input) => decisionInputSchema.parse(input)).handler(createSsrRpc("0e4855404190be99f6bb3be799a6a566508c15f01b550107c4de99536197d4d2"));
var whatIfRequestSchema = object({
	input: decisionInputSchema,
	question: string().trim().min(3).max(400)
});
var applyWhatIf = createServerFn({ method: "POST" }).validator((input) => whatIfRequestSchema.parse(input)).handler(createSsrRpc("704c2ab8850cce902be47f3f66a25a8b8aa330163244e274f357f5d2683f9010"));
var explainRequestSchema = object({
	strategyId: _enum([
		"best_overall",
		"performance_first",
		"best_value",
		"conservative"
	]),
	result: custom((v) => Boolean(v && v.ok))
});
var explainDecision = createServerFn({ method: "POST" }).validator((input) => explainRequestSchema.parse(input)).handler(createSsrRpc("89113a70e32c250386cf5d8c659eed2432cb418baca99290dbbc3ce71e5f18e6"));
var INPUT_KEY = "rethink.input.v1";
var RESULT_KEY = "rethink.result.v1";
function loadInput() {
	if (typeof window === "undefined") return defaultInput();
	try {
		const raw = localStorage.getItem(INPUT_KEY);
		if (!raw) return defaultInput();
		return {
			...defaultInput(),
			...JSON.parse(raw)
		};
	} catch {
		return defaultInput();
	}
}
function loadResult() {
	if (typeof window === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(RESULT_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
var useDecisionStore = create((set, get) => ({
	input: defaultInput(),
	result: null,
	selectedId: "best_overall",
	whatIf: null,
	hydrate: () => {
		set({
			input: loadInput(),
			result: loadResult()
		});
	},
	patchInput: (partial) => {
		const input = {
			...get().input,
			...partial
		};
		set({ input });
		if (typeof window !== "undefined") localStorage.setItem(INPUT_KEY, JSON.stringify(input));
	},
	replaceInput: (input) => {
		set({ input });
		if (typeof window !== "undefined") localStorage.setItem(INPUT_KEY, JSON.stringify(input));
	},
	setResult: (result) => {
		set({
			result,
			selectedId: result && result.ok ? result.recommendedId : get().selectedId
		});
		if (typeof window !== "undefined") {
			if (result) sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
			else sessionStorage.removeItem(RESULT_KEY);
		}
	},
	setSelectedId: (selectedId) => set({ selectedId }),
	setWhatIf: (whatIf) => set({ whatIf }),
	loadDemo: () => {
		get().replaceInput({
			...defaultInput(),
			...demoDecision
		});
	},
	reset: () => {
		set({
			input: defaultInput(),
			result: null,
			whatIf: null,
			selectedId: "best_overall"
		});
		if (typeof window !== "undefined") {
			localStorage.removeItem(INPUT_KEY);
			sessionStorage.removeItem(RESULT_KEY);
		}
	}
}));
//#endregion
export { useDecisionStore as i, explainDecision as n, generateRecommendation as r, applyWhatIf as t };
