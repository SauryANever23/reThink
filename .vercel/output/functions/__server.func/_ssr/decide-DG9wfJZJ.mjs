import { i as __toESM } from "../_runtime.mjs";
import { n as PRIORITY_META, r as categories, t as GOAL_PRESETS } from "./catalog-gU5nJfsC.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link, b as require_jsx_runtime, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as normalizeWeights } from "./scoring-DVLqGuVq.mjs";
import { c as Check, l as ArrowRight, u as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as Route$1 } from "./router-CVffjsMI.mjs";
import { a as formatMoney, i as cn, n as Button, t as AppHeader } from "./button-ZuOP5dqQ.mjs";
import { i as useDecisionStore, r as generateRecommendation } from "./store-CtkFFMdi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/decide-DG9wfJZJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	className: cn("flex h-11 w-full rounded-lg bg-surface px-3 text-base text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle", "transition-[box-shadow] duration-150", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", "disabled:opacity-50", className),
	...props
}));
Input.displayName = "Input";
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-fg", className),
		...props
	});
}
var STEPS = [
	{
		id: "budget",
		label: "Budget"
	},
	{
		id: "goals",
		label: "Goals"
	},
	{
		id: "kit",
		label: "Kit"
	},
	{
		id: "priorities",
		label: "Priorities"
	},
	{
		id: "review",
		label: "Review"
	}
];
function Wizard({ startAtReview }) {
	const navigate = useNavigate();
	const { input, patchInput, setResult, setWhatIf } = useDecisionStore();
	const [step, setStep] = (0, import_react.useState)(startAtReview ? 4 : 0);
	const [customGoal, setCustomGoal] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const weights = (0, import_react.useMemo)(() => normalizeWeights(input.priorities), [input.priorities]);
	const roleOf = (id) => {
		if (input.mustHaves.includes(id)) return "must";
		if (input.wants.includes(id)) return "want";
		if (input.alreadyOwn.includes(id)) return "own";
		return "none";
	};
	const setRole = (id, role) => {
		patchInput({
			mustHaves: input.mustHaves.filter((c) => c !== id),
			wants: input.wants.filter((c) => c !== id),
			alreadyOwn: input.alreadyOwn.filter((c) => c !== id),
			...role === "must" ? { mustHaves: [...input.mustHaves.filter((c) => c !== id), id] } : {},
			...role === "want" ? { wants: [...input.wants.filter((c) => c !== id), id] } : {},
			...role === "own" ? { alreadyOwn: [...input.alreadyOwn.filter((c) => c !== id), id] } : {}
		});
	};
	const toggleGoal = (id) => {
		const has = input.goals.includes(id);
		patchInput({ goals: has ? input.goals.filter((g) => g !== id) : [...input.goals, id] });
	};
	const addCustomGoal = () => {
		const g = customGoal.trim().toLowerCase();
		if (!g) return;
		if (!input.goals.includes(g)) patchInput({ goals: [...input.goals, g] });
		setCustomGoal("");
	};
	const canNext = () => {
		if (step === 0) return input.budget >= 0;
		if (step === 1) return input.goals.length > 0;
		if (step === 2) return input.mustHaves.length + input.wants.length > 0;
		return true;
	};
	const generate = async () => {
		setError(null);
		if (input.mustHaves.length + input.wants.length === 0) {
			setError("Add at least one must-have or want.");
			return;
		}
		setPending(true);
		try {
			const result = await generateRecommendation({ data: input });
			setWhatIf(null);
			setResult(result);
			await navigate({ to: "/results" });
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not generate strategies.");
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mb-10 flex gap-2",
				"aria-label": "Progress",
				children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setStep(i),
						className: "w-full text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("block h-1 rounded-full", i <= step ? "bg-primary" : "bg-surface-2") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("mt-2 hidden text-xs font-medium sm:block", i === step ? "text-fg" : "text-subtle"),
							children: s.label
						})]
					})
				}, s.id))
			}),
			step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "How much can you spend?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-lg text-muted",
						children: "This is a hard ceiling. The engine will never recommend a kit above it."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "budget",
								children: "Budget (USD)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted",
									children: "$"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "budget",
									inputMode: "numeric",
									className: "pl-7 font-medium tabular-nums text-xl h-14",
									value: input.budget,
									onChange: (e) => {
										const n = Number(e.target.value.replace(/[^\d]/g, ""));
										patchInput({ budget: Number.isFinite(n) ? n : 0 });
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [
									500,
									1e3,
									1500,
									2e3
								].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => patchInput({ budget: n }),
									className: cn("h-11 rounded-full px-4 text-sm shadow-[var(--shadow-border)]", input.budget === n ? "bg-primary text-primary-fg" : "bg-surface text-fg"),
									children: formatMoney(n)
								}, n))
							})
						]
					})
				]
			}),
			step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "What is this for?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-lg text-muted",
						children: "Goals steer coverage. They do not force a category on their own."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-2",
						children: [GOAL_PRESETS.map((g) => {
							const on = input.goals.includes(g.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => toggleGoal(g.id),
								className: cn("inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm shadow-[var(--shadow-border)]", on ? "bg-primary text-primary-fg" : "bg-surface text-fg"),
								children: [on && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), g.label]
							}, g.id);
						}), input.goals.filter((g) => !GOAL_PRESETS.some((p) => p.id === g)).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => toggleGoal(g),
							className: "inline-flex h-11 items-center rounded-full bg-primary px-4 text-sm text-primary-fg",
							children: g
						}, g))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Add a custom goal",
							value: customGoal,
							onChange: (e) => setCustomGoal(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addCustomGoal();
								}
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: addCustomGoal,
							children: "Add"
						})]
					})
				]
			}),
			step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "Must, want, already own"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-lg text-muted",
						children: "Must-haves are constraints. Wants are optional. Owned categories are not recommended again."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-8 divide-y divide-border",
						children: categories.map((cat) => {
							const role = roleOf(cat.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: cat.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: cat.hint
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-4 gap-1 rounded-lg bg-surface-2 p-1",
									children: [
										"none",
										"must",
										"want",
										"own"
									].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setRole(cat.id, r),
										className: cn("h-10 rounded-md px-2 text-xs font-medium capitalize", role === r ? "bg-primary text-primary-fg" : "text-muted"),
										children: r === "none" ? "Skip" : r
									}, r))
								})]
							}, cat.id);
						})
					})
				]
			}),
			step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "What should win the trade-off?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-lg text-muted",
						children: "Weights are normalized internally. Zero means you do not care about that axis."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-8 space-y-6",
						children: PRIORITY_META.map((meta) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: meta.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: meta.hint
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "tabular-nums text-sm text-muted",
								children: [Math.round(weights[meta.key] * 100), "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 100,
							value: input.priorities[meta.key],
							"aria-label": meta.label,
							className: "mt-1 w-full",
							onChange: (e) => patchInput({ priorities: {
								...input.priorities,
								[meta.key]: Number(e.target.value)
							} })
						})] }, meta.key))
					})
				]
			}),
			step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "Ready to see the trade-offs?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-muted",
						children: "Four strategies will be scored from this brief. Nothing is invented."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-8 divide-y divide-border rounded-xl bg-surface px-5 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Budget",
								value: formatMoney(input.budget)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Goals",
								value: input.goals.length ? input.goals.join(", ") : "None"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Must have",
								value: input.mustHaves.length ? input.mustHaves.join(", ") : "None"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Want",
								value: input.wants.length ? input.wants.join(", ") : "None"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Already own",
								value: input.alreadyOwn.length ? input.alreadyOwn.join(", ") : "None"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Priorities",
								value: PRIORITY_META.map((m) => `${m.label} ${Math.round(weights[m.key] * 100)}%`).join(" · ")
							})
						]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-give",
						role: "alert",
						children: error
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => setStep((s) => Math.max(0, s - 1)),
					disabled: step === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {}), "Back"]
				}), step < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					onClick: () => canNext() && setStep((s) => s + 1),
					disabled: !canNext(),
					children: ["Continue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					onClick: generate,
					disabled: pending,
					children: [pending ? "Scoring kits…" : "Generate strategies", !pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
				})]
			})
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-sm font-medium capitalize sm:text-right",
			children: value
		})]
	});
}
function DecidePage() {
	const { demo } = Route$1.useSearch();
	const hydrate = useDecisionStore((s) => s.hydrate);
	const loadDemo = useDecisionStore((s) => s.loadDemo);
	const reset = useDecisionStore((s) => s.reset);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		hydrate();
		if (demo) loadDemo();
		setReady(true);
	}, [
		demo,
		hydrate,
		loadDemo
	]);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, { action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: () => reset(),
				children: "Reset"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "secondary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/decide",
					search: { demo: true },
					children: "Load demo"
				})
			})]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wizard, { startAtReview: Boolean(demo) })]
	});
}
//#endregion
export { DecidePage as component };
