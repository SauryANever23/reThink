import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ResultsView } from "@/components/results-view";
import { Button } from "@/components/ui/button";
import { useDecisionStore } from "@/lib/store";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
});

function ResultsPage() {
  const hydrate = useDecisionStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  if (!ready) {
    return <div className="min-h-dvh bg-bg" />;
  }

  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader
        action={
          <Button asChild size="sm" variant="secondary">
            <Link to="/decide">Edit brief</Link>
          </Button>
        }
      />
      <ResultsView />
    </div>
  );
}
