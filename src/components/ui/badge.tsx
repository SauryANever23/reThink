import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "muted" | "ink" | "gain" | "give";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "muted" && "bg-surface-2 text-muted",
        tone === "ink" && "bg-fg text-bg",
        tone === "gain" && "bg-gain-soft text-gain",
        tone === "give" && "bg-give-soft text-give",
        className,
      )}
      {...props}
    />
  );
}
