import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const variantClass = {
  default: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  destructive: "bg-danger text-white",
  outline: "bg-light text-dark border",
};

function Badge({ className, variant = "default", asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";
  const classes = cn(
    "badge",
    variantClass[variant] || variantClass.default,
    className
  );
  return <Comp data-slot="badge" className={classes} {...props} />;
}

export { Badge };
