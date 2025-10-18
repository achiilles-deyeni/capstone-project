import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div data-slot="card" className={cn("card", className)} {...props}>
      <div className="card-body">{children}</div>
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn("card-header", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h5
      data-slot="card-title"
      className={cn("card-title", className)}
      {...props}
    >
      {children}
    </h5>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn("card-text text-muted", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardAction({ className, children, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn("d-flex justify-content-end", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div data-slot="card-content" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("card-footer text-muted", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Named exports are provided inline above via `export function ...`.
// The block that re-exported the same identifiers was removed to avoid
// duplicate export conflicts with the bundler.
