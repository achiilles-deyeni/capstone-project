import { clsx } from "clsx";

// Simple classnames merger for Bootstrap usage.
// We intentionally avoid tailwind-merge since we're migrating to Bootstrap.
export function cn(...inputs) {
  return clsx(inputs);
}
