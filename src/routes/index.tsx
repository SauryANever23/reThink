import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Scale, Split, Timer } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Mark } from "@/components/mark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <AppHeader
        action={
          <Button asChild size="sm" variant="secondary">
            <Link to="/decide">Start a Decision</Link>
          </Button>
        }
      />

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
          <p className="rise text-sm font-medium tracking-wide text-muted">
            Decision support, not shopping
          </p>
          <h1 className="rise-2 mt-4 max-w-3xl font-display text-4xl leading-[1.1] tracking-tight text-fg sm:text-6xl">
            Don't just know what you can buy. Know what you're giving
            up.
          </h1>
          <p className="rise-3 mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Make better decisions with limited budgets by seeing the trade-offs
            behind every choice — what you gain, what you sacrifice, and what
            else that money could have become.
          </p>
          <div className="rise-4 mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/decide">
                Start a Decision
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/decide" search={{ demo: true }}>
                Try Demo
              </Link>
            </Button>
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-medium text-muted">A sample receipt</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                Every choice has a shadow.
              </h2>
              <p className="mt-4 max-w-md text-muted leading-relaxed">
                When you spend an extra $200 on a laptop, you don't just
                spend $200. You give up a monitor, headphones, and the option to
                keep the money. reThink makes that visible before you commit.
              </p>
            </div>

            <article className="rounded-xl bg-ink p-5 text-ink-fg shadow-[var(--shadow-border)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-fg/50">
                    Opportunity cost
                  </p>
                  <h3 className="mt-2 font-display text-2xl">Balanced kit</h3>
                </div>
                <Mark className="size-6 text-ink-fg/70" />
              </div>
              <p className="mt-4 font-mono text-sm tabular-nums text-ink-fg/70">
                $920 / $1,000 spent
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-fg/45">
                    You gain
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-snug">
                    <li>A laptop that covers programming and study</li>
                    <li>All mandatory requirements</li>
                    <li>$80 still unspent</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-fg/45">
                    You give up
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-snug text-ink-fg/80">
                    <li>A premium monitor</li>
                    <li>Higher-end headphones</li>
                    <li>$120 of additional savings</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 border-t border-ink-fg/15 pt-5">
                <p className="text-xs uppercase tracking-[0.14em] text-ink-fg/45">
                  That extra $200 could have been
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  A 24-inch monitor and solid headphones — or kept as cash.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            How a decision is made
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Step
              icon={<Split className="size-5" />}
              title="Set the constraints"
              body="Budget, goals, must-haves, wants, what you already own, and the weights you actually care about."
            />
            <Step
              icon={<Scale className="size-5" />}
              title="Optimize, then compare"
              body="A deterministic engine scores every feasible kit. You get four real strategies — not a single shopping list."
            />
            <Step
              icon={<Timer className="size-5" />}
              title="Ask what if"
              body="Change the budget, lock a product, or save more. The same engine recalculates. The model only explains."
            />
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="font-display text-3xl tracking-tight">
                What is the best decision — and what does it cost you?
              </h2>
              <p className="mt-2 max-w-lg text-muted">
                Two minutes with the demo is enough to see the method.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/decide" search={{ demo: true }}>
                Try the $1,000 demo
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-subtle sm:px-6">
          <span className="font-display text-base text-muted">reThink</span>
          <span>Every decision has an opportunity cost.</span>
        </div>
      </footer>
    </div>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="flex size-10 items-center justify-center rounded-lg bg-gain-soft text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
