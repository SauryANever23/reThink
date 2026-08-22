import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Mark } from "./mark";

export function AppHeader({ action }: { action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-fg no-underline"
          aria-label="reThink home"
        >
          <Mark className="size-5 text-primary" />
          <span className="font-display text-xl tracking-tight">reThink</span>
        </Link>
        {action}
      </div>
    </header>
  );
}
