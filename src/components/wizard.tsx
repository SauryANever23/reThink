import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, GOAL_PRESETS, PRIORITY_META } from "@/data/catalog";
import { generateRecommendation } from "@/lib/api";
import { useDecisionStore } from "@/lib/store";
import { cn, formatMoney } from "@/lib/utils";
import { normalizeWeights } from "@/engine/scoring.ts";
import type { PriorityKey } from "@/engine/types.ts";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const STEPS = [
  { id: "budget", label: "Budget" },
  { id: "goals", label: "Goals" },
  { id: "kit", label: "Kit" },
  { id: "priorities", label: "Priorities" },
  { id: "review", label: "Review" },
] as const;

type Role = "none" | "must" | "want" | "own";

export function Wizard({ startAtReview }: { startAtReview?: boolean }) {
  const navigate = useNavigate();
  const { input, patchInput, setResult, setWhatIf } = useDecisionStore();
  const [step, setStep] = useState(startAtReview ? 4 : 0);
  const [customGoal, setCustomGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const weights = useMemo(
    () => normalizeWeights(input.priorities),
    [input.priorities],
  );

  const roleOf = (id: string): Role => {
    if (input.mustHaves.includes(id)) return "must";
    if (input.wants.includes(id)) return "want";
    if (input.alreadyOwn.includes(id)) return "own";
    return "none";
  };

  const setRole = (id: string, role: Role) => {
    patchInput({
      mustHaves: input.mustHaves.filter((c) => c !== id),
      wants: input.wants.filter((c) => c !== id),
      alreadyOwn: input.alreadyOwn.filter((c) => c !== id),
      ...(role === "must" ? { mustHaves: [...input.mustHaves.filter((c) => c !== id), id] } : {}),
      ...(role === "want" ? { wants: [...input.wants.filter((c) => c !== id), id] } : {}),
      ...(role === "own"
        ? { alreadyOwn: [...input.alreadyOwn.filter((c) => c !== id), id] }
        : {}),
    });
  };

  const toggleGoal = (id: string) => {
    const has = input.goals.includes(id);
    patchInput({
      goals: has ? input.goals.filter((g) => g !== id) : [...input.goals, id],
    });
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <ol className="mb-10 flex gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex-1">
            <button
              type="button"
              onClick={() => setStep(i)}
              className="w-full text-left"
            >
              <span
                className={cn(
                  "block h-1 rounded-full",
                  i <= step ? "bg-primary" : "bg-surface-2",
                )}
              />
              <span
                className={cn(
                  "mt-2 hidden text-xs font-medium sm:block",
                  i === step ? "text-fg" : "text-subtle",
                )}
              >
                {s.label}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="rise">
          <h1 className="font-display text-4xl tracking-tight">
            How much can you spend?
          </h1>
          <p className="mt-3 max-w-lg text-muted">
            This is a hard ceiling. The engine will never recommend a kit above
            it.
          </p>
          <div className="mt-10">
            <Label htmlFor="budget">Budget (USD)</Label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                $
              </span>
              <Input
                id="budget"
                inputMode="numeric"
                className="pl-7 font-medium tabular-nums text-xl h-14"
                value={input.budget}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^\d]/g, ""));
                  patchInput({ budget: Number.isFinite(n) ? n : 0 });
                }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[500, 1000, 1500, 2000].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => patchInput({ budget: n })}
                  className={cn(
                    "h-11 rounded-full px-4 text-sm shadow-[var(--shadow-border)]",
                    input.budget === n ? "bg-primary text-primary-fg" : "bg-surface text-fg",
                  )}
                >
                  {formatMoney(n)}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="rise">
          <h1 className="font-display text-4xl tracking-tight">
            What is this for?
          </h1>
          <p className="mt-3 max-w-lg text-muted">
            Goals steer coverage. They do not force a category on their own.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {GOAL_PRESETS.map((g) => {
              const on = input.goals.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGoal(g.id)}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm shadow-[var(--shadow-border)]",
                    on ? "bg-primary text-primary-fg" : "bg-surface text-fg",
                  )}
                >
                  {on && <Check className="size-3.5" />}
                  {g.label}
                </button>
              );
            })}
            {input.goals
              .filter((g) => !GOAL_PRESETS.some((p) => p.id === g))
              .map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGoal(g)}
                  className="inline-flex h-11 items-center rounded-full bg-primary px-4 text-sm text-primary-fg"
                >
                  {g}
                </button>
              ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Input
              placeholder="Add a custom goal"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomGoal();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addCustomGoal}>
              Add
            </Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rise">
          <h1 className="font-display text-4xl tracking-tight">
            Must, want, already own
          </h1>
          <p className="mt-3 max-w-lg text-muted">
            Must-haves are constraints. Wants are optional. Owned categories are
            not recommended again.
          </p>
          <ul className="mt-8 divide-y divide-border">
            {categories.map((cat) => {
              const role = roleOf(cat.id);
              return (
                <li
                  key={cat.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{cat.label}</p>
                    <p className="text-sm text-muted">{cat.hint}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-1 rounded-lg bg-surface-2 p-1">
                    {(["none", "must", "want", "own"] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(cat.id, r)}
                        className={cn(
                          "h-10 rounded-md px-2 text-xs font-medium capitalize",
                          role === r
                            ? "bg-primary text-primary-fg"
                            : "text-muted",
                        )}
                      >
                        {r === "none" ? "Skip" : r}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {step === 3 && (
        <section className="rise">
          <h1 className="font-display text-4xl tracking-tight">
            What should win the trade-off?
          </h1>
          <p className="mt-3 max-w-lg text-muted">
            Weights are normalized internally. Zero means you do not care about
            that axis.
          </p>
          <ul className="mt-8 space-y-6">
            {PRIORITY_META.map((meta) => (
              <li key={meta.key}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-medium">{meta.label}</p>
                    <p className="text-sm text-muted">{meta.hint}</p>
                  </div>
                  <p className="tabular-nums text-sm text-muted">
                    {Math.round(weights[meta.key] * 100)}%
                  </p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={input.priorities[meta.key]}
                  aria-label={meta.label}
                  className="mt-1 w-full"
                  onChange={(e) =>
                    patchInput({
                      priorities: {
                        ...input.priorities,
                        [meta.key]: Number(e.target.value) as number,
                      },
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 4 && (
        <section className="rise">
          <h1 className="font-display text-4xl tracking-tight">
            Ready to see the trade-offs?
          </h1>
          <p className="mt-3 text-muted">
            Four strategies will be scored from this brief. Nothing is invented.
          </p>
          <dl className="mt-8 divide-y divide-border rounded-xl bg-surface px-5 shadow-[var(--shadow-border)]">
            <Row label="Budget" value={formatMoney(input.budget)} />
            <Row
              label="Goals"
              value={input.goals.length ? input.goals.join(", ") : "None"}
            />
            <Row
              label="Must have"
              value={input.mustHaves.length ? input.mustHaves.join(", ") : "None"}
            />
            <Row
              label="Want"
              value={input.wants.length ? input.wants.join(", ") : "None"}
            />
            <Row
              label="Already own"
              value={
                input.alreadyOwn.length ? input.alreadyOwn.join(", ") : "None"
              }
            />
            <Row
              label="Priorities"
              value={PRIORITY_META.map(
                (m) => `${m.label} ${Math.round(weights[m.key as PriorityKey] * 100)}%`,
              ).join(" · ")}
            />
          </dl>
          {error && (
            <p className="mt-4 text-sm text-give" role="alert">
              {error}
            </p>
          )}
        </section>
      )}

      <div className="mt-12 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft />
          Back
        </Button>
        {step < 4 ? (
          <Button
            type="button"
            onClick={() => canNext() && setStep((s) => s + 1)}
            disabled={!canNext()}
          >
            Continue
            <ArrowRight />
          </Button>
        ) : (
          <Button type="button" onClick={generate} disabled={pending}>
            {pending ? "Scoring kits…" : "Generate strategies"}
            {!pending && <ArrowRight />}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium capitalize sm:text-right">{value}</dd>
    </div>
  );
}
