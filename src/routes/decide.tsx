import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Wizard } from "@/components/wizard";
import { useDecisionStore } from "@/lib/store";

type Search = { demo?: boolean };

export const Route = createFileRoute("/decide")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    demo: s.demo === true || s.demo === "1" || s.demo === "true",
  }),
  component: DecidePage,
});

function DecidePage() {
  const { demo } = Route.useSearch();
  const hydrate = useDecisionStore((s) => s.hydrate);
  const loadDemo = useDecisionStore((s) => s.loadDemo);
  const reset = useDecisionStore((s) => s.reset);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    if (demo) loadDemo();
    setReady(true);
  }, [demo, hydrate, loadDemo]);

  if (!ready) {
    return <div className="min-h-dvh bg-bg" />;
  }

  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => reset()}>
              Reset
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link to="/decide" search={{ demo: true }}>
                Load demo
              </Link>
            </Button>
          </div>
        }
      />
      <Wizard startAtReview={Boolean(demo)} />
    </div>
  );
}
