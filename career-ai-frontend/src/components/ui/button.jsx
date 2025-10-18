import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

// Simple mapping to Bootstrap button classes
const variantClass = {
  default: "btn-primary",
  destructive: "btn-danger",
  outline: "btn-outline-secondary",
  secondary: "btn-secondary",
  ghost: "btn-link",
  link: "btn-link",
};

const sizeClass = {
  default: "",
  sm: "btn-sm",
  lg: "btn-lg",
  icon: "",
};

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  const classes = cn(
    "btn",
    variantClass[variant] || variantClass.default,
    sizeClass[size] || "",
    className
  );

  return <Comp data-slot="button" className={classes} {...props} />;
}

export { Button };
