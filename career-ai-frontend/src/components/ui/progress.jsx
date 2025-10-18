"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Progress({ className, value = 0, variant = "primary", ...props }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div data-slot="progress" className={cn("progress", className)} {...props}>
      <div
        className={cn("progress-bar", `bg-${variant}`)}
        role="progressbar"
        style={{ width: `${width}%` }}
        aria-valuenow={width}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
}

export { Progress };
