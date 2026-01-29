import * as React from "react";
import { cn } from "../../lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";

  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "border-sky-100 bg-sky-50 text-sky-800",
    outline: "border-slate-300 text-slate-700",
    success: "border-emerald-100 bg-emerald-50 text-emerald-800",
    warning: "border-amber-100 bg-amber-50 text-amber-800",
  };

  return <span className={cn(base, variants[variant], className)} {...props} />;
}
