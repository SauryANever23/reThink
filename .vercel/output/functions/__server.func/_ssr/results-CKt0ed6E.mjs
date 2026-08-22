import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as deterministicExplain } from "./explain-BJsrWi72.mjs";
import { a as Scale, i as Shield, l as ArrowRight, o as Gauge, r as Split, s as Coins } from "../_libs/lucide-react.mjs";
import { a as formatMoney, i as cn, n as Button, t as AppHeader } from "./button-ZuOP5dqQ.mjs";
import { i as useDecisionStore, n as explainDecision, t as applyWhatIf } from "./store-CtkFFMdi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/results-CKt0ed6E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	ref,
	className: cn("flex min-h-24 w-full rounded-lg bg-surface px-3 py-2.5 text-base text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle", "transition-[box-shadow] duration-150", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
	...props
}));
Textarea.displayName = "Textarea";
var ICONS = {
	best_overall: Scale,
	performance_first: Gauge,
	best_value: Coins,
	conservative: Shield
};
var WHAT_IF_PRESETS = [
	"What if I had $200 more?",
	"What if performance became my top priority?",
	"What if I remove the monitor?",
	"What if I need to save $300?"
];
function ResultsView() {
	const { result, selectedId, setSelectedId, input, setWhatIf, whatIf, replaceInput, setResult } = useDecisionStore();
	if (!result) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "No decision yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: "Set a budget and constraints first, then generate strategies."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/decide",
					children: "Start a Decision"
				})
			})
		]
	});
	if (!result.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfeasibleView, { result });
	const selected = result.strategies.find((s) => s.id === selectedId) ?? result.strategies[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {
				result,
				selected
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium uppercase tracking-[0.14em] text-muted",
						children: "Four strategies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4",
						children: result.strategies.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StrategyCard, {
							strategy: s,
							budget: result.input.budget,
							active: s.id === selected.id,
							onSelect: () => setSelectedId(s.id)
						}, s.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: result.paretoNote
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breakdown, {
				selected,
				result
			}, selected.id),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatIfPanel, {
				input,
				onApplied: (next) => {
					setWhatIf(next);
					if (next.after.ok) {
						replaceInput(next.after.input);
						setResult(next.after);
						setSelectedId(next.after.recommendedId);
					}
				},
				whatIf
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareTable, {
				result,
				selectedId: selected.id
			})
		]
	});
}
function Hero({ result, selected }) {
	const b = selected.bundle;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rise rounded-xl bg-ink px-5 py-8 text-ink-fg sm:px-10 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.18em] text-ink-fg/50",
				children: "Your best decision"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl tracking-tight sm:text-5xl",
				children: selected.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-ink-fg/70",
				children: selected.tagline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Spent",
						value: `${formatMoney(b.cost)} / ${formatMoney(result.input.budget)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Utility",
						value: `${Math.round(b.avgUtility)}/100`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Goal coverage",
						value: `${Math.round(b.goalCoverage * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Remaining",
						value: formatMoney(b.remaining)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetBar, {
				bundle: b,
				budget: result.input.budget
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs uppercase tracking-[0.14em] text-ink-fg/45",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 font-medium tabular-nums",
		children: value
	})] });
}
function BudgetBar({ bundle, budget }) {
	const tones = [
		"bg-ink-fg",
		"bg-ink-fg/75",
		"bg-ink-fg/55",
		"bg-ink-fg/35"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-2 overflow-hidden rounded-full bg-ink-fg/15",
			children: bundle.products.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: tones[i % tones.length],
				style: { width: `${budget > 0 ? p.price / budget * 100 : 0}%` },
				title: `${p.name} ${formatMoney(p.price)}`
			}, p.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-fg/65",
			children: [bundle.products.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-full", tones[i % tones.length]) }),
					p.name,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: formatMoney(p.price)
					})
				]
			}, p.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "tabular-nums",
				children: [formatMoney(bundle.remaining), " unspent"]
			})]
		})]
	});
}
function StrategyCard({ strategy, budget, active, onSelect }) {
	const Icon = ICONS[strategy.id];
	const b = strategy.bundle;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelect,
		className: cn("rounded-xl p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150", active ? "bg-primary text-primary-fg" : "bg-surface text-fg hover:shadow-[var(--shadow-border-hover)]"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), strategy.paretoEfficient && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-[10px] uppercase tracking-[0.14em]", active ? "text-primary-fg/70" : "text-muted"),
					children: "Pareto"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-3 font-semibold",
				children: strategy.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("mt-3 font-medium tabular-nums", active ? "text-primary-fg" : "text-fg"),
				children: [formatMoney(b.cost), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: active ? "text-primary-fg/70" : "text-muted",
					children: [
						" ",
						"/ ",
						formatMoney(budget)
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("mt-1 text-sm", active ? "text-primary-fg/75" : "text-muted"),
				children: [
					Math.round(b.avgUtility),
					" utility · ",
					formatMoney(b.remaining),
					" left"
				]
			})
		]
	});
}
function Breakdown({ selected, result }) {
	const [explanation, setExplanation] = (0, import_react.useState)(deterministicExplain(result, selected));
	const [source, setSource] = (0, import_react.useState)("deterministic");
	const [pending, setPending] = (0, import_react.useState)(false);
	const oc = selected.opportunityCost;
	const askModel = async () => {
		setPending(true);
		try {
			const res = await explainDecision({ data: {
				result,
				strategyId: selected.id
			} });
			setExplanation(res.text);
			setSource(res.source);
		} catch {
			setExplanation(deterministicExplain(result, selected));
			setSource("deterministic");
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-14 grid gap-6 lg:grid-cols-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:col-span-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl tracking-tight",
					children: "The kit"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-5 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]",
					children: selected.bundle.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-4 px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm capitalize text-muted",
							children: [
								p.category,
								" · ",
								p.summary
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "shrink-0 tabular-nums font-medium",
							children: formatMoney(p.price)
						})]
					}, p.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-relaxed text-muted",
					children: explanation
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					size: "sm",
					className: "mt-4",
					onClick: askModel,
					disabled: pending,
					children: pending ? "Writing…" : source === "model" ? "Regenerate explanation" : "Write a plainer explanation"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:col-span-7 space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-gain-soft p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-gain",
						children: "You gain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2 text-sm leading-snug text-fg",
						children: oc.youGain.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-gain" }), line]
						}, line))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-give-soft p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-give",
						children: "You give up"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2 text-sm leading-snug text-fg",
						children: oc.youGiveUp.length ? oc.youGiveUp.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-give" }), line]
						}, line)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Very little — this is already a restrained kit." })
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-ink p-5 text-ink-fg sm:p-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Split, { className: "size-4 text-ink-fg/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.16em] text-ink-fg/50",
							children: "Your opportunity cost"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl tracking-tight",
						children: oc.extraSpentVsCheapest > 0 ? `You spent an additional ${formatMoney(oc.extraSpentVsCheapest)} above a bare-minimum kit.` : "This kit is already the cheapest way to cover the requirements."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-ink-fg/70",
						children: [
							"A minimum must-have kit would have cost",
							" ",
							formatMoney(oc.cheapestMustHaveCost),
							". That difference is not just money — it is the set of other kits you can no longer buy."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-5 space-y-3",
						children: oc.instead.map((alt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start justify-between gap-4 border-t border-ink-fg/15 pt-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: alt.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 tabular-nums text-ink-fg/60",
								children: alt.cost > 0 ? formatMoney(alt.cost) : "—"
							})]
						}, alt.label))
					})
				]
			})]
		})]
	});
}
function WhatIfPanel({ input, onApplied, whatIf }) {
	const [question, setQuestion] = (0, import_react.useState)("What if I had $200 more?");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const run = async (q) => {
		setPending(true);
		setError(null);
		try {
			onApplied({
				...await applyWhatIf({ data: {
					input,
					question: q
				} }),
				question: q
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not recalculate.");
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-16 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl tracking-tight",
				children: "What if?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-muted",
				children: "Change a constraint in plain language. The optimizer — not the language model — recalculates the kit."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: WHAT_IF_PRESETS.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setQuestion(q);
						run(q);
					},
					className: "h-11 rounded-full bg-bg px-4 text-sm shadow-[var(--shadow-border)]",
					children: q
				}, q))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: question,
					onChange: (e) => setQuestion(e.target.value),
					className: "min-h-20 sm:min-h-11 sm:flex-1"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					onClick: () => void run(question),
					disabled: pending || question.trim().length < 3,
					className: "sm:self-start",
					children: [pending ? "Recalculating…" : "Recalculate", !pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-give",
				role: "alert",
				children: error
			}),
			whatIf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatIfDiff, { whatIf })
		]
	});
}
function WhatIfDiff({ whatIf }) {
	const before = whatIf.before.ok ? whatIf.before.strategies.find((s) => whatIf.before.ok && s.id === whatIf.before.recommendedId) : null;
	const after = whatIf.after.ok ? whatIf.after.strategies.find((s) => whatIf.after.ok && s.id === whatIf.after.recommendedId) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Parsed as: ",
					whatIf.patch.summary,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-subtle",
						children: [
							"(",
							whatIf.parsedBy,
							")"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-bg p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-muted",
						children: "Before"
					}), before ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-medium",
							children: before.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm tabular-nums text-muted",
							children: [
								formatMoney(before.bundle.cost),
								" · ",
								formatMoney(before.bundle.remaining),
								" left"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1 text-sm",
							children: before.bundle.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: p.name }, p.id))
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: "No feasible kit."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-bg p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-muted",
						children: "After"
					}), whatIf.after.ok && after ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-medium",
							children: after.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm tabular-nums text-muted",
							children: [
								formatMoney(after.bundle.cost),
								" · ",
								formatMoney(after.bundle.remaining),
								" left"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1 text-sm",
							children: after.bundle.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: p.name }, p.id))
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfeasibleNote, { result: whatIf.after })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.14em] text-muted",
					children: "What changed"
				}), whatIf.narrative ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: whatIf.narrative
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1 text-sm",
					children: whatIf.changed.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
				})]
			})
		]
	});
}
function InfeasibleNote({ result }) {
	if (result.ok) return null;
	const extra = "minimumBudget" in result ? ` Minimum estimated budget: ${formatMoney(result.minimumBudget)}.` : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-2 text-sm text-give",
		children: [result.message, extra]
	});
}
function CompareTable({ result, selectedId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-3xl tracking-tight",
			children: "Compare"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[36rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border text-xs uppercase tracking-[0.12em] text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Strategy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Spend"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Left"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Utility"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Goals"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Headline item"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.strategies.map((s) => {
					const head = s.bundle.products.find((p) => p.category === "laptop") ?? s.bundle.products[0];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: cn("border-b border-border last:border-0", s.id === selectedId && "bg-gain-soft/60"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-medium",
								children: s.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: formatMoney(s.bundle.cost)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: formatMoney(s.bundle.remaining)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: Math.round(s.bundle.avgUtility)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3 tabular-nums",
								children: [Math.round(s.bundle.goalCoverage * 100), "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: head?.name ?? "—"
							})
						]
					}, s.id);
				}) })]
			})
		})]
	});
}
function InfeasibleView({ result }) {
	const extra = result.error === "infeasible" ? result : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl tracking-tight",
				children: "No feasible decision"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: result.message
			}),
			extra && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Minimum estimated budget required"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-3xl tabular-nums",
						children: formatMoney(extra.minimumBudget)
					}),
					extra.additionalNeeded > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"You need ",
							formatMoney(extra.additionalNeeded),
							" more than the current budget."
						]
					}),
					extra.cheapestMustHaves.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-1 text-sm",
						children: extra.cheapestMustHaves.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "capitalize",
								children: p.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: formatMoney(p.price)
							})]
						}, p.category))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/decide",
					children: "Adjust the brief"
				})
			})
		]
	});
}
function ResultsPage() {
	const hydrate = useDecisionStore((s) => s.hydrate);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		hydrate();
		setReady(true);
	}, [hydrate]);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, { action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			size: "sm",
			variant: "secondary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/decide",
				children: "Edit brief"
			})
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsView, {})]
	});
}
//#endregion
export { ResultsPage as component };
