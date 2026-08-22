import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coins,
  Gauge,
  Scale,
  Shield,
  Split,
} from "lucide-react";
import { useState } from "react";
import { applyWhatIf, explainDecision } from "@/lib/api";
import { useDecisionStore } from "@/lib/store";
import { cn, formatMoney } from "@/lib/utils";
import { deterministicExplain } from "@/engine/explain.ts";
import type {
  RecommendInfeasible,
  RecommendOk,
  StrategyId,
  StrategyResult,
} from "@/engine/types.ts";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const ICONS: Record<StrategyId, typeof Scale> = {
  best_overall: Scale,
  performance_first: Gauge,
  best_value: Coins,
  conservative: Shield,
};

const WHAT_IF_PRESETS = [
  "What if I had $200 more?",
  "What if performance became my top priority?",
  "What if I remove the monitor?",
  "What if I need to save $300?",
];

export function ResultsView() {
  const { result, selectedId, setSelectedId, input, setWhatIf, whatIf, replaceInput, setResult } =
    useDecisionStore();

  if (!result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">No decision yet</h1>
        <p className="mt-3 text-muted">
          Set a budget and constraints first, then generate strategies.
        </p>
        <Button asChild className="mt-8">
          <Link to="/decide">Start a Decision</Link>
        </Button>
      </div>
    );
  }

  if (!result.ok) {
    return <InfeasibleView result={result} />;
  }

  const selected =
    result.strategies.find((s) => s.id === selectedId) ?? result.strategies[0]!;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <Hero result={result} selected={selected} />

      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted">
          Four strategies
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {result.strategies.map((s) => (
            <StrategyCard
              key={s.id}
              strategy={s}
              budget={result.input.budget}
              active={s.id === selected.id}
              onSelect={() => setSelectedId(s.id)}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">{result.paretoNote}</p>
      </section>

      <Breakdown key={selected.id} selected={selected} result={result} />
      <WhatIfPanel
        input={input}
        onApplied={(next) => {
          setWhatIf(next);
          if (next.after.ok) {
            replaceInput(next.after.input);
            setResult(next.after);
            setSelectedId(next.after.recommendedId);
          }
        }}
        whatIf={whatIf}
      />
      <CompareTable result={result} selectedId={selected.id} />
    </div>
  );
}

function Hero({
  result,
  selected,
}: {
  result: RecommendOk;
  selected: StrategyResult;
}) {
  const b = selected.bundle;
  return (
    <section className="rise rounded-xl bg-ink px-5 py-8 text-ink-fg sm:px-10 sm:py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-fg/50">
        Your best decision
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
        {selected.name}
      </h1>
      <p className="mt-3 max-w-xl text-ink-fg/70">{selected.tagline}</p>
      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Spent"
          value={`${formatMoney(b.cost)} / ${formatMoney(result.input.budget)}`}
        />
        <Stat label="Utility" value={`${Math.round(b.avgUtility)}/100`} />
        <Stat
          label="Goal coverage"
          value={`${Math.round(b.goalCoverage * 100)}%`}
        />
        <Stat label="Remaining" value={formatMoney(b.remaining)} />
      </dl>
      <BudgetBar bundle={b} budget={result.input.budget} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-ink-fg/45">
        {label}
      </dt>
      <dd className="mt-1 font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function BudgetBar({
  bundle,
  budget,
}: {
  bundle: StrategyResult["bundle"];
  budget: number;
}) {
  const tones = ["bg-ink-fg", "bg-ink-fg/75", "bg-ink-fg/55", "bg-ink-fg/35"];
  return (
    <div className="mt-8">
      <div className="flex h-2 overflow-hidden rounded-full bg-ink-fg/15">
        {bundle.products.map((p, i) => (
          <div
            key={p.id}
            className={tones[i % tones.length]}
            style={{ width: `${budget > 0 ? (p.price / budget) * 100 : 0}%` }}
            title={`${p.name} ${formatMoney(p.price)}`}
          />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-fg/65">
        {bundle.products.map((p, i) => (
          <li key={p.id} className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", tones[i % tones.length])} />
            {p.name}
            <span className="tabular-nums">{formatMoney(p.price)}</span>
          </li>
        ))}
        <li className="tabular-nums">
          {formatMoney(bundle.remaining)} unspent
        </li>
      </ul>
    </div>
  );
}

function StrategyCard({
  strategy,
  budget,
  active,
  onSelect,
}: {
  strategy: StrategyResult;
  budget: number;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = ICONS[strategy.id];
  const b = strategy.bundle;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-xl p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150",
        active ? "bg-primary text-primary-fg" : "bg-surface text-fg hover:shadow-[var(--shadow-border-hover)]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Icon className="size-4" />
        {strategy.paretoEfficient && (
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.14em]",
              active ? "text-primary-fg/70" : "text-muted",
            )}
          >
            Pareto
          </span>
        )}
      </div>
      <h3 className="mt-3 font-semibold">{strategy.name}</h3>
      <p
        className={cn(
          "mt-3 font-medium tabular-nums",
          active ? "text-primary-fg" : "text-fg",
        )}
      >
        {formatMoney(b.cost)}
        <span className={active ? "text-primary-fg/70" : "text-muted"}>
          {" "}
          / {formatMoney(budget)}
        </span>
      </p>
      <p className={cn("mt-1 text-sm", active ? "text-primary-fg/75" : "text-muted")}>
        {Math.round(b.avgUtility)} utility · {formatMoney(b.remaining)} left
      </p>
    </button>
  );
}

function Breakdown({
  selected,
  result,
}: {
  selected: StrategyResult;
  result: RecommendOk;
}) {
  const [explanation, setExplanation] = useState<string | null>(
    deterministicExplain(result, selected),
  );
  const [source, setSource] = useState<"deterministic" | "model">("deterministic");
  const [pending, setPending] = useState(false);
  const oc = selected.opportunityCost;

  const askModel = async () => {
    setPending(true);
    try {
      const res = await explainDecision({
        data: { result, strategyId: selected.id },
      });
      setExplanation(res.text);
      setSource(res.source);
    } catch {
      setExplanation(deterministicExplain(result, selected));
      setSource("deterministic");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mt-14 grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h2 className="font-display text-3xl tracking-tight">The kit</h2>
        <ul className="mt-5 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
          {selected.bundle.products.map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm capitalize text-muted">
                  {p.category} · {p.summary}
                </p>
              </div>
              <p className="shrink-0 tabular-nums font-medium">
                {formatMoney(p.price)}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {explanation}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={askModel}
          disabled={pending}
        >
          {pending
            ? "Writing…"
            : source === "model"
              ? "Regenerate explanation"
              : "Write a plainer explanation"}
        </Button>
      </div>

      <div className="lg:col-span-7 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gain-soft p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-gain">
              You gain
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-snug text-fg">
              {oc.youGain.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-gain" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-give-soft p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-give">
              You give up
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-snug text-fg">
              {oc.youGiveUp.length ? (
                oc.youGiveUp.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-give" />
                    {line}
                  </li>
                ))
              ) : (
                <li>Very little — this is already a restrained kit.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-ink p-5 text-ink-fg sm:p-7">
          <div className="flex items-center gap-2">
            <Split className="size-4 text-ink-fg/70" />
            <p className="text-xs uppercase tracking-[0.16em] text-ink-fg/50">
              Your opportunity cost
            </p>
          </div>
          <p className="mt-3 font-display text-2xl tracking-tight">
            {oc.extraSpentVsCheapest > 0
              ? `You spent an additional ${formatMoney(oc.extraSpentVsCheapest)} above a bare-minimum kit.`
              : "This kit is already the cheapest way to cover the requirements."}
          </p>
          <p className="mt-3 text-sm text-ink-fg/70">
            A minimum must-have kit would have cost{" "}
            {formatMoney(oc.cheapestMustHaveCost)}. That difference is not just
            money — it is the set of other kits you can no longer buy.
          </p>
          <ul className="mt-5 space-y-3">
            {oc.instead.map((alt) => (
              <li
                key={alt.label}
                className="flex items-start justify-between gap-4 border-t border-ink-fg/15 pt-3 text-sm"
              >
                <span>{alt.label}</span>
                <span className="shrink-0 tabular-nums text-ink-fg/60">
                  {alt.cost > 0 ? formatMoney(alt.cost) : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function WhatIfPanel({
  input,
  onApplied,
  whatIf,
}: {
  input: RecommendOk["input"];
  onApplied: (
    value: NonNullable<ReturnType<typeof useDecisionStore.getState>["whatIf"]>,
  ) => void;
  whatIf: ReturnType<typeof useDecisionStore.getState>["whatIf"];
}) {
  const [question, setQuestion] = useState("What if I had $200 more?");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (q: string) => {
    setPending(true);
    setError(null);
    try {
      const res = await applyWhatIf({ data: { input, question: q } });
      onApplied({ ...res, question: q });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not recalculate.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mt-16 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-8">
      <h2 className="font-display text-3xl tracking-tight">What if?</h2>
      <p className="mt-2 max-w-xl text-muted">
        Change a constraint in plain language. The optimizer — not the language
        model — recalculates the kit.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {WHAT_IF_PRESETS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setQuestion(q);
              void run(q);
            }}
            className="h-11 rounded-full bg-bg px-4 text-sm shadow-[var(--shadow-border)]"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-20 sm:min-h-11 sm:flex-1"
        />
        <Button
          type="button"
          onClick={() => void run(question)}
          disabled={pending || question.trim().length < 3}
          className="sm:self-start"
        >
          {pending ? "Recalculating…" : "Recalculate"}
          {!pending && <ArrowRight />}
        </Button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-give" role="alert">
          {error}
        </p>
      )}
      {whatIf && <WhatIfDiff whatIf={whatIf} />}
    </section>
  );
}

function WhatIfDiff({
  whatIf,
}: {
  whatIf: NonNullable<ReturnType<typeof useDecisionStore.getState>["whatIf"]>;
}) {
  const before = whatIf.before.ok
    ? whatIf.before.strategies.find(
        (s) => whatIf.before.ok && s.id === whatIf.before.recommendedId,
      )
    : null;
  const after = whatIf.after.ok
    ? whatIf.after.strategies.find(
        (s) => whatIf.after.ok && s.id === whatIf.after.recommendedId,
      )
    : null;

  return (
    <div className="mt-8">
      <p className="text-sm text-muted">
        Parsed as: {whatIf.patch.summary}{" "}
        <span className="text-subtle">({whatIf.parsedBy})</span>
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-bg p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Before</p>
          {before ? (
            <>
              <p className="mt-2 font-medium">{before.name}</p>
              <p className="text-sm tabular-nums text-muted">
                {formatMoney(before.bundle.cost)} · {formatMoney(before.bundle.remaining)} left
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {before.bundle.products.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm">No feasible kit.</p>
          )}
        </div>
        <div className="rounded-lg bg-bg p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">After</p>
          {whatIf.after.ok && after ? (
            <>
              <p className="mt-2 font-medium">{after.name}</p>
              <p className="text-sm tabular-nums text-muted">
                {formatMoney(after.bundle.cost)} · {formatMoney(after.bundle.remaining)} left
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {after.bundle.products.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <InfeasibleNote result={whatIf.after} />
          )}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          What changed
        </p>
        {whatIf.narrative ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {whatIf.narrative}
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {whatIf.changed.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function InfeasibleNote({
  result,
}: {
  result: RecommendOk | RecommendInfeasible | { ok: false; message: string };
}) {
  if (result.ok) return null;
  const extra =
    "minimumBudget" in result
      ? ` Minimum estimated budget: ${formatMoney(result.minimumBudget)}.`
      : "";
  return (
    <p className="mt-2 text-sm text-give">
      {result.message}
      {extra}
    </p>
  );
}

function CompareTable({
  result,
  selectedId,
}: {
  result: RecommendOk;
  selectedId: StrategyId;
}) {
  return (
    <section className="mt-16">
      <h2 className="font-display text-3xl tracking-tight">Compare</h2>
      <div className="mt-5 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted">
              <th className="px-4 py-3 font-medium">Strategy</th>
              <th className="px-4 py-3 font-medium">Spend</th>
              <th className="px-4 py-3 font-medium">Left</th>
              <th className="px-4 py-3 font-medium">Utility</th>
              <th className="px-4 py-3 font-medium">Goals</th>
              <th className="px-4 py-3 font-medium">Headline item</th>
            </tr>
          </thead>
          <tbody>
            {result.strategies.map((s) => {
              const head =
                s.bundle.products.find((p) => p.category === "laptop") ??
                s.bundle.products[0];
              return (
                <tr
                  key={s.id}
                  className={cn(
                    "border-b border-border last:border-0",
                    s.id === selectedId && "bg-gain-soft/60",
                  )}
                >
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoney(s.bundle.cost)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoney(s.bundle.remaining)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {Math.round(s.bundle.avgUtility)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {Math.round(s.bundle.goalCoverage * 100)}%
                  </td>
                  <td className="px-4 py-3">{head?.name ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InfeasibleView({
  result,
}: {
  result: Exclude<NonNullable<ReturnType<typeof useDecisionStore.getState>["result"]>, RecommendOk>;
}) {
  const extra =
    result.error === "infeasible"
      ? result
      : null;
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-tight">
        No feasible decision
      </h1>
      <p className="mt-4 text-muted">{result.message}</p>
      {extra && (
        <div className="mt-6 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-sm text-muted">Minimum estimated budget required</p>
          <p className="mt-1 font-display text-3xl tabular-nums">
            {formatMoney(extra.minimumBudget)}
          </p>
          {extra.additionalNeeded > 0 && (
            <p className="mt-2 text-sm text-muted">
              You need {formatMoney(extra.additionalNeeded)} more than the
              current budget.
            </p>
          )}
          {extra.cheapestMustHaves.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {extra.cheapestMustHaves.map((p) => (
                <li key={p.category} className="flex justify-between">
                  <span className="capitalize">{p.name}</span>
                  <span className="tabular-nums">{formatMoney(p.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <Button asChild className="mt-8">
        <Link to="/decide">Adjust the brief</Link>
      </Button>
    </div>
  );
}


